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
      <body className="min-h-full bg-background font-sans text-foreground">
        {/* If JS is fully disabled, scroll-reveal blocks must not stay at opacity:0. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {/* Fail-safe: this is inline HTML (not a JS chunk), so it runs even when a
            proxy strips/breaks the bundle and React never hydrates. If the client
            reveal logic never marks __qReveal, force every .reveal block visible so
            content is NEVER stuck hidden ("only the first card shows"). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              ";(function(){try{var r=function(){if(window.__qReveal)return;var n=document.querySelectorAll('.reveal:not(.in-view)');for(var i=0;i<n.length;i++){n[i].classList.add('in-view')}};setTimeout(r,2600);window.addEventListener('load',function(){setTimeout(r,1400)})}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  )
}
