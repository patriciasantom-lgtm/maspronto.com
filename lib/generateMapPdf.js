import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import sharp from 'sharp'
import { parse as opentypeParse } from 'opentype.js/dist/opentype.mjs'
import fs from 'fs'
import path from 'path'

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

// Convert a text string to an SVG element, centered horizontally.
// Path is always generated at x=0 to avoid an opentype.js NaN bug that
// triggers for some fonts/kerning pairs when x is non-zero. Translation
// is applied via an SVG <g transform> instead.
function textToSvgPath(otfFont, text, pageW, y, fontSize, fill = '#1A1A1A', maxW = pageW * 0.88) {
  let size = fontSize

  // Measure visual extents at origin to get true glyph bounds
  const testPath = otfFont.getPath(text, 0, 0, size)
  const bbox = testPath.getBoundingBox()
  const visualW = bbox.x2 - bbox.x1

  if (visualW > maxW) {
    size = Math.floor(size * (maxW / visualW))
  }

  // Re-measure at final size
  const scaledPath = otfFont.getPath(text, 0, 0, size)
  const scaledBbox = scaledPath.getBoundingBox()
  const scaledVisualW = scaledBbox.x2 - scaledBbox.x1

  // Center using visual bounding box; subtract x1 to account for left-side bearing
  const tx = Math.round((pageW - scaledVisualW) / 2 - scaledBbox.x1)

  // Always render at origin to avoid opentype.js NaN bug at non-zero x offsets
  const pathObj = otfFont.getPath(text, 0, 0, size)
  const d = pathObj.toPathData(2)
  return `<g transform="translate(${tx},${y})"><path d="${d}" fill="${fill}"/></g>`
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
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  const mapImage = await pdfDoc.embedPng(pngBuffer)
  page.drawImage(mapImage, { x: 0, y: 0, width: PAGE_W, height: PAGE_H })

  // Embed the client's chosen title font; fall back to HelveticaBold if needed
  let titleFont
  try {
    const titleFontBytes = getTitleFontBuffer(font || 'Bubblegum Sans')
    titleFont = await pdfDoc.embedFont(titleFontBytes, { subset: true })
  } catch {
    titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  }
  const subtitleFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pos = MAP_OVERLAY_POSITIONS[theme] ?? MAP_OVERLAY_POSITIONS.no_theme

  const centeredX = (text, f, size, maxWidth) => {
    const width = Math.min(f.widthOfTextAtSize(text, size), maxWidth)
    return (PAGE_W - width) / 2
  }

  if (title) {
    const t = title.slice(0, 80)
    page.drawText(t, {
      x: centeredX(t, titleFont, pos.title.size, pos.title.width),
      y: pos.title.y,
      size: pos.title.size,
      font: titleFont,
      color: INK,
      maxWidth: pos.title.width,
      lineHeight: pos.title.size * 1.2,
    })
  }

  if (subtitle) {
    const s = subtitle.slice(0, 120)
    page.drawText(s, {
      x: centeredX(s, subtitleFont, pos.subtitle.size, pos.subtitle.width),
      y: pos.subtitle.y,
      size: pos.subtitle.size,
      font: subtitleFont,
      color: INK,
      maxWidth: pos.subtitle.width,
      lineHeight: pos.subtitle.size * 1.3,
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
  const titleOtf    = getTitleOtfFont(titleFontId)
  const subtitleOtf = getOtfFont('Geist-Regular.ttf')

  const svgParts = [`<svg width="${PAGE_W}" height="${PAGE_H}" xmlns="http://www.w3.org/2000/svg">`]

  if (title) {
    svgParts.push(textToSvgPath(titleOtf, title.slice(0, 80), PAGE_W, titleY, pos.title.size))
  }
  if (subtitle) {
    svgParts.push(textToSvgPath(subtitleOtf, subtitle.slice(0, 120), PAGE_W, subtitleY, pos.subtitle.size))
  }

  svgParts.push('</svg>')
  const svgOverlay = Buffer.from(svgParts.join(''))

  return sharp(imagePath)
    .resize(PAGE_W, PAGE_H, { fit: 'fill' })
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer()
}
