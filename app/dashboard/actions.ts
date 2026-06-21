'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateCode, uniqueSlug } from '@/lib/codes'
import { createEventSchema, brandingSchema, eventStatusSchema } from '@/lib/schemas'
import type { EventStatus } from '@/lib/database.types'

type ModerateAction = 'approve' | 'reject' | 'answering' | 'answered' | 'delete'

/** Map a moderation button to the resulting question status. */
const MODERATE_STATUS = {
  approve: 'approved',
  reject: 'rejected',
  answering: 'answering',
  answered: 'answered',
} as const

/**
 * Create a new draft event for the signed-in organizer, with default branding,
 * then jump to its management page.
 */
export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signin?next=/dashboard')

  const parsed = createEventSchema.safeParse({
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    moderation: formData.get('moderation') ?? undefined,
  })
  if (!parsed.success) {
    // Keep the dashboard usable; surface nothing fancy — the form is forgiving.
    redirect('/dashboard?error=invalid')
  }
  const { title, subtitle, moderation } = parsed.data

  // Generate a join code that isn't already taken. A handful of tries is plenty
  // given the alphabet size, but we cap the loop so it can never hang.
  let code = ''
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = generateCode()
    const { data: clash } = await supabase
      .from('events')
      .select('id')
      .eq('code', candidate)
      .maybeSingle()
    if (!clash) {
      code = candidate
      break
    }
  }
  if (!code) redirect('/dashboard?error=code')

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      owner_id: user.id,
      code,
      slug: uniqueSlug(title),
      title,
      subtitle: subtitle ?? null,
      status: 'draft',
      moderation,
    })
    .select('id')
    .single()

  if (error || !event) redirect('/dashboard?error=create')

  // Default branding row (color comes from the global default until customised).
  await supabase.from('branding').insert({ event_id: event.id })

  revalidatePath('/dashboard')
  redirect(`/dashboard/events/${event.id}`)
}

/** Change an event's lifecycle status (RLS enforces ownership). */
export async function setEventStatus(eventId: string, status: EventStatus) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signin?next=/dashboard')

  const parsed = eventStatusSchema.safeParse(status)
  if (!parsed.success) return

  await supabase.from('events').update({ status: parsed.data }).eq('id', eventId)

  revalidatePath(`/dashboard/events/${eventId}`)
  revalidatePath('/dashboard')
}

/**
 * Moderate a single question. `delete` removes the row; everything else is a
 * status transition. Runs as the authenticated organizer so RLS scopes writes
 * to events they own.
 */
export async function moderateQuestion(questionId: string, action: ModerateAction) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signin?next=/dashboard')

  // We need the event id to revalidate its page after the write.
  const { data: question } = await supabase
    .from('questions')
    .select('event_id')
    .eq('id', questionId)
    .maybeSingle()
  if (!question) return

  if (action === 'delete') {
    await supabase.from('questions').delete().eq('id', questionId)
  } else {
    await supabase
      .from('questions')
      .update({ status: MODERATE_STATUS[action] })
      .eq('id', questionId)
  }

  revalidatePath(`/dashboard/events/${question.event_id}`)
}

/** Save per-event branding (primary color) and optionally the event subtitle. */
export async function updateBranding(eventId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signin?next=/dashboard')

  const parsed = brandingSchema.safeParse({
    primaryColor: formData.get('primaryColor'),
    subtitle: formData.get('subtitle'),
  })
  if (!parsed.success) {
    redirect(`/dashboard/events/${eventId}/branding?error=invalid`)
  }
  const { primaryColor, subtitle } = parsed.data

  await supabase
    .from('branding')
    .upsert({ event_id: eventId, primary_color: primaryColor ?? null }, { onConflict: 'event_id' })

  // Subtitle lives on the event itself. Only touch it when a value was provided.
  if (subtitle !== undefined) {
    await supabase.from('events').update({ subtitle }).eq('id', eventId)
  }

  revalidatePath(`/dashboard/events/${eventId}/branding`)
  revalidatePath(`/dashboard/events/${eventId}`)
}
