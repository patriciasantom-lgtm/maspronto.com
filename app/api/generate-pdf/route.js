import { generateMapPdfFromConfig } from '@/lib/generateMapPdf'
import { savePdf, fetchJson } from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { configBlobUrl, theme, character, title, subtitle, font } = body

    let config
    if (configBlobUrl) {
      const data = await fetchJson(configBlobUrl)
      config = data.config ?? data
    } else {
      config = { theme, character, title, subtitle, font }
    }

    if (!config?.theme || !config?.character) {
      return Response.json({ error: 'Missing theme or character' }, { status: 400 })
    }

    const pdfBuffer = await generateMapPdfFromConfig(config)
    const orderId   = uuidv4()
    const pdfUrl    = await savePdf(pdfBuffer, `map-${orderId}.pdf`)

    return Response.json({ url: pdfUrl })
  } catch (err) {
    console.error('generate-pdf error:', err)
    return Response.json({ error: err.message || 'PDF generation failed' }, { status: 500 })
  }
}
