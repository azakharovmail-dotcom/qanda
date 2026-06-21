/**
 * Infinite running text strip on a dark bar. The word list is duplicated
 * (second copy aria-hidden) so the −50% translate loop is seamless. Each word
 * is trailed by a yellow «✳» separator. Pure-CSS animation (keyframes in
 * globals.css), so this can stay a server component.
 */
const WORDS = [
  'опросы',
  'голосования',
  'квизы',
  'Q&A',
  'облака слов',
  'обратная связь',
  'рейтинги',
  'шкалы',
]

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {WORDS.map((w, i) => (
        <span key={i} className="marquee-word">
          {w}
          <span style={{ color: 'var(--brand)' }}>✳</span>
        </span>
      ))}
    </div>
  )
}

export function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        <Group />
        <Group hidden />
      </div>
    </div>
  )
}
