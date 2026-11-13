import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Globe2,
  Info,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Video,
} from 'lucide-react'
import {
  MODALITY_LABELS,
  PROFESSIONALS,
  formatPrice,
  getProfessional,
  specialtyLabel,
  type Modality,
} from '../../shared/professionals'
import { usePageMeta } from '../hooks/usePageMeta'
import { Avatar } from '../components/Primitives'
import { LinkButton } from '../components/Button'
import { ProfessionalCard } from '../components/ProfessionalCard'
import { DemoNotice } from '../components/DemoNotice'
import { CrisisNotice } from '../components/CrisisNotice'

const MODALITY_ICONS: Record<Modality, typeof Video> = {
  video: Video,
  chat: MessageCircle,
  telefono: Phone,
}

export function ProfessionalProfile() {
  const { slug } = useParams<{ slug: string }>()
  const professional = getProfessional(slug)

  usePageMeta({
    title: professional ? `${professional.name} · Perfil profesional` : 'Profesional no encontrado',
    description: professional
      ? `Conoce el perfil de ${professional.name}, ${professional.title.toLowerCase()}. Especialidades, formación, modalidades y cómo solicitar una primera conversación.`
      : 'El perfil solicitado no existe o ya no está disponible.',
  })

  if (!professional) {
    return (
      <section className="page-container py-20 text-center">
        <p className="eyebrow justify-center">Perfil no encontrado</p>
        <h1 className="mt-3 text-4xl text-forest-950">Este perfil ya no está disponible.</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-7 text-muted">
          Puede que el enlace esté mal escrito o que el profesional ya no forme parte del
          directorio. Puedes explorar otros perfiles.
        </p>
        <LinkButton to="/profesionales" size="lg" className="mt-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al directorio
        </LinkButton>
      </section>
    )
  }

  const similar = PROFESSIONALS.filter(
    (candidate) =>
      candidate.slug !== professional.slug &&
      candidate.specialties.some((specialty) => professional.specialties.includes(specialty)),
  ).slice(0, 3)

  return (
    <>
      <section className="border-b border-forest-900/10 bg-cream-50/70">
        <div className="page-container py-8 lg:py-12">
          <Link
            to="/profesionales"
            className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al directorio
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start lg:gap-10">
            <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar name={professional.name} tone={professional.avatarTone} size="xl" online />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3 py-1 text-[0.68rem] font-semibold text-cream-50">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {professional.role === 'psiquiatra' ? 'Psiquiatra' : 'Psicólogo/a clínico/a'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-[0.68rem] font-semibold text-[#6d4d0e]">
                      <Info className="h-3.5 w-3.5" aria-hidden="true" />
                      Perfil de muestra
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-[0.68rem] font-semibold text-forest-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-forest-500" aria-hidden="true" />
                      {professional.nextSlot}
                    </span>
                  </div>

                  <h1 className="mt-3 text-4xl leading-[1.03] text-forest-950 sm:text-5xl">
                    {professional.name}
                  </h1>
                  <p className="mt-2 text-[0.95rem] leading-6 text-muted">{professional.title}</p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.78rem] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-forest-400" aria-hidden="true" />
                      {professional.location}, {professional.country}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe2 className="h-3.5 w-3.5 text-forest-400" aria-hidden="true" />
                      {professional.languages.join(' · ')}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-forest-400" aria-hidden="true" />
                      {professional.experienceYears} años de experiencia
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-[0.98rem] leading-7 text-muted">{professional.bio}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:hidden">
                <LinkButton to={`/solicitar/${professional.slug}`} size="lg">
                  Solicitar primera conversación
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </LinkButton>
                <LinkButton to="/tests" size="lg" variant="secondary">
                  Hacer un test
                </LinkButton>
              </div>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {professional.specialties.map((specialty) => (
                  <Link
                    key={specialty}
                    to={`/profesionales?especialidad=${specialty}`}
                    className="rounded-full border border-forest-900/10 bg-cream-50 px-3 py-1.5 text-[0.72rem] font-medium text-forest-800 transition-colors hover:border-forest-900/25 hover:bg-white"
                  >
                    {specialtyLabel(specialty)}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="lg:sticky lg:top-28">
              <BookingCard professional={professional} />
            </aside>
          </div>
        </div>
      </section>

      <section className="page-container py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_21rem] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div>
              <h2 className="text-2xl text-forest-950 sm:text-3xl">Cómo trabajo</h2>
              <p className="mt-3 text-[0.95rem] leading-7 text-muted">{professional.approach}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {professional.focusTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-forest-50 px-2.5 py-1 text-[0.7rem] font-medium text-forest-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-forest-900/10 pt-8">
              <h2 className="text-2xl text-forest-950">Formación y credenciales</h2>
              <p className="mt-2 text-[0.8rem] text-muted">
                Datos de muestra. En producción, cada credencial se verifica con el documento
                original y el registro profesional correspondiente.
              </p>
              <ul className="mt-5 space-y-3">
                {professional.credentials.map((credential) => (
                  <li key={credential} className="flex items-start gap-2.5 text-[0.88rem] leading-6 text-muted">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {credential}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 border-t border-forest-900/10 pt-8">
              <h2 className="text-2xl text-forest-950">Qué incluye una sesión</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {professional.sessionIncludes.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 rounded-2xl border border-forest-900/10 bg-cream-50 p-4 text-[0.84rem] leading-6 text-forest-900"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-forest-900/10 pt-8">
              <h2 className="text-2xl text-forest-950">Cómo es la primera conversación</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    number: '01',
                    title: 'Antes',
                    text: 'Envías tu solicitud con lo que quieres trabajar y tus preferencias de horario.',
                  },
                  {
                    number: '02',
                    title: 'Durante',
                    text: 'Hablas con tu profesional para conoceros y aclarar expectativas. Sin compromiso.',
                  },
                  {
                    number: '03',
                    title: 'Después',
                    text: 'Si encaja, acordáis un plan y la frecuencia de las sesiones. Si no, te orientamos.',
                  },
                ].map((step) => (
                  <div key={step.number} className="rounded-2xl border border-forest-900/10 bg-cream-50 p-4">
                    <span className="font-display text-xs text-forest-400">{step.number}</span>
                    <h3 className="mt-1 font-sans text-[0.82rem] font-semibold text-forest-950">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[0.76rem] leading-5 text-muted">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-forest-900/10 bg-forest-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl text-forest-950">Así verificamos a los profesionales</h2>
                  <p className="mt-1.5 text-[0.82rem] leading-6 text-muted">
                    Publicar un perfil no es suficiente. En un servicio real, el proceso incluye
                    comprobar identidad, titulación, licencia o registro vigente, experiencia y
                    estado ético. Revisamos la información periódicamente y retiramos perfiles si
                    deja de cumplir los requisitos.
                  </p>
                  <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[
                      'Identidad y documento oficial',
                      'Titulación y licencia vigente',
                      'Entrevista y referencias',
                      'Revisión y renovación periódica',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[0.76rem] text-forest-800">
                        <Check className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 rounded-xl bg-gold-100/70 px-3 py-2 text-[0.74rem] leading-5 text-[#6d4d0e]">
                    <strong className="font-semibold">Este perfil es de muestra:</strong> la
                    verificación descrita no se ha realizado. No contactes a esta persona ni uses
                    sus datos como si fueran reales.
                  </p>
                </div>
              </div>
            </div>

            <CrisisNotice
              className="mt-8"
              compact
              message="Este perfil no es un servicio de emergencia. Si estás en peligro o tienes pensamientos de hacerte daño, acude a los recursos de crisis o a emergencias."
            />
          </div>

          <div className="lg:sticky lg:top-28 lg:mt-0">
            <div className="lg:hidden">
              <DemoNotice />
            </div>
            <div className="mt-4 rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft lg:mt-0">
              <h2 className="font-sans text-[0.9rem] font-semibold text-forest-950">
                Antes de empezar
              </h2>
              <ul className="mt-4 space-y-3 text-[0.78rem] leading-6 text-muted">
                <li className="flex gap-2">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden="true" />
                  Tus datos se usan solo para gestionar esta solicitud.
                </li>
                <li className="flex gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden="true" />
                  {professional.availabilityNote}
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden="true" />
                  No se realiza ningún cobro al enviar el formulario.
                </li>
              </ul>
              <p className="mt-5 border-t border-forest-900/10 pt-4 text-[0.7rem] leading-5 text-muted">
                Respuesta orientativa en 24–48 h hábiles. Si necesitas ayuda inmediata, consulta
                las líneas de crisis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="border-t border-forest-900/10 bg-cream-50/60">
          <div className="page-container py-12 lg:py-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">También podría encajar</p>
                <h2 className="mt-2 text-3xl text-forest-950">Otros perfiles con enfoques afines.</h2>
              </div>
              <Link
                to="/profesionales"
                className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
              >
                Ver todo el directorio
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {similar.map((candidate) => (
                <ProfessionalCard key={candidate.slug} professional={candidate} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function BookingCard({ professional }: { professional: (typeof PROFESSIONALS)[number] }) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 text-[0.68rem] font-semibold text-forest-700">
          <span className="h-1.5 w-1.5 rounded-full bg-forest-500" aria-hidden="true" />
          {professional.nextSlot}
        </span>
        <span className="text-[0.68rem] text-muted">Sesión online</span>
      </div>

      <p className="mt-4 text-[0.72rem] text-muted">Precio de referencia</p>
      <p className="font-display text-4xl leading-none text-forest-950">
        {formatPrice(professional.priceUsd)}
        <span className="ml-1 font-sans text-[0.72rem] font-normal text-muted">/ sesión</span>
      </p>
      <p className="mt-1 text-[0.7rem] text-muted">50 minutos · pago coordinado con el profesional</p>

      <LinkButton to={`/solicitar/${professional.slug}`} size="md" className="mt-5 w-full">
        Solicitar primera conversación
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </LinkButton>
      <LinkButton to="/tests" size="md" variant="secondary" className="mt-2 w-full">
        Hacer un test antes
      </LinkButton>

      <div className="mt-5 space-y-2.5 border-t border-forest-900/10 pt-4">
        {professional.modalities.map((modality) => {
          const Icon = MODALITY_ICONS[modality]
          return (
            <p key={modality} className="flex items-center gap-2 text-[0.78rem] text-forest-900">
              <Icon className="h-4 w-4 text-forest-500" aria-hidden="true" />
              {MODALITY_LABELS[modality]}
            </p>
          )
        })}
        <p className="flex items-center gap-2 text-[0.78rem] text-forest-900">
          <Globe2 className="h-4 w-4 text-forest-500" aria-hidden="true" />
          {professional.languages.join(' · ')}
        </p>
      </div>

      <p className="mt-4 rounded-xl bg-gold-100/60 px-3 py-2 text-[0.68rem] leading-5 text-[#6d4d0e]">
        Perfil de muestra. En producción, aquí aparecerían la licencia verificada y los enlaces
        seguros de pago.
      </p>
    </div>
  )
}
