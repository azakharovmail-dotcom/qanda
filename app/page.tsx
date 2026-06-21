import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { Button } from '@/components/ui'
import { JoinForm } from '@/components/join-form'
import { Reveal } from '@/components/landing/reveal'
import { CountUp } from '@/components/landing/count-up'
import { HeroDecor } from '@/components/landing/hero-decor'
import { siteConfig, absoluteUrl } from '@/lib/seo'
import { useCases } from '@/data/use-cases'

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline_ru}`,
  description: siteConfig.description_ru,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline_ru}`,
    description: siteConfig.description_ru,
    url: absoluteUrl('/'),
  },
}

const steps = [
  {
    n: '1',
    title: 'Создайте событие',
    body: 'Введите название — за 10 секунд получаете короткий код и QR для зала. Без настройки и без карты.',
  },
  {
    n: '2',
    title: 'Поделитесь кодом или QR',
    body: 'Участники сканируют QR или вводят код с телефона, пишут вопросы и голосуют за чужие. Регистрация не нужна.',
  },
  {
    n: '3',
    title: 'Собирайте вопросы и голоса',
    body: 'Топ вопросов по голосам — на экране в реальном времени. Вы ведёте обсуждение по тому, что важно залу.',
  },
]

const stats = [
  { to: 128, suffix: ' тыс', label: 'вопросов задано' },
  { to: 4200, suffix: '+', label: 'проведённых событий' },
  { to: 73, suffix: ' %', label: 'участников голосуют' },
  { to: 10, suffix: ' сек', label: 'до старта события' },
]

const softwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteConfig.name,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: siteConfig.description_ru,
  url: siteConfig.url,
  inLanguage: 'ru',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'RUB',
    description: 'Бесплатно, без регистрации участников',
  },
}

const sectionX = 'px-[clamp(20px,5vw,64px)]'
const sectionY = 'py-[clamp(72px,10vw,130px)]'
const kicker = 'text-[13px] tracking-[0.06em] text-ink-400'
const h2 = 'text-[clamp(32px,5vw,56px)] font-medium leading-[1.08] tracking-[-0.02em] text-ink-800'

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden bg-ink-100">
      <JsonLd data={softwareLd} />

      {/* NAV */}
      <header
        className={`sticky top-0 z-50 flex h-[76px] items-center justify-between border-b border-border bg-ink-100/80 backdrop-blur-md ${sectionX}`}
      >
        <Link href="/" className="text-[20px] font-semibold tracking-[-0.02em] text-ink-800">
          Есть вопросы
        </Link>
        <nav className="hidden items-center gap-9 text-[15px] text-ink-600 md:flex">
          <a href="#how" className="hover:text-ink-800">
            Как это работает
          </a>
          <a href="#stats" className="hover:text-ink-800">
            В цифрах
          </a>
          <Link href="/alternatives/slido" className="hover:text-ink-800">
            Сравнение
          </Link>
        </nav>
        <Link href="/dashboard">
          <Button size="md">Создать событие</Button>
        </Link>
      </header>

      <main>
        {/* HERO */}
        <section className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden px-[clamp(20px,5vw,64px)] pb-20 pt-[clamp(96px,14vw,140px)]">
          <HeroDecor />
          <div className="relative z-[1] mx-auto max-w-[1080px] text-center">
            <h1 className="m-0 text-[clamp(40px,6.2vw,92px)] font-medium leading-[1.04] tracking-[-0.03em] text-ink-800 text-balance">
              Слушайте аудиторию
              <br />в реальном времени
            </h1>
            <p className="mx-auto mt-6 max-w-[620px] text-[clamp(17px,2vw,21px)] leading-[1.45] text-ink-500">
              Соберите вопросы от зала на конференции, вебинаре или лекции. Участники голосуют за
              лучшие — вы отвечаете на то, что действительно важно аудитории.
            </p>

            <div className="mx-auto mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg">Создать событие</Button>
              </Link>
            </div>

            <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3">
              <span className="text-sm text-ink-500">Уже участник? Введите код события</span>
              <JoinForm />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className={`bg-white ${sectionX} ${sectionY}`}>
          <div className="mx-auto max-w-[1180px]">
            <Reveal>
              <div className={`mb-3.5 ${kicker}`}>КАК ЭТО РАБОТАЕТ</div>
              <h2 className={`mb-16 max-w-[640px] ${h2}`}>От вопроса до диалога — три шага</h2>
            </Reveal>
            <div className="grid gap-12 md:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <div className="mb-[22px] flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
                    {s.n}
                  </div>
                  <div className="mb-[22px] h-0.5 bg-ink-800" />
                  <h3 className="mb-3 text-2xl font-medium tracking-[-0.02em] text-ink-800">
                    {s.title}
                  </h3>
                  <p className="m-0 text-base leading-[1.5] text-ink-500">{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* STATS — Miro dot-grid canvas */}
        <section id="stats" className={`dot-grid ${sectionX} ${sectionY}`}>
          <Reveal className="mx-auto max-w-[1180px]">
            <div className={`mb-3.5 ${kicker}`}>«ЕСТЬ ВОПРОСЫ» В ЦИФРАХ</div>
            <h2 className={`mb-14 max-w-[720px] ${h2}`}>
              Обратная связь, которой пользуются каждый день
            </h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {stats.map((s) => (
                <CountUp key={s.label} to={s.to} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* QUOTE — grid-paper canvas */}
        <section className={`grid-paper bg-ink-100 ${sectionX} ${sectionY}`}>
          <Reveal className="mx-auto max-w-[980px] text-center">
            <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center gap-1.5 rounded-full bg-brand">
              <span className="h-[7px] w-[7px] rounded-full bg-ink-900" />
              <span className="h-[7px] w-[7px] rounded-full bg-ink-900" />
              <span className="h-[7px] w-[7px] rounded-full bg-ink-900" />
            </div>
            <p className="m-0 mb-7 text-[clamp(26px,4vw,46px)] font-medium leading-[1.25] tracking-[-0.02em] text-ink-800 text-balance">
              «Раньше микрофон не доходил до зала, а лучшие вопросы терялись. Теперь зрители молча
              голосуют с телефонов — и мы отвечаем именно на то, что волнует людей.»
            </p>
            <div className="text-base text-ink-500">
              Марина Котова · программный директор конференции
            </div>
          </Reveal>
        </section>

        {/* USE CASES */}
        <section className={`bg-white ${sectionX} ${sectionY}`}>
          <div className="mx-auto max-w-[1180px]">
            <Reveal>
              <div className={`mb-3.5 ${kicker}`}>ГДЕ ПРИГОДИТСЯ</div>
              <h2 className={`mb-16 max-w-[700px] ${h2}`}>Везде, где у зала много вопросов</h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((u, i) => (
                <Reveal key={u.slug} delay={(i % 3) * 60}>
                  <Link
                    href={`/use-cases/${u.slug}`}
                    className="group flex h-full flex-col rounded-card bg-ink-100 p-8 transition-transform duration-200 hover:-translate-y-1"
                  >
                    <h3 className="mb-2.5 text-[22px] font-medium tracking-[-0.02em] text-ink-800">
                      {u.title_ru}
                    </h3>
                    <p className="m-0 text-[15px] leading-[1.5] text-ink-600">{u.painPoint_ru}</p>
                    <span className="mt-5 inline-block text-[15px] font-medium text-ink-800 transition-transform duration-200 group-hover:translate-x-1">
                      Подробнее →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING TEASER — yellow CTA block */}
        <section className="px-[clamp(20px,5vw,48px)] py-[clamp(48px,8vw,96px)]">
          <Reveal className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[48px] bg-brand px-[clamp(28px,6vw,80px)] py-[clamp(48px,8vw,96px)] text-center">
            <div className="pointer-events-none absolute -right-8 -top-10 h-[200px] w-[200px] rounded-full bg-brand-deep opacity-35" />
            <div className="relative z-[1]">
              <h2 className="m-0 mb-5 text-[clamp(34px,6vw,76px)] font-medium leading-[1.04] tracking-[-0.03em] text-ink-900">
                Бесплатно навсегда
              </h2>
              <p className="mx-auto mb-9 max-w-[560px] text-[clamp(17px,2vw,21px)] leading-[1.45] text-ink-900 opacity-80">
                Без лимита на участников, без платных «премиум»-функций для базового Q&A и без
                карты. Премодерация и собственный цвет события — уже в бесплатном плане.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="!bg-ink-900 !text-white !shadow-none"
                  >
                    Создать первое событие
                  </Button>
                </Link>
                <Link href="/alternatives/slido">
                  <Button variant="ghost" size="lg" className="!text-ink-900">
                    Сравнить со Slido →
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={`bg-ink-100 px-[clamp(20px,5vw,64px)] pb-12 pt-16`}>
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 h-0.5 bg-ink-800" />
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <Link href="/" className="text-[19px] font-semibold tracking-[-0.02em] text-ink-800">
                Есть вопросы
              </Link>
              <p className="mt-2 text-[15px] text-ink-500">{siteConfig.name}</p>
            </div>
            <div className="flex flex-col gap-3 text-[15px]">
              <span className={kicker}>НАВИГАЦИЯ</span>
              <Link href="/features" className="text-ink-700 hover:text-ink-900">
                Возможности
              </Link>
              <Link href="/pricing" className="text-ink-700 hover:text-ink-900">
                Тарифы
              </Link>
              <Link href="/alternatives/slido" className="text-ink-700 hover:text-ink-900">
                Сравнение со Slido
              </Link>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-400">
            <span>© {new Date().getFullYear()} «Есть вопросы» · Все права защищены</span>
            <span>Powered by qanda.online</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
