import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { HOTLINES } from '../shared/crisis'
import { contactRequestSchema, toFieldErrors } from '../shared/contact'
import { professionalInputSchema } from '../shared/professionals'
import { sendContactNotification } from './email'
import { listContactRequests, persistContactRequest, storageMode, toStoredRequest } from './store'
import {
  createAdminToken,
  isAdminConfigured,
  requireAdmin,
  verifyAdminPassword,
  verifyAdminToken,
} from './admin-auth'
import {
  createDatabaseProfessional,
  deleteDatabaseProfessional,
  findPublicProfessional,
  listDatabaseProfessionals,
  listPublicProfessionals,
  ProfessionalStorageNotConfiguredError,
} from './professionals-store'

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
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    ok: false,
    error: 'rate_limited',
    message: 'Demasiados intentos de acceso. Espera unos minutos antes de volver a intentarlo.',
  },
})

const adminLoginSchema = z.object({
  password: z.string().min(1, { message: 'Escribe la contraseña del panel.' }).max(200),
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'sereno-api',
    storage: storageMode(),
    adminConfigured: isAdminConfigured(),
    emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_EMAIL),
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/professionals', async (_req: Request, res: Response) => {
  const { professionals, source } = await listPublicProfessionals()
  res.json({ ok: true, count: professionals.length, source, professionals })
})

app.get('/api/professionals/:slug', async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
  const professional = await findPublicProfessional(slug)

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
  const professional = await findPublicProfessional(data.professionalSlug)

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

// --- Panel del desarrollador -------------------------------------------------

app.post('/api/admin/login', adminLoginLimiter, (req: Request, res: Response) => {
  if (!isAdminConfigured()) {
    res.status(503).json({
      ok: false,
      error: 'admin_disabled',
      message: 'El panel no está configurado. Define ADMIN_PASSWORD en las variables del servidor.',
    })
    return
  }

  const parsed = adminLoginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: 'validation_error',
      message: 'Escribe la contraseña del panel.',
    })
    return
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    res.status(401).json({
      ok: false,
      error: 'invalid_credentials',
      message: 'La contraseña no es correcta.',
    })
    return
  }

  const session = createAdminToken()
  if (!session) {
    res.status(503).json({
      ok: false,
      error: 'admin_disabled',
      message: 'No se pudo crear la sesión del panel. Revisa la configuración del servidor.',
    })
    return
  }

  res.json({ ok: true, token: session.token, expiresAt: session.expiresAt })
})

app.get('/api/admin/session', requireAdmin, (req: Request, res: Response) => {
  const header = req.header('authorization') ?? ''
  const token = header.split(' ')[1]
  const session = verifyAdminToken(token)

  res.json({
    ok: true,
    expiresAt: session ? new Date(session.exp).toISOString() : null,
    storage: storageMode(),
  })
})

app.post('/api/admin/logout', requireAdmin, (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'Sesión finalizada en este dispositivo.' })
})

app.get('/api/admin/professionals', requireAdmin, async (_req: Request, res: Response) => {
  if (storageMode() === 'memory') {
    res.json({ ok: true, storage: 'memory', professionals: [] })
    return
  }

  const professionals = await listDatabaseProfessionals()
  if (!professionals) {
    res.status(500).json({
      ok: false,
      error: 'storage_error',
      message: 'No pudimos leer los profesionales de Supabase. Revisa la configuración y los logs.',
    })
    return
  }

  res.json({ ok: true, storage: 'supabase', professionals })
})

app.get('/api/admin/contact-requests', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { storage, requests } = await listContactRequests()
    res.json({ ok: true, storage, count: requests.length, requests })
  } catch (error) {
    console.error('[sereno] No se pudieron leer las solicitudes de contacto.', error)
    res.status(500).json({
      ok: false,
      error: 'storage_error',
      message:
        'No pudimos leer las solicitudes de Supabase. Revisa la configuración y los logs del servidor.',
    })
  }
})

app.post('/api/admin/professionals', requireAdmin, async (req: Request, res: Response) => {
  const parsed = professionalInputSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: 'validation_error',
      message: 'Revisa los campos marcados antes de guardar el profesional.',
      fieldErrors: toFieldErrors(parsed.error),
    })
    return
  }

  try {
    const professional = await createDatabaseProfessional(parsed.data)
    console.info(
      `[sereno] Profesional ${professional.slug} añadido al directorio (${professional.name}).`,
    )
    res.status(201).json({ ok: true, professional })
  } catch (error) {
    if (error instanceof ProfessionalStorageNotConfiguredError) {
      res.status(503).json({
        ok: false,
        error: 'storage_not_configured',
        message: error.message,
      })
      return
    }

    console.error('[sereno] No se pudo guardar el profesional.', error)
    res.status(500).json({
      ok: false,
      error: 'storage_error',
      message: 'No pudimos guardar el profesional en Supabase. Revisa la configuración y los logs.',
    })
  }
})

app.delete('/api/admin/professionals/:slug', requireAdmin, async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
  if (!slug) {
    res.status(400).json({ ok: false, error: 'invalid_slug', message: 'Slug no válido.' })
    return
  }

  try {
    const deleted = await deleteDatabaseProfessional(slug)
    if (!deleted) {
      res.status(404).json({
        ok: false,
        error: 'not_found',
        message: 'Ese profesional ya no existe en la base de datos.',
      })
      return
    }

    console.info(`[sereno] Profesional ${slug} retirado del directorio.`)
    res.json({ ok: true, deleted: true })
  } catch (error) {
    if (error instanceof ProfessionalStorageNotConfiguredError) {
      res.status(503).json({
        ok: false,
        error: 'storage_not_configured',
        message: error.message,
      })
      return
    }

    console.error('[sereno] No se pudo retirar el profesional.', error)
    res.status(500).json({
      ok: false,
      error: 'storage_error',
      message: 'No pudimos retirar el profesional de Supabase. Revisa la configuración y los logs.',
    })
  }
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
