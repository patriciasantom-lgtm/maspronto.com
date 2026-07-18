const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '../public/images/iconos/colour/iconcolour_notheme.png')
const APP_DIR = path.join(__dirname, '../app')

async function pngBuffer(size) {
  return sharp(SRC)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length
  const headerSize = 6 + count * 16
  const sizes = pngBuffers.map(b => b.length)
  const offsets = []
  let offset = headerSize
  for (const s of sizes) { offsets.push(offset); offset += s }

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)       // reserved
  header.writeUInt16LE(1, 2)       // type: 1 = ICO
  header.writeUInt16LE(count, 4)   // number of images

  const icoSizes = [16, 32, 48]
  for (let i = 0; i < count; i++) {
    const base = 6 + i * 16
    const s = icoSizes[i]
    header.writeUInt8(s === 256 ? 0 : s, base)      // width (0 = 256)
    header.writeUInt8(s === 256 ? 0 : s, base + 1)  // height
    header.writeUInt8(0, base + 2)                   // color count
    header.writeUInt8(0, base + 3)                   // reserved
    header.writeUInt16LE(1, base + 4)                // planes
    header.writeUInt16LE(32, base + 6)               // bit count
    header.writeUInt32LE(sizes[i], base + 8)         // bytes in resource
    header.writeUInt32LE(offsets[i], base + 12)      // image offset
  }

  return Buffer.concat([header, ...pngBuffers])
}

async function main() {
  const [px16, px32, px48] = await Promise.all([pngBuffer(16), pngBuffer(32), pngBuffer(48)])

  // favicon.ico (16 + 32 + 48)
  const ico = buildIco([px16, px32, px48])
  fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), ico)
  console.log('✓ app/favicon.ico')

  // icon.png (512x512)
  const px512 = await pngBuffer(512)
  fs.writeFileSync(path.join(APP_DIR, 'icon.png'), px512)
  console.log('✓ app/icon.png (512x512)')

  // apple-icon.png (180x180)
  const px180 = await pngBuffer(180)
  fs.writeFileSync(path.join(APP_DIR, 'apple-icon.png'), px180)
  console.log('✓ app/apple-icon.png (180x180)')
}

main().catch(e => { console.error(e); process.exit(1) })
