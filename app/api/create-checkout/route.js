import { stripe } from '@/lib/stripe'
import { saveJson } from '@/lib/storage'
import { REGIONS, DEFAULT_REGION } from '@/lib/pricing'

export async function POST(request) {
  try {
    const body = await request.json()
    const { product, config, customer, address, locale = 'es', region: regionKey = DEFAULT_REGION } = body

    if (!product || !config || !customer?.email || !customer?.name) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    if (!['digital', 'kit'].includes(product)) {
      return Response.json({ error: 'Producto inválido' }, { status: 400 })
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
    // - Digital: digitalPrice for the selected region
    // - Kit: kitProductPrice only (shipping added via shipping_options)
    const unitAmount = isDigital ? r.digitalPrice : r.kitProductPrice

    const lineItems = [
      {
        price_data: {
          currency: r.currency,
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      currency: r.currency,
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
