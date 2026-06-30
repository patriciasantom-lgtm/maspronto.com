'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import StepIndicator from '@/components/StepIndicator'

const STATES_AU = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

const MAP_THUMBS = {
  space:          '/images/maps/thumbnails/space.png',
  new_baby:       '/images/maps/thumbnails/new_baby.png',
  school:         '/images/maps/thumbnails/school.png',
  holiday_beach:  '/images/maps/thumbnails/holiday_beach.png',
  new_home:       '/images/maps/thumbnails/new_home.png',
  happy_birthday: '/images/maps/thumbnails/happy_birthday.png',
  christmas:      '/images/maps/thumbnails/christmas.png',
  no_theme:       '/images/maps/thumbnails/no_theme.png',
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
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', line1: '', line2: '', suburb: '', state: '', postcode: '',
  })

  useEffect(() => {
    const p = localStorage.getItem('prontoProduct')
    if (!p) { router.push('/checkout'); return }
    setProduct(p)
    const c = localStorage.getItem('prontoConfig')
    if (c) setConfig(JSON.parse(c))
  }, [router])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const isPhysical = product === 'kit'

  const isValid = () => {
    if (!form.name.trim() || !form.email.includes('@')) return false
    if (isPhysical) return form.line1.trim() && form.suburb.trim() && form.state && form.postcode.trim()
    return true
  }

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
        customer: { name: form.name, email: form.email },
        ...(isPhysical && { address: { line1: form.line1, line2: form.line2, suburb: form.suburb, state: form.state, postcode: form.postcode } }),
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

  return (
    <div className="min-h-screen pb-24">
      <StepIndicator current={3} />

      <div className="max-w-lg mx-auto px-4">

        {/* Your map summary card */}
        {config && (
          <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-4 mb-6 flex items-center gap-4">
            {MAP_THUMBS[config.theme] && (
              <div className="relative w-16 h-[86px] shrink-0 rounded-xl overflow-hidden">
                <Image src={MAP_THUMBS[config.theme]} alt="" fill className="object-cover" sizes="64px" />
              </div>
            )}
            {config.character && (
              <div className="relative w-10 h-14 shrink-0">
                <Image src={`/images/characters/png/${config.character}.png`} alt="" fill className="object-contain" sizes="40px" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-dm-sans-bold text-sm text-ink truncate">{config.title}</p>
              {config.subtitle && (
                <p className="font-dm-sans text-xs text-ink/50 truncate mt-0.5">{config.subtitle}</p>
              )}
              <p className="font-dm-sans text-xs text-ink/40 mt-1">
                {product === 'digital'
                  ? `${tp('digital_name')}, ${tp('digital_price')} ${tp('digital_currency')}`
                  : `${tp('kit_name')}, ${tp('kit_price')} ${tp('kit_currency')}`}
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

          {isPhysical && (
            <div className="border-t border-ink/10 pt-5 space-y-4">
              <h3 className="font-dm-sans-bold text-ink text-sm flex items-center gap-2">
                🏠 {t('address_title')}
              </h3>
              <Input label={`${t('address_line1')} *`} value={form.line1} onChange={v => set('line1', v)} autoComplete="address-line1" placeholder="123 Main Street" />
              <div>
                <label className="block font-dm-sans-bold text-sm text-ink mb-1">
                  {t('address_line2')} <span className="font-normal text-ink/40">{t('address_line2_optional')}</span>
                </label>
                <input value={form.line2} onChange={e => set('line2', e.target.value)} placeholder="Unit 4" autoComplete="address-line2" className="w-full border border-ink/20 rounded-xl px-4 py-3 font-dm-sans text-sm focus:outline-none focus:ring-2 focus:ring-ink/30 bg-white" />
              </div>
              <Input label={`${t('suburb')} *`} value={form.suburb} onChange={v => set('suburb', v)} autoComplete="address-level2" placeholder="Dee Why" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm-sans-bold text-sm text-ink mb-1">{t('state')} *</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)} className="w-full border border-ink/20 rounded-xl px-4 py-3 font-dm-sans text-sm focus:outline-none focus:ring-2 focus:ring-ink/30 bg-white">
                    <option value="">—</option>
                    {STATES_AU.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Input label={`${t('postcode')} *`} value={form.postcode} onChange={v => set('postcode', v.replace(/\D/g,'').slice(0,4))} placeholder="2099" maxLength={4} autoComplete="postal-code" />
              </div>
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
              ? `${tp('digital_name')}, ${tp('digital_price')} ${tp('digital_currency')}`
              : `${tp('kit_name')}, ${tp('kit_price')} ${tp('kit_currency')} · ${t('shipping_days')}`}
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
