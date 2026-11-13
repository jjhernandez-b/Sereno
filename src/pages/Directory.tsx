import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Globe2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import {
  MODALITY_LABELS,
  PROFESSIONALS,
  SPECIALTIES,
  type Modality,
  type SpecialtyId,
} from '../../shared/professionals'
import { usePageMeta } from '../hooks/usePageMeta'
import { ProfessionalCard } from '../components/ProfessionalCard'
import { DemoNotice } from '../components/DemoNotice'
import { LinkButton } from '../components/Button'
import { SectionHeading } from '../components/Primitives'
import { cn } from '../lib/format'

const PRICE_OPTIONS = [
  { value: '', label: 'Cualquier presupuesto' },
  { value: '40', label: 'Hasta US$40' },
  { value: '55', label: 'Hasta US$55' },
  { value: '70', label: 'Hasta US$70' },
]

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'experiencia', label: 'Más experiencia' },
]

const MODALITIES: Modality[] = ['video', 'chat', 'telefono']
const LANGUAGES = ['Español', 'Inglés', 'Portugués']

export function Directory() {
  usePageMeta({
    title: 'Directorio de profesionales',
    description:
      'Explora psicólogos y psiquiatras por especialidad, modalidad, idioma y presupuesto. Solicita una primera conversación desde casa.',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = searchParams.get('q') ?? ''
  const specialty = searchParams.get('especialidad') ?? ''
  const modality = searchParams.get('modalidad') ?? ''
  const price = searchParams.get('precio') ?? ''
  const language = searchParams.get('idioma') ?? ''
  const sort = searchParams.get('orden') ?? 'relevancia'

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const maxPrice = price ? Number(price) : null

    const results = PROFESSIONALS.filter((professional) => {
      const matchesSpecialty =
        !specialty || professional.specialties.includes(specialty as SpecialtyId)
      const matchesModality = !modality || professional.modalities.includes(modality as Modality)
      const matchesPrice = maxPrice === null || professional.priceUsd <= maxPrice
      const matchesLanguage =
        !language || professional.languages.some((item) => item.toLowerCase() === language.toLowerCase())
      const haystack = [
        professional.name,
        professional.title,
        professional.location,
        professional.country,
        professional.approach,
        professional.bio,
        ...professional.focusTags,
        ...professional.languages,
        ...professional.specialties.map(
          (id) => SPECIALTIES.find((item) => item.id === id)?.label ?? id,
        ),
      ]
        .join(' ')
        .toLowerCase()
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery)

      return (
        matchesSpecialty && matchesModality && matchesPrice && matchesLanguage && matchesQuery
      )
    })

    return results.sort((a, b) => {
      if (sort === 'precio-asc') return a.priceUsd - b.priceUsd
      if (sort === 'precio-desc') return b.priceUsd - a.priceUsd
      if (sort === 'experiencia') return b.experienceYears - a.experienceYears
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.experienceYears - a.experienceYears
    })
  }, [query, specialty, modality, price, language, sort])

  const activeFilters = [
    specialty && {
      key: 'especialidad',
      label: SPECIALTIES.find((item) => item.id === specialty)?.label ?? specialty,
    },
    modality && {
      key: 'modalidad',
      label: MODALITY_LABELS[modality as Modality] ?? modality,
    },
    price && { key: 'precio', label: PRICE_OPTIONS.find((option) => option.value === price)?.label ?? '' },
    language && { key: 'idioma', label: language },
    query && { key: 'q', label: `“${query}”` },
  ].filter(Boolean) as Array<{ key: string; label: string }>

  const filterCount = activeFilters.length
  const selectedSpecialty = SPECIALTIES.find((item) => item.id === specialty)

  return (
    <>
      <section className="relative overflow-hidden border-b border-forest-900/10 bg-cream-50/70">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-forest-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="page-container relative py-12 lg:py-16">
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
            Directorio
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl leading-[1.05] text-forest-950 sm:text-5xl">
                Encuentra a la persona <em className="font-normal italic text-clay-600">adecuada</em>{' '}
                para ti.
              </h1>
              <p className="mt-4 text-[0.98rem] leading-7 text-muted">
                Psicólogos y psiquiatras con enfoques distintos, porque no todas las personas
                necesitan lo mismo. Filtra con calma y solicita una primera conversación cuando
                estés listo/a.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[0.72rem]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/10 bg-cream-50 px-3 py-1.5 font-medium text-forest-800">
                <Users className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                {PROFESSIONALS.length} perfiles de muestra
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/10 bg-cream-50 px-3 py-1.5 font-medium text-forest-800">
                <Globe2 className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
                Online en varios países
              </span>
            </div>
          </div>

          <DemoNotice className="mt-6 max-w-3xl" />
        </div>
      </section>

      <section className="page-container py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-8">
          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <FilterPanel
              specialty={specialty}
              modality={modality}
              price={price}
              language={language}
              onChange={updateFilter}
              onClear={clearFilters}
            />
          </aside>

          <div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <label htmlFor="buscar-profesional" className="sr-only">
                  Buscar profesional
                </label>
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500"
                    aria-hidden="true"
                  />
                  <input
                    id="buscar-profesional"
                    type="search"
                    value={query}
                    onChange={(event) => updateFilter('q', event.target.value)}
                    placeholder="Buscar por nombre, enfoque o especialidad…"
                    className="h-12 w-full rounded-full border border-forest-900/15 bg-cream-50 pl-11 pr-4 text-[0.86rem] text-ink shadow-soft placeholder:text-muted/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen((value) => !value)}
                  aria-expanded={filtersOpen}
                  aria-controls="filtros-movil"
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-forest-900/15 bg-cream-50 px-4 text-[0.82rem] font-semibold text-forest-900 shadow-soft lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Filtros
                  {filterCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-forest-900 px-1 text-[0.65rem] text-cream-50">
                      {filterCount}
                    </span>
                  )}
                </button>
              </div>

              {filtersOpen && (
                <div id="filtros-movil" className="lg:hidden">
                  <FilterPanel
                    specialty={specialty}
                    modality={modality}
                    price={price}
                    language={language}
                    onChange={updateFilter}
                    onClear={clearFilters}
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.82rem] text-muted">
                  <span className="font-semibold text-forest-950">{filtered.length}</span>{' '}
                  {filtered.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}
                  {selectedSpecialty && (
                    <span className="text-muted"> · {selectedSpecialty.label}</span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="ordenar" className="text-[0.75rem] font-medium text-muted">
                    Ordenar por
                  </label>
                  <select
                    id="ordenar"
                    value={sort}
                    onChange={(event) => updateFilter('orden', event.target.value)}
                    className="h-9 rounded-full border border-forest-900/15 bg-cream-50 px-3 text-[0.76rem] text-forest-900 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => updateFilter(filter.key, '')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1.5 text-[0.72rem] font-medium text-forest-800 transition-colors hover:bg-forest-200"
                    >
                      {filter.label}
                      <X className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">Quitar filtro</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[0.72rem] font-semibold text-clay-700 underline underline-offset-2 hover:text-clay-600"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filtered.map((professional) => (
                <ProfessionalCard key={professional.slug} professional={professional} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-3xl border border-dashed border-forest-900/20 bg-cream-50 px-6 py-14 text-center">
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-2xl text-forest-950">No encontramos coincidencias</h2>
                <p className="mx-auto mt-2 max-w-sm text-[0.86rem] leading-6 text-muted">
                  Prueba con menos filtros, otra especialidad o un presupuesto más amplio. También
                  puedes solicitar orientación y te ayudamos a elegir.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-2.5 text-[0.82rem] font-semibold text-cream-50 transition-colors hover:bg-forest-800"
                >
                  Limpiar filtros
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="mt-10 rounded-3xl border border-forest-900/10 bg-gradient-to-br from-clay-50 to-cream-100 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
              <div>
                <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-clay-700">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  ¿No sabes a quién elegir?
                </p>
                <h2 className="mt-2 text-2xl text-forest-950">
                  Un test puede ayudarte a ordenar lo que sientes.
                </h2>
                <p className="mt-2 max-w-lg text-[0.84rem] leading-6 text-muted">
                  Son tres minutos y no es un diagnóstico. Te dan un punto de partida para
                  conversar con tu profesional.
                </p>
              </div>
              <LinkButton to="/tests" variant="coral" size="md" className="mt-4 shrink-0 sm:mt-0">
                Ver tests
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-forest-900/10 bg-cream-50/60">
        <div className="page-container py-10">
          <SectionHeading
            eyebrow="¿Buscas algo concreto?"
            title="Explora por especialidad."
            className="max-w-xl"
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {SPECIALTIES.map((item) => (
              <Link
                key={item.id}
                to={`/profesionales?especialidad=${item.id}`}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-[0.75rem] font-medium transition-colors',
                  specialty === item.id
                    ? 'border-forest-900 bg-forest-900 text-cream-50'
                    : 'border-forest-900/10 bg-cream-50 text-forest-800 hover:border-forest-900/25 hover:bg-white',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="mt-5 inline-flex items-center gap-1.5 text-[0.72rem] text-muted">
            <Check className="h-3.5 w-3.5 text-forest-500" aria-hidden="true" />
            Los perfiles incluyen licencia, formación y enfoque. En producción, la verificación es
            obligatoria antes de publicar.
          </p>
        </div>
      </section>
    </>
  )
}

interface FilterPanelProps {
  specialty: string
  modality: string
  price: string
  language: string
  onChange: (key: string, value: string) => void
  onClear: () => void
}

function FilterPanel({ specialty, modality, price, language, onChange, onClear }: FilterPanelProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-sans text-[0.88rem] font-semibold text-forest-950">
          <SlidersHorizontal className="h-4 w-4 text-forest-600" aria-hidden="true" />
          Filtros
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[0.7rem] font-semibold text-muted underline decoration-forest-300 underline-offset-2 hover:text-forest-800"
        >
          Limpiar
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="filtro-especialidad" className="mb-1.5 block text-[0.72rem] font-semibold text-forest-900">
            Especialidad
          </label>
          <select
            id="filtro-especialidad"
            value={specialty}
            onChange={(event) => onChange('especialidad', event.target.value)}
            className="h-10 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 text-[0.8rem] text-forest-900 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
          >
            <option value="">Todas</option>
            {SPECIALTIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-modalidad" className="mb-1.5 block text-[0.72rem] font-semibold text-forest-900">
            Modalidad
          </label>
          <select
            id="filtro-modalidad"
            value={modality}
            onChange={(event) => onChange('modalidad', event.target.value)}
            className="h-10 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 text-[0.8rem] text-forest-900 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
          >
            <option value="">Todas</option>
            {MODALITIES.map((item) => (
              <option key={item} value={item}>
                {MODALITY_LABELS[item]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-precio" className="mb-1.5 block text-[0.72rem] font-semibold text-forest-900">
            Presupuesto por sesión
          </label>
          <select
            id="filtro-precio"
            value={price}
            onChange={(event) => onChange('precio', event.target.value)}
            className="h-10 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 text-[0.8rem] text-forest-900 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-idioma" className="mb-1.5 block text-[0.72rem] font-semibold text-forest-900">
            Idioma
          </label>
          <select
            id="filtro-idioma"
            value={language}
            onChange={(event) => onChange('idioma', event.target.value)}
            className="h-10 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-3 text-[0.8rem] text-forest-900 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-300"
          >
            <option value="">Cualquiera</option>
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-5 border-t border-forest-900/10 pt-4 text-[0.68rem] leading-5 text-muted">
        Los precios son orientativos, en USD y por sesión de 50 minutos (datos de muestra).
      </p>
    </div>
  )
}
