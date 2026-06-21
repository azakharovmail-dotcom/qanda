'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { QuestionRow, EventStatus, ModerationMode } from '@/lib/database.types'
import { Button, Textarea, Input, Card, Badge } from '@/components/ui'
import { cn, timeAgo } from '@/lib/utils'

type RoomEvent = {
  id: string
  code: string
  title: string
  subtitle: string | null
  status: EventStatus
  moderation: ModerationMode
}

type SortMode = 'top' | 'new'

const MAX_BODY = 280

/** Rows visible to participants. Pending/rejected questions are never shown. */
const VISIBLE = new Set(['approved', 'answering', 'answered'])

function sortQuestions(list: QuestionRow[], mode: SortMode): QuestionRow[] {
  const next = [...list]
  if (mode === 'new') {
    next.sort((a, b) => b.created_at.localeCompare(a.created_at))
  } else {
    next.sort(
      (a, b) => b.vote_count - a.vote_count || b.created_at.localeCompare(a.created_at),
    )
  }
  return next
}

function votedStorageKey(eventId: string): string {
  return `qanda:voted:${eventId}`
}

function readVoted(eventId: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(votedStorageKey(eventId))
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function writeVoted(eventId: string, ids: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(votedStorageKey(eventId), JSON.stringify([...ids]))
  } catch {
    // Private mode / quota — voting still works server-side, just no persistence.
  }
}

const statusLabels: Partial<Record<QuestionRow['status'], string>> = {
  answering: 'Отвечают',
  answered: 'Отвечено',
}

export default function ParticipantRoom({
  event,
  initialQuestions,
}: {
  event: RoomEvent
  initialQuestions: QuestionRow[]
}) {
  const isOpen = event.status === 'live'

  const [questions, setQuestions] = useState<QuestionRow[]>(initialQuestions)
  const [sort, setSort] = useState<SortMode>('top')
  const [voted, setVoted] = useState<Set<string>>(() => new Set())

  // Submit form state
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [website, setWebsite] = useState('') // honeypot — kept hidden from humans
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Hydrate voted-ids from localStorage after mount. Intentionally sets state in
  // an effect: reading localStorage during render/init would cause an SSR↔client
  // hydration mismatch on the vote chips.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoted(readVoted(event.id))
  }, [event.id])

  // Realtime: apply INSERT/UPDATE/DELETE to the visible list.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`event:${event.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          setQuestions((prev) => {
            const incoming = payload.new as QuestionRow | undefined
            const old = payload.old as Partial<QuestionRow> | undefined

            if (payload.eventType === 'DELETE') {
              const id = old?.id
              return id ? prev.filter((q) => q.id !== id) : prev
            }

            if (!incoming) return prev

            // A row leaving the visible set (e.g. rejected) drops out.
            if (!VISIBLE.has(incoming.status)) {
              return prev.filter((q) => q.id !== incoming.id)
            }

            const idx = prev.findIndex((q) => q.id === incoming.id)
            if (idx === -1) return [...prev, incoming]
            const next = [...prev]
            next[idx] = incoming
            return next
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [event.id])

  const sorted = useMemo(() => sortQuestions(questions, sort), [questions, sort])

  const charsLeft = MAX_BODY - body.length

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setNotice(null)
      const trimmed = body.trim()
      if (!trimmed) {
        setError('Введите вопрос')
        return
      }
      setSubmitting(true)
      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            body: trimmed,
            authorName: authorName.trim() || undefined,
            website, // honeypot
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.ok) {
          if (res.status === 429) setError('Слишком часто. Попробуйте через минуту.')
          else if (res.status === 403) setError('Событие сейчас не принимает вопросы.')
          else setError(data.error === 'Введите вопрос' ? 'Введите вопрос' : 'Не удалось отправить. Попробуйте ещё раз.')
          return
        }
        setBody('')
        setAuthorName('')
        // Auto-moderation publishes via realtime; pre-moderation needs a heads-up.
        setNotice(
          event.moderation === 'pre'
            ? 'Вопрос отправлен на модерацию'
            : 'Вопрос опубликован',
        )
      } catch {
        setError('Сеть недоступна. Проверьте подключение.')
      } finally {
        setSubmitting(false)
      }
    },
    [body, authorName, website, event.id, event.moderation],
  )

  const onVote = useCallback(
    async (questionId: string) => {
      const wasVoted = voted.has(questionId)

      // Optimistic: flip the chip and nudge the count immediately.
      setVoted((prev) => {
        const next = new Set(prev)
        if (wasVoted) next.delete(questionId)
        else next.add(questionId)
        writeVoted(event.id, next)
        return next
      })
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, vote_count: Math.max(0, q.vote_count + (wasVoted ? -1 : 1)) }
            : q,
        ),
      )

      try {
        const res = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: event.id, questionId }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.ok) {
          throw new Error('vote_failed')
        }
        // Reconcile the chip with the server's truth (realtime fixes the count).
        setVoted((prev) => {
          const next = new Set(prev)
          if (data.voted) next.add(questionId)
          else next.delete(questionId)
          writeVoted(event.id, next)
          return next
        })
      } catch {
        // Roll back the optimistic change.
        setVoted((prev) => {
          const next = new Set(prev)
          if (wasVoted) next.add(questionId)
          else next.delete(questionId)
          writeVoted(event.id, next)
          return next
        })
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? { ...q, vote_count: Math.max(0, q.vote_count + (wasVoted ? 1 : -1)) }
              : q,
          ),
        )
      }
    },
    [voted, event.id],
  )

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-24 pt-6">
      {/* Submit */}
      {isOpen ? (
        <Card className="flex flex-col gap-3">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
                placeholder="Задайте вопрос…"
                rows={3}
                maxLength={MAX_BODY}
                aria-label="Текст вопроса"
                className="resize-none"
              />
              <div
                className={cn(
                  'self-end text-xs',
                  charsLeft <= 20 ? 'text-red-600' : 'text-muted-foreground',
                )}
              >
                {charsLeft}
              </div>
            </div>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value.slice(0, 40))}
              placeholder="Ваше имя (необязательно)"
              aria-label="Ваше имя"
              maxLength={40}
            />
            {/* Honeypot: visually hidden, off-screen, not focusable for humans. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <Button type="submit" disabled={submitting || !body.trim()}>
              {submitting ? 'Отправляем…' : 'Отправить вопрос'}
            </Button>
            {notice ? (
              <p className="text-sm text-muted-foreground" role="status">
                {notice}
              </p>
            ) : null}
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </Card>
      ) : (
        <Card className="bg-muted text-center">
          <p className="text-sm font-medium text-muted-foreground">Событие завершено</p>
        </Card>
      )}

      {/* Sort toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {sorted.length} {pluralQuestions(sorted.length)}
        </span>
        <div className="flex gap-1 rounded-card bg-muted p-1">
          <SortButton active={sort === 'top'} onClick={() => setSort('top')}>
            Популярные
          </SortButton>
          <SortButton active={sort === 'new'} onClick={() => setSort('new')}>
            Новые
          </SortButton>
        </div>
      </div>

      {/* Questions */}
      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {isOpen ? 'Пока нет вопросов. Будьте первым!' : 'Вопросов не было.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((q) => {
            const hasVoted = voted.has(q.id)
            return (
              <li key={q.id}>
                <Card className="flex items-start gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => onVote(q.id)}
                    disabled={!isOpen}
                    aria-pressed={hasVoted}
                    aria-label={hasVoted ? 'Убрать голос' : 'Проголосовать'}
                    className={cn(
                      'flex min-w-12 shrink-0 flex-col items-center gap-0.5 rounded-card border px-2 py-1.5 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                      'disabled:pointer-events-none disabled:opacity-50',
                      hasVoted
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    <span aria-hidden className="text-sm leading-none">
                      ▲
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{q.vote_count}</span>
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="break-words text-[15px] leading-snug text-foreground">
                      {q.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{q.author_name?.trim() || 'Аноним'}</span>
                      <span aria-hidden>·</span>
                      <span>{timeAgo(q.created_at)}</span>
                      {statusLabels[q.status] ? (
                        <Badge
                          className={cn(
                            q.status === 'answering' && 'bg-brand text-brand-foreground',
                          )}
                        >
                          {statusLabels[q.status]}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-[calc(var(--radius)-0.25rem)] px-3 py-1 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}

/** Russian plural for «вопрос». */
function pluralQuestions(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'вопрос'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'вопроса'
  return 'вопросов'
}
