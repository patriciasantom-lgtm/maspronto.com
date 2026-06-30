// One-time script: renders each map PDF to a PNG thumbnail for web display.
// Uses the same Puppeteer + sharp approach as convertCharacters.js.
// Run with: node scripts/convertMaps.js
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mapsDir = path.join(__dirname, '..', 'public', 'images', 'maps')
const outDir  = path.join(mapsDir, 'thumbnails')

const MAPS = ['space', 'new_baby', 'school', 'holiday_beach', 'new_home', 'happy_birthday', 'christmas', 'no_theme']

// Viewport: 800×1000
// Chrome PDF viewer at this size: toolbar ≈43px top, sidebar ≈265px left
// Content area: left=265, top=43, width=535, height=957
const CROP = { left: 265, top: 43, width: 535, height: 957 }

const executablePath = process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome'

async function run() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  for (const map of MAPS) {
    const pdfPath = path.join(mapsDir, `${map}.pdf`)
    const outPath = path.join(outDir, `${map}.png`)

    if (!fs.existsSync(pdfPath)) {
      console.warn(`Skipping ${map}: ${map}.pdf not found`)
      continue
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 1 })

    const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/')
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 20000 })
    await new Promise(r => setTimeout(r, 1500))

    const raw = await page.screenshot({ type: 'png' })

    const cropped = await sharp(raw).extract(CROP).toBuffer()

    await sharp(cropped)
      .trim({ threshold: 50 })
      .flatten({ background: '#ffffff' })
      .toFile(outPath)

    console.log(`Converted: ${map}.pdf → thumbnails/${map}.png`)
    await page.close()
  }

  await browser.close()
  console.log('All maps converted.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
