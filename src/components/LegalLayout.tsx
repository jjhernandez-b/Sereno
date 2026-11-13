import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { LinkButton } from './Button'
import { CrisisNotice } from './CrisisNotice'

interface LegalLayoutProps {
  eyebrow: string
  title: string
  intro: string
  updatedAt: string
  children: ReactNode
}

export function LegalLayout({ eyebrow, title, intro, updatedAt, children }: LegalLayoutProps) {
  return (
    <>
      <section className="border-b border-forest-900/10 bg-cream-50/70">
        <div className="page-container py-10 lg:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-forest-800 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al inicio
          </Link>
          <p className="eyebrow mt-5">
            <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] text-forest-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-muted">{intro}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-cream-200/70 px-3 py-1.5 text-[0.7rem] font-medium text-forest-800">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Última actualización: {updatedAt}
          </p>
        </div>
      </section>

      <section className="page-container py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-12">
          <article className="prose-sereno max-w-3xl rounded-3xl border border-forest-900/10 bg-cream-50 p-6 shadow-soft sm:p-9">
            {children}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-gold-500/25 bg-gold-100/60 p-5">
              <p className="text-[0.78rem] font-semibold text-[#6d4d0e]">Documento de plantilla</p>
              <p className="mt-2 text-[0.74rem] leading-6 text-[#6d4d0e]/85">
                Este texto es un borrador de demostración y no constituye asesoramiento legal. Antes
                de publicar, haz que un abogado especializado lo revise y lo adapte a tu país,
                modelo de negocio y categoría de datos de salud.
              </p>
            </div>
            <CrisisNotice compact />
            <div className="rounded-3xl border border-forest-900/10 bg-cream-50 p-5">
              <p className="text-[0.8rem] font-semibold text-forest-950">Otros documentos</p>
              <ul className="mt-2.5 space-y-2 text-[0.76rem]">
                <li>
                  <Link
                    to="/privacidad"
                    className="font-medium text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
                  >
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terminos"
                    className="font-medium text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
                  >
                    Términos de uso
                  </Link>
                </li>
                <li>
                  <Link
                    to="/aviso-medico"
                    className="font-medium text-forest-800 underline decoration-forest-300 underline-offset-2 hover:decoration-forest-600"
                  >
                    Aviso médico
                  </Link>
                </li>
              </ul>
              <LinkButton to="/tests" size="sm" variant="secondary" className="mt-4 w-full">
                Ver tests de tamizaje
              </LinkButton>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
