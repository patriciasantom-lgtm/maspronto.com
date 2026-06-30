// One-time script: renders each map PDF to a JPEG thumbnail for the browser preview.
// Run with: node scripts/generate-map-thumbs.js
import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mapsDir = path.join(__dirname, '..', 'public', 'images', 'maps')

const THEME_FILES = {
  space:          'space.pdf',
  new_baby:       'new_baby.pdf',
  school:         'school.pdf',
  holiday_beach:  'holiday_beach.pdf',
  new_home:       'new_home.pdf',
  happy_birthday: 'happy_birthday.pdf',
  christmas_map:  'christmas.pdf',
  no_theme:       'no_theme.pdf',
}

const executablePath = process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome'

async function run() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  for (const [themeId, pdfFile] of Object.entries(THEME_FILES)) {
    const pdfPath = path.join(mapsDir, pdfFile)
    const outPath = path.join(mapsDir, `${themeId}.jpg`)

    if (!fs.existsSync(pdfPath)) {
      console.warn(`Skipping ${themeId}: ${pdfFile} not found`)
      continue
    }
    if (fs.existsSync(outPath)) {
      console.log(`Skipping ${themeId}: ${themeId}.jpg already exists`)
      continue
    }

    const page = await browser.newPage()
    // A3 at 96dpi = 1122×1587px; render at 1.5x for quality
    await page.setViewport({ width: 1122, height: 1587, deviceScaleFactor: 1 })

    const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/')
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 })
    // Give the PDF viewer time to render
    await page.waitForTimeout?.(1500) || await new Promise(r => setTimeout(r, 1500))

    const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 90 })
    fs.writeFileSync(outPath, screenshotBuffer)
    console.log(`Generated: ${themeId}.jpg`)
    await page.close()
  }

  await browser.close()
  console.log('Done.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
