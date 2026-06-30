'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import Logo from './Logo'

const NAV_LINKS = [
  { href: '/',            labelKey: 'home' },
  { href: '/how-it-works', labelKey: 'how_it_works' },
  { href: '/#pricing',    labelKey: 'pricing' },
  { href: '/about',       labelKey: 'our_story' },
]

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pronto-locale')
    if (stored && stored !== locale && ['es', 'en'].includes(stored)) {
      router.replace(pathname, { locale: stored })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function switchLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    localStorage.setItem('pronto-locale', next)
    router.replace(pathname, { locale: next })
  }

  function isActive(href) {
    if (href === '/#pricing') return pathname === '/'
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="bg-ink text-mint sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          <Link href="/" className="shrink-0 no-underline">
            <Logo variant="dark" size="md" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={`font-dm-sans text-sm transition-colors hover:text-lemon ${
                  isActive(href)
                    ? 'text-lemon underline decoration-bubblegum underline-offset-4 decoration-2'
                    : 'text-mint/80'
                }`}
              >
                {t(labelKey)}
              </Link>
            ))}
          </div>

          {/* Right: lang + CTA + hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={switchLocale}
              className="font-dm-sans-bold text-sm text-mint hover:text-lemon transition-colors px-2 py-1"
              aria-label={`Switch to ${locale === 'es' ? 'English' : 'Español'}`}
            >
              {t('lang')}
            </button>

            <Link href="/create" className="btn btn-buy text-sm px-4 py-2 hidden sm:inline-flex">
              {t('cta')}
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden text-mint hover:text-lemon transition-colors p-1"
              aria-label="Open menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-ink z-[100] flex flex-col px-6 py-6">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" onClick={() => setMenuOpen(false)} className="no-underline">
              <Logo variant="dark" size="lg" />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-mint hover:text-lemon transition-colors"
              aria-label={t('close')}
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l16 16M22 6L6 22" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-7">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-fraunces text-4xl text-lemon leading-none hover:text-mint transition-colors"
              >
                {t(labelKey)}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <Link
              href="/create"
              onClick={() => setMenuOpen(false)}
              className="btn btn-buy w-full py-4 text-lg"
            >
              {t('cta')}
            </Link>
            <button
              onClick={() => { switchLocale(); setMenuOpen(false) }}
              className="w-full text-center font-dm-sans text-mint/50 text-sm hover:text-mint transition-colors"
            >
              {locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
