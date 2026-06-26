'use client'

import { useMemo, useState } from 'react'

// Participant room — the screen a guest sees after joining by code/QR.
// Three core features (per the owner's spec):
//   1) ask a question        2) vote за/против        3) anonymous or named
// Layout: questions are the main scrolling area; the composer is a sticky
// bottom bar (chat / Slido style). Brand-consistent (design tokens from
// globals.css). Self-contained interactive mock for now; real wiring
// (api/questions + api/votes + realtime) lands next.

type Vote = 'up' | 'down' | null
type Question = {
  id: number
  text: string
  author: string
  up: number
  down: number
  mine: Vote
  when: string
}

const SEED: Question[] = [
  { id: 1, text: 'Когда выкатим новую версию для клиентов?', author: 'Марина', up: 14, down: 1, mine: null, when: '5 мин' },
  { id: 2, text: 'Будет ли тёмная тема в приложении?', author: 'Аноним', up: 9, down: 0, mine: null, when: '8 мин' },
  { id: 3, text: 'Можно ли выгружать результаты опроса в Excel?', author: 'Игорь', up: 6, down: 2, mine: null, when: '12 мин' },
]

export default function ParticipantRoom({ code, title }: { code: string; title: string }) {
  const [questions, setQuestions] = useState<Question[]>(SEED)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [anon, setAnon] = useState(true)
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [seq, setSeq] = useState(1000)

  const canSend = text.trim().length > 0

  function submit() {
    const body = text.trim()
    if (!body) return
    const author = anon || !name.trim() ? 'Аноним' : name.trim()
    setQuestions((qs) => [
      { id: seq, text: body, author, up: 0, down: 0, mine: null, when: 'только что' },
      ...qs,
    ])
    setSeq((n) => n + 1)
    setText('')
  }

  function vote(id: number, dir: Exclude<Vote, null>) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q
        let { up, down } = q
        let mine: Vote = q.mine
        if (mine === 'up') up -= 1
        if (mine === 'down') down -= 1
        if (mine === dir) {
          mine = null
        } else {
          mine = dir
          if (dir === 'up') up += 1
          else down += 1
        }
        return { ...q, up, down, mine }
      }),
    )
  }

  const ordered = useMemo(() => {
    const list = [...questions]
    if (sort === 'top') list.sort((a, b) => b.up - b.down - (a.up - a.down))
    else list.sort((a, b) => b.id - a.id)
    return list
  }, [questions, sort])

  return (
    <div className="pr-root">
      <style>{CSS}</style>

      {/* dotted board + floating sticker shapes — same backdrop as /create & /dashboard */}
      <div className="pr-bg" aria-hidden dangerouslySetInnerHTML={{ __html: SHAPES }} />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="pr-header">
        <div className="pr-head-left">
          <span className="pr-chip">Есть вопросы</span>
          <span className="pr-title">{title}</span>
        </div>
        <div className="pr-code">
          <span className="pr-live" aria-hidden />
          Код {code}
        </div>
      </header>

      {/* ── Questions (main scroll area) ───────────────────── */}
      <main className="pr-main">
        <div className="pr-sortbar">
          <div className="pr-count">{questions.length} вопросов</div>
          <div className="pr-seg">
            <button className={sort === 'top' ? 'on' : ''} onClick={() => setSort('top')}>
              Популярные
            </button>
            <button className={sort === 'new' ? 'on' : ''} onClick={() => setSort('new')}>
              Новые
            </button>
          </div>
        </div>

        <ul className="pr-list">
          {ordered.map((q) => {
            const score = q.up - q.down
            return (
              <li key={q.id} className="pr-q">
                <div className="pr-vote">
                  <button
                    className={`pr-vbtn up ${q.mine === 'up' ? 'on' : ''}`}
                    aria-label="За"
                    title="За"
                    onClick={() => vote(q.id, 'up')}
                  >
                    <Chevron up />
                  </button>
                  <span className={`pr-score ${score > 0 ? 'pos' : score < 0 ? 'neg' : ''}`}>
                    {score > 0 ? `+${score}` : score}
                  </span>
                  <button
                    className={`pr-vbtn down ${q.mine === 'down' ? 'on' : ''}`}
                    aria-label="Против"
                    title="Против"
                    onClick={() => vote(q.id, 'down')}
                  >
                    <Chevron />
                  </button>
                </div>
                <div className="pr-body">
                  <p className="pr-text">{q.text}</p>
                  <div className="pr-meta">
                    <span className={q.author === 'Аноним' ? 'pr-anonauthor' : 'pr-author'}>
                      {q.author}
                    </span>
                    <span className="pr-dot">·</span>
                    <span>{q.when}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {questions.length === 0 && (
          <div className="pr-empty">Пока вопросов нет — задайте первый 👇</div>
        )}
      </main>

      {/* ── Composer (sticky bottom) ───────────────────────── */}
      <section className="pr-composer">
        <textarea
          className="pr-textarea"
          placeholder="Задайте вопрос спикеру…"
          maxLength={280}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
          }}
          rows={2}
        />
        <div className="pr-composer-foot">
          <div className="pr-identity">
            <button
              type="button"
              className={`pr-anon ${anon ? 'on' : ''}`}
              aria-pressed={anon}
              onClick={() => setAnon((v) => !v)}
            >
              <Check /> Анонимно
            </button>
            <input
              className="pr-name"
              placeholder={anon ? 'Аноним' : 'Ваше имя'}
              value={anon ? '' : name}
              disabled={anon}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="button" className="pr-send" disabled={!canSend} onClick={submit}>
            Отправить
            <Arrow />
          </button>
        </div>
      </section>
    </div>
  )
}

/* ── tiny inline icons ─────────────────────────────────────── */
function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {up ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
    </svg>
  )
}
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5 9-10" />
    </svg>
  )
}

const SHAPES = `
<div style="position: absolute; top: 11%; left: 6%; width: 120px; height: 120px; animation: suFloatA 7s var(--ease-standard) infinite; display: flex; align-items: center; justify-content: center;"><span style="font-size: 116px; font-weight: 600; line-height: 1; color: var(--raif-yellow); transform: rotate(-8deg);">?</span></div>
<div style="position: absolute; top: 9%; right: 7%; width: 128px; height: 128px; animation: suFloatB 9s var(--ease-standard) infinite;"><svg viewBox="0 0 120 120" width="100%" height="100%" style="overflow: visible;"><path d="M 24 10 H 96 Q 114 10 114 28 V 62 Q 114 80 96 80 H 58 L 40 106 L 38 80 H 24 Q 6 80 6 62 V 28 Q 6 10 24 10 Z" fill="var(--sochi-35)"></path><circle cx="42" cy="45" r="5" fill="var(--sochi-text)"></circle><circle cx="60" cy="45" r="5" fill="var(--sochi-text)"></circle><circle cx="78" cy="45" r="5" fill="var(--sochi-text)"></circle></svg></div>
<div style="position: absolute; bottom: 16%; left: 8%; width: 66px; height: 66px; animation: suFloatB 6.5s var(--ease-standard) infinite; border-radius: 999px; background: var(--paris-30);"></div>
<div style="position: absolute; bottom: 12%; right: 9%; width: 54px; height: 54px; animation: suFloatA 8s var(--ease-standard) infinite; border-radius: 999px; border: 3px solid var(--ink-800);"></div>
<div style="position: absolute; top: 60%; right: 5%; width: 44px; height: 44px; animation: suFloatA 7.5s var(--ease-standard) infinite; border-radius: 999px; background: var(--manila-35);"></div>
<div style="position: absolute; top: 7%; left: 34%; width: 28px; height: 28px; animation: suFloatB 10s var(--ease-standard) infinite; border-radius: 8px; background: var(--porto-30);"></div>
<div style="position: absolute; bottom: 7%; left: 32%; width: 120px; height: 90px; animation: suFloatA 8.5s var(--ease-standard) infinite;"><svg viewBox="0 0 128 96" width="100%" height="100%" style="overflow: visible;"><path d="M 22 8 H 106 Q 124 8 124 26 V 56 Q 124 74 106 74 H 52 L 30 92 L 33 74 H 22 Q 4 74 4 56 V 26 Q 4 8 22 8 Z" fill="var(--porto-30)"></path><circle cx="44" cy="42" r="5.5" fill="var(--ink-800)"></circle><circle cx="64" cy="42" r="5.5" fill="var(--ink-800)"></circle><circle cx="84" cy="42" r="5.5" fill="var(--ink-800)"></circle></svg></div>
<div style="position: absolute; top: 54%; left: 5%; width: 90px; height: 90px; animation: suFloatB 8.5s var(--ease-standard) infinite;"><div style="width: 100%; height: 100%; transform: rotate(-6deg); background: var(--manila-35); border-radius: 4px; box-shadow: var(--shadow-md); padding: 16px 14px; display: flex; flex-direction: column; gap: 8px;"><span style="display: block; height: 5px; width: 72%; border-radius: 3px; background: rgba(28,91,95,.42);"></span><span style="display: block; height: 5px; width: 92%; border-radius: 3px; background: rgba(28,91,95,.28);"></span><span style="display: block; height: 5px; width: 56%; border-radius: 3px; background: rgba(28,91,95,.28);"></span></div></div>
<div style="position: absolute; top: 36%; right: 6%; width: 78px; height: 78px; animation: suFloatA 9.5s var(--ease-standard) infinite;"><div style="width: 100%; height: 100%; transform: rotate(7deg); background: var(--raif-yellow); border-radius: 4px; box-shadow: var(--shadow-md); padding: 14px 13px; display: flex; flex-direction: column; gap: 7px;"><span style="display: block; height: 5px; width: 64%; border-radius: 3px; background: rgba(33,28,44,.32);"></span><span style="display: block; height: 5px; width: 88%; border-radius: 3px; background: rgba(33,28,44,.2);"></span><span style="display: block; height: 5px; width: 50%; border-radius: 3px; background: rgba(33,28,44,.2);"></span></div></div>
`

const CSS = `
.pr-root { min-height: 100vh; background: var(--ink-100); font-family: var(--font-brand); color: var(--ink-800); -webkit-font-smoothing: antialiased; }
.pr-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; background-color: var(--ink-100); background-image: radial-gradient(#cfd1d1 1.4px, transparent 1.5px); background-size: 24px 24px; }
@keyframes suFloatA { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(6deg); } }
@keyframes suFloatB { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(14px) rotate(-8deg); } }
.pr-header { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 58px; padding: 0 clamp(14px, 4vw, 22px); background: rgba(255,255,255,.78); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(33,28,44,.06); }
.pr-head-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.pr-chip { position: relative; flex: none; display: inline-flex; align-items: center; padding: 6px 12px; background: var(--sochi-35); border-radius: 10px; font-size: 14px; font-weight: 600; letter-spacing: -.02em; color: var(--sochi-text); white-space: nowrap; }
.pr-chip::after { content: ''; position: absolute; bottom: -5px; right: 13px; border-left: 8px solid transparent; border-right: 4px solid transparent; border-top: 8px solid var(--sochi-35); }
.pr-title { font-size: 15px; font-weight: 600; color: var(--ink-800); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pr-code { flex: none; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--ink-600); }
.pr-live { width: 8px; height: 8px; border-radius: 999px; background: #e5484d; animation: prLive 1.5s ease-in-out infinite; }
@keyframes prLive { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.7); } }

/* questions = main scroll area; bottom padding clears the sticky composer */
.pr-main { position: relative; z-index: 1; width: 100%; max-width: 640px; margin: 0 auto; padding: clamp(14px, 3vw, 20px) clamp(12px, 4vw, 18px) 210px; }

.pr-sortbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; padding: 0 4px; }
.pr-count { font-size: 13px; font-weight: 600; color: var(--ink-500); }
.pr-seg { display: inline-flex; gap: 3px; background: var(--white); border-radius: 999px; padding: 3px; box-shadow: 0 2px 8px rgba(33,28,44,.06); }
.pr-seg button { cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; border: none; background: transparent; color: var(--ink-500); border-radius: 999px; padding: 7px 14px; transition: all .15s var(--ease-standard); }
.pr-seg button.on { background: var(--ink-900); color: var(--white); }

.pr-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.pr-q { display: flex; gap: 14px; background: var(--white); border-radius: 18px; padding: 14px 16px; box-shadow: 0 6px 20px rgba(33,28,44,.06); }
.pr-vote { flex: none; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.pr-vbtn { cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 30px; border: none; border-radius: 10px; background: var(--ink-50); color: var(--ink-400); transition: all .15s var(--ease-standard); }
.pr-vbtn:hover { background: var(--ink-100); color: var(--ink-700); }
.pr-vbtn.up.on { background: var(--raif-yellow); color: var(--ink-900); }
.pr-vbtn.down.on { background: var(--ink-800); color: var(--white); }
.pr-score { font-size: 15px; font-weight: 700; color: var(--ink-400); min-width: 28px; text-align: center; font-variant-numeric: tabular-nums; padding: 1px 0; }
.pr-score.pos { color: var(--ink-900); }
.pr-score.neg { color: var(--ink-400); }
.pr-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 7px; }
.pr-text { margin: 0; font-size: 16px; line-height: 1.4; color: var(--ink-800); word-break: break-word; }
.pr-meta { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--ink-400); }
.pr-author { font-weight: 600; color: var(--ink-600); }
.pr-anonauthor { font-weight: 500; color: var(--ink-400); }
.pr-dot { opacity: .6; }
.pr-empty { text-align: center; color: var(--ink-400); font-size: 15px; padding: 40px 20px; }

/* ── sticky bottom composer ─────────────────────────────────── */
.pr-composer { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; width: 100%; max-width: 640px; margin: 0 auto; background: var(--white); border-radius: 22px 22px 0 0; box-shadow: 0 -14px 44px rgba(33,28,44,.14); padding: 14px clamp(12px, 4vw, 18px) calc(14px + env(safe-area-inset-bottom)); }
.pr-textarea { width: 100%; resize: none; border: 1.5px solid var(--ink-200); border-radius: 14px; padding: 12px 15px; font-family: inherit; font-size: 16px; line-height: 1.4; color: var(--ink-800); outline: none; transition: border-color .2s var(--ease-standard), box-shadow .2s var(--ease-standard); }
.pr-textarea::placeholder { color: var(--ink-300); }
.pr-textarea:focus { border-color: var(--ink-800); box-shadow: 0 0 0 3px rgba(43,45,51,.07); }
.pr-composer-foot { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.pr-identity { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.pr-anon { flex: none; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--ink-200); background: var(--white); color: var(--ink-500); transition: all .15s var(--ease-standard); white-space: nowrap; }
.pr-anon svg { opacity: 0; width: 0; margin-right: -6px; transition: opacity .15s var(--ease-standard); }
.pr-anon.on { background: var(--ink-900); border-color: var(--ink-900); color: var(--white); }
.pr-anon.on svg { opacity: 1; width: 14px; margin-right: 0; }
.pr-name { flex: 1; min-width: 0; border: 1.5px solid var(--ink-200); border-radius: 999px; height: 40px; padding: 0 15px; font-family: inherit; font-size: 14px; color: var(--ink-800); outline: none; transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard); }
.pr-name::placeholder { color: var(--ink-300); }
.pr-name:focus { border-color: var(--ink-800); }
.pr-name:disabled { background: var(--ink-50); color: var(--ink-300); }
.pr-send { flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 600; height: 40px; padding: 0 20px; border: none; border-radius: 999px; background: var(--raif-yellow); color: var(--ink-900); transition: background .2s var(--ease-standard), transform .12s var(--ease-standard), opacity .2s var(--ease-standard); }
.pr-send:hover:not(:disabled) { background: var(--raif-yellow-deep); }
.pr-send:active:not(:disabled) { transform: scale(.97); }
.pr-send:disabled { opacity: .45; cursor: default; }
`
