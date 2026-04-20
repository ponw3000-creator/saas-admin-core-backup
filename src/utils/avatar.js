const AVATAR_COLORS = [
  '#4F46E5',
  '#059669',
  '#D97706',
  '#DC2626',
  '#475569',
  '#0891B2',
  '#7C3AED',
  '#DB2777',
  '#65A30D',
  '#EA580C'
]

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export function getAvatarText(name) {
  if (!name) return '?'
  const trimmed = String(name).trim()
  if (!trimmed) return '?'
  const firstChar = trimmed[0]
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase()
  }
  return firstChar
}

export function getInitials(name) {
  return getAvatarText(name)
}
