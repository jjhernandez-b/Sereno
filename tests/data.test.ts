import { describe, expect, it } from 'vitest'
import {
  MODALITY_LABELS,
  PROFESSIONALS,
  SPECIALTIES,
  getProfessional,
  specialtyLabel,
} from '../shared/professionals'
import { HOTLINES } from '../shared/crisis'

describe('datos de profesionales', () => {
  it('contiene ocho perfiles de muestra únicos', () => {
    expect(PROFESSIONALS).toHaveLength(8)
    const slugs = new Set(PROFESSIONALS.map((professional) => professional.slug))
    expect(slugs.size).toBe(PROFESSIONALS.length)
  })

  it('marca todos los perfiles como demostración', () => {
    for (const professional of PROFESSIONALS) {
      expect(professional.verification).toBe('demo')
    }
  })

  it('usa especialidades y modalidades válidas', () => {
    const validSpecialties = new Set(SPECIALTIES.map((specialty) => specialty.id))
    const validModalities = new Set(Object.keys(MODALITY_LABELS))
    for (const professional of PROFESSIONALS) {
      expect(professional.specialties.length).toBeGreaterThan(0)
      expect(professional.modalities.length).toBeGreaterThan(0)
      for (const specialty of professional.specialties) {
        expect(validSpecialties.has(specialty)).toBe(true)
      }
      for (const modality of professional.modalities) {
        expect(validModalities.has(modality)).toBe(true)
      }
    }
  })

  it('tiene precios y experiencia razonables', () => {
    for (const professional of PROFESSIONALS) {
      expect(professional.priceUsd).toBeGreaterThan(0)
      expect(professional.priceUsd).toBeLessThanOrEqual(200)
      expect(professional.experienceYears).toBeGreaterThan(0)
      expect(professional.credentials.length).toBeGreaterThan(0)
    }
  })

  it('resuelve perfiles por slug', () => {
    expect(getProfessional('valentina-rios')?.name).toBe('Valentina Ríos')
    expect(getProfessional('no-existe')).toBeUndefined()
    expect(specialtyLabel('ansiedad')).toBe('Ansiedad')
    expect(specialtyLabel('desconocida')).toBe('desconocida')
  })
})

describe('recursos de crisis', () => {
  it('incluye líneas de ayuda y números de emergencia', () => {
    expect(HOTLINES.length).toBeGreaterThan(4)
    expect(HOTLINES[0].country).toBe('Venezuela')
    const venezuela = HOTLINES.find((hotline) => hotline.country === 'Venezuela')
    expect(venezuela?.lines.some((line) => line.tel === '04242907338')).toBe(true)
    expect(venezuela?.lines.some((line) => line.number === '911')).toBe(true)
  })

  it('tiene países únicos y al menos una línea por país', () => {
    const countries = new Set(HOTLINES.map((hotline) => hotline.country))
    expect(countries.size).toBe(HOTLINES.length)
    for (const hotline of HOTLINES) {
      expect(hotline.lines.length).toBeGreaterThan(0)
    }
  })
})
