import type { ContactConfirmation } from '../../shared/contact'

const CONFIRMATION_KEY = 'sereno:last-confirmation:v1'

export function isConfirmation(value: unknown): value is ContactConfirmation {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<ContactConfirmation>
  return (
    typeof candidate.reference === 'string' &&
    typeof candidate.professionalName === 'string' &&
    typeof candidate.receivedAt === 'string'
  )
}

/**
 * Guarda la última confirmación en el almacenamiento de sesión para que la
 * referencia siga visible si la persona recarga la página. Se borra al cerrar
 * la pestaña y nunca se envía al servidor.
 */
export function rememberConfirmation(confirmation: ContactConfirmation): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(confirmation))
  } catch {
    // Sin acceso a sessionStorage: la confirmación solo vivirá en el estado del router.
  }
}

export function readRememberedConfirmation(): ContactConfirmation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(CONFIRMATION_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isConfirmation(parsed) ? parsed : null
  } catch {
    return null
  }
}
