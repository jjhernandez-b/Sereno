import type { BandTone, ScreeningId } from './screening'

const RESULTS_KEY = 'sereno:results:v1'
const MAX_RESULTS = 80

export interface SavedScreeningResult {
  id: string
  screeningId: ScreeningId
  screeningName: string
  score: number
  maxScore: number
  bandLabel: string
  tone: BandTone
  crisisFlag: boolean
  createdAt: string
  answers: number[]
}

function isSavedResult(value: unknown): value is SavedScreeningResult {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<SavedScreeningResult>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.screeningId === 'string' &&
    typeof candidate.score === 'number' &&
    typeof candidate.maxScore === 'number' &&
    typeof candidate.createdAt === 'string' &&
    Array.isArray(candidate.answers)
  )
}

function storageAvailable(): boolean {
  try {
    const probe = '__sereno_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function readResults(): SavedScreeningResult[] {
  if (typeof window === 'undefined' || !storageAvailable()) return []
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedResult).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

export function saveResult(
  result: Omit<SavedScreeningResult, 'id' | 'createdAt'>,
): SavedScreeningResult | null {
  if (typeof window === 'undefined' || !storageAvailable()) return null

  const entry: SavedScreeningResult = {
    ...result,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }

  try {
    const existing = readResults()
    const next = [entry, ...existing].slice(0, MAX_RESULTS)
    window.localStorage.setItem(RESULTS_KEY, JSON.stringify(next))
    return entry
  } catch {
    return null
  }
}

export function clearResults(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(RESULTS_KEY)
  } catch {
    // Sin acceso a localStorage: no hay nada que borrar.
  }
}

export function removeResult(id: string): SavedScreeningResult[] {
  const next = readResults().filter((result) => result.id !== id)
  try {
    window.localStorage.setItem(RESULTS_KEY, JSON.stringify(next))
  } catch {
    // Ignoramos el fallo de escritura; la UI conserva el estado en memoria.
  }
  return next
}
