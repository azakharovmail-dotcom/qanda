import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))

export const createEventSchema = z.object({
  title: z.string().trim().min(2, 'Название слишком короткое').max(80, 'Не длиннее 80 символов'),
  subtitle: optionalText(120),
  moderation: z.enum(['pre', 'auto']).default('pre'),
})
export type CreateEventInput = z.infer<typeof createEventSchema>

export const submitQuestionSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Введите вопрос')
    .max(280, 'Не длиннее 280 символов'),
  authorName: optionalText(40),
  // Honeypot: must stay empty. Bots tend to fill every field.
  website: z.literal('').optional(),
})
export type SubmitQuestionInput = z.infer<typeof submitQuestionSchema>

export const voteSchema = z.object({
  questionId: z.uuid(),
})

export const brandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Нужен HEX-цвет, например #2563EB')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  subtitle: optionalText(120),
})

export const signInSchema = z.object({
  email: z.email('Введите корректный e-mail'),
})

export const eventStatusSchema = z.enum(['draft', 'live', 'closed', 'archived'])
export const questionStatusSchema = z.enum(['pending', 'approved', 'answering', 'answered', 'rejected'])
