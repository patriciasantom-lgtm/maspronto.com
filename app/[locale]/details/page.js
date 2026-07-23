'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { REGIONS, DEFAULT_REGION, fmt, getGeoRegion } from '@/lib/pricing'
import Image from 'next/image'
import StepIndicator from '@/components/StepIndicator'

const STICKER_FILES = {
  space:          'sticker_space',
  new_baby:       'sticker_newbaby',
  school:         'sticker_school',
  holiday_beach:  'sticker_holiday',
  new_home:       'sticker_newhome',
  happy_birthday: 'sticker_birthday',
  christmas:      'sticker_christmas',
  no_theme:       'sticker_notheme',
}

const Input = ({ label, value, onChange, ...props }) => (
  <div>
    <label className="block font-dm-sans-bold text-sm text-ink mb-1">{label}</label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-ink/20 rounded-xl px-4 py-3 font-dm-sans text-sm focus:outline-none focus:ring-2 focus:ring-ink/30 bg-white"
      {...props}
    />
  </div>
)

export default function DetailsPage() {
  const t = useTranslations('checkout')
  const tp = useTranslations('products')
  const locale = useLocale()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [region, setRegion] = useState(DEFAULT_REGION)
  const [config, setConfig] = useState(null)
  const [canvasUrl, setCanvasUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', email: '' })

  useEffect(() => {
    const p = localStorage.getItem('prontoProduct')
    if (!p) { router.push('/checkout'); return }
    setProduct(p)
    const c = localStorage.getItem('prontoConfig')
    if (c) setConfig(JSON.parse(c))
    const canvas = localStorage.getItem('prontoCanvasUrl')
    if (canvas) setCanvasUrl(canvas)
    const storedRegion = localStorage.getItem('prontoRegion')
    if (storedRegion && REGIONS[storedRegion]) {
      setRegion(storedRegion)
    } else {
      const geo = getGeoRegion()
      if (geo) setRegion(geo)
    }
  }, [router])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const isPhysical = product === 'kit'

  const isValid = () => !!(form.name.trim() && form.email.includes('@'))

  const r = REGIONS[region]

  async function handlePay() {
    if (!isValid() || loading) return
    setError('')
    setLoading(true)
    try {
      const storedConfig = JSON.parse(localStorage.getItem('prontoConfig') || '{}')
      const canvasDataUrl = localStorage.getItem('prontoCanvasUrl') || ''

      const body = {
        product,
        config: storedConfig,
        canvasDataUrl,
        locale,
        region,
        customer: { name: form.name, email: form.email },
      }

      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const productPrice = product === 'digital'
    ? `${fmt(r.digitalPrice, r.symbol)} ${r.currency.toUpperCase()}`
    : `${fmt(r.kitTotalPrice, r.symbol)} ${r.currency.toUpperCase()}`

  return (
    <div className="min-h-screen pb-24">
      <StepIndicator current={3} />

      <div className="max-w-lg mx-auto px-4">

        {/* Your map summary card */}
        {config && (
          <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-4 mb-6 flex items-center gap-4">
            <div className="relative w-16 h-[86px] shrink-0 rounded-xl overflow-hidden bg-pebble">
              {canvasUrl ? (
                <img src={canvasUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Image src={`/images/maps/thumbnails/${config.theme}.png`} alt="" fill className="object-cover" sizes="64px" />
              )}
            </div>

            {config.character && (
              <div className="relative w-10 h-14 shrink-0">
                <Image src={`/images/characters/png/${config.character}.png`} alt="" fill className="object-contain" sizes="40px" />
              </div>
            )}

            {product === 'kit' && STICKER_FILES[config.theme] && (
              <div className="relative w-10 h-14 shrink-0">
                <Image src={`/images/stickers/${STICKER_FILES[config.theme]}.png`} alt="" fill className="object-contain" sizes="40px" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-dm-sans-bold text-sm text-ink truncate">{config.title}</p>
              {config.subtitle && (
                <p className="font-dm-sans text-xs text-ink/50 truncate mt-0.5">{config.subtitle}</p>
              )}
              <p className="font-dm-sans text-xs text-ink/40 mt-1">
                {product === 'digital' ? tp('digital_name') : tp('kit_name')} · {productPrice}
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="font-fraunces text-3xl text-ink mb-2">{t('title')}</h1>
          <p className="font-dm-sans text-sm text-ink/60">
            {isPhysical ? t('address_hint') : t('digital_hint')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-6 space-y-5">
          <Input label={`${t('name_label')} *`} value={form.name}  onChange={v => set('name', v)}  autoComplete="name"  placeholder="María González" />
          <Input label={`${t('email_label')} *`} value={form.email} onChange={v => set('email', v)} autoComplete="email" placeholder="maria@email.com" type="email" />

          {/* Stripe collects shipping address at payment for all kit orders */}
          {isPhysical && (
            <div className="border-t border-ink/10 pt-5">
              <p className="font-dm-sans text-sm text-ink/50 flex items-center gap-2">
                🏠 {t('address_collected_stripe')}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 font-dm-sans text-sm text-red-700">{error}</div>
          )}
        </div>

        <p className="text-center font-dm-sans text-xs text-ink/40 mt-4">{t('secure_note')}</p>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-ink/10 p-4 z-40">
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-dm-sans text-sm text-ink/60">
            {product === 'digital'
              ? `${tp('digital_name')} · ${productPrice}`
              : `${tp('kit_name')} · ${productPrice}`}
          </p>
          <button
            onClick={handlePay}
            disabled={!isValid() || loading}
            className={`btn w-full sm:w-auto px-10 py-4 text-lg ${isValid() && !loading ? 'btn-buy' : 'bg-ink/20 text-ink/40 cursor-not-allowed'}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {t('processing')}
              </span>
            ) : t('go_to_payment')}
          </button>
        </div>
      </div>
    </div>
  )
}
