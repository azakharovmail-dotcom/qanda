import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/e/', '/present/', '/auth', '/signin', '/api'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
