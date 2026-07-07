import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function generateMetadata() {
  return { title: 'Our story — Pronto' }
}

const Quote = ({ children }) => (
  <blockquote className="border-l-4 border-bubblegum pl-6 py-4 my-2">
    <p className="font-fraunces text-xl sm:text-2xl text-ink italic leading-snug">
      {children}
    </p>
  </blockquote>
)

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div className="bg-pebble min-h-screen">
      {/* Header */}
      <div className="bg-ink py-20 px-4 text-center">
        <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-fraunces text-5xl sm:text-6xl text-lemon max-w-2xl mx-auto">
          {t('h1')}
        </h1>
      </div>

      {/* Story */}
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">

        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body1')}</p>
        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body2')}</p>
        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body3')}</p>

        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body4')}</p>

        {/* Quote 1 */}
        <Quote>{t('pull1')}</Quote>

        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body5')}</p>

        {/* Quote 2 */}
        <Quote>
          {t('pull2_l1')}<br />
          {t('pull2_l2')}<br />
          {t('pull2_l3')}
        </Quote>

        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body6')}</p>
        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body7')}</p>
        <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body8')}</p>

        {/* Quote 3 */}
        <Quote>
          {t('pull3_l1')}<br />
          {t('pull3_l2')}
        </Quote>

      </div>

      {/* CTA */}
      <div className="bg-ink py-20 px-4 text-center">
        <h2 className="font-fraunces text-4xl sm:text-5xl text-lemon mb-8">
          {t('cta_h2')}
        </h2>
        <Link href="/create" className="btn btn-buy px-10 py-4 text-lg">
          {t('cta_btn')}
        </Link>
      </div>
    </div>
  )
}
