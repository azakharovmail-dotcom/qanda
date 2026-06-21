import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { JoinForm } from '@/components/join-form'
import { Reveal } from '@/components/landing/reveal'
import { CountUp } from '@/components/landing/count-up'
import { FeatureBars } from '@/components/landing/feature-bars'
import { HeroDecor } from '@/components/landing/hero-decor'
import { ScrollProgress } from '@/components/landing/scroll-progress'
import { CustomCursor } from '@/components/landing/custom-cursor'
import { Marquee } from '@/components/landing/marquee'
import { DemoSandbox } from '@/components/landing/demo-sandbox'
import { siteConfig, absoluteUrl } from '@/lib/seo'

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

const stats = [
  { to: 2.4, decimals: 1, suffix: ' млн', label: 'ответов собрано за год' },
  { to: 94, decimals: 0, suffix: '%', label: 'средняя доходимость опроса' },
  { to: 32, decimals: 0, suffix: ' сек', label: 'до первого ответа' },
  { to: 10, decimals: 0, suffix: '+', label: 'типов вопросов' },
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
    <div className="landing relative overflow-x-hidden bg-ink-100">
      <JsonLd data={softwareLd} />

      {/* (1) scroll-progress */}
      <ScrollProgress />

      {/* (2) NAV (fixed, 76px). backdrop-filter is set inline because Tailwind v4 /
          Lightning CSS strips it from plain CSS rules; inline styles bypass that. */}
      <header
        className={`landing-nav ${sectionX}`}
        style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center gap-3" data-hover>
          <Link
            href="/"
            className="whitespace-nowrap text-[20px] font-semibold tracking-[-0.02em] text-ink-800"
          >
            Есть вопросы
          </Link>
        </div>
        <nav className="landing-nav-links flex items-center gap-9 text-[15px] text-ink-600">
          <a href="#features" data-hover className="hover:text-ink-800">
            Возможности
          </a>
          <a href="#demo" data-hover className="hover:text-ink-800">
            Демо
          </a>
        </nav>
        <Link href="/dashboard" data-hover>
          <button
            className="h-11 cursor-pointer appearance-none rounded-pill border-none px-6 text-[15px] font-medium text-ink-900 transition-[background,transform] active:scale-[0.97]"
            style={{ background: 'var(--brand)' }}
          >
            Создать событие
          </button>
        </Link>
      </header>

      <main>
        {/* (3) HERO (min-height 100vh) */}
        <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-[clamp(20px,5vw,64px)] pb-20 pt-[132px]">
          <HeroDecor />
          <div className="relative z-[1] mx-auto max-w-[1080px] text-center">
            <h1 className="m-0 mb-[26px] text-[clamp(40px,6.2vw,92px)] font-medium leading-[1.04] tracking-[-0.03em] text-ink-800 text-balance">
              Лучший способ сделать
              <br />
              любую встречу интерактивной
            </h1>
            <p className="mx-auto mb-9 max-w-[620px] text-[clamp(17px,2vw,21px)] leading-[1.45] text-ink-500">
              Создавайте опросы, голосования и Q&amp;A-сессии за пару минут. Делитесь ссылкой — и
              смотрите, как ответы складываются в живые графики.
            </p>

            {/* code-entry row — real join → /e/CODE */}
            <JoinForm />
          </div>
        </section>

        {/* (4) MARQUEE */}
        <Marquee />

        {/* (5) STATS — Miro dot-grid canvas + 4 count-up cards */}
        <section className={`dot-grid ${sectionX} ${sectionY}`}>
          <Reveal className="mx-auto max-w-[1180px]">
            <div className={`mb-3.5 ${kicker}`}>«ЕСТЬ ВОПРОСЫ» В ЦИФРАХ</div>
            <h2 className={`mb-14 max-w-[720px] ${h2}`}>
              Обратная связь, которой пользуются каждый день
            </h2>
            <div className="stats-grid">
              {stats.map((s) => (
                <CountUp
                  key={s.label}
                  to={s.to}
                  decimals={s.decimals}
                  suffix={s.suffix}
                  label={s.label}
                />
              ))}
            </div>
          </Reveal>
        </section>

        {/* (6) DEMO interactive sandbox (phase-2 placeholder) — owns #demo */}
        <DemoSandbox />

        {/* (7) FEATURES — accent-tint cards */}
        <section id="features" className={`bg-ink-100 ${sectionX} ${sectionY}`}>
          <div className="mx-auto max-w-[1180px]">
            <Reveal>
              <div className={`mb-3.5 ${kicker}`}>ВОЗМОЖНОСТИ</div>
              <h2 className={`mb-16 max-w-[700px] ${h2}`}>Всё, чтобы услышать каждого</h2>
            </Reveal>
            <div className="features-grid">
              <Reveal
                data-hover
                className="feature-tall flex flex-col rounded-card bg-sochi-15 p-8"
              >
                <div className="mb-4 text-[13px] tracking-[0.04em] text-sochi-text">РЕАЛТАЙМ</div>
                <h3 className="m-0 mb-3 text-[26px] font-medium tracking-[-0.02em] text-ink-800">
                  Живые результаты
                </h3>
                <p className="m-0 mb-7 text-[16px] leading-[1.5] text-ink-600">
                  Столбцы, облака слов и рейтинги обновляются на экране с каждым новым ответом.
                  Идеально для зала и онлайна.
                </p>
                <FeatureBars />
              </Reveal>

              <Reveal data-hover delay={50} className="rounded-card bg-paris-15 p-8">
                <div className="mb-4 text-[13px] tracking-[0.04em] text-paris-text">Q&amp;A</div>
                <h3 className="m-0 mb-2.5 text-[22px] font-medium tracking-[-0.02em] text-ink-800">
                  Сессии вопросов
                </h3>
                <p className="m-0 text-[15px] leading-[1.5] text-ink-600">
                  Аудитория задаёт вопросы и голосует за лучшие. Самое важное всегда наверху.
                </p>
              </Reveal>

              <Reveal data-hover delay={100} className="rounded-card bg-manila-15 p-8">
                <div className="mb-4 text-[13px] tracking-[0.04em] text-manila-text">ЛОГИКА</div>
                <h3 className="m-0 mb-2.5 text-[22px] font-medium tracking-[-0.02em] text-ink-800">
                  Ветвление
                </h3>
                <p className="m-0 text-[15px] leading-[1.5] text-ink-600">
                  Следующий вопрос зависит от ответа. Каждый проходит свой путь.
                </p>
              </Reveal>

              <Reveal data-hover delay={150} className="rounded-card bg-porto-15 p-8">
                <div className="mb-4 text-[13px] tracking-[0.04em] text-porto-text">ДОВЕРИЕ</div>
                <h3 className="m-0 mb-2.5 text-[22px] font-medium tracking-[-0.02em] text-ink-800">
                  Анонимность
                </h3>
                <p className="m-0 text-[15px] leading-[1.5] text-ink-600">
                  Честные ответы без имён и логинов. Включается одним переключателем.
                </p>
              </Reveal>

              <Reveal
                data-hover
                delay={200}
                className="flex flex-col justify-between rounded-card bg-brand p-8"
              >
                <h3 className="m-0 text-[22px] font-medium tracking-[-0.02em] text-ink-900">
                  Брендирование под вас
                </h3>
                <p className="m-0 mt-3.5 text-[15px] leading-[1.5] text-ink-900 opacity-80">
                  Логотип, цвета и свой домен. Опрос выглядит как часть вашего продукта.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* (8) QUOTE — grid-paper canvas */}
        <section id="quote" className={`grid-paper bg-ink-100 ${sectionX} ${sectionY}`}>
          <Reveal className="mx-auto max-w-[980px] text-center">
            <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center gap-1.5 rounded-full bg-brand">
              <span className="h-[7px] w-[7px] rounded-full bg-ink-900" />
              <span className="h-[7px] w-[7px] rounded-full bg-ink-900" />
              <span className="h-[7px] w-[7px] rounded-full bg-ink-900" />
            </div>
            <p className="m-0 mb-7 text-[clamp(26px,4vw,46px)] font-medium leading-[1.25] tracking-[-0.02em] text-ink-800 text-balance">
              «„Есть вопросы“ заменил нам три инструмента. Теперь обратная связь — это не опрос раз
              в год, а ежедневная привычка команды.»
            </p>
            <div className="text-[16px] text-ink-500">
              Андрей Захаров · директор по стратегии, Райффайзенбанк
            </div>
          </Reveal>
        </section>

        {/* (9) FINAL CTA — yellow block */}
        <section className="px-[clamp(20px,5vw,48px)]">
          <Reveal className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[48px] bg-brand px-[clamp(28px,6vw,80px)] py-[clamp(48px,8vw,96px)] text-center">
            <div className="pointer-events-none absolute -right-[30px] -top-10 h-[200px] w-[200px] rounded-full bg-brand-deep opacity-35" />
            <div className="relative z-[1]">
              <h2 className="m-0 mb-[22px] text-[clamp(34px,6vw,76px)] font-medium leading-[1.04] tracking-[-0.03em] text-ink-900">
                Начните слушать
                <br />
                уже сегодня
              </h2>
              <p className="mx-auto mb-9 max-w-[540px] text-[clamp(17px,2vw,21px)] text-ink-900 opacity-[0.82]">
                Первый опрос — за 30 секунд. Бесплатно, без карты и установки.
              </p>
              <Link href="/dashboard" data-hover className="inline-flex">
                <button className="h-14 cursor-pointer appearance-none rounded-pill border-none bg-ink-900 px-8 text-base font-medium text-white transition-transform active:scale-[0.97]">
                  Создать событие
                </button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* (10) FOOTER */}
      <footer className="bg-ink-100 px-[clamp(20px,5vw,64px)] pb-12 pt-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-9 h-0.5 bg-ink-800" />
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="flex items-center gap-3" data-hover>
              <Link href="/" className="text-[19px] font-semibold tracking-[-0.02em] text-ink-800">
                Есть вопросы
              </Link>
            </div>
            <div className="flex flex-wrap gap-[clamp(32px,6vw,80px)] text-[15px]">
              <div className="flex flex-col gap-3">
                <span className={kicker}>ПРОДУКТ</span>
                <a href="#features" data-hover className="text-ink-700 hover:text-ink-900">
                  Возможности
                </a>
                <a href="#demo" data-hover className="text-ink-700 hover:text-ink-900">
                  Демо
                </a>
                <Link href="/dashboard" data-hover className="text-ink-700 hover:text-ink-900">
                  Создать событие
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <span className={kicker}>КОМПАНИЯ</span>
                <Link href="/" data-hover className="text-ink-700 hover:text-ink-900">
                  О нас
                </Link>
                <Link href="/" data-hover className="text-ink-700 hover:text-ink-900">
                  Контакты
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-400">
            <span>© 2026 «Есть вопросы» · Все права защищены</span>
            <span>Powered by {siteConfig.name}</span>
          </div>
        </div>
      </footer>

      {/* (11) custom cursor (ring + dot) */}
      <CustomCursor />
    </div>
  )
}
