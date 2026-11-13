import { describe, expect, it } from 'vitest'
import { contactRequestSchema, toFieldErrors } from '../shared/contact'

const valid = {
  professionalSlug: 'valentina-rios',
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  phone: '+34 600 000 000',
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

describe('contactRequestSchema', () => {
  it('acepta una solicitud válida y normaliza valores por defecto', () => {
    const parsed = contactRequestSchema.safeParse(valid)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.fullName).toBe('Ana Pérez')
      expect(parsed.data.professionalSlug).toBe('valentina-rios')
    }
  })

  it('aplica valores por defecto a teléfono, país y honeypot', () => {
    const parsed = contactRequestSchema.safeParse({
      ...valid,
      phone: undefined,
      country: undefined,
      website: undefined,
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.phone).toBe('')
      expect(parsed.data.country).toBe('')
      expect(parsed.data.website).toBe('')
    }
  })

  it('rechaza correos inválidos y mensajes demasiado cortos', () => {
    const parsed = contactRequestSchema.safeParse({
      ...valid,
      email: 'no-es-un-correo',
      message: 'ayuda',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const errors = toFieldErrors(parsed.error)
      expect(errors.email).toBeTruthy()
      expect(errors.message).toBeTruthy()
    }
  })

  it('exige los tres consentimientos', () => {
    const parsed = contactRequestSchema.safeParse({
      ...valid,
      consentPrivacy: false,
      consentContact: false,
      acknowledgeEmergency: false,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const errors = toFieldErrors(parsed.error)
      expect(errors.consentPrivacy).toBeTruthy()
      expect(errors.consentContact).toBeTruthy()
      expect(errors.acknowledgeEmergency).toBeTruthy()
    }
  })

  it('rechaza motivos de consulta no permitidos', () => {
    const parsed = contactRequestSchema.safeParse({ ...valid, reason: 'inventado' })
    expect(parsed.success).toBe(false)
  })

  it('rechaza un honeypot relleno (posible bot)', () => {
    const parsed = contactRequestSchema.safeParse({ ...valid, website: 'spam' })
    expect(parsed.success).toBe(false)
  })

  it('limita la longitud del mensaje y del nombre', () => {
    const parsed = contactRequestSchema.safeParse({
      ...valid,
      message: 'a'.repeat(1201),
      fullName: 'a'.repeat(81),
    })
    expect(parsed.success).toBe(false)
  })

  it('rechaza un rango de edad no permitido', () => {
    const parsed = contactRequestSchema.safeParse({ ...valid, ageRange: '100+' })
    expect(parsed.success).toBe(false)
  })
})
