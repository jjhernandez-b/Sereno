import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/format'

interface CrisisNoticeProps {
  className?: string
  title?: string
  message?: string
  compact?: boolean
}

export function CrisisNotice({
  className,
  title = 'Tu seguridad es primero',
  message = 'Este test es una herramienta de orientación, no un diagnóstico ni un servicio de emergencia. Si estás en peligro o tienes pensamientos de hacerte daño, busca ayuda inmediata.',
  compact = false,
}: CrisisNoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        'rounded-3xl border border-clay-600/20 bg-clay-50',
        compact ? 'p-4' : 'p-5 sm:p-6',
        className,
      )}
    >
      <div className="flex gap-3.5">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-700">
          <AlertTriangle className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-sans text-[0.9rem] font-semibold text-clay-700">{title}</h3>
          <p className="mt-1 text-[0.8rem] leading-6 text-clay-700/85">{message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/crisis"
              className="inline-flex items-center gap-1.5 rounded-full bg-clay-600 px-4 py-2 text-[0.78rem] font-semibold text-white transition-colors hover:bg-clay-700"
            >
              Ver líneas de ayuda
            </Link>
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-clay-700 underline decoration-clay-300 underline-offset-4 hover:decoration-clay-600"
            >
              Buscar línea en mi país
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
