import { Link } from 'react-router-dom'
import { ArrowUpRight, Globe2, MapPin } from 'lucide-react'
import type { Professional } from '../../shared/professionals'
import { formatPrice, specialtyLabel } from '../../shared/professionals'
import { Avatar } from './Primitives'
import { cn } from '../lib/format'

interface ProfessionalCardProps {
  professional: Professional
  className?: string
}

export function ProfessionalCard({ professional, className }: ProfessionalCardProps) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-3xl border border-forest-900/10 bg-cream-50 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-900/20 hover:shadow-lift sm:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Avatar name={professional.name} tone={professional.avatarTone} size="md" online />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 text-[0.68rem] font-semibold text-forest-700">
          <span className="h-1.5 w-1.5 rounded-full bg-forest-500" aria-hidden="true" />
          {professional.nextSlot}
        </span>
      </div>

      <h3 className="mt-4 font-display text-[1.35rem] leading-tight text-forest-950">
        <Link
          to={`/profesionales/${professional.slug}`}
          className="rounded after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-forest-600"
        >
          {professional.name}
        </Link>
      </h3>
      <p className="mt-1 text-[0.78rem] leading-5 text-muted">{professional.title}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {professional.specialties.slice(0, 3).map((specialty) => (
          <span
            key={specialty}
            className="rounded-full border border-forest-900/10 px-2.5 py-1 text-[0.68rem] font-medium text-forest-800"
          >
            {specialtyLabel(specialty)}
          </span>
        ))}
      </div>

      <div className="mt-4 flex-1 space-y-1.5 text-[0.75rem] text-muted">
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-forest-400" aria-hidden="true" />
          {professional.location}, {professional.country}
        </p>
        <p className="flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 text-forest-400" aria-hidden="true" />
          {professional.languages.join(' · ')} · {professional.experienceYears} años de experiencia
        </p>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-forest-900/10 pt-4">
        <p className="text-[0.72rem] text-muted">
          <span className="block text-[1.1rem] font-semibold text-forest-950">
            {formatPrice(professional.priceUsd)}
          </span>
          por sesión de 50 min
        </p>
        <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-forest-800 transition-colors group-hover:text-forest-950">
          Ver perfil
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}
