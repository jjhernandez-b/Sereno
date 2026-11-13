import { Info } from 'lucide-react'
import { cn } from '../lib/format'

export function DemoNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border border-forest-900/10 bg-cream-50 px-4 py-3 text-[0.76rem] leading-5 text-muted',
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden="true" />
      <p>
        <span className="font-semibold text-forest-900">Perfiles de muestra:</span> los
        profesionales que ves son ficticios y sirven para demostrar el flujo. En producción se
        sustituyen por profesionales reales con licencia verificada. Los tests son herramientas de
        tamizaje, no diagnósticos.
      </p>
    </div>
  )
}
