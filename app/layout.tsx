import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/seo'

// Onest = the «Есть вопросы» brand voice (display + body). Keep the CSS var name
// --font-inter so globals.css' --font-sans mapping still resolves. Inter is the
// fallback in that mapping if the build-time Onest fetch fails.
const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline_ru}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description_ru,
  applicationName: siteConfig.name,
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: 'ru_RU',
    url: siteConfig.url,
  },
  twitter: { card: 'summary_large_image', site: siteConfig.twitter },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  )
}
