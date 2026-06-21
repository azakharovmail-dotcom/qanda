import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { Button, Card } from '@/components/ui'
import { absoluteUrl, siteConfig } from '@/lib/seo'
import { useCases, findUseCase } from '@/data/use-cases'

export function generateStaticParams() {
  return useCases.map((u) => ({ case: u.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ case: string }>
}): Promise<Metadata> {
  const { case: slug } = await params
  const u = findUseCase(slug)
  if (!u) return {}
  const description = `${u.painPoint_ru} ${u.howItWorks_ru} Бесплатно и без регистрации участников на qanda.online.`
  const path = `/use-cases/${u.slug}`
  return {
    title: u.title_ru,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title: `${u.title_ru} — ${siteConfig.name}`, description, url: absoluteUrl(path) },
  }
}

export default async function UseCasePage({ params }: { params: Promise<{ case: string }> }) {
  const { case: slug } = await params
  const u = findUseCase(slug)
  if (!u) notFound()

  const faqs = [
    {
      q: 'Нужно ли участникам что-то устанавливать?',
      a: 'Нет. Участники открывают страницу события по короткому коду или QR и сразу задают вопросы — без приложений и регистрации.',
    },
    {
      q: 'Можно ли задавать вопросы анонимно?',
      a: 'Да. Имя указывать необязательно — это особенно помогает там, где участники стесняются спрашивать открыто.',
    },
    {
      q: 'Это действительно бесплатно?',
      a: 'Да, на этапе MVP qanda.online бесплатен полностью, включая премодерацию и голосование, без лимита на число участников.',
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

  return (
    <>
      <JsonLd data={faqLd} />

      <section className="mx-auto w-full max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{u.title_ru}</h1>

        <h2 className="mt-10 text-xl font-medium">Проблема</h2>
        <p className="mt-2 text-muted-foreground">{u.painPoint_ru}</p>

        <h2 className="mt-8 text-xl font-medium">Как это работает с qanda.online</h2>
        <p className="mt-2 text-muted-foreground">{u.howItWorks_ru}</p>

        <h2 className="mt-8 text-xl font-medium">Примеры вопросов от аудитории</h2>
        <ul className="mt-4 space-y-2">
          {u.sampleQuestions_ru.map((q) => (
            <li
              key={q}
              className="flex items-start gap-2 rounded-card border border-border bg-background px-4 py-3 text-sm"
            >
              <span className="text-brand">?</span>
              {q}
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link href="/dashboard">
            <Button size="lg">Создать событие бесплатно</Button>
          </Link>
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
        </div>
      </section>
    </>
  )
}
