'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'

/**
 * Participant entry point: type an event code, go to /e/CODE.
 * We normalize inline (uppercase, strip everything but A–Z/0–9) because
 * lib/codes uses node:crypto and can't be imported into a client bundle.
 */
function normalize(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function JoinForm() {
  const router = useRouter()
  const [code, setCode] = useState('')

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const normalized = normalize(code)
    if (!normalized) return
    router.push(`/e/${normalized}`)
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Input
        name="code"
        value={code}
        onChange={(e) => setCode(normalize(e.target.value))}
        placeholder="Код события, например ABC123"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        aria-label="Код события"
        className="text-center font-mono text-lg tracking-widest uppercase sm:text-left"
      />
      <Button type="submit" size="lg" disabled={!normalize(code)} className="shrink-0">
        Войти
      </Button>
    </form>
  )
}
