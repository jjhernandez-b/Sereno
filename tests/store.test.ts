import { describe, expect, it } from 'vitest'
import { createReference, storageMode, toStoredRequest } from '../server/store'
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

describe('storageMode', () => {
  it('usa memoria cuando no hay variables de Upstash', () => {
    const previousUrl = process.env.UPSTASH_REDIS_REST_URL
    const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    expect(storageMode()).toBe('memory')

    if (previousUrl !== undefined) process.env.UPSTASH_REDIS_REST_URL = previousUrl
    if (previousToken !== undefined) process.env.UPSTASH_REDIS_REST_TOKEN = previousToken
  })
})
