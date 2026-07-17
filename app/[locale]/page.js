import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import MapCarousel from '@/components/MapCarousel'
import ThemeCarousel from '@/components/ThemeCarousel'
import LocalPriceTag from '@/components/LocalPriceTag'
import ShippingCountries from '@/components/ShippingCountries'

const MAP_ICONS = [
  { id: 'space',          bw: '/images/iconos/bw/icon_space.png',     colour: '/images/iconos/colour/iconcolour_space.png' },
  { id: 'new_baby',       bw: '/images/iconos/bw/icon_newbaby.png',   colour: '/images/iconos/colour/iconcolour_newbaby.png' },
  { id: 'school',         bw: '/images/iconos/bw/icon_school.png',    colour: '/images/iconos/colour/iconcolour_school.png' },
  { id: 'holiday_beach',  bw: '/images/iconos/bw/icon_holiday.png',   colour: '/images/iconos/colour/iconcolour_holiday.png' },
  { id: 'new_home',       bw: '/images/iconos/bw/icon_newhome.png',   colour: '/images/iconos/colour/iconcolour_newhome.png' },
  { id: 'happy_birthday', bw: '/images/iconos/bw/icon_birthday.png',  colour: '/images/iconos/colour/iconcolour_birthday.png' },
  { id: 'christmas',      bw: '/images/iconos/bw/icon_christmas.png', colour: '/images/iconos/colour/iconcolour_christmas.png' },
  { id: 'no_theme',       bw: '/images/iconos/bw/icon_notheme.png',   colour: '/images/iconos/colour/iconcolour_notheme.png' },
]

export default async function HomePage() {
  const locale = await getLocale()
  const t    = await getTranslations('home')
  const tH   = await getTranslations('hero')
  const tMT  = await getTranslations('mapThemes')

  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="bg-ink text-mint overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <p className="font-dm-sans text-sm text-mint/60 mb-4 tracking-wide">
              {tH('eyebrow')}
            </p>
            <h1 className="font-fraunces text-5xl sm:text-6xl lg:text-7xl text-mint leading-none mb-6">
              {tH('h1_line1')}<br />
              <span className="text-lemon">{tH('h1_highlight')}</span>
            </h1>
            <p className="font-dm-sans text-lg text-mint/80 mb-10 max-w-lg mx-auto lg:mx-0">
              {tH('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/create" className="btn btn-buy px-8 py-4 text-base">
                {tH('cta_primary')}
              </Link>
              <Link href="/why-this-works" className="btn border-2 border-mint/40 text-mint hover:border-mint hover:text-lemon px-8 py-4 text-base">
                {tH('cta_secondary')}
              </Link>
            </div>
          </div>

          {/* Map carousel */}
          <div className="shrink-0 w-full max-w-xs lg:max-w-sm">
            <MapCarousel />
          </div>
        </div>
      </section>

      {/* ── 2. Emotional / Why ──────────────────────────────────── */}
      <section className="bg-pebble py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-4">
            {t('moment_eyebrow')}
          </p>
          <h2 className="font-fraunces text-4xl sm:text-5xl text-ink mb-8">
            {t('moment_h2')}
          </h2>
          <p className="font-dm-sans text-lg text-ink/70 mb-6 leading-relaxed">
            {t('moment_body1')}
          </p>
          <p className="font-dm-sans text-lg text-ink/70 mb-10 leading-relaxed">
            {t('moment_body2')}
          </p>
          <blockquote className="border-l-4 border-bubblegum pl-6 text-left max-w-xl mx-auto">
            <p className="font-fraunces text-2xl text-ink italic">{t('moment_pull')}</p>
          </blockquote>
        </div>
      </section>

      {/* ── 3. Use Cases ────────────────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-fraunces text-4xl sm:text-5xl text-ink mb-3">{t('uses_h2')}</h2>
            <p className="font-dm-sans text-ink/60">{t('uses_subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MAP_ICONS.map(({ id, bw, colour }) => (
              <Link
                key={id}
                href={`/create?theme=${id}`}
                className="theme-card flex flex-col items-center gap-3 py-6 px-3 rounded-2xl border border-ink/10 bg-pebble text-center group"
              >
                <div className="theme-icon-wrap">
                  <img src={bw} alt={tMT(id)} className="theme-icon-bw" />
                  <img src={colour} alt="" aria-hidden="true" className="theme-icon-colour" />
                </div>
                <span className="font-dm-sans text-xs text-ink/70 group-hover:text-ink leading-tight">
                  {tMT(id)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. How It Works (summary) ────────────────────────────── */}
      <section className="bg-mint py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-dm-sans-bold text-sm text-ink/50 uppercase tracking-widest mb-3">
              {t('how_eyebrow')}
            </p>
            <h2 className="font-fraunces text-4xl sm:text-5xl text-ink">{t('how_h2')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            {[
              { n: '01', title: t('how_step1_title'), body: t('how_step1_body') },
              { n: '02', title: t('how_step2_title'), body: t('how_step2_body') },
              { n: '03', title: t('how_step3_title'), body: t('how_step3_body') },
            ].map(({ n, title, body }) => (
              <div key={n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-ink text-lemon font-dm-sans-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {n}
                </div>
                <h3 className="font-dm-sans-bold text-lg text-ink mb-2">{title}</h3>
                <p className="font-dm-sans text-sm text-ink/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/create" className="btn btn-primary px-8 py-4 text-base">
              {t('how_cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Kit / Character Sheet ─────────────────────────────── */}
      <section className="bg-ink py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-4">
              {t('kit_eyebrow')}
            </p>
            <h2 className="font-fraunces text-4xl sm:text-5xl text-lemon mb-6">
              {t('kit_h2')}
            </h2>
            <p className="font-dm-sans text-lg text-mint/80 mb-8 leading-relaxed">
              {t('kit_body')}
            </p>
            <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto lg:mx-0">
              {['kit_f1','kit_f2','kit_f3','kit_f4'].map(k => (
                <li key={k} className="flex items-center gap-3 font-dm-sans text-sm text-mint">
                  <span className="w-5 h-5 rounded-full bg-lemon flex items-center justify-center shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {t(k)}
                </li>
              ))}
            </ul>
            <Link href="/create" className="btn btn-buy px-8 py-4 text-base">
              {t('kit_cta')}
            </Link>
          </div>

          {/* Visual: character grid */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-lemon text-ink font-dm-sans-bold text-xs px-3 py-1.5 rounded-full mb-4">
              {t('kit_badge')}
            </div>
            <CharacterGrid />
          </div>
        </div>
      </section>

      {/* ── 5b. Theme Carousel ──────────────────────────────────── */}
      <section className="bg-pebble py-16 px-4">
        <div className="max-w-sm mx-auto text-center">
          <p className="font-dm-sans-bold text-sm text-ink/50 uppercase tracking-widest mb-2">
            {locale === 'en' ? 'Pick your path' : 'Elegí tu camino'}
          </p>
          <h3 className="font-fraunces text-3xl text-ink mb-8">
            {locale === 'en' ? 'Choose your theme' : 'Elegí tu tema'}
          </h3>
          <ThemeCarousel />
        </div>
      </section>

      {/* ── 6. Social Proof ─────────────────────────────────────── */}
      <section className="bg-pebble py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-3">
              {t('proof_eyebrow')}
            </p>
            <h2 className="font-fraunces text-4xl sm:text-5xl text-ink">{t('proof_h2')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { quote: t('proof_1_quote'), author: t('proof_1_author') },
              { quote: t('proof_2_quote'), author: t('proof_2_author') },
              { quote: t('proof_3_quote'), author: t('proof_3_author') },
            ].map(({ quote, author }, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="font-dm-sans text-2xl text-bubblegum mb-3 leading-none">"</p>
                <p className="font-dm-sans text-sm text-ink/80 leading-relaxed mb-4">{quote}</p>
                <p className="font-dm-sans-bold text-xs text-ink/50">{author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-3">
              {t('pricing_eyebrow')}
            </p>
            <h2 className="font-fraunces text-4xl sm:text-5xl text-ink mb-3">{t('pricing_h2')}</h2>
            <p className="font-dm-sans text-ink/60">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Digital */}
            <div className="rounded-2xl border border-ink/10 p-8 flex flex-col">
              <span className="inline-block font-dm-sans-bold text-xs text-ink/50 bg-ink/5 px-3 py-1 rounded-full mb-6 self-start">
                {t('pricing_digital_badge')}
              </span>
              <p className="font-fraunces text-4xl text-ink mb-1">
                {t('pricing_digital_price')}
                <span className="font-dm-sans text-base text-ink/40 ml-1">{t('pricing_digital_currency')}</span>
              </p>
              <LocalPriceTag audCents={parseInt(process.env.NEXT_PUBLIC_PRICE_DIGITAL || '990')} />
              <h3 className="font-dm-sans-bold text-lg text-ink mb-2">{t('pricing_digital_title')}</h3>
              <p className="font-dm-sans text-sm text-ink/60 mb-6">{t('pricing_digital_desc')}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['pricing_digital_f1','pricing_digital_f2','pricing_digital_f3'].map(k => (
                  <li key={k} className="flex items-center gap-2 font-dm-sans text-sm text-ink/80">
                    <span className="text-mint text-base">✓</span> {t(k)}
                  </li>
                ))}
              </ul>
              <Link href="/create" className="btn btn-secondary py-3 text-sm w-full">
                {t('pricing_digital_cta')}
              </Link>
            </div>

            {/* Kit */}
            <div className="rounded-2xl border-2 border-bubblegum bg-bubblegum/5 p-8 flex flex-col relative">
              <span className="inline-block font-dm-sans-bold text-xs text-white bg-bubblegum px-3 py-1 rounded-full mb-6 self-start">
                {t('pricing_kit_badge')}
              </span>
              <p className="font-fraunces text-4xl text-ink mb-1">
                {t('pricing_kit_price')}
                <span className="font-dm-sans text-base text-ink/40 ml-1">{t('pricing_kit_currency')}</span>
              </p>
              <LocalPriceTag audCents={parseInt(process.env.NEXT_PUBLIC_PRICE_KIT || '4990')} />
              <h3 className="font-dm-sans-bold text-lg text-ink mb-2">{t('pricing_kit_title')}</h3>
              <p className="font-dm-sans text-sm text-ink/60 mb-6">{t('pricing_kit_desc')}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['pricing_kit_f1','pricing_kit_f2','pricing_kit_f3'].map(k => (
                  <li key={k} className="flex items-center gap-2 font-dm-sans text-sm text-ink/80">
                    <span className="text-bubblegum text-base">✓</span> {t(k)}
                  </li>
                ))}
              </ul>
              <Link href="/create" className="btn btn-buy py-3 text-sm w-full">
                {t('pricing_kit_cta')}
              </Link>
              <p className="font-dm-sans text-xs text-ink/40 text-center mt-3">{t('pricing_afterpay')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Shipping Countries ────────────────────────────────── */}
      <ShippingCountries />

      {/* ── 9. Final CTA ────────────────────────────────────────── */}
      <section className="bg-lemon py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-fraunces text-4xl sm:text-6xl text-ink mb-4">
            {t('cta_h2')}
          </h2>
          <p className="font-dm-sans text-lg text-ink/70 mb-10">{t('cta_subtitle')}</p>
          <Link href="/create" className="btn btn-primary px-10 py-5 text-lg">
            {t('cta_btn')}
          </Link>
        </div>
      </section>
    </>
  )
}

function CharacterGrid() {
  const chars = ['A','B','C','D','E','F','G','H','I','J','K','L']

  return (
    <div className="grid grid-cols-4 gap-2 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
      {chars.map(c => (
        <div
          key={c}
          className="relative rounded-xl overflow-hidden bg-white/20 border border-white/10"
          style={{ aspectRatio: '3/4' }}
        >
          <Image
            src={`/images/characters/png/${c}.png`}
            alt={`Character ${c}`}
            fill
            className="object-contain p-1"
            sizes="80px"
          />
        </div>
      ))}
    </div>
  )
}
