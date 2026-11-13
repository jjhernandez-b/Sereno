import { z } from 'zod'
import { SPECIALTIES, type Modality } from './professionals'

export const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+', 'menor-18'] as const
export type AgeRange = (typeof AGE_RANGES)[number]

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '18-24': '18 a 24 años',
  '25-34': '25 a 34 años',
  '35-44': '35 a 44 años',
  '45-54': '45 a 54 años',
  '55+': '55 años o más',
  'menor-18': 'Menor de 18 años',
}

export const CONTACT_REASONS = [...SPECIALTIES.map((specialty) => specialty.id), 'no-se'] as const
export type ContactReason = (typeof CONTACT_REASONS)[number]

export const CONTACT_REASON_LABELS: Record<ContactReason, string> = {
  ...(Object.fromEntries(SPECIALTIES.map((specialty) => [specialty.id, specialty.label])) as Record<
    (typeof SPECIALTIES)[number]['id'],
    string
  >),
  'no-se': 'No estoy seguro/a todavía',
}

export const PREFERRED_TIMES = ['manana', 'tarde', 'noche', 'fin-de-semana', 'flexible'] as const
export type PreferredTime = (typeof PREFERRED_TIMES)[number]

export const PREFERRED_TIME_LABELS: Record<PreferredTime, string> = {
  manana: 'Mañana (08:00–12:00)',
  tarde: 'Tarde (12:00–18:00)',
  noche: 'Noche (18:00–22:00)',
  'fin-de-semana': 'Fin de semana',
  flexible: 'Me adapto / flexible',
}

export const CONTACT_MODALITIES = ['video', 'chat', 'telefono', 'indiferente'] as const
export type ContactModality = (typeof CONTACT_MODALITIES)[number]

export const CONTACT_MODALITY_LABELS: Record<ContactModality, string> = {
  video: 'Videollamada',
  chat: 'Mensajería',
  telefono: 'Llamada telefónica',
  indiferente: 'Me es indiferente',
}

export const MODALITY_TO_CONTACT: Record<Modality, ContactModality> = {
  video: 'video',
  chat: 'chat',
  telefono: 'telefono',
}

export const contactRequestSchema = z.object({
  professionalSlug: z.string().trim().min(1).max(80),
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Escribe tu nombre (mínimo 2 caracteres).' })
    .max(80, { message: 'El nombre es demasiado largo.' }),
  email: z
    .email({ message: 'Escribe un correo electrónico válido.' })
    .max(160, { message: 'El correo es demasiado largo.' }),
  phone: z
    .string()
    .trim()
    .max(30, { message: 'El teléfono es demasiado largo.' })
    .optional()
    .default(''),
  ageRange: z.enum(AGE_RANGES, { message: 'Selecciona tu rango de edad.' }),
  country: z
    .string()
    .trim()
    .max(60, { message: 'El país o ciudad es demasiado largo.' })
    .optional()
    .default(''),
  reason: z.enum(CONTACT_REASONS, { message: 'Selecciona un motivo de consulta.' }),
  message: z
    .string()
    .trim()
    .min(20, { message: 'Cuéntanos un poco más (mínimo 20 caracteres).' })
    .max(1200, { message: 'El mensaje no puede superar los 1200 caracteres.' }),
  preferredTime: z.enum(PREFERRED_TIMES, { message: 'Selecciona un horario de preferencia.' }),
  modality: z.enum(CONTACT_MODALITIES, { message: 'Selecciona una modalidad.' }),
  consentPrivacy: z.boolean().refine((value) => value === true, {
    message: 'Necesitamos tu consentimiento para tratar tus datos.',
  }),
  consentContact: z.boolean().refine((value) => value === true, {
    message: 'Necesitamos tu permiso para contactarte.',
  }),
  acknowledgeEmergency: z.boolean().refine((value) => value === true, {
    message: 'Confirma que entiendes que este servicio no es una línea de emergencia.',
  }),
  /** Campo trampa para bots: debe llegar vacío. */
  website: z.string().max(0).optional().default(''),
})

export type ContactRequestInput = z.input<typeof contactRequestSchema>
export type ContactRequestData = z.output<typeof contactRequestSchema>

export interface ContactRequestResponse {
  ok: true
  reference: string
  receivedAt: string
  emailNotified: boolean
  persisted: boolean
  message: string
}

export interface ContactConfirmation {
  reference: string
  professionalName: string
  professionalTitle: string
  receivedAt: string
  emailNotified: boolean
  persisted: boolean
}

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (key && !result[key]) result[key] = issue.message
  }
  return result
}
