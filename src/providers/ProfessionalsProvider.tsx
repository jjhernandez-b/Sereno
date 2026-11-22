import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  PROFESSIONALS,
  type Professional,
  type ProfessionalsSource,
} from '../../shared/professionals'
import { getProfessionals } from '../lib/api'

interface ProfessionalsContextValue {
  professionals: Professional[]
  source: ProfessionalsSource
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const ProfessionalsContext = createContext<ProfessionalsContextValue | null>(null)

/**
 * Carga el directorio desde la API. Mientras responde (o si falla), usa los
 * perfiles de ejemplo para que el sitio nunca se quede vacío.
 */
export function ProfessionalsProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] = useState<Professional[]>(PROFESSIONALS)
  const [source, setSource] = useState<ProfessionalsSource>('demo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getProfessionals()
      if (!mounted.current) return

      if (response.professionals.length > 0) {
        setProfessionals(response.professionals)
        setSource(response.source)
      } else {
        setProfessionals(PROFESSIONALS)
        setSource('demo')
      }
      setError(null)
    } catch {
      if (!mounted.current) return
      setProfessionals(PROFESSIONALS)
      setSource('demo')
      setError('No pudimos cargar el directorio. Mostrando los perfiles de ejemplo.')
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    void refresh()
    return () => {
      mounted.current = false
    }
  }, [refresh])

  const value = useMemo(
    () => ({ professionals, source, loading, error, refresh }),
    [professionals, source, loading, error, refresh],
  )

  return <ProfessionalsContext.Provider value={value}>{children}</ProfessionalsContext.Provider>
}

export function useProfessionals(): ProfessionalsContextValue {
  const context = useContext(ProfessionalsContext)
  if (!context) {
    throw new Error('useProfessionals debe usarse dentro de ProfessionalsProvider.')
  }
  return context
}
