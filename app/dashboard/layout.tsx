import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Мои события',
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signin?next=/dashboard')

  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            Мои события
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-5 py-8">{children}</main>
    </div>
  )
}
