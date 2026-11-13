import { describe, expect, it } from 'vitest'
import { SCREENINGS, getScreening, scoreScreening } from '../src/lib/screening'

const phq9 = getScreening('phq-9')!
const gad7 = getScreening('gad-7')!
const who5 = getScreening('who-5')!

describe('catálogo de tests', () => {
  it('incluye los tres instrumentos y metadatos coherentes', () => {
    expect(SCREENINGS.map((screening) => screening.id)).toEqual(['phq-9', 'gad-7', 'who-5'])
    for (const screening of SCREENINGS) {
      expect(screening.questions.length).toBeGreaterThanOrEqual(5)
      expect(screening.bands.length).toBeGreaterThan(1)
      expect(screening.maxScore).toBeGreaterThan(0)
      expect(screening.citation.length).toBeGreaterThan(20)
      expect(screening.options.length).toBeGreaterThan(1)
    }
  })

  it('cubre todo el rango de puntuación con bandas sin huecos', () => {
    for (const screening of SCREENINGS) {
      const bands = [...screening.bands].sort((a, b) => a.min - b.min)
      expect(bands[0].min).toBe(0)
      expect(bands[bands.length - 1].max).toBe(screening.maxScore)
      for (let index = 1; index < bands.length; index += 1) {
        expect(bands[index].min).toBe(bands[index - 1].max + 1)
      }
    }
  })
})

describe('puntuación PHQ-9', () => {
  it('suma las respuestas y devuelve la banda correcta', () => {
    const answers = [3, 3, 2, 2, 2, 1, 1, 0, 0]
    const result = scoreScreening(phq9, answers)
    expect(result.score).toBe(14)
    expect(result.rawScore).toBe(14)
    expect(result.maxScore).toBe(27)
    expect(result.band.label).toBe('Síntomas moderados')
    expect(result.answered).toBe(9)
    expect(result.crisisFlag).toBe(false)
  })

  it('marca crisis cuando el ítem 9 es mayor que cero', () => {
    const answers = [0, 1, 0, 0, 0, 0, 0, 0, 1]
    const result = scoreScreening(phq9, answers)
    expect(result.crisisFlag).toBe(true)
    expect(result.riskItemValue).toBe(1)
  })

  it('no marca crisis cuando el ítem 9 es cero', () => {
    const answers = [3, 3, 3, 3, 3, 3, 3, 3, 0]
    const result = scoreScreening(phq9, answers)
    expect(result.score).toBe(24)
    expect(result.band.label).toBe('Síntomas graves')
    expect(result.crisisFlag).toBe(false)
  })

  it('trata respuestas sin contestar como no respondidas y no rompe el cálculo', () => {
    const answers = [1, null, undefined, 2]
    const result = scoreScreening(phq9, answers)
    expect(result.score).toBe(3)
    expect(result.answered).toBe(2)
    expect(result.totalQuestions).toBe(9)
  })
})

describe('puntuación GAD-7', () => {
  it('suma y clasifica correctamente', () => {
    const result = scoreScreening(gad7, [2, 2, 2, 1, 1, 1, 1])
    expect(result.score).toBe(10)
    expect(result.band.label).toBe('Ansiedad moderada')
    expect(result.crisisFlag).toBe(false)
  })

  it('alcanza la banda grave con el máximo', () => {
    const result = scoreScreening(gad7, Array(7).fill(3))
    expect(result.score).toBe(21)
    expect(result.percent).toBe(100)
    expect(result.band.label).toBe('Ansiedad grave')
  })
})

describe('puntuación WHO-5', () => {
  it('multiplica la suma por 4 y calcula el porcentaje', () => {
    const result = scoreScreening(who5, [5, 5, 5, 5, 5])
    expect(result.rawScore).toBe(25)
    expect(result.score).toBe(100)
    expect(result.percent).toBe(100)
    expect(result.band.label).toBe('Bienestar satisfactorio')
  })

  it('clasifica un bienestar bajo con el punto de corte de 50', () => {
    const result = scoreScreening(who5, [2, 2, 2, 2, 2])
    expect(result.score).toBe(40)
    expect(result.band.label).toBe('Bienestar bajo')
  })

  it('clasifica bienestar muy bajo', () => {
    const result = scoreScreening(who5, [0, 1, 0, 0, 1])
    expect(result.score).toBe(8)
    expect(result.band.label).toBe('Bienestar muy bajo')
  })
})
