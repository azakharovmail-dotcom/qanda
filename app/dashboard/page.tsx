import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge, Button, Card, Input, Label } from '@/components/ui'
import type { EventRow, EventStatus } from '@/lib/database.types'
import { createEvent } from './actions'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<EventStatus, string> = {
  draft: 'Черновик',
  live: 'Идёт',
  closed: 'Завершено',
  archived: 'В архиве',
}

const STATUS_CLASS: Record<EventStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  live: 'bg-green-100 text-green-700',
  closed: 'bg-zinc-200 text-zinc-700',
  archived: 'bg-zinc-100 text-zinc-500',
}

function StatusBadge({ status }: { status: EventStatus }) {
  return <Badge className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</Badge>
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
  const events: EventRow[] = data ?? []

  return (
    <div className="space-y-8">
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Создать событие</h2>
          <p className="text-sm text-muted-foreground">
            Название можно поменять позже. Событие создаётся как черновик.
          </p>
        </div>
        <form action={createEvent} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              name="title"
              required
              minLength={2}
              maxLength={80}
              placeholder="Например: Q&A с командой продукта"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subtitle">Подзаголовок (необязательно)</Label>
            <Input id="subtitle" name="subtitle" maxLength={120} placeholder="Дата, спикер, тема…" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Модерация</legend>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="moderation" value="pre" defaultChecked className="mt-1" />
              <span>
                <span className="font-medium">Премодерация</span> — вопросы появляются на экране
                только после вашего одобрения.
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="moderation" value="auto" className="mt-1" />
              <span>
                <span className="font-medium">Автопубликация</span> — вопросы видны сразу, вы можете
                скрыть лишнее позже.
              </span>
            </label>
          </fieldset>
          <Button type="submit">Создать</Button>
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Ваши события</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет событий. Создайте первое — это займёт минуту.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="truncate font-medium hover:underline"
                      >
                        {event.title}
                      </Link>
                      <StatusBadge status={event.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Код для входа: <span className="font-mono font-medium">{event.code}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Button variant="secondary" size="sm">
                        Открыть
                      </Button>
                    </Link>
                    <Link href={`/present/${event.code}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        Экран
                      </Button>
                    </Link>
                    <Link href={`/e/${event.code}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        Для участников
                      </Button>
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
