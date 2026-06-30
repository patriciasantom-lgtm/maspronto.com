import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'terms' })
  return { title: `${t('title')} — Más pronto` }
}

export default async function TermsPage() {
  const t = await getTranslations('terms')

  return (
    <div className="bg-pebble min-h-screen py-16 px-4">
      <div className="max-w-[680px] mx-auto">

        <p className="font-dm-sans text-xs text-ink/40 mb-3">{t('updated')}</p>
        <h1 className="font-fraunces text-4xl sm:text-5xl text-ink mb-12 leading-tight">{t('title')}</h1>

        <div className="space-y-10">

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s1_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('s1_p')}</p>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s2_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed mb-3">{t('s2_intro')}</p>
            <ul className="space-y-2 pl-4">
              <li className="font-dm-sans text-base text-ink/80 leading-relaxed list-disc">{t('s2_li1')}</li>
              <li className="font-dm-sans text-base text-ink/80 leading-relaxed list-disc">{t('s2_li2')}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s3_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('s3_p')}</p>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s4_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('s4_p')}</p>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s5_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('s5_p')}</p>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s6_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('s6_p')}</p>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s7_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('s7_p')}</p>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s8_h')}</h2>
            <p className="font-dm-sans text-base text-ink/80 leading-relaxed">{t('s8_p')}</p>
          </section>

          <section>
            <h2 className="font-dm-sans-bold text-base text-ink mb-3">{t('s9_h')}</h2>
            <a
              href={`mailto:${t('s9_p')}`}
              className="font-dm-sans text-base text-ink/80 hover:text-ink underline underline-offset-2"
            >
              {t('s9_p')}
            </a>
          </section>

        </div>
      </div>
    </div>
  )
}
