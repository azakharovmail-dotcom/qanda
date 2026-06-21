// Programmatic SEO dataset: /alternatives/[competitor] and /vs/[slug].
// Each entry must have UNIQUE, real content — no token-swapped boilerplate.

export interface Competitor {
  slug: string
  name: string
  pricingNote_ru: string
  freeTierLimit_ru: string
  weakness_ru: string
  ourEdge_ru: string
}

export const competitors: Competitor[] = [
  {
    slug: 'slido',
    name: 'Slido',
    pricingNote_ru: 'Платные планы от ~$12.5/мес за место, годовая оплата.',
    freeTierLimit_ru: 'Бесплатно — до 3 опросов на событие и лимит участников.',
    weakness_ru: 'Премодерация вопросов и брендинг — только на платных планах.',
    ourEdge_ru: 'В qanda.online премодерация и брендинг бесплатны, без лимита на участников.',
  },
  {
    slug: 'mentimeter',
    name: 'Mentimeter',
    pricingNote_ru: 'Бесплатно сильно ограничено, платно от ~$11.99/мес.',
    freeTierLimit_ru: 'Бесплатно — мало вопросов и слайдов на презентацию.',
    weakness_ru: 'Заточен под презентации/опросы, Q&A — вторичная функция.',
    ourEdge_ru: 'qanda.online делает одно — аудиторный Q&A — и делает это идеально.',
  },
  {
    slug: 'menti',
    name: 'Menti',
    pricingNote_ru: 'То же, что Mentimeter (короткий бренд).',
    freeTierLimit_ru: 'Ограниченный бесплатный план.',
    weakness_ru: 'Регистрация и сложный онбординг для ведущего.',
    ourEdge_ru: 'Вход для участников без регистрации, событие создаётся за 10 секунд.',
  },
  {
    slug: 'pigeonhole',
    name: 'Pigeonhole Live',
    pricingNote_ru: 'Корпоративные планы, цена по запросу.',
    freeTierLimit_ru: 'Бесплатный план с ограничениями по участникам.',
    weakness_ru: 'Дорого и избыточно для небольших мероприятий.',
    ourEdge_ru: 'qanda.online бесплатен и не требует переговоров о цене.',
  },
  {
    slug: 'vevox',
    name: 'Vevox',
    pricingNote_ru: 'Платные планы для команд.',
    freeTierLimit_ru: 'Ограниченный бесплатный план.',
    weakness_ru: 'Ориентирован на крупные компании, мало кириллицы.',
    ourEdge_ru: 'qanda.online полностью на русском и бесплатен.',
  },
  {
    slug: 'ahaslides',
    name: 'AhaSlides',
    pricingNote_ru: 'Платно от ~$7.95/мес.',
    freeTierLimit_ru: 'Бесплатно — до 50 участников.',
    weakness_ru: 'Лимит участников на бесплатном плане.',
    ourEdge_ru: 'qanda.online не ограничивает число участников.',
  },
]

export const competitorBySlug = (slug: string) => competitors.find((c) => c.slug === slug)
