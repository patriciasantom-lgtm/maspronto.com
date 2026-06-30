'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

// Dev-only calibration tool. Not linked from any nav.
// Shows the selected map with draggable handles for the title zone and character position.
// Copy the output JSON into lib/generateMapPdf.js → MAP_OVERLAY_POSITIONS.

const MAP_THEMES = [
  { id: 'space',          file: 'space.jpg' },
  { id: 'new_baby',       file: 'new_baby.jpg' },
  { id: 'school',         file: 'school.jpg' },
  { id: 'holiday_beach',  file: 'holiday_beach.jpg' },
  { id: 'new_home',       file: 'new_home.jpg' },
  { id: 'happy_birthday', file: 'happy_birthday.jpg' },
  { id: 'christmas_map',  file: 'christmas_map.jpg' },
  { id: 'no_theme',       file: 'no_theme.jpg' },
]

// PDF dimensions in points
const PDF_W = 1190
const PDF_H = 1684

// Default overlay positions (same as lib/generateMapPdf.js defaults)
const DEFAULTS = {
  title:     { x: 95,  y: 104,  width: 1000, height: 80,  size: 52 },
  subtitle:  { x: 95,  y: 190,  width: 1000, height: 40,  size: 24 },
  character: { x: 55,  y: 1424, width: 180,  height: 230 },
}
// Note: calibrate page uses top-left origin (like CSS), same as spec's MAP_OVERLAY_POSITIONS.
// lib/generateMapPdf.js converts y to PDF bottom-left: pdf_y = PDF_H - overlay_y - element_height

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

export default function CalibratePage() {
  const [theme, setTheme] = useState('space')
  const [overlays, setOverlays] = useState(DEFAULTS)
  const [dragging, setDragging] = useState(null) // { handle, startX, startY, origX, origY }
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  // Measure rendered container to get CSS→PDF scale factor
  const onContainerLoad = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setScale(PDF_W / rect.width)
  }, [])

  function startDrag(e, handle) {
    e.preventDefault()
    const orig = overlays[handle]
    setDragging({ handle, startX: e.clientX, startY: e.clientY, origX: orig.x, origY: orig.y })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', stopDrag)
  }

  const onMouseMove = useCallback((e) => {
    if (!dragging) return
    const dx = (e.clientX - dragging.startX) * scale
    const dy = (e.clientY - dragging.startY) * scale
    setOverlays(prev => ({
      ...prev,
      [dragging.handle]: {
        ...prev[dragging.handle],
        x: Math.round(clamp(dragging.origX + dx, 0, PDF_W - (prev[dragging.handle].width ?? 0))),
        y: Math.round(clamp(dragging.origY + dy, 0, PDF_H - (prev[dragging.handle].height ?? 0))),
      },
    }))
  }, [dragging, scale])

  function stopDrag() {
    setDragging(null)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', stopDrag)
  }

  const currentMap = MAP_THEMES.find(m => m.id === theme)

  // Convert top-left overlay coords to CSS % for positioning on preview
  function toPercent(val, total) { return (val / total * 100).toFixed(3) + '%' }

  // Build the output JSON for copy-paste into generateMapPdf.js
  function buildOutput() {
    const t = overlays.title
    const s = overlays.subtitle
    const c = overlays.character
    return JSON.stringify({
      [theme]: {
        title:     { x: t.x, y: PDF_H - t.y - (t.height ?? 80),  width: t.width,  size: t.size },
        subtitle:  { x: s.x, y: PDF_H - s.y - (s.height ?? 40),  width: s.width,  size: s.size },
        character: { x: c.x, y: PDF_H - c.y - c.height, width: c.width, height: c.height },
      }
    }, null, 2)
  }

  function updateField(handle, field, value) {
    setOverlays(prev => ({
      ...prev,
      [handle]: { ...prev[handle], [field]: Number(value) },
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Overlay Calibrator</h1>
        <p className="text-sm text-gray-500 mb-6">
          Drag the coloured handles to position title, subtitle, and character.
          Copy the JSON output into <code>lib/generateMapPdf.js</code> → MAP_OVERLAY_POSITIONS.
        </p>

        {/* Theme picker */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MAP_THEMES.map(m => (
            <button
              key={m.id}
              onClick={() => setTheme(m.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                theme === m.id
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#1A1A1A]'
              }`}
            >
              {m.id}
            </button>
          ))}
        </div>

        <div className="flex gap-6 items-start">
          {/* Map preview with draggable overlays */}
          <div className="flex-1 max-w-lg">
            <div
              ref={containerRef}
              onLoad={onContainerLoad}
              className="relative w-full border-2 border-gray-300 rounded-xl overflow-hidden select-none"
              style={{ paddingBottom: `${(PDF_H / PDF_W) * 100}%` }}
            >
              {currentMap && (
                <Image
                  src={`/images/maps/${currentMap.file}`}
                  alt={theme}
                  fill
                  className="object-cover"
                  onLoad={onContainerLoad}
                  priority
                />
              )}

              {/* Title handle */}
              <div
                onMouseDown={e => startDrag(e, 'title')}
                className="absolute cursor-move border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center"
                style={{
                  left:   toPercent(overlays.title.x, PDF_W),
                  top:    toPercent(overlays.title.y, PDF_H),
                  width:  toPercent(overlays.title.width, PDF_W),
                  height: toPercent(overlays.title.height ?? 80, PDF_H),
                }}
              >
                <span className="text-blue-700 text-xs font-bold bg-white/80 px-1 rounded">TITLE</span>
              </div>

              {/* Subtitle handle */}
              <div
                onMouseDown={e => startDrag(e, 'subtitle')}
                className="absolute cursor-move border-2 border-green-500 bg-green-500/20 flex items-center justify-center"
                style={{
                  left:   toPercent(overlays.subtitle.x, PDF_W),
                  top:    toPercent(overlays.subtitle.y, PDF_H),
                  width:  toPercent(overlays.subtitle.width, PDF_W),
                  height: toPercent(overlays.subtitle.height ?? 40, PDF_H),
                }}
              >
                <span className="text-green-700 text-xs font-bold bg-white/80 px-1 rounded">SUBTITLE</span>
              </div>

              {/* Character handle */}
              <div
                onMouseDown={e => startDrag(e, 'character')}
                className="absolute cursor-move border-2 border-orange-500 bg-orange-500/20 flex items-center justify-center"
                style={{
                  left:   toPercent(overlays.character.x, PDF_W),
                  top:    toPercent(overlays.character.y, PDF_H),
                  width:  toPercent(overlays.character.width, PDF_W),
                  height: toPercent(overlays.character.height, PDF_H),
                }}
              >
                <span className="text-orange-700 text-xs font-bold bg-white/80 px-1 rounded">CHAR</span>
              </div>
            </div>
          </div>

          {/* Controls + output */}
          <div className="w-72 shrink-0 space-y-4">
            {(['title', 'subtitle', 'character']).map(handle => (
              <div key={handle} className="bg-white rounded-xl border border-gray-200 p-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">{handle}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['x', 'y', 'width', 'height'].map(field => {
                    if (handle !== 'character' && field === 'height') return null
                    const val = overlays[handle][field]
                    if (val === undefined) return null
                    return (
                      <label key={field} className="flex flex-col text-xs text-gray-600">
                        <span className="font-medium mb-0.5">{field}</span>
                        <input
                          type="number"
                          value={val}
                          onChange={e => updateField(handle, field, e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-sm"
                        />
                      </label>
                    )
                  })}
                  {(handle === 'title' || handle === 'subtitle') && (
                    <label className="flex flex-col text-xs text-gray-600 col-span-2">
                      <span className="font-medium mb-0.5">size (pt)</span>
                      <input
                        type="number"
                        value={overlays[handle].size}
                        onChange={e => updateField(handle, 'size', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-gray-900 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-mono">Output (PDF coords)</p>
                <button
                  onClick={() => navigator.clipboard.writeText(buildOutput())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
              <pre className="text-xs text-green-400 font-mono overflow-auto max-h-64 whitespace-pre-wrap">
                {buildOutput()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
