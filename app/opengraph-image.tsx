import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/seo'

export const alt = `${siteConfig.name} — ${siteConfig.tagline_ru}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand-colored social card. Dependency-free: system fonts, inline styles only.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#2563eb',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em' }}>
          qanda.online
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
          }}
        >
          {siteConfig.tagline_ru}
        </div>
        <div style={{ display: 'flex', fontSize: 30, opacity: 0.9 }}>
          Конференции · Вебинары · Лекции · Встречи
        </div>
      </div>
    ),
    size,
  )
}
