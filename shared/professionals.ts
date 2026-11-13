/**
 * Catálogo de especialidades y profesionales.
 *
 * IMPORTANTE: los perfiles de este archivo son DATOS DE DEMOSTRACIÓN.
 * Antes de publicar el sitio debes sustituirlos por profesionales reales,
 * con su consentimiento y con un proceso de verificación de licencia y
 * credenciales documentado. Ver README.md → "Pasar a producción".
 */

export const SPECIALTIES = [
  {
    id: 'ansiedad',
    label: 'Ansiedad',
    blurb: 'Preocupación constante, ataques de pánico, fobias y nerviosismo.',
  },
  {
    id: 'depresion',
    label: 'Depresión y ánimo',
    blurb: 'Tristeza persistente, falta de energía, desmotivación o vacío.',
  },
  {
    id: 'estres',
    label: 'Estrés y burnout',
    blurb: 'Agotamiento, presión laboral, dificultad para desconectar.',
  },
  {
    id: 'duelo',
    label: 'Duelo y pérdida',
    blurb: 'Pérdida de un ser querido, rupturas, cambios vitales.',
  },
  {
    id: 'pareja',
    label: 'Pareja y familia',
    blurb: 'Conflictos, comunicación, límites y vínculos familiares.',
  },
  {
    id: 'autoestima',
    label: 'Autoestima',
    blurb: 'Autocrítica, inseguridad, dificultad para poner límites.',
  },
  {
    id: 'trauma',
    label: 'Trauma',
    blurb: 'Experiencias difíciles, estrés postraumático y seguridad emocional.',
  },
  {
    id: 'tdah',
    label: 'TDAH adulto',
    blurb: 'Concentración, impulsividad, organización y sobrecarga.',
  },
  {
    id: 'adolescentes',
    label: 'Adolescentes',
    blurb: 'Acompañamiento a jóvenes y orientación a sus familias.',
  },
  {
    id: 'tca',
    label: 'Conducta alimentaria',
    blurb: 'Relación con la comida, la imagen corporal y el cuerpo.',
  },
  {
    id: 'sueno',
    label: 'Sueño',
    blurb: 'Insomnio, rutinas de descanso y ansiedad nocturna.',
  },
  {
    id: 'adicciones',
    label: 'Adicciones',
    blurb: 'Consumo de sustancias, juego y conductas compulsivas.',
  },
] as const

export type SpecialtyId = (typeof SPECIALTIES)[number]['id']
export type Modality = 'video' | 'chat' | 'telefono'
export type ProfessionalRole = 'psicologo' | 'psiquiatra'

export const MODALITY_LABELS: Record<Modality, string> = {
  video: 'Videollamada',
  chat: 'Mensajería',
  telefono: 'Llamada',
}

export const ROLE_LABELS: Record<ProfessionalRole, string> = {
  psicologo: 'Psicólogo/a clínico/a',
  psiquiatra: 'Psiquiatra',
}

export interface Professional {
  slug: string
  name: string
  role: ProfessionalRole
  /** Titulación que aparece junto al nombre. */
  title: string
  /** Los perfiles de muestra nunca deben mostrarse como verificados. */
  verification: 'demo' | 'verified'
  experienceYears: number
  location: string
  country: string
  languages: string[]
  specialties: SpecialtyId[]
  modalities: Modality[]
  /** Precio orientativo por sesión de 50 minutos, en USD. */
  priceUsd: number
  bio: string
  approach: string
  focusTags: string[]
  credentials: string[]
  sessionIncludes: string[]
  availabilityNote: string
  nextSlot: string
  featured?: boolean
  avatarTone: number
}

export const PROFESSIONALS: Professional[] = [
  {
    slug: 'valentina-rios',
    name: 'Valentina Ríos',
    role: 'psicologo',
    title: 'Psicóloga clínica · Terapia cognitivo-conductual',
    verification: 'demo',
    experienceYears: 9,
    location: 'Ciudad de México',
    country: 'México',
    languages: ['Español', 'Inglés'],
    specialties: ['ansiedad', 'estres', 'sueno'],
    modalities: ['video', 'chat'],
    priceUsd: 45,
    bio: 'Acompaño a personas adultas que viven con ansiedad, preocupación constante o dificultades para descansar. Mi trabajo se centra en entender qué mantiene el malestar y construir herramientas que puedas usar en tu día a día.',
    approach:
      'Trabajo desde la terapia cognitivo-conductual con un enfoque cálido y colaborativo. No se trata de "pensar positivo", sino de mirar tus pensamientos y hábitos con curiosidad, sin juicio, y probar cambios pequeños y sostenibles.',
    focusTags: ['ataques de pánico', 'preocupación excesiva', 'insomnio', 'presión laboral'],
    credentials: [
      'Licenciatura en Psicología — universidad acreditada (demo)',
      'Máster en Psicología Clínica y de la Salud (demo)',
      'Formación en terapia cognitivo-conductual para ansiedad (demo)',
      'Cédula profesional 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Videollamada de 50 minutos',
      'Plan de trabajo personalizado',
      'Ejercicios prácticos entre sesiones',
      'Mensajería breve para dudas puntuales',
    ],
    availabilityNote: 'Atiende de lunes a jueves, con horarios de mañana y tarde.',
    nextSlot: 'Esta semana',
    featured: true,
    avatarTone: 0,
  },
  {
    slug: 'mateo-herrera',
    name: 'Mateo Herrera',
    role: 'psiquiatra',
    title: 'Psiquiatra · Adultos',
    verification: 'demo',
    experienceYears: 12,
    location: 'Bogotá',
    country: 'Colombia',
    languages: ['Español'],
    specialties: ['depresion', 'ansiedad', 'tdah'],
    modalities: ['video', 'telefono'],
    priceUsd: 70,
    bio: 'Atiendo a personas adultas con depresión, ansiedad y dificultades de atención. Mi objetivo es que entiendas tu situación y las opciones disponibles, incluyendo —cuando hace falta— el papel de la medicación.',
    approach:
      'Realizo una evaluación cuidadosa antes de proponer cualquier tratamiento. Explico beneficios, riesgos y alternativas, y reviso contigo la evolución. La medicación nunca sustituye el acompañamiento psicológico ni tu propio contexto de vida.',
    focusTags: ['depresión', 'trastorno de ansiedad', 'TDAH adulto', 'evaluación psiquiátrica'],
    credentials: [
      'Médico cirujano — universidad acreditada (demo)',
      'Especialidad en Psiquiatría (demo)',
      'Formación en evaluación y seguimiento de trastornos del estado de ánimo (demo)',
      'Registro profesional 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Primera evaluación de 60 minutos',
      'Revisión de historia clínica y objetivos',
      'Plan de tratamiento explicado',
      'Seguimiento y ajustes cuando corresponda',
    ],
    availabilityNote: 'Primera consulta en 60 minutos; seguimientos de 30 minutos.',
    nextSlot: 'En 2 días',
    featured: true,
    avatarTone: 1,
  },
  {
    slug: 'camila-duarte',
    name: 'Camila Duarte',
    role: 'psicologo',
    title: 'Psicóloga clínica · Trauma y duelo',
    verification: 'demo',
    experienceYears: 11,
    location: 'Buenos Aires',
    country: 'Argentina',
    languages: ['Español', 'Portugués'],
    specialties: ['duelo', 'trauma', 'ansiedad'],
    modalities: ['video', 'chat'],
    priceUsd: 40,
    bio: 'Acompaño procesos de duelo, rupturas y experiencias que dejaron una huella emocional. Mi prioridad es que te sientas en un espacio seguro, sin tener que contar todo de una vez.',
    approach:
      'Integro herramientas de terapia cognitivo-conductual y EMDR con una mirada respetuosa del ritmo de cada persona. Trabajamos estabilidad, recursos de regulación emocional y, cuando estés listo/a, el procesamiento de la experiencia.',
    focusTags: ['pérdida', 'ruptura', 'trauma', 'regulación emocional'],
    credentials: [
      'Licenciatura en Psicología — universidad acreditada (demo)',
      'Especialización en Psicología Clínica (demo)',
      'Formación en EMDR nivel II (demo)',
      'Matrícula profesional 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Videollamada de 50 minutos',
      'Acuerdos de seguridad y cuidado',
      'Herramientas de regulación emocional',
      'Seguimiento respetuoso del ritmo',
    ],
    availabilityNote: 'Atiende martes, jueves y sábados.',
    nextSlot: 'Esta semana',
    featured: true,
    avatarTone: 2,
  },
  {
    slug: 'andres-salas',
    name: 'Andrés Salas',
    role: 'psicologo',
    title: 'Psicólogo clínico · Parejas y familias',
    verification: 'demo',
    experienceYears: 14,
    location: 'Santiago',
    country: 'Chile',
    languages: ['Español'],
    specialties: ['pareja', 'autoestima', 'estres'],
    modalities: ['video'],
    priceUsd: 55,
    bio: 'Trabajo con parejas y familias que quieren entender sus conflictos y encontrar formas más claras de comunicarse. También acompaño a personas que sienten que siempre están cediendo demasiado.',
    approach:
      'Uso un enfoque sistémico: los problemas no viven en una sola persona, sino en la forma en que nos relacionamos. Trabajamos patrones, límites y acuerdos concretos, con tareas para probar entre sesiones.',
    focusTags: ['comunicación', 'conflictos de pareja', 'límites', 'familia'],
    credentials: [
      'Licenciatura en Psicología — universidad acreditada (demo)',
      'Máster en Terapia Familiar Sistémica (demo)',
      'Formación en mediación de conflictos (demo)',
      'Registro profesional 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Sesión de pareja o familia de 60 minutos',
      'Mapa de patrones y acuerdos',
      'Tareas concretas entre sesiones',
      'Sesiones individuales si se requieren',
    ],
    availabilityNote: 'Atiende miércoles a viernes y sábados por la mañana.',
    nextSlot: 'Próxima semana',
    avatarTone: 3,
  },
  {
    slug: 'lucia-ferrer',
    name: 'Lucía Ferrer',
    role: 'psiquiatra',
    title: 'Psiquiatra · Ansiedad y TDAH adulto',
    verification: 'demo',
    experienceYears: 8,
    location: 'Madrid',
    country: 'España',
    languages: ['Español', 'Inglés'],
    specialties: ['ansiedad', 'tdah', 'depresion'],
    modalities: ['video'],
    priceUsd: 65,
    bio: 'Me dedico a la evaluación y seguimiento de ansiedad, TDAH adulto y trastornos del estado de ánimo. Explico cada paso con claridad para que puedas decidir de forma informada.',
    approach:
      'Mi práctica combina evaluación clínica rigurosa, psicoeducación y un plan de tratamiento dialogado. Cuando la medicación es una opción, revisamos expectativas, efectos y alternativas antes de comenzar.',
    focusTags: ['ansiedad', 'TDAH adulto', 'medicación', 'evaluación'],
    credentials: [
      'Licenciatura en Medicina — universidad acreditada (demo)',
      'Especialidad en Psiquiatría (demo)',
      'Formación en TDAH en adultos (demo)',
      'Número de colegiado 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Evaluación inicial de 60 minutos',
      'Revisión de antecedentes y objetivos',
      'Plan de tratamiento por escrito',
      'Seguimientos de 30 minutos',
    ],
    availabilityNote: 'Atiende lunes, martes y jueves por la tarde.',
    nextSlot: 'En 3 días',
    avatarTone: 4,
  },
  {
    slug: 'renata-alves',
    name: 'Renata Alves',
    role: 'psicologo',
    title: 'Psicóloga clínica · Autoestima y cuerpo',
    verification: 'demo',
    experienceYears: 7,
    location: 'Lima',
    country: 'Perú',
    languages: ['Español', 'Portugués'],
    specialties: ['autoestima', 'tca', 'ansiedad'],
    modalities: ['video', 'chat'],
    priceUsd: 35,
    bio: 'Acompaño a personas que quieren mejorar su relación consigo mismas, con su cuerpo y con la comida. Trabajo sin discursos de culpa ni metas imposibles.',
    approach:
      'Parto de una mirada compasiva y basada en evidencia. Exploramos de dónde vienen tus exigencias, cómo afectan tu día a día y qué cambios pequeños pueden ayudarte a sentir más calma y libertad.',
    focusTags: ['autoestima', 'imagen corporal', 'relación con la comida', 'autocrítica'],
    credentials: [
      'Licenciatura en Psicología — universidad acreditada (demo)',
      'Especialización en Psicología Clínica (demo)',
      'Formación en trastornos de la conducta alimentaria (demo)',
      'Colegiatura 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Sesión de 50 minutos',
      'Espacio libre de juicios',
      'Ejercicios de autoobservación',
      'Coordinación con otros profesionales si hace falta',
    ],
    availabilityNote: 'Atiende de lunes a viernes por la mañana y noche.',
    nextSlot: 'Esta semana',
    avatarTone: 5,
  },
  {
    slug: 'julian-mora',
    name: 'Julián Mora',
    role: 'psicologo',
    title: 'Psicólogo clínico · Adolescentes',
    verification: 'demo',
    experienceYears: 10,
    location: 'Monterrey',
    country: 'México',
    languages: ['Español'],
    specialties: ['adolescentes', 'ansiedad', 'pareja'],
    modalities: ['video', 'telefono'],
    priceUsd: 50,
    bio: 'Trabajo con adolescentes y sus familias en etapas de cambios, conflictos y presión escolar o social. Incluyo a la familia cuando es útil, siempre cuidando la confidencialidad del joven.',
    approach:
      'Construyo primero un vínculo de confianza. Después trabajamos habilidades para manejar ansiedad, comunicación y toma de decisiones. Con los cuidadores acordamos pautas claras y realistas.',
    focusTags: ['adolescentes', 'familia', 'ansiedad escolar', 'comunicación'],
    credentials: [
      'Licenciatura en Psicología — universidad acreditada (demo)',
      'Máster en Psicología Infantil y Adolescente (demo)',
      'Formación en terapia familiar (demo)',
      'Cédula profesional 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Primera entrevista con el/la adolescente',
      'Sesión de orientación con cuidadores',
      'Plan de acompañamiento',
      'Coordinación con la escuela si se autoriza',
    ],
    availabilityNote: 'Atiende lunes a viernes después de las 15:00.',
    nextSlot: 'Próxima semana',
    avatarTone: 6,
  },
  {
    slug: 'sofia-ledesma',
    name: 'Sofía Ledesma',
    role: 'psicologo',
    title: 'Psicóloga clínica · Estrés y burnout',
    verification: 'demo',
    experienceYears: 13,
    location: 'Valencia',
    country: 'España',
    languages: ['Español', 'Inglés'],
    specialties: ['estres', 'ansiedad', 'sueno'],
    modalities: ['video', 'chat'],
    priceUsd: 48,
    bio: 'Ayudo a personas que sienten que ya no pueden más con el trabajo, el estudio o las responsabilidades. Mi enfoque es práctico y humano: recuperar energía, poner límites y volver a sentirte tú.',
    approach:
      'Combino terapia cognitivo-conductual, psicoeducación sobre estrés y prácticas de mindfulness basadas en evidencia. Revisamos tu carga real de demandas y diseñamos cambios sostenibles, no soluciones mágicas.',
    focusTags: ['burnout', 'agotamiento', 'límites', 'descanso'],
    credentials: [
      'Licenciatura en Psicología — universidad acreditada (demo)',
      'Máster en Psicología Clínica (demo)',
      'Formación en mindfulness basado en evidencia (demo)',
      'Número de colegiado 00000000 (dato de muestra)',
    ],
    sessionIncludes: [
      'Sesión de 50 minutos',
      'Análisis de fuentes de estrés',
      'Plan de recuperación y límites',
      'Prácticas breves de regulación',
    ],
    availabilityNote: 'Atiende de martes a viernes por la tarde.',
    nextSlot: 'Esta semana',
    avatarTone: 7,
  },
]

export function getProfessional(slug: string | undefined): Professional | undefined {
  return PROFESSIONALS.find((professional) => professional.slug === slug)
}

export function getSpecialty(id: string) {
  return SPECIALTIES.find((specialty) => specialty.id === id)
}

export function specialtyLabel(id: string): string {
  return getSpecialty(id)?.label ?? id
}

export function formatPrice(priceUsd: number): string {
  return `US$${priceUsd}`
}
