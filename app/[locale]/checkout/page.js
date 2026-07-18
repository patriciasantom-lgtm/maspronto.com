'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { REGIONS, DEFAULT_REGION, fmt } from '@/lib/pricing'
import StepIndicator from '@/components/StepIndicator'
import ProductCard from '@/components/ProductCard'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tp = useTranslations('products')
  const [selected, setSelected] = useState(null)
  const [region, setRegion] = useState(DEFAULT_REGION)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('prontoRegion')
    if (stored && REGIONS[stored]) setRegion(stored)
  }, [])

  function handleContinue() {
    if (!selected) return
    localStorage.setItem('prontoProduct', selected)
    router.push('/details')
  }

  const r = REGIONS[region]
  const stickyPrice = selected
    ? selected === 'digital'
      ? `${fmt(r.digitalPrice, r.symbol)} ${r.currency.toUpperCase()}`
      : `${fmt(r.kitTotalPrice, r.symbol)} ${r.currency.toUpperCase()}`
    : null

  return (
    <div className="min-h-screen pb-24">
      <StepIndicator current={2} />

      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-fraunces text-3xl text-ink mb-2">{t('select_format')}</h1>
          <p className="font-dm-sans text-ink/60">{t('select_subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <ProductCard type="digital" selected={selected === 'digital'} onSelect={setSelected} />
          <ProductCard type="kit"     selected={selected === 'kit'}     onSelect={setSelected} />
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge color="mint">{t('trust_stripe')}</Badge>
          <Badge color="lemon">{t('trust_au')}</Badge>
          <Badge color="mint">{t('trust_guarantee')}</Badge>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-ink/10 p-4 z-40">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-dm-sans text-sm text-ink/60">
            {selected
              ? selected === 'digital'
                ? `${tp('digital_name')} · ${stickyPrice}`
                : `${tp('kit_name')} · ${stickyPrice}`
              : t('select_to_continue')}
          </p>
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`btn w-full sm:w-auto px-10 py-4 text-lg ${selected ? 'btn-primary' : 'bg-ink/20 text-ink/40 cursor-not-allowed'}`}
          >
            {t('next_btn')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Badge({ color, children }) {
  const classes = {
    mint:   'bg-mint text-ink',
    lemon:  'bg-lemon text-ink',
    ink:    'bg-ink text-mint',
    pink:   'bg-bubblegum text-white',
  }
  return (
    <span className={`${classes[color]} font-dm-sans-bold text-xs px-3 py-1.5 rounded-full`}>
      {children}
    </span>
  )
}
