import { Link } from 'react-router-dom'
import { ArrowUpRight, Heart, PhoneCall, ShieldCheck } from 'lucide-react'
import { Logo } from './Logo'

const PLATFORM_LINKS = [
  { label: 'Profesionales', to: '/profesionales' },
  { label: 'Tests de tamizaje', to: '/tests' },
  { label: 'Mi progreso', to: '/mi-progreso' },
  { label: 'Cómo funciona', to: '/#como-funciona' },
  { label: 'Preguntas frecuentes', to: '/#preguntas' },
]

const TRUST_LINKS = [
  { label: 'Líneas de crisis', to: '/crisis' },
  { label: 'Aviso médico', to: '/aviso-medico' },
  { label: 'Privacidad', to: '/privacidad' },
  { label: 'Términos de uso', to: '/terminos' },
]

export function SiteFooter() {
  return (
    <footer className="bg-forest-950 text-cream-200">
      <div className="page-container grid gap-12 py-14 md:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr] md:py-16">
        <div>
          <Link to="/" aria-label="Sereno, ir al inicio" className="inline-block rounded-xl">
            <Logo inverted />
          </Link>
          <p className="mt-5 max-w-xs text-[0.86rem] leading-6 text-cream-200/70">
            Terapia online con personas, no con algoritmos. Un espacio para entenderte y dar
            pasos pequeños, sostenibles y a tu ritmo.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[0.72rem] text-cream-200/60">
            <ShieldCheck className="h-4 w-4 text-forest-300" aria-hidden="true" />
            Diseñado con criterios de privacidad y seguridad
          </div>
        </div>

        <nav aria-label="Plataforma">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-200/50">
            Plataforma
          </h2>
          <ul className="mt-4 space-y-2.5">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-[0.84rem] text-cream-200/75 transition-colors hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Confianza y legal">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-200/50">
            Confianza
          </h2>
          <ul className="mt-4 space-y-2.5">
            {TRUST_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-[0.84rem] text-cream-200/75 transition-colors hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rounded-3xl border border-cream-50/12 bg-cream-50/[0.04] p-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-clay-500/20 text-clay-200">
            <PhoneCall className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg text-cream-50">¿Necesitas ayuda ahora?</h2>
          <p className="mt-2 text-[0.8rem] leading-6 text-cream-200/70">
            Sereno no atiende emergencias. Si tú o alguien está en peligro, llama a los servicios
            de emergencia de tu país.
          </p>
          <Link
            to="/crisis"
            className="mt-4 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-cream-50 underline decoration-clay-300/60 decoration-2 underline-offset-4 hover:decoration-clay-300"
          >
            Ver líneas de ayuda
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="page-container flex flex-col gap-4 py-6 text-[0.72rem] leading-6 text-cream-200/50 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-3xl">
            <strong className="font-semibold text-cream-200/75">Aviso importante:</strong> Sereno
            es un proyecto de demostración. Los perfiles de profesionales son ficticios y deben
            sustituirse por profesionales reales verificados antes de publicar. Los tests son
            herramientas de tamizaje, no diagnósticos médicos, y no sustituyen la valoración de un
            psicólogo/a o psiquiatra.
          </p>
          <p className="flex shrink-0 items-center gap-1.5">
            © {new Date().getFullYear()} Sereno. Hecho con
            <Heart className="h-3.5 w-3.5 text-clay-400" aria-hidden="true" />
            cuidado.
          </p>
        </div>
      </div>
    </footer>
  )
}
