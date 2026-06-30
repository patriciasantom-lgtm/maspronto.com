// One-time script: renders each character PDF to a PNG for web display.
// Takes a full screenshot (Puppeteer clip doesn't capture Chrome's PDF renderer layer),
// then uses sharp.extract() to crop out the sidebar and toolbar chrome.
// Run with: node scripts/convertCharacters.js
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const charsDir = path.join(__dirname, '..', 'public', 'images', 'characters')
const outDir   = path.join(charsDir, 'png')

const CHARACTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// Viewport: 800×1000
// At this size Chrome PDF viewer shows: toolbar ≈35px top, sidebar ≈265px left
// Content area: left=265, top=35, width=535, height=965
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

  for (const char of CHARACTERS) {
    const pdfPath = path.join(charsDir, `${char}.pdf`)
    const outPath = path.join(outDir, `${char}.png`)

    if (!fs.existsSync(pdfPath)) {
      console.warn(`Skipping ${char}: ${char}.pdf not found`)
      continue
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 1 })

    const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/')
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 20000 })
    await new Promise(r => setTimeout(r, 1500))

    // Full screenshot (Puppeteer clip can't reach Chrome's sandboxed PDF renderer layer)
    const raw = await page.screenshot({ type: 'png' })

    // Step 1: crop out sidebar (left) and toolbar (top)
    const cropped = await sharp(raw).extract(CROP).toBuffer()

    // Step 2: trim any remaining dark strips (toolbar remnant, dark bg below page)
    // After extract, corner pixel = dark viewer background → trim removes it from edges
    await sharp(cropped)
      .trim({ threshold: 50 })
      .flatten({ background: '#ffffff' })
      .toFile(outPath)

    console.log(`Converted: ${char}.pdf → png/${char}.png`)
    await page.close()
  }

  await browser.close()
  console.log('All characters converted.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
