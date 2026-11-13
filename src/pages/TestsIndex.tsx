import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Clock,
  HeartHandshake,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { SCREENINGS, type Screening } from '../lib/screening'
import { LinkButton } from '../components/Button'
import { CrisisNotice } from '../components/CrisisNotice'
import { InfoBanner, SectionHeading } from '../components/Primitives'
import { cn } from '../lib/format'

export function TestsIndex() {
  usePageMeta({
    title: 'Tests de tamizaje de salud mental',
    description:
      'Tests gratuitos y validados para orientarte sobre ansiedad, estado de ánimo y bienestar. No son diagnósticos: son un punto de partida para hablar con un profesional.',
  })

  return (
    <>
      <section className="relative overflow-hidden border-b border-forest-900/10 bg-cream-50/70">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-clay-200/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-forest-200/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="page-container relative py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
                Tests de tamizaje
              </p>
              <h1 className="mt-4 text-4xl leading-[1.04] text-forest-950 sm:text-5xl lg:text-[3.4rem]">
                Entiende lo que sientes,{' '}
                <em className="font-normal italic text-clay-600">sin etiquetas</em>.
              </h1>
              <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-muted">
                Tres instrumentos breves y validados para mirar tu estado de ánimo, tu ansiedad o
                tu bienestar. Gratis, sin registro y con los resultados guardados solo en tu
                dispositivo.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-[0.72rem]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 font-medium text-forest-800">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Gratis y sin registro
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 font-medium text-forest-800">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  2–3 minutos
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 font-medium text-forest-800">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Resultados en tu dispositivo
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-gold-500/25 bg-gold-100/60 p-5 sm:p-6">
              <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#6d4d0e]">
                <Info className="h-4 w-4" aria-hidden="true" />
                Antes de empezar
              </p>
              <p className="mt-2 text-[0.82rem] leading-6 text-[#6d4d0e]/85">
                Estos tests son herramientas de tamizaje, no diagnósticos. No sustituyen la
                valoración de un psicólogo/a o psiquiatra. Si estás en crisis, no esperes el
                resultado: busca ayuda ahora.
              </p>
              <Link
                to="/crisis"
                className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-clay-700 underline decoration-clay-300 underline-offset-2 hover:decoration-clay-600"
              >
                Ver líneas de ayuda
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-12 lg:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {SCREENINGS.map((screening, index) => (
            <TestCard key={screening.id} screening={screening} index={index} />
          ))}
        </div>

        <InfoBanner className="mt-5" tone="warning">
          <strong className="font-semibold">Importante:</strong> un resultado alto no confirma un
          diagnóstico y uno bajo no descarta que necesites apoyo. Los síntomas cambian con el
          tiempo y dependen de tu contexto.{' '}
          <Link to="/aviso-medico" className="font-semibold underline underline-offset-2">
            Leer el aviso médico completo
          </Link>
          .
        </InfoBanner>
      </section>

      <section className="border-y border-forest-900/10 bg-cream-50/80">
        <div className="page-container py-12 lg:py-16">
          <SectionHeading
            align="center"
            eyebrow="Cómo leer tu resultado"
            title="Una foto, no una sentencia."
            description="Los tests ordenan información, pero no pueden captar toda tu historia. Así los interpretamos."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: ClipboardCheck,
                title: 'No es un diagnóstico',
                text: 'Un diagnóstico requiere una evaluación clínica individual. El test solo indica si conviene consultar y con qué intensidad se presentan algunos síntomas.',
              },
              {
                icon: Sparkles,
                title: 'Es una foto del momento',
                text: 'Preguntamos por las últimas dos semanas. Un mal día no define tu salud mental, y un resultado bueno no significa que no puedas necesitar apoyo.',
              },
              {
                icon: HeartHandshake,
                title: 'El contexto importa',
                text: 'Duelos, trabajo, relaciones, salud física y acceso a recursos influyen. Comparte el resultado con un profesional para interpretarlo juntos.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-xl text-forest-950">{item.title}</h3>
                  <p className="mt-2 text-[0.82rem] leading-6 text-muted">{item.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="page-container py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Base científica"
              title="Instrumentos usados en clínica e investigación."
              description="Elegimos cuestionarios breves, ampliamente estudiados y fáciles de responder. Cada ficha incluye su referencia original."
            />
            <div className="mt-6 space-y-3">
              {SCREENINGS.map((screening) => (
                <div key={screening.id} className="rounded-2xl border border-forest-900/10 bg-cream-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-forest-100 px-2.5 py-1 text-[0.66rem] font-semibold text-forest-700">
                      {screening.shortName}
                    </span>
                    <span className="text-[0.72rem] text-muted">{screening.category}</span>
                  </div>
                  <p className="mt-2 text-[0.76rem] leading-6 text-muted">{screening.citation}</p>
                  {screening.citationUrl && (
                    <a
                      href={screening.citationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      Fuente original
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <CrisisNotice compact />
            <div className="rounded-3xl border border-forest-900/10 bg-forest-50 p-5">
              <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-forest-900">
                <ShieldCheck className="h-4 w-4 text-forest-600" aria-hidden="true" />
                Privacidad
              </p>
              <p className="mt-2 text-[0.78rem] leading-6 text-muted">
                No pedimos tu nombre ni tu correo para hacer un test. Tus respuestas y resultados se
                guardan en el almacenamiento local de este navegador y puedes borrarlos desde Mi
                progreso.
              </p>
              <Link
                to="/mi-progreso"
                className="mt-3 inline-flex items-center gap-1 text-[0.76rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
              >
                Ver mi historial
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5">
              <p className="text-[0.8rem] font-semibold text-forest-950">¿Prefieres hablar con alguien?</p>
              <p className="mt-2 text-[0.78rem] leading-6 text-muted">
                No necesitas un test para pedir ayuda. Puedes solicitar una primera conversación
                directamente.
              </p>
              <LinkButton to="/profesionales" size="sm" variant="secondary" className="mt-3 w-full">
                Ver profesionales
              </LinkButton>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

function TestCard({ screening, index }: { screening: Screening; index: number }) {
  const accent = [
    'bg-forest-100 text-forest-700',
    'bg-clay-100 text-clay-700',
    'bg-gold-100 text-[#6d4d0e]',
  ][index % 3]

  return (
    <Link
      to={`/tests/${screening.id}`}
      className="group flex flex-col rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-900/20 hover:shadow-lift sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn('rounded-full px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.1em]', accent)}>
          {screening.category}
        </span>
        <span className="inline-flex items-center gap-1 text-[0.68rem] text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {screening.durationMinutes} min
        </span>
      </div>

      <h2 className="mt-4 font-display text-2xl leading-tight text-forest-950">
        {screening.shortName}
      </h2>
      <p className="mt-1 text-[0.72rem] font-medium text-forest-600">{screening.name}</p>
      <p className="mt-3 flex-1 text-[0.84rem] leading-6 text-muted">{screening.description}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-[0.66rem] text-muted">
        <span className="rounded-full border border-forest-900/10 px-2.5 py-1">
          {screening.questions.length} preguntas
        </span>
        <span className="rounded-full border border-forest-900/10 px-2.5 py-1">
          {screening.timeframe}
        </span>
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-forest-800">
        Comenzar test
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}
