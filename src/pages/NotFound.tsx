import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, PhoneCall } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { LinkButton } from '../components/Button'
import { CrisisNotice } from '../components/CrisisNotice'

export function NotFound() {
  usePageMeta({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o ha cambiado de dirección.',
  })

  return (
    <section className="page-container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-700">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-5 justify-center">Error 404</p>
        <h1 className="mt-2 text-4xl leading-tight text-forest-950 sm:text-5xl">
          Esta página se perdió en el camino.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[0.96rem] leading-7 text-muted">
          Puede que el enlace esté mal escrito o que el contenido haya cambiado. No pasa nada:
          puedes volver al inicio o encontrar ayuda desde aquí.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <LinkButton to="/" size="lg">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </LinkButton>
          <LinkButton to="/profesionales" size="lg" variant="secondary">
            Ver profesionales
          </LinkButton>
        </div>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {[
            { label: 'Tests de tamizaje', to: '/tests' },
            { label: 'Mi progreso', to: '/mi-progreso' },
            { label: 'Cómo funciona', to: '/#como-funciona' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-2xl border border-forest-900/10 bg-cream-50 px-4 py-3 text-[0.8rem] font-medium text-forest-800 transition-colors hover:border-forest-900/25 hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 text-left">
          <CrisisNotice compact />
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-[0.74rem] text-muted">
          <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
          ¿Necesitas ayuda ahora?{' '}
          <Link to="/crisis" className="font-semibold text-clay-700 underline underline-offset-2">
            Consulta las líneas de crisis
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
