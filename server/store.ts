import { randomBytes } from 'node:crypto'
import type { ContactRequestData } from '../shared/contact'
import { getSupabaseClient, getSupabaseConfig } from './supabase'

export { storageMode } from './supabase'

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

/** Fila de la tabla `public.contact_requests` en Supabase. */
export interface ContactRequestRow {
  reference: string
  created_at: string
  professional_slug: string
  professional_name: string
  full_name: string
  email: string
  phone: string
  age_range: string
  country: string
  reason: string
  message: string
  preferred_time: string
  modality: string
  status: string
  source: string
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const TABLE = 'contact_requests'

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

/** Restaura una solicitud desde una fila de Supabase. */
export function fromContactRequestRow(row: ContactRequestRow): StoredContactRequest {
  return {
    reference: row.reference,
    createdAt: row.created_at,
    professionalSlug: row.professional_slug,
    professionalName: row.professional_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? '',
    ageRange: row.age_range,
    country: row.country ?? '',
    reason: row.reason,
    message: row.message,
    preferredTime: row.preferred_time,
    modality: row.modality,
    status: row.status === 'new' ? 'new' : 'new',
    source: 'web',
  }
}

export function toContactRequestRow(request: StoredContactRequest): ContactRequestRow {
  return {
    reference: request.reference,
    created_at: request.createdAt,
    professional_slug: request.professionalSlug,
    professional_name: request.professionalName,
    full_name: request.fullName,
    email: request.email,
    phone: request.phone,
    age_range: request.ageRange,
    country: request.country,
    reason: request.reason,
    message: request.message,
    preferred_time: request.preferredTime,
    modality: request.modality,
    status: request.status,
    source: request.source,
  }
}

/**
 * Guarda la solicitud en Supabase. En Vercel el sistema de archivos es
 * efímero, por eso la base de datos es el almacenamiento principal. Sin las
 * variables de entorno, la solicitud solo se conserva en memoria y en logs.
 */
export async function persistContactRequest(
  request: StoredContactRequest,
): Promise<{ persisted: boolean }> {
  const config = getSupabaseConfig()

  if (!config) {
    memoryStore.push(request)
    console.info(
      `[sereno] Solicitud ${request.reference} creada (modo sin persistencia). ` +
        'Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para guardarla.',
    )
    return { persisted: false }
  }

  try {
    const client = getSupabaseClient(config)
    const { error } = await client.from(TABLE).insert(toContactRequestRow(request))

    if (error) {
      throw new Error(error.message)
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

/**
 * Lista las solicitudes recibidas para el panel del desarrollador. En modo
 * memoria solo devuelve las de esta instancia; en Supabase consulta la tabla
 * ordenada de más reciente a más antigua.
 */
export async function listContactRequests(): Promise<{
  storage: 'supabase' | 'memory'
  requests: StoredContactRequest[]
}> {
  const config = getSupabaseConfig()

  if (!config) {
    return { storage: 'memory', requests: [...memoryStore].reverse() }
  }

  const client = getSupabaseClient(config)
  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error(error.message)

  return {
    storage: 'supabase',
    requests: (data ?? []).map((row) => fromContactRequestRow(row as ContactRequestRow)),
  }
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
