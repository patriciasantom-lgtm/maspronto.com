import crypto from 'crypto'
import { sendTrackingUpdateEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const rawBody = await request.text()

    // Verify Printful webhook signature when secret is configured
    const signature = request.headers.get('x-printful-signature')
    if (signature && process.env.PRINTFUL_WEBHOOK_SECRET) {
      const expected = crypto
        .createHmac('sha256', process.env.PRINTFUL_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex')
      if (signature !== expected) {
        console.warn('Printful webhook: invalid signature')
        return new Response('Invalid signature', { status: 401 })
      }
    }

    const { type, data } = JSON.parse(rawBody)
    console.log('Printful webhook event:', type)

    if (!type || !data) {
      return new Response('Invalid payload', { status: 400 })
    }

    if (type === 'shipment_sent') {
      const { order, shipment } = data
      const trackingNumber = shipment?.tracking_number
      const carrier = shipment?.carrier

      if (trackingNumber && order?.recipient?.email) {
        await sendTrackingUpdateEmail({
          to: order.recipient.email,
          name: order.recipient.name || 'Cliente',
          orderId: order.external_id,
          trackingNumber,
          carrier: carrier || 'Courier',
        })
        console.log(`Tracking email sent for order ${order.external_id}`)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Printful webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
