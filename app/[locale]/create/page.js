'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import MapEditor from '@/components/MapEditor'
import StepIndicator from '@/components/StepIndicator'

export default function CreatePage() {
  const t = useTranslations('editor')
  const editorRef = useRef(null)
  const router = useRouter()

  function handleContinue() {
    const config = editorRef.current?.getConfig()
    if (!config) return
    localStorage.setItem('prontoConfig', JSON.stringify(config))
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen pb-24">
      <StepIndicator current={1} />

      <div className="text-center px-4 mb-8">
        <h1 className="font-fraunces text-3xl sm:text-4xl text-ink mb-2">
          {t('step_label')}
        </h1>
      </div>

      <MapEditor ref={editorRef} />

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-ink/10 p-4 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-dm-sans text-sm text-ink/60 text-center sm:text-left">
            {t('footer_hint')}
          </p>
          <button onClick={handleContinue} className="btn btn-primary w-full sm:w-auto px-10 py-4 text-lg">
            {t('next_btn')}
          </button>
        </div>
      </div>
    </div>
  )
}
