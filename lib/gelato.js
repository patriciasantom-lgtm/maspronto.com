const GELATO_BASE = 'https://order.gelatoapis.com'

async function gelatoFetch(path, options = {}) {
  const res = await fetch(`${GELATO_BASE}${path}`, {
    ...options,
    headers: {
      'X-API-KEY': process.env.GELATO_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gelato API error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function createGelatoOrder({ orderId, customer, address, mapPdfUrl, stickerPdfUrl, theme }) {
  const items = [
    {
      itemReferenceId: `map-${orderId}`,
      productUid: process.env.GELATO_POSTER_UID,
      quantity: 1,
      files: [{ url: mapPdfUrl, type: 'default' }],
      title: 'Pronto Path — Large Poster', // TODO (Printful migration): replace GELATO_POSTER_UID and this call with Printful product + API
    },
    {
      itemReferenceId: `stickers-${orderId}`,
      productUid: process.env.GELATO_STICKER_UID, // TODO (Printful migration): replace GELATO_STICKER_UID with Printful product
      quantity: 1,
      files: [{ url: stickerPdfUrl, type: 'default' }],
      title: 'Pronto Path — Sticker Sheet',
    },
  ]

  const nameParts = customer.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  const payload = {
    orderReferenceId: orderId,
    customerReferenceId: customer.email,
    currency: 'AUD',
    items,
    shippingAddress: {
      firstName,
      lastName,
      email: customer.email,
      addressLine1: address.line1,
      addressLine2: address.line2 || '',
      city: address.suburb,
      postCode: address.postcode,
      state: address.state,
      country: 'AU',
    },
  }

  return gelatoFetch('/api/v4/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getGelatoOrder(gelatoOrderId) {
  return gelatoFetch(`/api/v4/orders/${gelatoOrderId}`)
}
