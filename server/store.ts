import { randomBytes } from 'node:crypto'
import type { ContactRequestData } from '../shared/contact'

export interface StoredContactRequest {
  reference: string
  createdAt: string
  professionalSlug: string
  professionalName: string
  fullName: string
  email: string
  phone: string
  ageRange: string
  country: string
  reason: string
  message: string
  preferredTime: string
  modality: string
  status: 'new'
  source: 'web'
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function createReference(): string {
  const bytes = randomBytes(6)
  let code = ''
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length]
  }
  return `SR-${code}`
}

/** Almacenamiento en memoria solo para desarrollo local. */
const memoryStore: StoredContactRequest[] = []

interface UpstashConfig {
  url: string
  token: string
}

function getUpstashConfig(): UpstashConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, '')
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  return { url, token }
}

export function storageMode(): 'upstash' | 'memory' {
  return getUpstashConfig() ? 'upstash' : 'memory'
}

/**
 * Guarda la solicitud. En Vercel el sistema de archivos es efímero, por eso
 * usamos Upstash Redis (plan gratuito) cuando está configurado. Sin variables
 * de entorno la solicitud solo se conserva en memoria y en los logs.
 */
export async function persistContactRequest(
  request: StoredContactRequest,
): Promise<{ persisted: boolean }> {
  const config = getUpstashConfig()

  if (!config) {
    memoryStore.push(request)
    console.info(
      `[sereno] Solicitud ${request.reference} creada (modo sin persistencia). ` +
        'Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN para guardarla.',
    )
    return { persisted: false }
  }

  const key = `sereno:contact:${request.reference}`
  const ttlSeconds = 60 * 60 * 24 * 180
  const commands: Array<Array<string | number>> = [
    ['SET', key, JSON.stringify(request), 'EX', ttlSeconds],
    ['LPUSH', 'sereno:contact:index', request.reference],
    ['LTRIM', 'sereno:contact:index', 0, 9999],
  ]

  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`Upstash respondió ${response.status}: ${detail.slice(0, 200)}`)
    }

    return { persisted: true }
  } catch (error) {
    console.error(`[sereno] No se pudo persistir la solicitud ${request.reference}.`, error)
    // Guardamos en memoria como último recurso para no perder la solicitud
    // durante la vida de esta instancia.
    memoryStore.push(request)
    return { persisted: false }
  }
}

export function readMemoryRequests(): StoredContactRequest[] {
  return [...memoryStore]
}

export function toStoredRequest(
  data: ContactRequestData,
  professionalName: string,
): StoredContactRequest {
  return {
    reference: createReference(),
    createdAt: new Date().toISOString(),
    professionalSlug: data.professionalSlug,
    professionalName,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone ?? '',
    ageRange: data.ageRange,
    country: data.country ?? '',
    reason: data.reason,
    message: data.message,
    preferredTime: data.preferredTime,
    modality: data.modality,
    status: 'new',
    source: 'web',
  }
}
