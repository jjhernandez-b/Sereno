import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  buildProfessional,
  fromProfessionalRow,
  slugify,
  toProfessionalRow,
  type ProfessionalRow,
} from '../server/professionals-store'
import {
  createAdminToken,
  isAdminConfigured,
  verifyAdminPassword,
  verifyAdminToken,
} from '../server/admin-auth'
import {
  PROFESSIONALS,
  professionalInputSchema,
  type ProfessionalInput,
} from '../shared/professionals'

const input: ProfessionalInput = {
  name: 'Ana Martínez',
  specialties: ['ansiedad', 'estres'],
  languages: ['Español', 'Inglés'],
  experienceYears: 8,
  priceUsd: 45,
  role: 'psicologo',
  modalities: ['video', 'chat'],
  featured: false,
}

describe('slugify', () => {
  it('quita acentos, espacios y símbolos', () => {
    expect(slugify('Ana Martínez')).toBe('ana-martinez')
    expect(slugify('  Dr. José  Núñez!! ')).toBe('dr-jose-nunez')
  })

  it('no deja guiones al inicio ni al final', () => {
    expect(slugify('---Hola---')).toBe('hola')
    expect(slugify('¿Qué tal?')).toBe('que-tal')
  })
})

describe('buildProfessional', () => {
  it('marca el perfil como publicado y completa los valores por defecto', () => {
    const professional = buildProfessional(input, 'ana-martinez')

    expect(professional.slug).toBe('ana-martinez')
    expect(professional.name).toBe('Ana Martínez')
    expect(professional.verification).toBe('verified')
    expect(professional.title).toBe('Psicólogo/a clínico/a · Ansiedad')
    expect(professional.availabilityNote).toContain('coordinar')
    expect(professional.nextSlot).toBe('Disponible')
    expect(professional.avatarTone).toBeGreaterThanOrEqual(0)
    expect(professional.avatarTone).toBeLessThan(8)
  })

  it('respeta los campos opcionales y elimina duplicados', () => {
    const professional = buildProfessional(
      {
        ...input,
        title: 'Psicóloga · Ansiedad y estrés',
        languages: ['Español', 'Español', ' Inglés '],
        specialties: ['ansiedad', 'ansiedad', 'estres'],
        location: 'Madrid',
        country: 'España',
        bio: 'Acompaño procesos de ansiedad.',
        approach: 'Terapia cognitivo-conductual.',
        nextSlot: 'Esta semana',
        featured: true,
      },
      'ana-martinez',
    )

    expect(professional.title).toBe('Psicóloga · Ansiedad y estrés')
    expect(professional.languages).toEqual(['Español', 'Inglés'])
    expect(professional.specialties).toEqual(['ansiedad', 'estres'])
    expect(professional.location).toBe('Madrid')
    expect(professional.country).toBe('España')
    expect(professional.featured).toBe(true)
  })
})

describe('toProfessionalRow / fromProfessionalRow', () => {
  it('hace un viaje de ida y vuelta sin perder datos', () => {
    const professional = buildProfessional(input, 'ana-martinez')
    const row = { ...toProfessionalRow(professional), created_at: new Date().toISOString() }
    const restored = fromProfessionalRow(row as ProfessionalRow)

    expect(restored.slug).toBe(professional.slug)
    expect(restored.name).toBe(professional.name)
    expect(restored.role).toBe(professional.role)
    expect(restored.title).toBe(professional.title)
    expect(restored.languages).toEqual(professional.languages)
    expect(restored.specialties).toEqual(professional.specialties)
    expect(restored.modalities).toEqual(professional.modalities)
    expect(restored.priceUsd).toBe(professional.priceUsd)
    expect(restored.experienceYears).toBe(professional.experienceYears)
    expect(restored.verification).toBe('verified')
  })

  it('aplica valores de respaldo ante filas incompletas o desconocidas', () => {
    const restored = fromProfessionalRow({
      slug: 'perfil-raro',
      name: 'Perfil Raro',
      role: 'otro' as ProfessionalRow['role'],
      title: '',
      verification: 'demo',
      experience_years: 0,
      location: '',
      country: '',
      languages: [],
      specialties: [],
      modalities: [],
      price_usd: 0,
      bio: '',
      approach: '',
      focus_tags: [],
      credentials: [],
      session_includes: [],
      availability_note: '',
      next_slot: '',
      featured: false,
      avatar_tone: Number.NaN,
    })

    expect(restored.role).toBe('psicologo')
    expect(restored.languages).toEqual(['Español'])
    expect(restored.specialties).toEqual(['ansiedad'])
    expect(restored.modalities).toEqual(['video'])
    expect(restored.nextSlot).toBe('Disponible')
    expect(restored.verification).toBe('demo')
    expect(restored.avatarTone).toBe(0)
  })
})

describe('professionalInputSchema', () => {
  it('acepta el formulario mínimo del panel', () => {
    const parsed = professionalInputSchema.safeParse({
      name: '  Ana Martínez ',
      specialties: ['ansiedad'],
      languages: ['Español'],
      experienceYears: 8,
      priceUsd: 45,
    })

    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data.name).toBe('Ana Martínez')
    expect(parsed.data.role).toBe('psicologo')
    expect(parsed.data.modalities).toEqual(['video'])
    expect(parsed.data.featured).toBe(false)
  })

  it('rechaza nombres cortos, precios inválidos y listas vacías', () => {
    const parsed = professionalInputSchema.safeParse({
      name: 'A',
      specialties: [],
      languages: [],
      experienceYears: 0,
      priceUsd: 0,
    })

    expect(parsed.success).toBe(false)
    if (parsed.success) return

    const fields = parsed.error.issues.map((issue) => issue.path.join('.'))
    expect(fields).toContain('name')
    expect(fields).toContain('specialties')
    expect(fields).toContain('languages')
    expect(fields).toContain('experienceYears')
    expect(fields).toContain('priceUsd')
  })

  it('rechaza especialidades y modalidades desconocidas', () => {
    const parsed = professionalInputSchema.safeParse({
      ...input,
      specialties: ['inventada'],
      modalities: ['humo'],
    })

    expect(parsed.success).toBe(false)
  })

  it('acepta todos los perfiles de muestra como entrada válida', () => {
    for (const professional of PROFESSIONALS) {
      const parsed = professionalInputSchema.safeParse({
        name: professional.name,
        specialties: professional.specialties,
        languages: professional.languages,
        experienceYears: professional.experienceYears,
        priceUsd: professional.priceUsd,
        role: professional.role,
        modalities: professional.modalities,
      })
      expect(parsed.success).toBe(true)
    }
  })
})

describe('autenticación del panel', () => {
  const previousPassword = process.env.ADMIN_PASSWORD
  const previousSecret = process.env.ADMIN_SESSION_SECRET
  const previousHours = process.env.ADMIN_SESSION_HOURS

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'clave-de-prueba-segura'
    delete process.env.ADMIN_SESSION_SECRET
    process.env.ADMIN_SESSION_HOURS = '8'
  })

  afterEach(() => {
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD
    else process.env.ADMIN_PASSWORD = previousPassword
    if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET
    else process.env.ADMIN_SESSION_SECRET = previousSecret
    if (previousHours === undefined) delete process.env.ADMIN_SESSION_HOURS
    else process.env.ADMIN_SESSION_HOURS = previousHours
  })

  it('solo se activa con ADMIN_PASSWORD configurada', () => {
    expect(isAdminConfigured()).toBe(true)
    delete process.env.ADMIN_PASSWORD
    expect(isAdminConfigured()).toBe(false)
  })

  it('compara la contraseña en el servidor', () => {
    expect(verifyAdminPassword('clave-de-prueba-segura')).toBe(true)
    expect(verifyAdminPassword('otra-clave')).toBe(false)
    expect(verifyAdminPassword('')).toBe(false)
  })

  it('emite un token que se puede verificar y caduca', () => {
    const now = Date.now()
    const session = createAdminToken(now)
    expect(session).not.toBeNull()
    if (!session) return

    const payload = verifyAdminToken(session.token, now)
    expect(payload?.sub).toBe('developer')
    expect(payload?.exp).toBe(now + 8 * 60 * 60 * 1000)
    expect(session.expiresAt).toBe(new Date(payload!.exp).toISOString())

    expect(verifyAdminToken(session.token, now + 9 * 60 * 60 * 1000)).toBeNull()
  })

  it('rechaza tokens manipulados o firmados con otro secreto', () => {
    const session = createAdminToken()
    expect(session).not.toBeNull()
    if (!session) return

    expect(verifyAdminToken(`${session.token}x`)).toBeNull()
    expect(verifyAdminToken('basura')).toBeNull()
    expect(verifyAdminToken(undefined)).toBeNull()

    process.env.ADMIN_SESSION_SECRET = 'otro-secreto-distinto'
    expect(verifyAdminToken(session.token)).toBeNull()
  })

  it('no emite tokens sin contraseña ni secreto', () => {
    delete process.env.ADMIN_PASSWORD
    delete process.env.ADMIN_SESSION_SECRET
    expect(createAdminToken()).toBeNull()
  })
})
