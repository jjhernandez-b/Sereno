import { Phone, ShieldAlert, HeartHandshake, ArrowUpRight, Globe2 } from 'lucide-react'
import { HOTLINES, EMERGENCY_REMINDER } from '../../shared/crisis'
import { usePageMeta } from '../hooks/usePageMeta'
import { BreathingExercise } from '../components/BreathingExercise'
import { LinkButton } from '../components/Button'
import { SectionHeading } from '../components/Primitives'

const GROUNDING_STEPS = [
  'Nombra 5 cosas que puedas ver a tu alrededor.',
  'Escucha 4 sonidos, cerca y lejos.',
  'Toca 3 objetos y describe su textura.',
  'Identifica 2 olores, o dos cosas que te guste oler.',
  'Di en voz baja 1 cosa buena de ti o de este momento.',
]

const STAY_SAFE = [
  {
    title: 'Aléjate de lo que pueda hacerte daño',
    text: 'Si es posible, pon distancia con objetos, sustancias o lugares que puedan aumentar el riesgo. Pide a alguien de confianza que esté contigo.',
  },
  {
    title: 'No lo enfrentes en soledad',
    text: 'Llama a una persona de confianza, a una línea de crisis o a emergencias. Decirlo en voz alta reduce la carga y activa ayuda.',
  },
  {
    title: 'Dale tiempo a la ola',
    text: 'Los pensamientos intensos suben y bajan. Intenta no tomar decisiones importantes en el pico de la crisis.',
  },
  {
    title: 'Acude a urgencias si hay peligro',
    text: 'Si existe riesgo inmediato para ti o para otra persona, acude al servicio de urgencias más cercano o llama al número de emergencias.',
  },
]

export function Crisis() {
  usePageMeta({
    title: 'Líneas de crisis y ayuda urgente',
    description:
      'Si estás en crisis o en peligro, aquí encontrarás líneas de ayuda por país, recursos de contención y un recordatorio de que Sereno no es un servicio de emergencias.',
  })

  return (
    <>
      <section className="relative overflow-hidden border-b border-clay-600/20 bg-gradient-to-br from-clay-50 via-cream-100 to-forest-50">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-clay-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="page-container relative py-12 lg:py-16">
          <p className="eyebrow text-clay-700">
            <span className="h-1.5 w-1.5 rounded-full bg-clay-600" />
            Ayuda inmediata
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-[1.03] text-forest-950 sm:text-5xl lg:text-[3.5rem]">
            No tienes que sostener esto <em className="font-normal italic text-clay-600">solo/a</em>.
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-muted">
            Si tú o alguien está en peligro inmediato, llama ahora al número de emergencias de tu
            país. Esta página reúne líneas de apoyo y ejercicios breves para atravesar un momento
            difícil.
          </p>

          <div
            role="alert"
            className="mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-clay-600/25 bg-white/70 p-4 backdrop-blur sm:p-5"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-600 text-white">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-sans text-[0.9rem] font-semibold text-clay-700">
                Sereno no es un servicio de emergencias
              </p>
              <p className="mt-1 text-[0.82rem] leading-6 text-clay-700/85">{EMERGENCY_REMINDER}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-12 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Líneas de ayuda"
            title="Elige tu país o región."
            description="Los números y horarios pueden cambiar. Verifica siempre con la fuente oficial antes de confiar en ellos."
          />
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-[0.8rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
          >
            <Globe2 className="h-4 w-4" aria-hidden="true" />
            Directorio internacional
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOTLINES.map((hotline) => (
            <article
              key={hotline.country}
              className="flex flex-col rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  {hotline.flag}
                </span>
                <h2 className="font-sans text-[0.92rem] font-semibold text-forest-950">
                  {hotline.country}
                </h2>
              </div>

              <ul className="mt-4 flex-1 space-y-3">
                {hotline.lines.map((line) => (
                  <li key={`${hotline.country}-${line.label}`}>
                    <p className="text-[0.72rem] leading-5 text-muted">{line.label}</p>
                    {line.tel ? (
                      <a
                        href={`tel:${line.tel}`}
                        className="inline-flex items-center gap-1.5 font-display text-xl text-forest-900 transition-colors hover:text-clay-700"
                      >
                        <Phone className="h-4 w-4 text-forest-500" aria-hidden="true" />
                        {line.number}
                      </a>
                    ) : (
                      <a
                        href="https://findahelpline.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-display text-xl text-forest-900 underline decoration-forest-300 underline-offset-4 hover:text-clay-700"
                      >
                        {line.number}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                    {line.note && (
                      <p className="mt-0.5 text-[0.68rem] leading-5 text-muted/80">{line.note}</p>
                    )}
                  </li>
                ))}
              </ul>

              {hotline.note && (
                <p className="mt-3 border-t border-forest-900/10 pt-3 text-[0.68rem] leading-5 text-muted">
                  {hotline.note}
                </p>
              )}
            </article>
          ))}
        </div>

        <p className="mt-5 rounded-2xl border border-gold-500/25 bg-gold-100/60 px-4 py-3 text-[0.76rem] leading-6 text-[#6d4d0e]">
          <strong className="font-semibold">Antes de publicar:</strong> verifica cada línea con la
          fuente oficial del país, añade la fecha de revisión y sustituye los números si han
          cambiado. Los recursos de esta demo son orientativos.
        </p>
      </section>

      <section className="border-y border-forest-900/10 bg-cream-50/80">
        <div className="page-container py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
            <BreathingExercise />
            <div>
              <SectionHeading
                eyebrow="Anclaje rápido"
                title="Vuelve al aquí y ahora."
                description="La técnica 5-4-3-2-1 ayuda a interrumpir la espiral de pensamientos y conectar con el presente. Hazlo despacio, sin forzar."
              />
              <ol className="mt-6 space-y-3">
                {GROUNDING_STEPS.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-2xl border border-forest-900/10 bg-cream-50 p-4"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-100 text-[0.72rem] font-semibold text-forest-700">
                      {index + 1}
                    </span>
                    <p className="text-[0.84rem] leading-6 text-muted">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-12 lg:py-16">
        <SectionHeading
          eyebrow="Mientras llega la ayuda"
          title="Cuatro cosas que pueden bajar el riesgo."
          description="No son un tratamiento ni sustituyen a un profesional. Son medidas de protección para los próximos minutos."
        />
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {STAY_SAFE.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-clay-100 text-clay-700">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-sans text-[0.9rem] font-semibold text-forest-950">
                {item.title}
              </h2>
              <p className="mt-1.5 text-[0.82rem] leading-6 text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-forest-900/10 bg-forest-900 p-6 text-cream-50 shadow-lift sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <h2 className="text-2xl text-cream-50">Cuando estés en un momento más estable.</h2>
            <p className="mt-2 max-w-xl text-[0.82rem] leading-6 text-cream-200/70">
              Hablar con un profesional no es solo para las crisis. También sirve para entender lo
              que te pasa, prevenir recaídas y construir herramientas para el día a día.
            </p>
          </div>
          <LinkButton to="/profesionales" variant="light" size="md" className="mt-4 shrink-0 sm:mt-0">
            Ver profesionales
          </LinkButton>
        </div>
      </section>
    </>
  )
}
