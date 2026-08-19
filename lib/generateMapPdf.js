import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import sharp from 'sharp'
import { parse as opentypeParse } from 'opentype.js/dist/opentype.mjs'
import fs from 'fs'
import path from 'path'
import { splitToTwoLines, fitAndWrapText } from './textLayout.js'

// PDF page dimensions in points (matches existing calibration).
// 1190 × 1684 pt ≈ A3 portrait at 144 DPI equivalent.
const PAGE_W = 1190
const PAGE_H = 1684

const THEME_FOLDER = {
  space:          'spacepath',
  new_baby:       'newbabypath',
  school:         'schoolpath',
  holiday_beach:  'holidaypath',
  new_home:       'newhomepath',
  happy_birthday: 'birthdaypath',
  christmas:      'christmaspath',
  no_theme:       'nothemepath',
}

const THEME_PREFIX = {
  space:          'space',
  new_baby:       'newbaby',
  school:         'school',
  holiday_beach:  'holiday',
  new_home:       'newhome',
  happy_birthday: 'birthday',
  christmas:      'christmas',
  no_theme:       'notheme',
}

// Maps config.font → TTF filename in public/fonts/
// Caveat-Bold.ttf is a TrueType variable font covering wght 400–700.
const TITLE_FONT_FILE = {
  'Bubblegum Sans': 'BubblegumSans-Regular.ttf',
  'Pacifico':       'Pacifico-Regular.ttf',
  'Fredoka One':    'FredokaOne-Regular.ttf',
  'Caveat':         'Caveat-Bold.ttf',
  'Righteous':      'Righteous-Regular.ttf',
  'Lilita One':     'LilitaOne-Regular.ttf',
}

// Module-level caches: read and parse each font file once per Lambda warm start
const _fontBufferCache = {}
function loadFontBuffer(filename) {
  if (!_fontBufferCache[filename]) {
    _fontBufferCache[filename] = fs.readFileSync(
      path.join(process.cwd(), 'public', 'fonts', filename)
    )
  }
  return _fontBufferCache[filename]
}

function getTitleFontBuffer(fontId) {
  const filename = TITLE_FONT_FILE[fontId] ?? TITLE_FONT_FILE['Bubblegum Sans']
  return loadFontBuffer(filename)
}

// Parsed opentype.Font cache (expensive to parse, reuse across requests)
const _otfCache = {}
function getOtfFont(filename) {
  if (!_otfCache[filename]) {
    const buf = loadFontBuffer(filename)
    // opentype.js requires a plain ArrayBuffer, not a Node Buffer
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    _otfCache[filename] = opentypeParse(ab)
  }
  return _otfCache[filename]
}

function getTitleOtfFont(fontId) {
  const filename = TITLE_FONT_FILE[fontId] ?? TITLE_FONT_FILE['Bubblegum Sans']
  console.log(`[generateMapPng] font="${fontId}" → file="${filename}"`)
  return getOtfFont(filename)
}

// Some librsvg versions silently drop <path> elements whose d attribute contains Q
// (quadratic bezier) commands — glyphs like 'e' in Bubblegum Sans use only Q and
// disappear entirely. Converting Q → equivalent C (cubic) fixes the rendering.
function toCubicPathData(path, dec = 2) {
  const f = n => n.toFixed(dec)
  let px = 0, py = 0
  return path.commands.map(cmd => {
    switch (cmd.type) {
      case 'M': px = cmd.x; py = cmd.y; return `M${f(cmd.x)} ${f(cmd.y)}`
      case 'L': px = cmd.x; py = cmd.y; return `L${f(cmd.x)} ${f(cmd.y)}`
      case 'C': px = cmd.x; py = cmd.y
        return `C${f(cmd.x1)} ${f(cmd.y1)} ${f(cmd.x2)} ${f(cmd.y2)} ${f(cmd.x)} ${f(cmd.y)}`
      case 'Q': {
        const cp1x = px + (2/3) * (cmd.x1 - px), cp1y = py + (2/3) * (cmd.y1 - py)
        const cp2x = cmd.x + (2/3) * (cmd.x1 - cmd.x), cp2y = cmd.y + (2/3) * (cmd.y1 - cmd.y)
        px = cmd.x; py = cmd.y
        return `C${f(cp1x)} ${f(cp1y)} ${f(cp2x)} ${f(cp2y)} ${f(cmd.x)} ${f(cmd.y)}`
      }
      case 'Z': return 'Z'
      default: return ''
    }
  }).filter(Boolean).join(' ')
}

// Render a text string as individual per-character <path> elements, centered on pageW.
// Per-character rendering avoids two separate librsvg bugs:
//   1. Long d attributes get truncated mid-string (entire characters disappear)
//   2. Q commands in glyph paths are silently dropped
// Path is generated at x=0 (avoids opentype.js NaN bug at non-zero x offsets);
// position is applied via transform="translate(...)".
function textLineToSvgPaths(otfFont, text, pageW, y, size, fill = '#1A1A1A') {
  const totalW = otfFont.getAdvanceWidth(text, size)
  const startX = Math.round((pageW - totalW) / 2)
  let cx = 0
  return [...text].map(ch => {
    const d = toCubicPathData(otfFont.getPath(ch, 0, 0, size))
    const tx = startX + Math.round(cx)
    cx += otfFont.getAdvanceWidth(ch, size)
    return d ? `<path transform="translate(${tx},${y})" d="${d}" fill="${fill}"/>` : ''
  }).join('')
}

// Single-line render with font scaling if text exceeds maxW.
function textToSvgPath(otfFont, text, pageW, y, fontSize, fill = '#1A1A1A', maxW = pageW * 0.85) {
  let size = fontSize
  const w = otfFont.getAdvanceWidth(text, size)
  if (w > maxW) size = Math.floor(size * (maxW / w))
  return textLineToSvgPaths(otfFont, text, pageW, y, size, fill)
}

// splitToTwoLines and fitAndWrapText are imported from ./textLayout.js —
// shared with the browser preview (Canvas API) so both stay in sync.

// Render multiple lines as per-character SVG paths, each line centered.
function multilineTextToSvgPaths(otfFont, lines, size, pageW, startY, lineHeight, fill = '#1A1A1A') {
  return lines.map((line, i) =>
    textLineToSvgPaths(otfFont, line, pageW, startY + i * lineHeight, size, fill)
  ).join('')
}

// Text overlay positions in PDF points (origin: bottom-left).
// Adjust via /admin/calibrate once new assets are in place.
export const MAP_OVERLAY_POSITIONS = {
  space: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
  new_baby: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
  school: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
  holiday_beach: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
  new_home: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
  happy_birthday: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
  christmas: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
  no_theme: {
    title:    { x: 95, y: 1580, width: 1000, size: 52 },
    subtitle: { x: 95, y: 1540, width: 1000, size: 24 },
  },
}

const INK = rgb(0.102, 0.102, 0.102) // #1A1A1A

export async function generateMapPdfFromConfig({ theme, character, title, subtitle, font }) {
  const folder = THEME_FOLDER[theme] ?? 'nothemepath'
  const prefix = THEME_PREFIX[theme] ?? 'notheme'
  const isChristmas = theme === 'christmas'
  const imageName = isChristmas ? 'christmas' : `${prefix}-${character}`
  const imagePath = path.join(process.cwd(), 'public', 'images', 'maps', folder, `${imageName}.png`)

  const pngBuffer = await sharp(imagePath)
    .resize(PAGE_W, PAGE_H, { fit: 'fill' })
    .png()
    .toBuffer()

  const pdfDoc = await PDFDocument.create()
  // Required for embedFont() to accept custom TTF bytes — without this, embedFont
  // throws "no fontkit instance found" and silently falls back to HelveticaBold,
  // which is why the chosen title font never appeared in the delivered PDF.
  pdfDoc.registerFontkit(fontkit)
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  const mapImage = await pdfDoc.embedPng(pngBuffer)
  page.drawImage(mapImage, { x: 0, y: 0, width: PAGE_W, height: PAGE_H })

  // Embed the client's chosen title font; fall back to HelveticaBold if needed
  let titleFont
  try {
    const titleFontBytes = getTitleFontBuffer(font || 'Bubblegum Sans')
    titleFont = await pdfDoc.embedFont(titleFontBytes, { subset: true })
  } catch (err) {
    console.error('[generateMapPdf] embedFont failed, falling back to HelveticaBold:', err)
    titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  }
  const subtitleFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pos = MAP_OVERLAY_POSITIONS[theme] ?? MAP_OVERLAY_POSITIONS.no_theme

  // 70% of page width — identical to generateMapPngFromConfig so wrap decisions match.
  const TITLE_MAX_W = Math.round(PAGE_W * 0.70)

  let titleLineCount = 1
  let titleActualSize = pos.title.size

  if (title) {
    const t = title.slice(0, 24)
    const { lines, size } = fitAndWrapText(
      t,
      TITLE_MAX_W,
      pos.title.size,
      18,
      (text, sz) => titleFont.widthOfTextAtSize(text, sz)
    )
    titleLineCount = lines.length
    titleActualSize = size
    const lineHeight = Math.round(size * 1.25)

    lines.forEach((line, i) => {
      const lineW = titleFont.widthOfTextAtSize(line, size)
      page.drawText(line, {
        x: (PAGE_W - lineW) / 2,
        // pdf-lib is bottom-left origin: subtract lineHeight per subsequent line
        y: pos.title.y - i * lineHeight,
        size,
        font: titleFont,
        color: INK,
      })
    })
  }

  if (subtitle) {
    const s = subtitle.slice(0, 24)

    // Mirrors generateMapPngFromConfig: push subtitle below the last title line.
    // PDF Y is bottom-left, so subtracting moves the text downward on the page.
    const titleLineHeight = Math.round(titleActualSize * 1.25)
    const dynamicSubtitleY = titleLineCount > 1
      ? pos.title.y - (titleLineCount - 1) * titleLineHeight - Math.round(pos.subtitle.size * 1.8)
      : pos.subtitle.y

    // Scale subtitle down if it exceeds max width (no wrapping for subtitle line)
    let subSize = pos.subtitle.size
    const rawSubW = subtitleFont.widthOfTextAtSize(s, subSize)
    if (rawSubW > TITLE_MAX_W) subSize = Math.floor(subSize * (TITLE_MAX_W / rawSubW))

    const scaledSubW = subtitleFont.widthOfTextAtSize(s, subSize)
    page.drawText(s, {
      x: (PAGE_W - scaledSubW) / 2,
      y: dynamicSubtitleY,
      size: subSize,
      font: subtitleFont,
      color: INK,
    })
  }

  return Buffer.from(await pdfDoc.save())
}

// Generates a PNG for Printful (only accepts PNG/JPEG/SVG, never PDF).
// Text is converted to SVG <path> elements via opentype.js so the output
// is independent of librsvg's font-loading support or any system fonts.
export async function generateMapPngFromConfig({ theme, character, title, subtitle, font }) {
  const folder = THEME_FOLDER[theme] ?? 'nothemepath'
  const prefix = THEME_PREFIX[theme] ?? 'notheme'
  const isChristmas = theme === 'christmas'
  const imageName = isChristmas ? 'christmas' : `${prefix}-${character}`
  const imagePath = path.join(process.cwd(), 'public', 'images', 'maps', folder, `${imageName}.png`)
  const pos = MAP_OVERLAY_POSITIONS[theme] ?? MAP_OVERLAY_POSITIONS.no_theme

  // PDF coordinates are bottom-left origin; SVG/image coordinates are top-left.
  const titleY    = PAGE_H - pos.title.y
  const subtitleY = PAGE_H - pos.subtitle.y

  const titleFontId = font || 'Bubblegum Sans'
  const titleOtf = getTitleOtfFont(titleFontId)

  // Geist for subtitle; fall back to title font if file is missing
  let subtitleOtf
  try {
    subtitleOtf = getOtfFont('Geist-Regular.ttf')
  } catch {
    console.warn('[generateMapPng] Geist-Regular.ttf not found — using title font for subtitle')
    subtitleOtf = titleOtf
  }

  // 70% of page width (~833px on 1190px canvas) keeps centered text clear of side
  // illustrations. Centered 833px text spans x=178–1011, safely inside the crayon/
  // pencil decorations that start at ~x=140 (left) and ~x=1020 (right).
  const TITLE_MAX_W = Math.round(PAGE_W * 0.70)

  const svgParts = [`<svg width="${PAGE_W}" height="${PAGE_H}" xmlns="http://www.w3.org/2000/svg">`]

  let titleLineCount = 1
  let titleActualSize = pos.title.size

  if (title) {
    const t = title.slice(0, 24)
    const { lines, size } = fitAndWrapText(t, TITLE_MAX_W, pos.title.size, 18, (text, sz) => titleOtf.getAdvanceWidth(text, sz))
    titleLineCount = lines.length
    titleActualSize = size
    console.log(`[generateMapPng] title wrapped to ${lines.length} line(s) at ${size}pt: ${JSON.stringify(lines)}`)
    const lineHeight = Math.round(size * 1.25)
    svgParts.push(multilineTextToSvgPaths(titleOtf, lines, size, PAGE_W, titleY, lineHeight))
  }

  if (subtitle) {
    const s = subtitle.slice(0, 24)
    // Push subtitle down when title wraps to avoid overlap
    const titleLineHeight = Math.round(titleActualSize * 1.25)
    const dynamicSubtitleY = titleLineCount > 1
      ? titleY + (titleLineCount - 1) * titleLineHeight + Math.round(pos.subtitle.size * 1.8)
      : subtitleY
    svgParts.push(textToSvgPath(subtitleOtf, s, PAGE_W, dynamicSubtitleY, pos.subtitle.size))
  }

  svgParts.push('</svg>')
  const svgOverlay = Buffer.from(svgParts.join(''))

  return sharp(imagePath)
    .resize(PAGE_W, PAGE_H, { fit: 'fill' })
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer()
}
