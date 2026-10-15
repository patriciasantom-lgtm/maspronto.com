'use client'

import { useState } from 'react'

export default function FaqAccordion({ items }) {
  const [open, setOpen] = useState(null)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={`border rounded-2xl overflow-hidden bg-white transition-colors duration-200 ${
            open === i ? 'border-bubblegum/40' : 'border-ink/10'
          }`}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="font-dm-sans-bold text-sm text-ink pr-4">{item.q}</span>
            <span className={`shrink-0 text-bubblegum transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 4v12M4 10h12" />
              </svg>
            </span>
          </button>
          <div className={`faq-panel ${open === i ? 'open' : ''}`}>
            <div>
              <p className="font-dm-sans text-sm text-ink/70 leading-relaxed px-6 pb-5">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
