'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

function SuccessContent() {
  const t = useTranslations('success')
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const p = localStorage.getItem('prontoProduct')
    setProduct(p)
    localStorage.removeItem('prontoConfig')
    localStorage.removeItem('prontoCanvasUrl')
    localStorage.removeItem('prontoProduct')
  }, [])

  const isDigital = product === 'digital'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-ink/10 shadow-xl p-8 text-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>

        <h1 className="font-fraunces text-3xl text-ink mb-3">{t('title')}</h1>

        <p className="font-dm-sans text-ink/70 text-base mb-6">
          {isDigital ? (
            <>
              {t('digital_msg')}
              <br /><br />
              <span className="text-sm text-ink/40">{t('digital_spam')}</span>
            </>
          ) : t('kit_msg')}
        </p>

        {/* What's next */}
        <div className="bg-mint/20 rounded-2xl p-5 text-left mb-6">
          <h3 className="font-dm-sans-bold text-ink text-sm mb-3">{t('whats_next')}</h3>
          <ul className="space-y-2 font-dm-sans text-sm text-ink/70">
            {isDigital ? (
              <>
                <li className="flex items-start gap-2"><span>📧</span> {t('digital_step1')}</li>
                <li className="flex items-start gap-2"><span>🖨️</span> {t('digital_step2')}</li>
                <li className="flex items-start gap-2"><span>🖍️</span> {t('digital_step3')}</li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2"><span>📧</span> {t('kit_step1')}</li>
                <li className="flex items-start gap-2"><span>🖨️</span> {t('kit_step2')}</li>
                <li className="flex items-start gap-2"><span>🚚</span> {t('kit_step3')}</li>
                <li className="flex items-start gap-2"><span>📦</span> {t('kit_step4')}</li>
              </>
            )}
          </ul>
        </div>

        {sessionId && (
          <p className="font-dm-sans text-xs text-ink/40 mb-6">
            {t('reference')}: {sessionId.slice(-12).toUpperCase()}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn btn-primary flex-1 py-3 px-6">
            {t('create_another')}
          </Link>
          <a
            href="mailto:hola@maspronto.com"
            className="btn btn-secondary flex-1 py-3 px-6"
          >
            {t('contact_support')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ink border-t-lemon rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
