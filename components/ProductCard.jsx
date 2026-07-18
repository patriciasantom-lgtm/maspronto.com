'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { REGIONS, DEFAULT_REGION, fmt, getGeoRegion } from '@/lib/pricing'

export default function ProductCard({ type, selected, onSelect }) {
  const t = useTranslations('products')
  const isDigital = type === 'digital'
  const [region, setRegion] = useState(DEFAULT_REGION)

  useEffect(() => {
    const stored = localStorage.getItem('prontoRegion')
    if (stored && REGIONS[stored]) {
      setRegion(stored)
    } else {
      const geo = getGeoRegion()
      if (geo) setRegion(geo)
    }
  }, [])

  const r = REGIONS[region]
  const price = isDigital ? r.digitalPrice : r.kitTotalPrice
  const priceLabel = `${fmt(price, r.symbol)} ${r.currency.toUpperCase()}`

  return (
    <button
      onClick={() => onSelect(type)}
      className={`relative w-full text-left rounded-[20px] transition-all duration-200 cursor-pointer overflow-hidden ${
        selected
          ? 'border-2 border-ink shadow-2xl shadow-ink/10 scale-[1.02]'
          : 'border border-ink/10 bg-white hover:border-ink/30 hover:shadow-md'
      }`}
      style={{ background: 'white' }}
    >
      {/* Card header image area */}
      <div
        className={`px-6 py-5 ${
          isDigital ? 'bg-ink text-mint' : 'bg-lemon text-ink'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block font-dm-sans-bold text-xs tracking-widest mb-2 px-2 py-0.5 rounded-full ${
              isDigital ? 'bg-mint/20 text-mint' : 'bg-ink/10 text-ink'
            }`}>
              {isDigital ? t('digital_badge') : t('kit_badge')}
            </span>
            <h3 className="font-fraunces text-2xl leading-none">
              {isDigital ? t('digital_name') : t('kit_name')}
            </h3>
          </div>
          {!isDigital && (
            <span className="font-dm-sans-bold text-xs bg-ink text-lemon px-2 py-1 rounded-full whitespace-nowrap">
              {t('kit_popular')}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-3">
          <p className="font-fraunces text-4xl leading-none">{priceLabel}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-6">
        <p className="font-dm-sans text-sm text-ink/70 mb-4">
          {isDigital ? t('digital_desc') : t('kit_desc')}
        </p>

        {/* Includes (kit only) */}
        {!isDigital && (
          <div className="mb-4">
            <p className="font-dm-sans-bold text-xs text-ink/50 mb-2">{t('kit_includes_title')}</p>
            <ul className="space-y-1.5">
              {[0, 1, 2, 3].map(i => (
                <li key={i} className="flex items-start gap-2 font-dm-sans text-xs text-ink/70">
                  <span className="text-mint mt-0.5">✓</span>
                  {t(`kit_includes_${i}`)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className={`w-full py-3 px-4 rounded-[40px] text-center font-dm-sans-bold text-sm transition-all ${
          selected
            ? isDigital ? 'bg-ink text-lemon' : 'bg-lemon text-ink'
            : 'bg-ink/5 text-ink/50'
        }`}>
          {selected ? t('selected') : (isDigital ? t('digital_cta') : t('kit_cta'))}
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-ink flex items-center justify-center text-lemon text-xs font-bold">
          ✓
        </div>
      )}
    </button>
  )
}
