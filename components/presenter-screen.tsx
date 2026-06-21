'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PublicEvent } from '@/lib/events'
import type { QuestionRow, QuestionStatus } from '@/lib/database.types'

const VISIBLE_STATUSES: QuestionStatus[] = ['approved', 'answering', 'answered']

/** Strip the protocol/trailing slash so the projected URL stays short & readable. */
function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** Keep only presenter-visible questions, sorted top-first (votes desc, then newest). */
function normalize(rows: QuestionRow[]): QuestionRow[] {
  return rows
    .filter((q) => VISIBLE_STATUSES.includes(q.status))
    .sort(
      (a, b) =>
        b.vote_count - a.vote_count ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
}

export function PresenterScreen({
  event,
  qr,
  joinUrl,
  initialQuestions,
}: {
  event: PublicEvent
  qr: string
  joinUrl: string
  initialQuestions: QuestionRow[]
}) {
  const [questions, setQuestions] = useState<QuestionRow[]>(() => normalize(initialQuestions))

  const brandStyle = useMemo(() => {
    const color = event.branding?.primary_color
    return color ? ({ ['--brand']: color } as CSSProperties) : undefined
  }, [event.branding?.primary_color])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('event:' + event.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: 'event_id=eq.' + event.id,
        },
        (payload) => {
          setQuestions((prev) => {
            const next = new Map(prev.map((q) => [q.id, q]))
            if (payload.eventType === 'DELETE') {
              const oldId = (payload.old as Partial<QuestionRow>).id
              if (oldId) next.delete(oldId)
            } else {
              const row = payload.new as QuestionRow
              // RLS only streams visible rows; defensively drop any non-visible state.
              if (VISIBLE_STATUSES.includes(row.status)) next.set(row.id, row)
              else next.delete(row.id)
            }
            return normalize([...next.values()])
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [event.id])

  const answering = questions.find((q) => q.status === 'answering') ?? null
  const rest = questions.filter((q) => q.id !== answering?.id)
  const code = event.code.toUpperCase()

  return (
    <div
      style={brandStyle}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-8 border-b border-border px-10 py-7">
        <div className="min-w-0">
          <h1 className="truncate text-4xl font-bold tracking-tight xl:text-5xl">{event.title}</h1>
          {event.subtitle ? (
            <p className="mt-2 truncate text-xl text-muted-foreground xl:text-2xl">
              {event.subtitle}
            </p>
          ) : null}
        </div>

        {/* Persistent join / QR card */}
        <aside className="flex shrink-0 items-center gap-5 rounded-card border border-border bg-muted/60 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="QR-код для подключения"
            className="h-32 w-32 rounded-lg bg-white p-1 xl:h-40 xl:w-40"
          />
          <div className="leading-tight">
            <div className="text-base text-muted-foreground xl:text-lg">Отсканируйте, чтобы задать вопрос</div>
            <div className="mt-2 font-mono text-5xl font-bold tracking-widest text-brand xl:text-6xl">
              {code}
            </div>
            <div className="mt-1 text-lg text-muted-foreground xl:text-xl">{shortUrl(joinUrl)}</div>
          </div>
        </aside>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        {questions.length === 0 ? (
          <div className="flex h-full min-h-[50vh] flex-col items-center justify-center text-center">
            <p className="max-w-3xl text-3xl font-medium text-muted-foreground xl:text-4xl">
              Пока нет вопросов — отсканируйте QR, чтобы задать
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            {answering ? (
              <section
                aria-label="Сейчас отвечаем"
                className="rounded-card border-2 border-brand bg-brand/5 p-8"
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-1.5 text-base font-semibold text-brand-foreground xl:text-lg">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-foreground" />
                  Сейчас отвечаем
                </div>
                <div className="flex items-start gap-6">
                  <VoteBadge count={answering.vote_count} highlighted />
                  <div className="min-w-0">
                    <p className="text-4xl font-semibold leading-snug xl:text-5xl">
                      {answering.body}
                    </p>
                    {answering.author_name ? (
                      <p className="mt-3 text-xl text-muted-foreground xl:text-2xl">
                        {answering.author_name}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {rest.length > 0 ? (
              <ul className="flex flex-col gap-5">
                {rest.map((q) => (
                  <li
                    key={q.id}
                    className={
                      'flex items-start gap-6 rounded-card border border-border bg-muted/40 p-6 ' +
                      (q.status === 'answered' ? 'opacity-55' : '')
                    }
                  >
                    <VoteBadge count={q.vote_count} />
                    <div className="min-w-0">
                      <p className="text-3xl font-medium leading-snug xl:text-4xl">{q.body}</p>
                      <div className="mt-2 flex items-center gap-3 text-lg text-muted-foreground xl:text-xl">
                        {q.author_name ? <span>{q.author_name}</span> : null}
                        {q.status === 'answered' ? (
                          <span className="rounded-full bg-muted px-3 py-0.5 text-base">
                            Отвечено
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}

function VoteBadge({ count, highlighted = false }: { count: number; highlighted?: boolean }) {
  return (
    <div
      className={
        'flex shrink-0 flex-col items-center justify-center rounded-card px-5 py-3 ' +
        (highlighted
          ? 'bg-brand text-brand-foreground'
          : 'border border-border bg-background text-foreground')
      }
    >
      <span className="text-5xl font-bold leading-none xl:text-6xl">{count}</span>
      <span
        className={
          'mt-1 text-sm uppercase tracking-wide xl:text-base ' +
          (highlighted ? 'text-brand-foreground/80' : 'text-muted-foreground')
        }
      >
        голос{voteSuffix(count)}
      </span>
    </div>
  )
}

/** Russian pluralization for «голос / голоса / голосов». */
function voteSuffix(n: number): string {
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return 'ов'
  if (mod10 === 1) return ''
  if (mod10 >= 2 && mod10 <= 4) return 'а'
  return 'ов'
}
