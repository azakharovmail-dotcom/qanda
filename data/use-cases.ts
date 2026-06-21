// Programmatic SEO dataset: /use-cases/[case].

export interface UseCase {
  slug: string
  title_ru: string
  painPoint_ru: string
  howItWorks_ru: string
  sampleQuestions_ru: string[]
}

export const useCases: UseCase[] = [
  {
    slug: 'conferences',
    title_ru: 'Вопросы и ответы на конференциях',
    painPoint_ru: 'Микрофон не доходит до зала, лучшие вопросы теряются.',
    howItWorks_ru: 'Участники сканируют QR, задают вопросы и голосуют — ведущий видит топ на экране.',
    sampleQuestions_ru: ['Как вы измеряете успех?', 'Будет ли запись?', 'Какой стек вы используете?'],
  },
  {
    slug: 'webinars',
    title_ru: 'Q&A для вебинаров',
    painPoint_ru: 'Чат переполнен, важные вопросы тонут в потоке сообщений.',
    howItWorks_ru: 'Вопросы голосуются и модерируются, спикер отвечает на самые востребованные.',
    sampleQuestions_ru: ['Где взять слайды?', 'Это подходит для новичков?'],
  },
  {
    slug: 'lectures',
    title_ru: 'Вопросы на лекциях и в классе',
    painPoint_ru: 'Студенты стесняются поднимать руку и задавать вопросы вслух.',
    howItWorks_ru: 'Анонимные вопросы снимают барьер — спрашивают даже самые тихие.',
    sampleQuestions_ru: ['Можно подробнее про этот шаг?', 'Что почитать по теме?'],
  },
  {
    slug: 'town-halls',
    title_ru: 'Q&A на общих собраниях (all-hands)',
    painPoint_ru: 'Сотрудники боятся задавать острые вопросы открыто.',
    howItWorks_ru: 'Анонимность + голосование показывают, что реально волнует команду.',
    sampleQuestions_ru: ['Планируется ли пересмотр зарплат?', 'Каковы планы на следующий квартал?'],
  },
  {
    slug: 'meetups',
    title_ru: 'Вопросы на митапах',
    painPoint_ru: 'Времени на Q&A мало, нужно выбрать самое интересное.',
    howItWorks_ru: 'Голосование за минуту выявляет лучшие вопросы для блиц-ответов.',
    sampleQuestions_ru: ['Где найти запись доклада?', 'Ищете ли вы контрибьюторов?'],
  },
]

export const findUseCase = (slug: string) => useCases.find((u) => u.slug === slug)
