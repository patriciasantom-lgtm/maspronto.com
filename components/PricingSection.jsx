'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { DIGITAL_PRICE, fmt } from '@/lib/pricing'
import Reveal from './Reveal'

export default function PricingSection() {
  const t = useTranslations('home')

  return (
    <section id="pricing" className="bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-8">
          <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-3">
            {t('pricing_eyebrow')}
          </p>
          <h2 className="font-fraunces text-4xl sm:text-5xl text-ink mb-3">{t('pricing_h2')}</h2>
          <p className="font-dm-sans text-ink/60">{t('pricing_subtitle')}</p>
        </Reveal>

        <Reveal className="max-w-sm mx-auto">

          {/* Digital — the only product */}
          <div className="card-hover rounded-2xl border-2 border-bubblegum bg-bubblegum/5 p-8 flex flex-col relative">
            <span className="inline-block font-dm-sans-bold text-xs text-ink bg-bubblegum px-3 py-1 rounded-full mb-6 self-start">
              {t('pricing_digital_badge')}
            </span>
            <p className="font-fraunces text-4xl text-ink mb-4">
              {fmt(DIGITAL_PRICE.amount, DIGITAL_PRICE.symbol)}
              <span className="font-dm-sans text-base text-ink/40 ml-1">{DIGITAL_PRICE.currency.toUpperCase()}</span>
            </p>
            <h3 className="font-dm-sans-bold text-lg text-ink mb-2">{t('pricing_digital_title')}</h3>
            <p className="font-dm-sans text-sm text-ink/60 mb-6">{t('pricing_digital_desc')}</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {['pricing_digital_f1', 'pricing_digital_f2', 'pricing_digital_f3'].map(k => (
                <li key={k} className="flex items-center gap-2 font-dm-sans text-sm text-ink/80">
                  <span className="text-bubblegum text-base">✓</span> {t(k)}
                </li>
              ))}
            </ul>
            <Link href="/create" className="btn btn-buy py-3 text-sm w-full text-center">
              {t('pricing_digital_cta')}
            </Link>
          </div>

        </Reveal>
      </div>
    </section>
  )
}
