// Run after deploying sticker images to production:
//   node scripts/create-sticker-product.js
const https = require('https')

const TOKEN    = '5TpWr9mZox2IFR0J1ZBP7nCZmLbk5hHmCkTex6aZ'
const STORE_ID = '18433262'
// Kiss-Cut Sticker Sheet 5.83"×8.27" — catalog variant ID
const CATALOG_VARIANT_ID = 12917
const SITE = 'https://maspronto.com'

const THEMES = [
  { key: 'space',          file: 'sticker_space.png',     name: 'Space' },
  { key: 'new_baby',       file: 'sticker_newbaby.png',   name: 'New Baby' },
  { key: 'school',         file: 'sticker_school.png',    name: 'First Day of School' },
  { key: 'holiday_beach',  file: 'sticker_holiday.png',   name: 'Beach Holiday' },
  { key: 'new_home',       file: 'sticker_newhome.png',   name: 'New Home' },
  { key: 'happy_birthday', file: 'sticker_birthday.png',  name: 'Birthday' },
  { key: 'christmas',      file: 'sticker_christmas.png', name: 'Christmas Advent' },
  { key: 'no_theme',       file: 'sticker_notheme.png',   name: 'No Theme' },
]

// Uses Printful v1 API — simpler file-by-URL format for sync product creation
function pfV1(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.printful.com',
      path,
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'X-PF-Store-Id': STORE_ID,
        'Content-Type': 'application/json',
      },
    }
    const req = https.request(options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.code >= 400) reject(new Error(`${parsed.code}: ${parsed.error?.message || data}`))
          else resolve(parsed)
        } catch { reject(new Error(`Parse error: ${data}`)) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function main() {
  console.log('Creating Kiss-Cut Sticker Sheet sync product (8 variants)...\n')

  const syncVariants = THEMES.map(theme => ({
    variant_id: CATALOG_VARIANT_ID,
    retail_price: '6.50',
    external_id: theme.key,
    files: [
      {
        placement: 'default',
        url: `${SITE}/images/stickers/${theme.file}`,
      },
    ],
  }))

  const res = await pfV1('/store/products', 'POST', {
    sync_product: {
      name: 'Pronto Path Sticker Sheet',
      description: 'Kiss-Cut Sticker Sheet 5.83"×8.27" — 30 themed stickers',
    },
    sync_variants: syncVariants,
  })

  const product = res.result
  console.log(`✓ Sync product created — ID: ${product.id}`)
  console.log(`  Variants: ${product.variants}\n`)

  // Fetch variant details
  const detail = await pfV1(`/store/products/${product.id}`)
  const variants = detail.result.sync_variants || []

  console.log('--- COPY THIS BLOCK INTO lib/printful.js ---')
  console.log('const STICKER_VARIANTS = {')
  for (const v of variants) {
    console.log(`  '${v.external_id}': '${v.id}',`)
  }
  console.log('}')
  console.log(`\nAdd to .env.local:\nPRINTFUL_STICKER_PRODUCT_ID=${product.id}`)
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
