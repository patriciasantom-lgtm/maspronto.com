import { stripe } from '@/lib/stripe'
import { saveJson } from '@/lib/storage'
import { REGIONS, DEFAULT_REGION, DIGITAL_PRICE } from '@/lib/pricing'

export async function POST(request) {
  try {
    const body = await request.json()
    const { product, config, customer, address, locale = 'es', region: regionKey = DEFAULT_REGION, promoCode } = body

    if (!product || !config || !customer?.email || !customer?.name) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    if (!['digital', 'kit'].includes(product)) {
      return Response.json({ error: 'Producto inválido' }, { status: 400 })
    }

    if (config.title && config.title.length > 24) {
      return Response.json({ error: 'El título supera el límite de 24 caracteres' }, { status: 400 })
    }
    if (config.subtitle && config.subtitle.length > 24) {
      return Response.json({ error: 'El subtítulo supera el límite de 24 caracteres' }, { status: 400 })
    }

    const r = REGIONS[regionKey] ?? REGIONS[DEFAULT_REGION]
    const isDigital = product === 'digital'

    console.log('[DEBUG] Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 12))
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://maspronto.com'

    const { url: configBlobUrl } = await saveJson(
      { config, customer, address: address || null, product },
      'configs'
    )

    // Line item amount:
    // - Digital: flat DIGITAL_PRICE, same for every buyer worldwide (no regional pricing)
    // - Kit: kitProductPrice only (shipping added via shipping_options) — dormant, kept for reference
    const unitAmount = isDigital ? DIGITAL_PRICE.amount : r.kitProductPrice
    const unitCurrency = isDigital ? DIGITAL_PRICE.currency : r.currency

    const lineItems = [
      {
        price_data: {
          currency: unitCurrency,
          unit_amount: unitAmount,
          product_data: {
            name: isDigital ? 'Pronto Path - Digital PDF' : 'Pronto Path - Physical Kit',
            description: isDigital
              ? 'Instant download'
              : 'Large printed poster + sticker sheet + digital PDF included',
            images: [`${siteUrl}/og-product.png`],
          },
        },
        quantity: 1,
      },
    ]

    const metadata = {
      product,
      locale,
      region: regionKey,
      configBlobUrl,
      customerName: customer.name,
      customerEmail: customer.email,
    }

    // Discount codes are validated here (not via Stripe's built-in checkout
    // field) so a code can be restricted to a specific theme — e.g. a
    // giveaway code only valid for the Christmas path. Restriction is read
    // from the promotion code's `restrict_theme` metadata in Stripe.
    let discounts
    if (promoCode) {
      const isEn = locale === 'en'
      const matches = await stripe.promotionCodes.list({
        code: promoCode.trim().toUpperCase(),
        active: true,
        limit: 1,
      })
      const promo = matches.data[0]

      if (!promo) {
        return Response.json({
          error: isEn ? 'Invalid or expired discount code' : 'Código de descuento inválido o vencido',
        }, { status: 400 })
      }

      const restrictTheme = promo.metadata?.restrict_theme
      if (restrictTheme && config.theme !== restrictTheme) {
        return Response.json({
          error: isEn
            ? 'This code is only valid for the Christmas path'
            : 'Este código es válido solo para el Camino de Navidad',
        }, { status: 400 })
      }

      discounts = [{ promotion_code: promo.id }]
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      currency: unitCurrency,
      ...(discounts ? { discounts } : {}),
      customer_email: customer.email,
      success_url: `${siteUrl}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${locale}/details`,
      metadata,
      payment_intent_data: { metadata },
      // Kit: Stripe collects shipping address and shows shipping fee for all regions
      ...(!isDigital && {
        shipping_address_collection: {
          allowed_countries: r.allowedCountries,
        },
        shipping_options: [{
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: r.kitShippingPrice, currency: r.currency },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 4 },
              maximum: { unit: 'business_day', value: 8 },
            },
          },
        }],
      }),
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('create-checkout error:', error)
    return Response.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
