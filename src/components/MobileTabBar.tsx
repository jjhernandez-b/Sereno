import { NavLink } from 'react-router-dom'
import { ClipboardCheck, HeartHandshake, Home, PhoneCall } from 'lucide-react'
import { cn } from '../lib/format'

const ITEMS = [
  { label: 'Inicio', to: '/', icon: Home, end: true },
  { label: 'Terapia', to: '/profesionales', icon: HeartHandshake, end: false },
  { label: 'Tests', to: '/tests', icon: ClipboardCheck, end: false },
  { label: 'Ayuda', to: '/crisis', icon: PhoneCall, end: false },
]

export function MobileTabBar() {
  return (
    <nav
      aria-label="Accesos rápidos"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-forest-900/10 bg-cream-50/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-2 pb-2 pt-2.5 text-[0.66rem] font-medium transition-colors',
                  isActive ? 'text-forest-950' : 'text-muted hover:text-forest-800',
                  item.to === '/crisis' && !isActive && 'text-clay-700/80',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'inline-flex h-8 w-11 items-center justify-center rounded-full transition-colors',
                      isActive
                        ? item.to === '/crisis'
                          ? 'bg-clay-100 text-clay-700'
                          : 'bg-forest-100 text-forest-800'
                        : 'text-current',
                    )}
                  >
                    <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
