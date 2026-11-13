import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Info,
  Lock,
  RotateCcw,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import {
  BAND_STYLES,
  SCREENINGS,
  getScreening,
  scoreScreening,
  type ScreeningResult,
} from '../lib/screening'
import { saveResult } from '../lib/storage'
import { usePageMeta } from '../hooks/usePageMeta'
import { Button, LinkButton } from '../components/Button'
import { CrisisNotice } from '../components/CrisisNotice'
import { InfoBanner } from '../components/Primitives'
import { cn } from '../lib/format'

type Stage = 'intro' | 'questions' | 'result'

const DIRECTORY_LINKS: Record<string, string> = {
  'phq-9': '/profesionales?especialidad=depresion',
  'gad-7': '/profesionales?especialidad=ansiedad',
  'who-5': '/profesionales?especialidad=estres',
}

export function TestPage() {
  const { testId } = useParams<{ testId: string }>()
  const screening = getScreening(testId)

  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<number | null>>(() =>
    Array.from({ length: screening?.questions.length ?? 0 }, () => null),
  )
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const savedKeyRef = useRef<string | null>(null)

  const result = useMemo(
    () => (screening ? scoreScreening(screening, answers) : null),
    [screening, answers],
  )

  usePageMeta({
    title: screening ? `Test ${screening.shortName} · ${screening.category}` : 'Test no encontrado',
    description: screening
      ? `${screening.description} Resultado orientativo, no diagnóstico.`
      : 'El test solicitado no existe.',
  })

  useEffect(() => {
    setStage('intro')
    setIndex(0)
    setAnswers(Array.from({ length: screening?.questions.length ?? 0 }, () => null))
    setSaved(false)
    setCopied(false)
    savedKeyRef.current = null
  }, [screening?.id, screening?.questions.length])

  useEffect(() => {
    if (stage !== 'result' || !screening || !result) return
    if (result.answered !== result.totalQuestions) return

    window.scrollTo({ top: 0, behavior: 'smooth' })
    const focusTimer = window.setTimeout(() => resultHeadingRef.current?.focus(), 250)

    if (!savedKeyRef.current) {
      const entry = saveResult({
        screeningId: screening.id,
        screeningName: screening.shortName,
        score: result.score,
        maxScore: result.maxScore,
        bandLabel: result.band.label,
        tone: result.band.tone,
        crisisFlag: result.crisisFlag,
        answers: answers.map((value) => value ?? 0),
      })
      savedKeyRef.current = entry?.id ?? 'not-available'
      setSaved(Boolean(entry))
    }

    return () => window.clearTimeout(focusTimer)
  }, [stage, screening, result, answers])

  if (!screening) {
    return (
      <section className="page-container py-20 text-center">
        <p className="eyebrow justify-center">Test no encontrado</p>
        <h1 className="mt-3 text-4xl text-forest-950">Este test no existe.</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-7 text-muted">
          Puede que el enlace esté mal escrito. Puedes ver los tests disponibles y elegir el que
          mejor se ajuste a lo que necesitas.
        </p>
        <LinkButton to="/tests" size="lg" className="mt-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ver todos los tests
        </LinkButton>
      </section>
    )
  }

  const currentQuestion = screening.questions[index]
  const answeredCount = answers.filter((value) => typeof value === 'number').length
  const currentAnswer = answers[index]
  const isLastQuestion = index === screening.questions.length - 1
  const directoryLink = DIRECTORY_LINKS[screening.id] ?? '/profesionales'
  const otherTests = SCREENINGS.filter((item) => item.id !== screening.id)

  function start() {
    if (!screening) return
    setAnswers(Array.from({ length: screening.questions.length }, () => null))
    setIndex(0)
    setStage('questions')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectAnswer(value: number) {
    setAnswers((previous) => {
      const next = [...previous]
      next[index] = value
      return next
    })
  }

  function goNext() {
    if (!screening) return
    if (index < screening.questions.length - 1) {
      setIndex(index + 1)
      return
    }
    setStage('result')
  }

  function restart() {
    if (!screening) return
    savedKeyRef.current = null
    setSaved(false)
    setCopied(false)
    setStage('intro')
    setIndex(0)
    setAnswers(Array.from({ length: screening.questions.length }, () => null))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function shareResult() {
    if (!result || !screening) return
    const summary = `Mi resultado en ${screening.shortName}: ${result.score}/${result.maxScore} (${result.band.label}). Es un tamizaje orientativo, no un diagnóstico.`
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ title: `Resultado ${screening.shortName}`, text: summary, url })
        return
      }
      await navigator.clipboard.writeText(`${summary}\n${url}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // El usuario canceló o el navegador bloqueó la acción.
    }
  }

  /* ------------------------------- Intro ------------------------------- */
  if (stage === 'intro') {
    return (
      <>
        <section className="border-b border-forest-900/10 bg-cream-50/70">
          <div className="page-container py-8 lg:py-12">
            <Link
              to="/tests"
              className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Todos los tests
            </Link>

            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start lg:gap-10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-forest-100 px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-forest-700">
                    {screening.category}
                  </span>
                  <span className="rounded-full bg-cream-200/70 px-2.5 py-1 text-[0.66rem] font-medium text-forest-800">
                    Instrumento de tamizaje
                  </span>
                </div>
                <h1 className="mt-4 text-4xl leading-[1.04] text-forest-950 sm:text-5xl">
                  {screening.shortName}
                </h1>
                <p className="mt-2 text-[0.95rem] leading-6 text-muted">{screening.name}</p>
                <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-muted">
                  {screening.tagline}
                </p>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.76rem] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                    {screening.durationMinutes} minutos
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                    {screening.questions.length} preguntas
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                    {screening.timeframe}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft">
                <p className="flex items-center gap-2 text-[0.78rem] font-semibold text-forest-950">
                  <Lock className="h-4 w-4 text-forest-600" aria-hidden="true" />
                  Privacidad
                </p>
                <p className="mt-2 text-[0.76rem] leading-6 text-muted">
                  No necesitas crear una cuenta. Tus respuestas se guardan solo en este navegador
                  cuando terminas, y puedes borrarlas desde Mi progreso.
                </p>
                <p className="mt-3 border-t border-forest-900/10 pt-3 text-[0.72rem] leading-5 text-muted">
                  Este test no envía tus respuestas a nuestros servidores.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="page-container py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start lg:gap-10">
            <div>
              <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-7">
                <h2 className="text-2xl text-forest-950">Qué mide este test</h2>
                <p className="mt-3 text-[0.92rem] leading-7 text-muted">{screening.description}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { number: '01', title: 'Responde', text: 'Piensa en las últimas dos semanas.' },
                    { number: '02', title: 'Mira', text: 'Obtén una puntuación y su rango.' },
                    { number: '03', title: 'Decide', text: 'Consulta si conviene hablar con un profesional.' },
                  ].map((item) => (
                    <div key={item.number} className="rounded-2xl bg-forest-50 p-3.5">
                      <span className="font-display text-[0.7rem] text-forest-400">{item.number}</span>
                      <p className="mt-1 text-[0.78rem] font-semibold text-forest-950">{item.title}</p>
                      <p className="mt-0.5 text-[0.7rem] leading-5 text-muted">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-forest-900/10 p-4">
                  <h3 className="font-sans text-[0.8rem] font-semibold text-forest-950">Antes de empezar</h3>
                  <ul className="mt-2.5 space-y-2">
                    {[
                      'Responde con honestidad, no como crees que “deberías” estar.',
                      'Piensa en cómo te has sentido la mayoría de los días, no en un día aislado.',
                      'Puedes parar en cualquier momento. No hay respuestas buenas ni malas.',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[0.78rem] leading-6 text-muted">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-500" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="button" size="lg" onClick={start}>
                    Comenzar el test
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <p className="text-[0.7rem] leading-5 text-muted">
                    {screening.durationMinutes} min · {screening.questions.length} preguntas · sin
                    registro
                  </p>
                </div>
              </div>

              <InfoBanner className="mt-4" tone="warning">
                <strong className="font-semibold">No es un diagnóstico.</strong> Este resultado es
                orientativo y no sustituye una evaluación profesional.{' '}
                <Link to="/aviso-medico" className="font-semibold underline underline-offset-2">
                  Aviso médico
                </Link>
                .
              </InfoBanner>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft">
                <h2 className="font-sans text-[0.82rem] font-semibold text-forest-950">Ficha técnica</h2>
                <dl className="mt-3 space-y-2.5 text-[0.76rem]">
                  {[
                    ['Preguntas', String(screening.questions.length)],
                    ['Duración', `${screening.durationMinutes} min`],
                    ['Periodo', screening.timeframe],
                    ['Formato', 'Autoadministrado'],
                    ['Idioma', 'Español'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <dt className="text-muted">{label}</dt>
                      <dd className="text-right font-medium text-forest-900">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 border-t border-forest-900/10 pt-3">
                  <p className="text-[0.68rem] leading-5 text-muted">{screening.citation}</p>
                  {screening.citationUrl && (
                    <a
                      href={screening.citationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[0.68rem] font-semibold text-forest-800 underline underline-offset-2"
                    >
                      Fuente original
                      <ArrowRight className="h-3 w-3 -rotate-45" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              <CrisisNotice compact />
            </aside>
          </div>

          <div className="mt-10 border-t border-forest-900/10 pt-8">
            <h2 className="text-2xl text-forest-950">Otros tests</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherTests.map((item) => (
                <Link
                  key={item.id}
                  to={`/tests/${item.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-forest-900/10 bg-cream-50 p-4 transition-colors hover:bg-white"
                >
                  <div>
                    <p className="font-display text-lg text-forest-950">{item.shortName}</p>
                    <p className="text-[0.72rem] text-muted">{item.category}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-forest-500 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </>
    )
  }

  /* ----------------------------- Questions ----------------------------- */
  if (stage === 'questions') {
    return (
      <section className="page-container py-8 lg:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[0.76rem] font-semibold text-muted transition-colors hover:bg-forest-900/5 hover:text-forest-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Salir del test
            </button>
            <span className="text-[0.72rem] font-medium text-muted">
              {screening.shortName} · {screening.category}
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[0.72rem] text-muted">
              <span>
                Pregunta <span className="font-semibold text-forest-900">{index + 1}</span> de{' '}
                {screening.questions.length}
              </span>
              <span>{answeredCount} respondidas</span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest-900/10"
              role="progressbar"
              aria-valuenow={index + 1}
              aria-valuemin={1}
              aria-valuemax={screening.questions.length}
              aria-label={`Pregunta ${index + 1} de ${screening.questions.length}`}
            >
              <div
                className="h-full rounded-full bg-forest-600 transition-all duration-300"
                style={{ width: `${((index + 1) / screening.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div
            key={currentQuestion.id}
            className="mt-5 animate-fade-up rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-8"
          >
            <fieldset>
              <legend className="text-[1.35rem] leading-snug text-forest-950 sm:text-[1.55rem]">
                {currentQuestion.text}
              </legend>
              {currentQuestion.hint && (
                <p className="mt-2 text-[0.76rem] leading-6 text-muted">{currentQuestion.hint}</p>
              )}

              <div className="mt-6 space-y-2.5">
                {screening.options.map((option) => {
                  const selected = currentAnswer === option.value
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-150 focus-within:ring-2 focus-within:ring-forest-300',
                        selected
                          ? 'border-forest-700 bg-forest-50 shadow-sm'
                          : 'border-forest-900/10 bg-cream-50 hover:border-forest-900/25 hover:bg-white',
                      )}
                    >
                      <input
                        type="radio"
                        name={`pregunta-${index}`}
                        value={option.value}
                        checked={selected}
                        onChange={() => selectAnswer(option.value)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                          selected ? 'border-forest-700 bg-forest-700' : 'border-forest-900/25',
                        )}
                        aria-hidden="true"
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-cream-50" />}
                      </span>
                      <span className={cn('text-[0.88rem]', selected ? 'font-semibold text-forest-950' : 'text-ink')}>
                        {option.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => (index > 0 ? setIndex(index - 1) : restart())}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Atrás
            </Button>
            <Button
              type="button"
              size="md"
              onClick={goNext}
              disabled={currentAnswer === null || currentAnswer === undefined}
            >
              {isLastQuestion ? 'Ver mi resultado' : 'Siguiente'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <p className="mt-5 text-center text-[0.7rem] leading-5 text-muted">
            Puedes cambiar tus respuestas antes de ver el resultado. Si necesitas ayuda inmediata,{' '}
            <Link to="/crisis" className="font-semibold text-clay-700 underline underline-offset-2">
              consulta las líneas de crisis
            </Link>
            .
          </p>
        </div>
      </section>
    )
  }

  /* ------------------------------- Result ------------------------------ */
  if (!result) return null

  const bandStyle = BAND_STYLES[result.band.tone]
  const sortedBands = [...screening.bands].sort((a, b) => a.min - b.min)

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-forest-200/30 blur-3xl"
        aria-hidden="true"
      />
      <div className="page-container relative py-8 lg:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/tests"
              className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Todos los tests
            </Link>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-forest-600">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Guardado en este dispositivo
                </span>
              )}
              <button
                type="button"
                onClick={shareResult}
                className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/15 bg-cream-50 px-3 py-1.5 text-[0.7rem] font-semibold text-forest-800 transition-colors hover:bg-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Compartir
                  </>
                )}
              </button>
            </div>
          </div>

          {result.crisisFlag && (
            <CrisisNotice
              className="mt-5"
              title="Busca apoyo ahora"
              message={
                screening.urgentMessage ??
                'Si tienes pensamientos de hacerte daño, busca ayuda inmediata. No tienes que enfrentar esto solo/a.'
              }
            />
          )}

          <div className="mt-5 overflow-hidden rounded-3xl border border-forest-900/10 bg-cream-50 shadow-soft">
            <div className={cn('h-1.5 w-full', bandStyle.bar)} aria-hidden="true" />
            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">
                    <span className={cn('h-1.5 w-1.5 rounded-full', bandStyle.bar)} />
                    Resultado orientativo
                  </p>
                  <h1
                    ref={resultHeadingRef}
                    tabIndex={-1}
                    className="mt-2 text-3xl leading-tight text-forest-950 outline-none sm:text-4xl"
                  >
                    Tu resultado del {screening.shortName}
                  </h1>
                  <p className="mt-1 text-[0.78rem] text-muted">
                    Test completado · {screening.timeframe}
                  </p>
                </div>
                <span className={cn('rounded-full px-3 py-1.5 text-[0.72rem] font-semibold', bandStyle.chip)}>
                  {result.band.label}
                </span>
              </div>

              <div className="mt-6 grid gap-8 sm:grid-cols-[15rem_1fr] sm:items-center">
                <ResultGauge result={result} color={bandStyle.ring} />

                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    Tus respuestas sugieren
                  </p>
                  <h2 className="mt-1 text-2xl text-forest-950">{result.band.label}</h2>
                  <p className="mt-3 text-[0.88rem] leading-7 text-muted">{result.band.summary}</p>
                  <div className={cn('mt-4 rounded-2xl p-4', bandStyle.soft)}>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">
                      Qué puede ayudarte
                    </p>
                    <p className="mt-1.5 text-[0.84rem] leading-6 text-forest-900">
                      {result.band.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <InfoBanner className="mt-4" tone="warning">
            <strong className="font-semibold">Esto no es un diagnóstico.</strong> Es una herramienta
            de tamizaje. Solo un profesional puede evaluar tu situación completa, descartar otras
            causas y proponer un plan. Si el resultado te preocupa, compártelo con un psicólogo/a o
            psiquiatra.{' '}
            <Link to="/aviso-medico" className="font-semibold underline underline-offset-2">
              Más información
            </Link>
            .
          </InfoBanner>

          <div className="mt-6 rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-6">
            <h2 className="text-xl text-forest-950">Dónde se sitúa tu resultado</h2>
            <div className="mt-4 space-y-2">
              {sortedBands.map((band) => {
                const current =
                  band.min === result.band.min && band.max === result.band.max
                return (
                  <div
                    key={band.label}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-3 py-2.5',
                      current ? 'border-forest-900/20 bg-forest-50' : 'border-transparent',
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: BAND_STYLES[band.tone].ring }}
                      aria-hidden="true"
                    />
                    <span className={cn('text-[0.8rem]', current ? 'font-semibold text-forest-950' : 'text-muted')}>
                      {band.label}
                    </span>
                    {current && (
                      <span className="ml-auto rounded-full bg-forest-900 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-cream-50">
                        Tu resultado
                      </span>
                    )}
                    <span className={cn('text-[0.72rem] text-muted', !current && 'ml-auto')}>
                      {band.min}–{band.max}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-[0.68rem] leading-5 text-muted">
              Puntuación obtenida: {result.score} de {result.maxScore}. Estos rangos son
              orientativos y pueden variar según la versión y la población.
            </p>
          </div>

          <details className="group mt-4 rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded">
              <h2 className="font-sans text-[0.9rem] font-semibold text-forest-950">Ver mis respuestas</h2>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-forest-900/10 text-forest-700 transition-transform group-open:rotate-180">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </span>
            </summary>
            <ol className="mt-4 divide-y divide-forest-900/10">
              {screening.questions.map((question, questionIndex) => {
                const value = answers[questionIndex]
                const option = screening.options.find((candidate) => candidate.value === value)
                return (
                  <li key={question.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <p className={cn('text-[0.78rem] leading-6', question.risk ? 'text-clay-700' : 'text-muted')}>
                      {questionIndex + 1}. {question.text}
                    </p>
                    <p className="shrink-0 text-[0.76rem] font-semibold text-forest-900 sm:text-right">
                      {option?.label ?? 'Sin respuesta'}
                    </p>
                  </li>
                )
              })}
            </ol>
          </details>

          <div className="mt-6 rounded-3xl border border-forest-900/10 bg-forest-900 p-5 text-cream-50 shadow-lift sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl text-cream-50">El siguiente paso puede ser una conversación.</h2>
                <p className="mt-1.5 max-w-lg text-[0.8rem] leading-6 text-cream-200/70">
                  No necesitas tener un diagnóstico ni saber qué decir. Puedes compartir este
                  resultado con tu profesional para empezar desde ahí.
                </p>
              </div>
              <LinkButton to={directoryLink} variant="light" size="md" className="shrink-0">
                Hablar con un profesional
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-cream-50/10 pt-4">
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/20 px-3.5 py-2 text-[0.74rem] font-semibold text-cream-100 transition-colors hover:bg-cream-50/10"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Repetir test
              </button>
              <button
                type="button"
                onClick={shareResult}
                className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/20 px-3.5 py-2 text-[0.74rem] font-semibold text-cream-100 transition-colors hover:bg-cream-50/10"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                {copied ? 'Resumen copiado' : 'Copiar resumen'}
              </button>
              <Link
                to="/mi-progreso"
                className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/20 px-3.5 py-2 text-[0.74rem] font-semibold text-cream-100 transition-colors hover:bg-cream-50/10"
              >
                Ver mi progreso
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-[0.68rem] leading-5 text-muted">
            {screening.citation}
            {screening.citationUrl && (
              <>
                {' '}
                <a
                  href={screening.citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2"
                >
                  Fuente
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}

function ResultGauge({ result, color }: { result: ScreeningResult; color: string }) {
  const arcLength = Math.PI * 80
  const dash = (result.percent / 100) * arcLength
  const angle = Math.PI - (result.percent / 100) * Math.PI
  const dotX = 100 + 80 * Math.cos(angle)
  const dotY = 100 - 80 * Math.sin(angle)

  return (
    <div className="relative mx-auto w-full max-w-[16rem]">
      <svg
        viewBox="0 0 200 112"
        className="w-full"
        role="img"
        aria-label={`Puntuación ${result.score} de ${result.maxScore}, ${result.band.label}`}
      >
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="#e4d8c2"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${arcLength}`}
        />
        <circle cx={dotX} cy={dotY} r="5.5" fill={color} stroke="#fdfaf4" strokeWidth="2.5" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-4xl leading-none text-forest-950">
          {result.score}
          <span className="ml-0.5 font-sans text-sm font-normal text-muted">/{result.maxScore}</span>
        </p>
        <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-muted">puntuación</p>
      </div>
    </div>
  )
}
