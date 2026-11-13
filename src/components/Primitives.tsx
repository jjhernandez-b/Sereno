import type { ReactNode } from 'react'
import { cn, avatarTone, initials } from '../lib/format'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<AvatarSize, string> = {
  sm: 'h-10 w-10 text-[0.78rem]',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-xl',
  xl: 'h-28 w-28 text-3xl',
}

interface AvatarProps {
  name: string
  tone?: number
  size?: AvatarSize
  online?: boolean
  className?: string
}

export function Avatar({ name, tone = 0, size = 'md', online = false, className }: AvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-gradient-to-br font-display font-semibold tracking-wide ring-4 ring-cream-50',
          avatarTone(tone),
          SIZES[size],
        )}
      >
        {initials(name)}
      </span>
      {online && (
        <span
          className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-cream-50 bg-forest-500"
          aria-hidden="true"
        />
      )}
      <span className="sr-only">{name}</span>
    </span>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className={cn('eyebrow', light && 'text-forest-200')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', light ? 'bg-clay-300' : 'bg-clay-500')} />
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'mt-3 text-3xl leading-[1.12] sm:text-4xl lg:text-[2.7rem]',
          light ? 'text-cream-50' : 'text-forest-950',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-[0.98rem] leading-7',
            light ? 'text-cream-200/85' : 'text-muted',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-[0.72rem] font-semibold text-forest-800',
        className,
      )}
    >
      {children}
    </span>
  )
}

interface InfoBannerProps {
  children: ReactNode
  tone?: 'info' | 'warning' | 'success'
  className?: string
}

export function InfoBanner({ children, tone = 'info', className }: InfoBannerProps) {
  const styles = {
    info: 'border-forest-900/10 bg-forest-50 text-forest-900',
    warning: 'border-gold-500/30 bg-gold-100/60 text-[#6d4d0e]',
    success: 'border-forest-500/25 bg-forest-50 text-forest-900',
  }
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 text-[0.82rem] leading-6',
        styles[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}
