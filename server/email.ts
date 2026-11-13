import { AGE_RANGE_LABELS, CONTACT_MODALITY_LABELS, CONTACT_REASON_LABELS, PREFERRED_TIME_LABELS, type AgeRange, type ContactModality, type ContactReason, type PreferredTime } from '../shared/contact'
import type { StoredContactRequest } from './store'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildText(request: StoredContactRequest): string {
  return [
    `Nueva solicitud de cita — ${request.reference}`,
    '',
    `Profesional: ${request.professionalName} (${request.professionalSlug})`,
    `Nombre: ${request.fullName}`,
    `Correo: ${request.email}`,
    `Teléfono: ${request.phone || 'No indicado'}`,
    `Edad: ${AGE_RANGE_LABELS[request.ageRange as AgeRange] ?? request.ageRange}`,
    `País/ciudad: ${request.country || 'No indicado'}`,
    `Motivo: ${CONTACT_REASON_LABELS[request.reason as ContactReason] ?? request.reason}`,
    `Horario preferido: ${PREFERRED_TIME_LABELS[request.preferredTime as PreferredTime] ?? request.preferredTime}`,
    `Modalidad: ${CONTACT_MODALITY_LABELS[request.modality as ContactModality] ?? request.modality}`,
    '',
    'Mensaje:',
    request.message,
    '',
    `Fecha: ${request.createdAt}`,
    '',
    'Este correo contiene datos personales y de salud. Trátalo de forma confidencial.',
  ].join('\n')
}

function buildHtml(request: StoredContactRequest): string {
  const rows: Array<[string, string]> = [
    ['Profesional', `${request.professionalName} (${request.professionalSlug})`],
    ['Nombre', request.fullName],
    ['Correo', request.email],
    ['Teléfono', request.phone || 'No indicado'],
    ['Edad', AGE_RANGE_LABELS[request.ageRange as AgeRange] ?? request.ageRange],
    ['País/ciudad', request.country || 'No indicado'],
    ['Motivo', CONTACT_REASON_LABELS[request.reason as ContactReason] ?? request.reason],
    ['Horario preferido', PREFERRED_TIME_LABELS[request.preferredTime as PreferredTime] ?? request.preferredTime],
    ['Modalidad', CONTACT_MODALITY_LABELS[request.modality as ContactModality] ?? request.modality],
  ]

  const table = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e7e1d5;color:#52645f;font-size:13px;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e7e1d5;color:#12211f;font-size:14px;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f7f2e8;font-family:Arial,Helvetica,sans-serif;color:#12211f;">
    <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e7e1d5;border-radius:20px;overflow:hidden;">
      <div style="background:#0c2b27;padding:24px 28px;color:#f7f2e8;">
        <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.7;">Sereno · Nueva solicitud</p>
        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;">${escapeHtml(request.reference)}</h1>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;">${table}</table>
        <h2 style="font-size:14px;margin:24px 0 8px;color:#52645f;">Mensaje</h2>
        <p style="margin:0;white-space:pre-wrap;background:#f0f7f4;border-radius:12px;padding:16px;font-size:14px;line-height:1.6;">${escapeHtml(request.message)}</p>
        <p style="margin:24px 0 0;font-size:12px;color:#52645f;line-height:1.6;">
          Creada el ${escapeHtml(new Date(request.createdAt).toLocaleString('es-ES'))}.<br />
          Este correo contiene datos personales y de salud. Trátalo de forma confidencial y responde dentro de tus canales seguros.
        </p>
      </div>
    </div>
  </body>
</html>`
}

export async function sendContactNotification(
  request: StoredContactRequest,
): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim()
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || 'Sereno <onboarding@resend.dev>'

  if (!apiKey || !to) {
    console.info(
      `[sereno] Correo no configurado; solicitud ${request.reference} no notificada. ` +
        'Define RESEND_API_KEY y CONTACT_NOTIFICATION_EMAIL para activar los avisos.',
    )
    return { sent: false }
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: request.email,
        subject: `Nueva solicitud ${request.reference} — ${request.professionalName}`,
        text: buildText(request),
        html: buildHtml(request),
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`Resend respondió ${response.status}: ${detail.slice(0, 200)}`)
    }

    return { sent: true }
  } catch (error) {
    console.error(`[sereno] No se pudo enviar la notificación de ${request.reference}.`, error)
    return { sent: false }
  }
}
