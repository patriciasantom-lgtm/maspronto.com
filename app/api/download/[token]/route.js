// Direct PDF download via Vercel Blob URL
// The "token" here is the PDF blob filename (UUID)
// We redirect to the Blob URL — the long random Blob URL acts as the security layer

export async function GET(request, { params }) {
  const { token } = await params

  if (!token || !/^[0-9a-f-]{36}/.test(token)) {
    return new Response('Invalid token', { status: 400 })
  }

  // The PDF URL was emailed directly as the Vercel Blob URL
  // This endpoint exists as a fallback / custom branding URL
  // In production, emails link directly to Vercel Blob URLs

  return Response.json({
    message: 'El enlace de descarga se encuentra en el email que recibiste. Si no lo encuentras, contacta a hola@maspronto.com',
  }, { status: 404 })
}
