// Run: node scripts/generate-icons.mjs
// Requires: npm install sharp (dev dependency)
import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('./public/wallet.svg')

await sharp(svg).resize(192, 192).png().toFile('./public/icon-192.png')
console.log('✅ icon-192.png created')

await sharp(svg).resize(512, 512).png().toFile('./public/icon-512.png')
console.log('✅ icon-512.png created')
