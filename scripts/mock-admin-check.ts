/**
 * Comprobación manual: panel + Supabase falso (sin credenciales reales).
 * Ejecutar con: npx tsx scripts/mock-admin-check.ts
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

interface Row {
  [key: string]: unknown
}

const rows: Row[] = []
const contacts: Row[] = []

function send(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Range': `0-${Math.max(0, (Array.isArray(body) ? body.length : 1) - 1)}/*`,
  })
  res.end(payload)
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
  })
}

function wantsObject(req: IncomingMessage): boolean {
  return (req.headers.accept ?? '').includes('vnd.pgrst.object+json')
}

function eqValue(params: URLSearchParams, key: string): string | null {
  const raw = params.get(key)
  if (!raw || !raw.startsWith('eq.')) return null
  return raw.slice(3)
}

const mock = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1:54321')

  if (url.pathname === '/rest/v1/professionals') {
    if (req.method === 'GET') {
      const slug = eqValue(url.searchParams, 'slug')
      const found = slug ? rows.filter((row) => row.slug === slug) : rows
      if (wantsObject(req)) {
        if (found.length === 0) {
          send(res, 406, { code: 'PGRST116', message: 'no rows' })
          return
        }
        send(res, 200, found[0])
        return
      }
      send(res, 200, found)
      return
    }

    if (req.method === 'POST') {
      const parsed = JSON.parse((await readBody(req)) || '[]')
      const incoming = (Array.isArray(parsed) ? parsed : [parsed]) as Row[]
      const inserted = incoming.map((row) => ({ ...row, created_at: new Date().toISOString() }))
      rows.push(...inserted)

      if ((req.headers.prefer ?? '').includes('return=representation')) {
        if (wantsObject(req)) {
          send(res, 201, inserted[0])
          return
        }
        send(res, 201, inserted)
        return
      }
      res.writeHead(201)
      res.end()
      return
    }

    if (req.method === 'DELETE') {
      const slug = eqValue(url.searchParams, 'slug')
      const removed = slug ? rows.filter((row) => row.slug === slug) : []
      for (const row of removed) rows.splice(rows.indexOf(row), 1)
      send(res, 200, removed.map((row) => ({ slug: row.slug })))
      return
    }
  }

  if (url.pathname === '/rest/v1/contact_requests') {
    if (req.method === 'GET') {
      const limit = Number(url.searchParams.get('limit') ?? contacts.length)
      const order = url.searchParams.get('order') ?? ''
      const sorted = order.includes('desc')
        ? [...contacts].sort((a, b) =>
            String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')),
          )
        : contacts
      send(res, 200, sorted.slice(0, Number.isFinite(limit) ? limit : contacts.length))
      return
    }

    if (req.method === 'POST') {
      const parsed = JSON.parse((await readBody(req)) || '{}')
      contacts.push(parsed as Row)
      res.writeHead(201)
      res.end()
      return
    }
  }

  send(res, 404, { message: `mock sin ruta ${req.method} ${url.pathname}${url.search}` })
})

function check(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'} · ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) process.exitCode = 1
}

await new Promise<void>((resolve) => mock.listen(54321, '127.0.0.1', () => resolve()))
process.env.SUPABASE_URL = 'http://127.0.0.1:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key'
process.env.ADMIN_PASSWORD = 'clave-de-prueba-segura'
process.env.ADMIN_SESSION_SECRET = 'secreto-de-prueba-suficientemente-largo'
delete process.env.RESEND_API_KEY
delete process.env.CONTACT_NOTIFICATION_EMAIL

const { app } = await import('../server/app')
const api = app.listen(3011, '127.0.0.1')
await new Promise<void>((resolve) => api.once('listening', () => resolve()))
const base = 'http://127.0.0.1:3011'

async function call(path: string, init?: RequestInit) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null
  return { status: response.status, body }
}

const login = await call('/api/admin/login', {
  method: 'POST',
  body: JSON.stringify({ password: 'clave-de-prueba-segura' }),
})
const token = login.body?.token as string
check('login del panel', login.status === 200 && typeof token === 'string')

const auth = { Authorization: `Bearer ${token}` }

const emptyList = await call('/api/admin/professionals', { headers: auth })
check(
  'lista inicial vacía en Supabase',
  emptyList.status === 200 && (emptyList.body?.professionals as unknown[]).length === 0,
)

const created = await call('/api/admin/professionals', {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    name: 'María José Pérez',
    specialties: ['ansiedad', 'estres'],
    languages: ['Español', 'Inglés'],
    experienceYears: 9,
    priceUsd: 50,
    featured: true,
  }),
})
const professional = created.body?.professional as Record<string, unknown> | undefined
check(
  'crea profesional y genera slug',
  created.status === 201 && professional?.slug === 'maria-jose-perez',
  String(professional?.slug),
)
check('marca el perfil como publicado', professional?.verification === 'verified')
check('publica el perfil en el directorio', professional?.featured === true)

const duplicate = await call('/api/admin/professionals', {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    name: 'María José Pérez',
    specialties: ['depresion'],
    languages: ['Español'],
    experienceYears: 4,
    priceUsd: 40,
  }),
})
check(
  'resuelve slugs duplicados con sufijo',
  duplicate.status === 201 &&
    (duplicate.body?.professional as Record<string, unknown>)?.slug === 'maria-jose-perez-2',
  String((duplicate.body?.professional as Record<string, unknown>)?.slug),
)

const publicList = await call('/api/professionals')
check(
  'el sitio público usa la base de datos',
  publicList.status === 200 &&
    publicList.body?.source === 'database' &&
    publicList.body?.count === 2,
  `source=${String(publicList.body?.source)} count=${String(publicList.body?.count)}`,
)

const publicProfile = await call('/api/professionals/maria-jose-perez')
check(
  'la ficha pública del profesional nuevo responde',
  publicProfile.status === 200 &&
    (publicProfile.body?.professional as Record<string, unknown>)?.name === 'María José Pérez',
)

const contact = await call('/api/contact-requests', {
  method: 'POST',
  body: JSON.stringify({
    professionalSlug: 'maria-jose-perez',
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
  }),
})
check(
  'acepta solicitudes para profesionales de la base de datos',
  contact.status === 201 && contact.body?.persisted === true,
  `status=${contact.status} persisted=${String(contact.body?.persisted)}`,
)

const requestList = await call('/api/admin/contact-requests', { headers: auth })
const listedRequests = requestList.body?.requests as Array<Record<string, unknown>> | undefined
check(
  'muestra las solicitudes recibidas en el panel',
  requestList.status === 200 &&
    requestList.body?.storage === 'supabase' &&
    requestList.body?.count === 1 &&
    listedRequests?.[0]?.fullName === 'Ana Pérez',
  `status=${requestList.status} count=${String(requestList.body?.count)}`,
)

const deleted = await call('/api/admin/professionals/maria-jose-perez', {
  method: 'DELETE',
  headers: auth,
})
check('retira el profesional', deleted.status === 200 && deleted.body?.deleted === true)

const afterDelete = await call('/api/professionals')
check(
  'al quedar un perfil, sigue usando la base de datos',
  afterDelete.body?.source === 'database' && afterDelete.body?.count === 1,
  `source=${String(afterDelete.body?.source)} count=${String(afterDelete.body?.count)}`,
)

await call('/api/admin/professionals/maria-jose-perez-2', { method: 'DELETE', headers: auth })
const backToDemo = await call('/api/professionals')
check(
  'sin perfiles en la base de datos vuelve a los datos de ejemplo',
  backToDemo.body?.source === 'demo' && backToDemo.body?.count === 8,
  `source=${String(backToDemo.body?.source)} count=${String(backToDemo.body?.count)}`,
)

console.log(`\nSolicitudes guardadas en el Supabase falso: ${contacts.length}`)

await new Promise<void>((resolve) => api.close(() => resolve()))
await new Promise<void>((resolve) => mock.close(() => resolve()))
