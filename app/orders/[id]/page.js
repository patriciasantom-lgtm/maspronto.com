import { redirect } from 'next/navigation'
export default async function OldOrderPage({ params }) {
  const { id } = await params
  redirect(`/es/orders/${id}`)
}
