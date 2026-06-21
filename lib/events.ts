import { createClient } from '@/lib/supabase/server'
import { normalizeCode } from '@/lib/codes'
import type { EventRow, QuestionRow, BrandingRow } from '@/lib/database.types'

export type PublicEvent = EventRow & { branding: BrandingRow | null }

/** Resolve a join code to its event + branding. Returns null for unknown/draft. */
export async function getPublicEventByCode(code: string): Promise<PublicEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('*, branding(event_id, logo_url, primary_color)' as any)
    .eq('code', normalizeCode(code))
    .maybeSingle()
  if (error || !data) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any
  const branding: BrandingRow | null = Array.isArray(raw.branding)
    ? (raw.branding[0] ?? null)
    : (raw.branding ?? null)
  return { ...raw, branding } as PublicEvent
}

/** Questions a participant/presenter may see, sorted top-first. */
export async function listVisibleQuestions(eventId: string): Promise<QuestionRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('event_id', eventId)
    .in('status', ['approved', 'answering', 'answered'])
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
}
