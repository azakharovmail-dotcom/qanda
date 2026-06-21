'use client'

import { useState } from 'react'
import { Input, Label } from '@/components/ui'

const HEX = /^#[0-9a-fA-F]{6}$/

/** HEX color input with a live swatch + native color picker, kept in sync. */
export function ColorField({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)
  const valid = HEX.test(value)

  return (
    <div className="space-y-1.5">
      <Label htmlFor="primaryColor">Основной цвет (HEX)</Label>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-11 w-11 shrink-0 rounded-card border border-border"
          style={{ background: valid ? value : 'transparent' }}
        />
        <Input
          id="primaryColor"
          name="primaryColor"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#2563EB"
          className="font-mono"
          maxLength={7}
        />
        <input
          type="color"
          aria-label="Выбрать цвет"
          value={valid ? value : '#2563eb'}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-card border border-border bg-background"
        />
      </div>
      {!valid && value !== '' ? (
        <p className="text-sm text-red-600">Нужен HEX-цвет, например #2563EB</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Этим цветом окрашиваются кнопки и акценты на странице события.
        </p>
      )}
    </div>
  )
}
