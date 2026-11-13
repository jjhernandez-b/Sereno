import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Loader2,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  Video,
} from 'lucide-react'
import {
  AGE_RANGES,
  AGE_RANGE_LABELS,
  CONTACT_MODALITIES,
  CONTACT_MODALITY_LABELS,
  CONTACT_REASONS,
  CONTACT_REASON_LABELS,
  PREFERRED_TIMES,
  PREFERRED_TIME_LABELS,
  contactRequestSchema,
  toFieldErrors,
  type ContactConfirmation,
} from '../../shared/contact'
import {
  MODALITY_LABELS,
  formatPrice,
  getProfessional,
  type Modality,
} from '../../shared/professionals'
import { usePageMeta } from '../hooks/usePageMeta'
import { ApiError, submitContactRequest } from '../lib/api'
import { rememberConfirmation } from '../lib/confirmation'
import { cn } from '../lib/format'
import { Avatar } from '../components/Primitives'
import { LinkButton } from '../components/Button'
import { CrisisNotice } from '../components/CrisisNotice'
import { DemoNotice } from '../components/DemoNotice'

interface FormState {
  fullName: string
  email: string
  phone: string
  ageRange: string
  country: string
  reason: string
  message: string
  preferredTime: string
  modality: string
  consentPrivacy: boolean
  consentContact: boolean
  acknowledgeEmergency: boolean
  website: string
}

const MODALITY_ICONS: Record<Modality, typeof Video> = {
  video: Video,
  chat: MessageCircle,
  telefono: Phone,
}

export function ContactRequestPage() {
  const { slug } = useParams<{ slug: string }>()
  const professional = getProfessional(slug)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    ageRange: '',
    country: '',
    reason: '',
    message: '',
    preferredTime: '',
    modality: professional?.modalities[0] ?? 'indiferente',
    consentPrivacy: false,
    consentContact: false,
    acknowledgeEmergency: false,
    website: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  usePageMeta({
    title: professional ? `Solicitar cita con ${professional.name}` : 'Solicitar cita',
    description:
      'Envía una solicitud confidencial para una primera conversación con un profesional de salud mental. Sin compromiso y sin cobros al enviar.',
  })

  if (!professional) {
    return (
      <section className="page-container py-20 text-center">
        <p className="eyebrow justify-center">Profesional no encontrado</p>
        <h1 className="mt-3 text-4xl text-forest-950">No encontramos ese perfil.</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-7 text-muted">
          Puede que el enlace esté mal escrito o que el profesional ya no esté disponible. Explora
          el directorio para encontrar otras opciones.
        </p>
        <LinkButton to="/profesionales" size="lg" className="mt-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ver profesionales
        </LinkButton>
      </section>
    )
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => {
      if (!previous[key]) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const parsed = contactRequestSchema.safeParse({
      ...form,
      professionalSlug: professional!.slug,
    })

    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error)
      setErrors(fieldErrors)
      setFormError('Revisa los campos marcados antes de enviar tu solicitud.')
      const firstKey = Object.keys(fieldErrors)[0]
      if (firstKey) {
        window.requestAnimationFrame(() => {
          document.getElementById(`campo-${firstKey}`)?.focus()
        })
      }
      return
    }

    setSubmitting(true)
    try {
      const response = await submitContactRequest(parsed.data)
      const confirmation: ContactConfirmation = {
        reference: response.reference,
        professionalName: professional!.name,
        professionalTitle: professional!.title,
        receivedAt: response.receivedAt,
        emailNotified: response.emailNotified,
        persisted: response.persisted,
      }
      rememberConfirmation(confirmation)
      navigate('/solicitud-recibida', { state: confirmation })
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        if (Object.keys(error.fieldErrors).length > 0) setErrors(error.fieldErrors)
      } else {
        setFormError('No pudimos enviar la solicitud. Inténtalo de nuevo en unos minutos.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="border-b border-forest-900/10 bg-cream-50/70">
        <div className="page-container py-8 lg:py-12">
          <Link
            to={`/profesionales/${professional.slug}`}
            className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al perfil de {professional.name}
          </Link>
          <div className="mt-5 max-w-2xl">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
              Primera conversación
            </p>
            <h1 className="mt-3 text-4xl leading-[1.05] text-forest-950 sm:text-5xl">
              Da el primer paso, <em className="font-normal italic text-clay-600">a tu manera</em>.
            </h1>
            <p className="mt-4 text-[0.96rem] leading-7 text-muted">
              Cuéntanos lo justo para que {professional.name.split(' ')[0]} pueda preparar el
              contacto. No necesitas escribir tu historia completa ni tener claro qué dirás.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-[0.7rem]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 font-medium text-forest-800">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Confidencial
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 font-medium text-forest-800">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Sin compromiso
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 font-medium text-forest-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Sin cobros al enviar
            </span>
          </div>
        </div>
      </section>

      <section className="page-container py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start lg:gap-10">
          <div className="order-2 lg:order-1">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-7"
            >
              <div className="flex items-start justify-between gap-4 border-b border-forest-900/10 pb-5">
                <div>
                  <h2 className="text-2xl text-forest-950">Solicitud de cita</h2>
                  <p className="mt-1 text-[0.8rem] leading-6 text-muted">
                    Los campos con <span className="font-semibold text-clay-700">*</span> son
                    obligatorios.
                  </p>
                </div>
                <span className="hidden rounded-full bg-forest-50 px-3 py-1 text-[0.66rem] font-medium text-forest-700 sm:inline-flex">
                  Respuesta orientativa 24–48 h
                </span>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-2xl border border-clay-600/20 bg-clay-50 px-4 py-3 text-[0.8rem] leading-6 text-clay-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p>{formError}</p>
                    {Object.keys(errors).length > 0 && (
                      <p className="mt-1 text-[0.72rem] text-clay-700/80">
                        Hay {Object.keys(errors).length}{' '}
                        {Object.keys(errors).length === 1 ? 'campo por revisar' : 'campos por revisar'}.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-8">
                <fieldset>
                  <legend className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-forest-600">
                    Tus datos
                  </legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <TextField
                      id="campo-fullName"
                      name="fullName"
                      label="Nombre completo"
                      required
                      autoComplete="name"
                      placeholder="Cómo te gustaría que te llamemos"
                      value={form.fullName}
                      onChange={(event) => setField('fullName', event.target.value)}
                      error={errors.fullName}
                    />
                    <TextField
                      id="campo-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      label="Correo electrónico"
                      required
                      autoComplete="email"
                      placeholder="tu@correo.com"
                      value={form.email}
                      onChange={(event) => setField('email', event.target.value)}
                      error={errors.email}
                    />
                    <TextField
                      id="campo-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      label="Teléfono (opcional)"
                      autoComplete="tel"
                      placeholder="+00 000 000 000"
                      value={form.phone}
                      onChange={(event) => setField('phone', event.target.value)}
                      error={errors.phone}
                    />
                    <SelectField
                      id="campo-ageRange"
                      name="ageRange"
                      label="Rango de edad"
                      required
                      value={form.ageRange}
                      onChange={(event) => setField('ageRange', event.target.value)}
                      error={errors.ageRange}
                    >
                      <option value="">Selecciona una opción</option>
                      {AGE_RANGES.map((range) => (
                        <option key={range} value={range}>
                          {AGE_RANGE_LABELS[range]}
                        </option>
                      ))}
                    </SelectField>
                    <TextField
                      id="campo-country"
                      name="country"
                      label="País o ciudad (opcional)"
                      autoComplete="country-name"
                      placeholder="Dónde estás, para coordinar horarios"
                      value={form.country}
                      onChange={(event) => setField('country', event.target.value)}
                      error={errors.country}
                      containerClassName="sm:col-span-2"
                    />
                  </div>
                  {form.ageRange === 'menor-18' && (
                    <p className="mt-3 rounded-xl bg-gold-100/70 px-3 py-2 text-[0.76rem] leading-5 text-[#6d4d0e]">
                      Para menores de 18 años, en un servicio real se requeriría el consentimiento
                      de un tutor legal y una evaluación de idoneidad del caso.
                    </p>
                  )}
                </fieldset>

                <fieldset className="border-t border-forest-900/10 pt-7">
                  <legend className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-forest-600">
                    Sobre tu consulta
                  </legend>
                  <div className="mt-4 space-y-4">
                    <SelectField
                      id="campo-reason"
                      name="reason"
                      label="Motivo de consulta"
                      required
                      value={form.reason}
                      onChange={(event) => setField('reason', event.target.value)}
                      error={errors.reason}
                    >
                      <option value="">Selecciona una opción</option>
                      {CONTACT_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {CONTACT_REASON_LABELS[reason]}
                        </option>
                      ))}
                    </SelectField>

                    <TextareaField
                      id="campo-message"
                      name="message"
                      label="Cuéntanos brevemente qué te trae"
                      required
                      rows={5}
                      maxLength={1200}
                      placeholder="No necesitas escribir tu historia completa. Con dos o tres líneas sobre lo que te gustaría trabajar es suficiente."
                      value={form.message}
                      onChange={(event) => setField('message', event.target.value)}
                      error={errors.message}
                      hint={`${form.message.length}/1200 caracteres. Evita incluir datos sensibles que no sean necesarios.`}
                    />
                  </div>
                </fieldset>

                <fieldset className="border-t border-forest-900/10 pt-7">
                  <legend className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-forest-600">
                    Tus preferencias
                  </legend>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <SelectField
                      id="campo-preferredTime"
                      name="preferredTime"
                      label="Horario preferido"
                      required
                      value={form.preferredTime}
                      onChange={(event) => setField('preferredTime', event.target.value)}
                      error={errors.preferredTime}
                    >
                      <option value="">Selecciona una opción</option>
                      {PREFERRED_TIMES.map((time) => (
                        <option key={time} value={time}>
                          {PREFERRED_TIME_LABELS[time]}
                        </option>
                      ))}
                    </SelectField>
                    <SelectField
                      id="campo-modality"
                      name="modality"
                      label="Modalidad"
                      required
                      value={form.modality}
                      onChange={(event) => setField('modality', event.target.value)}
                      error={errors.modality}
                    >
                      {CONTACT_MODALITIES.map((modality) => (
                        <option key={modality} value={modality}>
                          {CONTACT_MODALITY_LABELS[modality]}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </fieldset>

                <fieldset className="border-t border-forest-900/10 pt-7">
                  <legend className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-forest-600">
                    Consentimientos
                  </legend>
                  <div className="mt-4 space-y-3.5">
                    <ConsentCheckbox
                      id="campo-consentPrivacy"
                      checked={form.consentPrivacy}
                      onChange={(checked) => setField('consentPrivacy', checked)}
                      error={errors.consentPrivacy}
                    >
                      He leído y acepto la{' '}
                      <Link to="/privacidad" target="_blank" className="font-semibold underline underline-offset-2">
                        política de privacidad
                      </Link>{' '}
                      y el tratamiento de mis datos para gestionar esta solicitud.
                    </ConsentCheckbox>
                    <ConsentCheckbox
                      id="campo-consentContact"
                      checked={form.consentContact}
                      onChange={(checked) => setField('consentContact', checked)}
                      error={errors.consentContact}
                    >
                      Autorizo que Sereno o el profesional me contacte por correo o teléfono para
                      responder a esta solicitud.
                    </ConsentCheckbox>
                    <ConsentCheckbox
                      id="campo-acknowledgeEmergency"
                      checked={form.acknowledgeEmergency}
                      onChange={(checked) => setField('acknowledgeEmergency', checked)}
                      error={errors.acknowledgeEmergency}
                    >
                      Entiendo que Sereno no es un servicio de emergencia y que, si estoy en crisis,
                      debo acudir a los{' '}
                      <Link to="/crisis" target="_blank" className="font-semibold underline underline-offset-2">
                        servicios de emergencia o líneas de crisis
                      </Link>
                      .
                    </ConsentCheckbox>
                  </div>
                </fieldset>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="campo-website">No rellenar</label>
                  <input
                    id="campo-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) => setField('website', event.target.value)}
                  />
                </div>

                <div className="border-t border-forest-900/10 pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3.5 text-[0.92rem] font-semibold text-cream-50 shadow-soft transition-all hover:bg-forest-800 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Enviando solicitud…
                      </>
                    ) : (
                      <>
                        Enviar solicitud
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p className="mt-3 flex items-start gap-1.5 text-[0.72rem] leading-5 text-muted">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-500" aria-hidden="true" />
                    No se realiza ningún cobro al enviar este formulario. Recibirás una respuesta
                    por correo con los siguientes pasos.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar name={professional.name} tone={professional.avatarTone} size="md" online />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg leading-tight text-forest-950">
                    {professional.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.68rem] leading-4 text-muted">
                    {professional.title}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-forest-50 px-3.5 py-3">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.1em] text-muted">Precio</p>
                  <p className="text-lg font-semibold text-forest-950">
                    {formatPrice(professional.priceUsd)}
                    <span className="ml-1 text-[0.66rem] font-normal text-muted">/ sesión</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.64rem] uppercase tracking-[0.1em] text-muted">Próximo hueco</p>
                  <p className="text-[0.8rem] font-semibold text-forest-800">{professional.nextSlot}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {professional.modalities.map((modality) => {
                  const Icon = MODALITY_ICONS[modality]
                  return (
                    <p key={modality} className="flex items-center gap-2 text-[0.76rem] text-forest-900">
                      <Icon className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                      {MODALITY_LABELS[modality]}
                    </p>
                  )
                })}
                <p className="flex items-start gap-2 text-[0.76rem] leading-5 text-forest-900">
                  <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-500" aria-hidden="true" />
                  {professional.availabilityNote}
                </p>
              </div>

              <Link
                to={`/profesionales/${professional.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-[0.74rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
              >
                Ver perfil completo
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-4 rounded-3xl border border-forest-900/10 bg-cream-100/70 p-5">
              <h2 className="font-sans text-[0.82rem] font-semibold text-forest-950">
                Qué pasa después
              </h2>
              <ol className="mt-3 space-y-3">
                {[
                  'Revisamos tu solicitud y la compartimos con el profesional.',
                  'Te escribimos para confirmar horario y resolver dudas.',
                  'Si encajáis, acordáis la primera conversación. Sin compromiso.',
                ].map((item, index) => (
                  <li key={item} className="flex gap-2.5 text-[0.74rem] leading-5 text-muted">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-[0.64rem] font-semibold text-forest-700">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <CrisisNotice className="mt-4" compact />
            <DemoNotice className="mt-4" />
          </aside>
        </div>
      </section>
    </>
  )
}

function inputClasses(hasError: boolean): string {
  return cn(
    'h-11 w-full rounded-xl border bg-cream-50 px-3.5 text-[0.86rem] text-ink placeholder:text-muted/55 transition-colors focus:outline-none focus:ring-2',
    hasError
      ? 'border-clay-500 focus:border-clay-600 focus:ring-clay-200'
      : 'border-forest-900/15 focus:border-forest-500 focus:ring-forest-200',
  )
}

function labelClasses(): string {
  return 'mb-1.5 block text-[0.76rem] font-semibold text-forest-900'
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  hint?: string
  containerClassName?: string
}

function TextField({ id, label, error, hint, containerClassName, required, ...props }: TextFieldProps) {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className={labelClasses()}>
        {label}
        {required && <span className="ml-0.5 text-clay-700">*</span>}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={inputClasses(Boolean(error))}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-[0.67rem] leading-5 text-muted/80">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function SelectField({ id, label, error, children, required, ...props }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClasses()}>
        {label}
        {required && <span className="ml-0.5 text-clay-700">*</span>}
      </label>
      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClasses(Boolean(error)), 'pr-8')}
        {...props}
      >
        {children}
      </select>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
  error?: string
  hint?: string
}

function TextareaField({ id, label, error, hint, required, className, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClasses()}>
        {label}
        {required && <span className="ml-0.5 text-clay-700">*</span>}
      </label>
      <textarea
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn(
          inputClasses(Boolean(error)),
          'h-auto min-h-[8.5rem] resize-y py-3 leading-6',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.67rem] leading-5 text-muted/80">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1 text-[0.7rem] leading-5 text-clay-700">
      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

interface ConsentCheckboxProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  children: ReactNode
}

function ConsentCheckbox({ id, checked, onChange, error, children }: ConsentCheckboxProps) {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-forest-900/30 accent-forest-800"
        />
        <label htmlFor={id} className="text-[0.76rem] leading-6 text-muted">
          {children}
        </label>
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  )
}
