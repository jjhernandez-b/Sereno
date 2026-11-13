import { cn } from '../lib/format'

interface LogoProps {
  inverted?: boolean
  className?: string
  markOnly?: boolean
}

export function Logo({ inverted = false, className, markOnly = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="40" height="40" rx="12" fill={inverted ? '#f8f3e9' : '#0c2b27'} />
        <path
          d="M10.5 25.4c3.7 0 5.4-2.2 7.6-6.2 2.2-3.9 4.2-5.3 7-5.3 1.9 0 3.4.6 4.4 1.8"
          stroke={inverted ? '#0c2b27' : '#f8f3e9'}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="28.6" cy="27.4" r="2.7" fill="#d96b52" />
      </svg>
      {!markOnly && (
        <span
          className={cn(
            'font-display text-[1.5rem] leading-none tracking-[-0.03em]',
            inverted ? 'text-cream-50' : 'text-forest-950',
          )}
        >
          sereno
        </span>
      )}
    </span>
  )
}
