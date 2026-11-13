import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'

const BROWSER_CANDIDATES = [
  process.env.QA_BROWSER_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean)

const EDGE = BROWSER_CANDIDATES.find((candidate) => existsSync(candidate))
const BASE = process.env.QA_BASE_URL ?? 'http://localhost:5173'

if (!EDGE) {
  console.error(
    'No se encontró Edge ni Chrome. Define QA_BROWSER_PATH con la ruta al ejecutable del navegador.',
  )
  process.exit(1)
}

const results = []
const failures = []

function record(name, ok, detail = '') {
  results.push({ name, ok, detail })
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`)
  console.log(`${ok ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true })

async function newPage(viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport, locale: 'es-ES' })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  return { context, page, consoleErrors, pageErrors }
}

const routes = [
  { path: '/', h1: /Tu mente merece/ },
  { path: '/profesionales', h1: /Encuentra a la persona/ },
  { path: '/profesionales/valentina-rios', h1: /Valentina Ríos/ },
  { path: '/solicitar/valentina-rios', h1: /Da el primer paso/ },
  { path: '/tests', h1: /Entiende lo que sientes/ },
  { path: '/tests/phq-9', h1: /PHQ-9/ },
  { path: '/tests/gad-7', h1: /GAD-7/ },
  { path: '/tests/who-5', h1: /WHO-5/ },
  { path: '/mi-progreso', h1: /Tu historia/ },
  { path: '/crisis', h1: /No tienes que sostener/ },
  { path: '/privacidad', h1: /Política de privacidad/ },
  { path: '/terminos', h1: /Términos de uso/ },
  { path: '/aviso-medico', h1: /Aviso médico/ },
  { path: '/ruta-inexistente', h1: /Esta página se perdió/ },
]

const { context, page, consoleErrors, pageErrors } = await newPage()

for (const route of routes) {
  const response = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)
  const heading = page.locator('h1').first()
  const headingText = (await heading.textContent())?.replace(/\s+/g, ' ').trim() ?? ''
  const status = response?.status() ?? 0
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  )
  record(
    `Ruta ${route.path}`,
    status === 200 && route.h1.test(headingText) && !overflow,
    `status=${status} h1="${headingText.slice(0, 60)}" overflow=${overflow}`,
  )
}

record(
  'Sin errores de consola en rutas',
  consoleErrors.length === 0,
  consoleErrors.slice(0, 3).join(' | '),
)
record('Sin excepciones de página en rutas', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '))

// --- Flujo completo de un test (GAD-7) -------------------------------------
await page.goto(`${BASE}/tests/gad-7`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Comenzar el test/ }).click()
await page.waitForTimeout(200)

for (let index = 0; index < 7; index += 1) {
  const questionCounter = await page.locator('text=/Pregunta \\d+ de 7/').count()
  if (questionCounter === 0) {
    record('Test GAD-7 · pregunta visible', false, `no se encontró el contador en el paso ${index + 1}`)
    break
  }
  await page.locator('label').filter({ hasText: 'Varios días' }).first().click()
  const nextButton = page.getByRole('button', { name: index === 6 ? /Ver mi resultado/ : /Siguiente/ })
  await nextButton.click()
  await page.waitForTimeout(100)
}

await page.waitForTimeout(400)
const resultHeading = (await page.locator('h1').first().textContent())?.trim() ?? ''
record('Test GAD-7 · muestra resultado', /Tu resultado del GAD-7/.test(resultHeading), resultHeading)

const stored = await page.evaluate(() => {
  const raw = window.localStorage.getItem('sereno:results:v1')
  return raw ? JSON.parse(raw) : []
})
record(
  'Test GAD-7 · guarda resultado en localStorage',
  Array.isArray(stored) && stored.length === 1 && stored[0].screeningId === 'gad-7',
  `guardados=${Array.isArray(stored) ? stored.length : 'n/a'}`,
)

await page.goto(`${BASE}/mi-progreso`, { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const progressText = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
record(
  'Progreso · muestra el resultado guardado',
  /GAD-7/.test(progressText) && /Tendencia por test/.test(progressText) && /1 resultado guardado/.test(progressText),
)

// --- Flujo de contacto ------------------------------------------------------
await page.goto(`${BASE}/solicitar/valentina-rios`, { waitUntil: 'networkidle' })
await page.getByLabel(/Nombre completo/).fill('Ana QA')
await page.getByLabel(/Correo electrónico/).fill('ana.qa@example.com')
await page.getByLabel(/Teléfono/).fill('+34 600 111 222')
await page.getByLabel(/Rango de edad/).selectOption('25-34')
await page.getByLabel(/País o ciudad/).fill('Madrid')
await page.getByLabel(/Motivo de consulta/).selectOption('ansiedad')
await page
  .getByLabel(/Cuéntanos brevemente/)
  .fill('Me gustaría hablar sobre la ansiedad y la preocupación constante de las últimas semanas.')
await page.getByLabel(/Horario preferido/).selectOption('tarde')
await page.locator('#campo-consentPrivacy').check()
await page.locator('#campo-consentContact').check()
await page.locator('#campo-acknowledgeEmergency').check()
await page.getByRole('button', { name: /Enviar solicitud/ }).click()

let navigated = true
try {
  await page.waitForURL('**/solicitud-recibida', { timeout: 15000 })
} catch {
  navigated = false
}
await page.waitForTimeout(400)

const confirmationText = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
const reference = await page
  .locator('text=/SR-[A-Z0-9]{6}/')
  .first()
  .textContent()
  .catch(() => null)
record(
  'Contacto · confirmación con referencia',
  navigated && /tu referencia/i.test(confirmationText) && /SR-[A-Z0-9]{6}/.test(reference ?? ''),
  navigated
    ? `referencia=${reference ?? 'no encontrada'} · ${confirmationText.slice(0, 80)}`
    : confirmationText.slice(0, 140),
)

await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const afterReloadText = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
record(
  'Contacto · referencia visible tras recargar',
  /SR-[A-Z0-9]{6}/.test(afterReloadText),
  afterReloadText.slice(0, 80),
)

// --- Validación del formulario ---------------------------------------------
await page.goto(`${BASE}/solicitar/valentina-rios`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Enviar solicitud/ }).click()
await page.waitForTimeout(300)
const validationText = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
record(
  'Contacto · muestra errores de validación',
  /Revisa los campos marcados/.test(validationText) && /Escribe tu nombre/.test(validationText),
)

// --- Móvil ------------------------------------------------------------------
const mobile = await newPage({ width: 390, height: 844 })
await mobile.page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await mobile.page.waitForTimeout(300)
const tabBarVisible = await mobile.page.getByRole('navigation', { name: 'Accesos rápidos' }).isVisible()
const mobileOverflow = await mobile.page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 2,
)
record('Móvil · barra de pestañas visible', tabBarVisible)
record('Móvil · sin desbordamiento horizontal', !mobileOverflow)

await mobile.page.goto(`${BASE}/tests/phq-9`, { waitUntil: 'networkidle' })
await mobile.page.getByRole('button', { name: /Comenzar el test/ }).click()
await mobile.page.waitForTimeout(250)
await mobile.page.locator('label').filter({ hasText: 'Casi todos los días' }).first().click()
const mobileOverflowTest = await mobile.page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 2,
)
record('Móvil · test sin desbordamiento', !mobileOverflowTest)
record(
  'Móvil · sin errores de consola',
  mobile.consoleErrors.length === 0,
  mobile.consoleErrors.slice(0, 2).join(' | '),
)

await browser.close()

console.log('\nResumen:', `${results.filter((item) => item.ok).length}/${results.length} comprobaciones OK`)
if (failures.length > 0) {
  console.error('Fallos:', failures)
  process.exitCode = 1
}
