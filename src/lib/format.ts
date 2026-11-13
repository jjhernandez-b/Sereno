export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

const AVATAR_TONES = [
  'from-forest-200 to-forest-400 text-forest-900',
  'from-clay-200 to-clay-400 text-clay-700',
  'from-gold-100 to-gold-300 text-[#6d4d0e]',
  'from-forest-300 to-forest-500 text-forest-950',
  'from-clay-100 to-clay-300 text-clay-700',
  'from-forest-100 to-forest-300 text-forest-800',
  'from-[#d8e2f0] to-[#a9bfd9] text-[#233a55]',
  'from-[#eadfee] to-[#cbb0d4] text-[#4b2b55]',
]

export function avatarTone(tone: number): string {
  return AVATAR_TONES[Math.abs(tone) % AVATAR_TONES.length]
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '·'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return DATE_FORMATTER.format(date)
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return DATE_TIME_FORMATTER.format(date)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}
