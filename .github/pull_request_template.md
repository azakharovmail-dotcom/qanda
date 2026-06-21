<!--
One PR = one issue = one purpose. Keep the diff minimal and single-purpose.
-->

## Что и зачем / What & why

<!-- Кратко: что меняется и почему. -->

Closes #<!-- номер связанного issue -->

## Чек-лист / Checklist

- [ ] Связанный issue указан выше (`Closes #N`)
- [ ] Добавлен регрессионный тест, который **падал до фикса** и **проходит после** (test-first)
- [ ] Прогнаны гейты локально: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- [ ] Диф минимальный и одноцелевой (без попутных рефакторингов)
- [ ] Вся видимая пользователю копия — на русском (RU-first)

## Человеческие гейты / Human-approval gates

Отметьте, если затронуто (требует ревью CODEOWNERS, **агент не мержит сам**):

- [ ] `supabase/migrations/**` (схема / RLS)
- [ ] `lib/supabase/**` (в т.ч. service-role клиент)
- [ ] `lib/anon.ts` (подпись анонимных токенов)
- [ ] `proxy.ts`
- [ ] auth / sign-in
- [ ] `package.json` / `pnpm-lock.yaml` (зависимости)
- [ ] Ничего из перечисленного не затронуто ✅

## Превью / Screenshots & preview

<!-- Ссылка на Vercel Preview Deployment и/или скриншоты до/после. -->

- Preview:
