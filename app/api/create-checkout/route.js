import { stripe, PRICE_DIGITAL, PRICE_KIT } from '@/lib/stripe'
import { saveJson } from '@/lib/storage'

export async function POST(request) {
  try {
    const body = await request.json()
    const { product, config, customer, address, locale = 'es' } = body

    if (!product || !config || !customer?.email || !customer?.name) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    if (!['digital', 'kit'].includes(product)) {
      return Response.json({ error: 'Producto inválido' }, { status: 400 })
    }

    if (product === 'kit' && (!address?.line1 || !address?.suburb || !address?.state || !address?.postcode)) {
      return Response.json({ error: 'Dirección de envío incompleta' }, { status: 400 })
    }

    console.log('[DEBUG] Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 12))
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://maspronto.com'

    // Store map config + customer data in Vercel Blob
    const { url: configBlobUrl } = await saveJson(
      { config, customer, address: address || null, product },
      'configs'
    )

    // Stripe line items
    const isDigital = product === 'digital'
    const unitAmount = isDigital ? PRICE_DIGITAL : PRICE_KIT

    const lineItems = [
      {
        price_data: {
          currency: 'aud',
          unit_amount: unitAmount,
          product_data: {
            name: isDigital ? 'Pronto Path - Digital PDF' : 'Pronto Path - Physical Kit',
            description: isDigital
              ? 'Descarga instantánea · Imprimí en casa'
              : 'Gran póster impreso + hoja de calcomanías + PDF digital incluido · Envío en Australia 2–4 días',
            images: [`${siteUrl}/og-product.png`],
          },
        },
        quantity: 1,
      },
    ]

    const metadata = {
      product,
      locale,
      configBlobUrl,
      customerName: customer.name,
      customerEmail: customer.email,
    }

    // Shipping details in metadata for physical
    if (!isDigital && address) {
      metadata.shippingLine1 = address.line1
      metadata.shippingLine2 = address.line2 || ''
      metadata.shippingSuburb = address.suburb
      metadata.shippingState = address.state
      metadata.shippingPostcode = address.postcode
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'afterpay_clearpay'],
      line_items: lineItems,
      mode: 'payment',
      currency: 'aud',
      customer_email: customer.email,
      success_url: `${siteUrl}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${locale}/details`,
      metadata,
      payment_intent_data: {
        metadata,
      },
      // Collect shipping address via Stripe for physical orders
      ...(
        !isDigital && {
          shipping_address_collection: {
            allowed_countries: [
              'US', 'CA', 'GB', 'AU',
              // European Union (27)
              'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
              'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
              'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
            ],
          },
        }
      ),
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('create-checkout error:', error)
    return Response.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
