'use client'

import { useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/landing/reveal'

/**
 * Interactive DEMO sandbox («ведущий ↔ участник») — a self-contained, fully
 * fake reproduction of the prototype's two-panel sandbox. The presenter panel
 * (right, dark) drives the participant screen (left, light) between three
 * activities — ОПРОС / КВИЗ / Q&A — and runs the moderation loop: a question
 * asked on the left lands in the moderation queue on the right, «Одобрить»
 * publishes it back to the participant Q&A list, «Скрыть» drops it.
 *
 * No Supabase, no realtime, no network — everything lives in local state.
 * The `#demo` anchor lives on this section (nav «Демо» + hero scroll target).
 */

type Mode = 'poll' | 'quiz' | 'qa'

const PART_LABELS: Record<Mode, string> = {
  poll: 'Идёт опрос',
  quiz: 'Идёт квиз',
  qa: 'Вопросы и ответы',
}
const ADMIN_LABELS: Record<Mode, string> = {
  poll: 'Опрос',
  quiz: 'Квиз',
  qa: 'Модерация',
}

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

// ── Seed data ──────────────────────────────────────────────────────────────
const POLL_LABELS = ['Скорость работы', 'Дизайн интерфейса', 'Поддержка']
const POLL_BASE = [355, 165, 92]
const POLL_BAR_COLORS = ['var(--raif-yellow)', 'var(--sochi-60)', 'var(--manila-60)']

type QuizOpt = { text: string; correct: boolean }
const QUIZ_OPTS: QuizOpt[] = [
  { text: 'Код с экрана', correct: true },
  { text: 'Пароль от Wi-Fi', correct: false },
  { text: 'Свой e-mail', correct: false },
  { text: 'QR-код соседа', correct: false },
]

type Avatar =
  | { kind: 'anon' }
  | { kind: 'letter'; letter: string; bg: string }
  | { kind: 'approved' } // published-from-moderation check badge

type QaItem = {
  id: number
  text: string
  meta: string
  base: number
  vote: 0 | 1 | -1
  avatar: Avatar
  fresh?: boolean // just published — sochi tint, fades to white
}

const SEED_QA: QaItem[] = [
  {
    id: 1,
    text: 'Когда появится мобильное приложение?',
    meta: 'Анонимно · 2 мин',
    base: 128,
    vote: 0,
    avatar: { kind: 'anon' },
  },
  {
    id: 2,
    text: 'Можно ли интегрировать с нашей CRM?',
    meta: 'Марина К. · 5 мин',
    base: 94,
    vote: 0,
    avatar: { kind: 'letter', letter: 'М', bg: 'var(--paris-60)' },
  },
  {
    id: 3,
    text: 'Есть ли лимит на число участников?',
    meta: 'Ксения Л. · 18 мин',
    base: 61,
    vote: 0,
    avatar: { kind: 'letter', letter: 'К', bg: 'var(--porto-60)' },
  },
]

type ModItem = { id: number; text: string; isNew?: boolean }
const SEED_MOD: ModItem[] = [
  { id: 101, text: 'Будет ли интеграция со Slack?' },
  { id: 102, text: 'Можно ли брендировать экран опроса?' },
]

type BoardRow = { name: string; score: number; you?: boolean }
const SEED_BOARD: BoardRow[] = [
  { name: 'Анна П.', score: 280 },
  { name: 'Дмитрий В.', score: 240 },
  { name: 'Олег М.', score: 180 },
]

export function DemoSandbox() {
  const [mode, setMode] = useState<Mode>('qa')

  // ── Poll ──────────────────────────────────────────────────────────────
  const [pollBase, setPollBase] = useState<number[]>(POLL_BASE)
  const [pick, setPick] = useState(-1)
  const [pollHover, setPollHover] = useState(-1)

  // live incoming votes — only while poll is the active activity. We re-create
  // the interval when `mode` changes and bail out unless poll is active, so the
  // loop only ticks during the poll (same visible behaviour as the ref guard).
  useEffect(() => {
    if (mode !== 'poll') return
    const id = setInterval(() => {
      setPollBase((prev) => {
        const next = prev.slice()
        const i = Math.floor(Math.random() * next.length)
        next[i] += 1 + Math.floor(Math.random() * 3)
        return next
      })
    }, 1700)
    return () => clearInterval(id)
  }, [mode])

  const pollCur = pollBase.slice()
  if (pick >= 0) pollCur[pick] += 1
  const pollTotal = pollCur.reduce((a, b) => a + b, 0) || 1
  let leadI = 0
  pollCur.forEach((v, i) => {
    if (v > pollCur[leadI]) leadI = i
  })
  const pollPct = pollCur.map((v) => Math.round((v / pollTotal) * 100))

  // ── Quiz ──────────────────────────────────────────────────────────────
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [quizPicked, setQuizPicked] = useState(-1)
  const [quizHover, setQuizHover] = useState(-1)
  const [youScore, setYouScore] = useState(0)
  const [youRank, setYouRank] = useState(4)
  const quizCorrect = quizPicked >= 0 && QUIZ_OPTS[quizPicked].correct

  const onQuizPick = (i: number) => {
    if (quizAnswered) return
    setQuizAnswered(true)
    setQuizPicked(i)
    const correct = QUIZ_OPTS[i].correct
    setYouScore(correct ? 100 : 0)
    if (correct) setYouRank(3)
  }

  // assemble the leaderboard with «Вы» inserted at the right rank
  const boardRows: BoardRow[] = (() => {
    const you: BoardRow = { name: 'Вы', score: youScore, you: true }
    if (youRank === 3) {
      // jump above Олег М. (3rd seed) — order: Анна, Дмитрий, Вы, Олег
      return [SEED_BOARD[0], SEED_BOARD[1], you, SEED_BOARD[2]]
    }
    // default: Анна, Дмитрий, Олег, Вы
    return [...SEED_BOARD, you]
  })()

  // ── Q&A + moderation ──────────────────────────────────────────────────
  const [qaItems, setQaItems] = useState<QaItem[]>(SEED_QA)
  const [qaNum, setQaNum] = useState(23)
  const [modItems, setModItems] = useState<ModItem[]>(SEED_MOD)
  const [qaInput, setQaInput] = useState('')
  const [qaInputError, setQaInputError] = useState(false)
  const [qaFocus, setQaFocus] = useState(false)
  const [sendHover, setSendHover] = useState(false)
  // Transient suffix shown after a question is queued while not in Q&A mode
  // (e.g. «Опрос · +1 на модерации»). Cleared whenever the presenter switches
  // activity, so the base label is otherwise derived straight from `mode`.
  const [statusNudge, setStatusNudge] = useState<string | null>(null)
  const adminStatus = statusNudge ?? ADMIN_LABELS[mode]
  const idRef = useRef(1000)

  // switching activity sets the mode and drops any stale moderation nudge
  const selectMode = (m: Mode) => {
    setStatusNudge(null)
    setMode(m)
  }

  // votes resort the list by total (prototype's resort()); a freshly published
  // question stays at the top until someone votes — so we only re-sort on vote,
  // never on insert.
  const voteQa = (id: number, dir: 1 | -1) => {
    setQaItems((prev) => {
      const next = prev.map((it) =>
        it.id === id ? { ...it, vote: (it.vote === dir ? 0 : dir) as 0 | 1 | -1 } : it,
      )
      return next
        .map((it, i) => ({ it, i }))
        .sort((a, b) => b.it.base + b.it.vote - (a.it.base + a.it.vote) || a.i - b.i)
        .map((x) => x.it)
    })
  }

  const publishQuestion = (text: string, meta: string) => {
    const id = ++idRef.current
    setQaItems((prev) => [
      { id, text, meta, base: 1, vote: 0, avatar: { kind: 'approved' }, fresh: true },
      ...prev,
    ])
    setQaNum((n) => n + 1)
    // sochi tint fades back to white after 1.4s
    setTimeout(() => {
      setQaItems((prev) => prev.map((it) => (it.id === id ? { ...it, fresh: false } : it)))
    }, 1400)
  }

  const approveMod = (item: ModItem) => {
    publishQuestion(item.text, item.isNew ? 'Вы · одобрено' : 'Одобрено ведущим')
    setModItems((prev) => prev.filter((m) => m.id !== item.id))
  }
  const hideMod = (id: number) => {
    setModItems((prev) => prev.filter((m) => m.id !== id))
  }

  const submitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    const text = qaInput.trim()
    if (text.length < 3) {
      setQaInputError(true)
      return
    }
    setQaInput('')
    setQaInputError(false)
    const id = ++idRef.current
    setModItems((prev) => [{ id, text, isNew: true }, ...prev])
    // nudge the presenter status so the user notices the new item on the right
    if (mode !== 'qa') setStatusNudge(ADMIN_LABELS[mode] + ' · +1 на модерации')
  }

  const modCount = modItems.length

  // ── shared button styles ──────────────────────────────────────────────
  const launchStyle = (m: Mode): React.CSSProperties => {
    const on = mode === m
    return {
      appearance: 'none',
      WebkitAppearance: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      textAlign: 'left',
      border: 'none',
      borderRadius: 14,
      padding: '14px 16px',
      fontSize: 15,
      fontWeight: on ? 600 : 500,
      background: on ? 'var(--raif-yellow)' : 'rgba(255,255,255,.06)',
      color: on ? 'var(--ink-900)' : 'var(--white)',
      transition: `background .2s ${EASE}, color .2s ${EASE}`,
    }
  }

  return (
    <section
      id="demo"
      style={{
        padding: 'clamp(72px, 10vw, 130px) clamp(20px, 5vw, 64px)',
        background: 'var(--white)',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Reveal>
          <div
            style={{
              fontSize: 13,
              letterSpacing: '0.06em',
              color: 'var(--ink-400)',
              marginBottom: 14,
            }}
          >
            ЖИВОЙ ЭКРАН · ПОПРОБУЙТЕ САМИ
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              margin: '0 0 16px',
              maxWidth: 640,
              color: 'var(--ink-800)',
            }}
          >
            Так это выглядит во время сессии
          </h2>
          <p
            style={{
              fontSize: 17,
              color: 'var(--ink-500)',
              margin: '0 0 56px',
              maxWidth: 560,
            }}
          >
            Слева — экран участника, справа — панель ведущего. Запускайте опрос или квиз,
            модерируйте вопросы — и сразу отвечайте на них на экране участника. Полный цикл сервиса
            в одном окне.
          </p>
        </Reveal>

        <div className="demo-grid" style={{ alignItems: 'stretch' }}>
          {/* ============ LEFT: PARTICIPANT SCREEN ============ */}
          <Reveal
            data-hover
            style={{
              background: 'var(--ink-100)',
              borderRadius: 24,
              padding: 32,
              minHeight: 560,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 12, letterSpacing: '0.06em', color: 'var(--ink-400)' }}>
                ЭКРАН УЧАСТНИКА
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 12,
                  color: 'var(--ink-600)',
                  background: 'var(--white)',
                  borderRadius: 999,
                  padding: '6px 12px',
                }}
              >
                <span
                  className="pulse-live"
                  style={{ width: 7, height: 7, borderRadius: 999, background: '#e5484d' }}
                />
                <span>{PART_LABELS[mode]}</span>
              </span>
            </div>

            {/* ---- POLL VIEW ---- */}
            {mode === 'poll' && (
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.04em',
                    color: 'var(--ink-400)',
                    marginBottom: 10,
                  }}
                >
                  ОПРОС · В ЭФИРЕ · {pollTotal.toLocaleString('ru-RU')} голосов
                </div>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    margin: '0 0 22px',
                    color: 'var(--ink-800)',
                  }}
                >
                  Что улучшить в первую очередь?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {POLL_LABELS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPick((p) => (p === i ? -1 : i))}
                      onMouseEnter={() => setPollHover(i)}
                      onMouseLeave={() => setPollHover(-1)}
                      style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        textAlign: 'left',
                        width: '100%',
                        border: 'none',
                        padding: '10px 12px',
                        borderRadius: 14,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: `background .2s ${EASE}`,
                        background:
                          i === pick
                            ? 'rgba(43,45,51,0.06)'
                            : i === pollHover
                              ? 'rgba(43,45,51,0.04)'
                              : 'transparent',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 15,
                          marginBottom: 8,
                          color: 'var(--ink-700)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 999,
                              background: 'var(--ink-800)',
                              color: '#fff',
                              display: i === pick ? 'inline-flex' : 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12l5 5 9-10" />
                            </svg>
                          </span>
                          {label}
                        </span>
                        <span style={{ fontWeight: 600 }}>{pollPct[i]}%</span>
                      </div>
                      <div
                        style={{
                          height: 18,
                          borderRadius: 999,
                          background: 'var(--white)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pollPct[i]}%`,
                            borderRadius: 999,
                            background: POLL_BAR_COLORS[i],
                            transition: `width .85s ${EASE}`,
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-400)' }}>
                  {pick >= 0
                    ? 'Спасибо! Ваш голос учтён'
                    : 'Нажмите на вариант, чтобы проголосовать'}
                </div>
              </div>
            )}

            {/* ---- QUIZ VIEW ---- */}
            {mode === 'quiz' && (
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 12, letterSpacing: '0.04em', color: 'var(--ink-400)' }}>
                    КВИЗ · ВОПРОС 1 ИЗ 3
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--ink-700)',
                      background: 'var(--white)',
                      borderRadius: 999,
                      padding: '4px 11px',
                    }}
                  >
                    ⏱ 18 сек
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    margin: '0 0 20px',
                    color: 'var(--ink-800)',
                  }}
                >
                  Что показывает ведущий, чтобы участники подключились?
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {QUIZ_OPTS.map((opt, i) => {
                    const showMark = quizAnswered && (opt.correct || i === quizPicked)
                    let borderColor = 'transparent'
                    let background = 'var(--white)'
                    if (quizAnswered) {
                      if (opt.correct) {
                        borderColor = 'var(--sochi-text)'
                        background = 'var(--sochi-35)'
                      } else if (i === quizPicked) {
                        borderColor = '#e5484d'
                        background = 'rgba(229,72,77,.1)'
                      }
                    } else if (i === quizHover) {
                      borderColor = 'var(--ink-200)'
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onQuizPick(i)}
                        onMouseEnter={() => setQuizHover(i)}
                        onMouseLeave={() => setQuizHover(-1)}
                        style={{
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          textAlign: 'left',
                          background,
                          border: `2px solid ${borderColor}`,
                          borderRadius: 16,
                          padding: 16,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 15,
                          color: 'var(--ink-800)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          pointerEvents: quizAnswered ? 'none' : 'auto',
                          transition: `border-color .2s ${EASE}, background .2s ${EASE}`,
                        }}
                      >
                        <span
                          style={{
                            flex: 'none',
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            background: opt.correct ? 'var(--sochi-text)' : '#e5484d',
                            color: '#fff',
                            display: showMark ? 'flex' : 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                          }}
                        >
                          {opt.correct ? '✓' : '✕'}
                        </span>
                        {opt.text}
                      </button>
                    )
                  })}
                </div>
                <div
                  style={{
                    minHeight: 20,
                    marginTop: 16,
                    fontSize: 14,
                    color: quizAnswered
                      ? quizCorrect
                        ? 'var(--sochi-text)'
                        : '#e5484d'
                      : 'var(--ink-400)',
                  }}
                >
                  {quizAnswered
                    ? quizCorrect
                      ? 'Верно! +100 очков — вы поднялись в таблице лидеров.'
                      : 'Почти! Правильный ответ — «Код с экрана».'
                    : 'Выберите ответ — очки начислят за скорость и точность.'}
                </div>
              </div>
            )}

            {/* ---- Q&A VIEW ---- */}
            {mode === 'qa' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.04em',
                    color: 'var(--ink-400)',
                    marginBottom: 14,
                  }}
                >
                  ВОПРОСЫ · {qaNum} от участников
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {qaItems.map((item) => {
                    const count = item.base + item.vote
                    const upActive = item.vote === 1
                    const downActive = item.vote === -1
                    // first seed item shows the yellow upvote pill; published-fresh
                    // items show a sochi tint that fades to white
                    const pillBg = item.id === 1 ? 'var(--raif-yellow)' : 'var(--ink-100)'
                    const pillColor = item.id === 1 ? 'var(--ink-900)' : 'var(--ink-800)'
                    return (
                      <div
                        key={item.id}
                        data-hover
                        style={{
                          display: 'flex',
                          gap: 14,
                          alignItems: 'center',
                          background: item.fresh ? 'var(--sochi-35)' : 'var(--white)',
                          border: item.fresh
                            ? '1px solid var(--sochi-60)'
                            : '1px solid transparent',
                          borderRadius: 16,
                          padding: '13px 14px',
                          transition: `background .2s ${EASE}, border-color .2s ${EASE}`,
                        }}
                      >
                        <div
                          style={{
                            flex: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            width: 46,
                            padding: '7px 0',
                            borderRadius: 12,
                            background: pillBg,
                            color: pillColor,
                          }}
                        >
                          <svg
                            onClick={() => voteQa(item.id, 1)}
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={upActive ? 'var(--sochi-text)' : 'currentColor'}
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ cursor: 'pointer' }}
                          >
                            <path d="M6 15l6-6 6 6" />
                          </svg>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{count}</span>
                          <svg
                            onClick={() => voteQa(item.id, -1)}
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={downActive ? '#e5484d' : 'currentColor'}
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: downActive ? 1 : 0.4, cursor: 'pointer' }}
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 15,
                              lineHeight: 1.35,
                              marginBottom: 7,
                              color: 'var(--ink-800)',
                            }}
                          >
                            {item.text}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              fontSize: 12,
                              color: 'var(--ink-400)',
                            }}
                          >
                            <QaAvatar avatar={item.avatar} />
                            {item.meta}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <form onSubmit={submitQuestion} style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <input
                    value={qaInput}
                    onChange={(e) => {
                      setQaInput(e.target.value)
                      if (qaInputError) setQaInputError(false)
                    }}
                    onFocus={() => setQaFocus(true)}
                    onBlur={() => setQaFocus(false)}
                    maxLength={120}
                    autoComplete="off"
                    placeholder="Задайте свой вопрос…"
                    aria-label="Ваш вопрос"
                    style={{
                      flex: '1 1 auto',
                      minWidth: 0,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      border: `1.5px solid ${
                        qaInputError
                          ? '#e5484d'
                          : qaFocus
                            ? 'var(--raif-yellow-deep)'
                            : 'var(--ink-200)'
                      }`,
                      background: 'var(--white)',
                      borderRadius: 14,
                      padding: '0 16px',
                      height: 46,
                      fontFamily: 'inherit',
                      fontSize: 15,
                      color: 'var(--ink-800)',
                      outline: 'none',
                      transition: `border-color .2s ${EASE}`,
                    }}
                  />
                  <button
                    type="submit"
                    onMouseEnter={() => setSendHover(true)}
                    onMouseLeave={() => setSendHover(false)}
                    aria-label="Отправить вопрос"
                    style={{
                      flex: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      background: sendHover ? 'var(--raif-yellow-deep)' : 'var(--raif-yellow)',
                      color: 'var(--ink-900)',
                      borderRadius: 14,
                      width: 46,
                      height: 46,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: `background .2s ${EASE}, transform .12s ${EASE}`,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h13M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </Reveal>

          {/* ============ RIGHT: PRESENTER / ADMIN ============ */}
          <Reveal
            data-hover
            delay={100}
            style={{
              background: 'var(--ink-900)',
              borderRadius: 24,
              padding: 32,
              color: 'var(--white)',
              minHeight: 560,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 12, letterSpacing: '0.06em', color: 'var(--raif-lime)' }}>
                ПАНЕЛЬ ВЕДУЩЕГО
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>
                Идёт: {adminStatus}
              </span>
            </div>

            {/* launch controls */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginBottom: 20,
              }}
            >
              <LaunchButton
                mode="poll"
                current={mode}
                onClick={selectMode}
                style={launchStyle('poll')}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Запустить опрос
              </LaunchButton>
              <LaunchButton
                mode="quiz"
                current={mode}
                onClick={selectMode}
                style={launchStyle('quiz')}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.1 9a3 3 0 1 1 5.8 1c-.4 1.4-2 2-2.9 3-.4.5-.5 1-.5 1.7" />
                  <circle cx="12" cy="18" r="0.5" fill="currentColor" strokeWidth="1.5" />
                </svg>
                Запустить квиз
              </LaunchButton>
              <LaunchButton mode="qa" current={mode} onClick={selectMode} style={launchStyle('qa')}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Модерация вопросов
              </LaunchButton>
            </div>

            <div
              style={{
                height: 1,
                background: 'rgba(255,255,255,.1)',
                marginBottom: 18,
              }}
            />

            {/* admin: poll */}
            {mode === 'poll' && (
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,.55)',
                    marginBottom: 18,
                  }}
                >
                  Опрос «Что улучшить в первую очередь?» в эфире.
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,.05)',
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 600,
                        fontFamily: 'var(--font-brand)',
                        lineHeight: 1,
                      }}
                    >
                      {pollTotal.toLocaleString('ru-RU')}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,.45)',
                        marginTop: 6,
                      }}
                    >
                      голосов · live
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,.05)',
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: 'var(--raif-lime)',
                      }}
                    >
                      {POLL_LABELS[leadI]}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,.45)',
                        marginTop: 6,
                      }}
                    >
                      лидирует сейчас
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,.4)',
                    lineHeight: 1.5,
                  }}
                >
                  Результаты обновляются на экране участника в реальном времени. Проголосуйте слева
                  — увидите, как меняется лидер.
                </div>
              </div>
            )}

            {/* admin: quiz */}
            {mode === 'quiz' && (
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    marginBottom: 16,
                    color: 'rgba(255,255,255,.55)',
                  }}
                >
                  Правильный ответ:{' '}
                  <span style={{ color: 'var(--raif-lime)', fontWeight: 600 }}>Код с экрана</span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,.4)',
                    marginBottom: 10,
                  }}
                >
                  ТАБЛИЦА ЛИДЕРОВ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {boardRows.map((row, i) => (
                    <div
                      key={row.you ? 'you' : row.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: row.you ? 'rgba(254,230,0,.12)' : 'rgba(255,255,255,.05)',
                        border: row.you ? '1px solid rgba(254,230,0,.3)' : undefined,
                        borderRadius: 12,
                        padding: '11px 14px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: row.you ? 'var(--raif-lime)' : 'rgba(255,255,255,.5)',
                          width: 16,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{ flex: 1, fontSize: 14, fontWeight: row.you ? 600 : undefined }}
                      >
                        {row.name}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{row.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* admin: moderation */}
            {mode === 'qa' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      letterSpacing: '0.04em',
                      color: 'rgba(255,255,255,.5)',
                    }}
                  >
                    НА МОДЕРАЦИИ · {modCount}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
                    одобренные видны слева
                  </span>
                </div>
                {modCount > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {modItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: item.isNew ? 'rgba(118,243,76,.1)' : 'rgba(255,255,255,.05)',
                          border: item.isNew ? '1px solid rgba(118,243,76,.32)' : undefined,
                          borderRadius: 14,
                          padding: 14,
                        }}
                      >
                        {item.isNew && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                letterSpacing: '0.04em',
                                fontWeight: 600,
                                color: 'var(--ink-900)',
                                background: 'var(--raif-lime)',
                                borderRadius: 999,
                                padding: '2px 8px',
                              }}
                            >
                              НОВЫЙ
                            </span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>
                              от участника
                            </span>
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 14,
                            lineHeight: 1.35,
                            marginBottom: 12,
                            color: 'var(--white)',
                          }}
                        >
                          {item.text}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => approveMod(item)}
                            style={{
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              border: 'none',
                              borderRadius: 10,
                              padding: '8px 14px',
                              fontSize: 13,
                              fontWeight: 600,
                              background: 'var(--raif-yellow)',
                              color: 'var(--ink-900)',
                            }}
                          >
                            Одобрить
                          </button>
                          <button
                            type="button"
                            onClick={() => hideMod(item.id)}
                            style={{
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              border: 'none',
                              borderRadius: 10,
                              padding: '8px 14px',
                              fontSize: 13,
                              fontWeight: 500,
                              background: 'rgba(255,255,255,.08)',
                              color: 'rgba(255,255,255,.7)',
                            }}
                          >
                            Скрыть
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: 13,
                      color: 'rgba(255,255,255,.35)',
                      padding: '24px 0',
                    }}
                  >
                    Очередь пуста. Задайте вопрос на экране участника слева — он прилетит сюда на
                    модерацию.
                  </div>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────

function LaunchButton({
  mode,
  current,
  onClick,
  style,
  children,
}: {
  mode: Mode
  current: Mode
  onClick: (m: Mode) => void
  style: React.CSSProperties
  children: React.ReactNode
}) {
  const [hover, setHover] = useState(false)
  const on = current === mode
  return (
    <button
      type="button"
      data-hover
      onClick={() => onClick(mode)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...style,
        background: on
          ? 'var(--raif-yellow)'
          : hover
            ? 'rgba(255,255,255,.12)'
            : 'rgba(255,255,255,.06)',
      }}
    >
      {children}
    </button>
  )
}

function QaAvatar({ avatar }: { avatar: Avatar }) {
  if (avatar.kind === 'anon') {
    return (
      <span
        style={{
          flex: 'none',
          width: 18,
          height: 18,
          borderRadius: 999,
          background: 'var(--ink-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-500)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
        </svg>
      </span>
    )
  }
  if (avatar.kind === 'approved') {
    return (
      <span
        style={{
          flex: 'none',
          width: 18,
          height: 18,
          borderRadius: 999,
          background: 'var(--sochi-60)',
          color: 'var(--ink-900)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
    )
  }
  // letter avatar
  return (
    <span
      style={{
        flex: 'none',
        width: 18,
        height: 18,
        borderRadius: 999,
        background: avatar.bg,
        color: 'var(--ink-900)',
        fontSize: 10,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {avatar.letter}
    </span>
  )
}
