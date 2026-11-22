import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import { app } from '../server/app'

let server: Server
let base = ''
const previousPassword = process.env.ADMIN_PASSWORD
const previousSecret = process.env.ADMIN_SESSION_SECRET

beforeAll(async () => {
  process.env.ADMIN_PASSWORD = 'clave-de-prueba-segura'
  process.env.ADMIN_SESSION_SECRET = 'secreto-de-prueba-suficientemente-largo'
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve())
  })
  const address = server.address()
  if (typeof address === 'object' && address) {
    base = `http://127.0.0.1:${address.port}`
  }
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })

  if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD
  else process.env.ADMIN_PASSWORD = previousPassword
  if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET
  else process.env.ADMIN_SESSION_SECRET = previousSecret
})

async function call(path: string, init?: RequestInit) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null
  return { response, body }
}

describe('API pública de profesionales', () => {
  it('devuelve los perfiles de ejemplo cuando no hay Supabase', async () => {
    const { response, body } = await call('/api/professionals')

    expect(response.status).toBe(200)
    expect(body?.ok).toBe(true)
    expect(body?.source).toBe('demo')
    expect(body?.count).toBe(8)
  })

  it('permite consultar un perfil de ejemplo por slug', async () => {
    const { response, body } = await call('/api/professionals/valentina-rios')

    expect(response.status).toBe(200)
    expect((body?.professional as { name?: string } | undefined)?.name).toBe('Valentina Ríos')
  })

  it('devuelve 404 para un perfil inexistente', async () => {
    const { response } = await call('/api/professionals/no-existe')
    expect(response.status).toBe(404)
  })
})

describe('API del panel', () => {
  it('rechaza el acceso sin token', async () => {
    const { response, body } = await call('/api/admin/professionals')

    expect(response.status).toBe(401)
    expect(body?.error).toBe('unauthorized')
  })

  it('protege el listado de solicitudes sin token', async () => {
    const { response, body } = await call('/api/admin/contact-requests')

    expect(response.status).toBe(401)
    expect(body?.error).toBe('unauthorized')
  })

  it('rechaza una contraseña incorrecta', async () => {
    const { response, body } = await call('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'incorrecta' }),
    })

    expect(response.status).toBe(401)
    expect(body?.error).toBe('invalid_credentials')
  })

  it('rechaza un cuerpo de login vacío', async () => {
    const { response } = await call('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
  })

  it('inicia sesión, consulta la sesión y lista profesionales en modo memoria', async () => {
    const login = await call('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'clave-de-prueba-segura' }),
    })

    expect(login.response.status).toBe(200)
    const token = login.body?.token
    expect(typeof token).toBe('string')
    if (typeof token !== 'string') return

    const session = await call('/api/admin/session', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(session.response.status).toBe(200)
    expect(session.body?.storage).toBe('memory')

    const list = await call('/api/admin/professionals', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(list.response.status).toBe(200)
    expect(list.body?.storage).toBe('memory')
    expect(list.body?.professionals).toEqual([])

    const logout = await call('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(logout.response.status).toBe(200)
  })

  it('lista las solicitudes recibidas en modo memoria', async () => {
    const created = await call('/api/contact-requests', {
      method: 'POST',
      body: JSON.stringify({
        professionalSlug: 'valentina-rios',
        fullName: 'Lucía Romero',
        email: 'lucia@example.com',
        phone: '+58 412 0000000',
        ageRange: '25-34',
        country: 'Caracas',
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
    expect(created.response.status).toBe(201)

    const login = await call('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'clave-de-prueba-segura' }),
    })
    const token = login.body?.token as string

    const list = await call('/api/admin/contact-requests', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(list.response.status).toBe(200)
    expect(list.body?.storage).toBe('memory')
    expect(list.body?.count).toBeGreaterThanOrEqual(1)
    expect((list.body?.requests as Array<Record<string, unknown>>)[0]).toMatchObject({
      fullName: 'Lucía Romero',
      professionalName: 'Valentina Ríos',
      email: 'lucia@example.com',
    })
  })

  it('rechaza tokens manipulados', async () => {
    const { response } = await call('/api/admin/professionals', {
      headers: { Authorization: 'Bearer token-inventado.firma-falsa' },
    })

    expect(response.status).toBe(401)
  })

  it('devuelve 503 al crear o retirar sin Supabase configurado', async () => {
    const login = await call('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'clave-de-prueba-segura' }),
    })
    const token = login.body?.token as string

    const created = await call('/api/admin/professionals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Ana Martínez',
        specialties: ['ansiedad'],
        languages: ['Español'],
        experienceYears: 8,
        priceUsd: 45,
      }),
    })
    expect(created.response.status).toBe(503)
    expect(created.body?.error).toBe('storage_not_configured')

    const deleted = await call('/api/admin/professionals/anamartinez', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(deleted.response.status).toBe(503)
  })

  it('valida los datos del profesional antes de guardar', async () => {
    const login = await call('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'clave-de-prueba-segura' }),
    })
    const token = login.body?.token as string

    const created = await call('/api/admin/professionals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'A', specialties: [], languages: [], experienceYears: 0, priceUsd: 0 }),
    })

    expect(created.response.status).toBe(400)
    expect(created.body?.error).toBe('validation_error')
    expect(created.body?.fieldErrors).toMatchObject({ name: expect.any(String) })
  })

  it('informa en /api/health que el panel está configurado', async () => {
    const { body } = await call('/api/health')
    expect(body?.adminConfigured).toBe(true)
  })
})
