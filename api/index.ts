/**
 * Punto de entrada serverless para Vercel.
 *
 * `vercel.json` reenvía todas las peticiones /api/* a esta función. Vercel
 * conserva la URL original en `req.url`, así que Express puede enrutar
 * /api/health, /api/admin/login, etc. sin cambios.
 *
 * Se usa `api/index.ts` en lugar de un catch-all `[...path]` porque el
 * catch-all de Functions suele fallar en rutas con varios segmentos.
 */
import { app } from '../server/app'

export default app
