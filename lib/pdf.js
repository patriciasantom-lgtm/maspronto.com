import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const isDev = process.env.NODE_ENV !== 'production'

async function getBrowser() {
  if (isDev) {
    // In development, use locally installed Chrome
    const executablePath = process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome'

    return puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }

  // In production (Vercel), use @sparticuz/chromium
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })
}

// Generate A3 PDF of the map by rendering the /render page
export async function generateMapPdf(configBlobUrl, siteUrl) {
  const browser = await getBrowser()
  try {
    const page = await browser.newPage()

    // A3 at 96 DPI: 1122 x 1587 px
    await page.setViewport({ width: 1122, height: 1587, deviceScaleFactor: 2 })

    const renderUrl = `${siteUrl}/render?configUrl=${encodeURIComponent(configBlobUrl)}`
    await page.goto(renderUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    // Wait for canvas to be fully rendered
    await page.waitForSelector('#map-canvas', { timeout: 10000 })
    await page.waitForFunction(
      () => document.getElementById('map-canvas')?.dataset.ready === 'true',
      { timeout: 15000 }
    )

    const pdfBuffer = await page.pdf({
      format: 'A3',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

// Generate A4 PDF of the sticker sheet
export async function generateStickerPdf(theme, siteUrl) {
  const browser = await getBrowser()
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })

    const renderUrl = `${siteUrl}/render/stickers?theme=${encodeURIComponent(theme)}`
    await page.goto(renderUrl, { waitUntil: 'networkidle0', timeout: 20000 })
    await page.waitForSelector('#sticker-sheet', { timeout: 8000 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
