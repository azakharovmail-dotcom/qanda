import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { siteConfig } from '@/lib/seo'

const navLinks = [
  { href: '/features', label: 'Возможности' },
  { href: '/pricing', label: 'Тарифы' },
  { href: '/alternatives/slido', label: 'Сравнение' },
]

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            qanda<span className="text-brand">.online</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-card px-3 py-2 hover:bg-muted">
                {l.label}
              </Link>
            ))}
            <Link href="/dashboard" className="ml-2">
              <Button size="sm">Создать событие</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-base font-semibold tracking-tight">
              qanda<span className="text-brand">.online</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{siteConfig.tagline_ru}.</p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
            <Link href="/features" className="text-muted-foreground hover:text-foreground">
              Возможности
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Тарифы
            </Link>
            <Link href="/alternatives/slido" className="text-muted-foreground hover:text-foreground">
              Альтернатива Slido
            </Link>
            <Link href="/use-cases/conferences" className="text-muted-foreground hover:text-foreground">
              Конференции
            </Link>
            <Link href="/use-cases/town-halls" className="text-muted-foreground hover:text-foreground">
              Общие собрания
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Создать событие
            </Link>
          </nav>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto w-full max-w-5xl px-4 py-5 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </footer>
    </div>
  )
}
