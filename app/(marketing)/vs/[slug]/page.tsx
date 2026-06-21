import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { Button, Card } from '@/components/ui'
import { absoluteUrl, siteConfig } from '@/lib/seo'
import { competitors, competitorBySlug } from '@/data/competitors'

const PREFIX = 'qanda-vs-'

export function generateStaticParams() {
  return competitors.map((c) => ({ slug: `${PREFIX}${c.slug}` }))
}

function competitorFromSlug(slug: string) {
  if (!slug.startsWith(PREFIX)) return undefined
  return competitorBySlug(slug.slice(PREFIX.length))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = competitorFromSlug(slug)
  if (!c) return {}
  const title = `qanda.online vs ${c.name}: сравнение для аудиторного Q&A`
  const description = `Подробное сравнение qanda.online и ${c.name}: цена, бесплатный план, премодерация, голосование и вход без регистрации. Что выбрать для вопросов с залом.`
  const path = `/vs/${slug}`
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title: `${title} — ${siteConfig.name}`, description, url: absoluteUrl(path) },
  }
}

export default async function VsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = competitorFromSlug(slug)
  if (!c) notFound()

  const faqs = [
    {
      q: `Что выбрать: qanda.online или ${c.name}?`,
      a: `Если нужен бесплатный аудиторный Q&A на русском без лимита участников — qanda.online. ${c.name} имеет смысл, когда вам уже нужны его специфические корпоративные функции. ${c.ourEdge_ru}`,
    },
    {
      q: `Сколько стоит ${c.name} по сравнению с qanda.online?`,
      a: `${c.pricingNote_ru} qanda.online на этапе MVP бесплатен целиком, включая премодерацию и брендирование.`,
    },
    {
      q: `Есть ли у qanda.online ограничения бесплатного плана, как у ${c.name}?`,
      a: `Нет. В отличие от ${c.name} (${c.freeTierLimit_ru.toLowerCase()}), qanda.online не ограничивает число участников и событий.`,
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

  const criteria = [
    {
      label: 'Стоимость для организатора',
      them: c.pricingNote_ru,
      us: 'Бесплатно на этапе MVP.',
    },
    { label: 'Лимиты бесплатного плана', them: c.freeTierLimit_ru, us: 'Без лимита участников и событий.' },
    {
      label: 'Где уступает',
      them: c.weakness_ru,
      us: 'Сфокусирован на одном — аудиторном Q&A.',
    },
    {
      label: 'Вход для участников',
      them: 'Часто через аккаунт или приложение.',
      us: 'По коду или QR, без регистрации.',
    },
    { label: 'Русский язык', them: 'Не везде локализован.', us: 'Интерфейс и поддержка на русском.' },
  ]

  return (
    <>
      <JsonLd data={faqLd} />

      <section className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          qanda.online vs {c.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Сравниваем два сервиса для вопросов и ответов с аудиторией по цене, лимитам и удобству для
          зала. Коротко: {c.ourEdge_ru.toLowerCase()}
        </p>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 pb-16">
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left">
                <th className="px-4 py-3 font-medium">Критерий</th>
                <th className="px-4 py-3 font-medium">{c.name}</th>
                <th className="px-4 py-3 font-medium text-brand">qanda.online</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((r) => (
                <tr key={r.label} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 font-medium">{r.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.them}</td>
                  <td className="px-4 py-3">{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Card>
            <h2 className="text-lg font-medium">Когда подойдёт {c.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Если вы уже платите за {c.name} и пользуетесь его расширенными функциями для крупных
              корпоративных мероприятий, менять инструмент посреди процесса смысла мало.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-medium">Когда выбрать qanda.online</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Если нужен быстрый, бесплатный и русскоязычный Q&A с залом без лимитов и регистрации —
              qanda.online закрывает эту задачу без лишнего.
            </p>
          </Card>
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
              <Button size="lg">Создать событие бесплатно</Button>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Подробнее:{' '}
              <Link href={`/alternatives/${c.slug}`} className="text-brand hover:underline">
                qanda.online как альтернатива {c.name}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
