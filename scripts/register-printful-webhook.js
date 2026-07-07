const { readFileSync } = require('fs')
const { resolve } = require('path')

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // .env.local not found — rely on existing process.env
  }
}

loadEnv()

const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_TOKEN
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID
const WEBHOOK_URL = 'https://maspronto.com/api/printful/webhook'
const EVENTS = ['shipment_sent', 'order_updated']

if (!PRINTFUL_API_TOKEN || PRINTFUL_API_TOKEN === 'tu_token') {
  console.error('Error: PRINTFUL_API_TOKEN no está configurado en .env.local')
  process.exit(1)
}
if (!PRINTFUL_STORE_ID) {
  console.error('Error: PRINTFUL_STORE_ID no está configurado en .env.local')
  process.exit(1)
}

async function registerWebhook() {
  console.log('Registrando webhook en Printful...')
  console.log(`  URL:     ${WEBHOOK_URL}`)
  console.log(`  Eventos: ${EVENTS.join(', ')}`)
  console.log(`  Store:   ${PRINTFUL_STORE_ID}`)
  console.log()

  const res = await fetch('https://api.printful.com/v2/webhooks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PRINTFUL_API_TOKEN}`,
      'X-PF-Store-Id': PRINTFUL_STORE_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      default_url: WEBHOOK_URL,
      events: EVENTS.map(type => ({ type })),
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Error de Printful API:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  const webhook = data.data ?? data
  const registeredEvents = (webhook.events ?? []).map(e => e.type).join(', ')
  console.log('Webhook registrado exitosamente:')
  console.log(`  URL:     ${webhook.default_url}`)
  console.log(`  Eventos: ${registeredEvents || EVENTS.join(', ')}`)
  if (webhook.secret) {
    console.log()
    console.log('Secreto del webhook (guardalo en PRINTFUL_WEBHOOK_SECRET):')
    console.log(`  ${webhook.secret}`)
  }
}

registerWebhook()
