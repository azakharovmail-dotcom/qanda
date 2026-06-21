import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPublicEventByCode, listVisibleQuestions } from '@/lib/events'
import { qrDataUrl } from '@/lib/qr'
import { absoluteUrl } from '@/lib/seo'
import ParticipantRoom from '@/components/participant-room'

export const dynamic = 'force-dynamic'

// Participant rooms are private/ephemeral — keep them out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } }

const DEFAULT_BRAND = '#2563eb'

export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const event = await getPublicEventByCode(code)
  // Unknown code or a draft event that isn't open to the public yet → 404.
  if (!event || event.status === 'draft') notFound()

  const joinUrl = absoluteUrl(`/e/${event.code}`)
  const [qr, initialQuestions] = await Promise.all([
    qrDataUrl(joinUrl),
    listVisibleQuestions(event.id),
  ])

  const brand = event.branding?.primary_color || DEFAULT_BRAND

  return (
    <div
      className="min-h-full"
      style={{ ['--brand' as string]: brand } as React.CSSProperties}
    >
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-2xl items-start gap-4 px-4 py-5">
          {event.branding?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.branding.logo_url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-card object-contain"
            />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="truncate text-xl font-semibold text-foreground">{event.title}</h1>
            {event.subtitle ? (
              <p className="text-sm text-muted-foreground">{event.subtitle}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Код: <span className="font-mono font-medium text-foreground">{event.code}</span>
            </p>
          </div>
          <Image
            src={qr}
            alt={`QR-код для входа на «${event.title}»`}
            width={64}
            height={64}
            unoptimized
            className="hidden h-16 w-16 shrink-0 rounded-card border border-border sm:block"
          />
        </div>
      </header>

      <ParticipantRoom
        event={{
          id: event.id,
          code: event.code,
          title: event.title,
          subtitle: event.subtitle,
          status: event.status,
          moderation: event.moderation,
        }}
        initialQuestions={initialQuestions}
      />
    </div>
  )
}
