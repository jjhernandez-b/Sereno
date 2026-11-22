const TOKEN_KEY = 'sereno:admin-token:v1'

/** El token vive en sessionStorage: se borra al cerrar la pestaña. */
export function readAdminToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveAdminToken(token: string): void {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // sessionStorage puede estar bloqueado; la sesión vivirá solo en memoria.
  }
}

export function clearAdminToken(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}
