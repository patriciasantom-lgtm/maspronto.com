'use client'

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { FONTS } from '@/lib/themes'

const MAP_THEMES = [
  { id: 'space',          folder: 'spacepath',     prefix: 'space',    days: 21 },
  { id: 'new_baby',       folder: 'newbabypath',   prefix: 'newbaby',  days: 21 },
  { id: 'school',         folder: 'schoolpath',    prefix: 'school',   days: 21 },
  { id: 'holiday_beach',  folder: 'holidaypath',   prefix: 'holiday',  days: 21 },
  { id: 'new_home',       folder: 'newhomepath',   prefix: 'newhome',  days: 21 },
  { id: 'happy_birthday', folder: 'birthdaypath',  prefix: 'birthday', days: 21 },
  { id: 'no_theme',       folder: 'nothemepath',   prefix: 'notheme',  days: 21 },
  { id: 'christmas',      folder: 'christmaspath', prefix: 'christmas',days: 24 },
]

const CHARACTERS = [
  { id: 'girl1', file: '/images/characters/png/girl1.png', alt: 'Girl 1' },
  { id: 'girl2', file: '/images/characters/png/girl2.png', alt: 'Girl 2' },
  { id: 'girl3', file: '/images/characters/png/girl3.png', alt: 'Girl 3' },
  { id: 'boy1',  file: '/images/characters/png/boy1.png',  alt: 'Boy 1' },
  { id: 'boy2',  file: '/images/characters/png/boy2.png',  alt: 'Boy 2' },
  { id: 'boy3',  file: '/images/characters/png/boy3.png',  alt: 'Boy 3' },
]

const MapEditor = forwardRef(function MapEditor({ initialTheme } = {}, ref) {
  const tE  = useTranslations('editor')
  const tMT = useTranslations('mapThemes')

  const [config, setConfig] = useState({
    title:     tE('title_default'),
    subtitle:  tE('subtitle_default'),
    theme:     initialTheme || 'space',
    character: 'girl1',
    font:      'Bubblegum Sans',
  })

  useImperativeHandle(ref, () => ({
    getConfig: () => config,
  }))

  const update = useCallback((key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }))
  }, [])

  const updateFont = useCallback(async (fontId) => {
    if (typeof document !== 'undefined') {
      try { await document.fonts.load(`700 20px '${fontId}'`) } catch (_) {}
    }
    setConfig(prev => ({ ...prev, font: fontId }))
  }, [])

  const currentMap  = MAP_THEMES.find(m => m.id === config.theme)
  const isChristmas = currentMap?.days === 24
  const previewSrc  = isChristmas
    ? '/images/maps/christmaspath/christmas.png'
    : `/images/maps/${currentMap?.folder}/${currentMap?.prefix}-${config.character}.png`

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto px-4">

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="lg:w-80 shrink-0 space-y-6">

        {/* Map theme grid */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {tE('selectMap')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MAP_THEMES.map(({ id, folder, prefix }) => {
              const thumbSrc = id === 'christmas'
                ? '/images/maps/christmaspath/christmas.png'
                : `/images/maps/${folder}/${prefix}-${config.character}.png`
              return (
                <button
                  key={id}
                  onClick={() => update('theme', id)}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                    config.theme === id
                      ? 'border-[#1A1A1A] shadow-md ring-1 ring-[#1A1A1A]/20'
                      : 'border-gray-200 hover:border-[#1A1A1A]/40'
                  }`}
                >
                  <div className="relative w-full bg-white" style={{ paddingBottom: '141.4%' }}>
                    <Image
                      src={thumbSrc}
                      alt={tMT(id)}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 40vw, 150px"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-medium py-1 px-1.5 text-center leading-tight">
                    {tMT(id)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Days note */}
        <p className="text-xs text-[#1A1A1A] bg-[#1A1A1A]/8 rounded-xl p-3 leading-relaxed">
          {isChristmas ? tE('daysNote24') : tE('daysNote21')}
        </p>

        {/* Character grid — hidden for Christmas (no character variants) */}
        {!isChristmas && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {tE('selectCharacter')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => update('character', char.id)}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all hover:scale-105 ${
                    config.character === char.id
                      ? 'border-[#1A1A1A] shadow-md ring-1 ring-[#1A1A1A]/20'
                      : 'border-gray-200 hover:border-[#1A1A1A]/40 hover:shadow-sm'
                  }`}
                  style={{ aspectRatio: '3/4' }}
                >
                  <Image
                    src={char.file}
                    alt={char.alt}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {tE('titleLabel')}
          </label>
          <input
            type="text"
            value={config.title}
            onChange={e => update('title', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/30 bg-white"
            placeholder={tE('titlePlaceholder')}
            maxLength={60}
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {tE('subtitle_label')}
          </label>
          <input
            type="text"
            value={config.subtitle}
            onChange={e => update('subtitle', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/30 bg-white"
            placeholder={tE('subtitlePlaceholder')}
            maxLength={80}
          />
        </div>

        {/* Font */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {tE('fontLabel')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FONTS.map(f => (
              <button
                key={f.id}
                onClick={() => updateFont(f.id)}
                className={`py-2 px-1 rounded-xl border text-sm transition-all ${
                  config.font === f.id
                    ? 'border-[#1A1A1A] bg-[#1A1A1A]/8 text-[#1A1A1A]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#1A1A1A]/30'
                }`}
                style={{ fontFamily: `'${f.id}', cursive` }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live preview ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center gap-3 lg:self-start lg:sticky lg:top-20">
        <p className="text-sm font-semibold text-gray-700 self-start lg:self-center">
          {tE('preview')}
        </p>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* A3 aspect ratio container */}
          <div className="relative w-full" style={{ paddingBottom: '141.4%' }}>

            {/* Layer 1 — combined map + character image */}
            <Image
              src={previewSrc}
              alt={`${tMT(config.theme)} preview`}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 90vw, 384px"
            />

            {/* Layer 2 — title */}
            {config.title && (
              <div
                className="absolute z-20 left-1/2 -translate-x-1/2 text-center w-4/5"
                style={{
                  top: '3%',
                  fontFamily: `'${config.font}', cursive`,
                  color: '#1A1A1A',
                  fontSize: 'clamp(11px, 2.8vw, 20px)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textShadow: '0 1px 3px rgba(255,255,255,0.9)',
                }}
              >
                {config.title}
              </div>
            )}

            {/* Layer 3 — subtitle */}
            {config.subtitle && (
              <div
                className="absolute z-20 left-1/2 -translate-x-1/2 text-center w-4/5"
                style={{
                  top: '9%',
                  fontFamily: 'DM Sans, sans-serif',
                  color: '#1A1A1A',
                  fontSize: 'clamp(8px, 1.6vw, 13px)',
                  lineHeight: 1.3,
                  textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                }}
              >
                {config.subtitle}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {tE('preview_note')}
        </p>
      </div>
    </div>
  )
})

export default MapEditor
