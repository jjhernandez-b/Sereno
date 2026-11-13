import type { ContactRequestInput, ContactRequestResponse } from '../../shared/contact'

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status = 0, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(`${API_BASE}/api${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })

    const payload = (await response.json().catch(() => null)) as
      | { message?: string; fieldErrors?: Record<string, string> }
      | null

    if (!response.ok) {
      throw new ApiError(
        payload?.message ?? 'No pudimos completar la solicitud. Inténtalo de nuevo.',
        response.status,
        payload?.fieldErrors ?? {},
      )
    }

    return payload as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('La conexión tardó demasiado. Revisa tu internet e inténtalo de nuevo.')
    }
    throw new ApiError(
      'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    )
  } finally {
    clearTimeout(timeout)
  }
}

export async function submitContactRequest(
  values: ContactRequestInput,
): Promise<ContactRequestResponse> {
  return apiRequest<ContactRequestResponse>('/contact-requests', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export async function checkApiHealth(): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>('/health')
}
