/* eslint-disable */
// @ts-nocheck
'use client'

import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Админ-панель — 1:1 port of the editor/control screen from the owner's Claude
// Design (Есть вопросы.dc.html, data-builder → data-screen="editor"). Share card
// (link/code/QR) + activity tabs + edit prompt + launch + «Открыть экран
// участника» + magic-link «Войти». Verbatim markup + the design's own
// _setupBuilder script, adapted into an effect. Opens straight on the editor
// (Q&A) since the event already exists. Backend wiring comes next.
// ---------------------------------------------------------------------------

const STYLE = "  @keyframes pulseHeroIn { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: none; } }\n  @keyframes pulseFloatA { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(6deg); } }\n  @keyframes pulseFloatB { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(14px) rotate(-8deg); } }\n  @keyframes pulseMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }\n  @keyframes pulseLive { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.7); } }\n  @keyframes suLive { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .3; transform: scale(.65); } }\n  @keyframes suPop { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }\n  @keyframes suFloatA { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(6deg); } }\n  @keyframes suFloatB { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(14px) rotate(-8deg); } }\n  .su-edit { font-family: inherit; border: none; background: transparent; outline: none; width: 100%; color: var(--ink-800); }\n  .su-edit::placeholder { color: var(--ink-300); }\n  @media (max-width: 860px) {\n    nav[style*=\"gap: 36px\"] { display: none !important; }\n    [style*=\"repeat(4, 1fr)\"] { grid-template-columns: 1fr 1fr !important; }\n  }\n  @media (max-width: 760px) {\n    [style*=\"repeat(3, 1fr)\"] { grid-template-columns: 1fr !important; gap: 28px !important; }\n    [style*=\"1.05fr 0.95fr\"] { grid-template-columns: 1fr !important; }\n    [style*=\"min-height: 560px\"] { min-height: 0 !important; }\n    [style*=\"grid-auto-rows: 1fr\"] { grid-auto-rows: auto !important; }\n  }\n  @media (max-width: 460px) {\n    [style*=\"repeat(4, 1fr)\"] { grid-template-columns: 1fr !important; }\n    [style*=\"grid-template-columns: 1fr 1fr; gap: 10px\"] { grid-template-columns: 1fr !important; }\n  }"
const MARKUP = "<div data-r=\"builder\" data-builder style=\"position: relative; min-height: 100vh; display: flex; flex-direction: column; background: var(--ink-100);\">\n\n  <!-- dialog peeking behind the top bar -->\n  <div aria-hidden=\"true\" style=\"position: absolute; top: -22px; left: 50%; transform: translateX(-50%); z-index: 1; width: 150px; opacity: 0.5; pointer-events: none;\"><svg viewBox=\"0 0 120 120\" width=\"100%\" height=\"100%\" style=\"overflow: visible;\"><path d=\"M 24 10 H 96 Q 114 10 114 28 V 62 Q 114 80 96 80 H 58 L 40 106 L 38 80 H 24 Q 6 80 6 62 V 28 Q 6 10 24 10 Z\" fill=\"var(--porto-30)\"></path><circle cx=\"42\" cy=\"45\" r=\"5\" fill=\"var(--porto-text)\"></circle><circle cx=\"60\" cy=\"45\" r=\"5\" fill=\"var(--porto-text)\"></circle><circle cx=\"78\" cy=\"45\" r=\"5\" fill=\"var(--porto-text)\"></circle></svg></div>\n\n  <!-- ===================== TOP BAR ===================== -->\n  <header style=\"position: sticky; top: 0; z-index: 30; flex: none; height: 60px; background: rgba(255,255,255,0.72); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.7); box-shadow: 0 1px 0 rgba(33,28,44,0.04); display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(14px, 3vw, 26px);\">\n    <div style=\"display: flex; align-items: center; gap: 14px; min-width: 0;\">\n      <a href=\"/\" data-go-landing data-hover style=\"display: inline-flex; text-decoration: none; flex: none;\">\n        <span style=\"position: relative; display: inline-flex; align-items: center; padding: 7px 13px; background: var(--sochi-35); border-radius: 11px; font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: var(--sochi-text); white-space: nowrap;\">Есть вопросы<span style=\"position: absolute; bottom: -6px; right: 16px; width: 0; height: 0; border-left: 9px solid transparent; border-right: 5px solid transparent; border-top: 9px solid var(--sochi-35);\"></span></span>\n      </a>\n      <span style=\"width: 1px; height: 24px; background: var(--ink-200); flex: none;\"></span>\n      <input data-session-name aria-label=\"Название сессии\" class=\"su-edit\" style=\"font-size: 15px; font-weight: 500; max-width: 220px; padding: 6px 8px; border-radius: 8px;\">\n    </div>\n    <div style=\"display: flex; align-items: center; gap: 14px;\">\n      <span data-hover style=\"display: none; align-items: center; gap: 6px; font-size: 14px; color: var(--ink-600); cursor: pointer;\">RU</span>\n      <button data-open-auth data-pro-key=\"account\" data-hover style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 600; color: var(--ink-800); background: var(--white); border: 1.5px solid var(--ink-200); border-radius: 999px; padding: 8px 18px; transition: border-color .2s var(--ease-standard);\">Войти</button>\n    </div>\n  </header>\n\n  <!-- ===================== STEP 1: SETUP / CHOOSER ===================== -->\n  <div data-screen=\"setup\" style=\"position: relative; flex: 1; display: none; flex-direction: column; align-items: center; justify-content: center; padding: clamp(30px, 6vh, 64px) 20px; overflow: hidden;\">\n\n    <!-- dotted board + floating shapes backdrop -->\n    <div aria-hidden=\"true\" style=\"position: absolute; inset: 0; pointer-events: none; background-color: var(--ink-100); background-image: radial-gradient(#cfd1d1 1.4px, transparent 1.5px); background-size: 24px 24px;\"></div>\n    <div aria-hidden=\"true\" style=\"position: absolute; inset: 0; pointer-events: none; overflow: hidden;\">\n      <div style=\"position: absolute; top: 13%; left: 7%; width: 120px; height: 120px; animation: suFloatA 7s var(--ease-standard) infinite; display: flex; align-items: center; justify-content: center;\"><span style=\"font-size: 116px; font-weight: 600; line-height: 1; color: var(--raif-yellow); transform: rotate(-8deg);\">?</span></div>\n      <div style=\"position: absolute; top: 16%; right: 8%; width: 132px; height: 132px; animation: suFloatB 9s var(--ease-standard) infinite;\"><svg viewBox=\"0 0 120 120\" width=\"100%\" height=\"100%\" style=\"overflow: visible;\"><path d=\"M 24 10 H 96 Q 114 10 114 28 V 62 Q 114 80 96 80 H 58 L 40 106 L 38 80 H 24 Q 6 80 6 62 V 28 Q 6 10 24 10 Z\" fill=\"var(--sochi-35)\"></path><circle cx=\"42\" cy=\"45\" r=\"5\" fill=\"var(--sochi-text)\"></circle><circle cx=\"60\" cy=\"45\" r=\"5\" fill=\"var(--sochi-text)\"></circle><circle cx=\"78\" cy=\"45\" r=\"5\" fill=\"var(--sochi-text)\"></circle></svg></div>\n      <div style=\"position: absolute; bottom: 18%; left: 11%; width: 70px; height: 70px; animation: suFloatB 6.5s var(--ease-standard) infinite; border-radius: 999px; background: var(--paris-30);\"></div>\n      <div style=\"position: absolute; bottom: 14%; right: 14%; width: 56px; height: 56px; animation: suFloatA 8s var(--ease-standard) infinite; border-radius: 999px; border: 3px solid var(--ink-800);\"></div>\n      <div style=\"position: absolute; top: 62%; right: 5%; width: 44px; height: 44px; animation: suFloatA 7.5s var(--ease-standard) infinite; border-radius: 999px; background: var(--manila-35);\"></div>\n      <div style=\"position: absolute; top: 8%; left: 36%; width: 30px; height: 30px; animation: suFloatB 10s var(--ease-standard) infinite; border-radius: 8px; background: var(--porto-30);\"></div>\n      <div style=\"position: absolute; bottom: 8%; left: 30%; width: 128px; height: 96px; animation: suFloatA 8.5s var(--ease-standard) infinite;\"><svg viewBox=\"0 0 128 96\" width=\"100%\" height=\"100%\" style=\"overflow: visible;\"><path d=\"M 22 8 H 106 Q 124 8 124 26 V 56 Q 124 74 106 74 H 52 L 30 92 L 33 74 H 22 Q 4 74 4 56 V 26 Q 4 8 22 8 Z\" fill=\"var(--porto-30)\"></path><circle cx=\"44\" cy=\"42\" r=\"5.5\" fill=\"var(--ink-800)\"></circle><circle cx=\"64\" cy=\"42\" r=\"5.5\" fill=\"var(--ink-800)\"></circle><circle cx=\"84\" cy=\"42\" r=\"5.5\" fill=\"var(--ink-800)\"></circle></svg></div>\n      <div style=\"position: absolute; top: 56%; left: 6%; width: 94px; height: 94px; animation: suFloatB 8.5s var(--ease-standard) infinite;\"><div style=\"width: 100%; height: 100%; transform: rotate(-6deg); background: var(--manila-35); border-radius: 4px; box-shadow: var(--shadow-md); padding: 16px 14px; display: flex; flex-direction: column; gap: 8px;\"><span style=\"display: block; height: 5px; width: 72%; border-radius: 3px; background: rgba(28,91,95,.42);\"></span><span style=\"display: block; height: 5px; width: 92%; border-radius: 3px; background: rgba(28,91,95,.28);\"></span><span style=\"display: block; height: 5px; width: 56%; border-radius: 3px; background: rgba(28,91,95,.28);\"></span></div></div>\n      <div style=\"position: absolute; top: 38%; right: 12%; width: 80px; height: 80px; animation: suFloatA 9.5s var(--ease-standard) infinite;\"><div style=\"width: 100%; height: 100%; transform: rotate(7deg); background: var(--raif-yellow); border-radius: 4px; box-shadow: var(--shadow-md); padding: 14px 13px; display: flex; flex-direction: column; gap: 7px;\"><span style=\"display: block; height: 5px; width: 64%; border-radius: 3px; background: rgba(33,28,44,.32);\"></span><span style=\"display: block; height: 5px; width: 88%; border-radius: 3px; background: rgba(33,28,44,.2);\"></span><span style=\"display: block; height: 5px; width: 50%; border-radius: 3px; background: rgba(33,28,44,.2);\"></span></div></div>\n    </div>\n\n    <div style=\"position: relative; z-index: 2; display: flex; flex-wrap: wrap; width: 100%; max-width: 900px; background: var(--white); border-radius: 28px; box-shadow: 0 36px 90px rgba(33,28,44,.30); overflow: hidden;\">\n\n      <!-- left: soft tinted panel — name + launch -->\n      <div style=\"flex: 1 1 340px; background: var(--sochi-15); color: var(--ink-800); padding: clamp(34px, 4vw, 52px); display: flex; flex-direction: column;\">\n        <div style=\"font-size: 12px; letter-spacing: 0.06em; color: var(--sochi-text); margin-bottom: 18px;\">ШАГ 1 ИЗ 2</div>\n        <h1 style=\"font-size: clamp(27px, 3vw, 33px); font-weight: 500; letter-spacing: -0.02em; line-height: 1.14; margin: 0 0 14px; color: var(--ink-800);\">Как назовём событие?</h1>\n        <p style=\"font-size: 14px; line-height: 1.55; color: var(--ink-500); margin: 0 0 30px;\">Название увидят участники при входе по коду.</p>\n        <input data-setup-name placeholder=\"Сессия команды\" aria-label=\"Название события\" style=\"width: 100%; appearance: none; -webkit-appearance: none; border: 1.5px solid var(--white); background: var(--white); border-radius: 14px; padding: 0 18px; height: 58px; font-family: inherit; font-size: 17px; font-weight: 500; color: var(--ink-800); outline: none; transition: border-color .2s var(--ease-standard), box-shadow .2s var(--ease-standard);\">\n        <div style=\"flex: 1; min-height: 40px;\"></div>\n        <button data-continue style=\"width: 100%; appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 9px; border: none; background: var(--raif-yellow); color: var(--ink-900); font-size: 16px; font-weight: 600; border-radius: 999px; height: 56px; transition: background .2s var(--ease-standard), transform .12s var(--ease-standard), opacity .2s var(--ease-standard);\">Запустить<span data-continue-count style=\"font-weight: 500; opacity: .7;\"></span><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M13 6l6 6-6 6\"></path></svg></button>\n      </div>\n\n      <!-- right: choices -->\n      <div style=\"flex: 1 1 380px; padding: clamp(34px, 4vw, 52px);\">\n        <div style=\"font-size: 16px; font-weight: 600; color: var(--ink-800); margin-bottom: 24px;\">Что запустить?</div>\n        <div style=\"display: flex; flex-direction: column; gap: 14px;\">\n          <!-- 1. Q&A -->\n          <button data-choose=\"qa\" class=\"su-choose\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 16px; width: 100%; text-align: left; background: var(--ink-50); border: none; border-radius: 16px; padding: 18px 20px; transition: border-color .2s var(--ease-standard), box-shadow .2s var(--ease-standard), transform .12s var(--ease-standard);\">\n            <span style=\"flex: none; width: 42px; height: 42px; border-radius: 12px; background: var(--raif-yellow); display: flex; align-items: center; justify-content: center; color: var(--ink-900);\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path></svg></span>\n            <span style=\"flex: 1; min-width: 0;\"><span style=\"display: block; font-size: 16px; font-weight: 600; color: var(--ink-800);\">Q&amp;A сессия</span><span style=\"display: block; font-size: 13px; color: var(--ink-500);\">Вопросы от участников и голоса</span></span>\n            <span class=\"su-check\" style=\"flex: none; width: 24px; height: 24px; border-radius: 7px; border: 2px solid var(--ink-200); background: var(--white); display: flex; align-items: center; justify-content: center; color: var(--white); transition: background .2s var(--ease-standard), border-color .2s var(--ease-standard);\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span>\n          </button>\n          <!-- 2. Опрос -->\n          <button data-choose=\"poll\" class=\"su-choose\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 16px; width: 100%; text-align: left; background: var(--ink-50); border: none; border-radius: 16px; padding: 18px 20px; transition: border-color .2s var(--ease-standard), box-shadow .2s var(--ease-standard), transform .12s var(--ease-standard);\">\n            <span style=\"flex: none; width: 42px; height: 42px; border-radius: 12px; background: var(--sochi-15); display: flex; align-items: center; justify-content: center; color: var(--sochi-text);\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 14v5M12 9v10M17 5v14\"></path></svg></span>\n            <span style=\"flex: 1; min-width: 0;\"><span style=\"display: block; font-size: 16px; font-weight: 600; color: var(--ink-800);\">Опрос</span><span style=\"display: block; font-size: 13px; color: var(--ink-500);\">Голосование с живыми результатами</span></span>\n            <span class=\"su-check\" style=\"flex: none; width: 24px; height: 24px; border-radius: 7px; border: 2px solid var(--ink-200); background: var(--white); display: flex; align-items: center; justify-content: center; color: var(--white); transition: background .2s var(--ease-standard), border-color .2s var(--ease-standard);\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span>\n          </button>\n          <!-- 3. Квиз — PRO locked -->\n          <button data-open-auth data-pro-key=\"quiz\" class=\"su-choose-locked\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 16px; width: 100%; text-align: left; background: var(--ink-50); border: none; border-radius: 16px; padding: 18px 20px; transition: background .2s var(--ease-standard);\">\n            <span style=\"flex: none; width: 42px; height: 42px; border-radius: 12px; background: var(--ink-200); display: flex; align-items: center; justify-content: center; color: var(--ink-500);\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.1 9a3 3 0 1 1 5.8 1c-.4 1.4-2 2-2.9 3-.3.5-.5 1-.5 1.7\"></path><circle cx=\"12\" cy=\"18\" r=\"0.6\" fill=\"currentColor\"></circle></svg></span>\n            <span style=\"flex: 1; min-width: 0;\"><span style=\"display: block; font-size: 16px; font-weight: 600; color: var(--ink-600);\">Квиз</span><span style=\"display: block; font-size: 13px; color: var(--ink-400);\">Викторина с очками и лидерами</span></span>\n            <span style=\"flex: none; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: var(--ink-600); background: var(--white); border: 1px solid var(--ink-200); border-radius: 999px; padding: 5px 9px;\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"></path></svg>PRO</span>\n          </button>\n          <!-- 4. Облако слов — PRO locked -->\n          <button data-open-auth data-pro-key=\"wordcloud\" class=\"su-choose-locked\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 16px; width: 100%; text-align: left; background: var(--ink-50); border: none; border-radius: 16px; padding: 18px 20px; transition: background .2s var(--ease-standard);\">\n            <span style=\"flex: none; width: 42px; height: 42px; border-radius: 12px; background: var(--ink-200); display: flex; align-items: center; justify-content: center; color: var(--ink-500);\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 8h7M14 8h6M4 12h4M11 12h9M4 16h10M17 16h3\"></path></svg></span>\n            <span style=\"flex: 1; min-width: 0;\"><span style=\"display: block; font-size: 16px; font-weight: 600; color: var(--ink-600);\">Облако слов</span><span style=\"display: block; font-size: 13px; color: var(--ink-400);\">Ответы складываются в живое облако</span></span>\n            <span style=\"flex: none; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: var(--ink-600); background: var(--white); border: 1px solid var(--ink-200); border-radius: 999px; padding: 5px 9px;\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"></path></svg>PRO</span>\n          </button>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <!-- ===================== STEP 2: WORKSPACE ===================== -->\n  <div data-screen=\"editor\" style=\"position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; gap: 16px; padding: clamp(16px, 3vw, 30px); max-width: 1080px; width: 100%; margin: 0 auto;\">\n\n    <!-- ========== SHARE BANNER (FREE) — invite participants ========== -->\n    <div style=\"background: var(--white); border-radius: 20px; box-shadow: 0 12px 36px rgba(33,28,44,.10); padding: clamp(20px, 2.6vw, 26px);\">\n      <!-- header row -->\n      <div style=\"display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding-bottom: 18px; border-bottom: 1px solid var(--ink-100);\">\n        <div style=\"flex: 1; min-width: 240px;\">\n          <div style=\"font-size: clamp(19px, 2.2vw, 22px); font-weight: 600; color: var(--ink-800); letter-spacing: -0.01em;\">Событие создано — пора пригласить участников</div>\n          <div style=\"font-size: 14px; color: var(--ink-500); margin-top: 3px;\">Участникам не нужна регистрация — достаточно открыть ссылку, ввести код или навести камеру. Активности запускаете вы — по кнопке на нужной.</div>\n        </div>\n        <a href=\"/e/QZ408\" target=\"_blank\" data-participant-link style=\"flex: none; display: flex; align-items: center; gap: 8px; text-decoration: none; font-size: 14px; font-weight: 600; color: var(--ink-700); border: 1.5px solid var(--ink-200); border-radius: 999px; height: 46px; padding: 0 20px; transition: border-color .2s var(--ease-standard), color .2s var(--ease-standard);\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 3h7v7\"></path><path d=\"M10 14L21 3\"></path><path d=\"M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5\"></path></svg>Открыть экран участника</a>\n      </div>\n      <!-- three methods -->\n      <div style=\"display: flex; align-items: stretch; gap: 0; flex-wrap: wrap; padding-top: 18px;\">\n        <!-- link -->\n        <div style=\"flex: 1; min-width: 220px; padding-right: 26px;\">\n          <div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 8px;\"><span style=\"flex: none; width: 26px; height: 26px; border-radius: 8px; background: var(--sochi-15); display: flex; align-items: center; justify-content: center; color: var(--sochi-text);\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1\"></path><path d=\"M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1\"></path></svg></span><span style=\"font-size: 13px; font-weight: 600; color: var(--ink-700);\">Ссылка</span></div>\n          <div style=\"font-size: 12px; color: var(--ink-400); line-height: 1.4; margin-bottom: 10px;\">Отправьте в чат, письмо или мессенджер</div>\n          <span data-copy-link title=\"Нажмите, чтобы скопировать\" style=\"cursor: pointer; display: inline-flex; align-items: center; gap: 8px; max-width: 100%; background: var(--ink-50); border-radius: 10px; padding: 0 13px; height: 42px; font-size: 14px; font-weight: 500; color: var(--ink-700); transition: background .15s var(--ease-standard);\"><span data-share-link style=\"overflow: hidden; white-space: nowrap; text-overflow: ellipsis;\">qanda.online/QZ408</span><svg data-copy-link-icon width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none; opacity: .5;\"><rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2\"></rect><path d=\"M5 15V5a2 2 0 0 1 2-2h10\"></path></svg></span>\n        </div>\n        <div style=\"width: 1px; background: var(--ink-100);\"></div>\n        <!-- code -->\n        <div style=\"flex: 1; min-width: 200px; padding: 0 26px;\">\n          <div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 8px;\"><span style=\"flex: none; width: 26px; height: 26px; border-radius: 8px; background: var(--manila-15); display: flex; align-items: center; justify-content: center; color: var(--manila-text);\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h2M11 10h2M15 10h2M7 14h10\"></path></svg></span><span style=\"font-size: 13px; font-weight: 600; color: var(--ink-700);\">Код</span></div>\n          <div style=\"font-size: 12px; color: var(--ink-400); line-height: 1.4; margin-bottom: 10px;\">Участники вводят его на qanda.online</div>\n          <div style=\"display: flex; align-items: center; gap: 10px;\">\n            <span data-copy-code title=\"Нажмите, чтобы скопировать\" style=\"cursor: pointer; display: inline-flex; align-items: center; gap: 9px;\"><span data-code style=\"font-size: 30px; font-weight: 600; letter-spacing: 0.1em; color: var(--ink-800); line-height: 1; font-family: var(--font-brand);\">QZ408</span><svg data-copy-code-icon width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--ink-400)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: none;\"><rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2\"></rect><path d=\"M5 15V5a2 2 0 0 1 2-2h10\"></path></svg></span>\n          </div>\n        </div>\n        <div style=\"width: 1px; background: var(--ink-100);\"></div>\n        <!-- qr -->\n        <div style=\"flex: none; padding-left: 26px; display: flex; gap: 14px; align-items: flex-start;\">\n          <div>\n            <div style=\"display: flex; align-items: center; gap: 8px; margin-bottom: 8px;\"><span style=\"flex: none; width: 26px; height: 26px; border-radius: 8px; background: var(--porto-15); display: flex; align-items: center; justify-content: center; color: var(--porto-text);\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"></rect><path d=\"M14 14h3v3M21 14v7h-7\"></path></svg></span><span style=\"font-size: 13px; font-weight: 600; color: var(--ink-700);\">QR-код</span></div>\n            <div style=\"font-size: 12px; color: var(--ink-400); line-height: 1.4; max-width: 150px;\">Покажите на экране зала — наведут камеру и зайдут</div>\n          </div>\n          <div data-qr style=\"flex: none; width: 76px; height: 76px; background: var(--white); border: 1px solid var(--ink-200); border-radius: 12px; padding: 6px;\"></div>\n        </div>\n      </div>\n    </div>\n\n    <!-- ========== activity tabs ========== -->\n    <div style=\"display: flex; align-items: center; gap: 12px; flex-wrap: wrap;\">\n      <button data-back-setup data-hover title=\"Сменить тип\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; flex: none; border: none; background: var(--white); box-shadow: var(--shadow-sm); border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--ink-600); transition: color .2s var(--ease-standard);\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 18l-6-6 6-6\"></path></svg></button>\n      <div data-tabs style=\"display: flex; gap: 6px; background: var(--white); border-radius: 16px; padding: 6px; box-shadow: var(--shadow-sm); width: max-content; max-width: 100%;\"></div>\n      <div style=\"position: relative; flex: none;\">\n        <button data-add-act title=\"Добавить активность\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; border: 1.5px dashed var(--ink-300); background: var(--white); border-radius: 13px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--ink-500); transition: border-color .2s var(--ease-standard), color .2s var(--ease-standard);\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 5v14M5 12h14\"></path></svg></button>\n        <div data-add-menu style=\"display: none; position: absolute; top: 52px; left: 0; z-index: 20; width: 244px; background: var(--white); border: 1px solid var(--ink-200); border-radius: 16px; box-shadow: var(--shadow-lg); padding: 8px;\"></div>\n      </div>\n    </div>\n    <div data-empty-activities style=\"display: none;\"></div>\n\n    <!-- ========== editor card ========== -->\n    <div style=\"background: var(--white); border-radius: 24px; box-shadow: var(--shadow-sm); padding: clamp(22px, 3vw, 34px); min-height: 360px;\">\n      <div style=\"display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 16px;\">\n        <div style=\"display: flex; align-items: center; gap: 12px;\">\n          <div data-eyebrow style=\"font-size: 12px; letter-spacing: 0.05em; color: var(--ink-400);\">ОПРОС · РЕДАКТИРОВАНИЕ</div>\n          <span data-live-row style=\"display: none; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: #c2410c; background: rgba(229,72,77,.1); border-radius: 999px; padding: 4px 11px;\"><span style=\"width: 7px; height: 7px; border-radius: 999px; background: #e5484d; animation: suLive 1.5s ease-in-out infinite;\"></span>В эфире · <span data-live-count>1</span></span>\n        </div>\n        <button data-launch style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 9px; border: none; background: var(--raif-yellow); color: var(--ink-900); font-size: 15px; font-weight: 600; border-radius: 999px; height: 46px; padding: 0 22px; transition: background .2s var(--ease-standard), transform .12s var(--ease-standard);\"><svg data-launch-icon width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M8 5v14l11-7z\"></path></svg><span data-launch-label>Запустить опрос</span></button>\n      </div>\n      <input data-question placeholder=\"Введите вопрос\" aria-label=\"Текст вопроса\" class=\"su-edit\" style=\"font-size: clamp(22px, 3vw, 30px); font-weight: 500; letter-spacing: -0.02em; line-height: 1.15; padding: 6px 8px; border-radius: 10px; margin-bottom: 22px; transition: background .15s var(--ease-standard);\">\n\n      <!-- POLL / QUIZ options -->\n      <div data-options-wrap>\n        <div data-options style=\"display: flex; flex-direction: column; gap: 10px;\"></div>\n        <button data-add-option style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 9px; margin-top: 12px; border: 1.5px dashed var(--ink-200); background: var(--white); border-radius: 14px; padding: 13px 16px; width: 100%; font-size: 15px; font-weight: 500; color: var(--ink-500); transition: border-color .2s var(--ease-standard), color .2s var(--ease-standard);\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"></path></svg>Добавить вариант</button>\n        <div data-quiz-tip style=\"display: none; align-items: center; gap: 9px; margin-top: 16px; font-size: 13px; color: var(--ink-500); background: var(--sochi-15); border-radius: 12px; padding: 12px 14px;\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--sochi-text)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6L9 17l-5-5\"></path></svg>Отметьте галочкой правильный ответ — за него участники получат очки.</div>\n      </div>\n\n      <!-- Q&A preview -->\n      <div data-qa-wrap style=\"display: none;\">\n        <div style=\"display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 40px 24px; background: var(--ink-50); border-radius: 18px;\">\n          <span style=\"width: 56px; height: 56px; border-radius: 16px; background: var(--white); display: flex; align-items: center; justify-content: center; color: var(--ink-400);\"><svg width=\"26\" height=\"26\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path></svg></span>\n          <div>\n            <div style=\"font-size: 16px; font-weight: 600; color: var(--ink-700); margin-bottom: 5px;\">Событие готово — ждём участников</div>\n            <div style=\"font-size: 14px; color: var(--ink-400); line-height: 1.45; max-width: 340px;\">Отправьте ссылку, код или QR из панели сверху. Как только участники подключатся, их вопросы и голоса появятся здесь в реальном времени.</div>\n          </div>\n        </div>\n        <div style=\"display: flex; align-items: center; gap: 9px; margin-top: 16px; font-size: 13px; color: var(--ink-500); background: var(--ink-50); border-radius: 12px; padding: 12px 14px;\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--ink-500)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 8v4M12 16h.01\"></path></svg>Участники задают вопросы и голосуют за них с экрана. Включите модерацию в PRO, чтобы одобрять вопросы перед показом.</div>\n      </div>\n    </div>\n\n    <!-- ========== PRO card (full width) ========== -->\n    <div style=\"display: none; background: var(--ink-900); border-radius: 24px; padding: clamp(22px, 3vw, 30px); color: var(--white);\">\n      <div style=\"display: flex; align-items: center; gap: 9px; margin-bottom: 6px;\">\n        <span style=\"font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--ink-900); background: var(--raif-lime); border-radius: 6px; padding: 3px 8px;\">PRO</span>\n        <span style=\"font-size: 13px; color: rgba(255,255,255,.55);\">после регистрации</span>\n      </div>\n      <h3 style=\"font-size: 20px; font-weight: 500; letter-spacing: -0.01em; margin: 0 0 4px;\">Больше контроля</h3>\n      <p style=\"font-size: 14px; line-height: 1.5; color: rgba(255,255,255,.6); margin: 0 0 20px;\">Базовые опросы и Q&amp;A — бесплатно навсегда. Зарегистрируйтесь, чтобы открыть:</p>\n\n      <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; margin-bottom: 22px;\">\n        <button data-open-auth data-pro-key=\"design\" class=\"su-pro-row\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 13px; width: 100%; text-align: left; border: none; background: rgba(255,255,255,.06); border-radius: 14px; padding: 14px; color: var(--white); transition: background .2s var(--ease-standard);\">\n          <span style=\"flex: none; width: 38px; height: 38px; border-radius: 11px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center;\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--raif-lime)\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"13.5\" cy=\"6.5\" r=\"1.5\"></circle><circle cx=\"17.5\" cy=\"10.5\" r=\"1.5\"></circle><circle cx=\"8.5\" cy=\"7.5\" r=\"1.5\"></circle><circle cx=\"6.5\" cy=\"12.5\" r=\"1.5\"></circle><path d=\"M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3A4.4 4.4 0 0 0 22 11c0-5-4.5-9-10-9z\"></path></svg></span>\n          <span style=\"flex: 1; min-width: 0;\"><span style=\"display: block; font-size: 15px; font-weight: 600;\">Дизайн и темы</span><span style=\"display: block; font-size: 12px; color: rgba(255,255,255,.5);\">Свои цвета, логотип, фон</span></span>\n          <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,.4)\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 6l6 6-6 6\"></path></svg>\n        </button>\n        <button data-open-auth data-pro-key=\"password\" class=\"su-pro-row\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 13px; width: 100%; text-align: left; border: none; background: rgba(255,255,255,.06); border-radius: 14px; padding: 14px; color: var(--white); transition: background .2s var(--ease-standard);\">\n          <span style=\"flex: none; width: 38px; height: 38px; border-radius: 11px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center;\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--raif-lime)\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"></path></svg></span>\n          <span style=\"flex: 1; min-width: 0;\"><span style=\"display: block; font-size: 15px; font-weight: 600;\">Пароль от мероприятия</span><span style=\"display: block; font-size: 12px; color: rgba(255,255,255,.5);\">Только для своей команды</span></span>\n          <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,.4)\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 6l6 6-6 6\"></path></svg>\n        </button>\n        <button data-open-auth data-pro-key=\"moderation\" class=\"su-pro-row\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 13px; width: 100%; text-align: left; border: none; background: rgba(255,255,255,.06); border-radius: 14px; padding: 14px; color: var(--white); transition: background .2s var(--ease-standard);\">\n          <span style=\"flex: none; width: 38px; height: 38px; border-radius: 11px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center;\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--raif-lime)\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 12l2 2 4-4\"></path><path d=\"M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z\"></path></svg></span>\n          <span style=\"flex: 1; min-width: 0;\"><span style=\"display: block; font-size: 15px; font-weight: 600;\">Модерация вопросов</span><span style=\"display: block; font-size: 12px; color: rgba(255,255,255,.5);\">Одобряйте перед показом</span></span>\n          <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,.4)\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 6l6 6-6 6\"></path></svg>\n        </button>\n      </div>\n\n      <button data-open-auth data-pro-key=\"signup\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; border: none; background: var(--raif-yellow); color: var(--ink-900); font-size: 15px; font-weight: 600; border-radius: 999px; height: 50px; padding: 0 30px; transition: background .2s var(--ease-standard);\">Зарегистрироваться бесплатно</button>\n    </div>\n  </div>\n\n  <!-- ===================== AUTH MODAL ===================== -->\n  <div data-auth style=\"display: none; position: fixed; inset: 0; z-index: 100; align-items: flex-start; justify-content: center; padding: clamp(20px, 6vh, 64px) 20px; background: rgba(33,28,44,.5); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); overflow-y: auto;\">\n    <div data-auth-card style=\"width: 100%; max-width: 800px; background: var(--white); border-radius: 28px; box-shadow: 0 36px 90px rgba(33,28,44,.34); overflow: hidden; display: flex; flex-wrap: wrap; animation: suPop .4s var(--ease-standard);\">\n\n      <!-- LEFT: value panel -->\n      <div style=\"flex: 1 1 300px; position: relative; overflow: hidden; background: var(--ink-900); color: var(--white); padding: clamp(28px, 3.5vw, 40px); display: flex; flex-direction: column;\">\n        <div aria-hidden=\"true\" style=\"position: absolute; bottom: -34px; right: -26px; width: 150px; opacity: 0.55; pointer-events: none;\"><svg viewBox=\"0 0 120 120\" width=\"100%\" height=\"100%\" style=\"overflow: visible;\"><path d=\"M 24 10 H 96 Q 114 10 114 28 V 62 Q 114 80 96 80 H 58 L 40 106 L 38 80 H 24 Q 6 80 6 62 V 28 Q 6 10 24 10 Z\" fill=\"rgba(189,255,0,.16)\"></path><circle cx=\"42\" cy=\"45\" r=\"5\" fill=\"var(--raif-lime)\"></circle><circle cx=\"60\" cy=\"45\" r=\"5\" fill=\"var(--raif-lime)\"></circle><circle cx=\"78\" cy=\"45\" r=\"5\" fill=\"var(--raif-lime)\"></circle></svg></div>\n        <div style=\"display: flex; align-items: center; gap: 9px; margin-bottom: clamp(22px, 5vh, 38px); position: relative;\">\n          <span style=\"position: relative; display: inline-flex; align-items: center; padding: 7px 13px; background: var(--sochi-35); border-radius: 11px; font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: var(--sochi-text); white-space: nowrap;\">Есть вопросы<span style=\"position: absolute; bottom: -6px; right: 16px; width: 0; height: 0; border-left: 9px solid transparent; border-right: 5px solid transparent; border-top: 9px solid var(--sochi-35);\"></span></span>\n        </div>\n        <h2 style=\"font-size: clamp(21px, 2.5vw, 26px); font-weight: 500; letter-spacing: -0.02em; line-height: 1.2; margin: 0 0 24px; position: relative;\">Создавайте события бесплатно. PRO открывает больше.</h2>\n        <div style=\"display: flex; flex-direction: column; gap: 14px; position: relative;\">\n          <div style=\"display: flex; align-items: center; gap: 11px;\"><span style=\"flex: none; width: 22px; height: 22px; border-radius: 999px; background: rgba(189,255,0,.14); display: flex; align-items: center; justify-content: center;\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--raif-lime)\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span><span style=\"font-size: 14px; color: rgba(255,255,255,.82);\">Дизайн и темы под ваш бренд</span></div>\n          <div style=\"display: flex; align-items: center; gap: 11px;\"><span style=\"flex: none; width: 22px; height: 22px; border-radius: 999px; background: rgba(189,255,0,.14); display: flex; align-items: center; justify-content: center;\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--raif-lime)\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span><span style=\"font-size: 14px; color: rgba(255,255,255,.82);\">Пароль от мероприятия</span></div>\n          <div style=\"display: flex; align-items: center; gap: 11px;\"><span style=\"flex: none; width: 22px; height: 22px; border-radius: 999px; background: rgba(189,255,0,.14); display: flex; align-items: center; justify-content: center;\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--raif-lime)\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span><span style=\"font-size: 14px; color: rgba(255,255,255,.82);\">Модерация вопросов</span></div>\n          <div style=\"display: flex; align-items: center; gap: 11px;\"><span style=\"flex: none; width: 22px; height: 22px; border-radius: 999px; background: rgba(189,255,0,.14); display: flex; align-items: center; justify-content: center;\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--raif-lime)\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span><span style=\"font-size: 14px; color: rgba(255,255,255,.82);\">Квизы и облако слов</span></div>\n        </div>\n        <div style=\"flex: 1; min-height: 24px;\"></div>\n      </div>\n\n      <!-- RIGHT: form column -->\n      <div style=\"flex: 1 1 360px; position: relative; padding: clamp(28px, 4vw, 44px);\">\n        <button data-auth-close data-hover style=\"position: absolute; top: 18px; right: 18px; z-index: 2; appearance: none; -webkit-appearance: none; cursor: pointer; border: none; background: var(--ink-100); border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--ink-600); transition: background .2s var(--ease-standard);\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg></button>\n\n      <!-- STEP 1: email -->\n      <div data-step=\"email\">\n        <span data-auth-pill style=\"display: none; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: var(--sochi-text); background: var(--sochi-15); border-radius: 999px; padding: 6px 12px; margin-bottom: 14px; width: max-content;\"></span>\n        <h1 data-auth-title style=\"font-size: clamp(26px, 3.4vw, 34px); font-weight: 500; letter-spacing: -0.02em; line-height: 1.1; margin: 0 0 12px; color: var(--ink-800);\">Создайте бесплатный аккаунт</h1>\n        <p data-auth-sub style=\"font-size: 15px; line-height: 1.5; color: var(--ink-500); margin: 0 0 26px;\">Рекомендуем рабочую почту — так проще собрать команду в одном пространстве.</p>\n\n        <form data-su-form>\n          <div style=\"position: relative; margin-bottom: 10px;\">\n            <svg style=\"position: absolute; left: 18px; top: 50%; transform: translateY(-50%); pointer-events: none;\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--ink-300)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path></svg>\n            <input data-su-email type=\"email\" autocomplete=\"email\" placeholder=\"ivan@company.ru\" aria-label=\"Рабочий email\" style=\"width: 100%; appearance: none; -webkit-appearance: none; border: 1.5px solid var(--ink-200); background: var(--white); border-radius: 14px; padding: 0 18px 0 50px; height: 56px; font-family: inherit; font-size: 16px; color: var(--ink-800); outline: none; transition: border-color .2s var(--ease-standard), box-shadow .2s var(--ease-standard);\">\n          </div>\n          <div data-su-hint style=\"font-size: 13px; color: var(--ink-400); margin-bottom: 22px;\">Пароль не нужен — пришлём ссылку для входа.</div>\n          <button data-su-submit type=\"submit\" style=\"width: 100%; appearance: none; -webkit-appearance: none; border: none; cursor: pointer; background: var(--raif-yellow); color: var(--ink-900); font-family: inherit; font-size: 16px; font-weight: 600; border-radius: 999px; height: 56px; transition: background .2s var(--ease-standard), transform .12s var(--ease-standard);\">Продолжить с email</button>\n        </form>\n\n        <div style=\"display: flex; align-items: center; gap: 14px; margin: 24px 0;\"><span style=\"flex: 1; height: 1px; background: var(--ink-200);\"></span><span style=\"font-size: 13px; color: var(--ink-400);\">или</span><span style=\"flex: 1; height: 1px; background: var(--ink-200);\"></span></div>\n\n        <div style=\"display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;\">\n          <button data-sso style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--white); border: 1.5px solid var(--ink-200); border-radius: 14px; height: 50px; font-size: 13px; font-weight: 500; color: var(--ink-800); transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard);\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\"><path fill=\"#4285F4\" d=\"M21.6 12.2c0-.6-.1-1.2-.2-1.8H12v3.5h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z\"></path><path fill=\"#34A853\" d=\"M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z\"></path><path fill=\"#FBBC05\" d=\"M6.4 14a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 9z\"></path><path fill=\"#EA4335\" d=\"M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.6l3.3 2.6C7.2 7.8 9.4 5.9 12 5.9z\"></path></svg>Google</button>\n          <button data-sso style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--white); border: 1.5px solid var(--ink-200); border-radius: 14px; height: 50px; font-size: 13px; font-weight: 500; color: var(--ink-800); transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard);\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\"><rect x=\"1\" y=\"1\" width=\"10\" height=\"10\" fill=\"#F25022\"></rect><rect x=\"13\" y=\"1\" width=\"10\" height=\"10\" fill=\"#7FBA00\"></rect><rect x=\"1\" y=\"13\" width=\"10\" height=\"10\" fill=\"#00A4EF\"></rect><rect x=\"13\" y=\"13\" width=\"10\" height=\"10\" fill=\"#FFB900\"></rect></svg>Microsoft</button>\n          <button data-sso style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--white); border: 1.5px solid var(--ink-200); border-radius: 14px; height: 50px; font-size: 13px; font-weight: 500; color: var(--ink-800); transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard);\"><span style=\"width: 17px; height: 17px; border-radius: 999px; background: #FC3F1D; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 11px;\">Я</span>Яндекс</button>\n        </div>\n\n        <p style=\"font-size: 12px; line-height: 1.5; color: var(--ink-400); margin: 24px 0 0;\">Регистрируясь, вы принимаете <a href=\"#\" style=\"color: var(--sochi-text);\">Условия</a> и <a href=\"#\" style=\"color: var(--sochi-text);\">Политику конфиденциальности</a>.</p>\n      </div>\n\n      <!-- STEP 2: sent -->\n      <div data-step=\"sent\" style=\"display: none; text-align: center;\">\n        <div style=\"width: 68px; height: 68px; border-radius: 999px; background: var(--raif-yellow); display: flex; align-items: center; justify-content: center; margin: 6px auto 22px;\"><svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--ink-900)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path></svg></div>\n        <h1 style=\"font-size: clamp(24px, 3vw, 30px); font-weight: 500; letter-spacing: -0.02em; margin: 0 0 12px; color: var(--ink-800);\">Проверьте почту</h1>\n        <p style=\"font-size: 15px; line-height: 1.55; color: var(--ink-500); margin: 0 0 26px;\">Ссылка для входа отправлена на<br><strong data-su-target style=\"color: var(--ink-800);\">ваш email</strong>. Откройте её — и сразу вернётесь к своему опросу.</p>\n        <button data-su-open style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 600; color: var(--ink-900); background: var(--raif-yellow); border: none; border-radius: 999px; height: 52px; padding: 0 32px; transition: background .2s var(--ease-standard);\">Открыть почту</button>\n        <div style=\"margin-top: 18px;\"><button data-su-back style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; background: none; border: none; font-size: 14px; color: var(--ink-500); text-decoration: underline; text-underline-offset: 3px;\">Изменить email</button></div>\n      </div>\n      </div>\n    </div>\n  </div>\n</div>"

export default function AdminPanelPage() {
  const ref = useRef(null)
  const wired = useRef(false)

  useEffect(() => {
    const host = ref.current
    if (!host || wired.current) return
    wired.current = true
    const root = host.querySelector('[data-r="builder"]') || host
    const __hb = { _cleanup: [], _unmounted: false }

    if (!root) return;
    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];

    // ===== editable affordance: highlight inputs on focus =====
    $$('.su-edit, [data-question]').forEach((el) => {
      el.addEventListener('focus', () => { el.style.background = 'var(--ink-50)'; });
      el.addEventListener('blur', () => { el.style.background = 'transparent'; });
    });

    // ===== screens: setup -> editor =====
    const setupScreen = root.querySelector('[data-screen="setup"]');
    const editorScreen = root.querySelector('[data-screen="editor"]');
    const setupName = root.querySelector('[data-setup-name]');
    const sessionName = root.querySelector('[data-session-name]');
    if (setupName) {
      setupName.addEventListener('focus', () => { setupName.style.borderColor = 'var(--sochi-35)'; });
      setupName.addEventListener('blur', () => { setupName.style.borderColor = 'var(--white)'; });
    }
    const selected = new Set();
    const selOrder = ['qa', 'poll'];
    const selLabels = { qa: 'Q&A', poll: 'Опрос' };
    const continueBtn = root.querySelector('[data-continue]');
    const continueCount = root.querySelector('[data-continue-count]');
    const paintCard = (c) => {
      const on = selected.has(c.getAttribute('data-choose'));
      c.style.background = on ? 'var(--white)' : 'var(--ink-50)';
      c.style.boxShadow = on ? '0 4px 16px rgba(33,28,44,.10)' : 'none';
      const chk = c.querySelector('.su-check');
      if (chk) { chk.style.background = on ? 'var(--ink-900)' : 'var(--white)'; chk.style.borderColor = on ? 'var(--ink-900)' : 'var(--ink-200)'; }
    };
    const updateContinue = () => {
      const arr = selOrder.filter((k) => selected.has(k));
      if (continueCount) continueCount.textContent = arr.length ? ' · ' + arr.map((k) => selLabels[k]).join(', ') : '';
      const dis = arr.length === 0;
      if (continueBtn) { continueBtn.style.opacity = dis ? '.45' : '1'; continueBtn.style.pointerEvents = dis ? 'none' : 'auto'; }
    };
    [...root.querySelectorAll('.su-choose')].forEach((c) => {
      c.addEventListener('mouseenter', () => { if (!selected.has(c.getAttribute('data-choose'))) c.style.background = 'var(--ink-100)'; });
      c.addEventListener('mouseleave', () => { paintCard(c); });
      c.addEventListener('mousedown', () => { c.style.transform = 'scale(.99)'; });
      c.addEventListener('mouseup', () => { c.style.transform = 'none'; });
    });
    [...root.querySelectorAll('.su-choose-locked')].forEach((c) => {
      c.addEventListener('mouseenter', () => { c.style.background = 'var(--ink-100)'; });
      c.addEventListener('mouseleave', () => { c.style.background = 'var(--ink-50)'; });
    });
    const goEditor = () => {
      const nm = (setupName && setupName.value.trim()) || '';
      if (sessionName) sessionName.value = nm;
      if (setupScreen) setupScreen.style.display = 'none';
      if (editorScreen) editorScreen.style.display = 'flex';
    };
    const goSetup = () => {
      if (editorScreen) editorScreen.style.display = 'none';
      if (setupScreen) setupScreen.style.display = 'flex';
      if (setupName) setupName.focus();
    };
    [...root.querySelectorAll('[data-choose]')].forEach((b) => {
      paintCard(b);
      b.addEventListener('click', () => {
        const k = b.getAttribute('data-choose');
        if (selected.has(k)) selected.delete(k); else selected.add(k);
        paintCard(b); updateContinue();
      });
    });
    if (continueBtn) {
      continueBtn.addEventListener('mouseenter', () => { if (continueBtn.style.pointerEvents !== 'none') continueBtn.style.background = 'var(--raif-yellow-deep)'; });
      continueBtn.addEventListener('mouseleave', () => { continueBtn.style.background = 'var(--raif-yellow)'; });
      continueBtn.addEventListener('click', () => {
        const arr = selOrder.filter((k) => selected.has(k));
        if (!arr.length) return;
        added = arr.slice();
        act = arr[0];
        renderTabs();
        setAct(arr[0]);
        goEditor();
      });
    }
    updateContinue();
    const backSetup = root.querySelector('[data-back-setup]');
    if (backSetup) {
      backSetup.addEventListener('mouseenter', () => { backSetup.style.color = 'var(--ink-900)'; });
      backSetup.addEventListener('mouseleave', () => { backSetup.style.color = 'var(--ink-600)'; });
      backSetup.addEventListener('click', goSetup);
    }

    // ===== activity tabs (dynamic; others added via +) =====
    let act = 'qa';
    const eyebrow = $('[data-eyebrow]');
    const question = $('[data-question]');
    const optWrap = $('[data-options-wrap]');
    const qaWrap = $('[data-qa-wrap]');
    const quizTip = $('[data-quiz-tip]');
    const tabsBox = $('[data-tabs]');
    const addActBtn = $('[data-add-act]');
    const addMenu = $('[data-add-menu]');
    const eyebrows = { poll: 'ОПРОС · РЕДАКТИРОВАНИЕ', quiz: 'КВИЗ · РЕДАКТИРОВАНИЕ', qa: 'Q&A · РЕДАКТИРОВАНИЕ' };
    const questions = { poll: 'Введите вопрос для опроса', quiz: 'Введите вопрос квиза', qa: 'О чём собираем вопросы? (необязательно)' };
    const ICON = {
      qa: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
      poll: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14v5M12 9v10M17 5v14"></path></svg>',
      quiz: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 9a3 3 0 1 1 5.8 1c-.4 1.4-2 2-2.9 3-.3.5-.5 1-.5 1.7"></path><circle cx="12" cy="18" r="0.6" fill="currentColor"></circle></svg>',
      wordcloud: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h7M14 8h6M4 12h4M11 12h9M4 16h10M17 16h3"></path></svg>',
      add: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>',
      lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>'
    };
    const META = {
      qa: { label: 'Q&A', sub: 'Вопросы от участников' },
      poll: { label: 'Опрос', sub: 'Голосование с результатами' },
      quiz: { label: 'Квиз', sub: 'Викторина с очками', pro: true },
      wordcloud: { label: 'Облако слов', sub: 'Живое облако ответов', pro: true }
    };
    const ALL = ['qa', 'poll', 'quiz', 'wordcloud'];
    let added = ['qa'];

    const setAct = (a) => {
      if (!added.includes(a)) return;
      act = a;
      [...tabsBox.querySelectorAll('[data-act]')].forEach((t) => {
        const on = t.getAttribute('data-act') === a;
        t.style.background = on ? 'var(--raif-yellow)' : 'transparent';
        t.style.color = on ? 'var(--ink-900)' : 'var(--ink-600)';
      });
      if (eyebrow) eyebrow.textContent = eyebrows[a];
      if (question) { question.value = ''; question.placeholder = questions[a]; }
      if (optWrap) optWrap.style.display = a === 'qa' ? 'none' : 'block';
      if (qaWrap) qaWrap.style.display = a === 'qa' ? 'block' : 'none';
      if (quizTip) quizTip.style.display = a === 'quiz' ? 'flex' : 'none';
      renderQuizMarks();
      refreshLaunch();
    };
    let refreshLaunch = () => {};

    const renderTabs = () => {
      tabsBox.innerHTML = '';
      added.forEach((a) => {
        const btn = document.createElement('button');
        btn.setAttribute('data-act', a);
        const on = a === act;
        btn.style.cssText = 'appearance:none;-webkit-appearance:none;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:9px;border:none;border-radius:11px;padding:11px 18px;font-size:15px;font-weight:600;background:' + (on ? 'var(--raif-yellow)' : 'transparent') + ';color:' + (on ? 'var(--ink-900)' : 'var(--ink-600)') + ';';
        btn.innerHTML = ICON[a] + META[a].label;
        btn.addEventListener('click', () => setAct(a));
        btn.addEventListener('mouseenter', () => { if (act !== a) btn.style.color = 'var(--ink-800)'; });
        btn.addEventListener('mouseleave', () => { if (act !== a) btn.style.color = 'var(--ink-600)'; });
        tabsBox.appendChild(btn);
      });
      // add button visible only if something remains
      const remaining = ALL.filter((a) => !added.includes(a));
      if (addActBtn) addActBtn.parentNode.style.display = remaining.length ? 'block' : 'none';
    };

    const closeAddMenu = () => { if (addMenu) addMenu.style.display = 'none'; };
    const openAddMenu = () => {
      if (!addMenu) return;
      const remaining = ALL.filter((a) => !added.includes(a));
      addMenu.innerHTML = '';
      remaining.forEach((a) => {
        const item = document.createElement('button');
        item.style.cssText = 'appearance:none;-webkit-appearance:none;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:none;background:transparent;border-radius:11px;padding:11px 12px;transition:background .15s var(--ease-standard);';
        const pro = META[a].pro;
        item.innerHTML = '<span style="flex:none;width:34px;height:34px;border-radius:10px;background:var(--ink-100);display:flex;align-items:center;justify-content:center;color:' + (pro ? 'var(--ink-400)' : 'var(--ink-700)') + ';">' + ICON[a] + '</span>'
          + '<span style="flex:1;min-width:0;"><span style="display:block;font-size:14px;font-weight:600;color:' + (pro ? 'var(--ink-500)' : 'var(--ink-800)') + ';">' + META[a].label + '</span><span style="display:block;font-size:12px;color:var(--ink-400);">' + META[a].sub + '</span></span>'
          + (pro ? '<span style="flex:none;display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;letter-spacing:.04em;color:var(--ink-600);background:var(--ink-100);border-radius:999px;padding:4px 8px;">' + ICON.lock + 'PRO</span>' : '');
        item.addEventListener('mouseenter', () => { item.style.background = 'var(--ink-50)'; });
        item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
        item.addEventListener('click', () => {
          closeAddMenu();
          if (pro) { openAuth(a); return; }
          if (!added.includes(a)) added.push(a);
          renderTabs(); setAct(a);
        });
        addMenu.appendChild(item);
      });
      addMenu.style.display = 'block';
    };
    if (addActBtn) {
      addActBtn.addEventListener('mouseenter', () => { addActBtn.style.borderColor = 'var(--ink-800)'; addActBtn.style.color = 'var(--ink-800)'; });
      addActBtn.addEventListener('mouseleave', () => { addActBtn.style.borderColor = 'var(--ink-300)'; addActBtn.style.color = 'var(--ink-500)'; });
      addActBtn.addEventListener('click', (e) => { e.stopPropagation(); if (addMenu.style.display === 'block') closeAddMenu(); else openAddMenu(); });
      document.addEventListener('click', closeAddMenu);
      __hb._cleanup.push(() => document.removeEventListener('click', closeAddMenu));
    }

    // ===== options (editable, add/remove, quiz correct mark) =====
    const optList = $('[data-options]');
    const addBtn = $('[data-add-option]');
    let correct = 0;
    const seed = ['', '', ''];
    const makeOption = (text, i) => {
      const row = document.createElement('div');
      row.setAttribute('data-opt', '');
      row.style.cssText = 'display: flex; align-items: center; gap: 12px; background: var(--ink-50); border-radius: 14px; padding: 12px 14px; transition: box-shadow .2s var(--ease-standard);';
      row.innerHTML = `
        <button data-correct-btn title="Правильный ответ" style="appearance:none;-webkit-appearance:none;cursor:pointer;flex:none;border:none;background:transparent;width:24px;height:24px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:var(--ink-300);transition:color .2s,background .2s;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path data-tick d="M8 12l2.5 2.5L16 9" style="display:none;"></path></svg></button>
        <span style="flex:none;width:26px;height:26px;border-radius:8px;background:var(--white);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:var(--ink-500);" data-letter>${String.fromCharCode(65 + i)}</span>
        <input data-opt-input class="su-edit" value="${text.replace(/"/g, '&quot;')}" placeholder="Введите вариант ответа" aria-label="Вариант ответа" style="flex:1;min-width:0;font-size:15px;color:var(--ink-800);padding:4px 2px;">
        <button data-del-opt title="Удалить" style="appearance:none;-webkit-appearance:none;cursor:pointer;flex:none;border:none;background:transparent;width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--ink-300);transition:color .2s,background .2s;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>`;
      const inp = row.querySelector('[data-opt-input]');
      inp.addEventListener('focus', () => { inp.style.background = 'var(--white)'; row.style.boxShadow = 'inset 0 0 0 1.5px var(--ink-200)'; });
      inp.addEventListener('blur', () => { inp.style.background = 'transparent'; row.style.boxShadow = 'none'; });
      const del = row.querySelector('[data-del-opt]');
      del.addEventListener('mouseenter', () => { del.style.color = '#e5484d'; del.style.background = 'var(--ink-100)'; });
      del.addEventListener('mouseleave', () => { del.style.color = 'var(--ink-300)'; del.style.background = 'transparent'; });
      del.addEventListener('click', () => {
        if (optList.children.length <= 2) { row.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:240}); return; }
        const idx = [...optList.children].indexOf(row);
        row.remove();
        if (correct === idx) correct = 0; else if (correct > idx) correct -= 1;
        relabel(); renderQuizMarks();
      });
      const cbtn = row.querySelector('[data-correct-btn]');
      cbtn.addEventListener('click', () => { correct = [...optList.children].indexOf(row); renderQuizMarks(); });
      return row;
    };
    const relabel = () => { [...optList.children].forEach((r, i) => { const l = r.querySelector('[data-letter]'); if (l) l.textContent = String.fromCharCode(65 + i); }); };
    const renderQuizMarks = () => {
      const isQuiz = act === 'quiz';
      [...optList.children].forEach((r, i) => {
        const cbtn = r.querySelector('[data-correct-btn]');
        const tick = r.querySelector('[data-tick]');
        cbtn.style.display = isQuiz ? 'flex' : 'none';
        const on = isQuiz && i === correct;
        cbtn.style.color = on ? 'var(--sochi-text)' : 'var(--ink-300)';
        cbtn.style.background = on ? 'var(--sochi-15)' : 'transparent';
        if (tick) tick.style.display = on ? 'block' : 'none';
      });
    };
    seed.forEach((t, i) => optList.appendChild(makeOption(t, i)));
    renderQuizMarks();
    if (addBtn) {
      addBtn.addEventListener('mouseenter', () => { addBtn.style.borderColor = 'var(--ink-800)'; addBtn.style.color = 'var(--ink-800)'; });
      addBtn.addEventListener('mouseleave', () => { addBtn.style.borderColor = 'var(--ink-200)'; addBtn.style.color = 'var(--ink-500)'; });
      addBtn.addEventListener('click', () => {
        if (optList.children.length >= 6) return;
        const row = makeOption('', optList.children.length);
        optList.appendChild(row); renderQuizMarks();
        const inp = row.querySelector('[data-opt-input]'); if (inp) inp.focus();
      });
    }

    // ===== join code + QR =====
    const codeEl = $('[data-code]');
    const regen = $('[data-regen]');
    const qrBox = $('[data-qr]');
    const shareLink = $('[data-share-link]');
    const syncLink = () => { if (shareLink && codeEl) shareLink.textContent = 'qanda.online/' + codeEl.textContent; };
    const renderQR = (text) => {
      if (!qrBox) return;
      const n = 25;
      let h = 2166136261;
      for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
      let s = (h >>> 0) || 1;
      const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
      const fp = (rr, cc) => (rr === 0 || rr === 6 || cc === 0 || cc === 6) || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
      const inBox = (r, c, br, bc) => (r >= br && r < br + 7 && c >= bc && c < bc + 7);
      const near = (r, c, br, bc) => (r >= br - 1 && r <= br + 7 && c >= bc - 1 && c <= bc + 7);
      const dark = (r, c) => {
        if (inBox(r, c, 0, 0)) return fp(r, c);
        if (inBox(r, c, 0, n - 7)) return fp(r, c - (n - 7));
        if (inBox(r, c, n - 7, 0)) return fp(r - (n - 7), c);
        if (near(r, c, 0, 0) || near(r, c, 0, n - 7) || near(r, c, n - 7, 0)) return false;
        return rand() > 0.52;
      };
      const cell = 100 / n;
      let rects = '';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (dark(r, c)) rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"></rect>`;
      const svg = `<svg viewBox="0 0 100 100" width="100%" height="100%" shape-rendering="crispEdges" style="display:block;"><g fill="var(--ink-800)">${rects}</g></svg>`;
      qrBox.innerHTML = svg;
      const big = root.querySelector('[data-qr-big]');
      if (big) big.innerHTML = svg;
    };
    if (codeEl) renderQR(codeEl.textContent);
    if (regen) {
      regen.addEventListener('mouseenter', () => { regen.style.background = 'var(--ink-200)'; });
      regen.addEventListener('mouseleave', () => { regen.style.background = 'var(--ink-100)'; });
      const genCode = () => {
        const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', D = '0123456789';
        const pick = (s) => s[Math.floor(Math.random() * s.length)];
        return pick(L) + pick(L) + pick(D) + pick(D) + pick(D);
      };
      regen.addEventListener('click', () => { codeEl.textContent = genCode(); renderQR(codeEl.textContent); syncLink(); });
    }
    syncLink();

    // ===== copy link + copy code =====
    const flashCopy = (btn, iconEl, labelEl) => {
      const okIcon = '<path d="M5 12l5 5 9-10"></path>';
      const cpIcon = '<rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path>';
      if (iconEl) iconEl.innerHTML = okIcon;
      if (labelEl) labelEl.textContent = 'Скопировано';
      btn._t && clearTimeout(btn._t);
      btn._t = setTimeout(() => { if (__hb._unmounted) return; if (iconEl) iconEl.innerHTML = cpIcon; if (labelEl) labelEl.textContent = 'Копировать'; }, 1600);
    };
    const doCopy = (text) => { try { const p = navigator.clipboard && navigator.clipboard.writeText(text); if (p && p.catch) p.catch(() => {}); } catch (e) {} };

    // ===== QR modal (open large QR + code + name) =====
    const syncBig = () => {
      const t = root.querySelector('[data-qr-modal-code]');
      const l = root.querySelector('[data-qr-modal-link]');
      const nm = root.querySelector('[data-qr-modal-title]');
      const nameInput = root.querySelector('[data-setup-name]');
      if (t && codeEl) t.textContent = codeEl.textContent;
      if (l && codeEl) l.textContent = 'qanda.online/' + codeEl.textContent;
      if (nm) nm.textContent = (nameInput && nameInput.value.trim()) || 'Сессия команды';
    };
    const qrModal = $('[data-qr-modal]');
    const openQrModal = () => { if (!qrModal) return; syncBig(); qrModal.style.display = 'flex'; };
    const closeQrModal = () => { if (qrModal) qrModal.style.display = 'none'; };
    if (qrBox && qrModal) {
      qrBox.style.cursor = 'pointer';
      qrBox.setAttribute('title', 'Открыть крупно');
      qrBox.style.transition = 'transform .15s var(--ease-standard), box-shadow .15s var(--ease-standard)';
      qrBox.addEventListener('mouseenter', () => { qrBox.style.transform = 'scale(1.05)'; qrBox.style.boxShadow = '0 6px 18px rgba(33,28,44,.16)'; });
      qrBox.addEventListener('mouseleave', () => { qrBox.style.transform = 'none'; qrBox.style.boxShadow = 'none'; });
      qrBox.addEventListener('click', openQrModal);
      qrModal.addEventListener('click', (e) => { if (e.target === qrModal) closeQrModal(); });
      const cl = qrModal.querySelector('[data-qr-modal-close]');
      if (cl) cl.addEventListener('click', closeQrModal);
      const onKey = (e) => { if (e.key === 'Escape') closeQrModal(); };
      document.addEventListener('keydown', onKey);
      __hb._cleanup.push(() => document.removeEventListener('keydown', onKey));
    }

    // ===== copy link + copy code =====
    const copyLinkBtn = $('[data-copy-link]');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('mouseenter', () => { copyLinkBtn.style.background = 'var(--ink-100)'; });
      copyLinkBtn.addEventListener('mouseleave', () => { copyLinkBtn.style.background = 'var(--ink-50)'; });
      copyLinkBtn.addEventListener('click', () => { doCopy(shareLink ? shareLink.textContent : ''); flashCopy(copyLinkBtn, $('[data-copy-link-icon]'), null); });
    }
    const copyCodeBtn = $('[data-copy-code]');
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('mouseenter', () => { const ic = copyCodeBtn.querySelector('[data-copy-code-icon]'); if (ic) ic.style.stroke = 'var(--ink-700)'; });
      copyCodeBtn.addEventListener('mouseleave', () => { const ic = copyCodeBtn.querySelector('[data-copy-code-icon]'); if (ic) ic.style.stroke = 'var(--ink-400)'; });
      copyCodeBtn.addEventListener('click', () => { doCopy(codeEl ? codeEl.textContent : ''); flashCopy(copyCodeBtn, $('[data-copy-code-icon]'), $('[data-copy-code-label]')); });
    }

    // ===== launch — per activity (admin starts each one) =====
    const launch = $('[data-launch]');
    const launchLabel = $('[data-launch-label]');
    const launchIcon = $('[data-launch-icon]');
    const liveRow = $('[data-live-row]');
    const liveCount = $('[data-live-count]');
    const launchVerb = { poll: 'Запустить опрос', quiz: 'Запустить квиз', qa: 'Запустить Q&A', wordcloud: 'Запустить облако' };
    let liveAct = null;
    refreshLaunch = () => {
      if (!launch) return;
      const isLive = liveAct === act;
      if (isLive) {
        launch.style.background = 'var(--ink-50)'; launch.style.color = 'var(--ink-700)';
        launchLabel.textContent = 'Остановить';
        launchIcon.innerHTML = '<rect x="6" y="6" width="12" height="12" rx="2"></rect>';
        if (liveRow) liveRow.style.display = 'inline-flex';
      } else {
        launch.style.background = 'var(--raif-yellow)'; launch.style.color = 'var(--ink-900)';
        launchLabel.textContent = launchVerb[act] || 'Запустить';
        launchIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
        if (liveRow) liveRow.style.display = 'none';
      }
    };
    if (launch) {
      launch.addEventListener('mouseenter', () => { launch.style.background = (liveAct === act) ? 'var(--ink-100)' : 'var(--raif-yellow-deep)'; });
      launch.addEventListener('mouseleave', () => { launch.style.background = (liveAct === act) ? 'var(--ink-50)' : 'var(--raif-yellow)'; });
      launch.addEventListener('mousedown', () => { launch.style.transform = 'scale(.985)'; });
      launch.addEventListener('mouseup', () => { launch.style.transform = 'none'; });
      launch.addEventListener('click', () => {
        clearInterval(__hb._liveTimer);
        if (liveAct === act) {
          liveAct = null;
        } else {
          liveAct = act;
          let n = 1;
          if (liveCount) liveCount.textContent = n;
          __hb._liveTimer = setInterval(() => {
            if (__hb._unmounted || liveAct !== act) { clearInterval(__hb._liveTimer); return; }
            n += 1 + Math.floor(Math.random() * 3); if (liveCount) liveCount.textContent = n;
          }, 1600);
        }
        refreshLaunch();
      });
      __hb._cleanup.push(() => clearInterval(__hb._liveTimer));
      refreshLaunch();
    }

    const pLink = $('[data-participant-link]');
    if (pLink) {
      pLink.addEventListener('mouseenter', () => { pLink.style.borderColor = 'var(--ink-800)'; pLink.style.color = 'var(--ink-900)'; });
      pLink.addEventListener('mouseleave', () => { pLink.style.borderColor = 'var(--ink-200)'; pLink.style.color = 'var(--ink-700)'; });
    }

    // ===== PRO rows hover =====
    $$('.su-pro-row').forEach((r) => {
      r.addEventListener('mouseenter', () => { r.style.background = 'rgba(255,255,255,.11)'; });
      r.addEventListener('mouseleave', () => { r.style.background = 'rgba(255,255,255,.06)'; });
    });

    // ===== AUTH MODAL =====
    const modal = $('[data-auth]');
    const card = $('[data-auth-card]');
    const titleEl = $('[data-auth-title]');
    const subEl = $('[data-auth-sub]');
    const pill = $('[data-auth-pill]');
    const stepEmail = $('[data-step="email"]');
    const stepSent = $('[data-step="sent"]');
    const emailInput = $('[data-su-email]');
    const suForm = $('[data-su-form]');
    const suSubmit = $('[data-su-submit]');
    const suHint = $('[data-su-hint]');
    const target = $('[data-su-target]');
    const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const ctx = {
      account: { pill: '', title: 'Войдите в аккаунт', sub: 'Введите рабочую почту — пришлём ссылку для входа без пароля.' },
      share: { pill: '🔗 Поделиться', title: 'Войдите, чтобы поделиться', sub: 'Сохраните сессию в аккаунте — и приглашайте участников ссылкой или QR-кодом.' },
      signup: { pill: '', title: 'Создайте бесплатный аккаунт', sub: 'Базовые опросы и Q&A — бесплатно навсегда. Регистрация открывает PRO-возможности.' },
      design: { pill: 'PRO · Дизайн и темы', title: 'Оформите опрос в своём стиле', sub: 'Свои цвета, логотип и фон — после быстрой регистрации по email.' },
      password: { pill: 'PRO · Пароль от мероприятия', title: 'Закройте сессию паролем', sub: 'Пустите только свою команду — задайте пароль на вход после регистрации.' },
      moderation: { pill: 'PRO · Модерация вопросов', title: 'Включите модерацию вопросов', sub: 'Одобряйте вопросы перед показом на экране — доступно в аккаунте.' },
      quiz: { pill: 'PRO · Квиз', title: 'Запустите квиз', sub: 'Викторина с очками и таблицей лидеров — доступна после регистрации.' },
      wordcloud: { pill: 'PRO · Облако слов', title: 'Откройте облако слов', sub: 'Ответы участников складываются в живое облако — доступно после регистрации.' }
    };
    const openAuth = (key) => {
      const c = ctx[key] || ctx.signup;
      if (pill) { if (c.pill) { pill.textContent = c.pill; pill.style.display = 'inline-flex'; } else { pill.style.display = 'none'; } }
      if (titleEl) titleEl.textContent = c.title;
      if (subEl) subEl.textContent = c.sub;
      stepSent.style.display = 'none';
      stepEmail.style.display = 'block';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      setTimeout(() => emailInput && emailInput.focus(), 60);
    };
    const closeAuth = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };

    $$('[data-open-auth]').forEach((b) => {
      b.addEventListener('click', () => openAuth(b.getAttribute('data-pro-key')));
    });
    const closeBtn = $('[data-auth-close]');
    if (closeBtn) {
      closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'var(--ink-200)'; });
      closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'var(--ink-100)'; });
      closeBtn.addEventListener('click', closeAuth);
    }
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAuth(); });
    const onKey = (e) => { if (e.key === 'Escape' && modal.style.display === 'flex') closeAuth(); };
    document.addEventListener('keydown', onKey);
    __hb._cleanup.push(() => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; });

    // auth interactions
    if (emailInput) {
      emailInput.addEventListener('focus', () => { emailInput.style.borderColor = 'var(--ink-800)'; emailInput.style.boxShadow = '0 0 0 3px rgba(43,45,51,.08)'; });
      emailInput.addEventListener('blur', () => { emailInput.style.borderColor = 'var(--ink-200)'; emailInput.style.boxShadow = 'none'; });
      emailInput.addEventListener('input', () => { if (suHint && suHint._err) { suHint.textContent = 'Пароль не нужен — пришлём ссылку для входа.'; suHint.style.color = 'var(--ink-400)'; suHint._err = false; } });
    }
    if (suSubmit) {
      suSubmit.addEventListener('mouseenter', () => { suSubmit.style.background = 'var(--raif-yellow-deep)'; });
      suSubmit.addEventListener('mouseleave', () => { suSubmit.style.background = 'var(--raif-yellow)'; });
    }
    $$('[data-sso]').forEach((b) => {
      b.addEventListener('mouseenter', () => { b.style.borderColor = 'var(--ink-800)'; b.style.background = 'var(--ink-50)'; });
      b.addEventListener('mouseleave', () => { b.style.borderColor = 'var(--ink-200)'; b.style.background = 'var(--white)'; });
    });
    const suOpen = $('[data-su-open]');
    if (suOpen) { suOpen.addEventListener('mouseenter', () => { suOpen.style.background = 'var(--raif-yellow-deep)'; }); suOpen.addEventListener('mouseleave', () => { suOpen.style.background = 'var(--raif-yellow)'; }); }
    if (suForm) suForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (emailInput.value || '').trim();
      if (!valid(v)) {
        emailInput.style.borderColor = '#e5484d';
        if (suHint) { suHint.textContent = 'Введите корректный рабочий email'; suHint.style.color = '#e5484d'; suHint._err = true; }
        emailInput.focus();
        return;
      }
      if (target) target.textContent = v;
      stepEmail.style.display = 'none';
      stepSent.style.display = 'block';
    });
    const back = $('[data-su-back]');
    if (back) back.addEventListener('click', () => { stepSent.style.display = 'none'; stepEmail.style.display = 'block'; emailInput && emailInput.focus(); });

    // The admin panel opens on the editor (the event already exists): preselect
    // Q&A and advance, reusing the design's own setup→editor transition.
    try {
      const qa = root.querySelector('[data-choose="qa"]')
      if (qa) qa.click()
      const cont = root.querySelector('[data-continue]')
      if (cont) cont.click()
    } catch (e) {}

    return () => {
      __hb._unmounted = true
      clearInterval(__hb._liveTimer)
      __hb._cleanup.forEach((f) => { try { f() } catch (e) {} })
    }
  }, [])

  return (
    <>
      <style>{STYLE}</style>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: MARKUP }} />
    </>
  )
}
