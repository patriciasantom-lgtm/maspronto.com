const PRINTFUL_BASE = 'https://api.printful.com/v2'

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
  const response = await printfulFetch('/files', {
    method: 'POST',
    body: JSON.stringify({ url: fileUrl, type: 'default', filename }),
  })
  return response.data?.id ?? response.id
}

export async function createPrintfulOrder({ orderId, customer, address, mapFileUrl }) {
  const fileId = await uploadPrintFile(mapFileUrl, `map-${orderId}.pdf`)

  const nameParts = customer.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  const payload = {
    external_id: orderId,
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
    items: [
      {
        variant_id: process.env.PRINTFUL_VARIANT_ID,
        quantity: 1,
        files: [{ id: fileId }],
      },
    ],
  }

  return printfulFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Queries by external_id (our UUID) using Printful's @ prefix
export async function getPrintfulOrder(externalId) {
  return printfulFetch(`/orders/@${externalId}`)
}
