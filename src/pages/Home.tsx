import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock,
  Compass,
  HeartHandshake,
  Leaf,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'
import { PROFESSIONALS, SPECIALTIES, formatPrice } from '../../shared/professionals'
import { SCREENINGS } from '../lib/screening'
import { usePageMeta } from '../hooks/usePageMeta'
import { LinkButton } from '../components/Button'
import { ProfessionalCard } from '../components/ProfessionalCard'
import { MatchQuiz } from '../components/MatchQuiz'
import { MoodCheckIn } from '../components/MoodCheckIn'
import { Avatar, InfoBanner, SectionHeading } from '../components/Primitives'
import { FaqList, type FaqItem } from '../components/FaqList'
import { DemoNotice } from '../components/DemoNotice'

const FEATURES = [
  { icon: Video, label: 'Sesiones por video o chat' },
  { icon: ClipboardCheck, label: 'Tests de tamizaje validados' },
  { icon: ShieldCheck, label: 'Privacidad por diseño' },
  { icon: Compass, label: 'Tú marcas el ritmo' },
]

const STEPS = [
  {
    number: '01',
    icon: Compass,
    title: 'Cuéntanos qué necesitas',
    text: 'Haz un test orientativo o responde tres preguntas. No necesitas saber qué especialidad elegir ni tener un diagnóstico previo.',
  },
  {
    number: '02',
    icon: HeartHandshake,
    title: 'Encuentra a tu profesional',
    text: 'Explora perfiles, especialidades y modalidades. Envía una solicitud con tus preferencias y el equipo coordina el primer contacto.',
  },
  {
    number: '03',
    icon: Leaf,
    title: 'Avanza a tu ritmo',
    text: 'Conversa por videollamada o mensajería. Tu profesional te ayudará a entender lo que pasa y a construir un plan realista.',
  },
]

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Verificación, no suposiciones',
    text: 'En producción, cada profesional pasa por un proceso documentado de identidad, titulación y licencia antes de publicar su perfil.',
  },
  {
    icon: BookOpen,
    title: 'Tests con respaldo y límites',
    text: 'Usamos instrumentos de tamizaje validados, explicamos qué miden y qué no. Un resultado nunca se presenta como diagnóstico.',
  },
  {
    icon: Lock,
    title: 'Privacidad por diseño',
    text: 'Los resultados de tus tests se quedan en tu dispositivo. Tus datos de contacto se usan solo para gestionar tu solicitud.',
  },
  {
    icon: Users,
    title: 'Personas, no algoritmos',
    text: 'La tecnología acerca la ayuda, pero el vínculo terapéutico lo construyen personas. Sin promesas mágicas ni atajos.',
  },
]

const FAQS: FaqItem[] = [
  {
    question: '¿Los tests de Sereno pueden diagnosticarme?',
    answer:
      'No. Son instrumentos de tamizaje: ayudan a poner en palabras lo que sientes y a detectar si conviene una evaluación profesional. Un diagnóstico requiere una valoración clínica individual por parte de un psicólogo/a o psiquiatra. Por eso cada resultado incluye una recomendación de consultar y el enlace a las líneas de crisis.',
  },
  {
    question: '¿Cuánto cuesta una sesión?',
    answer:
      'En esta demostración los precios son orientativos y van de US$35 a US$70 por sesión de 50 minutos. En un servicio real, cada profesional define su tarifa y se muestra antes de solicitar la cita. Te recomendamos preguntar por el valor total, la duración y la política de cancelación antes de comenzar.',
  },
  {
    question: '¿Cómo sé que un profesional está capacitado?',
    answer:
      'En producción verificamos identidad, titulación, licencia o registro profesional vigente y buena reputación, y revisamos que la información del perfil sea coherente. En esta demo los perfiles son ficticios y aparecen marcados como muestra. Nunca publiques perfiles reales sin su consentimiento y sin completar la verificación.',
  },
  {
    question: '¿Qué hago si estoy en crisis?',
    answer:
      'Sereno no es un servicio de emergencias ni monitoriza mensajes en tiempo real. Si tú o alguien está en peligro inmediato, llama al número de emergencias de tu país. En la sección de ayuda encontrarás líneas de crisis de varios países y un directorio internacional.',
  },
  {
    question: '¿Qué pasa con mis datos y los resultados de los tests?',
    answer:
      'Los resultados de los tests se guardan únicamente en el almacenamiento local de tu navegador y puedes borrarlos cuando quieras. Los datos del formulario de contacto se usan para gestionar tu solicitud y se tratan según la política de privacidad. No vendemos datos ni los usamos para publicidad. En producción debes cumplir la normativa aplicable (por ejemplo, RGPD o leyes locales de datos de salud).',
  },
  {
    question: '¿Puedo cambiar de profesional si no me siento cómodo/a?',
    answer:
      'Sí. La relación terapéutica es personal y sentirte escuchado/a es parte del proceso. Puedes comentarlo con tu profesional o solicitar un cambio. En un servicio real, el equipo debe acompañarte en esa transición y compartir solo la información clínica necesaria con tu consentimiento.',
  },
]

const FEATURED = PROFESSIONALS.filter((professional) => professional.featured).slice(0, 3)
const FEATURED_SPECIALTIES = Array.from(new Set(FEATURED.flatMap((professional) => professional.specialties))).slice(0, 4)

export function Home() {
  usePageMeta({
    title: 'Terapia online a tu ritmo',
    description:
      'Encuentra psicólogos y psiquiatras, haz tests de tamizaje validados y cuida tu salud mental con un espacio cálido, privado y sin juicios.',
  })

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-forest-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-32 top-32 h-[30rem] w-[30rem] rounded-full bg-clay-200/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="page-container relative grid gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
              Terapia online · Psicología y psiquiatría
            </p>
            <h1 className="mt-5 text-[2.7rem] leading-[0.98] text-forest-950 sm:text-6xl lg:text-[4.25rem]">
              Tu mente merece el mismo <em className="font-normal italic text-clay-600">cuidado</em>{' '}
              que tu cuerpo.
            </h1>
            <p className="mt-6 max-w-xl text-[1rem] leading-7 text-muted sm:text-[1.05rem]">
              Encuentra un psicólogo/a o psiquiatra, conversa desde donde estés y da el primer paso
              con herramientas claras. Sin juicios, sin prisas y con la privacidad por delante.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/profesionales" size="lg">
                Encontrar mi profesional
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
              <LinkButton to="/tests" size="lg" variant="secondary">
                Hacer un test gratuito
              </LinkButton>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.76rem] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                3 tests de tamizaje validados
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                100% online y confidencial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                Sin listas de espera eternas
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[29rem] animate-fade-up [animation-delay:120ms]">
            <div
              className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-forest-200/70 via-cream-200 to-clay-100 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/60 bg-forest-900 p-4 shadow-lift sm:p-5">
              <div className="flex items-center justify-between px-1 pb-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-cream-50/20" />
                  <span className="h-2 w-2 rounded-full bg-cream-50/20" />
                  <span className="h-2 w-2 rounded-full bg-clay-400/70" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/10 px-2.5 py-1 text-[0.62rem] font-medium text-cream-200/70">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Espacio confidencial
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950 p-5 sm:p-6">
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-cream-50/10"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-cream-50/10"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-forest-500/20 blur-2xl"
                  aria-hidden="true"
                />

                <p className="relative inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-forest-200/60">
                  <Sparkles className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
                  Tu espacio de hoy
                </p>
                <p className="relative mt-3 font-display text-[1.6rem] leading-[1.15] text-cream-50 sm:text-[1.75rem]">
                  “No tienes que tenerlo todo claro para empezar.”
                </p>

                <div className="relative mt-6 flex items-center gap-3 rounded-2xl border border-cream-50/10 bg-cream-50/[0.06] p-3">
                  <Avatar name="Valentina Ríos" tone={0} size="sm" online />
                  <div className="min-w-0">
                    <p className="truncate text-[0.85rem] font-semibold text-cream-50">
                      Valentina Ríos
                    </p>
                    <p className="truncate text-[0.66rem] text-cream-200/60">
                      Psicóloga clínica · En línea
                    </p>
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/10 text-cream-100">
                      <Video className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/10 text-cream-100">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <MoodCheckIn />
              </div>

              <div className="flex items-center justify-between gap-3 px-1 pt-3 text-[0.64rem] text-cream-200/55">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Próxima sesión · jueves 18:00
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Privacidad primero
                </span>
              </div>
            </div>

            <div className="absolute -right-3 top-24 hidden items-center gap-2 rounded-2xl border border-forest-900/10 bg-cream-50 px-3 py-2 shadow-lift sm:flex lg:-right-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold text-forest-950">Test PHQ-9</p>
                <p className="text-[0.58rem] text-muted">3 min · orientativo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-forest-900/10 bg-cream-50/70">
        <div className="page-container grid grid-cols-2 gap-x-4 gap-y-4 py-6 sm:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.label} className="flex items-center gap-2.5 text-[0.78rem] text-forest-900/80">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100/70 text-forest-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {feature.label}
              </div>
            )
          })}
        </div>
      </section>

      <section id="encuentra" className="page-container scroll-mt-24 py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12">
          <div>
            <SectionHeading
              eyebrow="Encuentra tu match"
              title={
                <>
                  No siempre sabemos por dónde empezar.{' '}
                  <span className="text-clay-600">Te ayudamos.</span>
                </>
              }
              description="Responde tres preguntas y te mostraremos profesionales que encajan con lo que buscas. Sin registro, sin compromiso y sin tener que explicar tu historia a un formulario."
            />
            <ul className="mt-6 space-y-3">
              {[
                'Filtra por especialidad, modalidad y presupuesto.',
                'Puedes cambiar de profesional cuando lo necesites.',
                'Si no lo tienes claro, también hay una opción para ti.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.86rem] leading-6 text-muted">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/profesionales"
              className="mt-6 inline-flex items-center gap-1.5 text-[0.84rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
            >
              Ver todos los profesionales
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <MatchQuiz />
        </div>
      </section>

      <section
        id="como-funciona"
        className="scroll-mt-24 border-y border-forest-900/10 bg-cream-50/80"
      >
        <div className="page-container py-16 lg:py-20">
          <SectionHeading
            align="center"
            eyebrow="Cómo funciona"
            title="Tres pasos, sin laberintos."
            description="Desde la primera duda hasta la primera conversación. Puedes empezar por donde te resulte más cómodo."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="group relative rounded-3xl border border-forest-900/10 bg-cream-50 p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm text-forest-400">{step.number}</span>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-100 text-forest-700 transition-colors group-hover:bg-forest-900 group-hover:text-cream-50">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl text-forest-950">{step.title}</h3>
                  <p className="mt-2 text-[0.84rem] leading-6 text-muted">{step.text}</p>
                </div>
              )
            })}
          </div>
          <p className="mx-auto mt-7 max-w-xl text-center text-[0.78rem] leading-6 text-muted">
            No necesitas un diagnóstico previo ni saber qué especialidad elegir. Si no sabes por
            dónde empezar, un test de tamizaje puede darte un primer mapa.{' '}
            <Link to="/tests" className="font-semibold text-forest-800 underline underline-offset-2">
              Ver tests
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="page-container py-16 lg:py-20">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Profesionales"
            title="Personas que escuchan de verdad."
            description="Perfiles con enfoque, especialidades y modalidades claras para que elijas con información, no por una foto bonita."
          />
          <LinkButton to="/profesionales" variant="secondary" size="md" className="shrink-0">
            Ver directorio completo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </LinkButton>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURED.map((professional) => (
            <ProfessionalCard key={professional.slug} professional={professional} />
          ))}
        </div>

        <DemoNotice className="mt-5" />

        <div className="mt-5 flex flex-wrap gap-2">
          {FEATURED_SPECIALTIES.map((specialty) => (
            <Link
              key={specialty}
              to={`/profesionales?especialidad=${specialty}`}
              className="rounded-full border border-forest-900/10 bg-cream-50 px-3 py-1.5 text-[0.72rem] font-medium text-forest-800 transition-colors hover:border-forest-900/25 hover:bg-white"
            >
              {SPECIALTIES.find((item) => item.id === specialty)?.label}
            </Link>
          ))}
          <span className="inline-flex items-center px-2 text-[0.72rem] text-muted">
            y {SPECIALTIES.length - FEATURED_SPECIALTIES.length} especialidades más
          </span>
        </div>
      </section>

      <section className="border-y border-forest-900/10 bg-cream-50/80">
        <div className="page-container py-16 lg:py-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Tests de tamizaje"
              title="Ponle nombre a lo que sientes."
              description="Instrumentos breves y validados para mirar tu estado de ánimo, tu ansiedad o tu bienestar. Gratis, sin registro y con los resultados en tu dispositivo."
            />
            <Link
              to="/tests"
              className="inline-flex shrink-0 items-center gap-1.5 text-[0.84rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
            >
              Comparar tests
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SCREENINGS.map((screening) => (
              <Link
                key={screening.id}
                to={`/tests/${screening.id}`}
                className="group flex flex-col rounded-3xl border border-forest-900/10 bg-cream-50 p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-900/20 hover:shadow-lift"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-forest-100 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-forest-700">
                    {screening.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.68rem] text-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {screening.durationMinutes} min
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl text-forest-950">
                  {screening.shortName}
                </h3>
                <p className="mt-2 flex-1 text-[0.84rem] leading-6 text-muted">{screening.tagline}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-forest-800">
                  Hacer el test
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          <InfoBanner className="mt-5" tone="warning">
            Los tests son herramientas de tamizaje, no diagnósticos. No sustituyen la valoración de
            un profesional de salud mental.{' '}
            <Link to="/aviso-medico" className="font-semibold underline underline-offset-2">
              Leer el aviso médico
            </Link>
            .
          </InfoBanner>
        </div>
      </section>

      <section className="page-container py-16 lg:py-20">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-forest-950 px-6 py-10 text-cream-50 shadow-lift sm:px-10 lg:px-14 lg:py-14">
          <div
            className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-forest-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
            <div>
              <p className="eyebrow text-forest-200">
                <span className="h-1.5 w-1.5 rounded-full bg-clay-300" />
                Nuestros principios
              </p>
              <h2 className="mt-3 text-3xl leading-tight text-cream-50 sm:text-4xl">
                La tecnología acerca. El vínculo <em className="font-normal italic text-clay-300">sostiene</em>.
              </h2>
              <p className="mt-5 max-w-md text-[0.92rem] leading-7 text-cream-200/70">
                No prometemos curas rápidas ni resultados perfectos. Ofrecemos un camino claro
                hacia profesionales cualificados y herramientas que te ayuden a entenderte mejor.
              </p>
              <Link
                to="/aviso-medico"
                className="mt-6 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-cream-50 underline decoration-clay-300/60 decoration-2 underline-offset-4 hover:decoration-clay-300"
              >
                Cómo trabajamos y qué límites tenemos
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon
                return (
                  <div
                    key={principle.title}
                    className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.04] p-4"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream-50/10 text-cream-100">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 font-sans text-[0.84rem] font-semibold text-cream-50">
                      {principle.title}
                    </h3>
                    <p className="mt-1 text-[0.75rem] leading-6 text-cream-200/65">
                      {principle.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="preguntas" className="page-container scroll-mt-24 pb-16 lg:pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow="Preguntas frecuentes"
              title="Antes de dar el paso."
              description="Las dudas son parte del proceso. Si la tuya no está aquí, puedes escribirnos desde el formulario de contacto de cualquier profesional."
            />
            <div className="mt-6 rounded-3xl border border-forest-900/10 bg-forest-50 p-5">
              <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-forest-900">
                <ShieldCheck className="h-4 w-4 text-forest-600" aria-hidden="true" />
                Transparencia desde el inicio
              </p>
              <p className="mt-2 text-[0.78rem] leading-6 text-muted">
                Esta es una demo funcional: los profesionales son ficticios y el servicio aún no
                presta atención real. Antes de publicar, sustituye los datos y completa el proceso
                legal y clínico.
              </p>
              <Link
                to="/crisis"
                className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-clay-700 underline decoration-clay-300 underline-offset-2 hover:decoration-clay-600"
              >
                Si es una emergencia, empieza aquí
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <FaqList items={FAQS} />
        </div>
      </section>

      <section className="page-container pb-20 pt-2">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-forest-900/10 bg-gradient-to-br from-clay-100 via-cream-200 to-forest-100 px-6 py-12 text-center shadow-soft sm:px-10 sm:py-14">
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full border border-forest-900/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full border border-forest-900/10"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
              El primer paso
            </p>
            <h2 className="mt-3 text-3xl leading-tight text-forest-950 sm:text-[2.6rem]">
              No tiene que ser perfecto. Solo tiene que ser{' '}
              <em className="font-normal italic text-clay-600">tuyo</em>.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[0.94rem] leading-7 text-muted">
              Puedes empezar con un test de tres minutos o solicitar una primera conversación. No
              hay un orden correcto para cuidarte.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <LinkButton to="/profesionales" size="lg">
                Encontrar mi profesional
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
              <LinkButton to="/tests" size="lg" variant="secondary">
                Empezar con un test
              </LinkButton>
            </div>
            <p className="mt-5 text-[0.7rem] text-muted">
              Ejemplo de precios y disponibilidad:{' '}
              {formatPrice(Math.min(...PROFESSIONALS.map((professional) => professional.priceUsd)))}–
              {formatPrice(Math.max(...PROFESSIONALS.map((professional) => professional.priceUsd)))}{' '}
              por sesión (datos de muestra).
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
