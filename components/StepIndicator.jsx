'use client'

import { useTranslations } from 'next-intl'

export default function StepIndicator({ current }) {
  const t = useTranslations('steps')

  const STEPS = [
    { n: 1, key: 'create' },
    { n: 2, key: 'format' },
    { n: 3, key: 'details' },
    { n: 4, key: 'pay' },
  ]

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-ink/10" />
        <div
          className="absolute top-5 left-[10%] h-0.5 bg-ink transition-all duration-500"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 80}%` }}
        />
        {STEPS.map(({ n, key }) => {
          const done = n < current
          const active = n === current
          return (
            <div key={n} className="flex flex-col items-center z-10 gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-dm-sans-bold text-sm transition-all duration-300 ${
                done    ? 'bg-ink text-lemon shadow-md' :
                active  ? 'bg-ink text-lemon ring-4 ring-ink/20 shadow-md' :
                          'bg-white text-ink/40 border border-ink/15'
              }`}>
                {done ? '✓' : n}
              </div>
              <span className={`font-dm-sans text-xs hidden sm:block ${
                active ? 'text-ink font-bold' : done ? 'text-ink/50' : 'text-ink/30'
              }`}>
                {t(key)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
