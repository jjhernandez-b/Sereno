import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { PROFESSIONALS, SPECIALTIES, type Modality, type SpecialtyId } from '../../shared/professionals'
import { cn } from '../lib/format'
import { Button } from './Button'

type FocusChoice = SpecialtyId | 'no-se'
type ModalityChoice = 'video' | 'chat' | 'indiferente'
type BudgetChoice = 'hasta-40' | '40-70' | 'sin-limite'

const FOCUS_OPTIONS: Array<{ id: FocusChoice; label: string; description: string }> = [
  ...SPECIALTIES.filter((specialty) =>
    ['ansiedad', 'depresion', 'estres', 'duelo', 'pareja', 'autoestima', 'trauma', 'adolescentes'].includes(
      specialty.id,
    ),
  ).map((specialty) => ({
    id: specialty.id,
    label: specialty.label,
    description: specialty.blurb,
  })),
  {
    id: 'no-se',
    label: 'No estoy seguro/a',
    description: 'Cuéntame tus opciones y lo vemos juntos.',
  },
]

const MODALITY_OPTIONS: Array<{ id: ModalityChoice; label: string; description: string }> = [
  { id: 'video', label: 'Videollamada', description: 'Para conversar cara a cara.' },
  { id: 'chat', label: 'Mensajería', description: 'Si prefieres escribir con calma.' },
  { id: 'indiferente', label: 'Me da igual', description: 'Quiero ver todas las opciones.' },
]

const BUDGET_OPTIONS: Array<{ id: BudgetChoice; label: string; description: string; max: number | null }> = [
  { id: 'hasta-40', label: 'Hasta US$40', description: 'Opciones accesibles.', max: 40 },
  { id: '40-70', label: 'US$40 a US$70', description: 'Rango habitual por sesión.', max: 70 },
  { id: 'sin-limite', label: 'Sin límite', description: 'Muéstrame todo.', max: null },
]

const STEP_TITLES = ['¿Qué te gustaría trabajar?', '¿Cómo prefieres conversar?', '¿Qué presupuesto tienes?']
const STEP_HINTS = [
  'Elige lo que más se acerque. No necesitas tenerlo claro del todo.',
  'Puedes cambiar de modalidad más adelante con tu profesional.',
  'Los precios son orientativos por sesión de 50 minutos.',
]

export function MatchQuiz() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [focus, setFocus] = useState<FocusChoice | null>(null)
  const [modality, setModality] = useState<ModalityChoice | null>(null)
  const [budget, setBudget] = useState<BudgetChoice | null>(null)

  const maxPrice = BUDGET_OPTIONS.find((option) => option.id === budget)?.max ?? null

  const matches = PROFESSIONALS.filter((professional) => {
    const focusMatches = focus === 'no-se' || focus === null || professional.specialties.includes(focus)
    const modalityMatches =
      modality === 'indiferente' ||
      modality === null ||
      professional.modalities.includes(modality as Modality)
    const priceMatches = maxPrice === null || professional.priceUsd <= maxPrice
    return focusMatches && modalityMatches && priceMatches
  })

  const currentValue = step === 0 ? focus : step === 1 ? modality : budget
  const canContinue = currentValue !== null

  function handleContinue() {
    if (step < 2) {
      setStep(step + 1)
      return
    }
    const params = new URLSearchParams()
    if (focus && focus !== 'no-se') params.set('especialidad', focus)
    if (modality && modality !== 'indiferente') params.set('modalidad', modality)
    if (maxPrice !== null) params.set('precio', String(maxPrice))
    navigate(`/profesionales?${params.toString()}`)
  }

  function reset() {
    setStep(0)
    setFocus(null)
    setModality(null)
    setBudget(null)
  }

  return (
    <div className="grain relative overflow-hidden rounded-[2rem] bg-forest-900 p-6 text-cream-50 shadow-lift sm:p-9">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-forest-500/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-clay-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-forest-200/80">
            <Sparkles className="h-4 w-4 text-gold-300" aria-hidden="true" />
            Match orientativo
          </p>
          <p className="text-[0.72rem] font-medium text-cream-200/60">Paso {step + 1} de 3</p>
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-cream-50/15" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gold-300 transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <h2 className="mt-6 text-2xl leading-tight text-cream-50 sm:text-[1.75rem]">
          {STEP_TITLES[step]}
        </h2>
        <p className="mt-2 text-[0.82rem] leading-6 text-cream-200/70">{STEP_HINTS[step]}</p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {step === 0 &&
            FOCUS_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                description={option.description}
                selected={focus === option.id}
                onSelect={() => setFocus(option.id)}
              />
            ))}
          {step === 1 &&
            MODALITY_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                description={option.description}
                selected={modality === option.id}
                onSelect={() => setModality(option.id)}
              />
            ))}
          {step === 2 &&
            BUDGET_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                description={option.description}
                selected={budget === option.id}
                onSelect={() => setBudget(option.id)}
              />
            ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.8rem] font-semibold text-cream-200/75 transition-colors hover:bg-cream-50/10 hover:text-cream-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Atrás
            </button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="light"
            size="md"
            onClick={handleContinue}
            disabled={!canContinue}
            className="disabled:bg-cream-50/20 disabled:text-cream-200/50"
          >
            {step === 2 ? 'Ver profesionales' : 'Continuar'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {step === 2 && canContinue && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream-50/12 bg-cream-50/[0.06] px-4 py-3">
            <p className="text-[0.78rem] text-cream-200/80">
              <span className="font-semibold text-cream-50">{matches.length}</span>{' '}
              {matches.length === 1 ? 'profesional encaja' : 'profesionales encajan'} con lo que
              buscas.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-cream-200/60 transition-colors hover:text-cream-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reiniciar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface OptionButtonProps {
  label: string
  description: string
  selected: boolean
  onSelect: () => void
}

function OptionButton({ label, description, selected, onSelect }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'rounded-2xl border px-4 py-3 text-left transition-all duration-200',
        selected
          ? 'border-cream-50 bg-cream-50 text-forest-950 shadow-soft'
          : 'border-cream-50/15 bg-cream-50/[0.04] text-cream-50 hover:border-cream-50/35 hover:bg-cream-50/10',
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[0.85rem] font-semibold">{label}</span>
        <span
          className={cn(
            'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
            selected ? 'border-forest-800 bg-forest-800' : 'border-cream-50/30',
          )}
          aria-hidden="true"
        >
          {selected && <span className="h-1.5 w-1.5 rounded-full bg-cream-50" />}
        </span>
      </span>
      <span
        className={cn(
          'mt-0.5 block text-[0.7rem] leading-5',
          selected ? 'text-forest-800/70' : 'text-cream-200/55',
        )}
      >
        {description}
      </span>
    </button>
  )
}
