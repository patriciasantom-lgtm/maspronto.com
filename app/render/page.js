'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { drawMapAsync } from '@/lib/drawMap'

// Visited by Puppeteer only. URL: /render?configUrl=BLOB_URL

function RenderCanvas() {
  const searchParams = useSearchParams()
  const canvasRef = useRef(null)
  const [config, setConfig] = useState(null)
  const configUrl = searchParams.get('configUrl')

  useEffect(() => {
    if (!configUrl) return
    fetch(configUrl)
      .then(r => r.json())
      .then(setConfig)
      .catch(console.error)
  }, [configUrl])

  useEffect(() => {
    if (!config || !canvasRef.current) return
    drawMapAsync(canvasRef.current, config)
  }, [config])

  return (
    <div style={{ margin: 0, padding: 0, background: 'white' }}>
      <canvas
        ref={canvasRef}
        id="map-canvas"
        width={1587}
        height={2245}
        data-ready="false"
        style={{ display: 'block', width: '100%' }}
      />
    </div>
  )
}

export default function RenderPage() {
  return (
    <Suspense>
      <RenderCanvas />
    </Suspense>
  )
}
