import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { QuestionRow } from '@/lib/database.types'

/** Escape a single CSV field per RFC 4180: wrap in quotes, double inner quotes. */
function csvCell(value: string | number | null): string {
  const s = value == null ? '' : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

const COLUMNS = ['created_at', 'status', 'vote_count', 'author_name', 'body'] as const

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Confirm the event belongs to this organizer before exporting anything.
  const { data: event } = await supabase
    .from('events')
    .select('id, owner_id, code')
    .eq('id', id)
    .maybeSingle()
  if (!event || event.owner_id !== user.id) {
    return new Response('Forbidden', { status: 403 })
  }

  const { data: questionsData } = await supabase
    .from('questions')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: true })
  const questions: QuestionRow[] = questionsData ?? []

  const rows = [
    COLUMNS.join(','),
    ...questions.map((q) =>
      [
        csvCell(q.created_at),
        csvCell(q.status),
        csvCell(q.vote_count),
        csvCell(q.author_name),
        csvCell(q.body),
      ].join(','),
    ),
  ]
  // Prepend a UTF-8 BOM so Excel opens Cyrillic correctly.
  const body = '﻿' + rows.join('\r\n')

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="qanda-${event.code}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
