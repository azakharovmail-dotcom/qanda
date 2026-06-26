import type { Metadata } from 'next'
import ParticipantRoom from './room'

export const dynamic = 'force-dynamic'

// Participant rooms are private/ephemeral — keep them out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const safe = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'QZ408'
  // Title is a placeholder until the event lookup is wired to the backend.
  return <ParticipantRoom code={safe} title="Q&A сессия" />
}
