import { getTranslations } from 'next-intl/server'

export default async function ShippingCountries() {
  const t = await getTranslations('shipping')

  const countries = t('countries').split(' · ')

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-dm-sans-bold text-sm text-bubblegum uppercase tracking-widest mb-3">
          {t('eyebrow')}
        </p>
        <h2 className="font-fraunces text-4xl sm:text-5xl text-ink italic mb-8">
          {t('title')}
        </h2>

        <p className="font-dm-sans text-lg text-ink/70 leading-loose mb-6">
          {countries.map((country, i) => (
            <span key={i}>
              <span className="font-dm-sans-bold text-ink">{country}</span>
              {i < countries.length - 1 && <span className="text-ink/30"> · </span>}
            </span>
          ))}
        </p>

        <p className="font-dm-sans text-sm text-ink/40 leading-relaxed">
          {t('note')}
        </p>
      </div>
    </section>
  )
}
