import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { Button, Card } from '@/components/ui'
import { absoluteUrl, siteConfig } from '@/lib/seo'
import { competitors, competitorBySlug } from '@/data/competitors'

export function generateStaticParams() {
  return competitors.map((c) => ({ competitor: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>
}): Promise<Metadata> {
  const { competitor } = await params
  const c = competitorBySlug(competitor)
  if (!c) return {}
  const title = `qanda.online как альтернатива ${c.name}`
  const description = `Бесплатная альтернатива ${c.name} для аудиторного Q&A: без лимита на участников, с премодерацией и брендированием на русском. Честное сравнение цен и возможностей.`
  const path = `/alternatives/${c.slug}`
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title: `${title} — ${siteConfig.name}`, description, url: absoluteUrl(path) },
  }
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor } = await params
  const c = competitorBySlug(competitor)
  if (!c) notFound()

  const faqs = [
    {
      q: `Чем qanda.online отличается от ${c.name}?`,
      a: `${c.ourEdge_ru} Главное отличие: ${c.weakness_ru.toLowerCase()}`,
    },
    {
      q: `qanda.online действительно бесплатен в отличие от ${c.name}?`,
      a: `Да. ${c.pricingNote_ru} В qanda.online аудиторный Q&A — вопросы, голосование, премодерация и брендирование — доступен бесплатно.`,
    },
    {
      q: `Нужно ли участникам регистрироваться, как в ${c.name}?`,
      a: 'Нет. Участники заходят по короткому коду или QR-коду без регистрации, аккаунтов и установки приложений.',
    },
    {
      q: `Можно ли перейти с ${c.name} перед мероприятием?`,
      a: `Да. Создание события занимает несколько секунд — успеете переключиться даже в день выступления. Переносить данные из ${c.name} не нужно: вопросы собираются заново во время события.`,
    },
  ]

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const rows = [
    { label: 'Цена', them: c.pricingNote_ru, us: 'Бесплатно на этапе MVP, без платёжной карты.' },
    {
      label: 'Бесплатный план',
      them: c.freeTierLimit_ru,
      us: 'Без лимита на число участников и события.',
    },
    {
      label: 'Слабое место',
      them: c.weakness_ru,
      us: 'Премодерация и брендирование входят в бесплатный план.',
    },
    {
      label: 'Регистрация участников',
      them: 'Зачастую требуется аккаунт или приложение.',
      us: 'Вход по коду или QR без регистрации.',
    },
    { label: 'Язык интерфейса', them: 'Не всегда русский.', us: 'Полностью на русском языке.' },
  ]

  return (
    <>
      <JsonLd data={faqLd} />

      <section className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          qanda.online как альтернатива {c.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Ищете бесплатную замену {c.name} для вопросов и ответов с залом? {c.ourEdge_ru} Ниже —
          честное сравнение, без маркетингового тумана.
        </p>
        <div className="mt-8">
          <Link href="/dashboard">
            <Button size="lg">Создать событие бесплатно</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 pb-16">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">
          qanda.online против {c.name}
        </h2>
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left">
                <th className="px-4 py-3 font-medium"> </th>
                <th className="px-4 py-3 font-medium">{c.name}</th>
                <th className="px-4 py-3 font-medium text-brand">qanda.online</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 font-medium">{r.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.them}</td>
                  <td className="px-4 py-3">{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Частые вопросы</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((f) => (
              <Card key={f.q}>
                <h3 className="font-medium">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/dashboard">
              <Button size="lg">Попробовать вместо {c.name}</Button>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Смотрите также подробное сравнение:{' '}
              <Link href={`/vs/qanda-vs-${c.slug}`} className="text-brand hover:underline">
                qanda.online vs {c.name}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
