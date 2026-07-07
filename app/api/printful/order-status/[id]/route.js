import { getPrintfulOrder } from '@/lib/printful'

// Printful → frontend status mapping
const PRINTFUL_STATUS = {
  draft: 'created',
  pending: 'created',
  onhold: 'created',
  inprocess: 'passed',
  partial: 'passed',
  fulfilled: 'in_transit',
  failed: 'canceled',
  canceled: 'canceled',
  returned: 'canceled',
}

export async function GET(request, { params }) {
  const { id } = await params

  try {
    const response = await getPrintfulOrder(id)
    const order = response.data ?? response

    const status = PRINTFUL_STATUS[order.status] ?? 'created'
    const shipment = order.shipments?.[0]

    return Response.json({
      status,
      trackingNumber: shipment?.tracking_number ?? null,
      carrier: shipment?.carrier ?? null,
      customer: order.recipient?.email ?? null,
    })
  } catch (err) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }
}
