import { env } from '@/lib/env'

export const siteConfig = {
  name: 'qanda.online',
  shortName: 'qanda',
  url: env.SITE_URL,
  defaultLocale: 'ru' as const,
  locales: ['ru', 'en'] as const,
  tagline_ru: 'Вопросы и ответы для мероприятий — бесплатно и без регистрации',
  tagline_en: 'Free, no-signup audience Q&A for live events',
  description_ru:
    'qanda.online — бесплатный сервис вопросов и ответов для конференций, вебинаров, лекций и встреч. Участники задают вопросы и голосуют без регистрации, ведущий модерирует и показывает лучшие на экране.',
  description_en:
    'qanda.online — free audience Q&A for conferences, webinars, lectures and meetings. Attendees ask and upvote questions with no signup; the host moderates and shows the best on screen.',
  twitter: '@qandaonline',
} as const

export function absoluteUrl(path = '/'): string {
  return new URL(path, siteConfig.url).toString()
}
