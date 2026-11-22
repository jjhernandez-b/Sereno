import type {
  AdminContactRequestsResponse,
  ContactRequestInput,
  ContactRequestResponse,
} from '../../shared/contact'
import type {
  AdminLoginResponse,
  AdminProfessionalsResponse,
  Professional,
  ProfessionalInput,
  ProfessionalListResponse,
} from '../../shared/professionals'

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

export async function getProfessionals(): Promise<ProfessionalListResponse> {
  return apiRequest<ProfessionalListResponse>('/professionals')
}

// --- Panel del desarrollador -------------------------------------------------

function adminHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export async function adminLogin(password: string): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export async function getAdminProfessionals(
  token: string,
): Promise<AdminProfessionalsResponse> {
  return apiRequest<AdminProfessionalsResponse>('/admin/professionals', {
    headers: adminHeaders(token),
  })
}

export async function getAdminContactRequests(
  token: string,
): Promise<AdminContactRequestsResponse> {
  return apiRequest<AdminContactRequestsResponse>('/admin/contact-requests', {
    headers: adminHeaders(token),
  })
}

export async function createProfessional(
  token: string,
  input: ProfessionalInput,
): Promise<{ ok: true; professional: Professional }> {
  return apiRequest<{ ok: true; professional: Professional }>('/admin/professionals', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(input),
  })
}

export async function deleteProfessional(
  token: string,
  slug: string,
): Promise<{ ok: true; deleted: true }> {
  return apiRequest<{ ok: true; deleted: true }>(
    `/admin/professionals/${encodeURIComponent(slug)}`,
    {
      method: 'DELETE',
      headers: adminHeaders(token),
    },
  )
}
