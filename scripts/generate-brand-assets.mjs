import { deflateSync } from "node:zlib"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const rootDir = process.cwd()
const publicDir = join(rootDir, "public")
const appDir = join(rootDir, "app")

mkdirSync(publicDir, { recursive: true })

const brand = {
  name: "SEOAuditAI",
  dark: [15, 23, 42, 255],
  blue: [37, 99, 235, 255],
  cyan: [8, 145, 178, 255],
  white: [255, 255, 255, 255],
}

const logoSymbolSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="seoauditai-icon-gradient" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2563EB"/>
      <stop offset="1" stop-color="#0891B2"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="48" height="48" rx="16" fill="url(#seoauditai-icon-gradient)"/>
  <rect x="19" y="33" width="5" height="10" rx="2.5" fill="white"/>
  <rect x="28" y="28" width="5" height="15" rx="2.5" fill="white"/>
  <rect x="37" y="22" width="5" height="21" rx="2.5" fill="white"/>
  <path d="M20 36L30.5 27L38 30L45 19.5" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="45" cy="19.5" r="3" fill="white"/>
</svg>
`

const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="712" height="160" viewBox="0 0 712 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="seoauditai-wordmark-gradient" x1="80" y1="20" x2="80" y2="140" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2563EB"/>
      <stop offset="1" stop-color="#0891B2"/>
    </linearGradient>
    <linearGradient id="seoauditai-ai-gradient" x1="552" y1="36" x2="608" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2563EB"/>
      <stop offset="1" stop-color="#0891B2"/>
    </linearGradient>
  </defs>
  <rect x="20" y="20" width="120" height="120" rx="36" fill="url(#seoauditai-wordmark-gradient)"/>
  <rect x="48" y="83" width="12" height="25" rx="6" fill="white"/>
  <rect x="70" y="70" width="12" height="38" rx="6" fill="white"/>
  <rect x="92" y="55" width="12" height="53" rx="6" fill="white"/>
  <path d="M50 90L76 66L94 74L112 47" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="112" cy="47" r="6" fill="white"/>
  <text x="172" y="104" fill="#0F172A" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="64" font-weight="800" letter-spacing="-0.04em">SEOAudit</text>
  <text x="542" y="104" fill="url(#seoauditai-ai-gradient)" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="64" font-weight="800" letter-spacing="-0.04em">AI</text>
  <text x="173" y="132" fill="#0369A1" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="18" font-weight="600" letter-spacing="0.18em">AI SEO, UX &amp; CONVERSION AUDITS</text>
</svg>
`

const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="seoauditai-favicon-gradient" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2563EB"/>
      <stop offset="1" stop-color="#0891B2"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="48" height="48" rx="16" fill="url(#seoauditai-favicon-gradient)"/>
  <rect x="19" y="33" width="5" height="10" rx="2.5" fill="white"/>
  <rect x="28" y="28" width="5" height="15" rx="2.5" fill="white"/>
  <rect x="37" y="22" width="5" height="21" rx="2.5" fill="white"/>
  <path d="M20 36L30.5 27L38 30L45 19.5" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="45" cy="19.5" r="3" fill="white"/>
</svg>
`

writeFileSync(join(publicDir, "logo.svg"), logoSvg)
writeFileSync(join(publicDir, "logo-symbol.svg"), logoSymbolSvg)
writeFileSync(join(publicDir, "favicon.svg"), faviconSvg)

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c >>> 0
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, "ascii")
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

function pngEncode(width, height, rgba) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    header,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

function mixChannel(a, b, t) {
  return Math.round(a + (b - a) * t)
}

function plotPixel(buffer, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= buffer.length / 4 / width) {
    return
  }

  const offset = (y * width + x) * 4
  const srcAlpha = color[3] / 255
  const dstAlpha = buffer[offset + 3] / 255
  const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha)

  if (outAlpha <= 0) {
    return
  }

  for (let channel = 0; channel < 3; channel += 1) {
    const src = color[channel] / 255
    const dst = buffer[offset + channel] / 255
    const out = (src * srcAlpha + dst * dstAlpha * (1 - srcAlpha)) / outAlpha
    buffer[offset + channel] = Math.round(out * 255)
  }

  buffer[offset + 3] = Math.round(outAlpha * 255)
}

function fillRoundedRect(buffer, width, x, y, w, h, radius, colorAt) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.ceil(x + w)
  const y1 = Math.ceil(y + h)
  const r = Math.max(0, radius)

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const cx = px + 0.5
      const cy = py + 0.5
      const nx = Math.max(Math.abs(cx - (x + w / 2)) - (w / 2 - r), 0)
      const ny = Math.max(Math.abs(cy - (y + h / 2)) - (h / 2 - r), 0)
      if (nx * nx + ny * ny <= r * r) {
        plotPixel(buffer, width, px, py, colorAt(px, py))
      }
    }
  }
}

function fillCircle(buffer, width, cx, cy, radius, color) {
  const x0 = Math.floor(cx - radius)
  const y0 = Math.floor(cy - radius)
  const x1 = Math.ceil(cx + radius)
  const y1 = Math.ceil(cy + radius)
  const radiusSquared = radius * radius

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const dx = px + 0.5 - cx
      const dy = py + 0.5 - cy
      if (dx * dx + dy * dy <= radiusSquared) {
        plotPixel(buffer, width, px, py, color)
      }
    }
  }
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const ab2 = abx * abx + aby * aby || 1
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2))
  const dx = ax + abx * t - px
  const dy = ay + aby * t - py
  return Math.sqrt(dx * dx + dy * dy)
}

function strokeSegment(buffer, width, ax, ay, bx, by, thickness, color) {
  const radius = thickness / 2
  const x0 = Math.floor(Math.min(ax, bx) - radius)
  const y0 = Math.floor(Math.min(ay, by) - radius)
  const x1 = Math.ceil(Math.max(ax, bx) + radius)
  const y1 = Math.ceil(Math.max(ay, by) + radius)

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const distance = distanceToSegment(px + 0.5, py + 0.5, ax, ay, bx, by)
      if (distance <= radius) {
        plotPixel(buffer, width, px, py, color)
      }
    }
  }
}

function downsample(buffer, width, height, factor) {
  const targetWidth = Math.floor(width / factor)
  const targetHeight = Math.floor(height / factor)
  const output = Buffer.alloc(targetWidth * targetHeight * 4)

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const sums = [0, 0, 0, 0]
      for (let oy = 0; oy < factor; oy += 1) {
        for (let ox = 0; ox < factor; ox += 1) {
          const index = ((y * factor + oy) * width + (x * factor + ox)) * 4
          sums[0] += buffer[index]
          sums[1] += buffer[index + 1]
          sums[2] += buffer[index + 2]
          sums[3] += buffer[index + 3]
        }
      }
      const targetIndex = (y * targetWidth + x) * 4
      const area = factor * factor
      output[targetIndex] = Math.round(sums[0] / area)
      output[targetIndex + 1] = Math.round(sums[1] / area)
      output[targetIndex + 2] = Math.round(sums[2] / area)
      output[targetIndex + 3] = Math.round(sums[3] / area)
    }
  }

  return { width: targetWidth, height: targetHeight, buffer: output }
}

function renderIcon(targetSize) {
  const oversample = 2
  const workSize = targetSize * oversample
  const scale = workSize / 512
  const buffer = Buffer.alloc(workSize * workSize * 4)

  fillRoundedRect(
    buffer,
    workSize,
    64 * scale,
    64 * scale,
    384 * scale,
    384 * scale,
    104 * scale,
    (_x, py) => {
      const localY = (py - 64 * scale) / (384 * scale)
      const t = Math.max(0, Math.min(1, localY))
      return [
        mixChannel(brand.blue[0], brand.cyan[0], t),
        mixChannel(brand.blue[1], brand.cyan[1], t),
        mixChannel(brand.blue[2], brand.cyan[2], t),
        255,
      ]
    },
  )

  fillCircle(buffer, workSize, 172 * scale, 128 * scale, 110 * scale, [255, 255, 255, 20])

  const barColor = brand.white
  fillRoundedRect(buffer, workSize, 150 * scale, 266 * scale, 42 * scale, 86 * scale, 18 * scale, () => barColor)
  fillRoundedRect(buffer, workSize, 228 * scale, 216 * scale, 42 * scale, 136 * scale, 18 * scale, () => barColor)
  fillRoundedRect(buffer, workSize, 306 * scale, 160 * scale, 42 * scale, 192 * scale, 18 * scale, () => barColor)

  const points = [
    [136, 300],
    [232, 220],
    [314, 248],
    [388, 144],
  ].map(([x, y]) => [x * scale, y * scale])

  for (let index = 0; index < points.length - 1; index += 1) {
    const [ax, ay] = points[index]
    const [bx, by] = points[index + 1]
    strokeSegment(buffer, workSize, ax, ay, bx, by, 28 * scale, brand.white)
  }

  fillCircle(buffer, workSize, points.at(-1)[0], points.at(-1)[1], 24 * scale, brand.white)

  return downsample(buffer, workSize, workSize, oversample)
}

function icoEncode(pngBuffer, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const entry = Buffer.alloc(16)
  entry[0] = size === 256 ? 0 : size
  entry[1] = size === 256 ? 0 : size
  entry[2] = 0
  entry[3] = 0
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(pngBuffer.length, 8)
  entry.writeUInt32LE(22, 12)

  return Buffer.concat([header, entry, pngBuffer])
}

for (const [fileName, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  const rendered = renderIcon(size)
  const png = pngEncode(rendered.width, rendered.height, rendered.buffer)
  writeFileSync(join(publicDir, fileName), png)
}

const faviconRendered = renderIcon(32)
const faviconPng = pngEncode(faviconRendered.width, faviconRendered.height, faviconRendered.buffer)
writeFileSync(join(appDir, "favicon.ico"), icoEncode(faviconPng, 32))
