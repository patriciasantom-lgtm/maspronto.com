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
    const isAuKit = !isDigital && regionKey === 'AU'

    // Address required only for AU kit (collected in our pre-Stripe form)
    if (isAuKit && (!address?.line1 || !address?.suburb || !address?.state || !address?.postcode)) {
      return Response.json({ error: 'Dirección de envío incompleta' }, { status: 400 })
    }

    console.log('[DEBUG] Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 12))
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://maspronto.com'

    const { url: configBlobUrl } = await saveJson(
      { config, customer, address: address || null, product },
      'configs'
    )

    // Line item amount:
    // - Digital: digitalPrice for the selected region
    // - AU kit: kitTotalPrice (single amount, no shipping split)
    // - Other kit: kitProductPrice only (shipping added via shipping_options)
    const unitAmount = isDigital
      ? r.digitalPrice
      : isAuKit
        ? r.kitTotalPrice
        : r.kitProductPrice

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

    if (isAuKit && address) {
      metadata.shippingLine1 = address.line1
      metadata.shippingLine2 = address.line2 || ''
      metadata.shippingSuburb = address.suburb
      metadata.shippingState = address.state
      metadata.shippingPostcode = address.postcode
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
      // Non-AU kit: Stripe collects shipping address and shows shipping fee
      ...(!isDigital && !isAuKit && {
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
              maximum: { unit: 'business_day', value: 7 },
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
