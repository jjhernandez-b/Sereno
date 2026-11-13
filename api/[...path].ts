/**
 * Punto de entrada serverless para Vercel.
 * El catch-all reenvía /api/* a la app Express.
 */
import { app } from '../server/app'

export default app
