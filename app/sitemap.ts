import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { competitors } from '@/data/competitors'
import { useCases } from '@/data/use-cases'

// Public, indexable marketing routes only. Participant/presenter/organizer
// surfaces (/e, /present, /dashboard, /auth, /signin) are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths = ['/', '/features', '/pricing']

  const alternativePaths = competitors.map((c) => `/alternatives/${c.slug}`)
  const vsPaths = competitors.map((c) => `/vs/qanda-vs-${c.slug}`)
  const useCasePaths = useCases.map((u) => `/use-cases/${u.slug}`)

  return [...staticPaths, ...alternativePaths, ...vsPaths, ...useCasePaths].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
