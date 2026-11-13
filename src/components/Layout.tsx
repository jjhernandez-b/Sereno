import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CrisisStrip, SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { MobileTabBar } from './MobileTabBar'

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="page-container flex min-h-[60vh] items-center justify-center py-16"
    >
      <span className="inline-flex items-center gap-2 text-[0.84rem] text-muted">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-forest-300 border-t-forest-700"
          aria-hidden="true"
        />
        Cargando…
      </span>
    </div>
  )
}

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const timer = window.setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 80)
      return () => window.clearTimeout(timer)
    }

    window.scrollTo(0, 0)
    return undefined
  }, [pathname, hash])

  return null
}

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <ScrollManager />
      <CrisisStrip />
      <SiteHeader />
      <main id="contenido" className="flex-1 pb-20 md:pb-0">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <MobileTabBar />
    </div>
  )
}
