import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button, Card, Input, Label } from '@/components/ui'
import type { BrandingRow } from '@/lib/database.types'
import { updateBranding } from '../../../actions'
import { ColorField } from './color-field'

export const dynamic = 'force-dynamic'

export default async function BrandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, subtitle')
    .eq('id', id)
    .maybeSingle()
  if (!event) notFound()

  const { data: brandingData } = await supabase
    .from('branding')
    .select('event_id, logo_url, primary_color')
    .eq('event_id', id)
    .maybeSingle()
  const branding = brandingData as BrandingRow | null

  // Bind the event id so the form posts (formData) only.
  const save = updateBranding.bind(null, id)

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/events/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Назад к событию
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Оформление</h1>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      {error === 'invalid' ? (
        <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Проверьте поля: цвет должен быть в формате HEX (#RRGGBB).
        </p>
      ) : null}

      <Card>
        <form action={save} className="space-y-5">
          <ColorField defaultValue={branding?.primary_color ?? '#2563EB'} />

          <div className="space-y-1.5">
            <Label htmlFor="subtitle">Подзаголовок</Label>
            <Input
              id="subtitle"
              name="subtitle"
              maxLength={120}
              defaultValue={event.subtitle ?? ''}
              placeholder="Дата, спикер, тема…"
            />
            <p className="text-xs text-muted-foreground">
              Показывается под названием на странице события и на экране.
            </p>
          </div>

          <Button type="submit">Сохранить</Button>
        </form>
      </Card>

      <p className="text-sm text-muted-foreground">Загрузка логотипа — скоро.</p>
    </div>
  )
}
