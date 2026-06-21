'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button, Input, Label } from '@/components/ui'
import { signIn, type SignInState } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'Отправляем…' : 'Получить ссылку для входа'}
    </Button>
  )
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState<SignInState, FormData>(signIn, {})

  if (state.ok) {
    return (
      <div className="rounded-card border border-border bg-muted px-4 py-5 text-center">
        <p className="font-medium">Письмо со ссылкой отправлено</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Проверьте почту и откройте ссылку, чтобы войти. Иногда письмо попадает в «Спам».
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  )
}
