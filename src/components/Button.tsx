import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'coral' | 'light' | 'outlineLight'
type Size = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98]'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-forest-900 text-cream-50 shadow-soft hover:bg-forest-800 hover:shadow-lift focus-visible:outline-forest-700',
  secondary:
    'border border-forest-900/15 bg-cream-50 text-forest-900 hover:border-forest-900/30 hover:bg-white shadow-soft focus-visible:outline-forest-700',
  ghost:
    'text-forest-800 hover:bg-forest-900/6 focus-visible:outline-forest-700',
  coral:
    'bg-clay-600 text-white shadow-soft hover:bg-clay-700 hover:shadow-lift focus-visible:outline-clay-700',
  light:
    'bg-cream-50 text-forest-950 shadow-soft hover:bg-white hover:shadow-lift focus-visible:outline-cream-50',
  outlineLight:
    'border border-cream-50/30 text-cream-50 hover:border-cream-50/60 hover:bg-cream-50/10 focus-visible:outline-cream-50',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-[0.82rem]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-[0.95rem]',
}

export function buttonStyles(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, size, className)} {...props} />
}

interface LinkButtonProps extends LinkProps {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonStyles(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}

interface ExternalButtonProps {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  ariaLabel?: string
}

export function ExternalButton({
  href,
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ariaLabel,
}: ExternalButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={buttonStyles(variant, size, className)}
    >
      {children}
    </a>
  )
}
