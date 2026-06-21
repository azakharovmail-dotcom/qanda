'use server'

import { createClient } from '@/lib/supabase/server'
import { signInSchema } from '@/lib/schemas'
import { absoluteUrl } from '@/lib/seo'

export type SignInState = { ok?: true; error?: string }

/**
 * Send a magic-link (OTP) e-mail. The link returns the organizer to
 * /auth/callback, optionally carrying ?next= so we can forward after login.
 */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Введите корректный e-mail' }
  }

  const nextRaw = formData.get('next')
  const next = typeof nextRaw === 'string' && nextRaw.startsWith('/') ? nextRaw : undefined
  const callback = absoluteUrl(`/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callback },
  })
  if (error) {
    return { error: 'Не удалось отправить письмо. Попробуйте ещё раз.' }
  }
  return { ok: true }
}
