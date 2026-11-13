import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../lib/format'

const PHASES = [
  { label: 'Inhala', seconds: 4, instruction: 'Entra aire por la nariz, sin forzar.', scale: 1.12 },
  { label: 'Sostén', seconds: 4, instruction: 'Mantén el aire con suavidad.', scale: 1.12 },
  { label: 'Exhala', seconds: 6, instruction: 'Suelta el aire despacio por la boca.', scale: 0.78 },
] as const

export function BreathingExercise() {
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds)
  const [cycles, setCycles] = useState(0)

  const phase = PHASES[phaseIndex]

  useEffect(() => {
    if (!running) return undefined

    const timer = window.setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft(secondsLeft - 1)
        return
      }

      const nextIndex = (phaseIndex + 1) % PHASES.length
      setPhaseIndex(nextIndex)
      setSecondsLeft(PHASES[nextIndex].seconds)
      if (nextIndex === 0) setCycles((value) => value + 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [running, secondsLeft, phaseIndex])

  function start() {
    setPhaseIndex(0)
    setSecondsLeft(PHASES[0].seconds)
    setRunning(true)
  }

  function stop() {
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setPhaseIndex(0)
    setSecondsLeft(PHASES[0].seconds)
    setCycles(0)
  }

  return (
    <div className="rounded-3xl border border-forest-900/10 bg-gradient-to-br from-forest-900 to-forest-800 p-6 text-cream-50 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-forest-200/70">
            Pausa de un minuto
          </p>
          <h2 className="mt-2 text-2xl text-cream-50">Respira conmigo</h2>
          <p className="mt-1.5 max-w-sm text-[0.8rem] leading-6 text-cream-200/70">
            Inhala 4 segundos, sostén 4 y exhala 6. Si sientes mareo, detente y vuelve a tu
            respiración natural.
          </p>
        </div>
        <span className="rounded-full border border-cream-50/15 px-3 py-1 text-[0.7rem] text-cream-200/70">
          {cycles} {cycles === 1 ? 'ciclo' : 'ciclos'}
        </span>
      </div>

      <div className="mt-7 flex flex-col items-center">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-cream-50/10"
            aria-hidden="true"
          />
          <div
            className="absolute inset-4 rounded-full bg-forest-500/15 blur-xl transition-transform ease-in-out"
            style={{
              transform: `scale(${running ? phase.scale : 0.85})`,
              transitionDuration: running && phaseIndex !== 1 ? '4000ms' : '1500ms',
            }}
            aria-hidden="true"
          />
          <div
            className={cn(
              'relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-cream-50/25 bg-cream-50/10 backdrop-blur transition-transform ease-in-out',
            )}
            style={{
              transform: `scale(${running ? phase.scale : 0.85})`,
              transitionDuration: running && phaseIndex !== 1 ? '4000ms' : '1500ms',
            }}
          >
            <span className="text-[0.68rem] uppercase tracking-[0.18em] text-cream-200/60">
              {running ? phase.label : 'Listo/a'}
            </span>
            <span className="font-display text-4xl leading-none text-cream-50" aria-live="polite">
              {running ? secondsLeft : '·'}
            </span>
          </div>
        </div>
        <p className="mt-4 h-5 text-center text-[0.78rem] text-cream-200/70" aria-live="polite">
          {running ? phase.instruction : 'Tómate el tiempo que necesites.'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {!running ? (
            <Button type="button" variant="light" size="md" onClick={start}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Empezar
            </Button>
          ) : (
            <Button type="button" variant="light" size="md" onClick={stop}>
              <Pause className="h-4 w-4" aria-hidden="true" />
              Pausar
            </Button>
          )}
          <Button
            type="button"
            variant="outlineLight"
            size="md"
            onClick={reset}
            aria-label="Reiniciar ejercicio de respiración"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  )
}
