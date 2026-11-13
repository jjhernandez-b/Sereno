import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, NotebookPen, PhoneCall, X } from 'lucide-react'
import { Logo } from './Logo'
import { LinkButton } from './Button'
import { cn } from '../lib/format'

const NAV_ITEMS = [
  { label: 'Profesionales', to: '/profesionales' },
  { label: 'Tests', to: '/tests' },
  { label: 'Cómo funciona', to: '/#como-funciona' },
  { label: 'Preguntas', to: '/#preguntas' },
]

export function CrisisStrip() {
  return (
    <div className="bg-forest-950 text-cream-100">
      <div className="page-container flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-[0.72rem] sm:text-xs">
        <span className="font-medium text-cream-100/80">
          Si estás en crisis o en peligro, no estás solo/a.
        </span>
        <Link
          to="/crisis"
          className="inline-flex items-center gap-1.5 font-semibold text-cream-50 underline decoration-clay-300/70 decoration-2 underline-offset-4 hover:decoration-clay-300"
        >
          <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
          Ver líneas de ayuda
        </Link>
      </div>
    </div>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-cream-100/90 backdrop-blur-xl">
      <div className="page-container flex h-[4.35rem] items-center justify-between gap-4">
        <Link to="/" aria-label="Sereno, ir al inicio" className="rounded-xl">
          <Logo />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3.5 py-2 text-[0.82rem] font-medium text-forest-900/75 transition-colors hover:bg-forest-900/5 hover:text-forest-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/mi-progreso"
            className={({ isActive }) =>
              cn(
                'hidden items-center gap-1.5 rounded-full px-3 py-2 text-[0.8rem] font-medium text-forest-900/75 transition-colors hover:bg-forest-900/5 hover:text-forest-950 lg:inline-flex',
                isActive && 'bg-forest-900/5 text-forest-950',
              )
            }
          >
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            Mi progreso
          </NavLink>
          <LinkButton to="/profesionales" size="sm" className="hidden sm:inline-flex">
            Encontrar profesional
          </LinkButton>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest-900/15 bg-cream-50 text-forest-900 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-movil" className="border-t border-forest-900/10 bg-cream-50 md:hidden">
          <nav aria-label="Navegación móvil" className="page-container flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-xl px-3 py-3 text-[0.95rem] font-medium text-forest-900 hover:bg-forest-900/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/mi-progreso"
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-[0.95rem] font-medium text-forest-900 hover:bg-forest-900/5"
            >
              <NotebookPen className="h-4 w-4" aria-hidden="true" />
              Mi progreso
            </Link>
            <Link
              to="/crisis"
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-[0.95rem] font-semibold text-clay-700 hover:bg-clay-50"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              Necesito ayuda ahora
            </Link>
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-forest-900/10 pt-4">
              <LinkButton to="/profesionales" size="md">
                Encontrar un profesional
              </LinkButton>
              <LinkButton to="/tests" size="md" variant="secondary">
                Hacer un test
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
