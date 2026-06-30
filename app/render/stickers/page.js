import { Suspense } from 'react'
import { THEMES } from '@/lib/themes'

// ─── Sticker sheet render page — visited by Puppeteer for A4 PDF ────────────
// URL: /render/stickers?theme=jungle

function StickerGrid({ theme }) {
  const themeData = THEMES[theme] || THEMES.none
  const emojis = themeData.emojis

  // Generate 63 stickers (9 columns × 7 rows)
  const stickers = Array.from({ length: 63 }, (_, i) => emojis[i % emojis.length])

  return (
    <div
      id="sticker-sheet"
      style={{
        width: '794px',
        minHeight: '1123px',
        background: 'white',
        padding: '24px',
        fontFamily: 'Bubblegum Sans, cursive',
        boxSizing: 'border-box',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '20px', color: '#7C3AED', fontWeight: 'bold', margin: 0 }}>
          Mis calcomanías mágicas ✨
        </p>
        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0' }}>
          Recorta cada calcomanía y úsala para decorar tu mapa
        </p>
      </div>

      {/* Sticker grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '8px',
        }}
      >
        {stickers.map((emoji, i) => (
          <div
            key={i}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '1.5px dashed #D1D5DB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              background: 'white',
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function StickersRenderPage({ searchParams }) {
  const { theme } = await searchParams

  return (
    <html>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&display=swap"
          rel="stylesheet"
        />
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
      </head>
      <body>
        <StickerGrid theme={theme || 'none'} />
      </body>
    </html>
  )
}
