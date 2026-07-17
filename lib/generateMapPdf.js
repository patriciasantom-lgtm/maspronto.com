import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import sharp from 'sharp'
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

export async function generateMapPdfFromConfig({ theme, character, title, subtitle }) {
  const folder = THEME_FOLDER[theme] ?? 'nothemepath'
  const prefix = THEME_PREFIX[theme] ?? 'notheme'
  const isChristmas = theme === 'christmas'
  const imageName = isChristmas ? 'christmas' : `${prefix}-${character}`
  const imagePath = path.join(process.cwd(), 'public', 'images', 'maps', folder, `${imageName}.png`)

  // Resize combined PNG to standard page dimensions
  const pngBuffer = await sharp(imagePath)
    .resize(PAGE_W, PAGE_H, { fit: 'fill' })
    .png()
    .toBuffer()

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  const mapImage = await pdfDoc.embedPng(pngBuffer)
  page.drawImage(mapImage, { x: 0, y: 0, width: PAGE_W, height: PAGE_H })

  const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const pos = MAP_OVERLAY_POSITIONS[theme] ?? MAP_OVERLAY_POSITIONS.no_theme

  const centeredX = (text, font, size, maxWidth) => {
    const width = Math.min(font.widthOfTextAtSize(text, size), maxWidth)
    return (PAGE_W - width) / 2
  }

  if (title) {
    const t = title.slice(0, 80)
    page.drawText(t, {
      x: centeredX(t, boldFont, pos.title.size, pos.title.width),
      y: pos.title.y,
      size: pos.title.size,
      font: boldFont,
      color: INK,
      maxWidth: pos.title.width,
      lineHeight: pos.title.size * 1.2,
    })
  }

  if (subtitle) {
    const s = subtitle.slice(0, 120)
    page.drawText(s, {
      x: centeredX(s, regularFont, pos.subtitle.size, pos.subtitle.width),
      y: pos.subtitle.y,
      size: pos.subtitle.size,
      font: regularFont,
      color: INK,
      maxWidth: pos.subtitle.width,
      lineHeight: pos.subtitle.size * 1.3,
    })
  }

  return Buffer.from(await pdfDoc.save())
}

// Generates a PNG version of the same map (with title/subtitle overlay,
// centered horizontally) for Printful, which only accepts PNG/JPEG/SVG
// as print files — never PDF.
//
// Font is embedded as base64 in the SVG so the overlay renders correctly
// in serverless environments (e.g. Vercel) where librsvg has no access to
// system fonts like Helvetica/Arial.
let _geistFontB64 = null
function loadGeistFont() {
  if (!_geistFontB64) {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Geist-Regular.ttf')
    _geistFontB64 = fs.readFileSync(fontPath).toString('base64')
  }
  return _geistFontB64
}

export async function generateMapPngFromConfig({ theme, character, title, subtitle }) {
  const folder = THEME_FOLDER[theme] ?? 'nothemepath'
  const prefix = THEME_PREFIX[theme] ?? 'notheme'
  const isChristmas = theme === 'christmas'
  const imageName = isChristmas ? 'christmas' : `${prefix}-${character}`
  const imagePath = path.join(process.cwd(), 'public', 'images', 'maps', folder, `${imageName}.png`)
  const pos = MAP_OVERLAY_POSITIONS[theme] ?? MAP_OVERLAY_POSITIONS.no_theme

  const escapeXml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // PDF coordinates are bottom-left origin; SVG/image coordinates are top-left.
  const titleY    = PAGE_H - pos.title.y
  const subtitleY = PAGE_H - pos.subtitle.y

  // Embed font as base64 data URI so librsvg doesn't need system fonts.
  const fontB64  = loadGeistFont()
  const fontFace = `@font-face{font-family:'Geist';src:url('data:font/truetype;base64,${fontB64}');font-weight:normal;}`

  const svgParts = [
    `<svg width="${PAGE_W}" height="${PAGE_H}" xmlns="http://www.w3.org/2000/svg">`,
    `<defs><style>${fontFace}</style></defs>`,
  ]
  if (title) {
    svgParts.push(
      `<text x="${PAGE_W / 2}" y="${titleY}" text-anchor="middle" font-family="Geist, sans-serif" font-size="${pos.title.size}" fill="#1A1A1A">${escapeXml(title.slice(0, 80))}</text>`
    )
  }
  if (subtitle) {
    svgParts.push(
      `<text x="${PAGE_W / 2}" y="${subtitleY}" text-anchor="middle" font-family="Geist, sans-serif" font-size="${pos.subtitle.size}" fill="#1A1A1A">${escapeXml(subtitle.slice(0, 120))}</text>`
    )
  }
  svgParts.push('</svg>')
  const svgOverlay = Buffer.from(svgParts.join(''))

  return sharp(imagePath)
    .resize(PAGE_W, PAGE_H, { fit: 'fill' })
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer()
}
