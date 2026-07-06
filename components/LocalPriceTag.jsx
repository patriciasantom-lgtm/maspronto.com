'use client'

import { useLocalPrice, formatLocal } from '@/lib/useLocalPrice'

export default function LocalPriceTag({ audCents, className = '' }) {
  const local = useLocalPrice()
  const label = formatLocal(audCents, local)
  if (!label) return null

  return (
    <p className={`font-dm-sans text-xs text-ink/40 mt-0.5 ${className}`}>
      {label}
      <span className="ml-1">· Approx. Charged in AUD.</span>
    </p>
  )
}
