import { randomInt } from 'node:crypto'

/**
 * Join codes & slugs.
 *
 * Code alphabet excludes visually ambiguous characters (0/O, 1/I/L) so codes
 * are easy to read aloud and type on a phone. 6 chars → ~24 bits of entropy
 * (~10^9 combos), collision-checked against the DB at creation time.
 */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export function generateCode(length = 6): string {
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(0, ALPHABET.length)]
  return out
}

/** Normalize user-typed codes: uppercase, strip spaces/dashes. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
}

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || 'event'
}

/** Append a short random suffix to keep slugs unique. */
export function uniqueSlug(title: string): string {
  return `${slugify(title)}-${generateCode(4).toLowerCase()}`
}
