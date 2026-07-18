'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { REGIONS, DEFAULT_REGION, REGION_ORDER, fmt, getGeoRegion } from '@/lib/pricing'

export default function PricingSection() {
  const t = useTranslations('home')
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

  function selectRegion(key) {
    setRegion(key)
    localStorage.setItem('prontoRegion', key)
  }

  const r = REGIONS[region]

  return (
    <section id="pricing" className="bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-3">
            {t('pricing_eyebrow')}
          </p>
          <h2 className="font-fraunces text-4xl sm:text-5xl text-ink mb-3">{t('pricing_h2')}</h2>
          <p className="font-dm-sans text-ink/60">{t('pricing_subtitle')}</p>
        </div>

        {/* Region selector */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-10">
          <span className="font-dm-sans text-sm text-ink/50">{t('pricing_region_label')}</span>
          {REGION_ORDER.map(key => (
            <button
              key={key}
              onClick={() => selectRegion(key)}
              className={`font-dm-sans-bold text-xs px-4 py-2 rounded-full border transition-colors ${
                region === key
                  ? 'bg-ink text-mint border-ink'
                  : 'bg-white text-ink/60 border-ink/20 hover:border-ink/40'
              }`}
            >
              {REGIONS[key].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

          {/* Digital */}
          <div className="rounded-2xl border border-ink/10 p-8 flex flex-col">
            <span className="inline-block font-dm-sans-bold text-xs text-ink/50 bg-ink/5 px-3 py-1 rounded-full mb-6 self-start">
              {t('pricing_digital_badge')}
            </span>
            <p className="font-fraunces text-4xl text-ink mb-4">
              {fmt(r.digitalPrice, r.symbol)}
              <span className="font-dm-sans text-base text-ink/40 ml-1">{r.currency.toUpperCase()}</span>
            </p>
            <h3 className="font-dm-sans-bold text-lg text-ink mb-2">{t('pricing_digital_title')}</h3>
            <p className="font-dm-sans text-sm text-ink/60 mb-6">{t('pricing_digital_desc')}</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {['pricing_digital_f1', 'pricing_digital_f2', 'pricing_digital_f3'].map(k => (
                <li key={k} className="flex items-center gap-2 font-dm-sans text-sm text-ink/80">
                  <span className="text-mint text-base">✓</span> {t(k)}
                </li>
              ))}
            </ul>
            <Link href="/create" className="btn btn-secondary py-3 text-sm w-full text-center">
              {t('pricing_digital_cta')}
            </Link>
          </div>

          {/* Kit */}
          <div className="rounded-2xl border-2 border-bubblegum bg-bubblegum/5 p-8 flex flex-col relative">
            <span className="inline-block font-dm-sans-bold text-xs text-ink bg-bubblegum px-3 py-1 rounded-full mb-6 self-start">
              {t('pricing_kit_badge')}
            </span>

            {region === 'AU' ? (
              <p className="font-fraunces text-4xl text-ink mb-4">
                {fmt(r.kitTotalPrice, r.symbol)}
                <span className="font-dm-sans text-base text-ink/40 ml-1">{r.currency.toUpperCase()}</span>
              </p>
            ) : (
              <div className="mb-4">
                <div className="flex justify-between font-dm-sans text-sm text-ink/60 mb-1">
                  <span>{t('pricing_product')}</span>
                  <span>{fmt(r.kitProductPrice, r.symbol)}</span>
                </div>
                <div className="flex justify-between font-dm-sans text-sm text-ink/60 mb-2 pb-2 border-b border-ink/10">
                  <span>{t('pricing_shipping')}</span>
                  <span>{fmt(r.kitShippingPrice, r.symbol)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-dm-sans-bold text-sm text-ink">{t('pricing_total')}</span>
                  <span className="font-fraunces text-3xl text-ink">
                    {fmt(r.kitTotalPrice, r.symbol)}
                    <span className="font-dm-sans text-base text-ink/40 ml-1">{r.currency.toUpperCase()}</span>
                  </span>
                </div>
              </div>
            )}

            <h3 className="font-dm-sans-bold text-lg text-ink mb-2">{t('pricing_kit_title')}</h3>
            <p className="font-dm-sans text-sm text-ink/60 mb-6">{t('pricing_kit_desc')}</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {['pricing_kit_f1', 'pricing_kit_f2', 'pricing_kit_f3'].map(k => (
                <li key={k} className="flex items-center gap-2 font-dm-sans text-sm text-ink/80">
                  <span className="text-bubblegum text-base">✓</span> {t(k)}
                </li>
              ))}
            </ul>
            <Link href="/create" className="btn btn-buy py-3 text-sm w-full text-center">
              {t('pricing_kit_cta')}
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
