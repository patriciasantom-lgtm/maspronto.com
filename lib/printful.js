const PRINTFUL_BASE = 'https://api.printful.com'

// Kiss-Cut Sticker Sheet variant IDs by theme (sync product 445389671)
const STICKER_VARIANTS = {
  'space':          '5385594162',
  'new_baby':       '5385594163',
  'school':         '5385594164',
  'holiday_beach':  '5385594165',
  'new_home':       '5385594167',
  'happy_birthday': '5385594168',
  'christmas':      '5385594169',
  'no_theme':       '5385594174',
}

function toExternalId(orderId) {
  return orderId.replace(/-/g, '')
}

async function printfulFetch(path, options = {}) {
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
      'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Printful API error ${res.status}: ${text}`)
  }
  return res.json()
}

async function uploadPrintFile(fileUrl, filename = 'print-file.png') {
  console.log('Uploading to Printful, source URL:', JSON.stringify(fileUrl))
  const response = await printfulFetch('/files', {
    method: 'POST',
    body: JSON.stringify({ url: fileUrl, filename }),
  })
  return response.result?.id ?? response.data?.id ?? response.id
}

export async function createPrintfulOrder({ orderId, customer, address, mapFileUrl, theme }) {
  const fileId = await uploadPrintFile(mapFileUrl, `map-${orderId}.png`)

  const nameParts = customer.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  const items = [
    {
      sync_variant_id: Number(process.env.PRINTFUL_VARIANT_ID),
      quantity: 1,
      files: [{ id: fileId }],
    },
  ]

  const stickerVariantId = STICKER_VARIANTS[theme]
  if (stickerVariantId) {
    items.push({ sync_variant_id: Number(stickerVariantId), quantity: 1 })
  }

  const payload = {
    external_id: toExternalId(orderId),
    shipping: 'STANDARD',
    recipient: {
      name: `${firstName} ${lastName}`,
      email: customer.email,
      address1: address.line1,
      address2: address.line2 || '',
      city: address.suburb,
      state_code: address.state,
      country_code: 'AU',
      zip: address.postcode,
    },
    items,
  }

  return printfulFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Queries by external_id (our UUID) using Printful's @ prefix
export async function getPrintfulOrder(externalId) {
  return printfulFetch(`/orders/@${toExternalId(externalId)}`)
}
