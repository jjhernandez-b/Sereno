import { ChevronDown } from 'lucide-react'

export interface FaqItem {
  question: string
  answer: string
}

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-forest-900/10 rounded-3xl border border-forest-900/10 bg-cream-50 px-5 shadow-soft sm:px-7">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded text-left">
            <h3 className="font-sans text-[0.92rem] font-semibold text-forest-950">
              {item.question}
            </h3>
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest-900/10 text-forest-700 transition-transform duration-300 group-open:rotate-180">
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </span>
          </summary>
          <p className="mt-3 max-w-3xl pr-6 text-[0.86rem] leading-7 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
