import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicEventByCode, listVisibleQuestions } from '@/lib/events'
import { absoluteUrl } from '@/lib/seo'
import { qrDataUrl } from '@/lib/qr'
import { PresenterScreen } from '@/components/presenter-screen'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Экран ведущего',
  robots: { index: false, follow: false },
}

export default async function PresentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const event = await getPublicEventByCode(code)
  if (!event || event.status === 'draft') notFound()

  const joinUrl = absoluteUrl('/e/' + event.code)
  const qr = await qrDataUrl(joinUrl)
  const initialQuestions = await listVisibleQuestions(event.id)

  return (
    <PresenterScreen
      event={event}
      qr={qr}
      joinUrl={joinUrl}
      initialQuestions={initialQuestions}
    />
  )
}
