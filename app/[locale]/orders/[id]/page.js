import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

async function getOrder(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/order-status?id=${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export default async function OrderPage({ params }) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'tracking' })

  const order = await getOrder(id)
  // TODO (Printful migration): gelatoStatus field name comes from /api/order-status.
  // When migrating to Printful, update that API route and rename this field if needed.
  const statusKey = order?.gelatoStatus || 'created'

  const STATUS_MAP = {
    created:    { label: t('status_created'),    color: 'blue',   icon: '📋' },
    passed:     { label: t('status_passed'),      color: 'yellow', icon: '🖨️' },
    in_transit: { label: t('status_in_transit'),  color: 'orange', icon: '🚚' },
    delivered:  { label: t('status_delivered'),   color: 'green',  icon: '📦' },
    canceled:   { label: t('status_canceled'),    color: 'red',    icon: '❌' },
  }

  const status = STATUS_MAP[statusKey] || STATUS_MAP.created

  const colorClasses = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-lemon/20 text-ink border-lemon/40',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    green:  'bg-mint/20 text-ink border-mint/40',
    red:    'bg-red-50 text-red-700 border-red-200',
  }

  const STEPS = ['created', 'passed', 'in_transit', 'delivered']
  const currentIdx = STEPS.indexOf(statusKey)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="no-underline">
            <span className="font-fraunces text-2xl text-ink">pronto</span>
          </Link>
          <h1 className="font-dm-sans-bold text-xl text-ink mt-2">{t('title')}</h1>
          <p className="font-dm-sans text-xs text-ink/40 mt-1">#{id.slice(0, 8).toUpperCase()}</p>
        </div>

        {order ? (
          <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-6 space-y-5">
            {/* Status badge */}
            <div className={`flex items-center gap-3 border rounded-xl p-4 ${colorClasses[status.color]}`}>
              <span className="text-2xl">{status.icon}</span>
              <div>
                <p className="font-dm-sans-bold text-base">{status.label}</p>
                {order.trackingNumber && (
                  <p className="font-dm-sans text-xs mt-0.5">Tracking: <strong>{order.trackingNumber}</strong></p>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              {[
                { key: 'created',    label: t('step_received') },
                { key: 'passed',     label: t('step_production') },
                { key: 'in_transit', label: t('step_dispatched') },
                { key: 'delivered',  label: t('step_delivered') },
              ].map((step, i) => {
                const done = STEPS.indexOf(step.key) <= currentIdx
                const active = step.key === statusKey
                return (
                  <div key={step.key} className={`flex items-center gap-3 ${done ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-dm-sans-bold text-xs shrink-0 ${done ? 'bg-ink text-lemon' : 'bg-ink/10 text-ink/50'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`font-dm-sans text-sm ${active ? 'font-bold text-ink' : 'text-ink/60'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-ink/10 pt-4 font-dm-sans text-sm text-ink/50 space-y-1">
              {order.customer && <p>📧 {order.customer}</p>}
              {order.carrier  && <p>🚚 {order.carrier}</p>}
              <p>📦 {t('includes')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-ink/10 p-6 text-center">
            <p className="font-dm-sans text-sm text-ink/60">{t('not_found')}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="font-dm-sans text-sm text-ink hover:underline">
            {t('create_another')}
          </Link>
        </div>
      </div>
    </div>
  )
}
