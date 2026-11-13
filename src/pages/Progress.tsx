import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Lock,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { BAND_STYLES, SCREENINGS } from '../lib/screening'
import { clearResults, readResults, removeResult, type SavedScreeningResult } from '../lib/storage'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn, formatDate } from '../lib/format'
import { LinkButton } from '../components/Button'
import { CrisisNotice } from '../components/CrisisNotice'
import { InfoBanner, SectionHeading } from '../components/Primitives'

type Filter = 'todos' | SavedScreeningResult['screeningId']

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  ...SCREENINGS.map((screening) => ({
    id: screening.id as Filter,
    label: screening.shortName,
  })),
]

export function Progress() {
  usePageMeta({
    title: 'Mi progreso',
    description:
      'Revisa los resultados de tus tests guardados en este dispositivo, observa su evolución y bórralos cuando quieras.',
  })

  const [results, setResults] = useState<SavedScreeningResult[]>([])
  const [filter, setFilter] = useState<Filter>('todos')
  const [ready, setReady] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)

  useEffect(() => {
    setResults(readResults())
    setReady(true)
  }, [])

  const handleRemove = useCallback((id: string) => {
    setResults(removeResult(id))
  }, [])

  const handleClear = useCallback(() => {
    clearResults()
    setResults([])
    setConfirmingClear(false)
  }, [])

  const filtered = useMemo(
    () => (filter === 'todos' ? results : results.filter((result) => result.screeningId === filter)),
    [filter, results],
  )

  const byScreening = useMemo(() => {
    const groups: Record<string, SavedScreeningResult[]> = {}
    for (const result of results) {
      groups[result.screeningId] = [...(groups[result.screeningId] ?? []), result]
    }
    return groups
  }, [results])

  const crisisResults = results.filter((result) => result.crisisFlag)

  return (
    <>
      <section className="relative overflow-hidden border-b border-forest-900/10 bg-cream-50/70">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-forest-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="page-container relative py-12 lg:py-16">
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
            Mi progreso
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl leading-[1.05] text-forest-950 sm:text-5xl">
                Tu historia, <em className="font-normal italic text-clay-600">a tu ritmo</em>.
              </h1>
              <p className="mt-4 text-[0.98rem] leading-7 text-muted">
                Aquí aparecen los tests que completaste en este dispositivo. No son un expediente
                clínico ni un diagnóstico: son una forma de mirar cambios en el tiempo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[0.72rem]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/10 bg-cream-50 px-3 py-1.5 font-medium text-forest-800">
                <ClipboardCheck className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                {results.length} {results.length === 1 ? 'resultado guardado' : 'resultados guardados'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/10 bg-cream-50 px-3 py-1.5 font-medium text-forest-800">
                <Lock className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                Solo en este navegador
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-10 lg:py-14">
        {!ready ? (
          <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-10 text-center text-[0.86rem] text-muted">
            Cargando tus resultados…
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-forest-900/20 bg-cream-50 px-6 py-14 text-center">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-700">
              <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-2xl text-forest-950">Todavía no hay resultados guardados.</h2>
            <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-6 text-muted">
              Cuando completes un test, guardaremos el resultado aquí automáticamente para que
              puedas ver cómo cambia con el tiempo. No se envía a ningún servidor.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <LinkButton to="/tests" size="md">
                Hacer un test
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
              <LinkButton to="/profesionales" size="md" variant="secondary">
                Ver profesionales
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((item) => {
                  const count =
                    item.id === 'todos'
                      ? results.length
                      : results.filter((result) => result.screeningId === item.id).length
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      aria-pressed={filter === item.id}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-[0.74rem] font-medium transition-colors',
                        filter === item.id
                          ? 'border-forest-900 bg-forest-900 text-cream-50'
                          : 'border-forest-900/10 bg-cream-50 text-forest-800 hover:border-forest-900/25 hover:bg-white',
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          'ml-1.5 text-[0.66rem]',
                          filter === item.id ? 'text-cream-200/70' : 'text-muted',
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 space-y-4">
                {filtered.map((result) => (
                  <ResultRow key={result.id} result={result} onRemove={handleRemove} />
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="mt-6 rounded-2xl border border-forest-900/10 bg-cream-50 px-5 py-8 text-center text-[0.84rem] text-muted">
                  No hay resultados de este test todavía.
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-forest-900/10 bg-cream-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-sans text-[0.86rem] font-semibold text-forest-950">
                    Borrar todo el historial
                  </h2>
                  <p className="mt-1 text-[0.74rem] leading-5 text-muted">
                    Elimina los resultados guardados en este navegador. Esta acción no se puede
                    deshacer.
                  </p>
                </div>
                {confirmingClear ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex items-center gap-1.5 rounded-full bg-clay-600 px-4 py-2 text-[0.74rem] font-semibold text-white transition-colors hover:bg-clay-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Sí, borrar todo
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingClear(false)}
                      className="rounded-full border border-forest-900/15 px-4 py-2 text-[0.74rem] font-semibold text-forest-800 transition-colors hover:bg-white"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-clay-600/25 px-4 py-2 text-[0.74rem] font-semibold text-clay-700 transition-colors hover:bg-clay-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Borrar historial
                  </button>
                )}
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft">
                <h2 className="flex items-center gap-2 font-sans text-[0.86rem] font-semibold text-forest-950">
                  <Activity className="h-4 w-4 text-forest-600" aria-hidden="true" />
                  Tendencia por test
                </h2>
                {Object.keys(byScreening).length === 0 ? (
                  <p className="mt-3 text-[0.76rem] leading-6 text-muted">
                    Completa un test para ver tu evolución.
                  </p>
                ) : (
                  <div className="mt-4 space-y-5">
                    {SCREENINGS.filter((screening) => byScreening[screening.id]?.length).map(
                      (screening) => {
                        const entries = byScreening[screening.id]
                        return (
                          <div key={screening.id}>
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-[0.76rem] font-semibold text-forest-900">
                                {screening.shortName}
                              </p>
                              <p className="text-[0.66rem] text-muted">
                                {entries.length}{' '}
                                {entries.length === 1 ? 'registro' : 'registros'}
                              </p>
                            </div>
                            <TrendChart entries={entries} maxScore={screening.maxScore} />
                          </div>
                        )
                      },
                    )}
                  </div>
                )}
                <p className="mt-4 border-t border-forest-900/10 pt-3 text-[0.68rem] leading-5 text-muted">
                  Más puntos no siempre significa más malestar: cada test mide dimensiones
                  distintas. Interpreta los cambios junto a un profesional.
                </p>
              </div>

              {crisisResults.length > 0 && (
                <CrisisNotice
                  compact
                  title="Un registro marcó una señal de alerta"
                  message="En uno de tus tests indicaste pensamientos de hacerte daño. Si esto sigue presente, busca apoyo ahora. No tienes que esperar."
                />
              )}

              <div className="rounded-3xl border border-forest-900/10 bg-forest-50 p-5">
                <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-forest-900">
                  <ShieldCheck className="h-4 w-4 text-forest-600" aria-hidden="true" />
                  Privacidad
                </p>
                <p className="mt-2 text-[0.78rem] leading-6 text-muted">
                  Los resultados se guardan en el almacenamiento local de este navegador. No se
                  envían a nuestros servidores y puedes borrarlos cuando quieras. Si borras los datos
                  del navegador, también se perderán.
                </p>
              </div>

              <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5">
                <p className="text-[0.8rem] font-semibold text-forest-950">¿Quieres comentarlos?</p>
                <p className="mt-2 text-[0.78rem] leading-6 text-muted">
                  Puedes compartir tus resultados con un profesional para interpretarlos juntos, sin
                  que sean un diagnóstico.
                </p>
                <LinkButton to="/profesionales" size="sm" variant="secondary" className="mt-3 w-full">
                  Ver profesionales
                </LinkButton>
              </div>
            </aside>
          </div>
        )}

        {ready && results.length > 0 && (
          <InfoBanner className="mt-8" tone="warning">
            <strong className="font-semibold">Importante:</strong> un historial no reemplaza una
            evaluación clínica. Los resultados pueden variar por contexto, sueño, salud física o
            simplemente por el día. Si algo te preocupa, habla con un psicólogo/a o psiquiatra.{' '}
            <Link to="/aviso-medico" className="font-semibold underline underline-offset-2">
              Leer el aviso médico
            </Link>
            .
          </InfoBanner>
        )}
      </section>

      <section className="border-t border-forest-900/10 bg-cream-50/60">
        <div className="page-container py-10">
          <SectionHeading
            eyebrow="Siguiente paso"
            title="Un resultado no es el final del camino."
            description="Si quieres entender mejor lo que sientes, puedes solicitar una primera conversación con un profesional. Sin compromiso y sin necesidad de un diagnóstico previo."
          />
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <LinkButton to="/profesionales" size="md">
              Encontrar profesional
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <LinkButton to="/tests" size="md" variant="secondary">
              Repetir un test
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  )
}

function ResultRow({
  result,
  onRemove,
}: {
  result: SavedScreeningResult
  onRemove: (id: string) => void
}) {
  const tone = BAND_STYLES[result.tone]
  const screening = SCREENINGS.find((item) => item.id === result.screeningId)

  return (
    <article className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              tone.soft,
              tone.text,
            )}
          >
            <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-sans text-[0.9rem] font-semibold text-forest-950">
              {screening ? screening.name : result.screeningName}
            </h2>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-[0.7rem] text-muted">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(result.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('rounded-full px-3 py-1 text-[0.68rem] font-semibold', tone.chip)}>
            {result.bandLabel}
          </span>
          <button
            type="button"
            onClick={() => onRemove(result.id)}
            aria-label="Borrar este resultado"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-forest-900/10 text-muted transition-colors hover:border-clay-600/30 hover:bg-clay-50 hover:text-clay-700"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="font-display text-3xl leading-none text-forest-950">
          {result.score}
          <span className="ml-0.5 font-sans text-[0.78rem] font-normal text-muted">
            /{result.maxScore}
          </span>
        </p>
        {result.crisisFlag && (
          <span className="rounded-full bg-clay-100 px-2.5 py-1 text-[0.64rem] font-semibold text-clay-700">
            Señal de alerta registrada
          </span>
        )}
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest-900/10" aria-hidden="true">
        <div
          className={cn('h-full rounded-full', tone.bar)}
          style={{ width: `${Math.min(100, Math.max(2, result.maxScore ? (result.score / result.maxScore) * 100 : 0))}%` }}
        />
      </div>

      <Link
        to={`/tests/${result.screeningId}`}
        className="mt-3 inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
      >
        Repetir este test
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}

function TrendChart({
  entries,
  maxScore,
}: {
  entries: SavedScreeningResult[]
  maxScore: number
}) {
  const points = [...entries].reverse().slice(-8)
  const width = 220
  const height = 70
  const padding = 6
  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 2

  const coordinates = points.map((entry, index) => {
    const x =
      points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * usableWidth
    const ratio = maxScore > 0 ? entry.score / maxScore : 0
    const y = padding + (1 - Math.min(1, Math.max(0, ratio))) * usableHeight
    return { x, y, entry }
  })

  const path = coordinates.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <div className="mt-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Evolución de ${points.length} resultados`}
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e4d8c2"
          strokeWidth="1"
        />
        {coordinates.length > 1 && (
          <polyline
            points={path}
            fill="none"
            stroke="#2f7d70"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {coordinates.map((point) => (
          <circle
            key={point.entry.id}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill={BAND_STYLES[point.entry.tone].ring}
            stroke="#fdfaf4"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[0.62rem] text-muted">
        <span>{formatDate(points[0].createdAt)}</span>
        {points.length > 1 && <span>{formatDate(points[points.length - 1].createdAt)}</span>}
      </div>
    </div>
  )
}
