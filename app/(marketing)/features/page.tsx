import type { Metadata } from 'next'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { absoluteUrl, siteConfig } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Возможности'
  const description =
    'Премодерация, голосование за вопросы, вход по QR-коду без регистрации, обновления в реальном времени и брендирование события — всё в qanda.online бесплатно.'
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl('/features') },
    openGraph: { title: `${title} — ${siteConfig.name}`, description, url: absoluteUrl('/features') },
  }
}

const features = [
  {
    title: 'Вход без регистрации',
    body: 'Участники заходят по короткому коду или QR — без аккаунтов, паролей и установки приложений. Ничего не мешает залу задать вопрос.',
  },
  {
    title: 'Голосование за вопросы',
    body: 'Зрители поднимают вверх чужие вопросы. Самые востребованные оказываются наверху — вы отвечаете на то, что волнует большинство.',
  },
  {
    title: 'Премодерация',
    body: 'Режим премодерации показывает вопросы только после вашего одобрения. Или включите автопубликацию — выбор за вами для каждого события.',
  },
  {
    title: 'Экран для презентации',
    body: 'Отдельный режим ведущего выводит топ вопросов на проектор крупным шрифтом — удобно для зала и для стрима.',
  },
  {
    title: 'В реальном времени',
    body: 'Новые вопросы и голоса появляются мгновенно, без обновления страницы — у вас и у участников всегда актуальный список.',
  },
  {
    title: 'Брендирование',
    body: 'Задайте фирменный цвет и подпись события. Страница вопросов выглядит как часть вашего мероприятия, а не чужого сервиса.',
  },
  {
    title: 'Анонимность участников',
    body: 'Вопросы можно задавать анонимно — это снимает барьер на лекциях и общих собраниях, где не все готовы спрашивать вслух.',
  },
  {
    title: 'Защита от спама',
    body: 'Ограничение частоты отправки и скрытая ловушка для ботов держат поток вопросов чистым без капчи и лишних кликов.',
  },
]

export default function FeaturesPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Всё для живого Q&A с залом
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          qanda.online собирает вопросы от аудитории, даёт ей голосовать и помогает вам отвечать на
          самое важное. Без регистрации участников и без платы.
        </p>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title}>
              <h2 className="text-lg font-medium">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Попробуйте на событии</h2>
          <p className="max-w-xl text-muted-foreground">
            Создайте событие за несколько секунд и покажите залу QR-код уже на ближайшем выступлении.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Создать событие</Button>
          </Link>
        </div>
      </section>
    </>
  )
}
