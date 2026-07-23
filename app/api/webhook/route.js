import { stripe } from '@/lib/stripe'
import { fetchJson, savePdf, savePng } from '@/lib/storage'
import { generateMapPdfFromConfig, generateMapPngFromConfig } from '@/lib/generateMapPdf'
import { createPrintfulOrder } from '@/lib/printful'
import { sendDigitalDownloadEmail, sendDigitalDownloadEmailEn, sendPhysicalOrderEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

// Raw body required for Stripe signature verification
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Only process paid sessions
    if (session.payment_status !== 'paid') {
      return new Response('Not paid yet', { status: 200 })
    }

    try {
      await fulfillOrder(session)
    } catch (err) {
      console.error('Fulfillment error:', err)
      // Return 200 so Stripe doesn't retry — log the error for manual intervention
      return new Response('Fulfillment error logged', { status: 200 })
    }
  }

  return new Response('OK', { status: 200 })
}

async function fulfillOrder(session) {
  const { product, configBlobUrl, customerName, customerEmail, locale = 'es' } = session.metadata
  const orderId = uuidv4()

  // Fetch config from Blob
  const { config, address } = await fetchJson(configBlobUrl)

  // Generate map PDF using sharp + pdf-lib
  console.log(`Generating map PDF for order ${orderId}...`)
  const mapPdfBuffer = await generateMapPdfFromConfig(config)
  const mapFileUrl = await savePdf(mapPdfBuffer, `map-${orderId}.pdf`)

  const emailFn = locale === 'en' ? sendDigitalDownloadEmailEn : sendDigitalDownloadEmail

  if (product === 'digital') {
    await emailFn({ to: customerEmail, name: customerName, downloadUrl: mapFileUrl })
    console.log(`Digital order ${orderId} fulfilled — email sent to ${customerEmail}`)
    return
  }

  // Physical Kit: send PDF digital immediately, then branch on country
  await emailFn({ to: customerEmail, name: customerName, downloadUrl: mapFileUrl })
  console.log(`Physical kit PDF sent to ${customerEmail}`)

  // Stripe API 2026-06-24.dahlia moved shipping address to collected_information.shipping_details
  const stripeShipping = session.collected_information?.shipping_details ?? session.shipping_details
  if (!stripeShipping?.address?.country && product === 'kit') {
    console.warn(`[fulfillOrder] No Stripe shipping country for session ${session.id} — assuming AU. collected_information: ${JSON.stringify(session.collected_information)}`)
  }
  const country = stripeShipping?.address?.country || 'AU'

  const shippingAddress = address || {
    line1: stripeShipping?.address?.line1 || '',
    line2: stripeShipping?.address?.line2 || '',
    suburb: stripeShipping?.address?.city || '',
    state: stripeShipping?.address?.state || '',
    postcode: stripeShipping?.address?.postal_code || '',
  }

  // All regions: dropship via Printful
  const printPngBuffer = await generateMapPngFromConfig(config)
  const printFileUrl = await savePng(printPngBuffer, `map-${orderId}.png`)

  const printfulOrder = await createPrintfulOrder({
    orderId,
    customer: { name: customerName, email: customerEmail },
    address: shippingAddress,
    mapFileUrl: printFileUrl,
    theme: config.theme,
    country_code: country,
  })

  const orderData = printfulOrder.data ?? printfulOrder
  console.log(`Printful order created: ${orderData.id} (external: ${orderId}, country: ${country})`)

  await sendPhysicalOrderEmail({ to: customerEmail, name: customerName, orderId, locale })
  console.log(`Physical order ${orderId} fulfilled (${country})`)
}
