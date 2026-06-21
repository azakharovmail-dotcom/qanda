'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the link stays visible
      // so the organizer can still copy it manually.
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-card border border-border bg-muted px-3 py-2 text-sm">
          {value}
        </code>
        <Button type="button" variant="secondary" size="sm" onClick={copy}>
          {copied ? 'Скопировано' : 'Копировать'}
        </Button>
      </div>
    </div>
  )
}

export function CopyLinks({ joinUrl, presentUrl }: { joinUrl: string; presentUrl: string }) {
  return (
    <div className="space-y-3">
      <CopyRow label="Ссылка для участников" value={joinUrl} />
      <CopyRow label="Ссылка для экрана (проектор)" value={presentUrl} />
    </div>
  )
}
