import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { cn } from '../lib/format'

const MOODS = [
  {
    id: 'muy-bajo',
    emoji: '😔',
    label: 'Muy bajo',
    message: 'Lamento que hoy pese tanto. No tienes que sostenerlo solo/a: pedir ayuda también es un acto de cuidado.',
    low: true,
  },
  {
    id: 'bajo',
    emoji: '😕',
    label: 'Bajo',
    message: 'Está bien no estar bien. No hace falta resolver todo hoy; un paso pequeño también cuenta.',
    low: false,
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    message: 'Gracias por hacer una pausa para mirar cómo estás. A veces nombrarlo ya es un buen comienzo.',
    low: false,
  },
  {
    id: 'bien',
    emoji: '🙂',
    label: 'Bien',
    message: 'Me alegra leerte. ¿Qué te está ayudando hoy? Guardarlo te puede servir en días más difíciles.',
    low: false,
  },
  {
    id: 'muy-bien',
    emoji: '😊',
    label: 'Muy bien',
    message: 'Qué bueno. Los momentos de calma también merecen espacio y memoria.',
    low: false,
  },
] as const

export function MoodCheckIn() {
  const [selected, setSelected] = useState<(typeof MOODS)[number]['id'] | null>(null)
  const mood = MOODS.find((item) => item.id === selected)

  return (
    <div className="rounded-2xl border border-forest-900/10 bg-cream-50/90 p-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-forest-900">
          <Heart className="h-3.5 w-3.5 text-clay-500" aria-hidden="true" />
          ¿Cómo te sientes hoy?
        </p>
        <span className="text-[0.62rem] uppercase tracking-[0.12em] text-muted/70">Check-in</span>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5" role="group" aria-label="Elige cómo te sientes hoy">
        {MOODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            aria-pressed={selected === item.id}
            aria-label={item.label}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-all',
              selected === item.id
                ? 'border-forest-700 bg-forest-100 shadow-sm'
                : 'border-transparent bg-cream-100/70 hover:border-forest-900/10 hover:bg-cream-100',
            )}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-[0.58rem] font-medium text-muted">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[3.25rem]">
        {mood ? (
          <div aria-live="polite">
            <p className="text-[0.74rem] leading-5 text-muted">{mood.message}</p>
            {mood.low && (
              <Link
                to="/crisis"
                className="mt-1.5 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-clay-700 underline decoration-clay-300 underline-offset-2 hover:decoration-clay-600"
              >
                Ver líneas de ayuda
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        ) : (
          <p className="text-[0.72rem] leading-5 text-muted/70">
            Sin respuestas correctas. Solo un momento para escucharte.
          </p>
        )}
      </div>
    </div>
  )
}
