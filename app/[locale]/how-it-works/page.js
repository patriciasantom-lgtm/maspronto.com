import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import FaqAccordion from '@/components/FaqAccordion'

export async function generateMetadata() {
  return { title: 'How it works — Pronto' }
}

export default async function HowItWorksPage() {
  const t = await getTranslations('howitworks')

  const steps = [
    { n: t('step1_n'), title: t('step1_title'), body: t('step1_body') },
    { n: t('step2_n'), title: t('step2_title'), body: t('step2_body') },
    { n: t('step3_n'), title: t('step3_title'), body: t('step3_body') },
    { n: t('step4_n'), title: t('step4_title'), body: t('step4_body') },
  ]

  const faqs = [
    { q: t('faq_1_q'), a: t('faq_1_a') },
    { q: t('faq_2_q'), a: t('faq_2_a') },
    { q: t('faq_3_q'), a: t('faq_3_a') },
    { q: t('faq_4_q'), a: t('faq_4_a') },
    { q: t('faq_5_q'), a: t('faq_5_a') },
    { q: t('faq_6_q'), a: t('faq_6_a') },
  ]

  return (
    <div className="bg-pebble min-h-screen">
      {/* Header */}
      <div className="bg-ink py-20 px-4 text-center">
        <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-4">
          {t('eyebrow')}
        </p>
        <h1 className="font-fraunces text-5xl sm:text-6xl text-lemon leading-tight">
          {t('h1')}
        </h1>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-10">
          {steps.map(({ n, title, body }) => (
            <div key={n} className="flex gap-6 items-start">
              <div className="shrink-0 w-14 h-14 rounded-full bg-ink text-lemon font-fraunces text-xl flex items-center justify-center">
                {n}
              </div>
              <div className="pt-1">
                <h2 className="font-dm-sans-bold text-xl text-ink mb-2">{title}</h2>
                <p className="font-dm-sans text-base text-ink/70 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA between steps and FAQ */}
        <div className="bg-mint rounded-2xl px-8 py-10 text-center my-16">
          <p className="font-fraunces text-2xl text-ink mb-6">
            {t('mid_cta')}
          </p>
          <Link href="/create" className="btn btn-primary px-8 py-4 text-base">
            {t('cta_btn')}
          </Link>
        </div>

        {/* FAQ */}
        <h2 className="font-fraunces text-3xl sm:text-4xl text-ink mb-8 text-center">
          {t('faq_title')}
        </h2>
        <FaqAccordion items={faqs} />
      </div>
    </div>
  )
}
