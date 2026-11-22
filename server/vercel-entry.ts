/**
 * Entrada de la función de Vercel.
 *
 * Este archivo se empaqueta con esbuild en `api/index.js` durante `npm run build`.
 * Así la función serverless es autocontenida y no depende de que Vercel incluya
 * por separado el directorio `server/`, algo que su tracer no hace de forma
 * fiable con importaciones relativas sin extensión.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { app } from './app'

type ServerHandler = (req: IncomingMessage, res: ServerResponse) => void

const expressApp = app as unknown as ServerHandler

const handler: ServerHandler = (req, res) => {
  try {
    expressApp(req, res)
  } catch (error) {
    console.error('[sereno] Error inesperado en la API de Vercel.', error)

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

export default handler
