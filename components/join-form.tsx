'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hero code-entry form — a real participant join restyled 1:1 to the prototype:
 * a centered digits-only pill input («Код с экрана», 4–6 chars) + a yellow
 * «Войти» pill button, with a caption line below. On a valid code it navigates
 * to /e/<CODE> (the live participant room). Look matches the prototype exactly;
 * behaviour is a real route push, not the prototype's fake "connecting" sim.
 */
const DEFAULT_HINT = 'Быстрый вход на мероприятие'

export function JoinForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = code.trim()
    if (value.length < 4) {
      setError(true)
      return
    }
    router.push(`/e/${value}`)
  }

  return (
    <form data-hover onSubmit={onSubmit} className="mx-auto mb-4 max-w-[420px]" noValidate>
      <div className="flex items-stretch gap-2.5">
        <input
          name="code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            if (error) setError(false)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          placeholder="Код с экрана"
          aria-label="Код мероприятия"
          className="h-[52px] min-w-0 flex-1 appearance-none rounded-pill px-[22px] text-center text-[19px] font-semibold tracking-[0.06em] text-ink-800 outline-none"
          style={{
            border: `1.5px solid ${
              error ? 'var(--live)' : focused ? 'var(--ink-800)' : 'var(--ink-200)'
            }`,
            background: 'rgba(255,255,255,0.55)',
            transition: 'border-color .2s var(--ease-standard)',
          }}
        />
        <button
          type="submit"
          className="h-[52px] flex-none cursor-pointer appearance-none rounded-pill border-none px-7 text-[16px] font-semibold text-ink-900 transition-[background,transform] active:scale-[0.97]"
          style={{ background: 'var(--brand)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-deep)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--brand)')}
        >
          Войти
        </button>
      </div>
      <div
        className="mt-[9px] min-h-[16px] text-[13px]"
        style={{ color: error ? 'var(--live)' : 'var(--ink-400)' }}
      >
        {error ? 'Введите код из 4–6 цифр' : DEFAULT_HINT}
      </div>
    </form>
  )
}
