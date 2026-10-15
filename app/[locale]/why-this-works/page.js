import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Reveal from '@/components/Reveal'

export async function generateMetadata() {
  return { title: 'Why this works | Pronto' }
}

const CARDS = [
  {
    icon: '/images/iconos/colour/iconcolour_time.png',
    titleKey: 'card1_title',
    bodyKey: 'card1_body',
  },
  {
    icon: '/images/iconos/colour/iconcolour_daily.png',
    titleKey: 'card2_title',
    bodyKey: 'card2_body',
  },
  {
    icon: '/images/iconos/colour/iconcolour_eyes.png',
    titleKey: 'card3_title',
    bodyKey: 'card3_body',
  },
  {
    icon: '/images/iconos/colour/iconcolour_calm.png',
    titleKey: 'card4_title',
    bodyKey: 'card4_body',
  },
]

export default async function WhyThisWorksPage() {
  const t = await getTranslations('whythisworks')

  return (
    <div className="bg-pebble min-h-screen">
      {/* Header */}
      <div className="bg-pebble py-20 px-4 text-center">
        <p className="hero-in font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="hero-in hero-in-delay-1 font-fraunces text-5xl sm:text-6xl text-ink max-w-2xl mx-auto leading-tight">
          {t('h1')}
        </h1>
      </div>

      {/* Intro */}
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-4 text-center">
        <p className="hero-in hero-in-delay-2 font-dm-sans text-lg text-ink/70 leading-relaxed">
          {t('intro')}
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CARDS.map(({ icon, titleKey, bodyKey }, i) => (
            <Reveal
              key={titleKey}
              delay={i * 90}
              className="card-hover bg-white border border-ink/10 rounded-2xl p-8"
            >
              <img src={icon} alt="" aria-hidden="true" className="w-16 h-16 object-contain mb-5" />
              <h2 className="font-fraunces text-2xl text-ink mb-3">
                {t(titleKey)}
              </h2>
              <p className="font-dm-sans text-base text-ink/70 leading-relaxed">
                {t(bodyKey)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Closing */}
      <Reveal className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <p className="font-dm-sans text-lg text-ink/70 leading-relaxed">
          {t('closing_p1')}{' '}
          <span className="font-fraunces italic text-bubblegum">
            {t('closing_brand')}
          </span>
          {t('closing_p2')}
        </p>
      </Reveal>

      {/* CTA */}
      <Reveal className="bg-pebble py-20 px-4 text-center">
        <h2 className="font-fraunces text-4xl sm:text-5xl text-ink mb-8">
          {t('cta_h2')}
        </h2>
        <Link href="/create" className="btn btn-buy px-10 py-4 text-lg">
          {t('cta_btn')}
        </Link>
      </Reveal>
    </div>
  )
}
