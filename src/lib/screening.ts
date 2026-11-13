export const PHQ9_OPTIONS = [
  { value: 0, label: 'Para nada' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
] as const

export const WHO5_OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Rara vez' },
  { value: 2, label: 'Menos de la mitad del tiempo' },
  { value: 3, label: 'Más de la mitad del tiempo' },
  { value: 4, label: 'La mayor parte del tiempo' },
  { value: 5, label: 'Todo el tiempo' },
] as const

export type ScreeningId = 'phq-9' | 'gad-7' | 'who-5'
export type BandTone = 'bajo' | 'leve' | 'moderado' | 'alto'

export interface ScreeningOption {
  value: number
  label: string
}

export interface ScreeningQuestion {
  id: string
  text: string
  hint?: string
  risk?: boolean
}

export interface ScreeningBand {
  min: number
  max: number
  label: string
  tone: BandTone
  summary: string
  recommendation: string
}

export interface Screening {
  id: ScreeningId
  name: string
  shortName: string
  category: string
  tagline: string
  description: string
  durationMinutes: number
  timeframe: string
  questions: ScreeningQuestion[]
  options: readonly ScreeningOption[]
  bands: ScreeningBand[]
  scoring: 'sum' | 'who5'
  maxScore: number
  citation: string
  citationUrl?: string
  urgentItemId?: string
  urgentMessage?: string
}

export const SCREENINGS: Screening[] = [
  {
    id: 'phq-9',
    name: 'Cuestionario sobre la salud del paciente (PHQ-9)',
    shortName: 'PHQ-9',
    category: 'Estado de ánimo',
    tagline: 'Un primer mapa de cómo te has sentido estas últimas dos semanas.',
    description:
      'El PHQ-9 es uno de los instrumentos de tamizaje de depresión más utilizados en atención primaria. Explora nueve síntomas frecuentes y su intensidad reciente.',
    durationMinutes: 3,
    timeframe: 'Últimas 2 semanas',
    questions: [
      { id: 'phq9-1', text: 'Poco interés o placer en hacer las cosas.' },
      { id: 'phq9-2', text: 'Te has sentido desanimado/a, deprimido/a o sin esperanza.' },
      {
        id: 'phq9-3',
        text: 'Problemas para conciliar el sueño, permanecer dormido/a o dormir demasiado.',
      },
      { id: 'phq9-4', text: 'Sentirte cansado/a o con poca energía.' },
      { id: 'phq9-5', text: 'Falta de apetito o comer en exceso.' },
      {
        id: 'phq9-6',
        text: 'Sentirte mal contigo mismo/a, o que eres un fracaso o que has decepcionado a tu familia o a ti mismo/a.',
      },
      {
        id: 'phq9-7',
        text: 'Dificultad para concentrarte en cosas como leer o ver la televisión.',
      },
      {
        id: 'phq9-8',
        text: 'Moverte o hablar tan despacio que otras personas lo noten, o lo contrario: estar tan inquieto/a que te mueves más de lo normal.',
        hint: 'Incluye la perspectiva de otras personas, no solo cómo te sientes.',
      },
      {
        id: 'phq9-9',
        text: 'Pensamientos de que estarías mejor muerto/a o de hacerte daño de alguna manera.',
        hint: 'Si respondes cualquier opción distinta de “Para nada”, verás recursos de apoyo inmediato.',
        risk: true,
      },
    ],
    options: PHQ9_OPTIONS,
    bands: [
      {
        min: 0,
        max: 4,
        label: 'Síntomas mínimos',
        tone: 'bajo',
        summary:
          'Tus respuestas no sugieren síntomas depresivos significativos en este momento. Eso no significa que todo esté bien siempre: es una fotografía de las últimas dos semanas.',
        recommendation:
          'Sigue cuidando tu descanso, tus vínculos y las actividades que te dan sentido. Si algo cambia, puedes repetir el test o hablar con un profesional.',
      },
      {
        min: 5,
        max: 9,
        label: 'Síntomas leves',
        tone: 'leve',
        summary:
          'Puede haber algunos síntomas depresivos, aunque de intensidad leve. A veces se relacionan con etapas difíciles, falta de descanso o sobrecarga.',
        recommendation:
          'Observa cómo evoluciona durante las próximas semanas. Si los síntomas persisten, aumentan o interfieren con tu vida, conversar con un psicólogo/a puede ayudarte a entender qué necesitas.',
      },
      {
        min: 10,
        max: 14,
        label: 'Síntomas moderados',
        tone: 'moderado',
        summary:
          'Los síntomas podrían estar afectando tu energía, tu ánimo o tu día a día. Este resultado merece atención, no alarma: es una señal para mirar lo que necesitas.',
        recommendation:
          'Recomendamos hablar con un profesional de salud mental para una evaluación completa. No tienes que esperar a sentirte peor para pedir ayuda.',
      },
      {
        min: 15,
        max: 19,
        label: 'Síntomas moderadamente graves',
        tone: 'alto',
        summary:
          'Tus respuestas sugieren síntomas considerables, que probablemente están teniendo un impacto en tu vida diaria. No es un diagnóstico, pero sí una señal importante.',
        recommendation:
          'Busca una evaluación profesional pronto. Un psicólogo/a o psiquiatra puede ayudarte a entender qué está pasando y qué opciones tienes. Si aparecen pensamientos de hacerte daño, acude a los recursos de crisis.',
      },
      {
        min: 20,
        max: 27,
        label: 'Síntomas graves',
        tone: 'alto',
        summary:
          'Tus respuestas indican un malestar intenso. Este test no puede diagnosticar, pero este nivel de síntomas merece atención profesional cuanto antes.',
        recommendation:
          'Contacta hoy o lo antes posible con un profesional de salud mental o con tu servicio sanitario. Si estás en peligro o tienes pensamientos de hacerte daño, llama a emergencias o a una línea de crisis ahora.',
      },
    ],
    scoring: 'sum',
    maxScore: 27,
    citation:
      'Kroenke, K., Spitzer, R. L. y Williams, J. B. W. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613.',
    citationUrl: 'https://www.phqscreeners.com/',
    urgentItemId: 'phq9-9',
    urgentMessage:
      'Has indicado pensamientos de que estarías mejor muerto/a o de hacerte daño. No tienes que enfrentar esto solo/a. Busca apoyo inmediato: llama a una línea de crisis o a emergencias de tu país.',
  },
  {
    id: 'gad-7',
    name: 'Escala de ansiedad generalizada (GAD-7)',
    shortName: 'GAD-7',
    category: 'Ansiedad',
    tagline: 'Para poner en palabras la preocupación y el nerviosismo.',
    description:
      'El GAD-7 es un instrumento breve y validado para tamizar síntomas de ansiedad generalizada. No sustituye una evaluación clínica, pero puede ayudarte a describir lo que sientes.',
    durationMinutes: 2,
    timeframe: 'Últimas 2 semanas',
    questions: [
      { id: 'gad7-1', text: 'Sentirte nervioso/a, ansioso/a o con los nervios de punta.' },
      { id: 'gad7-2', text: 'No poder dejar de preocuparte o no poder controlar la preocupación.' },
      { id: 'gad7-3', text: 'Preocuparte demasiado por diferentes cosas.' },
      { id: 'gad7-4', text: 'Dificultad para relajarte.' },
      { id: 'gad7-5', text: 'Estar tan inquieto/a que te cuesta quedarte quieto/a.' },
      { id: 'gad7-6', text: 'Enojarte o irritarte con facilidad.' },
      { id: 'gad7-7', text: 'Sentir miedo de que algo terrible pudiera pasar.' },
    ],
    options: PHQ9_OPTIONS,
    bands: [
      {
        min: 0,
        max: 4,
        label: 'Ansiedad mínima',
        tone: 'bajo',
        summary:
          'Tus respuestas no sugieren síntomas de ansiedad significativos en este momento. La ansiedad es una emoción normal; el tema es cuánto interfiere con tu vida.',
        recommendation:
          'Mantén tus rutinas de descanso y movimiento. Si en algún momento la preocupación se vuelve constante o difícil de controlar, puedes repetir el test o consultar a un profesional.',
      },
      {
        min: 5,
        max: 9,
        label: 'Ansiedad leve',
        tone: 'leve',
        summary:
          'Puede haber cierta preocupación o tensión, pero de intensidad leve. A veces aparece en etapas de cambio, exámenes, trabajo o incertidumbre.',
        recommendation:
          'Prueba estrategias de regulación y observa si los síntomas bajan. Si persisten más de algunas semanas o te limitan, un profesional puede ayudarte a entender el patrón.',
      },
      {
        min: 10,
        max: 14,
        label: 'Ansiedad moderada',
        tone: 'moderado',
        summary:
          'La preocupación podría estar ocupando bastante espacio y afectando tu concentración, tu descanso o tu día a día.',
        recommendation:
          'Recomendamos una evaluación profesional. Existen tratamientos con buena evidencia para la ansiedad; no necesitas esperar a que sea insoportable.',
      },
      {
        min: 15,
        max: 21,
        label: 'Ansiedad grave',
        tone: 'alto',
        summary:
          'Tus respuestas sugieren síntomas de ansiedad intensos y probablemente frecuentes. Este test no es un diagnóstico, pero es una señal para buscar apoyo.',
        recommendation:
          'Contacta con un profesional de salud mental pronto. Si sientes que no puedes mantenerte a salvo o tienes pensamientos de hacerte daño, acude a emergencias o a una línea de crisis.',
      },
    ],
    scoring: 'sum',
    maxScore: 21,
    citation:
      'Spitzer, R. L., Kroenke, K., Williams, J. B. W. y Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: The GAD-7. Archives of Internal Medicine, 166(10), 1092–1097.',
    citationUrl: 'https://www.phqscreeners.com/',
  },
  {
    id: 'who-5',
    name: 'Índice de bienestar de la OMS (WHO-5)',
    shortName: 'WHO-5',
    category: 'Bienestar',
    tagline: 'Cinco preguntas para mirar tu bienestar, no solo el malestar.',
    description:
      'El WHO-5 es un cuestionario breve sobre bienestar subjetivo. En lugar de buscar síntomas, pregunta por tu ánimo, calma, energía e interés en las últimas dos semanas.',
    durationMinutes: 2,
    timeframe: 'Últimas 2 semanas',
    questions: [
      { id: 'who5-1', text: 'Me he sentido alegre y de buen ánimo.' },
      { id: 'who5-2', text: 'Me he sentido tranquilo/a y relajado/a.' },
      { id: 'who5-3', text: 'Me he sentido activo/a y con energía.' },
      { id: 'who5-4', text: 'Me he despertado sintiéndome fresco/a y descansado/a.' },
      { id: 'who5-5', text: 'Mi vida diaria ha estado llena de cosas que me interesan.' },
    ],
    options: WHO5_OPTIONS,
    bands: [
      {
        min: 69,
        max: 100,
        label: 'Bienestar satisfactorio',
        tone: 'bajo',
        summary:
          'Tus respuestas sugieren un nivel de bienestar favorable en las últimas dos semanas.',
        recommendation:
          'Sigue cuidando lo que te sostiene. Si en algún momento aparecen cambios importantes, puedes repetir el test o hablar con alguien de confianza.',
      },
      {
        min: 51,
        max: 68,
        label: 'Bienestar moderado',
        tone: 'leve',
        summary:
          'Tu bienestar parece intermedio: hay momentos de calma y energía, pero también áreas que podrían necesitar atención.',
        recommendation:
          'Revisa descanso, vínculos, movimiento y tiempo para ti. Si notas que el malestar persiste, una conversación con un profesional puede darte perspectiva.',
      },
      {
        min: 29,
        max: 50,
        label: 'Bienestar bajo',
        tone: 'moderado',
        summary:
          'Tus respuestas sugieren un bienestar bajo. La OMS utiliza un punto de corte de 50 o menos como señal para evaluar más a fondo cómo estás.',
        recommendation:
          'Recomendamos hablar con un profesional de salud mental para una evaluación completa. Un resultado bajo no es un diagnóstico, pero merece atención.',
      },
      {
        min: 0,
        max: 28,
        label: 'Bienestar muy bajo',
        tone: 'alto',
        summary:
          'Tus respuestas sugieren un bienestar muy bajo. El WHO-5 no diagnostica depresión, pero este rango se asocia con la necesidad de una evaluación profesional.',
        recommendation:
          'Busca apoyo profesional pronto. Si además tienes pensamientos de hacerte daño o sientes que no puedes mantenerte a salvo, acude a emergencias o a una línea de crisis.',
      },
    ],
    scoring: 'who5',
    maxScore: 100,
    citation:
      'World Health Organization. (1998). Wellbeing measures in primary health care: The DepCare Project. WHO Regional Office for Europe. Revisión: Topp, C. W. et al. (2015), Psychotherapy and Psychosomatics, 84(3), 167–176.',
  },
]

export function getScreening(id: string | undefined): Screening | undefined {
  return SCREENINGS.find((screening) => screening.id === id)
}

export interface ScreeningResult {
  screeningId: ScreeningId
  rawScore: number
  score: number
  maxScore: number
  percent: number
  band: ScreeningBand
  crisisFlag: boolean
  riskItemValue: number | null
  answered: number
  totalQuestions: number
}

export function scoreScreening(
  screening: Screening,
  answers: Array<number | null | undefined>,
): ScreeningResult {
  const answered = answers.filter((value): value is number => typeof value === 'number').length
  const rawScore = answers.reduce<number>((total, value) => total + (value ?? 0), 0)
  const score = screening.scoring === 'who5' ? rawScore * 4 : rawScore
  const percent = screening.maxScore > 0 ? Math.round((score / screening.maxScore) * 100) : 0

  const band =
    screening.bands.find((candidate) => score >= candidate.min && score <= candidate.max) ??
    screening.bands[screening.bands.length - 1]

  let riskItemValue: number | null = null
  if (screening.urgentItemId) {
    const index = screening.questions.findIndex((question) => question.id === screening.urgentItemId)
    const value = index >= 0 ? answers[index] : undefined
    riskItemValue = typeof value === 'number' ? value : null
  }

  return {
    screeningId: screening.id,
    rawScore,
    score,
    maxScore: screening.maxScore,
    percent,
    band,
    crisisFlag: riskItemValue !== null && riskItemValue > 0,
    riskItemValue,
    answered,
    totalQuestions: screening.questions.length,
  }
}

export const BAND_LABELS: Record<BandTone, string> = {
  bajo: 'Bajo',
  leve: 'Leve',
  moderado: 'Moderado',
  alto: 'Alto',
}

export const BAND_STYLES: Record<
  BandTone,
  { chip: string; bar: string; ring: string; soft: string; text: string }
> = {
  bajo: {
    chip: 'bg-forest-100 text-forest-800',
    bar: 'bg-forest-500',
    ring: '#2f7d70',
    soft: 'bg-forest-50',
    text: 'text-forest-800',
  },
  leve: {
    chip: 'bg-gold-100 text-[#7a5a12]',
    bar: 'bg-gold-500',
    ring: '#d9a441',
    soft: 'bg-gold-100/50',
    text: 'text-[#7a5a12]',
  },
  moderado: {
    chip: 'bg-clay-100 text-clay-700',
    bar: 'bg-clay-500',
    ring: '#d96b52',
    soft: 'bg-clay-50',
    text: 'text-clay-700',
  },
  alto: {
    chip: 'bg-clay-600 text-white',
    bar: 'bg-clay-600',
    ring: '#c2553f',
    soft: 'bg-clay-50',
    text: 'text-clay-700',
  },
}
