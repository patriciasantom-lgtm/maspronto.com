import { stripe } from '@/lib/stripe'
import { fetchJson, savePdf } from '@/lib/storage'
import { generateMapPdfFromConfig } from '@/lib/generateMapPdf'
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

  // Physical Kit: send PDF digital immediately, then create print order
  await emailFn({ to: customerEmail, name: customerName, downloadUrl: mapFileUrl })
  console.log(`Physical kit PDF sent to ${customerEmail}`)

  const shippingAddress = address || {
    line1: session.shipping_details?.address?.line1 || '',
    line2: session.shipping_details?.address?.line2 || '',
    suburb: session.shipping_details?.address?.city || '',
    state: session.shipping_details?.address?.state || '',
    postcode: session.shipping_details?.address?.postal_code || '',
  }

  const printfulOrder = await createPrintfulOrder({
    orderId,
    customer: { name: customerName, email: customerEmail },
    address: shippingAddress,
    mapFileUrl,
  })

  const orderData = printfulOrder.data ?? printfulOrder
  console.log(`Printful order created: ${orderData.id} (external: ${orderId})`)

  await sendPhysicalOrderEmail({
    to: customerEmail,
    name: customerName,
    orderId,
    locale,
  })

  console.log(`Physical order ${orderId} fulfilled`)
}
