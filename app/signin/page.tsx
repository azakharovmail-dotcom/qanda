import type { Metadata } from 'next'
import Link from 'next/link'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Вход',
  robots: { index: false, follow: false },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const safeNext = typeof next === 'string' && next.startsWith('/') ? next : undefined

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 px-5 py-12">
      <div className="space-y-2 text-center">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          qanda.online
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Вход для организаторов</h1>
        <p className="text-sm text-muted-foreground">
          Введите e-mail — пришлём ссылку для входа. Пароль не нужен.
        </p>
      </div>

      {error === 'auth' ? (
        <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Ссылка недействительна или устарела. Запросите новую.
        </p>
      ) : null}

      <SignInForm next={safeNext} />

      <p className="text-center text-xs text-muted-foreground">
        Участникам вход не нужен — они задают вопросы и голосуют анонимно.
      </p>
    </main>
  )
}
