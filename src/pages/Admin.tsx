import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import {
  COMMON_LANGUAGES,
  MODALITIES,
  MODALITY_LABELS,
  ROLES,
  ROLE_LABELS,
  SPECIALTIES,
  formatPrice,
  professionalInputSchema,
  specialtyLabel,
  type Modality,
  type Professional,
  type ProfessionalRole,
  type SpecialtyId,
} from '../../shared/professionals'
import {
  AGE_RANGE_LABELS,
  CONTACT_MODALITY_LABELS,
  CONTACT_REASON_LABELS,
  PREFERRED_TIME_LABELS,
  toFieldErrors,
  type AdminContactRequest,
} from '../../shared/contact'
import { usePageMeta } from '../hooks/usePageMeta'
import { useProfessionals } from '../providers/ProfessionalsProvider'
import {
  ApiError,
  adminLogin,
  createProfessional,
  deleteProfessional,
  getAdminContactRequests,
  getAdminProfessionals,
} from '../lib/api'
import { clearAdminToken, readAdminToken, saveAdminToken } from '../lib/admin'
import { cn, formatDateTime } from '../lib/format'
import { Avatar } from '../components/Primitives'
import { Button, LinkButton } from '../components/Button'

type Status = 'checking' | 'logged-out' | 'logged-in'

interface FormState {
  name: string
  specialty: string
  languages: string
  experienceYears: string
  priceUsd: string
  role: ProfessionalRole
  modalities: Modality[]
  title: string
  location: string
  country: string
  nextSlot: string
  bio: string
  approach: string
  featured: boolean
}

const INPUT_CLASS =
  'h-11 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 text-[0.86rem] text-forest-900 placeholder:text-muted/50 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300'
const LABEL_CLASS = 'mb-1.5 block text-[0.75rem] font-semibold text-forest-900'
const ERROR_CLASS = 'mt-1 text-[0.72rem] leading-5 text-clay-700'

function lookupLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value
}

function emptyForm(): FormState {
  return {
    name: '',
    specialty: '',
    languages: 'Español',
    experienceYears: '',
    priceUsd: '',
    role: 'psicologo',
    modalities: ['video'],
    title: '',
    location: '',
    country: '',
    nextSlot: '',
    bio: '',
    approach: '',
    featured: false,
  }
}

export function Admin() {
  usePageMeta({
    title: 'Panel del desarrollador',
    description: 'Área privada para gestionar los profesionales del directorio de Sereno.',
  })

  const { refresh } = useProfessionals()
  const [token, setToken] = useState<string | null>(() => readAdminToken())
  const [status, setStatus] = useState<Status>(token ? 'checking' : 'logged-out')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [storage, setStorage] = useState<'supabase' | 'memory'>('memory')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [notice, setNotice] = useState('')
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [requests, setRequests] = useState<AdminContactRequest[]>([])
  const [requestsStorage, setRequestsStorage] = useState<'supabase' | 'memory' | null>(null)
  const [requestsError, setRequestsError] = useState('')
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsReloadKey, setRequestsReloadKey] = useState(0)

  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [])

  useEffect(() => {
    if (!token) {
      setStatus('logged-out')
      return undefined
    }

    let cancelled = false
    setStatus('checking')

    getAdminProfessionals(token)
      .then((response) => {
        if (cancelled) return
        setProfessionals(response.professionals)
        setStorage(response.storage)
        setStatus('logged-in')
        setGlobalError('')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          clearAdminToken()
          setToken(null)
          setLoginError('La sesión caducó. Vuelve a iniciar sesión.')
          return
        }
        setStatus('logged-in')
        setGlobalError(
          error instanceof Error ? error.message : 'No pudimos cargar los profesionales.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setRequests([])
      setRequestsStorage(null)
      setRequestsError('')
      setRequestsLoading(false)
      return undefined
    }

    let cancelled = false
    setRequestsLoading(true)
    setRequestsError('')

    getAdminContactRequests(token)
      .then((response) => {
        if (cancelled) return
        setRequests(response.requests)
        setRequestsStorage(response.storage)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          clearAdminToken()
          setToken(null)
          setLoginError('La sesión caducó. Vuelve a iniciar sesión.')
          return
        }
        setRequestsError(
          error instanceof Error ? error.message : 'No pudimos cargar las solicitudes recibidas.',
        )
      })
      .finally(() => {
        if (!cancelled) setRequestsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, requestsReloadKey])

  function handleApiError(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        clearAdminToken()
        setToken(null)
        setLoginError('La sesión caducó. Vuelve a iniciar sesión.')
        return
      }
      setGlobalError(error.message)
      if (Object.keys(error.fieldErrors).length > 0) setFieldErrors(error.fieldErrors)
      return
    }
    setGlobalError(fallback)
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')
    setLoggingIn(true)

    try {
      const response = await adminLogin(loginPassword)
      saveAdminToken(response.token)
      setLoginPassword('')
      setToken(response.token)
    } catch (error) {
      setLoginError(
        error instanceof ApiError
          ? error.message
          : 'No pudimos conectar con el servidor. Inténtalo de nuevo.',
      )
    } finally {
      setLoggingIn(false)
    }
  }

  function handleLogout() {
    clearAdminToken()
    setToken(null)
    setProfessionals([])
    setRequests([])
    setRequestsStorage(null)
    setRequestsError('')
    setStatus('logged-out')
    setNotice('')
    setGlobalError('')
    setPendingDelete(null)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
    setFieldErrors((previous) => {
      if (!previous[key]) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  function toggleModality(modality: Modality) {
    setForm((previous) => {
      const selected = previous.modalities.includes(modality)
      if (selected && previous.modalities.length === 1) return previous
      return {
        ...previous,
        modalities: selected
          ? previous.modalities.filter((item) => item !== modality)
          : [...previous.modalities, modality],
      }
    })
    setFieldErrors((previous) => {
      if (!previous.modalities) return previous
      const next = { ...previous }
      delete next.modalities
      return next
    })
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGlobalError('')
    setNotice('')

    const parsed = professionalInputSchema.safeParse({
      name: form.name,
      specialties: form.specialty ? [form.specialty as SpecialtyId] : [],
      languages: form.languages.split(',').map((item) => item.trim()).filter(Boolean),
      experienceYears: Number(form.experienceYears),
      priceUsd: Number(form.priceUsd),
      role: form.role,
      modalities: form.modalities,
      title: form.title.trim() || undefined,
      location: form.location.trim() || undefined,
      country: form.country.trim() || undefined,
      nextSlot: form.nextSlot.trim() || undefined,
      bio: form.bio.trim() || undefined,
      approach: form.approach.trim() || undefined,
      featured: form.featured,
    })

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error))
      setGlobalError('Revisa los campos marcados antes de guardar el profesional.')
      return
    }

    if (!token) return
    setCreating(true)

    try {
      const response = await createProfessional(token, parsed.data)
      setProfessionals((previous) => [response.professional, ...previous])
      setForm(emptyForm())
      setFieldErrors({})
      setNotice(`${response.professional.name} ya forma parte del directorio.`)
      await refresh()
    } catch (error) {
      handleApiError(error, 'No pudimos guardar el profesional. Inténtalo de nuevo.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(slug: string) {
    if (!token) return
    setDeleting(slug)
    setGlobalError('')
    setNotice('')

    try {
      await deleteProfessional(token, slug)
      setProfessionals((previous) => previous.filter((professional) => professional.slug !== slug))
      setPendingDelete(null)
      setNotice('El profesional se retiró del directorio.')
      await refresh()
    } catch (error) {
      handleApiError(error, 'No pudimos retirar el profesional. Inténtalo de nuevo.')
    } finally {
      setDeleting(null)
    }
  }

  if (status === 'checking') {
    return (
      <section className="page-container flex min-h-[60vh] items-center justify-center py-16">
        <span className="inline-flex items-center gap-2 text-[0.88rem] text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Comprobando sesión…
        </span>
      </section>
    )
  }

  if (status === 'logged-out') {
    return (
      <section className="page-container py-14 lg:py-20">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-6 shadow-lift sm:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-cream-50">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-5">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
              Acceso restringido
            </p>
            <h1 className="mt-2 text-3xl leading-tight text-forest-950">Panel del desarrollador</h1>
            <p className="mt-3 text-[0.9rem] leading-6 text-muted">
              Introduce la contraseña configurada en el servidor para añadir o retirar profesionales
              del directorio.
            </p>

            <form onSubmit={handleLogin} className="mt-6">
              <label htmlFor="admin-password" className={LABEL_CLASS}>
                Contraseña
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className={INPUT_CLASS}
                placeholder="Contraseña del panel"
                required
              />

              {loginError && (
                <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-clay-50 px-3 py-2 text-[0.78rem] leading-5 text-clay-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {loginError}
                </p>
              )}

              <Button type="submit" size="md" className="mt-5 w-full" disabled={loggingIn}>
                {loggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {loggingIn ? 'Comprobando…' : 'Entrar al panel'}
              </Button>
            </form>

            <p className="mt-5 border-t border-forest-900/10 pt-4 text-[0.72rem] leading-5 text-muted">
              Sin <code className="rounded bg-forest-50 px-1 py-0.5">ADMIN_PASSWORD</code> en el
              servidor, este panel permanece desactivado. La contraseña no se guarda en el navegador.
            </p>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al sitio
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-container py-10 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
            Panel privado
          </p>
          <h1 className="mt-2 text-4xl leading-tight text-forest-950">Profesionales del directorio</h1>
          <p className="mt-2 max-w-2xl text-[0.9rem] leading-6 text-muted">
            Los perfiles que añadas aquí se guardan en Supabase y aparecen en la página principal,
            el directorio y las fichas públicas del sitio.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton to="/" variant="secondary" size="md">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ver sitio
          </LinkButton>
          <Button type="button" variant="ghost" size="md" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {globalError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-2xl border border-clay-600/20 bg-clay-50 px-4 py-3 text-[0.82rem] leading-6 text-clay-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {globalError}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mt-6 flex items-start gap-2.5 rounded-2xl border border-forest-600/20 bg-forest-50 px-4 py-3 text-[0.82rem] leading-6 text-forest-800"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {notice}
        </div>
      )}

      {storage === 'memory' && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-gold-500/30 bg-gold-100/60 px-4 py-3 text-[0.8rem] leading-6 text-[#6d4d0e]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-semibold">Supabase no está configurado.</strong> Puedes iniciar
            sesión, pero para guardar profesionales necesitas definir <code>SUPABASE_URL</code> y{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> en el servidor y ejecutar{' '}
            <code>supabase/schema.sql</code>.
          </p>
        </div>
      )}

      {storage === 'supabase' && professionals.length === 0 && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-forest-900/10 bg-cream-50 px-4 py-3 text-[0.8rem] leading-6 text-muted">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden="true" />
          <p>
            La base de datos está vacía. Añade el primer profesional para publicarlo en el
            directorio y en las fichas públicas.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <form
          onSubmit={handleCreate}
          noValidate
          className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-7"
        >
          <div className="flex items-start justify-between gap-3 border-b border-forest-900/10 pb-5">
            <div>
              <h2 className="flex items-center gap-2 text-2xl text-forest-950">
                <Plus className="h-5 w-5 text-forest-600" aria-hidden="true" />
                Añadir profesional
              </h2>
              <p className="mt-1 text-[0.8rem] leading-6 text-muted">
                Los campos con <span className="font-semibold text-clay-700">*</span> son
                obligatorios.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="admin-name" className={LABEL_CLASS}>
                Nombre completo <span className="text-clay-700">*</span>
              </label>
              <input
                id="admin-name"
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. Ana Martínez"
                aria-invalid={Boolean(fieldErrors.name)}
                required
              />
              {fieldErrors.name && <p className={ERROR_CLASS}>{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="admin-specialty" className={LABEL_CLASS}>
                Especialidad <span className="text-clay-700">*</span>
              </label>
              <select
                id="admin-specialty"
                value={form.specialty}
                onChange={(event) => setField('specialty', event.target.value)}
                className={INPUT_CLASS}
                aria-invalid={Boolean(fieldErrors.specialties)}
                required
              >
                <option value="">Selecciona una especialidad</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.label}
                  </option>
                ))}
              </select>
              {fieldErrors.specialties && <p className={ERROR_CLASS}>{fieldErrors.specialties}</p>}
            </div>

            <div>
              <label htmlFor="admin-role" className={LABEL_CLASS}>
                Rol
              </label>
              <select
                id="admin-role"
                value={form.role}
                onChange={(event) => setField('role', event.target.value as ProfessionalRole)}
                className={INPUT_CLASS}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="admin-languages" className={LABEL_CLASS}>
                Idiomas <span className="text-clay-700">*</span>
              </label>
              <input
                id="admin-languages"
                value={form.languages}
                onChange={(event) => setField('languages', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Español, Inglés"
                aria-invalid={Boolean(fieldErrors.languages)}
                required
              />
              <p className="mt-1 text-[0.68rem] text-muted">
                Sepáralos con comas. Ej.: Español, Inglés, Portugués.
              </p>
              {fieldErrors.languages && <p className={ERROR_CLASS}>{fieldErrors.languages}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMMON_LANGUAGES.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => {
                      const current = form.languages
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                      if (current.some((item) => item.toLowerCase() === language.toLowerCase())) return
                      setField('languages', [...current, language].join(', '))
                    }}
                    className="rounded-full border border-forest-900/10 bg-white px-2.5 py-1 text-[0.68rem] font-medium text-forest-700 transition-colors hover:border-forest-900/25"
                  >
                    + {language}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="admin-experience" className={LABEL_CLASS}>
                Años de experiencia <span className="text-clay-700">*</span>
              </label>
              <input
                id="admin-experience"
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                value={form.experienceYears}
                onChange={(event) => setField('experienceYears', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. 8"
                aria-invalid={Boolean(fieldErrors.experienceYears)}
                required
              />
              {fieldErrors.experienceYears && (
                <p className={ERROR_CLASS}>{fieldErrors.experienceYears}</p>
              )}
            </div>

            <div>
              <label htmlFor="admin-price" className={LABEL_CLASS}>
                Precio por sesión (USD) <span className="text-clay-700">*</span>
              </label>
              <input
                id="admin-price"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                value={form.priceUsd}
                onChange={(event) => setField('priceUsd', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. 45"
                aria-invalid={Boolean(fieldErrors.priceUsd)}
                required
              />
              {fieldErrors.priceUsd && <p className={ERROR_CLASS}>{fieldErrors.priceUsd}</p>}
            </div>

            <div className="sm:col-span-2">
              <span className={LABEL_CLASS}>Modalidades</span>
              <div className="flex flex-wrap gap-2">
                {MODALITIES.map((modality) => {
                  const selected = form.modalities.includes(modality)
                  return (
                    <button
                      key={modality}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleModality(modality)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[0.76rem] font-medium transition-colors',
                        selected
                          ? 'border-forest-900 bg-forest-900 text-cream-50'
                          : 'border-forest-900/15 bg-cream-50 text-forest-800 hover:border-forest-900/30',
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      {MODALITY_LABELS[modality]}
                    </button>
                  )
                })}
              </div>
              {fieldErrors.modalities && <p className={ERROR_CLASS}>{fieldErrors.modalities}</p>}
            </div>

            <div>
              <label htmlFor="admin-title" className={LABEL_CLASS}>
                Título profesional (opcional)
              </label>
              <input
                id="admin-title"
                value={form.title}
                onChange={(event) => setField('title', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Se genera desde el rol y la especialidad"
              />
              {fieldErrors.title && <p className={ERROR_CLASS}>{fieldErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="admin-next-slot" className={LABEL_CLASS}>
                Próxima disponibilidad (opcional)
              </label>
              <input
                id="admin-next-slot"
                value={form.nextSlot}
                onChange={(event) => setField('nextSlot', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. Esta semana"
              />
              {fieldErrors.nextSlot && <p className={ERROR_CLASS}>{fieldErrors.nextSlot}</p>}
            </div>

            <div>
              <label htmlFor="admin-location" className={LABEL_CLASS}>
                Ciudad (opcional)
              </label>
              <input
                id="admin-location"
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. Madrid"
              />
              {fieldErrors.location && <p className={ERROR_CLASS}>{fieldErrors.location}</p>}
            </div>

            <div>
              <label htmlFor="admin-country" className={LABEL_CLASS}>
                País (opcional)
              </label>
              <input
                id="admin-country"
                value={form.country}
                onChange={(event) => setField('country', event.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. España"
              />
              {fieldErrors.country && <p className={ERROR_CLASS}>{fieldErrors.country}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="admin-bio" className={LABEL_CLASS}>
                Biografía breve (opcional)
              </label>
              <textarea
                id="admin-bio"
                value={form.bio}
                onChange={(event) => setField('bio', event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 py-2.5 text-[0.86rem] leading-6 text-forest-900 placeholder:text-muted/50 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
                placeholder="Cómo acompaña a las personas que atiende."
              />
              {fieldErrors.bio && <p className={ERROR_CLASS}>{fieldErrors.bio}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="admin-approach" className={LABEL_CLASS}>
                Enfoque terapéutico (opcional)
              </label>
              <textarea
                id="admin-approach"
                value={form.approach}
                onChange={(event) => setField('approach', event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 py-2.5 text-[0.86rem] leading-6 text-forest-900 placeholder:text-muted/50 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
                placeholder="Cómo trabaja en sesión y qué herramientas utiliza."
              />
              {fieldErrors.approach && <p className={ERROR_CLASS}>{fieldErrors.approach}</p>}
            </div>

            <label className="flex items-start gap-2.5 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setField('featured', event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-forest-900/25 text-forest-800 focus:ring-forest-300"
              />
              <span className="text-[0.8rem] leading-6 text-forest-900">
                Destacar en la página principal
                <span className="block text-[0.72rem] text-muted">
                  Aparecerá entre los primeros perfiles si hay más de tres.
                </span>
              </span>
            </label>
          </div>

          <Button type="submit" size="md" className="mt-6 w-full sm:w-auto" disabled={creating}>
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            {creating ? 'Guardando…' : 'Añadir al directorio'}
          </Button>
        </form>

        <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-7">
          <div className="flex items-center justify-between gap-3 border-b border-forest-900/10 pb-4">
            <div>
              <h2 className="text-2xl text-forest-950">Publicados</h2>
              <p className="mt-1 text-[0.78rem] text-muted">
                {professionals.length}{' '}
                {professionals.length === 1 ? 'profesional' : 'profesionales'} en la base de datos
              </p>
            </div>
            <span className="rounded-full bg-forest-100 px-3 py-1 text-[0.68rem] font-semibold text-forest-800">
              {storage === 'supabase' ? 'Supabase' : 'Sin base de datos'}
            </span>
          </div>

          {professionals.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-forest-900/20 bg-cream-100/60 px-5 py-10 text-center">
              <UserRound className="mx-auto h-6 w-6 text-forest-500" aria-hidden="true" />
              <p className="mt-3 text-[0.88rem] font-semibold text-forest-950">
                Todavía no hay perfiles guardados
              </p>
              <p className="mx-auto mt-1 max-w-xs text-[0.78rem] leading-6 text-muted">
                Añade el primero con el formulario. En cuanto lo guardes aparecerá en el directorio
                público.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {professionals.map((professional) => (
                <li
                  key={professional.slug}
                  className="rounded-2xl border border-forest-900/10 bg-white/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={professional.name} tone={professional.avatarTone} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-[0.9rem] font-semibold text-forest-950">
                          {professional.name}
                        </p>
                        {professional.featured && (
                          <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.62rem] font-semibold text-[#6d4d0e]">
                            Destacado
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[0.74rem] leading-5 text-muted">
                        {professional.title}
                      </p>
                      <p className="mt-2 text-[0.72rem] leading-5 text-muted">
                        {professional.languages.join(' · ')} · {professional.experienceYears}{' '}
                        {professional.experienceYears === 1 ? 'año' : 'años'} de experiencia ·{' '}
                        {formatPrice(professional.priceUsd)}/sesión
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {professional.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="rounded-full bg-forest-50 px-2 py-0.5 text-[0.64rem] font-medium text-forest-700"
                          >
                            {specialtyLabel(specialty)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-forest-900/10 pt-3">
                    <Link
                      to={`/profesionales/${professional.slug}`}
                      className="inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
                    >
                      Ver perfil
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Link>

                    {pendingDelete === professional.slug ? (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-[0.7rem] text-clay-700">¿Retirar?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(professional.slug)}
                          disabled={deleting === professional.slug}
                          className="inline-flex items-center gap-1 rounded-full bg-clay-600 px-2.5 py-1 text-[0.7rem] font-semibold text-white hover:bg-clay-700 disabled:opacity-60"
                        >
                          {deleting === professional.slug ? (
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          )}
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(null)}
                          className="rounded-full px-2 py-1 text-[0.7rem] font-semibold text-muted hover:text-forest-800"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingDelete(professional.slug)}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-clay-600/20 px-2.5 py-1 text-[0.7rem] font-semibold text-clay-700 transition-colors hover:bg-clay-50"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                        Retirar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 border-b border-forest-900/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl text-forest-950">
              <Inbox className="h-5 w-5 text-forest-600" aria-hidden="true" />
              Solicitudes recibidas
            </h2>
            <p className="mt-1 max-w-2xl text-[0.8rem] leading-6 text-muted">
              Personas que han escrito desde el formulario de contacto. Los datos son privados:
              úsalos solo para responder a la solicitud.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest-100 px-3 py-1 text-[0.68rem] font-semibold text-forest-800">
              {requests.length} {requests.length === 1 ? 'solicitud' : 'solicitudes'}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRequestsReloadKey((key) => key + 1)}
              disabled={requestsLoading}
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', requestsLoading && 'animate-spin')}
                aria-hidden="true"
              />
              Actualizar
            </Button>
          </div>
        </div>

        {requestsStorage === 'memory' && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-gold-500/30 bg-gold-100/60 px-4 py-3 text-[0.78rem] leading-6 text-[#6d4d0e]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              <strong className="font-semibold">Supabase no está configurado.</strong> Las
              solicitudes se guardan solo en la memoria de esta instancia y se pierden al
              reiniciar el servidor. Define <code>SUPABASE_URL</code> y{' '}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> para conservarlas.
            </p>
          </div>
        )}

        {requestsError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-2xl border border-clay-600/20 bg-clay-50 px-4 py-3 text-[0.8rem] leading-6 text-clay-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {requestsError}
          </div>
        )}

        {requestsLoading && requests.length === 0 ? (
          <p className="mt-6 flex items-center gap-2 text-[0.84rem] text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Cargando solicitudes…
          </p>
        ) : requests.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-forest-900/20 bg-cream-100/60 px-5 py-10 text-center">
            <Inbox className="mx-auto h-6 w-6 text-forest-500" aria-hidden="true" />
            <p className="mt-3 text-[0.88rem] font-semibold text-forest-950">
              Todavía no hay solicitudes
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[0.78rem] leading-6 text-muted">
              Cuando alguien envíe el formulario de contacto de un profesional, la solicitud
              aparecerá aquí.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {requests.map((request) => (
              <li
                key={request.reference}
                className="rounded-2xl border border-forest-900/10 bg-white/60"
              >
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[0.92rem] font-semibold text-forest-950">
                      {request.fullName}
                    </p>
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.62rem] font-semibold text-[#6d4d0e]">
                      Nueva
                    </span>
                    <span className="rounded-full bg-forest-50 px-2 py-0.5 font-mono text-[0.62rem] font-semibold text-forest-700">
                      {request.reference}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.76rem] leading-5 text-muted">
                    <span>
                      Para{' '}
                      <strong className="font-semibold text-forest-900">
                        {request.professionalName}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatDateTime(request.createdAt)}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-forest-50 px-2 py-0.5 text-[0.64rem] font-medium text-forest-700">
                      {lookupLabel(CONTACT_REASON_LABELS, request.reason)}
                    </span>
                    <span className="rounded-full bg-cream-200/70 px-2 py-0.5 text-[0.64rem] font-medium text-forest-800">
                      {lookupLabel(CONTACT_MODALITY_LABELS, request.modality)}
                    </span>
                    <span className="rounded-full bg-cream-200/70 px-2 py-0.5 text-[0.64rem] font-medium text-forest-800">
                      {lookupLabel(PREFERRED_TIME_LABELS, request.preferredTime)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-forest-900/10 px-4 py-3 text-[0.74rem] text-forest-800">
                  <a
                    href={`mailto:${request.email}`}
                    className="inline-flex items-center gap-1.5 break-all underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {request.email}
                  </a>
                  {request.phone && (
                    <a
                      href={`tel:${request.phone}`}
                      className="inline-flex items-center gap-1.5 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      {request.phone}
                    </a>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                    {lookupLabel(AGE_RANGE_LABELS, request.ageRange)}
                  </span>
                  {request.country && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                      {request.country}
                    </span>
                  )}
                </div>

                <details className="group border-t border-forest-900/10 px-4 py-3">
                  <summary className="flex cursor-pointer items-center gap-1.5 text-[0.76rem] font-semibold text-forest-800 marker:text-forest-500">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    Ver mensaje
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-white/80 px-3 py-3 text-[0.82rem] leading-6 text-forest-900">
                    {request.message}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
