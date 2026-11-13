import { describe, expect, it } from 'vitest'
import {
  createReference,
  storageMode,
  toContactRequestRow,
  toStoredRequest,
} from '../server/store'
import type { ContactRequestData } from '../shared/contact'

const data: ContactRequestData = {
  professionalSlug: 'valentina-rios',
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  phone: '',
  ageRange: '25-34',
  country: 'Madrid',
  reason: 'ansiedad',
  message: 'Me gustaría hablar sobre la ansiedad que siento desde hace unas semanas.',
  preferredTime: 'tarde',
  modality: 'video',
  consentPrivacy: true,
  consentContact: true,
  acknowledgeEmergency: true,
  website: '',
}

describe('createReference', () => {
  it('genera referencias con el formato esperado', () => {
    for (let index = 0; index < 50; index += 1) {
      expect(createReference()).toMatch(/^SR-[A-HJ-NP-Z2-9]{6}$/)
    }
  })

  it('no repite referencias en una muestra amplia', () => {
    const references = new Set(Array.from({ length: 500 }, () => createReference()))
    expect(references.size).toBe(500)
  })
})

describe('toStoredRequest', () => {
  it('construye el registro con estado inicial y fuente web', () => {
    const stored = toStoredRequest(data, 'Valentina Ríos')
    expect(stored.reference).toMatch(/^SR-/)
    expect(stored.professionalName).toBe('Valentina Ríos')
    expect(stored.status).toBe('new')
    expect(stored.source).toBe('web')
    expect(stored.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(stored.phone).toBe('')
  })

  it('no incluye el campo honeypot en el registro', () => {
    const stored = toStoredRequest({ ...data, website: '' }, 'Valentina Ríos')
    expect('website' in stored).toBe(false)
  })
})

describe('toContactRequestRow', () => {
  it('mapea el registro a las columnas snake_case de Supabase', () => {
    const stored = toStoredRequest(data, 'Valentina Ríos')
    const row = toContactRequestRow(stored)

    expect(row.reference).toBe(stored.reference)
    expect(row.created_at).toBe(stored.createdAt)
    expect(row.professional_slug).toBe('valentina-rios')
    expect(row.professional_name).toBe('Valentina Ríos')
    expect(row.full_name).toBe('Ana Pérez')
    expect(row.email).toBe('ana@example.com')
    expect(row.phone).toBe('')
    expect(row.age_range).toBe('25-34')
    expect(row.country).toBe('Madrid')
    expect(row.reason).toBe('ansiedad')
    expect(row.preferred_time).toBe('tarde')
    expect(row.modality).toBe('video')
    expect(row.status).toBe('new')
    expect(row.source).toBe('web')
    expect('professionalSlug' in row).toBe(false)
    expect('website' in row).toBe(false)
  })
})

describe('storageMode', () => {
  it('usa memoria cuando no hay variables de Supabase', () => {
    const previousUrl = process.env.SUPABASE_URL
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    try {
      expect(storageMode()).toBe('memory')
    } finally {
      if (previousUrl !== undefined) process.env.SUPABASE_URL = previousUrl
      if (previousKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey
    }
  })

  it('usa Supabase cuando la URL y la service role key están configuradas', () => {
    const previousUrl = process.env.SUPABASE_URL
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    try {
      expect(storageMode()).toBe('supabase')
    } finally {
      if (previousUrl === undefined) delete process.env.SUPABASE_URL
      else process.env.SUPABASE_URL = previousUrl
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey
    }
  })
})
