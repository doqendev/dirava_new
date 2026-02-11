/**
 * Convert TTF/OTF/WOFF/WOFF2 font to Three.js TypeFace JSON format
 * Usage: node scripts/convert-font.mjs <input-font> <output.json>
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const fontkit = require('fontkit')
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: node scripts/convert-font.mjs <input-font> <output.json>')
  process.exit(1)
}

const inputPath = path.resolve(args[0])
const outputPath = path.resolve(args[1])

console.log(`Converting: ${inputPath}`)
console.log(`Output: ${outputPath}`)

const buffer = fs.readFileSync(inputPath)
const font = fontkit.create(buffer)

console.log(`Font family: ${font.familyName}`)
console.log(`Units per EM: ${font.unitsPerEm}`)

function r(v) {
  // Keep 2 decimal places for curve precision
  return Math.round(v * 100) / 100
}

function convertGlyph(glyph) {
  if (!glyph.path || !glyph.path.commands || glyph.path.commands.length === 0) {
    return null
  }

  let pathStr = ''
  for (const cmd of glyph.path.commands) {
    switch (cmd.command) {
      case 'moveTo':
        pathStr += `m ${r(cmd.args[0])} ${r(cmd.args[1])} `
        break
      case 'lineTo':
        pathStr += `l ${r(cmd.args[0])} ${r(cmd.args[1])} `
        break
      case 'quadraticCurveTo':
        pathStr += `q ${r(cmd.args[0])} ${r(cmd.args[1])} ${r(cmd.args[2])} ${r(cmd.args[3])} `
        break
      case 'bezierCurveTo':
        pathStr += `b ${r(cmd.args[0])} ${r(cmd.args[1])} ${r(cmd.args[2])} ${r(cmd.args[3])} ${r(cmd.args[4])} ${r(cmd.args[5])} `
        break
      case 'closePath':
        pathStr += 'z '
        break
    }
  }

  return {
    ha: r(glyph.advanceWidth || 0),
    x_min: r(glyph.bbox?.minX || 0),
    x_max: r(glyph.bbox?.maxX || 0),
    o: pathStr.trim(),
  }
}

const glyphs = {}
let glyphCount = 0

// Convert all printable ASCII characters
for (let i = 32; i <= 126; i++) {
  const char = String.fromCharCode(i)
  try {
    const run = font.layout(char)
    if (run.glyphs.length > 0 && run.glyphs[0].id !== 0) {
      const converted = convertGlyph(run.glyphs[0])
      if (converted && converted.o) {
        glyphs[char] = converted
        glyphCount++
      }
    }
  } catch (e) {
    // Skip unsupported characters
  }
}

// Also convert common accented characters
const extraChars = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ'
for (const char of extraChars) {
  try {
    const run = font.layout(char)
    if (run.glyphs.length > 0 && run.glyphs[0].id !== 0) {
      const converted = convertGlyph(run.glyphs[0])
      if (converted && converted.o) {
        glyphs[char] = converted
        glyphCount++
      }
    }
  } catch (e) {
    // Skip unsupported characters
  }
}

// Handle space character separately (no path but has advance width)
if (!glyphs[' ']) {
  try {
    const run = font.layout(' ')
    if (run.glyphs.length > 0) {
      glyphs[' '] = {
        ha: Math.round(run.glyphs[0].advanceWidth || font.unitsPerEm / 3),
        x_min: 0,
        x_max: 0,
        o: '',
      }
      glyphCount++
    }
  } catch (e) {
    // fallback space
    glyphs[' '] = { ha: Math.round(font.unitsPerEm / 3), x_min: 0, x_max: 0, o: '' }
    glyphCount++
  }
}

const bbox = font.bbox || { minX: 0, minY: 0, maxX: 0, maxY: 0 }

const result = {
  glyphs,
  familyName: font.familyName || 'Unknown',
  ascender: Math.round(font.ascent || 800),
  descender: Math.round(font.descent || -200),
  underlinePosition: Math.round(font.underlinePosition || -100),
  underlineThickness: Math.round(font.underlineThickness || 50),
  boundingBox: {
    xMin: Math.round(bbox.minX || 0),
    yMin: Math.round(bbox.minY || 0),
    xMax: Math.round(bbox.maxX || 0),
    yMax: Math.round(bbox.maxY || 0),
  },
  resolution: font.unitsPerEm,
  original_font_information: {
    format: 0,
    copyright: font.copyright || '',
    fontFamily: font.familyName || '',
    fontSubfamily: font.subfamilyName || '',
    fullName: font.fullName || '',
    postScriptName: font.postscriptName || '',
  },
}

// Ensure output directory exists
const outputDir = path.dirname(outputPath)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputPath, JSON.stringify(result))

console.log(`Done! Converted ${glyphCount} glyphs.`)
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`)
