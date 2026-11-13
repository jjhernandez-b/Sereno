import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle2, ClipboardCheck, Copy, Mail, ShieldCheck } from 'lucide-react'
import { isConfirmation, readRememberedConfirmation } from '../lib/confirmation'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatDateTime } from '../lib/format'
import { LinkButton } from '../components/Button'
import { CrisisNotice } from '../components/CrisisNotice'
import { DemoNotice } from '../components/DemoNotice'

export function RequestReceived() {
  const location = useLocation()
  const confirmation = isConfirmation(location.state)
    ? location.state
    : readRememberedConfirmation()
  const [copied, setCopied] = useState(false)

  usePageMeta({
    title: 'Solicitud recibida',
    description: 'Tu solicitud de primera conversación fue registrada correctamente.',
  })

  async function copyReference() {
    if (!confirmation) return
    try {
      await navigator.clipboard.writeText(confirmation.reference)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-forest-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div className="page-container relative py-12 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] border border-forest-900/10 bg-cream-50 p-6 text-center shadow-soft sm:p-10">
            <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-700">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-5 justify-center">Solicitud registrada</p>
            <h1 className="mt-2 text-3xl leading-tight text-forest-950 sm:text-4xl">
              Gracias por dar el paso.
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-[0.92rem] leading-7 text-muted">
              {confirmation
                ? `Recibimos tu solicitud para una primera conversación con ${confirmation.professionalName}. El siguiente paso es confirmar horario y resolver tus dudas por correo.`
                : 'Tu solicitud fue registrada. Si llegaste aquí sin completar el formulario, puedes volver al directorio y empezar de nuevo.'}
            </p>

            {confirmation && (
              <div className="mt-6 rounded-2xl border border-forest-900/10 bg-forest-50 p-4 sm:p-5">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Tu referencia
                </p>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3">
                  <p className="font-display text-2xl tracking-[0.06em] text-forest-950">
                    {confirmation.reference}
                  </p>
                  <button
                    type="button"
                    onClick={copyReference}
                    className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/15 bg-cream-50 px-3 py-1.5 text-[0.7rem] font-semibold text-forest-800 transition-colors hover:bg-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Copiada
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-[0.68rem] text-muted">
                  Guarda esta referencia. Registrada el {formatDateTime(confirmation.receivedAt)}.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-forest-900/10 bg-cream-100/60 p-4 text-left sm:p-5">
              <h2 className="font-sans text-[0.82rem] font-semibold text-forest-950">
                Qué puedes esperar
              </h2>
              <ol className="mt-3 space-y-3">
                {[
                  {
                    icon: Mail,
                    text: 'Revisamos tu solicitud y te contactamos por correo para confirmar horario.',
                  },
                  {
                    icon: ClipboardCheck,
                    text: 'Antes de la sesión, podrás aclarar dudas y revisar el consentimiento informado.',
                  },
                  {
                    icon: ShieldCheck,
                    text: 'Si el profesional no encaja con lo que buscas, te orientamos hacia otra opción.',
                  },
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <li key={item.text} className="flex items-start gap-2.5">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 text-[0.62rem] font-semibold text-forest-700">
                        {index + 1}
                      </span>
                      <span className="flex items-start gap-1.5 text-[0.78rem] leading-6 text-muted">
                        <Icon className="mt-0.5 hidden h-3.5 w-3.5 shrink-0 text-forest-500 sm:block" aria-hidden="true" />
                        {item.text}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <LinkButton to="/" variant="primary" size="md">
                Volver al inicio
              </LinkButton>
              <LinkButton to="/tests" variant="secondary" size="md">
                Explorar tests
              </LinkButton>
            </div>

            <Link
              to="/profesionales"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
            >
              Ver otros profesionales
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <DemoNotice className="mt-4" />
          <CrisisNotice className="mt-4" compact />
        </div>
      </div>
    </section>
  )
}
