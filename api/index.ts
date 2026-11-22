/**
 * Punto de entrada serverless para Vercel.
 *
 * `vercel.json` reenvía todas las peticiones /api/* a esta función. Vercel
 * conserva la URL original en `req.url`, así que Express puede enrutar
 * /api/health, /api/admin/login, etc. sin cambios.
 *
 * La importación se hace dentro del handler y dentro de try/catch para que
 * cualquier error al cargar la API aparezca como JSON y en los logs, en vez
 * de un 500 vacío.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

type ServerHandler = (req: IncomingMessage, res: ServerResponse) => void

let appPromise: Promise<ServerHandler> | null = null

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    if (!appPromise) {
      appPromise = import('../server/app').then(({ app }) => app as unknown as ServerHandler)
    }

    const app = await appPromise
    app(req, res)
  } catch (error) {
    console.error('[sereno] Error al inicializar la API en Vercel.', error)

    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          ok: false,
          error: 'vercel_function_error',
          message: error instanceof Error ? error.message : String(error),
        }),
      )
    }
  }
}
