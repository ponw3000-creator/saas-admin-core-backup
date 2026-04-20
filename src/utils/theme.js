export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function getLightColor(hexColor, level) {
  if (!hexColor) return '#ffffff'
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#ffffff'

  const r = Math.round(rgb.r + (255 - rgb.r) * level)
  const g = Math.round(rgb.g + (255 - rgb.g) * level)
  const b = Math.round(rgb.b + (255 - rgb.b) * level)

  return rgbToHex(r, g, b)
}

export function getDarkColor(hexColor, level) {
  if (!hexColor) return '#000000'
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'

  const r = Math.round(rgb.r * (1 - level))
  const g = Math.round(rgb.g * (1 - level))
  const b = Math.round(rgb.b * (1 - level))

  return rgbToHex(r, g, b)
}

export function setGlobalThemeColor(color) {
  if (!color) return

  const el = document.documentElement

  el.style.setProperty('--el-color-primary', color)

  for (let i = 1; i <= 9; i++) {
    const lightColor = getLightColor(color, i / 10)
    el.style.setProperty(`--el-color-primary-light-${i}`, lightColor)
  }

  el.style.setProperty('--el-color-primary-dark-2', getDarkColor(color, 0.2))
}
