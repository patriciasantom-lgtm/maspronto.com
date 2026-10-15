'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { DIGITAL_PRICE, fmt } from '@/lib/pricing'
import StepIndicator from '@/components/StepIndicator'
import ProductCard from '@/components/ProductCard'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tp = useTranslations('products')
  const [selected, setSelected] = useState('digital')
  const router = useRouter()

  function handleContinue() {
    if (!selected) return
    localStorage.setItem('prontoProduct', selected)
    router.push('/details')
  }

  const stickyPrice = `${fmt(DIGITAL_PRICE.amount, DIGITAL_PRICE.symbol)} ${DIGITAL_PRICE.currency.toUpperCase()}`

  return (
    <div className="min-h-screen pb-24">
      <StepIndicator current={2} />

      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-fraunces text-3xl text-ink mb-2">{t('select_format')}</h1>
          <p className="font-dm-sans text-ink/60">{t('select_subtitle')}</p>
        </div>

        <div className="max-w-sm mx-auto mb-8">
          <ProductCard type="digital" selected={true} onSelect={() => {}} />
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge color="mint">{t('trust_stripe')}</Badge>
          <Badge color="lemon">{t('trust_au')}</Badge>
          <Badge color="sky">{t('trust_guarantee')}</Badge>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-ink/10 p-4 z-40">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-dm-sans text-sm text-ink/60">
            {`${tp('digital_name')} · ${stickyPrice}`}
          </p>
          <button
            onClick={handleContinue}
            className="btn w-full sm:w-auto px-10 py-4 text-lg btn-primary"
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
    sky:    'bg-skyblue text-ink',
    ink:    'bg-ink text-mint',
    pink:   'bg-bubblegum text-ink',
  }
  return (
    <span className={`${classes[color]} font-dm-sans-bold text-xs px-3 py-1.5 rounded-full`}>
      {children}
    </span>
  )
}
