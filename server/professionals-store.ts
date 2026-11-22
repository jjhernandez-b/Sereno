import { randomBytes } from 'node:crypto'
import {
  PROFESSIONALS,
  ROLE_LABELS,
  specialtyLabel,
  type Modality,
  type Professional,
  type ProfessionalInput,
  type ProfessionalRole,
  type ProfessionalsSource,
  type SpecialtyId,
} from '../shared/professionals'
import { getSupabaseClient, getSupabaseConfig } from './supabase'

const TABLE = 'professionals'

export class ProfessionalStorageNotConfiguredError extends Error {
  constructor() {
    super(
      'Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para guardar profesionales en la base de datos.',
    )
    this.name = 'ProfessionalStorageNotConfiguredError'
  }
}

/** Columnas de la tabla `public.professionals` en Supabase. */
export interface ProfessionalRow {
  slug: string
  created_at?: string
  updated_at?: string
  name: string
  role: ProfessionalRole
  title: string
  verification: 'demo' | 'verified'
  experience_years: number
  location: string
  country: string
  languages: string[]
  specialties: SpecialtyId[]
  modalities: Modality[]
  price_usd: number
  bio: string
  approach: string
  focus_tags: string[]
  credentials: string[]
  session_includes: string[]
  availability_note: string
  next_slot: string
  featured: boolean
  avatar_tone: number
}

function uniqueValues<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

/** Convierte un nombre en un slug estable, sin acentos ni símbolos. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function avatarToneFor(name: string): number {
  let hash = 0
  for (const character of name) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 8
  }
  return hash
}

/** Construye el perfil público a partir de los datos del panel. */
export function buildProfessional(input: ProfessionalInput, slug: string): Professional {
  const specialties = uniqueValues(input.specialties)
  const primarySpecialty = specialties[0] ?? 'ansiedad'
  const title =
    input.title?.trim() || `${ROLE_LABELS[input.role]} · ${specialtyLabel(primarySpecialty)}`

  return {
    slug,
    name: input.name.trim(),
    role: input.role,
    title,
    verification: 'verified',
    experienceYears: input.experienceYears,
    location: input.location?.trim() ?? '',
    country: input.country?.trim() ?? '',
    languages: uniqueValues(input.languages.map((language) => language.trim()).filter(Boolean)),
    specialties,
    modalities: uniqueValues(input.modalities),
    priceUsd: input.priceUsd,
    bio: input.bio?.trim() ?? '',
    approach: input.approach?.trim() ?? '',
    focusTags: [],
    credentials: [],
    sessionIncludes: [],
    availabilityNote:
      input.availabilityNote?.trim() || 'Horario a coordinar directamente con el profesional.',
    nextSlot: input.nextSlot?.trim() || 'Disponible',
    featured: input.featured,
    avatarTone: avatarToneFor(input.name),
  }
}

/** Mapea el perfil de la aplicación a columnas snake_case de Supabase. */
export function toProfessionalRow(
  professional: Professional,
): Omit<ProfessionalRow, 'created_at' | 'updated_at'> {
  return {
    slug: professional.slug,
    name: professional.name,
    role: professional.role,
    title: professional.title,
    verification: professional.verification,
    experience_years: professional.experienceYears,
    location: professional.location,
    country: professional.country,
    languages: professional.languages,
    specialties: professional.specialties,
    modalities: professional.modalities,
    price_usd: professional.priceUsd,
    bio: professional.bio,
    approach: professional.approach,
    focus_tags: professional.focusTags,
    credentials: professional.credentials,
    session_includes: professional.sessionIncludes,
    availability_note: professional.availabilityNote,
    next_slot: professional.nextSlot,
    featured: Boolean(professional.featured),
    avatar_tone: professional.avatarTone,
  }
}

/** Restaura un perfil desde una fila de Supabase. */
export function fromProfessionalRow(row: ProfessionalRow): Professional {
  const role: ProfessionalRole = row.role === 'psiquiatra' ? 'psiquiatra' : 'psicologo'
  const specialties = row.specialties?.length ? row.specialties : (['ansiedad'] as SpecialtyId[])

  return {
    slug: row.slug,
    name: row.name,
    role,
    title: row.title || `${ROLE_LABELS[role]} · ${specialtyLabel(specialties[0] ?? 'ansiedad')}`,
    verification: row.verification === 'demo' ? 'demo' : 'verified',
    experienceYears: Number(row.experience_years) || 0,
    location: row.location ?? '',
    country: row.country ?? '',
    languages: row.languages?.length ? row.languages : ['Español'],
    specialties,
    modalities: row.modalities?.length ? row.modalities : ['video'],
    priceUsd: Number(row.price_usd) || 0,
    bio: row.bio ?? '',
    approach: row.approach ?? '',
    focusTags: row.focus_tags ?? [],
    credentials: row.credentials ?? [],
    sessionIncludes: row.session_includes ?? [],
    availabilityNote: row.availability_note ?? '',
    nextSlot: row.next_slot || 'Disponible',
    featured: Boolean(row.featured),
    avatarTone: Number.isFinite(row.avatar_tone) ? row.avatar_tone : 0,
  }
}

/**
 * Lee los profesionales publicados en Supabase. Devuelve `null` si no hay
 * configuración o si la consulta falla, para que el sitio pueda usar los
 * perfiles de ejemplo como respaldo.
 */
export async function listDatabaseProfessionals(): Promise<Professional[] | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  try {
    const client = getSupabaseClient(config)
    const { data, error } = await client
      .from(TABLE)
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => fromProfessionalRow(row as ProfessionalRow))
  } catch (error) {
    console.error('[sereno] No se pudieron leer los profesionales de Supabase.', error)
    return null
  }
}

/**
 * Directorio público. Si la base de datos tiene profesionales, esos sustituyen
 * por completo a los perfiles de ejemplo. Si está vacía o no está configurada,
 * se muestran los ocho perfiles de demostración.
 */
export async function listPublicProfessionals(): Promise<{
  professionals: Professional[]
  source: ProfessionalsSource
}> {
  const database = await listDatabaseProfessionals()
  if (database && database.length > 0) {
    return { professionals: database, source: 'database' }
  }
  return { professionals: PROFESSIONALS, source: 'demo' }
}

export async function findPublicProfessional(
  slug: string | undefined,
): Promise<Professional | undefined> {
  if (!slug) return undefined
  const { professionals } = await listPublicProfessionals()
  return professionals.find((professional) => professional.slug === slug)
}

async function reserveSlug(
  client: ReturnType<typeof getSupabaseClient>,
  base: string,
): Promise<string> {
  let candidate = base
  for (let attempt = 2; attempt < 100; attempt += 1) {
    const { data, error } = await client.from(TABLE).select('slug').eq('slug', candidate).maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return candidate
    candidate = `${base}-${attempt}`
  }
  return `${base}-${randomBytes(3).toString('hex')}`
}

/** Crea un profesional en Supabase y devuelve el perfil público resultante. */
export async function createDatabaseProfessional(input: ProfessionalInput): Promise<Professional> {
  const config = getSupabaseConfig()
  if (!config) throw new ProfessionalStorageNotConfiguredError()

  const client = getSupabaseClient(config)
  const baseSlug = slugify(input.name) || 'profesional'
  const slug = await reserveSlug(client, baseSlug)
  const professional = buildProfessional(input, slug)

  const { data, error } = await client
    .from(TABLE)
    .insert(toProfessionalRow(professional))
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return fromProfessionalRow(data as ProfessionalRow)
}

/** Retira un profesional de la base de datos. Devuelve si existía. */
export async function deleteDatabaseProfessional(slug: string): Promise<boolean> {
  const config = getSupabaseConfig()
  if (!config) throw new ProfessionalStorageNotConfiguredError()

  const client = getSupabaseClient(config)
  const { data, error } = await client.from(TABLE).delete().eq('slug', slug).select('slug')

  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}
