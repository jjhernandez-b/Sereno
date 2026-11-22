# Sereno · Terapia online a tu ritmo

Plataforma de demostración de salud mental y telemedicina, inspirada en servicios como BetterHelp. Incluye directorio de profesionales, flujo de solicitud de primera conversación, tests de tamizaje validados y recursos de crisis, con una interfaz cálida y responsive en español.

> **Aviso importante:** los tests son herramientas de tamizaje, **no diagnósticos**. Antes de abrir el servicio al público, verifica cada licencia, completa la revisión legal y clínica y confirma los canales de contacto. Ver [Pasar a producción](#pasar-a-producción).

---

## Índice

- [Qué incluye](#qué-incluye)
- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo local](#desarrollo-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Base de datos con Supabase](#base-de-datos-con-supabase)
- [Panel del desarrollador](#panel-del-desarrollador)
- [Correo con Resend](#correo-con-resend)
- [App móvil con Capacitor](#app-móvil-con-capacitor)
- [Tests disponibles](#tests-disponibles)
- [Seguridad y privacidad](#seguridad-y-privacidad)
- [Pasar a producción](#pasar-a-producción)
- [Licencias y atribuciones](#licencias-y-atribuciones)

---

## Qué incluye

### Experiencia de usuario

- Inicio con hero, check-in de ánimo, match orientativo de tres pasos, cómo funciona, profesionales destacados, tests y preguntas frecuentes.
- Directorio con búsqueda y filtros por especialidad, modalidad, presupuesto, idioma y orden.
- Perfil profesional con enfoque, credenciales, qué incluye la sesión, proceso de verificación y política de pago.
- Formulario de solicitud con validación en cliente y servidor, consentimientos explícitos, honeypot y confirmación con referencia.
- Página de crisis con líneas por país, recordatorio de emergencias, respiración guiada y técnica de anclaje 5-4-3-2-1.
- Historial local de tests con tendencia, borrado individual y borrado total.
- Páginas legales: privacidad, términos y aviso médico con limitaciones de los tests.
- Diseño responsive, navegación móvil inferior, foco visible, enlaces de salto y respeto por `prefers-reduced-motion`.

### Tests de tamizaje

| Test | Mide | Preguntas | Rango | Punto de corte / alerta |
| --- | --- | --- | --- | --- |
| **PHQ-9** | Síntomas depresivos | 9 | 0–27 | Bandas 0–4, 5–9, 10–14, 15–19, 20–27. Alerta si el ítem 9 > 0 |
| **GAD-7** | Ansiedad generalizada | 7 | 0–21 | Bandas 0–4, 5–9, 10–14, 15–21 |
| **WHO-5** | Bienestar subjetivo | 5 | 0–100 | Suma × 4; ≤ 50 indica evaluar más a fondo |

Cada test muestra una advertencia clara de que **no es un diagnóstico**, explica sus límites, cita la fuente original y recomienda consultar a un profesional. El resultado del PHQ-9 activa un aviso de crisis si hay cualquier respuesta distinta de “Para nada” en el ítem de pensamientos de muerte o autolesión.

### Backend

- API Express 5 expuesta en Vercel mediante `api/[...path].ts`.
- `GET /api/health`, `GET /api/professionals`, `GET /api/professionals/:slug`, `GET /api/crisis-resources`.
- `POST /api/contact-requests` con validación Zod compartida, rate limiting (5 solicitudes / 10 min), honeypot y consentimientos obligatorios.
- Panel privado en `/admin` con endpoints `POST /api/admin/login`, `GET /api/admin/session`, `GET|POST /api/admin/professionals`, `DELETE /api/admin/professionals/:slug` y `GET /api/admin/contact-requests`, protegidos con contraseña y token firmado.
- Persistencia opcional en Supabase (PostgreSQL) y notificación opcional por correo con Resend.
- Sin variables de entorno, las solicitudes se guardan solo en memoria y en los logs (modo demo).

---

## Stack

- **Frontend:** Vite 7, React 19, TypeScript 5.9, Tailwind CSS 4, React Router 7, lucide-react.
- **Backend:** Node.js 24, Express 5, Zod 4, Helmet, CORS, express-rate-limit.
- **Base de datos:** Supabase (PostgreSQL) con `@supabase/supabase-js` y RLS.
- **Móvil:** Capacitor 8 (Android e iOS).
- **Tests:** Vitest 4.
- **Tipografías:** Fraunces Variable + Inter Variable (empaquetadas con Fontsource, sin CDN).
- **Hosting:** Vercel (frontend + función serverless).

---

## Estructura del proyecto

```
.
├─ api/
│  └─ [...path].ts          # Entrada serverless de Vercel → app Express
├─ public/                  # manifest, icono, robots, sitemap
├─ server/
│  ├─ app.ts                # Rutas, validación, rate limit
│  ├─ admin-auth.ts         # Contraseña y token firmado del panel
│  ├─ email.ts              # Notificación con Resend
│  ├─ index.ts              # Servidor local
│  ├─ professionals-store.ts # CRUD de profesionales y respaldo demo
│  ├─ store.ts              # Supabase / memoria + referencias
│  └─ supabase.ts           # Cliente y configuración de Supabase
├─ shared/
│  ├─ contact.ts            # Esquema Zod y etiquetas compartidas
│  ├─ crisis.ts             # Líneas de ayuda
│  └─ professionals.ts      # Especialidades, perfiles de muestra y esquema del panel
├─ src/
│  ├─ components/           # UI reutilizable
│  ├─ hooks/                # usePageMeta
│  ├─ lib/                  # api, admin, screening, storage, format
│  ├─ pages/                # Páginas de la aplicación (incluye Admin.tsx)
│  ├─ providers/            # ProfessionalsProvider
│  ├─ App.tsx               # Rutas
│  ├─ index.css             # Tema Tailwind v4
│  └─ main.tsx              # Punto de entrada
├─ tests/                   # Pruebas de puntuación, esquema y datos
├─ supabase/
│  └─ schema.sql            # Tablas, índices, RLS y limpieza de retención
├─ scripts/qa.mjs            # QA de interfaz con Playwright (Edge)
├─ capacitor.config.ts
├─ vercel.json
└─ vite.config.ts
```

---

## Desarrollo local

Requisitos: **Node.js 20+** (probado con Node 24) y npm 10+.

```bash
npm install
cp .env.example .env   # en Windows: Copy-Item .env.example .env
npm run dev
```

Esto inicia:

- Vite en `http://localhost:5173`
- API Express en `http://localhost:3001`
- Proxy de `/api` desde Vite hacia la API

Abre `http://localhost:5173`.

Si solo quieres el frontend:

```bash
npm run dev:web
```

Si solo quieres la API:

```bash
npm run dev:api
```

---

## Variables de entorno

Copia `.env.example` y ajusta lo necesario. Todas son opcionales para desarrollo.

| Variable | Uso | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto de la API local | `3001` |
| `CORS_ORIGINS` | Orígenes permitidos, separados por comas | `https://app.example.com,capacitor://localhost` |
| `CONTACT_RATE_LIMIT_MAX` | Máximo de solicitudes de contacto por IP cada 10 min (por defecto 5) | `5` |
| `SUPABASE_URL` | URL del proyecto de Supabase | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo servidor, omite RLS) | `eyJ...` |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin`; si falta, el panel queda desactivado | `una-clave-larga-y-única` |
| `ADMIN_SESSION_SECRET` | Secreto para firmar el token de sesión (si se omite, se usa `ADMIN_PASSWORD`) | `cadena-aleatoria-larga` |
| `ADMIN_SESSION_HOURS` | Duración de la sesión del panel en horas (por defecto 8, máximo 168) | `8` |
| `RESEND_API_KEY` | API key de Resend | `re_...` |
| `CONTACT_NOTIFICATION_EMAIL` | Destinatario de solicitudes | `equipo@example.com` |
| `CONTACT_FROM_EMAIL` | Remitente verificado | `Sereno <hola@tudominio.com>` |
| `VITE_API_BASE_URL` | Base de la API para builds nativos | `https://tu-proyecto.vercel.app` |

> `VITE_API_BASE_URL` debe quedar vacío para la web en Vercel (se usa el mismo origen `/api`). Para Capacitor, apunta a la URL pública del proyecto.

---

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Vite + API en paralelo |
| `npm run dev:web` | Solo frontend |
| `npm run dev:api` | Solo API con recarga |
| `npm run build` | Typecheck + build de producción a `dist/` |
| `npm run preview` | Previsualiza el build |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Vitest en modo run |
| `npm run test:watch` | Vitest en modo watch |
| `npm run qa` | Pruebas de interfaz con Playwright sobre los servidores locales |
| `npm start` | API en modo producción local |
| `npm run cap:sync` | Build + sincroniza Capacitor |
| `npm run cap:android` | Build + sync + abre Android Studio |
| `npm run cap:ios` | Build + sync + abre Xcode |

---

## Despliegue en Vercel

1. Sube el proyecto a un repositorio de GitHub/GitLab.
2. En [vercel.com](https://vercel.com), importa el repositorio.
3. Vercel detecta Vite. El `vercel.json` ya define:
   - `buildCommand: npm run build`
   - `outputDirectory: dist`
   - reescrituras de `/api` y `/api/*` a la función `api/index.ts` (Express)
   - reescritura SPA para el resto de rutas
   - cabeceras de seguridad básicas
4. Añade las variables de entorno en **Project → Settings → Environment Variables** (opcional pero recomendado):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` y, opcionalmente, `ADMIN_SESSION_SECRET` y `ADMIN_SESSION_HOURS`
   - `RESEND_API_KEY`, `CONTACT_NOTIFICATION_EMAIL`, `CONTACT_FROM_EMAIL`
   - `CORS_ORIGINS` si vas a consumir la API desde otro origen (por ejemplo, la app móvil)
5. Despliega. La app queda en `https://tu-proyecto.vercel.app` y la API en `/api`.

Prueba rápida tras desplegar:

```bash
curl https://tu-proyecto.vercel.app/api/health
```

Debe responder `{ "ok": true, "service": "sereno-api", "storage": "supabase", ... }`. Si aparece `"storage": "memory"`, la API no está recibiendo `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` en ese entorno (Production/Preview). Si da 404, revisa que `api/index.ts` y `vercel.json` estén en el commit desplegado y que el **Root Directory** sea la raíz del repositorio.

### Dominio propio

En **Settings → Domains** puedes añadir tu dominio. Actualiza `CONTACT_FROM_EMAIL` a un remitente del dominio verificado en Resend y `CORS_ORIGINS` si corresponde.

---

## Base de datos con Supabase

En Vercel el sistema de archivos es efímero. Sin base de datos, las solicitudes se pierden al reciclarse la instancia y solo quedan en logs. Sereno usa **Supabase (PostgreSQL)** para guardar cada solicitud de contacto.

### 1. Crear el proyecto y la tabla

1. Crea un proyecto en [supabase.com](https://supabase.com). El plan gratuito es suficiente para desarrollo y pruebas.
2. Abre **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo.
3. El script crea las tablas `public.contact_requests` y `public.professionals`, sus índices, activa RLS sin políticas públicas y define la función de retención `delete_expired_contact_requests()`.

### 2. Configurar las variables de entorno

En **Project Settings → API** copia:

- **Project URL** → `SUPABASE_URL`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

Añádelas en `.env` para desarrollo y en **Vercel → Settings → Environment Variables** para producción.

> La `service_role` key omite RLS. Úsala **solo en el servidor**: nunca la prefijes con `VITE_`, no la incluyas en builds de Capacitor y no la expongas al navegador. Para el cliente web no se necesita ninguna clave de Supabase.

### 3. Cómo se guardan los datos

Cada solicitud se inserta en `public.contact_requests` con la referencia `SR-XXXXXX` como clave primaria. El backend mapea el modelo de la aplicación a columnas `snake_case` en `server/store.ts`.

Si Supabase no está configurado o la inserción falla, la solicitud cae a memoria como último recurso para no perderla durante la vida de esa instancia, y el error queda en los logs. El endpoint `/api/health` indica el modo activo en el campo `storage` (`supabase` o `memory`).

### 4. Retención y limpieza

El esquema incluye la función `delete_expired_contact_requests(retention_days)` para borrar solicitudes antiguas (180 días por defecto). Puedes programarla con `pg_cron` usando el ejemplo comentado al final de `supabase/schema.sql`, o con una tarea programada externa.

> El plan gratuito de Supabase puede pausar proyectos con poca actividad. Para producción, usa un plan que garantice disponibilidad, copias de seguridad y cifrado, y revisa los plazos de conservación con asesoría legal.

### 5. Profesionales en la base de datos

La tabla `public.professionals` guarda los perfiles que se publican desde el panel. El comportamiento público es intencionalmente simple:

- Si la tabla tiene **al menos un** profesional, el sitio (inicio, directorio, fichas y formulario) usa **solo** esos perfiles.
- Si la tabla está vacía, Supabase no está configurado o la consulta falla, la API devuelve los 8 perfiles internos de respaldo de `shared/professionals.ts` para que el sitio no quede vacío. La interfaz no los presenta como perfiles de muestra.
- Al retirar el último profesional de la base de datos, reaparece el respaldo interno. Es el comportamiento esperado del fallback.

Las filas se escriben únicamente desde el backend con la `service_role` key. RLS queda activado y sin políticas para `anon` y `authenticated`.

---

## Panel del desarrollador

El panel privado vive en **`/admin`** y no aparece enlazado en la navegación pública. Sirve para añadir y retirar profesionales sin tocar el código.

### Requisitos

1. Ejecuta [`supabase/schema.sql`](supabase/schema.sql) en Supabase para crear `public.professionals`.
2. Define en el servidor:
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (obligatorias para guardar).
   - `ADMIN_PASSWORD` (obligatoria para activar el panel).
   - Opcionalmente `ADMIN_SESSION_SECRET` y `ADMIN_SESSION_HOURS`.
3. Reinicia la API y abre `http://localhost:5173/admin` (o `https://tu-proyecto.vercel.app/admin`).

### Cómo funciona

- La contraseña se comprueba **solo en el servidor**; nunca se envía al navegador ni se guarda en `localStorage`.
- Tras el login, el servidor devuelve un token firmado con HMAC que el cliente guarda en `sessionStorage` (se borra al cerrar la pestaña). El token caduca según `ADMIN_SESSION_HOURS`.
- Los intentos de login están limitados a 10 cada 15 minutos por IP.
- Campos obligatorios del formulario: **nombre completo, especialidad, idiomas, años de experiencia y precio por sesión (USD)**.
- Campos opcionales: rol (psicólogo/a o psiquiatra), modalidades, título, ciudad, país, próxima disponibilidad, biografía, enfoque y destacar en la portada.
- El servidor genera el `slug` público desde el nombre (con sufijos si hay colisión), completa la disponibilidad por defecto y marca el perfil como `verified` («Perfil publicado»).
- «Retirar» borra la fila tras una confirmación en la interfaz.
- La sección **«Solicitudes recibidas»** lista las solicitudes del formulario de contacto (máximo 200, de la más reciente a la más antigua) con fecha, profesional, motivo, modalidad, datos de contacto y mensaje. Los datos son privados y solo deben usarse para responder.
- Si falta configuración, el panel lo indica: sin `ADMIN_PASSWORD` el login responde `503`; sin Supabase, la sesión funciona pero no se pueden guardar profesionales y las solicitudes se conservan solo en memoria.

### Seguridad

- Usa una contraseña larga y única, distinta de cualquier otra credencial.
- Define `ADMIN_SESSION_SECRET` con un valor aleatorio largo (por ejemplo, `openssl rand -base64 48`), especialmente si compartes el proyecto con más personas.
- El panel está marcado con `noindex, nofollow` y `public/robots.txt` bloquea `/admin`.
- Para producción, valora sustituir la contraseña compartida por autenticación individual (Supabase Auth, OAuth o proveedor de identidad) y añadir auditoría de cambios.

---

## Correo con Resend

1. Crea una cuenta en [resend.com](https://resend.com).
2. Verifica un dominio y crea una API key.
3. Configura `RESEND_API_KEY`, `CONTACT_NOTIFICATION_EMAIL` y `CONTACT_FROM_EMAIL`.
4. Redeploy y envía una solicitud de prueba.

Si no hay configuración de correo, la API responde correctamente (`emailNotified: false`) y deja constancia en logs. El correo incluye los datos de la solicitud, la referencia y un recordatorio de confidencialidad.

> No incluyas datos de salud en asuntos de correo. Para producción, usa canales seguros y plantillas con aviso de confidencialidad.

---

## App móvil con Capacitor

Requisitos:

- **Android:** Android Studio + SDK.
- **iOS:** macOS + Xcode + CocoaPods.

### Preparar la app

```bash
npm run build
npx cap add android
npx cap add ios        # solo macOS
```

Añade la URL de la API desplegada en `.env` antes del build:

```env
VITE_API_BASE_URL=https://tu-proyecto.vercel.app
```

Luego:

```bash
npm run cap:sync
npm run cap:android    # abre Android Studio
npm run cap:ios        # abre Xcode
```

### Notas importantes

- En la app nativa, `VITE_API_BASE_URL` es obligatoria porque no existe el proxy de Vite.
- Añade `capacitor://localhost` (iOS) y `http://localhost` (Android) a `CORS_ORIGINS` en Vercel si la API los requiere.
- Revisa las políticas de las tiendas sobre apps de salud mental, telemedicina y datos sensibles. Pueden exigir declaraciones adicionales, revisión clínica y cumplimiento específico (por ejemplo, HIPAA en EE. UU. o RGPD en la UE).
- Sustituye iconos y splash generados por Capacitor con tu marca.
- Prueba el flujo completo en dispositivo real, incluida la conexión a la API y el envío de formularios.

---

## Tests disponibles

```bash
npm test
```

Cubren:

- Puntuación y bandas de PHQ-9, GAD-7 y WHO-5.
- Alerta de crisis del PHQ-9.
- Ausencia de huecos en los rangos de banda.
- Esquema de contacto: campos obligatorios, consentimientos, honeypot y límites.
- Integridad de los datos de profesionales y líneas de crisis.
- Formato y unicidad de las referencias.
- Selección de modo de almacenamiento.
- Mapeo de profesionales a columnas de Supabase y valores de respaldo.
- Esquema del panel: campos obligatorios, especialidades, precios y límites.
- Contraseña, emisión, caducidad y manipulación del token del panel.

### QA de interfaz

`npm run qa` recorre todas las rutas, completa un test, envía una solicitud de contacto y comprueba el diseño móvil. Usa Microsoft Edge o Google Chrome instalado en Windows y requiere los servidores locales activos:

```bash
npm run dev
npm run qa
```

Puedes cambiar el navegador con `QA_BROWSER_PATH` y la URL con `QA_BASE_URL`. Si repites el QA muchas veces, el límite de solicitudes puede devolver `429`. Reinicia la API o sube `CONTACT_RATE_LIMIT_MAX` en el entorno local (nunca en producción).

### Comprobación del panel sin Supabase real

`scripts/mock-admin-check.ts` levanta un Supabase falso en memoria y comprueba el flujo completo del panel (login, alta, slug duplicado, directorio público, solicitud de contacto y baja):

```bash
npx tsx scripts/mock-admin-check.ts
```

No necesita credenciales reales y no modifica tu proyecto de Supabase.

---

## Seguridad y privacidad

- Los resultados de los tests **nunca se envían al servidor**; se guardan en `localStorage` y se pueden borrar.
- El formulario pide tres consentimientos: privacidad, contacto y reconocimiento de que no es un servicio de emergencia.
- Validación con Zod en cliente y servidor, límite de tamaño del cuerpo (32 KB) y rate limiting.
- Helmet, CORS configurable y cabeceras de seguridad en Vercel.
- Honeypot para reducir spam.
- En Supabase, RLS activado sin políticas públicas: solo la `service_role` del backend accede a `contact_requests` y `professionals`. La clave no se expone al cliente.
- El panel `/admin` exige `ADMIN_PASSWORD`, usa un token firmado con caducidad en `sessionStorage`, limita los intentos de login y está marcado como `noindex`.
- Los perfiles añadidos desde el panel se marcan como «Perfil publicado». La información personal de las solicitudes de contacto solo es visible desde `/admin` con token.
- Los enlaces externos usan `rel="noopener noreferrer"`.

### Qué falta para un servicio real

- Autenticación individual y control de acceso por rol.
- Cifrado de datos de salud en reposo y auditoría de accesos.
- Consentimiento informado clínico y gestión de historia clínica.
- Verificación documental de profesionales y renovación periódica.
- Política de cookies/analíticas y registro de actividades de tratamiento.
- Plan de respuesta ante brechas y contacto de privacidad.
- Revisión de las líneas de crisis y fecha de verificación.

---

## Pasar a producción

Checklist mínima antes de abrir al público:

### Datos y profesionales

- [ ] Publicar los profesionales reales desde `/admin` con Supabase configurado (o sustituir los 8 perfiles internos de respaldo de `shared/professionals.ts`).
- [ ] Verificar identidad, titulación, licencia/registro vigente, experiencia y referencias antes de publicar cada perfil desde el panel.
- [ ] Definir un proceso documentado de alta, revisión y baja de perfiles.
- [ ] Revisar precios, moneda, impuestos, cancelaciones y reembolsos.
- [ ] Añadir fotos reales con autorización (o mantener avatares si se prefiere).

### Clínica y tests

- [ ] Confirmar que tienes derecho a usar cada instrumento y su traducción al español.
- [ ] Revisar la adaptación lingüística con profesionales cualificados.
- [ ] Validar los puntos de corte y el flujo de crisis con un comité clínico.
- [ ] Definir protocolo de actuación ante riesgo, con escalado y seguimiento.
- [ ] Añadir consentimiento informado específico antes de la primera sesión.
- [ ] No presentar nunca un resultado como diagnóstico.

### Legal y privacidad

- [ ] Adaptar privacidad y términos a tu jurisdicción con un abogado.
- [ ] Definir base legal, plazos de conservación y derechos de las personas.
- [ ] Firmar acuerdos de encargado del tratamiento con proveedores.
- [ ] Evaluar necesidad de evaluación de impacto (DPIA) por datos de salud.
- [ ] Revisar normativa de telemedicina, publicidad sanitaria y consumo.
- [ ] Verificar las líneas de crisis y añadir fecha de revisión.

### Operación

- [ ] Configurar Supabase (ejecutar `supabase/schema.sql`) y Resend con dominio verificado.
- [ ] Definir `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` robustos, y revisar quién tiene acceso al panel.
- [ ] Añadir auditoría de altas y bajas de profesionales.
- [ ] Añadir monitorización, alertas y backups.
- [ ] Probar carga, accesibilidad y flujo móvil en dispositivos reales.
- [ ] Definir tiempos de respuesta y soporte.
- [ ] Publicar un canal de contacto para incidencias y ejercicio de derechos.

---

## Licencias y atribuciones

- **PHQ-9 / GAD-7:** instrumentos desarrollados por Kroenke, Spitzer, Williams y Löwe. Revisa las condiciones de uso en [phqscreeners.com](https://www.phqscreeners.com/).
- **WHO-5:** World Health Organization / Psychiatric Research Unit, Hillerød. Revisa las condiciones de uso y citación.
- **Tipografías:** Fraunces e Inter, distribuidas vía Fontsource bajo SIL Open Font License.
- **Iconos:** lucide-react (ISC).
- **Código de la demo:** úsalo como base y adáptalo a tu proyecto. Antes de un uso comercial, revisa las licencias de todos los recursos y contenidos.

---

Hecho con cuidado. Si este proyecto te ayuda a acercar apoyo real a más personas, ojalá lo hagas con la misma honestidad con la que está escrito: **los tests orientan, las personas acompañan**.
