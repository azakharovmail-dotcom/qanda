import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge, Button, Card } from '@/components/ui'
import { absoluteUrl, siteConfig } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Тарифы'
  const description =
    'Сейчас qanda.online полностью бесплатен: без лимита на участников, без платёжной карты. Честно рассказываем, что платные тарифы появятся позже.'
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl('/pricing') },
    openGraph: { title: `${title} — ${siteConfig.name}`, description, url: absoluteUrl('/pricing') },
  }
}

const included = [
  'Неограниченное число участников',
  'Неограниченно событий и вопросов',
  'Голосование за вопросы',
  'Премодерация и автопубликация',
  'Режим экрана для ведущего',
  'Обновления в реальном времени',
  'Брендирование цветом и подписью',
  'QR-код и короткий код для входа',
]

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
        <Badge className="mb-5">MVP · всё бесплатно</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Простые и честные тарифы
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Пока qanda.online на этапе MVP, весь функционал доступен бесплатно. Никаких скрытых лимитов
          и платёжной карты для старта.
        </p>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 pb-12">
        <Card className="p-8">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl font-medium">Бесплатный план</h2>
              <p className="mt-1 text-sm text-muted-foreground">Для любых мероприятий</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-semibold">0 ₽</span>
              <span className="block text-sm text-muted-foreground">навсегда для MVP</span>
            </div>
          </div>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-brand">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Создать событие
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 pb-16">
        <Card className="border-dashed bg-muted/40">
          <h2 className="text-lg font-medium">Что будет дальше</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Будем честны: платные тарифы появятся позже. Они затронут расширенные сценарии — командный
            доступ, аналитику и интеграции для крупных организаторов. Базовый аудиторный Q&A —
            создание событий, вопросы, голосование и премодерация — мы планируем оставить бесплатным.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Точные цены и состав платных планов мы объявим заранее. Никаких неожиданных списаний у
            тех, кто уже пользуется сервисом, не будет.
          </p>
        </Card>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Готовы попробовать?</h2>
          <p className="max-w-xl text-muted-foreground">
            Создайте первое событие бесплатно прямо сейчас — карта и подтверждение почты не нужны для
            старта.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Создать событие</Button>
          </Link>
        </div>
      </section>
    </>
  )
}
