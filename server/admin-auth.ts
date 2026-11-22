import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

interface AdminTokenPayload {
  sub: 'developer'
  iat: number
  exp: number
}

const DEFAULT_SESSION_HOURS = 8

function adminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim()
  return password ? password : null
}

function adminSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET?.trim() || adminPassword()
}

function sessionTtlMs(): number {
  const configured = Number(process.env.ADMIN_SESSION_HOURS)
  const hours = Number.isFinite(configured) && configured > 0 ? Math.min(configured, 168) : DEFAULT_SESSION_HOURS
  return hours * 60 * 60 * 1000
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

/** El panel solo existe si el desarrollador definió ADMIN_PASSWORD. */
export function isAdminConfigured(): boolean {
  return adminPassword() !== null
}

export function verifyAdminPassword(candidate: string): boolean {
  const password = adminPassword()
  if (!password) return false
  return timingSafeEqual(digest(candidate), digest(password))
}

export function createAdminToken(now = Date.now()): { token: string; expiresAt: string } | null {
  const secret = adminSecret()
  if (!secret) return null

  const expiresAt = now + sessionTtlMs()
  const payload: AdminTokenPayload = { sub: 'developer', iat: now, exp: expiresAt }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url')

  return { token: `${encoded}.${signature}`, expiresAt: new Date(expiresAt).toISOString() }
}

export function verifyAdminToken(token: string | undefined, now = Date.now()): AdminTokenPayload | null {
  const secret = adminSecret()
  if (!secret || !token) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encoded, signature] = parts
  if (!encoded || !signature) return null

  const expected = createHmac('sha256', secret).update(encoded).digest('base64url')
  if (!safeEqual(signature, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<AdminTokenPayload>
    if (payload.sub !== 'developer') return null
    if (typeof payload.exp !== 'number' || payload.exp <= now) return null
    if (typeof payload.iat !== 'number') return null
    return payload as AdminTokenPayload
  } catch {
    return null
  }
}

/** Middleware para las rutas /api/admin/*. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminConfigured()) {
    res.status(503).json({
      ok: false,
      error: 'admin_disabled',
      message: 'El panel no está configurado. Define ADMIN_PASSWORD en las variables del servidor.',
    })
    return
  }

  const header = req.header('authorization') ?? ''
  const [scheme, token] = header.split(' ')
  const session = scheme?.toLowerCase() === 'bearer' ? verifyAdminToken(token) : null

  if (!session) {
    res.status(401).json({
      ok: false,
      error: 'unauthorized',
      message: 'La sesión del panel no es válida o ha caducado. Vuelve a iniciar sesión.',
    })
    return
  }

  next()
}
