import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { PROFESSIONALS, getProfessional } from '../shared/professionals'
import { HOTLINES } from '../shared/crisis'
import { contactRequestSchema, toFieldErrors } from '../shared/contact'
import { sendContactNotification } from './email'
import { persistContactRequest, storageMode, toStoredRequest } from './store'

export const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: configuredOrigins.length > 0 ? configuredOrigins : true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
  }),
)

app.use(express.json({ limit: '32kb' }))

const configuredLimit = Number(process.env.CONTACT_RATE_LIMIT_MAX)
const contactLimit =
  Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 5

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: contactLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'rate_limited',
    message: 'Recibimos varias solicitudes desde esta conexión. Inténtalo de nuevo en unos minutos.',
  },
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'sereno-api',
    storage: storageMode(),
    emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_EMAIL),
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/professionals', (_req: Request, res: Response) => {
  res.json({ ok: true, count: PROFESSIONALS.length, professionals: PROFESSIONALS })
})

app.get('/api/professionals/:slug', (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
  const professional = getProfessional(slug)
  if (!professional) {
    res.status(404).json({ ok: false, error: 'not_found', message: 'Profesional no encontrado.' })
    return
  }
  res.json({ ok: true, professional })
})

app.get('/api/crisis-resources', (_req: Request, res: Response) => {
  res.json({ ok: true, hotlines: HOTLINES })
})

app.post('/api/contact-requests', contactLimiter, async (req: Request, res: Response) => {
  const parsed = contactRequestSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: 'validation_error',
      message: 'Revisa los campos marcados e inténtalo de nuevo.',
      fieldErrors: toFieldErrors(parsed.error),
    })
    return
  }

  const data = parsed.data
  const professional = getProfessional(data.professionalSlug)

  if (!professional) {
    res.status(404).json({
      ok: false,
      error: 'professional_not_found',
      message: 'El profesional seleccionado ya no está disponible.',
    })
    return
  }

  const request = toStoredRequest(data, professional.name)

  const [storageResult, emailResult] = await Promise.all([
    persistContactRequest(request),
    sendContactNotification(request),
  ])

  console.info(
    `[sereno] Solicitud ${request.reference} · ${professional.slug} · almacenada=${storageResult.persisted} · email=${emailResult.sent}`,
  )

  res.status(201).json({
    ok: true,
    reference: request.reference,
    receivedAt: request.createdAt,
    persisted: storageResult.persisted,
    emailNotified: emailResult.sent,
    message:
      'Tu solicitud fue enviada. El equipo de Sereno te contactará por correo en un plazo orientativo de 24 a 48 horas hábiles.',
  })
})

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ ok: false, error: 'not_found', message: 'Ruta no encontrada.' })
})

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const isBodyError =
    typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.parse.failed'

  if (isBodyError) {
    res.status(400).json({ ok: false, error: 'invalid_json', message: 'El cuerpo de la solicitud no es válido.' })
    return
  }

  console.error('[sereno] Error inesperado en la API.', error)
  res.status(500).json({
    ok: false,
    error: 'internal_error',
    message: 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.',
  })
})
