import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Reveal from '@/components/Reveal'

export async function generateMetadata() {
  return { title: 'Our story | Pronto' }
}

const Quote = ({ children }) => (
  <Reveal as="blockquote" className="border-l-4 border-bubblegum pl-6 py-4 my-2">
    <p className="font-fraunces text-xl sm:text-2xl text-ink italic leading-snug">
      {children}
    </p>
  </Reveal>
)

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div className="bg-pebble min-h-screen">
      {/* Header */}
      <div className="bg-pebble py-20 px-4 text-center">
        <p className="hero-in font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="hero-in hero-in-delay-1 font-fraunces text-5xl sm:text-6xl text-ink max-w-2xl mx-auto">
          {t('h1')}
        </h1>
      </div>

      {/* Story */}
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">

        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body1')}</Reveal>
        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body2')}</Reveal>
        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body3')}</Reveal>

        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body4')}</Reveal>

        {/* Quote 1 */}
        <Quote>{t('pull1')}</Quote>

        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body5')}</Reveal>

        {/* Quote 2 */}
        <Quote>
          {t('pull2_l1')}<br />
          {t('pull2_l2')}<br />
          {t('pull2_l3')}
        </Quote>

        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body6')}</Reveal>
        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body7')}</Reveal>
        <Reveal as="p" className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('body8')}</Reveal>

        {/* Quote 3 */}
        <Quote>
          {t('pull3_l1')}<br />
          {t('pull3_l2')}
        </Quote>

      </div>

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
