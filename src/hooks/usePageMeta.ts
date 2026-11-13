import { useEffect } from 'react'

interface PageMeta {
  title: string
  description?: string
}

export function usePageMeta({ title, description }: PageMeta): void {
  useEffect(() => {
    document.title = `${title} · Sereno`

    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.name = 'description'
        document.head.appendChild(tag)
      }
      tag.content = description
    }
  }, [title, description])
}
