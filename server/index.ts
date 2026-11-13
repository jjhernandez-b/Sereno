/**
 * Servidor local de desarrollo.
 * En Vercel la app Express se expone desde api/[...path].ts.
 */

export {}

try {
  process.loadEnvFile('.env')
} catch {
  // No hay archivo .env; se usan las variables del entorno.
}

const { app } = await import('./app')

const port = Number(process.env.PORT ?? 3001)

app.listen(port, () => {
  console.info(`[sereno] API escuchando en http://localhost:${port}`)
})
