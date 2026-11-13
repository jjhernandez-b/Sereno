# Sereno · Terapia online a tu ritmo

Plataforma de demostración de salud mental y telemedicina, inspirada en servicios como BetterHelp. Incluye directorio de profesionales, flujo de solicitud de primera conversación, tests de tamizaje validados y recursos de crisis, con una interfaz cálida y responsive en español.

> **Aviso importante:** este repositorio es una demo funcional. Los perfiles profesionales son ficticios y los tests son herramientas de tamizaje, **no diagnósticos**. Antes de publicar un servicio real debes sustituir los datos de muestra, verificar licencias y completar la revisión legal y clínica. Ver [Pasar a producción](#pasar-a-producción).

---

## Índice

- [Qué incluye](#qué-incluye)
- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo local](#desarrollo-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Persistencia con Upstash](#persistencia-con-upstash)
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
- Perfil profesional con enfoque, credenciales, qué incluye la sesión, proceso de verificación y aviso de perfil de muestra.
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
- Persistencia opcional en Upstash Redis REST y notificación opcional por correo con Resend.
- Sin variables de entorno, las solicitudes se guardan solo en memoria y en los logs (modo demo).

---

## Stack

- **Frontend:** Vite 7, React 19, TypeScript 5.9, Tailwind CSS 4, React Router 7, lucide-react.
- **Backend:** Node.js 24, Express 5, Zod 4, Helmet, CORS, express-rate-limit.
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
│  ├─ email.ts              # Notificación con Resend
│  ├─ index.ts              # Servidor local
│  └─ store.ts              # Upstash / memoria + referencias
├─ shared/
│  ├─ contact.ts            # Esquema Zod y etiquetas compartidas
│  ├─ crisis.ts             # Líneas de ayuda
│  └─ professionals.ts      # Especialidades y perfiles de muestra
├─ src/
│  ├─ components/           # UI reutilizable
│  ├─ hooks/                # usePageMeta
│  ├─ lib/                  # api, screening, storage, format
│  ├─ pages/                # Páginas de la aplicación
│  ├─ App.tsx               # Rutas
│  ├─ index.css             # Tema Tailwind v4
│  └─ main.tsx              # Punto de entrada
├─ tests/                   # Pruebas de puntuación, esquema y datos
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
| `UPSTASH_REDIS_REST_URL` | URL REST de Upstash Redis | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash | `AX...` |
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
   - reescritura SPA que excluye `/api/*`
   - cabeceras de seguridad básicas
4. Añade las variables de entorno en **Project → Settings → Environment Variables** (opcional pero recomendado):
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - `RESEND_API_KEY`, `CONTACT_NOTIFICATION_EMAIL`, `CONTACT_FROM_EMAIL`
   - `CORS_ORIGINS` si vas a consumir la API desde otro origen (por ejemplo, la app móvil)
5. Despliega. La app queda en `https://tu-proyecto.vercel.app` y la API en `/api`.

Prueba rápida tras desplegar:

```bash
curl https://tu-proyecto.vercel.app/api/health
```

Debe responder `{ "ok": true, "service": "sereno-api", ... }`.

### Dominio propio

En **Settings → Domains** puedes añadir tu dominio. Actualiza `CONTACT_FROM_EMAIL` a un remitente del dominio verificado en Resend y `CORS_ORIGINS` si corresponde.

---

## Persistencia con Upstash

En Vercel el sistema de archivos es efímero. Sin base de datos, las solicitudes se pierden al reciclarse la instancia y solo quedan en logs.

1. Crea una base de datos gratuita en [upstash.com](https://upstash.com).
2. Copia la **REST URL** y el **REST TOKEN**.
3. Añádelos como variables de entorno en Vercel.
4. Redeploy.

La implementación guarda cada solicitud como `sereno:contact:<referencia>` con TTL de 180 días y mantiene un índice en `sereno:contact:index`. Si Upstash falla, cae a memoria como último recurso y registra el error.

> Para producción real, considera una base de datos con cifrado, control de acceso, auditoría y copias de seguridad, y revisa los plazos de conservación.

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

### QA de interfaz

`npm run qa` recorre todas las rutas, completa un test, envía una solicitud de contacto y comprueba el diseño móvil. Usa Microsoft Edge o Google Chrome instalado en Windows y requiere los servidores locales activos:

```bash
npm run dev
npm run qa
```

Puedes cambiar el navegador con `QA_BROWSER_PATH` y la URL con `QA_BASE_URL`. Si repites el QA muchas veces, el límite de solicitudes puede devolver `429`. Reinicia la API o sube `CONTACT_RATE_LIMIT_MAX` en el entorno local (nunca en producción).

---

## Seguridad y privacidad

- Los resultados de los tests **nunca se envían al servidor**; se guardan en `localStorage` y se pueden borrar.
- El formulario pide tres consentimientos: privacidad, contacto y reconocimiento de que no es un servicio de emergencia.
- Validación con Zod en cliente y servidor, límite de tamaño del cuerpo (32 KB) y rate limiting.
- Helmet, CORS configurable y cabeceras de seguridad en Vercel.
- Honeypot para reducir spam.
- No se muestran datos personales de profesionales reales porque todos los perfiles son ficticios.
- Los enlaces externos usan `rel="noopener noreferrer"`.

### Qué falta para un servicio real

- Autenticación y control de acceso.
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

- [ ] Sustituir los 8 perfiles ficticios de `shared/professionals.ts` por profesionales reales con consentimiento.
- [ ] Verificar identidad, titulación, licencia/registro vigente, experiencia y referencias.
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

- [ ] Configurar Upstash (o base de datos equivalente) y Resend con dominio verificado.
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
