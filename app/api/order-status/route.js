// TODO (Printful migration): Replace getGelatoOrder with Printful order status API.
// Once Printful credentials are set up, update this endpoint to call Printful's
// GET /orders/{id} endpoint and map their status fields to the gelatoStatus shape
// used by the orders page. Keep the response shape { gelatoStatus, trackingNumber,
// carrier, customer } so the frontend doesn't need changes at migration time.
import { getGelatoOrder } from '@/lib/gelato'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Missing order ID' }, { status: 400 })
  }

  try {
    // TODO (Printful migration): swap getGelatoOrder for Printful equivalent
    const order = await getGelatoOrder(id)

    return Response.json({
      gelatoStatus: order.status,
      trackingNumber: order.shipment?.trackingNumber || null,
      carrier: order.shipment?.carrierName || null,
      customer: order.shippingAddress?.email || null,
    })
  } catch (err) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }
}
