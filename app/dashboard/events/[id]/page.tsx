import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { qrDataUrl } from '@/lib/qr'
import { absoluteUrl } from '@/lib/seo'
import { timeAgo } from '@/lib/utils'
import { Badge, Button, Card } from '@/components/ui'
import type { EventStatus, QuestionRow, QuestionStatus } from '@/lib/database.types'
import { moderateQuestion, setEventStatus } from '../../actions'
import { CopyLinks } from './copy-links'

export const dynamic = 'force-dynamic'

const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  draft: 'Черновик',
  live: 'Идёт',
  closed: 'Завершено',
  archived: 'В архиве',
}

const EVENT_STATUS_CLASS: Record<EventStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  live: 'bg-green-100 text-green-700',
  closed: 'bg-zinc-200 text-zinc-700',
  archived: 'bg-zinc-100 text-zinc-500',
}

const QUESTION_STATUS_LABEL: Record<QuestionStatus, string> = {
  pending: 'На модерации',
  approved: 'Одобрено',
  answering: 'Отвечаем',
  answered: 'Отвечено',
  rejected: 'Отклонено',
}

function StatusControl({ status, eventId }: { status: EventStatus; eventId: string }) {
  // Bind the (eventId, status) args so each form posts a no-arg server action.
  const toLive = setEventStatus.bind(null, eventId, 'live')
  const toClosed = setEventStatus.bind(null, eventId, 'closed')
  const reopen = setEventStatus.bind(null, eventId, 'live')

  if (status === 'draft') {
    return (
      <form action={toLive}>
        <Button type="submit">Запустить</Button>
      </form>
    )
  }
  if (status === 'live') {
    return (
      <form action={toClosed}>
        <Button type="submit" variant="secondary">
          Завершить
        </Button>
      </form>
    )
  }
  // closed / archived
  return (
    <form action={reopen}>
      <Button type="submit" variant="secondary">
        Снова открыть
      </Button>
    </form>
  )
}

function QuestionMeta({ q }: { q: QuestionRow }) {
  return (
    <p className="text-xs text-muted-foreground">
      {q.author_name ? <span className="font-medium">{q.author_name}</span> : 'Аноним'} ·{' '}
      {timeAgo(q.created_at)} · голосов: {q.vote_count}
    </p>
  )
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  if (!event) notFound()

  const { data: questionsData } = await supabase
    .from('questions')
    .select('*')
    .eq('event_id', id)
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })
  const questions: QuestionRow[] = questionsData ?? []

  const pending = questions.filter((q) => q.status === 'pending')
  const visible = questions.filter((q) =>
    ['approved', 'answering', 'answered'].includes(q.status),
  )

  const joinUrl = absoluteUrl(`/e/${event.code}`)
  const presentUrl = absoluteUrl(`/present/${event.code}`)
  const qr = await qrDataUrl(joinUrl)

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Все события
      </Link>

      {/* Header + lifecycle control */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
            <Badge className={EVENT_STATUS_CLASS[event.status]}>
              {EVENT_STATUS_LABEL[event.status]}
            </Badge>
          </div>
          {event.subtitle ? <p className="text-muted-foreground">{event.subtitle}</p> : null}
        </div>
        <StatusControl status={event.status} eventId={event.id} />
      </div>

      {event.status === 'draft' ? (
        <p className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Событие — черновик. Участники пока не могут задавать вопросы. Нажмите «Запустить», когда
          будете готовы.
        </p>
      ) : null}

      {/* Join code, QR, links */}
      <Card className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex flex-col items-center gap-2">
          <Image
            src={qr}
            alt={`QR-код для входа на событие, код ${event.code}`}
            width={160}
            height={160}
            className="rounded-card border border-border"
            unoptimized
          />
          <p className="text-sm">
            Код: <span className="font-mono text-lg font-semibold">{event.code}</span>
          </p>
        </div>
        <CopyLinks joinUrl={joinUrl} presentUrl={presentUrl} />
      </Card>

      {/* Moderation mode note */}
      <p className="text-sm text-muted-foreground">
        {event.moderation === 'pre'
          ? 'Режим: премодерация — новые вопросы попадают в очередь и появляются на экране после одобрения.'
          : 'Режим: автопубликация — новые вопросы видны сразу. Вы можете отклонить или удалить лишнее.'}
      </p>

      {/* Moderation queue (pending) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          На модерации{pending.length ? ` (${pending.length})` : ''}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Новых вопросов нет.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((q) => {
              const approve = moderateQuestion.bind(null, q.id, 'approve')
              const reject = moderateQuestion.bind(null, q.id, 'reject')
              return (
                <li key={q.id}>
                  <Card className="space-y-3">
                    <p className="whitespace-pre-wrap break-words">{q.body}</p>
                    <QuestionMeta q={q} />
                    <div className="flex gap-2">
                      <form action={approve}>
                        <Button type="submit" size="sm">
                          Одобрить
                        </Button>
                      </form>
                      <form action={reject}>
                        <Button type="submit" variant="danger" size="sm">
                          Отклонить
                        </Button>
                      </form>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Published / approved list */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Опубликованные{visible.length ? ` (${visible.length})` : ''}
        </h2>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет опубликованных вопросов.</p>
        ) : (
          <ul className="space-y-3">
            {visible.map((q) => {
              const markAnswering = moderateQuestion.bind(null, q.id, 'answering')
              const markAnswered = moderateQuestion.bind(null, q.id, 'answered')
              const remove = moderateQuestion.bind(null, q.id, 'delete')
              return (
                <li key={q.id}>
                  <Card className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-wrap break-words">{q.body}</p>
                      <Badge>{QUESTION_STATUS_LABEL[q.status]}</Badge>
                    </div>
                    <QuestionMeta q={q} />
                    <div className="flex flex-wrap gap-2">
                      <form action={markAnswering}>
                        <Button type="submit" variant="secondary" size="sm">
                          Отвечаем сейчас
                        </Button>
                      </form>
                      <form action={markAnswered}>
                        <Button type="submit" variant="secondary" size="sm">
                          Отвечено
                        </Button>
                      </form>
                      <form action={remove}>
                        <Button type="submit" variant="ghost" size="sm">
                          Удалить
                        </Button>
                      </form>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Footer links */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href={`/dashboard/events/${event.id}/branding`}>
          <Button variant="ghost" size="sm">
            Оформление
          </Button>
        </Link>
        <a href={`/dashboard/events/${event.id}/export`}>
          <Button variant="ghost" size="sm">
            Экспорт в CSV
          </Button>
        </a>
      </div>
    </div>
  )
}
