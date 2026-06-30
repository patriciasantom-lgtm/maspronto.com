// TODO (Printful migration): This endpoint is currently named gelato-webhook but
// already handles Printful-style events (order_status_updated, shipment_dispatched).
// When Printful credentials are ready:
//   1. Register this URL in Printful dashboard → Store Settings → Webhooks
//   2. Verify the Printful webhook signature (add X-Printful-Webhook-Secret header check)
//   3. Rename route folder from /api/gelato-webhook to /api/printful-webhook
//   4. Update field names to match Printful's actual payload shape
import { sendTrackingUpdateEmail } from '@/lib/email'

// Printful sends webhook updates for order status changes
// Configure this URL in Printful dashboard under Webhook Settings

export async function POST(request) {
  try {
    const body = await request.json()
    const { event, order } = body

    console.log('Printful webhook event:', event, order?.id)

    if (!event || !order) {
      return new Response('Invalid payload', { status: 400 })
    }

    // Printful event types: order_status_updated, shipment_dispatched, etc.
    if (event === 'order_status_updated' || event === 'shipment_dispatched') {
      const trackingInfo = order.shipment?.trackingNumber
      const carrier = order.shipment?.carrierName

      if (trackingInfo && order.recipientEmail) {
        // Extract orderId from our orderReferenceId
        const orderId = order.orderReferenceId

        await sendTrackingUpdateEmail({
          to: order.recipientEmail,
          name: order.recipientName || 'Cliente',
          orderId,
          trackingNumber: trackingInfo,
          carrier: carrier || 'Courrier',
        })

        console.log(`Tracking email sent for order ${orderId}`)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Printful webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
