import { THEMES, DESTINATIONS } from './themes'

export async function drawMapAsync(canvas, config) {
  if (typeof document !== 'undefined' && config.font) {
    try { await document.fonts.load(`bold 80px '${config.font}'`) } catch (_) {}
  }
  drawMap(canvas, config)
}

export function drawMap(canvas, config) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const scale = W / 794

  const theme = THEMES[config.theme] || THEMES.none
  const dest = DESTINATIONS[config.destination] || DESTINATIONS.hermanito
  const isBaby = config.destination === 'hermanito' || config.destination === 'hermanita'
  const destEmoji = isBaby && config.babyEmoji ? config.babyEmoji : dest.emoji
  const charAvatar = config.characterAvatar || '🧒'

  // White background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, H)

  // Draw theme scene (background layer — squares drawn on top)
  drawThemeScene(ctx, W, H, config.theme || 'none', scale)

  // Title
  const titleFont = config.font || 'Bubblegum Sans'
  ctx.font = `bold ${Math.round(44 * scale)}px '${titleFont}', 'Bubblegum Sans', cursive`
  ctx.fillStyle = '#1C1917'
  ctx.textAlign = 'center'
  ctx.fillText(config.title || '', W / 2, Math.round(72 * scale))

  // Subtitle
  ctx.font = `${Math.round(20 * scale)}px 'DM Sans', 'Inter', sans-serif`
  ctx.fillStyle = '#6B7280'
  ctx.fillText(config.subtitle || '', W / 2, Math.round(104 * scale))

  // Snake grid
  const bw = Math.round(42 * scale)
  const padding = Math.round(bw + 10 * scale)
  const cols = 7
  const totalSquares = (config.days || 30) + 2
  const availW = W - padding * 2
  const availH = H - Math.round(135 * scale) - bw
  const squareSize = Math.min(
    Math.floor(availW / cols),
    Math.floor(availH / Math.ceil(totalSquares / cols))
  ) - Math.round(4 * scale)
  const gap = Math.round(6 * scale)
  const gridW = cols * (squareSize + gap) - gap
  const startX = Math.round((W - gridW) / 2)
  const startY = Math.round(135 * scale)

  for (let i = 0; i < totalSquares; i++) {
    const row = Math.floor(i / cols)
    const col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols)
    const x = startX + col * (squareSize + gap)
    const y = startY + row * (squareSize + gap)
    const r = Math.round(8 * scale)

    if (i === 0) ctx.fillStyle = '#7C3AED'
    else if (i === totalSquares - 1) ctx.fillStyle = '#F59E0B'
    else ctx.fillStyle = 'white'

    roundRect(ctx, x, y, squareSize, squareSize, r)
    ctx.fill()

    if (i > 0 && i < totalSquares - 1) {
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scale))
      roundRect(ctx, x, y, squareSize, squareSize, r)
      ctx.stroke()
      ctx.font = `bold ${Math.round(squareSize * 0.34)}px 'Inter', 'DM Sans', sans-serif`
      ctx.fillStyle = '#9CA3AF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(i), x + squareSize / 2, y + squareSize / 2)
    }

    if (i === 0) {
      ctx.font = `${Math.round(squareSize * 0.62)}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(charAvatar, x + squareSize / 2, y + squareSize / 2)
    }

    if (i === totalSquares - 1) {
      ctx.font = `${Math.round(squareSize * 0.58)}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(destEmoji, x + squareSize / 2, y + squareSize / 2)
    }
  }

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  canvas.dataset.ready = 'true'
}

// ─── Theme scene dispatcher ────────────────────────────────────────────────

function drawThemeScene(ctx, W, H, themeId, scale) {
  const sw = Math.max(1.5, 2.8 * scale)

  ctx.save()
  ctx.strokeStyle = '#1a1a1a'
  ctx.fillStyle = 'white'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (themeId === 'none') {
    ctx.lineWidth = sw * 0.8
    const m1 = Math.round(7 * scale), m2 = Math.round(16 * scale)
    ctx.strokeRect(m1, m1, W - m1 * 2, H - m1 * 2)
    ctx.strokeRect(m2, m2, W - m2 * 2, H - m2 * 2)
    // Ornamental corners
    for (const [cx, cy, rot] of [[m2+18*scale, m2+18*scale, 0], [W-m2-18*scale, m2+18*scale, Math.PI/2], [W-m2-18*scale, H-m2-18*scale, Math.PI], [m2+18*scale, H-m2-18*scale, -Math.PI/2]]) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot)
      ctx.beginPath(); ctx.moveTo(0, -14*scale); ctx.lineTo(0, 0); ctx.lineTo(14*scale, 0); ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
    return
  }

  const elements = THEME_ELEMENTS[themeId]
  if (!elements) { ctx.restore(); return }

  ctx.lineWidth = sw
  for (const el of elements) {
    el.fn(ctx, el.x * W, el.y * H, el.r * scale, sw)
  }
  ctx.restore()
}

// ─── Theme scene element data (x/y are fractions of W/H, r is px at 1× scale) ─

const THEME_ELEMENTS = {
  space: [
    { x: 0.86, y: 0.78, r: 52, fn: sceneRocket },
    { x: 0.07, y: 0.20, r: 44, fn: sceneAstronaut },
    { x: 0.90, y: 0.44, r: 40, fn: sceneSaturn },
    { x: 0.91, y: 0.08, r: 28, fn: sceneUFO },
    { x: 0.04, y: 0.55, r: 34, fn: sceneMeteor },
    { x: 0.18, y: 0.86, r: 20, fn: primStar },
    { x: 0.80, y: 0.05, r: 16, fn: primSparkle },
    { x: 0.38, y: 0.93, r: 14, fn: primSparkle },
  ],
  jungle: [
    { x: 0.04, y: 0.32, r: 68, fn: scenePalmTree },
    { x: 0.92, y: 0.26, r: 58, fn: scenePalmTree },
    { x: 0.92, y: 0.58, r: 38, fn: sceneMonkey },
    { x: 0.05, y: 0.77, r: 32, fn: sceneTropicalFlower },
    { x: 0.88, y: 0.84, r: 28, fn: sceneTropicalFlower },
    { x: 0.42, y: 0.06, r: 26, fn: sceneButterfly },
    { x: 0.55, y: 0.92, r: 18, fn: primLeaf },
  ],
  sea: [
    { x: 0.05, y: 0.14, r: 54, fn: sceneLighthouse },
    { x: 0.48, y: 0.85, r: 60, fn: sceneWhale },
    { x: 0.90, y: 0.52, r: 40, fn: sceneOctopus },
    { x: 0.04, y: 0.82, r: 28, fn: primShell },
    { x: 0.88, y: 0.10, r: 24, fn: primShell },
    { x: 0.22, y: 0.08, r: 22, fn: primFish },
    { x: 0.70, y: 0.92, r: 18, fn: primWave },
  ],
  animals: [
    { x: 0.06, y: 0.80, r: 50, fn: sceneDog },
    { x: 0.88, y: 0.77, r: 46, fn: sceneCat },
    { x: 0.90, y: 0.08, r: 36, fn: sceneBunny },
    { x: 0.04, y: 0.46, r: 20, fn: primPaw },
    { x: 0.93, y: 0.46, r: 20, fn: primPaw },
    { x: 0.32, y: 0.06, r: 24, fn: sceneButterfly },
    { x: 0.60, y: 0.91, r: 22, fn: primBone },
  ],
  unicorns: [
    { x: 0.07, y: 0.76, r: 58, fn: sceneUnicorn },
    { x: 0.50, y: 0.07, r: 55, fn: sceneRainbow },
    { x: 0.90, y: 0.14, r: 30, fn: sceneMagicWand },
    { x: 0.04, y: 0.14, r: 26, fn: primStar },
    { x: 0.88, y: 0.74, r: 26, fn: primFlower },
    { x: 0.20, y: 0.92, r: 22, fn: primHeart },
    { x: 0.76, y: 0.88, r: 18, fn: primSparkle },
  ],
  stars: [
    { x: 0.08, y: 0.09, r: 52, fn: sceneCrescentMoon },
    { x: 0.78, y: 0.07, r: 44, fn: sceneShootingStar },
    { x: 0.06, y: 0.78, r: 42, fn: sceneTelescope },
    { x: 0.88, y: 0.68, r: 36, fn: sceneCloud },
    { x: 0.50, y: 0.90, r: 20, fn: primStar },
    { x: 0.25, y: 0.06, r: 18, fn: primSparkle },
    { x: 0.86, y: 0.92, r: 16, fn: primSparkle },
  ],
  dinosaurs: [
    { x: 0.84, y: 0.72, r: 60, fn: sceneTRex },
    { x: 0.32, y: 0.07, r: 50, fn: scenePterodactyl },
    { x: 0.04, y: 0.32, r: 60, fn: sceneFern },
    { x: 0.08, y: 0.82, r: 46, fn: sceneVolcano },
    { x: 0.92, y: 0.22, r: 26, fn: primEgg },
    { x: 0.65, y: 0.91, r: 22, fn: primDinoFoot },
    { x: 0.88, y: 0.91, r: 20, fn: primDinoFoot },
  ],
  princesses: [
    { x: 0.06, y: 0.74, r: 56, fn: sceneCastleTower },
    { x: 0.88, y: 0.32, r: 44, fn: sceneFairy },
    { x: 0.88, y: 0.82, r: 38, fn: sceneRose },
    { x: 0.04, y: 0.12, r: 32, fn: primCrown },
    { x: 0.91, y: 0.08, r: 30, fn: sceneMagicWand },
    { x: 0.32, y: 0.90, r: 24, fn: primFlower },
    { x: 0.60, y: 0.88, r: 20, fn: primHeart },
  ],
}

// ─── Scene character functions ─────────────────────────────────────────────

function sceneRocket(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22)
  ctx.lineWidth = sw * 1.2
  // Body
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.bezierCurveTo(r*0.46, -r*0.55, r*0.46, r*0.3, r*0.34, r*0.56)
  ctx.lineTo(-r*0.34, r*0.56)
  ctx.bezierCurveTo(-r*0.46, r*0.3, -r*0.46, -r*0.55, 0, -r)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Window
  ctx.beginPath()
  ctx.arc(0, -r*0.2, r*0.22, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Fins
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(s*r*0.34, r*0.22); ctx.lineTo(s*r*0.74, r*0.74); ctx.lineTo(s*r*0.34, r*0.56)
    ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  // Flame
  ctx.beginPath()
  ctx.moveTo(-r*0.22, r*0.56)
  ctx.bezierCurveTo(-r*0.15, r*0.82, r*0.07, r*1.04, 0, r*0.86)
  ctx.bezierCurveTo(-r*0.07, r*1.08, r*0.15, r*0.82, r*0.22, r*0.56)
  ctx.stroke()
  ctx.restore()
}

function sceneAstronaut(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw * 1.1
  // Helmet
  ctx.beginPath(); ctx.arc(0, -r*0.44, r*0.44, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Visor
  ctx.beginPath(); ctx.arc(r*0.05, -r*0.46, r*0.26, 0.22, Math.PI-0.22)
  ctx.stroke()
  // Body
  roundRect(ctx, -r*0.32, -r*0.02, r*0.64, r*0.65, r*0.13)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Backpack
  roundRect(ctx, r*0.32, r*0.1, r*0.2, r*0.36, r*0.06)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Arms
  ctx.beginPath(); ctx.moveTo(-r*0.32, r*0.14)
  ctx.bezierCurveTo(-r*0.72, r*0.0, -r*0.82, r*0.4, -r*0.65, r*0.52)
  ctx.stroke()
  ctx.beginPath(); ctx.moveTo(r*0.32, r*0.14)
  ctx.bezierCurveTo(r*0.72, r*0.0, r*0.82, r*0.4, r*0.65, r*0.52)
  ctx.stroke()
  // Legs
  for (const sx of [-0.15, 0.15]) {
    ctx.beginPath(); ctx.moveTo(sx*r, r*0.63); ctx.lineTo(sx*r*1.1, r)
    ctx.stroke()
    ctx.beginPath(); ctx.arc(sx*r*1.1, r, r*0.11, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

function sceneSaturn(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw * 1.1
  ctx.beginPath(); ctx.arc(0, 0, r*0.54, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Two rings
  for (const [rx, ry] of [[r, r*0.28], [r*0.82, r*0.22]]) {
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, -Math.PI*0.14, 0, Math.PI*2)
    ctx.stroke()
  }
  ctx.restore()
}

function sceneUFO(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Saucer
  ctx.beginPath(); ctx.ellipse(0, r*0.1, r*0.9, r*0.34, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Dome
  ctx.beginPath(); ctx.arc(0, -r*0.06, r*0.44, Math.PI, 0); ctx.closePath()
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Lights
  for (const dx of [-r*0.38, 0, r*0.38]) {
    ctx.beginPath(); ctx.arc(dx, r*0.24, r*0.1, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  ctx.restore()
}

function sceneMeteor(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI*0.28)
  ctx.lineWidth = sw
  ctx.beginPath(); ctx.ellipse(0, 0, r*0.54, r*0.4, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  for (let i = 1; i <= 4; i++) {
    ctx.globalAlpha = 1 - i*0.2
    ctx.beginPath()
    ctx.moveTo(r*0.54 + r*0.14*i, -r*0.08*i)
    ctx.lineTo(r*0.54 + r*0.44*i, r*0.06*i)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

function scenePalmTree(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  // Trunk
  ctx.beginPath()
  ctx.moveTo(r*0.1, r); ctx.bezierCurveTo(r*0.14, r*0.4, -r*0.06, 0, 0, -r*0.15)
  ctx.lineWidth = sw * 2.2; ctx.stroke()
  // Fronds
  ctx.lineWidth = sw
  const fronds = [[-0.15, r*0.84], [-0.42, r*0.76], [-0.68, r*0.70], [Math.PI*0.58, r*0.72], [Math.PI*0.32, r*0.80]]
  for (const [a, len] of fronds) {
    const angle = typeof a === 'number' && a < 1 ? -a * Math.PI : a
    const ex = Math.cos(angle)*len, ey = Math.sin(angle)*len
    ctx.beginPath()
    ctx.moveTo(0, -r*0.15)
    ctx.bezierCurveTo(Math.cos(angle)*len*0.35, -r*0.15+Math.sin(angle)*len*0.35+r*0.1, Math.cos(angle)*len*0.7, -r*0.15+Math.sin(angle)*len*0.7+r*0.05, ex, -r*0.15+ey)
    ctx.stroke()
    // Two leaflets per frond
    for (const t of [0.45, 0.72]) {
      const bx = Math.cos(angle)*len*t, by = -r*0.15+Math.sin(angle)*len*t
      const pa = angle + Math.PI/2
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + Math.cos(pa)*s*r*0.18, by + Math.sin(pa)*s*r*0.18)
        ctx.stroke()
      }
    }
  }
  ctx.restore()
}

function sceneMonkey(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Body
  ctx.beginPath(); ctx.ellipse(0, r*0.2, r*0.42, r*0.5, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Head
  ctx.beginPath(); ctx.arc(0, -r*0.38, r*0.38, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Ears
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s*r*0.38, -r*0.38, r*0.15, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  // Face: eyes
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s*r*0.14, -r*0.44, r*0.07, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  // Smile
  ctx.beginPath(); ctx.arc(0, -r*0.3, r*0.14, 0.2, Math.PI-0.2); ctx.stroke()
  // Hanging arm (tail up)
  ctx.beginPath()
  ctx.moveTo(-r*0.42, r*0.0)
  ctx.bezierCurveTo(-r*0.9, -r*0.2, -r*0.95, -r*0.7, -r*0.6, -r*0.9)
  ctx.stroke()
  ctx.restore()
}

function sceneTropicalFlower(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // 5 petals
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - Math.PI/2
    ctx.save(); ctx.rotate(a)
    ctx.beginPath()
    ctx.ellipse(0, -r*0.58, r*0.24, r*0.38, 0, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
    ctx.restore()
  }
  // Center
  ctx.beginPath(); ctx.arc(0, 0, r*0.28, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Center dots
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5
    ctx.beginPath(); ctx.arc(Math.cos(a)*r*0.14, Math.sin(a)*r*0.14, r*0.06, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  ctx.restore()
}

function sceneButterfly(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Upper wings
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(s*r*0.48, -r*0.28, r*0.44, r*0.32, s*0.4, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  // Lower wings
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(s*r*0.36, r*0.2, r*0.30, r*0.38, s*0.6, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  // Body
  ctx.beginPath(); ctx.ellipse(0, 0, r*0.1, r*0.48, 0, 0, Math.PI*2)
  ctx.fillStyle = '#1a1a1a'; ctx.fill()
  // Antennae
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(s*r*0.04, -r*0.48)
    ctx.bezierCurveTo(s*r*0.18, -r*0.7, s*r*0.32, -r*0.8, s*r*0.3, -r*0.95)
    ctx.stroke()
    ctx.beginPath(); ctx.arc(s*r*0.3, -r*0.95, r*0.06, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  ctx.restore()
}

function sceneLighthouse(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Tower body (slightly tapered)
  ctx.beginPath()
  ctx.moveTo(-r*0.32, r); ctx.lineTo(r*0.32, r)
  ctx.lineTo(r*0.22, -r*0.38); ctx.lineTo(-r*0.22, -r*0.38)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Horizontal stripes
  for (const yf of [0.1, -0.1, -0.3]) {
    ctx.beginPath()
    const hw = r*(0.32 - (0.32-0.22)*(0.5 - yf/r))
    ctx.moveTo(-hw, yf*r); ctx.lineTo(hw, yf*r); ctx.stroke()
  }
  // Lantern room
  roundRect(ctx, -r*0.28, -r*0.7, r*0.56, r*0.32, r*0.06)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Light glow lines
  for (const a of [-0.5, 0, 0.5]) {
    ctx.beginPath()
    ctx.moveTo(0, -r*0.54)
    ctx.lineTo(Math.cos(a - Math.PI/2)*r*0.65, -r*0.54 + Math.sin(a - Math.PI/2)*r*0.65)
    ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1
  }
  // Roof/dome
  ctx.beginPath()
  ctx.moveTo(-r*0.3, -r*0.7)
  ctx.lineTo(0, -r); ctx.lineTo(r*0.3, -r*0.7)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Base
  roundRect(ctx, -r*0.4, r, r*0.8, r*0.18, r*0.04)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.restore()
}

function sceneWhale(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw * 1.2
  // Body
  ctx.beginPath()
  ctx.moveTo(-r, 0)
  ctx.bezierCurveTo(-r*0.8, -r*0.55, r*0.4, -r*0.55, r*0.7, -r*0.1)
  ctx.bezierCurveTo(r, r*0.05, r, r*0.22, r*0.72, r*0.25)
  ctx.bezierCurveTo(r*0.4, r*0.5, -r*0.7, r*0.5, -r, 0)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Tail flukes
  ctx.beginPath()
  ctx.moveTo(-r, 0)
  ctx.bezierCurveTo(-r*1.1, -r*0.12, -r*1.4, -r*0.35, -r*1.28, -r*0.5)
  ctx.bezierCurveTo(-r*1.18, -r*0.6, -r*1.0, -r*0.42, -r, 0)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-r, 0)
  ctx.bezierCurveTo(-r*1.1, r*0.12, -r*1.4, r*0.32, -r*1.24, r*0.48)
  ctx.bezierCurveTo(-r*1.14, r*0.56, -r*1.0, r*0.38, -r, 0)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Eye
  ctx.beginPath(); ctx.arc(r*0.32, -r*0.2, r*0.08, 0, Math.PI*2)
  ctx.fillStyle = '#1a1a1a'; ctx.fill()
  // Spout
  ctx.beginPath()
  ctx.moveTo(r*0.45, -r*0.54)
  ctx.bezierCurveTo(r*0.4, -r*0.78, r*0.52, -r*0.9, r*0.5, -r*1.0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(r*0.5, -r*1.0)
  ctx.bezierCurveTo(r*0.38, -r*0.88, r*0.6, -r*0.84, r*0.58, -r*1.06)
  ctx.stroke()
  ctx.restore()
}

function sceneOctopus(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw * 1.1
  // Head
  ctx.beginPath(); ctx.arc(0, -r*0.2, r*0.48, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Eyes
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s*r*0.18, -r*0.28, r*0.1, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  // 8 tentacles
  for (let i = 0; i < 8; i++) {
    const base = (i / 8) * Math.PI + 0.1
    const bx = Math.cos(base + Math.PI*0.05) * r*0.38
    const by = r*0.2
    ctx.beginPath()
    ctx.moveTo(bx, by)
    const wobble = (i % 2 === 0 ? 1 : -1) * r*0.28
    ctx.bezierCurveTo(
      bx + wobble, by + r*0.38,
      bx - wobble*0.5, by + r*0.7,
      bx + (i%2===0?r*0.1:-r*0.1), by + r
    )
    ctx.stroke()
  }
  ctx.restore()
}

function sceneDog(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Body
  ctx.beginPath(); ctx.ellipse(0, r*0.1, r*0.55, r*0.38, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Head
  ctx.beginPath(); ctx.arc(r*0.46, -r*0.28, r*0.38, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Ears (floppy)
  ctx.beginPath()
  ctx.moveTo(r*0.28, -r*0.56)
  ctx.bezierCurveTo(r*0.1, -r*0.82, r*0.22, -r*0.96, r*0.14, -r*0.84)
  ctx.bezierCurveTo(r*0.08, -r*0.76, r*0.2, -r*0.6, r*0.28, -r*0.56)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(r*0.64, -r*0.56)
  ctx.bezierCurveTo(r*0.82, -r*0.82, r*0.7, -r*0.96, r*0.78, -r*0.84)
  ctx.bezierCurveTo(r*0.84, -r*0.76, r*0.72, -r*0.6, r*0.64, -r*0.56)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Eye
  ctx.beginPath(); ctx.arc(r*0.56, -r*0.32, r*0.07, 0, Math.PI*2)
  ctx.fillStyle = '#1a1a1a'; ctx.fill()
  // Nose
  ctx.beginPath(); ctx.ellipse(r*0.7, -r*0.16, r*0.1, r*0.07, 0, 0, Math.PI*2)
  ctx.fillStyle = '#1a1a1a'; ctx.fill()
  // Legs (4)
  for (const [lx, ly] of [[-r*0.28, r*0.48], [-r*0.06, r*0.48], [r*0.18, r*0.48], [r*0.38, r*0.48]]) {
    ctx.beginPath(); ctx.moveTo(lx, r*0.38); ctx.lineTo(lx, ly + r*0.5); ctx.stroke()
  }
  // Tail
  ctx.beginPath()
  ctx.moveTo(-r*0.54, r*0.0)
  ctx.bezierCurveTo(-r*0.8, -r*0.24, -r*0.6, -r*0.56, -r*0.38, -r*0.38)
  ctx.stroke()
  ctx.restore()
}

function sceneCat(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Body
  ctx.beginPath(); ctx.ellipse(0, r*0.2, r*0.46, r*0.56, -0.15, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Head
  ctx.beginPath(); ctx.arc(0, -r*0.36, r*0.38, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Ears (pointy)
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(s*r*0.18, -r*0.68); ctx.lineTo(s*r*0.44, -r); ctx.lineTo(s*r*0.38, -r*0.66)
    ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  // Eyes (almond shaped)
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s*r*0.16, -r*0.4, r*0.1, r*0.07, s*0.3, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  // Whiskers
  for (const [x1, y1, x2, y2] of [[-r*0.38, -r*0.22, r*0.0, -r*0.22], [-r*0.38, -r*0.3, r*0.0, -r*0.26], [r*0.38, -r*0.22, r*0.0, -r*0.22]]) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1
  }
  // Tail (curled)
  ctx.beginPath()
  ctx.moveTo(r*0.44, r*0.68)
  ctx.bezierCurveTo(r*0.88, r*0.5, r*0.9, r*0.0, r*0.66, -r*0.1)
  ctx.stroke()
  ctx.restore()
}

function sceneBunny(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Body
  ctx.beginPath(); ctx.ellipse(0, r*0.38, r*0.38, r*0.46, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Head
  ctx.beginPath(); ctx.arc(0, -r*0.1, r*0.32, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Tall ears
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(s*r*0.18, -r*0.72, r*0.13, r*0.36, s*0.18, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
    // Inner ear
    ctx.beginPath()
    ctx.ellipse(s*r*0.18, -r*0.72, r*0.07, r*0.22, s*0.18, 0, Math.PI*2)
    ctx.stroke()
  }
  // Eyes
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s*r*0.12, -r*0.14, r*0.07, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  // Nose
  ctx.beginPath(); ctx.arc(0, r*0.02, r*0.06, 0, Math.PI*2)
  ctx.fillStyle = '#1a1a1a'; ctx.fill()
  // Tail
  ctx.beginPath(); ctx.arc(r*0.36, r*0.42, r*0.1, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.restore()
}

function sceneUnicorn(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Body
  ctx.beginPath()
  ctx.moveTo(-r*0.9, r*0.28); ctx.lineTo(-r*0.9, -r*0.06)
  ctx.bezierCurveTo(-r*0.9, -r*0.5, -r*0.2, -r*0.72, r*0.2, -r*0.52)
  ctx.lineTo(r*0.8, -r*0.36); ctx.lineTo(r*0.82, r*0.28); ctx.closePath()
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Head
  ctx.beginPath()
  ctx.moveTo(r*0.8, -r*0.36)
  ctx.bezierCurveTo(r*1.05, -r*0.4, r*1.12, -r*0.08, r*1.0, r*0.08)
  ctx.bezierCurveTo(r*0.9, r*0.2, r*0.7, r*0.15, r*0.6, r*0.05)
  ctx.lineTo(r*0.8, -r*0.36); ctx.closePath()
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Horn
  ctx.beginPath()
  ctx.moveTo(r*0.88, -r*0.5); ctx.lineTo(r*1.02, -r*0.94); ctx.lineTo(r*1.08, -r*0.48)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Eye
  ctx.beginPath(); ctx.arc(r*0.95, -r*0.18, r*0.07, 0, Math.PI*2)
  ctx.fillStyle = '#1a1a1a'; ctx.fill()
  // Mane (flowing lines)
  for (const [my, mctl, mend] of [[-r*0.54, r*0.12, r*0.2], [-r*0.44, r*0.04, r*0.1], [-r*0.34, r*0.0, r*0.06]]) {
    ctx.beginPath()
    ctx.moveTo(r*0.2, my)
    ctx.bezierCurveTo(-r*0.1, my + r*0.15, -r*0.22, my + r*0.28, -r*0.3, my + r*0.38)
    ctx.stroke()
  }
  // Legs (4)
  for (const [lx, lslant] of [[-r*0.52, 0.08], [-r*0.18, -0.04], [r*0.26, 0.04], [r*0.58, -0.06]]) {
    ctx.beginPath()
    ctx.moveTo(lx, r*0.28); ctx.lineTo(lx + lslant*r, r*0.9); ctx.stroke()
  }
  // Tail
  ctx.beginPath()
  ctx.moveTo(-r*0.9, r*0.05)
  ctx.bezierCurveTo(-r*1.2, r*0.2, -r*1.25, r*0.55, -r*1.05, r*0.7)
  ctx.stroke()
  ctx.restore()
}

function sceneRainbow(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  // Three concentric arcs (representing rainbow bands)
  for (const [ar, al] of [[r, 1], [r*0.78, 0.7], [r*0.56, 0.45]]) {
    ctx.beginPath()
    ctx.arc(0, r*0.2, ar, Math.PI*1.08, Math.PI*1.92)
    ctx.lineWidth = sw * (1 + al*0.4)
    ctx.globalAlpha = al
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  // Clouds at ends
  for (const s of [-1, 1]) {
    const ex = s * r * Math.cos(Math.PI*0.08)
    const ey = r*0.2 + r * Math.sin(Math.PI*1.08) * -1
    ctx.save(); ctx.translate(ex, ey)
    for (const [dx, dy, cr] of [[0,0,r*0.18],[r*s*0.15,-r*0.06,r*0.13],[-r*s*0.15,-r*0.04,r*0.12]]) {
      ctx.beginPath(); ctx.arc(dx, dy, cr, 0, Math.PI*2)
      ctx.fillStyle = 'white'; ctx.fill(); ctx.lineWidth = sw*0.8; ctx.stroke()
    }
    ctx.restore()
  }
  ctx.restore()
}

function sceneMagicWand(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI*0.25)
  ctx.lineWidth = sw * 1.2
  // Stick
  ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r*0.5)
  ctx.lineWidth = sw * 1.8; ctx.stroke()
  // Star at tip
  ctx.lineWidth = sw * 1.2
  primStar(ctx, 0, -r, r*0.36, sw*1.2)
  // Sparkles around star
  for (const [dx, dy] of [[r*0.4, -r*0.6], [-r*0.38, -r*0.7], [r*0.28, -r*1.1]]) {
    ctx.beginPath(); ctx.arc(dx, dy, r*0.07, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  ctx.restore()
}

function sceneCrescentMoon(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw * 1.2
  ctx.beginPath()
  ctx.arc(0, 0, r, 0.42, Math.PI*1.58)
  ctx.arc(-r*0.3, -r*0.12, r*0.76, Math.PI*1.46, 0.3, true)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Star companion
  primStar(ctx, r*0.72, -r*0.64, r*0.22, sw)
  ctx.restore()
}

function sceneShootingStar(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI*0.18)
  ctx.lineWidth = sw
  // Star
  primStar(ctx, 0, 0, r*0.32, sw)
  // Trail
  for (let i = 1; i <= 5; i++) {
    ctx.globalAlpha = 1 - i*0.18
    ctx.lineWidth = sw * (1 - i*0.14)
    ctx.beginPath()
    ctx.moveTo(r*0.32 + r*0.18*i, -r*0.04*i)
    ctx.lineTo(r*0.32 + r*0.46*i, r*0.04*i)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

function sceneTelescope(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Tripod legs
  for (const a of [-0.5, 0.5]) {
    ctx.beginPath()
    ctx.moveTo(0, r*0.1)
    ctx.lineTo(Math.cos(Math.PI/2 + a)*r*0.8, r)
    ctx.stroke()
  }
  // Telescope tube (angled)
  ctx.save(); ctx.rotate(-Math.PI*0.32)
  roundRect(ctx, -r*0.52, -r*0.16, r*1.04, r*0.32, r*0.1)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Eyepiece end
  roundRect(ctx, r*0.46, -r*0.1, r*0.22, r*0.2, r*0.06)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Lens end
  ctx.beginPath(); ctx.arc(-r*0.52, 0, r*0.18, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.restore()
  ctx.restore()
}

function sceneCloud(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  const puffs = [[0, 0, r*0.44], [r*0.4, r*0.1, r*0.34], [-r*0.38, r*0.1, r*0.3], [r*0.22, -r*0.22, r*0.3], [-r*0.18, -r*0.18, r*0.26]]
  for (const [px, py, pr] of puffs) {
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill()
  }
  for (const [px, py, pr] of puffs) {
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.stroke()
  }
  // Stars inside/beside
  primStar(ctx, r*0.08, r*0.12, r*0.14, sw*0.8)
  ctx.restore()
}

function sceneTRex(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw * 1.1
  // Body
  ctx.beginPath()
  ctx.moveTo(-r*0.2, r*0.1); ctx.lineTo(-r*0.2, -r*0.4)
  ctx.bezierCurveTo(-r*0.2, -r*0.7, r*0.4, -r*0.78, r*0.55, -r*0.52)
  ctx.lineTo(r*0.55, r*0.1); ctx.closePath()
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Neck+head
  ctx.beginPath()
  ctx.moveTo(r*0.2, -r*0.52)
  ctx.bezierCurveTo(r*0.1, -r*0.8, r*0.3, -r*0.96, r*0.58, -r*0.9)
  ctx.bezierCurveTo(r*0.82, -r*0.86, r*0.88, -r*0.64, r*0.82, -r*0.5)
  ctx.lineTo(r*0.55, -r*0.52); ctx.closePath()
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Jaw
  ctx.beginPath()
  ctx.moveTo(r*0.58, -r*0.9)
  ctx.bezierCurveTo(r*0.92, -r*0.9, r*1.0, -r*0.72, r*0.95, -r*0.6)
  ctx.lineTo(r*0.82, -r*0.5); ctx.stroke()
  // Eye
  ctx.beginPath(); ctx.arc(r*0.68, -r*0.74, r*0.07, 0, Math.PI*2)
  ctx.fillStyle = '#1a1a1a'; ctx.fill()
  // Tiny arms
  ctx.beginPath()
  ctx.moveTo(r*0.38, -r*0.44)
  ctx.lineTo(r*0.62, -r*0.32)
  ctx.lineTo(r*0.54, -r*0.2)
  ctx.stroke()
  // Tail
  ctx.beginPath()
  ctx.moveTo(-r*0.2, r*0.05)
  ctx.bezierCurveTo(-r*0.6, r*0.12, -r*0.9, r*0.0, -r*1.05, -r*0.25)
  ctx.stroke()
  // Legs
  for (const [lx, lslant] of [[r*0.08, -0.06], [r*0.38, 0.08]]) {
    ctx.beginPath(); ctx.moveTo(lx, r*0.1); ctx.lineTo(lx + lslant*r, r*0.68)
    ctx.stroke()
    ctx.beginPath(); ctx.moveTo(lx + lslant*r, r*0.68)
    ctx.lineTo(lx + lslant*r + r*0.18, r*0.64); ctx.stroke()
  }
  ctx.restore()
}

function scenePterodactyl(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Wings (two bezier arcs)
  ctx.beginPath()
  ctx.moveTo(-r, r*0.1); ctx.bezierCurveTo(-r*0.6, -r*0.7, -r*0.1, -r*0.8, 0, 0)
  ctx.bezierCurveTo(r*0.1, -r*0.8, r*0.6, -r*0.7, r, r*0.1)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Body
  ctx.beginPath(); ctx.ellipse(0, r*0.05, r*0.18, r*0.28, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Head + beak
  ctx.beginPath(); ctx.arc(0, -r*0.24, r*0.18, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-r*0.14, -r*0.26); ctx.lineTo(-r*0.52, -r*0.36); ctx.lineTo(-r*0.14, -r*0.18)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.restore()
}

function sceneFern(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Main stem
  ctx.beginPath()
  ctx.moveTo(0, r); ctx.bezierCurveTo(r*0.1, r*0.4, -r*0.08, 0, 0, -r)
  ctx.lineWidth = sw * 1.6; ctx.stroke(); ctx.lineWidth = sw
  // Frond pairs
  for (let i = 0; i < 5; i++) {
    const t = i / 4
    const sy = r - r*2*t
    const sx = -r*0.06*t
    for (const s of [-1, 1]) {
      const len = r * (0.55 - t*0.22)
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.bezierCurveTo(sx + s*len*0.5, sy - r*0.18, sx + s*len*0.9, sy - r*0.06, sx + s*len, sy + r*0.04)
      ctx.stroke()
    }
  }
  ctx.restore()
}

function sceneVolcano(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Mountain body
  ctx.beginPath()
  ctx.moveTo(-r, r); ctx.lineTo(-r*0.28, -r*0.62); ctx.lineTo(r*0.28, -r*0.62); ctx.lineTo(r, r)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Crater rim
  ctx.beginPath(); ctx.ellipse(0, -r*0.62, r*0.32, r*0.1, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Lava/smoke puffs
  for (const [px, py, pr] of [[0, -r*0.88, r*0.2], [r*0.18, -r*1.02, r*0.15], [-r*0.16, -r*1.0, r*0.13]]) {
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  // Snow line / rock lines
  ctx.beginPath()
  ctx.moveTo(-r*0.2, -r*0.3); ctx.lineTo(r*0.2, -r*0.3)
  ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1
  ctx.restore()
}

function sceneCastleTower(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Tower body
  roundRect(ctx, -r*0.38, r*0.05, r*0.76, r*0.95, r*0.04)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Battlements (3 merlons)
  for (const bx of [-r*0.28, 0, r*0.28]) {
    roundRect(ctx, bx - r*0.1, -r*0.18, r*0.2, r*0.24, r*0.03)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  // Door arch
  ctx.beginPath()
  ctx.arc(0, r*0.62, r*0.18, Math.PI, 0)
  ctx.lineTo(r*0.18, r); ctx.lineTo(-r*0.18, r); ctx.closePath()
  ctx.fillStyle = '#e8e8e8'; ctx.fill(); ctx.stroke()
  // Windows (2)
  for (const wy of [r*0.15, r*0.42]) {
    ctx.beginPath()
    ctx.arc(0, wy, r*0.1, Math.PI, 0)
    ctx.lineTo(r*0.1, wy + r*0.14); ctx.lineTo(-r*0.1, wy + r*0.14); ctx.closePath()
    ctx.fillStyle = '#e8e8e8'; ctx.fill(); ctx.stroke()
  }
  // Flag
  ctx.beginPath(); ctx.moveTo(0, -r*0.18); ctx.lineTo(0, -r*0.75); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, -r*0.75); ctx.lineTo(r*0.36, -r*0.6); ctx.lineTo(0, -r*0.46)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.restore()
}

function sceneFairy(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Wings
  for (const [wx, wy, wr, wa] of [[-r*0.48, -r*0.2, r*0.36, 0.35], [r*0.48, -r*0.2, r*0.36, -0.35], [-r*0.32, r*0.08, r*0.24, 0.6], [r*0.32, r*0.08, r*0.24, -0.6]]) {
    ctx.save(); ctx.translate(wx, wy); ctx.rotate(wa)
    ctx.beginPath(); ctx.ellipse(0, 0, wr, wr*0.52, 0, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.lineWidth = sw*0.8; ctx.stroke()
    ctx.restore()
  }
  // Body
  ctx.beginPath(); ctx.ellipse(0, r*0.2, r*0.18, r*0.3, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Head
  ctx.beginPath(); ctx.arc(0, -r*0.2, r*0.22, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Hair
  ctx.beginPath()
  ctx.moveTo(-r*0.22, -r*0.28)
  ctx.bezierCurveTo(-r*0.36, -r*0.46, -r*0.24, -r*0.6, -r*0.1, -r*0.54)
  ctx.stroke()
  // Eye dots
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s*r*0.08, -r*0.22, r*0.045, 0, Math.PI*2)
    ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  // Wand
  ctx.beginPath(); ctx.moveTo(r*0.22, r*0.0); ctx.lineTo(r*0.6, -r*0.52); ctx.stroke()
  primStar(ctx, r*0.62, -r*0.54, r*0.12, sw*0.9)
  ctx.restore()
}

function sceneRose(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.lineWidth = sw
  // Outer petals
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3
    ctx.save(); ctx.rotate(a)
    ctx.beginPath(); ctx.ellipse(0, -r*0.56, r*0.22, r*0.36, 0, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
    ctx.restore()
  }
  // Inner petals
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 + 0.3
    ctx.save(); ctx.rotate(a)
    ctx.beginPath(); ctx.ellipse(0, -r*0.34, r*0.16, r*0.24, 0, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
    ctx.restore()
  }
  // Center
  ctx.beginPath(); ctx.arc(0, 0, r*0.18, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  // Stem
  ctx.beginPath(); ctx.moveTo(0, r*0.0); ctx.lineTo(r*0.1, r*0.76); ctx.stroke()
  // Leaf
  ctx.beginPath()
  ctx.moveTo(r*0.08, r*0.44)
  ctx.bezierCurveTo(r*0.42, r*0.3, r*0.48, r*0.56, r*0.32, r*0.6)
  ctx.bezierCurveTo(r*0.16, r*0.64, r*0.06, r*0.52, r*0.08, r*0.44)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.restore()
}

// ─── Primitive shapes (reusable at any scale) ──────────────────────────────

function primStar(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const oa = (i * 4 * Math.PI / 5) - Math.PI / 2
    const ia = oa + Math.PI / 5
    i === 0 ? ctx.moveTo(Math.cos(oa)*r, Math.sin(oa)*r) : ctx.lineTo(Math.cos(oa)*r, Math.sin(oa)*r)
    ctx.lineTo(Math.cos(ia)*r*0.42, Math.sin(ia)*r*0.42)
  }
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.lineWidth = sw; ctx.stroke()
  ctx.restore()
}

function primSparkle(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); ctx.stroke()
  }
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a)*r*0.5, Math.sin(a)*r*0.5); ctx.stroke()
  }
  ctx.restore()
}

function primLeaf(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.moveTo(0, -r); ctx.bezierCurveTo(r, -r*0.5, r, r*0.5, 0, r)
  ctx.bezierCurveTo(-r, r*0.5, -r, -r*0.5, 0, -r)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.lineWidth = sw; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, -r*0.8); ctx.lineTo(0, r*0.8); ctx.stroke()
  ctx.restore()
}

function primFlower(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  const pr = r * 0.42
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3
    ctx.beginPath(); ctx.arc(Math.cos(a)*pr*1.3, Math.sin(a)*pr*1.3, pr, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  ctx.beginPath(); ctx.arc(0, 0, r*0.28, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.restore()
}

function primHeart(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.moveTo(0, r*0.38)
  ctx.bezierCurveTo(-r, -r*0.1, -r, -r, 0, -r*0.3)
  ctx.bezierCurveTo(r, -r, r, -r*0.1, 0, r*0.38)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.lineWidth = sw; ctx.stroke()
  ctx.restore()
}

function primShell(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  ctx.beginPath(); ctx.moveTo(0, r*0.55)
  for (let a = Math.PI*0.88; a <= Math.PI*2.12; a += 0.08) {
    ctx.lineTo(Math.cos(a)*r*0.82, Math.sin(a)*r*0.44)
  }
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(0, r*0.55)
    const a = Math.PI*1.5 + i*0.36
    ctx.lineTo(Math.cos(a)*r*0.82, Math.sin(a)*r*0.44); ctx.stroke()
  }
  ctx.restore()
}

function primFish(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  ctx.beginPath(); ctx.ellipse(-r*0.08, 0, r*0.62, r*0.4, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(r*0.5, 0); ctx.lineTo(r, -r*0.48); ctx.lineTo(r, r*0.48); ctx.closePath()
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.arc(-r*0.28, -r*0.1, r*0.1, 0, Math.PI*2); ctx.fillStyle = '#1a1a1a'; ctx.fill()
  ctx.restore()
}

function primWave(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  ctx.beginPath()
  ctx.moveTo(-r, r*0.18)
  ctx.bezierCurveTo(-r*0.5, -r*0.5, -r*0.1, -r*0.5, 0, 0)
  ctx.bezierCurveTo(r*0.1, r*0.5, r*0.5, r*0.5, r, -r*0.18)
  ctx.stroke(); ctx.restore()
}

function primPaw(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  ctx.beginPath(); ctx.ellipse(0, r*0.18, r*0.52, r*0.48, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  for (const [tx, ty] of [[-r*0.48, -r*0.28], [0, -r*0.52], [r*0.48, -r*0.28]]) {
    ctx.beginPath(); ctx.ellipse(tx, ty, r*0.2, r*0.26, 0, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

function primBone(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  ctx.beginPath(); ctx.rect(-r*0.68, -r*0.17, r*1.36, r*0.34)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  for (const [kx, ky] of [[-r*0.68, -r*0.3], [-r*0.68, r*0.3], [r*0.68, -r*0.3], [r*0.68, r*0.3]]) {
    ctx.beginPath(); ctx.arc(kx, ky, r*0.21, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

function primCrown(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.moveTo(-r, r*0.48); ctx.lineTo(-r, -r*0.28); ctx.lineTo(-r*0.42, r*0.12)
  ctx.lineTo(0, -r); ctx.lineTo(r*0.42, r*0.12); ctx.lineTo(r, -r*0.28); ctx.lineTo(r, r*0.48)
  ctx.closePath(); ctx.fillStyle = 'white'; ctx.fill(); ctx.lineWidth = sw; ctx.stroke()
  for (const gx of [-r*0.52, 0, r*0.52]) {
    ctx.beginPath(); ctx.arc(gx, r*0.14, r*0.1, 0, Math.PI*2); ctx.fillStyle = '#1a1a1a'; ctx.fill()
  }
  ctx.restore()
}

function primEgg(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy)
  ctx.beginPath(); ctx.ellipse(0, r*0.08, r*0.58, r*0.8, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.lineWidth = sw; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-r*0.22, -r*0.08); ctx.lineTo(0, r*0.18); ctx.lineTo(r*0.22, -r*0.08)
  ctx.stroke(); ctx.restore()
}

function primDinoFoot(ctx, cx, cy, r, sw) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineWidth = sw
  ctx.beginPath(); ctx.ellipse(0, r*0.28, r*0.48, r*0.38, 0, 0, Math.PI*2)
  ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  for (const [tx, ty, rot] of [[-r*0.38, -r*0.18, -0.3], [0, -r*0.52, 0], [r*0.38, -r*0.18, 0.3]]) {
    ctx.beginPath(); ctx.ellipse(tx, ty, r*0.18, r*0.3, rot, 0, Math.PI*2)
    ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke()
  }
  ctx.restore()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}
