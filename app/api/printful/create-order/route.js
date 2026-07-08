import { createPrintfulOrder } from '@/lib/printful'

export async function POST(request) {
  try {
    const { orderId, customer, address, mapFileUrl, theme } = await request.json()

    if (!orderId || !customer?.name || !customer?.email || !address || !mapFileUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const response = await createPrintfulOrder({ orderId, customer, address, mapFileUrl, theme })
    const order = response.data ?? response

    return Response.json({
      success: true,
      printfulId: order.id,
      externalId: orderId,
      status: order.status,
    })
  } catch (err) {
    console.error('Printful create-order error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
