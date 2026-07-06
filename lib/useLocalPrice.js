'use client'

import { useState, useEffect } from 'react'

const SUPPORTED = ['USD', 'EUR', 'GBP', 'NZD', 'CAD']
const SYMBOLS   = { USD: 'US$', EUR: '€', GBP: '£', NZD: 'NZ$', CAD: 'CA$' }
const CACHE_KEY = 'pronto_fx'
const CACHE_TTL = 24 * 60 * 60 * 1000

export function useLocalPrice() {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { ts, currency, rate } = JSON.parse(cached)
          if (Date.now() - ts < CACHE_TTL && SUPPORTED.includes(currency)) {
            setData({ currency, symbol: SYMBOLS[currency], rate })
            return
          }
        }

        const geo = await fetch('https://ipapi.co/json/').then(r => r.json())
        const currency = geo?.currency
        if (!SUPPORTED.includes(currency)) return

        const fx = await fetch('https://open.er-api.com/v6/latest/AUD').then(r => r.json())
        const rate = fx?.rates?.[currency]
        if (!rate) return

        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), currency, rate }))
        setData({ currency, symbol: SYMBOLS[currency], rate })
      } catch (_) {
        // Fail silently — caller shows AUD only
      }
    }
    load()
  }, [])

  return data
}

export function formatLocal(audCents, localData) {
  if (!localData) return null
  const amount = (audCents / 100) * localData.rate
  return `~${localData.symbol}${amount.toFixed(2)} ${localData.currency}`
}
