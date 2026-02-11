/**
 * Convert WOFF2 to TTF
 * Usage: node scripts/woff2-to-ttf.mjs <input.woff2> <output.ttf>
 */
import { decompress } from 'wawoff2'
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: node scripts/woff2-to-ttf.mjs <input.woff2> <output.ttf>')
  process.exit(1)
}

const inputPath = path.resolve(args[0])
const outputPath = path.resolve(args[1])

console.log(`Converting WOFF2 to TTF...`)
console.log(`Input: ${inputPath}`)
console.log(`Output: ${outputPath}`)

const woff2Buffer = fs.readFileSync(inputPath)
const ttfBuffer = await decompress(woff2Buffer)

const outputDir = path.dirname(outputPath)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputPath, Buffer.from(ttfBuffer))
console.log(`Done! TTF size: ${(ttfBuffer.byteLength / 1024).toFixed(1)} KB`)
