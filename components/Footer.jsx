import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Logo from './Logo'

export default async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="bg-ink text-mint py-12 mt-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <Logo variant="dark" size="md" className="mb-3" />
            <p className="font-dm-sans text-sm text-mint/70 mt-3 max-w-xs">{t('tagline')}</p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-dm-sans-bold text-xs uppercase tracking-widest text-mint/50 mb-4">
              {t('links_title')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/',             key: 'link_home' },
                { href: '/how-it-works', key: 'link_how' },
                { href: '/#pricing',     key: 'link_pricing' },
                { href: '/about',        key: 'link_about' },
                { href: '/create',       key: 'link_create' },
              ].map(({ href, key }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="font-dm-sans text-sm text-mint/70 hover:text-lemon transition-colors"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-dm-sans-bold text-xs uppercase tracking-widest text-mint/50 mb-4">
              {t('connect_title')}
            </h3>
            <a
              href={`mailto:${t('connect_email')}`}
              className="font-dm-sans text-sm text-mint/70 hover:text-lemon transition-colors block mb-3"
            >
              {t('connect_email')}
            </a>
            <p className="font-dm-sans text-sm text-mint/50">📦 {t('connect_ships')}</p>
          </div>
        </div>

        <div className="border-t border-mint/10 pt-6 flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <Link href="/terms"   className="font-dm-sans text-xs text-mint/40 hover:text-mint/70 transition-colors">{t('legal_terms')}</Link>
            <Link href="/privacy" className="font-dm-sans text-xs text-mint/40 hover:text-mint/70 transition-colors">{t('legal_privacy')}</Link>
            <Link href="/returns" className="font-dm-sans text-xs text-mint/40 hover:text-mint/70 transition-colors">{t('legal_returns')}</Link>
          </div>
          <p className="font-dm-sans text-xs text-mint/30">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
