/* eslint-disable */
// @ts-nocheck
'use client'

import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Landing «Есть вопросы» — 1:1 port of the owner's Claude Design page
// (Есть вопросы.dc.html). Landing section only; its in-page builder is dropped —
// the "Создать событие" CTA navigates to the dedicated /create route. Verbatim
// markup (bindings resolved) + the design's own landing script, adapted from a
// DC class into a closure that runs in an effect. Tokens live in globals.css.
// ---------------------------------------------------------------------------

const STYLE = "  @keyframes pulseHeroIn { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: none; } }\n  @keyframes pulseFloatA { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(6deg); } }\n  @keyframes pulseFloatB { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(14px) rotate(-8deg); } }\n  @keyframes pulseMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }\n  @keyframes pulseLive { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.7); } }\n  @keyframes suLive { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .3; transform: scale(.65); } }\n  @keyframes suPop { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }\n  @keyframes suFloatA { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(6deg); } }\n  @keyframes suFloatB { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(14px) rotate(-8deg); } }\n  .su-edit { font-family: inherit; border: none; background: transparent; outline: none; width: 100%; color: var(--ink-800); }\n  .su-edit::placeholder { color: var(--ink-300); }\n  @media (max-width: 860px) {\n    nav[style*=\"gap: 36px\"] { display: none !important; }\n    [style*=\"repeat(4, 1fr)\"] { grid-template-columns: 1fr 1fr !important; }\n  }\n  @media (max-width: 760px) {\n    [style*=\"repeat(3, 1fr)\"] { grid-template-columns: 1fr !important; gap: 28px !important; }\n    [style*=\"1.05fr 0.95fr\"] { grid-template-columns: 1fr !important; }\n    [style*=\"min-height: 560px\"] { min-height: 0 !important; }\n    [style*=\"grid-auto-rows: 1fr\"] { grid-auto-rows: auto !important; }\n  }\n  @media (max-width: 460px) {\n    [style*=\"repeat(4, 1fr)\"] { grid-template-columns: 1fr !important; }\n    [style*=\"grid-template-columns: 1fr 1fr; gap: 10px\"] { grid-template-columns: 1fr !important; }\n  }"
const MARKUP = "<div data-r=\"landing\" data-landing style=\"position: relative; overflow-x: hidden; background: var(--ink-100);\">\n\n  <!-- scroll progress -->\n  <div data-r=\"prog\" style=\"position: fixed; top: 0; left: 0; height: 4px; width: 0%; background: var(--raif-yellow); z-index: 9000; transition: width .12s linear;\"></div>\n\n  <!-- NAV -->\n  <header style=\"position: fixed; top: 0; left: 0; right: 0; height: 76px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 5vw, 64px); background: rgba(233,234,234,.82); backdrop-filter: blur(10px); border-bottom: 1px solid var(--ink-200); z-index: 2000;\">\n    <div data-hover>\n      <span style=\"position: relative; display: inline-flex; align-items: center; padding: 9px 16px; background: var(--sochi-35); border-radius: 14px; font-size: 19px; font-weight: 600; letter-spacing: -0.02em; color: var(--sochi-text); white-space: nowrap;\">Есть вопросы<span style=\"position: absolute; bottom: -7px; right: 20px; width: 0; height: 0; border-left: 11px solid transparent; border-right: 6px solid transparent; border-top: 11px solid var(--sochi-35);\"></span></span>\n    </div>\n    <nav style=\"display: flex; align-items: center; gap: 36px; font-size: 15px; color: var(--ink-600);\">\n      <a href=\"#features\" data-hover style=\"color: inherit; text-decoration: none;\">Возможности</a>\n      <a href=\"#demo\" data-hover style=\"color: inherit; text-decoration: none;\">Демо</a>\n    </nav>\n    <a href=\"/create\" data-go-builder data-hover style=\"display: inline-flex; text-decoration: none;\">\n      <span style=\"display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 22px;background:var(--raif-yellow);color:var(--ink-900);font-size:15px;font-weight:600;border-radius:999px;white-space:nowrap;transition:background .2s var(--ease-standard)\">Создать событие</span>\n    </a>\n  </header>\n\n  <!-- HERO -->\n  <section style=\"position: relative; min-height: 100vh; padding: 132px clamp(20px, 5vw, 64px) 80px; display: flex; flex-direction: column; justify-content: center; overflow: hidden;\">\n\n    <!-- faint pencil scribbles, edge to edge -->\n    <svg style=\"position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; opacity: 0.06; color: var(--ink-700);\" viewBox=\"0 0 1280 720\" preserveAspectRatio=\"none\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" vector-effect=\"non-scaling-stroke\">\n      <path vector-effect=\"non-scaling-stroke\" d=\"M-40 150 C 80 60 160 60 200 150 C 232 220 150 252 150 180 C 150 120 260 120 320 170 C 400 236 470 70 560 150 C 650 230 720 60 820 150 C 900 226 870 252 900 180 C 932 120 1000 130 1060 165 C 1142 216 1182 90 1320 150\"></path>\n      <path vector-effect=\"non-scaling-stroke\" d=\"M-40 320 C 120 240 200 410 320 320 C 440 235 520 405 640 320 C 760 240 840 410 960 320 C 1080 240 1160 405 1320 320\"></path>\n      <path vector-effect=\"non-scaling-stroke\" d=\"M-40 500 C 100 430 180 565 300 500 C 430 440 520 560 650 495 C 722 460 690 545 742 522 C 802 497 790 468 760 470 C 980 425 1100 565 1320 500\"></path>\n      <path vector-effect=\"non-scaling-stroke\" d=\"M120 600 C 260 540 320 660 460 610 C 600 560 660 670 820 620 C 980 570 1060 668 1240 612\"></path>\n      <path vector-effect=\"non-scaling-stroke\" d=\"M40 60 C 180 20 260 130 420 80 C 560 38 640 140 800 90 C 940 48 1040 140 1240 80\"></path>\n    </svg>\n\n    <!-- floating shapes layer (persistent across variants) -->\n    <div data-r=\"shapes\" style=\"position: absolute; inset: 0; pointer-events: none; z-index: 0;\">\n      <div class=\"px\" data-depth=\"0.06\" style=\"position: absolute; top: 12%; left: 8%; width: 120px; height: 120px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatA 7s var(--ease-standard) infinite; display: flex; align-items: center; justify-content: center;\"><span style=\"font-size: 116px; font-weight: 600; line-height: 1; color: var(--raif-yellow); transform: rotate(-8deg);\">?</span></div></div>\n      \n      <div class=\"px\" data-depth=\"0.09\" style=\"position: absolute; top: 22%; right: 9%; width: 132px; height: 132px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatB 9s var(--ease-standard) infinite;\"><svg viewBox=\"0 0 120 120\" width=\"100%\" height=\"100%\" style=\"overflow: visible;\"><path d=\"M 24 10 H 96 Q 114 10 114 28 V 62 Q 114 80 96 80 H 58 L 40 106 L 38 80 H 24 Q 6 80 6 62 V 28 Q 6 10 24 10 Z\" fill=\"var(--sochi-35)\"></path><circle cx=\"42\" cy=\"45\" r=\"5\" fill=\"var(--sochi-text)\"></circle><circle cx=\"60\" cy=\"45\" r=\"5\" fill=\"var(--sochi-text)\"></circle><circle cx=\"78\" cy=\"45\" r=\"5\" fill=\"var(--sochi-text)\"></circle></svg></div></div>\n      <div class=\"px\" data-depth=\"0.14\" style=\"position: absolute; bottom: 20%; left: 14%; width: 70px; height: 70px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatB 6.5s var(--ease-standard) infinite; border-radius: 999px; background: var(--paris-30);\"></div></div>\n      <div class=\"px\" data-depth=\"0.07\" style=\"position: absolute; bottom: 16%; right: 18%; width: 56px; height: 56px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatA 8s var(--ease-standard) infinite; border-radius: 999px; border: 3px solid var(--ink-800);\"></div></div>\n      <div class=\"px\" data-depth=\"0.11\" style=\"position: absolute; top: 60%; right: 6%; width: 44px; height: 44px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatA 7.5s var(--ease-standard) infinite; border-radius: 999px; background: var(--manila-35);\"></div></div>\n      <div class=\"px\" data-depth=\"0.06\" style=\"position: absolute; top: 13%; left: 40%; width: 30px; height: 30px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatB 10s var(--ease-standard) infinite; border-radius: 8px; background: var(--porto-30);\"></div></div>\n      <div class=\"px\" data-depth=\"0.12\" style=\"position: absolute; top: 2%; left: 33%; width: 128px; height: 96px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatA 8.5s var(--ease-standard) infinite;\"><svg viewBox=\"0 0 128 96\" width=\"100%\" height=\"100%\" style=\"overflow: visible;\"><path d=\"M 22 8 H 106 Q 124 8 124 26 V 56 Q 124 74 106 74 H 52 L 30 92 L 33 74 H 22 Q 4 74 4 56 V 26 Q 4 8 22 8 Z\" fill=\"var(--porto-30)\"></path><circle cx=\"44\" cy=\"42\" r=\"5.5\" fill=\"var(--ink-800)\"></circle><circle cx=\"64\" cy=\"42\" r=\"5.5\" fill=\"var(--ink-800)\"></circle><circle cx=\"84\" cy=\"42\" r=\"5.5\" fill=\"var(--ink-800)\"></circle></svg></div></div>\n      <div class=\"px\" data-depth=\"0.1\" style=\"position: absolute; top: 55%; left: 6%; width: 94px; height: 94px;\"><div style=\"width: 100%; height: 100%; animation: pulseFloatB 8.5s var(--ease-standard) infinite;\"><div style=\"width: 100%; height: 100%; transform: rotate(-6deg); background: var(--manila-35); border-radius: 4px; box-shadow: var(--shadow-md); padding: 16px 14px; display: flex; flex-direction: column; gap: 8px;\"><span style=\"display: block; height: 5px; width: 72%; border-radius: 3px; background: rgba(28,91,95,.42);\"></span><span style=\"display: block; height: 5px; width: 92%; border-radius: 3px; background: rgba(28,91,95,.28);\"></span><span style=\"display: block; height: 5px; width: 56%; border-radius: 3px; background: rgba(28,91,95,.28);\"></span></div></div></div>\n    </div>\n\n    <!-- VARIANT A -->\n    <!-- HERO CONTENT -->\n      <div style=\"position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; text-align: center;\">\n        <h1 style=\"font-size: clamp(40px, 6.2vw, 92px); line-height: 1.04; letter-spacing: -0.03em; font-weight: 500; margin: 0 0 26px; color: var(--ink-800); text-wrap: balance;\">Лучший способ сделать<br>любую встречу интерактивной</h1>\n        <p style=\"max-width: 620px; margin: 0 auto 36px; font-size: clamp(17px, 2vw, 21px); line-height: 1.45; color: var(--ink-500);\">Создавайте опросы, голосования и Q&amp;A-сессии за пару минут. Делитесь ссылкой — и смотрите, как ответы складываются в живые графики.</p>\n\n        <!-- JOIN BY CODE -->\n        <form data-join-form style=\"max-width: 420px; margin: 0 auto 16px;\" data-hover>\n          <div style=\"display: flex; gap: 10px; align-items: stretch;\">\n            <div style=\"flex: 1 1 auto; min-width: 0;\">\n              <input data-join-input autocomplete=\"off\" autocapitalize=\"characters\" maxlength=\"6\" placeholder=\"Код с экрана\" aria-label=\"Код мероприятия\" style=\"width: 100%; appearance: none; -webkit-appearance: none; border: 1.5px solid var(--ink-100); background: rgba(255,255,255,0.55); border-radius: 999px; padding: 0 22px; height: 52px; font-family: var(--font-brand); font-size: 19px; font-weight: 600; letter-spacing: 0.06em; color: var(--ink-800); text-align: center; outline: none; transition: border-color .2s var(--ease-standard);\">\n              <div data-join-hint style=\"min-height: 16px; margin-top: 9px; font-size: 13px; color: var(--ink-400); text-align: center;\">Быстрый вход на мероприятие</div>\n            </div>\n            <button data-join-btn type=\"submit\" style=\"flex: none; align-self: flex-start; appearance: none; -webkit-appearance: none; border: none; cursor: pointer; background: var(--raif-yellow); color: var(--ink-900); font-family: var(--font-brand); font-size: 16px; font-weight: 600; border-radius: 999px; padding: 0 28px; height: 52px; transition: background .2s var(--ease-standard), transform .12s var(--ease-standard);\">Войти</button>\n          </div>\n        </form>\n\n      </div>\n  </section>\n\n  <!-- MARQUEE -->\n  <div style=\"overflow: hidden; background: var(--ink-900); padding: 18px 0;\">\n    <div style=\"display: flex; width: max-content; animation: pulseMarquee 26s linear infinite; gap: 0;\">\n      <div style=\"display: flex; gap: 40px; align-items: center; padding-right: 40px;\"><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">опросы<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">голосования<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">квизы<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">Q&A<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">облака слов<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">обратная связь<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">рейтинги<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">шкалы<span style=\"color:var(--raif-yellow)\">✳</span></span></div>\n      <div style=\"display: flex; gap: 40px; align-items: center; padding-right: 40px;\" aria-hidden=\"true\"><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">опросы<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">голосования<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">квизы<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">Q&A<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">облака слов<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">обратная связь<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">рейтинги<span style=\"color:var(--raif-yellow)\">✳</span></span><span style=\"display:inline-flex;align-items:center;gap:40px;color:#fff;font-size:17px;letter-spacing:-0.01em\">шкалы<span style=\"color:var(--raif-yellow)\">✳</span></span></div>\n    </div>\n  </div>\n\n  <!-- STATS -->\n  <section style=\"padding: clamp(72px, 10vw, 130px) clamp(20px, 5vw, 64px); background-color: var(--ink-100); background-image: radial-gradient(#c9cbcb 1.5px, transparent 1.6px); background-size: 26px 26px; background-position: -1px -1px;\">\n    <div data-reveal style=\"max-width: 1180px; margin: 0 auto; opacity: 0; transform: translateY(28px); transition: opacity .7s var(--ease-standard), transform .7s var(--ease-standard);\">\n      <div style=\"font-size: 13px; letter-spacing: 0.06em; color: var(--ink-400); margin-bottom: 14px;\">«ЕСТЬ ВОПРОСЫ» В ЦИФРАХ</div>\n      <h2 style=\"font-size: clamp(32px, 5vw, 56px); font-weight: 500; letter-spacing: -0.02em; margin: 0 0 56px; max-width: 720px; color: var(--ink-800);\">Обратная связь, которой пользуются каждый день</h2>\n      <div style=\"display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;\">\n        <div style=\"background: var(--white); border-radius: 24px; box-shadow: var(--shadow-sm); padding: 36px 28px;\">\n          <div style=\"font-size: clamp(40px, 5vw, 68px); font-weight: 500; letter-spacing: -0.03em; color: var(--ink-800);\"><span data-count=\"1241\" data-dec=\"0\">0</span></div>\n          <div style=\"font-size: 15px; color: var(--ink-500); margin-top: 8px;\">ответов собрано за год</div>\n        </div>\n        <div style=\"background: var(--white); border-radius: 24px; box-shadow: var(--shadow-sm); padding: 36px 28px;\">\n          <div style=\"font-size: clamp(40px, 5vw, 68px); font-weight: 500; letter-spacing: -0.03em; color: var(--ink-800);\"><span data-count=\"633\" data-dec=\"0\">0</span></div>\n          <div style=\"font-size: 15px; color: var(--ink-500); margin-top: 8px;\">разгаданных квизов</div>\n        </div>\n        <div style=\"background: var(--white); border-radius: 24px; box-shadow: var(--shadow-sm); padding: 36px 28px;\">\n          <div style=\"font-size: clamp(40px, 5vw, 68px); font-weight: 500; letter-spacing: -0.03em; color: var(--ink-800);\">&lt;<span data-count=\"1\" data-dec=\"0\">0</span> мин</div>\n          <div style=\"font-size: 15px; color: var(--ink-500); margin-top: 8px;\">чтобы запустить опрос</div>\n        </div>\n        <div style=\"background: var(--white); border-radius: 24px; box-shadow: var(--shadow-sm); padding: 36px 28px;\">\n          <div style=\"font-size: clamp(40px, 5vw, 68px); font-weight: 500; letter-spacing: -0.03em; color: var(--ink-800);\"><span data-count=\"200\" data-dec=\"0\">0</span></div>\n          <div style=\"font-size: 15px; color: var(--ink-500); margin-top: 8px;\">событий создано</div>\n        </div>\n      </div>\n    </div>\n  </section>\n\n  <!-- DEMO: live results + Q&A -->\n  <section id=\"demo\" style=\"padding: clamp(72px, 10vw, 130px) clamp(20px, 5vw, 64px); background: var(--white);\">\n    <div style=\"max-width: 1180px; margin: 0 auto;\">\n      <div data-reveal style=\"opacity: 0; transform: translateY(28px); transition: opacity .7s var(--ease-standard), transform .7s var(--ease-standard);\">\n        <div style=\"font-size: 13px; letter-spacing: 0.06em; color: var(--ink-400); margin-bottom: 14px;\">ЖИВОЙ ЭКРАН · ПОПРОБУЙТЕ САМИ</div>\n        <h2 style=\"font-size: clamp(32px, 5vw, 56px); font-weight: 500; letter-spacing: -0.02em; margin: 0 0 16px; max-width: 640px; color: var(--ink-800);\">Так это выглядит во время сессии</h2>\n        <p style=\"font-size: 17px; color: var(--ink-500); margin: 0 0 56px; max-width: 560px;\">Слева — экран участника, справа — панель ведущего. Запускайте опрос или квиз, модерируйте вопросы — и сразу отвечайте на них на экране участника. Полный цикл сервиса в одном окне.</p>\n      </div>\n      <div style=\"display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 24px; align-items: stretch;\">\n\n        <!-- ============ LEFT: PARTICIPANT SCREEN ============ -->\n        <div data-reveal data-hover style=\"opacity: 0; transform: translateY(28px); transition: opacity .7s var(--ease-standard), transform .7s var(--ease-standard); background: var(--ink-100); border-radius: 24px; padding: 32px; min-height: 560px; display: flex; flex-direction: column;\">\n          <div style=\"display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;\">\n            <span style=\"font-size: 12px; letter-spacing: 0.06em; color: var(--ink-400);\">ЭКРАН УЧАСТНИКА</span>\n            <span style=\"display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-600); background: var(--white); border-radius: 999px; padding: 6px 12px;\"><span style=\"width: 7px; height: 7px; border-radius: 999px; background: #e5484d; animation: pulseLive 1.4s ease-in-out infinite;\"></span><span data-part-status>Вопросы и ответы</span></span>\n          </div>\n\n          <!-- ---- POLL VIEW ---- -->\n          <div data-view=\"poll\" style=\"display: none; flex: 1;\">\n            <div style=\"font-size: 12px; letter-spacing: 0.04em; color: var(--ink-400); margin-bottom: 10px;\">ОПРОС · В ЭФИРЕ · <span data-poll-total>612</span> голосов</div>\n            <h3 style=\"font-size: 24px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 22px; color: var(--ink-800);\">Что улучшить в первую очередь?</h3>\n            <div style=\"display: flex; flex-direction: column; gap: 8px;\">\n              <button data-poll-opt=\"0\" data-votes=\"355\" style=\"appearance: none; -webkit-appearance: none; text-align: left; width: 100%; background: transparent; border: none; padding: 10px 12px; border-radius: 14px; cursor: pointer; font-family: inherit; transition: background .2s var(--ease-standard);\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; font-size: 15px; margin-bottom: 8px; color: var(--ink-700);\"><span style=\"display: flex; align-items: center; gap: 8px;\"><span data-check style=\"width: 18px; height: 18px; border-radius: 999px; background: var(--ink-800); color: #fff; display: none; align-items: center; justify-content: center;\"><svg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span>Скорость работы</span><span data-pct=\"58\" style=\"font-weight: 600;\">0%</span></div>\n                <div style=\"height: 18px; border-radius: 999px; background: var(--white); overflow: hidden;\"><div data-bar=\"58\" style=\"height: 100%; width: 0%; border-radius: 999px; background: var(--raif-yellow); transition: width .85s var(--ease-standard);\"></div></div>\n              </button>\n              <button data-poll-opt=\"1\" data-votes=\"165\" style=\"appearance: none; -webkit-appearance: none; text-align: left; width: 100%; background: transparent; border: none; padding: 10px 12px; border-radius: 14px; cursor: pointer; font-family: inherit; transition: background .2s var(--ease-standard);\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; font-size: 15px; margin-bottom: 8px; color: var(--ink-700);\"><span style=\"display: flex; align-items: center; gap: 8px;\"><span data-check style=\"width: 18px; height: 18px; border-radius: 999px; background: var(--ink-800); color: #fff; display: none; align-items: center; justify-content: center;\"><svg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span>Дизайн интерфейса</span><span data-pct=\"27\" style=\"font-weight: 600;\">0%</span></div>\n                <div style=\"height: 18px; border-radius: 999px; background: var(--white); overflow: hidden;\"><div data-bar=\"27\" style=\"height: 100%; width: 0%; border-radius: 999px; background: var(--sochi-60); transition: width .85s var(--ease-standard);\"></div></div>\n              </button>\n              <button data-poll-opt=\"2\" data-votes=\"92\" style=\"appearance: none; -webkit-appearance: none; text-align: left; width: 100%; background: transparent; border: none; padding: 10px 12px; border-radius: 14px; cursor: pointer; font-family: inherit; transition: background .2s var(--ease-standard);\">\n                <div style=\"display: flex; justify-content: space-between; align-items: center; font-size: 15px; margin-bottom: 8px; color: var(--ink-700);\"><span style=\"display: flex; align-items: center; gap: 8px;\"><span data-check style=\"width: 18px; height: 18px; border-radius: 999px; background: var(--ink-800); color: #fff; display: none; align-items: center; justify-content: center;\"><svg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5 9-10\"></path></svg></span>Поддержка</span><span data-pct=\"15\" style=\"font-weight: 600;\">0%</span></div>\n                <div style=\"height: 18px; border-radius: 999px; background: var(--white); overflow: hidden;\"><div data-bar=\"15\" style=\"height: 100%; width: 0%; border-radius: 999px; background: var(--manila-60); transition: width .85s var(--ease-standard);\"></div></div>\n              </button>\n            </div>\n            <div style=\"margin-top: 16px; font-size: 12px; color: var(--ink-400);\" data-poll-hint>Нажмите на вариант, чтобы проголосовать</div>\n          </div>\n\n          <!-- ---- QUIZ VIEW ---- -->\n          <div data-view=\"quiz\" style=\"display: none; flex: 1;\">\n            <div style=\"display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;\">\n              <span style=\"font-size: 12px; letter-spacing: 0.04em; color: var(--ink-400);\">КВИЗ · ВОПРОС 1 ИЗ 3</span>\n              <span style=\"font-size: 12px; font-weight: 600; color: var(--ink-700); background: var(--white); border-radius: 999px; padding: 4px 11px;\">⏱ 18 сек</span>\n            </div>\n            <h3 style=\"font-size: 24px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 20px; color: var(--ink-800);\">Что показывает ведущий, чтобы участники подключились?</h3>\n            <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 10px;\">\n              <button data-quiz-opt data-correct=\"1\" style=\"appearance: none; -webkit-appearance: none; text-align: left; background: var(--white); border: 2px solid transparent; border-radius: 16px; padding: 16px; cursor: pointer; font-family: inherit; font-size: 15px; color: var(--ink-800); display: flex; align-items: center; gap: 10px; transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard);\"><span data-quiz-mark style=\"flex: none; width: 20px; height: 20px; border-radius: 999px; background: var(--sochi-text); color: #fff; display: none; align-items: center; justify-content: center; font-size: 13px;\">✓</span>Код с экрана</button>\n              <button data-quiz-opt data-correct=\"0\" style=\"appearance: none; -webkit-appearance: none; text-align: left; background: var(--white); border: 2px solid transparent; border-radius: 16px; padding: 16px; cursor: pointer; font-family: inherit; font-size: 15px; color: var(--ink-800); display: flex; align-items: center; gap: 10px; transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard);\"><span data-quiz-mark style=\"flex: none; width: 20px; height: 20px; border-radius: 999px; background: #e5484d; color: #fff; display: none; align-items: center; justify-content: center; font-size: 13px;\">✕</span>Пароль от Wi-Fi</button>\n              <button data-quiz-opt data-correct=\"0\" style=\"appearance: none; -webkit-appearance: none; text-align: left; background: var(--white); border: 2px solid transparent; border-radius: 16px; padding: 16px; cursor: pointer; font-family: inherit; font-size: 15px; color: var(--ink-800); display: flex; align-items: center; gap: 10px; transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard);\"><span data-quiz-mark style=\"flex: none; width: 20px; height: 20px; border-radius: 999px; background: #e5484d; color: #fff; display: none; align-items: center; justify-content: center; font-size: 13px;\">✕</span>Свой e-mail</button>\n              <button data-quiz-opt data-correct=\"0\" style=\"appearance: none; -webkit-appearance: none; text-align: left; background: var(--white); border: 2px solid transparent; border-radius: 16px; padding: 16px; cursor: pointer; font-family: inherit; font-size: 15px; color: var(--ink-800); display: flex; align-items: center; gap: 10px; transition: border-color .2s var(--ease-standard), background .2s var(--ease-standard);\"><span data-quiz-mark style=\"flex: none; width: 20px; height: 20px; border-radius: 999px; background: #e5484d; color: #fff; display: none; align-items: center; justify-content: center; font-size: 13px;\">✕</span>QR-код соседа</button>\n            </div>\n            <div data-quiz-feedback style=\"min-height: 20px; margin-top: 16px; font-size: 14px; color: var(--ink-400);\">Выберите ответ — очки начислят за скорость и точность.</div>\n          </div>\n\n          <!-- ---- Q&A VIEW ---- -->\n          <div data-view=\"qa\" style=\"display: flex; flex-direction: column; flex: 1;\">\n            <div style=\"font-size: 12px; letter-spacing: 0.04em; color: var(--ink-400); margin-bottom: 14px;\">ВОПРОСЫ · <span data-qa-num>23</span> от участников</div>\n            <div data-qa-list style=\"display: flex; flex-direction: column; gap: 10px; flex: 1;\">\n              <div data-qa-item data-hover style=\"display: flex; gap: 14px; align-items: center; background: var(--white); border-radius: 16px; padding: 13px 14px; transition: background .2s var(--ease-standard);\">\n                <div style=\"flex: none; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 46px; padding: 7px 0; border-radius: 12px; background: var(--raif-yellow); color: var(--ink-900);\">\n                  <svg data-qa-up width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"cursor: pointer;\"><path d=\"M6 15l6-6 6 6\"></path></svg>\n                  <span data-qa-count style=\"font-weight: 600; font-size: 14px;\">128</span>\n                  <svg data-qa-down width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"opacity: .4; cursor: pointer;\"><path d=\"M6 9l6 6 6-6\"></path></svg>\n                </div>\n                <div style=\"min-width: 0;\">\n                  <div style=\"font-size: 15px; line-height: 1.35; margin-bottom: 7px; color: var(--ink-800);\">Когда появится мобильное приложение?</div>\n                  <div style=\"display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-400);\"><span style=\"flex: none; width: 18px; height: 18px; border-radius: 999px; background: var(--ink-200); display: flex; align-items: center; justify-content: center;\"><svg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--ink-500)\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"3.2\"></circle><path d=\"M5.5 19c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5\"></path></svg></span>Анонимно · 2 мин</div>\n                </div>\n              </div>\n              <div data-qa-item data-hover style=\"display: flex; gap: 14px; align-items: center; background: var(--white); border-radius: 16px; padding: 13px 14px; transition: background .2s var(--ease-standard);\">\n                <div style=\"flex: none; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 46px; padding: 7px 0; border-radius: 12px; background: var(--ink-100); color: var(--ink-800);\">\n                  <svg data-qa-up width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"cursor: pointer;\"><path d=\"M6 15l6-6 6 6\"></path></svg>\n                  <span data-qa-count style=\"font-weight: 600; font-size: 14px;\">94</span>\n                  <svg data-qa-down width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"opacity: .4; cursor: pointer;\"><path d=\"M6 9l6 6 6-6\"></path></svg>\n                </div>\n                <div style=\"min-width: 0;\">\n                  <div style=\"font-size: 15px; line-height: 1.35; margin-bottom: 7px; color: var(--ink-800);\">Можно ли интегрировать с нашей CRM?</div>\n                  <div style=\"display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-400);\"><span style=\"flex: none; width: 18px; height: 18px; border-radius: 999px; background: var(--paris-60); color: var(--ink-900); font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center;\">М</span>Марина К. · 5 мин</div>\n                </div>\n              </div>\n              <div data-qa-item data-hover style=\"display: flex; gap: 14px; align-items: center; background: var(--white); border-radius: 16px; padding: 13px 14px; transition: background .2s var(--ease-standard);\">\n                <div style=\"flex: none; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 46px; padding: 7px 0; border-radius: 12px; background: var(--ink-100); color: var(--ink-800);\">\n                  <svg data-qa-up width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"cursor: pointer;\"><path d=\"M6 15l6-6 6 6\"></path></svg>\n                  <span data-qa-count style=\"font-weight: 600; font-size: 14px;\">61</span>\n                  <svg data-qa-down width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"opacity: .4; cursor: pointer;\"><path d=\"M6 9l6 6 6-6\"></path></svg>\n                </div>\n                <div style=\"min-width: 0;\">\n                  <div style=\"font-size: 15px; line-height: 1.35; margin-bottom: 7px; color: var(--ink-800);\">Есть ли лимит на число участников?</div>\n                  <div style=\"display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-400);\"><span style=\"flex: none; width: 18px; height: 18px; border-radius: 999px; background: var(--porto-60); color: var(--ink-900); font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center;\">К</span>Ксения Л. · 18 мин</div>\n                </div>\n              </div>\n            </div>\n            <form data-qa-form style=\"display: flex; gap: 10px; margin-top: 18px;\">\n              <input data-qa-input maxlength=\"120\" autocomplete=\"off\" placeholder=\"Задайте свой вопрос…\" aria-label=\"Ваш вопрос\" style=\"flex: 1 1 auto; min-width: 0; appearance: none; -webkit-appearance: none; border: 1.5px solid var(--ink-200); background: var(--white); border-radius: 14px; padding: 0 16px; height: 46px; font-family: inherit; font-size: 15px; color: var(--ink-800); outline: none; transition: border-color .2s var(--ease-standard);\">\n              <button data-qa-send type=\"submit\" style=\"flex: none; appearance: none; -webkit-appearance: none; border: none; cursor: pointer; background: var(--raif-yellow); color: var(--ink-900); border-radius: 14px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; transition: background .2s var(--ease-standard), transform .12s var(--ease-standard);\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h13M13 6l6 6-6 6\"></path></svg></button>\n            </form>\n          </div>\n        </div>\n\n        <!-- ============ RIGHT: PRESENTER / ADMIN ============ -->\n        <div data-reveal data-hover style=\"opacity: 0; transform: translateY(28px); transition: opacity .7s var(--ease-standard) .1s, transform .7s var(--ease-standard) .1s; background: var(--sochi-15); border-radius: 24px; padding: 32px; color: var(--ink-800); min-height: 560px; display: flex; flex-direction: column;\">\n          <div style=\"display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;\">\n            <span style=\"font-size: 12px; letter-spacing: 0.06em; color: var(--sochi-text);\">ПАНЕЛЬ ВЕДУЩЕГО</span>            <span style=\"font-size: 12px; color: var(--ink-400);\">Идёт: <span data-admin-status>Модерация</span></span>\n          </div>\n\n          <!-- launch controls -->\n          <div style=\"display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;\">\n            <button data-launch=\"poll\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; border: none; border-radius: 14px; padding: 14px 16px; font-size: 15px; font-weight: 500; background: var(--white); color: var(--ink-800); transition: background .2s var(--ease-standard), color .2s var(--ease-standard);\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 5v14l11-7z\"></path></svg>Запустить опрос</button>\n            <button data-launch=\"quiz\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; border: none; border-radius: 14px; padding: 14px 16px; font-size: 15px; font-weight: 500; background: var(--white); color: var(--ink-800); transition: background .2s var(--ease-standard), color .2s var(--ease-standard);\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.1 9a3 3 0 1 1 5.8 1c-.4 1.4-2 2-2.9 3-.4.5-.5 1-.5 1.7\"></path><circle cx=\"12\" cy=\"18\" r=\"0.5\" fill=\"currentColor\" stroke-width=\"1.5\"></circle></svg>Запустить квиз</button>\n            <button data-launch=\"qa\" style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; border: none; border-radius: 14px; padding: 14px 16px; font-size: 15px; font-weight: 500; background: var(--white); color: var(--ink-800); transition: background .2s var(--ease-standard), color .2s var(--ease-standard);\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6L9 17l-5-5\"></path></svg>Модерация вопросов</button>\n          </div>\n\n          <div style=\"height: 1px; background: var(--ink-100); margin-bottom: 18px;\"></div>\n\n          <!-- admin: poll -->\n          <div data-admin=\"poll\" style=\"display: none; flex: 1;\">\n            <div style=\"font-size: 13px; color: var(--ink-500); margin-bottom: 18px;\">Опрос «Что улучшить в первую очередь?» в эфире.</div>\n            <div style=\"display: flex; gap: 12px; margin-bottom: 18px;\">\n              <div style=\"flex: 1; background: var(--white); border-radius: 16px; padding: 16px;\"><div style=\"font-size: 30px; font-weight: 600; font-family: var(--font-brand); line-height: 1;\"><span data-admin-total>612</span></div><div style=\"font-size: 12px; color: var(--ink-400); margin-top: 6px;\">голосов · live</div></div>\n              <div style=\"flex: 1; background: var(--white); border-radius: 16px; padding: 16px;\"><div style=\"font-size: 15px; font-weight: 600; line-height: 1.2; color: var(--sochi-text);\" data-admin-leader>Скорость работы</div><div style=\"font-size: 12px; color: var(--ink-400); margin-top: 6px;\">лидирует сейчас</div></div>\n            </div>\n            <div style=\"font-size: 13px; color: var(--ink-400); line-height: 1.5;\">Результаты обновляются на экране участника в реальном времени. Проголосуйте слева — увидите, как меняется лидер.</div>\n          </div>\n\n          <!-- admin: quiz -->\n          <div data-admin=\"quiz\" style=\"display: none; flex: 1;\">\n            <div style=\"display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 16px; color: var(--ink-500);\">Правильный ответ: <span style=\"color: var(--sochi-text); font-weight: 600;\">Код с экрана</span></div>\n            <div style=\"font-size: 12px; letter-spacing: 0.04em; color: var(--ink-400); margin-bottom: 10px;\">ТАБЛИЦА ЛИДЕРОВ</div>\n            <div data-board style=\"display: flex; flex-direction: column; gap: 7px;\">\n              <div style=\"display: flex; align-items: center; gap: 12px; background: var(--white); border-radius: 12px; padding: 11px 14px;\"><span style=\"font-size: 13px; color: var(--ink-500); width: 16px;\">1</span><span style=\"flex: 1; font-size: 14px;\">Анна П.</span><span style=\"font-weight: 600; font-size: 14px;\">280</span></div>\n              <div style=\"display: flex; align-items: center; gap: 12px; background: var(--white); border-radius: 12px; padding: 11px 14px;\"><span style=\"font-size: 13px; color: var(--ink-500); width: 16px;\">2</span><span style=\"flex: 1; font-size: 14px;\">Дмитрий В.</span><span style=\"font-weight: 600; font-size: 14px;\">240</span></div>\n              <div data-board-you style=\"display: flex; align-items: center; gap: 12px; background: var(--sochi-15); border: 1px solid var(--sochi-35); border-radius: 12px; padding: 11px 14px;\"><span style=\"font-size: 13px; color: var(--sochi-text); width: 16px;\" data-you-rank>4</span><span style=\"flex: 1; font-size: 14px; font-weight: 600;\">Вы</span><span style=\"font-weight: 600; font-size: 14px;\" data-you-score>0</span></div>\n              <div style=\"display: flex; align-items: center; gap: 12px; background: var(--white); border-radius: 12px; padding: 11px 14px;\"><span style=\"font-size: 13px; color: var(--ink-500); width: 16px;\">3</span><span style=\"flex: 1; font-size: 14px;\">Олег М.</span><span style=\"font-weight: 600; font-size: 14px;\">180</span></div>\n            </div>\n          </div>\n\n          <!-- admin: moderation -->\n          <div data-admin=\"qa\" style=\"display: flex; flex-direction: column; flex: 1;\">\n            <div style=\"display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;\">\n              <span style=\"font-size: 12px; letter-spacing: 0.04em; color: var(--ink-500);\">НА МОДЕРАЦИИ · <span data-mod-count>2</span></span>\n              <span style=\"font-size: 12px; color: var(--ink-400);\">одобренные видны слева</span>\n            </div>\n            <div data-mod-queue style=\"display: flex; flex-direction: column; gap: 10px; flex: 1;\">\n              <div data-mod-item style=\"background: var(--white); border-radius: 14px; padding: 14px;\">\n                <div style=\"font-size: 14px; line-height: 1.35; margin-bottom: 12px; color: var(--ink-800);\">Будет ли интеграция со Slack?</div>\n                <div style=\"display: flex; gap: 8px;\">\n                  <button data-mod-approve style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; border: none; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 600; background: var(--raif-yellow); color: var(--ink-900);\">Одобрить</button>\n                  <button data-mod-hide style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; border: none; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 500; background: var(--ink-100); color: var(--ink-600);\">Скрыть</button>\n                </div>\n              </div>\n              <div data-mod-item style=\"background: var(--white); border-radius: 14px; padding: 14px;\">\n                <div style=\"font-size: 14px; line-height: 1.35; margin-bottom: 12px; color: var(--ink-800);\">Можно ли брендировать экран опроса?</div>\n                <div style=\"display: flex; gap: 8px;\">\n                  <button data-mod-approve style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; border: none; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 600; background: var(--raif-yellow); color: var(--ink-900);\">Одобрить</button>\n                  <button data-mod-hide style=\"appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; border: none; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 500; background: var(--ink-100); color: var(--ink-600);\">Скрыть</button>\n                </div>\n              </div>\n            </div>\n            <div data-mod-empty style=\"display: none; flex: 1; align-items: center; justify-content: center; text-align: center; font-size: 13px; color: var(--ink-400); padding: 24px 0;\">Очередь пуста. Задайте вопрос на экране участника слева — он прилетит сюда на модерацию.</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </section>\n\n  <!-- FEATURES -->\n  <section id=\"features\" style=\"padding: clamp(72px, 10vw, 130px) clamp(20px, 5vw, 64px); background: var(--ink-100);\">\n    <div style=\"max-width: 1180px; margin: 0 auto;\">\n      <div data-reveal style=\"opacity: 0; transform: translateY(28px); transition: opacity .7s var(--ease-standard), transform .7s var(--ease-standard);\">\n        <div style=\"font-size: 13px; letter-spacing: 0.06em; color: var(--ink-400); margin-bottom: 14px;\">ВОЗМОЖНОСТИ</div>\n        <h2 style=\"font-size: clamp(32px, 5vw, 56px); font-weight: 500; letter-spacing: -0.02em; margin: 0 0 64px; max-width: 700px; color: var(--ink-800);\">Всё, чтобы услышать каждого</h2>\n      </div>\n      <div style=\"display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 24px;\">\n        <div data-reveal data-hover style=\"opacity: 0; transform: translateY(28px); transition: opacity .6s var(--ease-standard), transform .6s var(--ease-standard); background: var(--sochi-15); border-radius: 24px; padding: 32px; grid-row: span 2; display: flex; flex-direction: column;\">\n          <div style=\"font-size: 13px; letter-spacing: 0.04em; color: var(--sochi-text); margin-bottom: 16px;\">РЕАЛТАЙМ</div>\n          <h3 style=\"font-size: 26px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 12px; color: var(--ink-800);\">Живые результаты</h3>\n          <p style=\"font-size: 16px; line-height: 1.5; color: var(--ink-600); margin: 0 0 28px;\">Столбцы, облака слов и рейтинги обновляются на экране с каждым новым ответом. Идеально для зала и онлайна.</p>\n          <div style=\"margin-top: auto; display: flex; flex-direction: column; gap: 10px;\">\n            <div style=\"height: 12px; border-radius: 999px; background: var(--sochi-35); overflow: hidden;\"><div data-bar=\"72\" style=\"height: 100%; width: 0%; border-radius: 999px; background: var(--sochi-text); transition: width 1.1s var(--ease-standard);\"></div></div>\n            <div style=\"height: 12px; border-radius: 999px; background: var(--sochi-35); overflow: hidden;\"><div data-bar=\"54\" style=\"height: 100%; width: 0%; border-radius: 999px; background: var(--sochi-text); transition: width 1.1s var(--ease-standard) .12s;\"></div></div>\n            <div style=\"height: 12px; border-radius: 999px; background: var(--sochi-35); overflow: hidden;\"><div data-bar=\"38\" style=\"height: 100%; width: 0%; border-radius: 999px; background: var(--sochi-text); transition: width 1.1s var(--ease-standard) .24s;\"></div></div>\n          </div>\n        </div>\n        <div data-reveal data-hover style=\"opacity: 0; transform: translateY(28px); transition: opacity .6s var(--ease-standard) .05s, transform .6s var(--ease-standard) .05s; background: var(--paris-15); border-radius: 24px; padding: 32px;\">\n          <div style=\"font-size: 13px; letter-spacing: 0.04em; color: var(--paris-text); margin-bottom: 16px;\">Q&amp;A</div>\n          <h3 style=\"font-size: 22px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 10px; color: var(--ink-800);\">Сессии вопросов</h3>\n          <p style=\"font-size: 15px; line-height: 1.5; color: var(--ink-600); margin: 0;\">Аудитория задаёт вопросы и голосует за лучшие. Самое важное всегда наверху.</p>\n        </div>\n        <div data-reveal data-hover style=\"opacity: 0; transform: translateY(28px); transition: opacity .6s var(--ease-standard) .1s, transform .6s var(--ease-standard) .1s; background: var(--manila-15); border-radius: 24px; padding: 32px;\">\n          <div style=\"font-size: 13px; letter-spacing: 0.04em; color: var(--manila-text); margin-bottom: 16px;\">ЛОГИКА</div>\n          <h3 style=\"font-size: 22px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 10px; color: var(--ink-800);\">Ветвление</h3>\n          <p style=\"font-size: 15px; line-height: 1.5; color: var(--ink-600); margin: 0;\">Следующий вопрос зависит от ответа. Каждый проходит свой путь.</p>\n        </div>\n        <div data-reveal data-hover style=\"opacity: 0; transform: translateY(28px); transition: opacity .6s var(--ease-standard) .15s, transform .6s var(--ease-standard) .15s; background: var(--porto-15); border-radius: 24px; padding: 32px;\">\n          <div style=\"font-size: 13px; letter-spacing: 0.04em; color: var(--porto-text); margin-bottom: 16px;\">ДОВЕРИЕ</div>\n          <h3 style=\"font-size: 22px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 10px; color: var(--ink-800);\">Анонимность</h3>\n          <p style=\"font-size: 15px; line-height: 1.5; color: var(--ink-600); margin: 0;\">Честные ответы без имён и логинов. Включается одним переключателем.</p>\n        </div>\n        <div data-reveal data-hover style=\"opacity: 0; transform: translateY(28px); transition: opacity .6s var(--ease-standard) .2s, transform .6s var(--ease-standard) .2s; background: var(--raif-yellow); border-radius: 24px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between;\">\n          <h3 style=\"font-size: 22px; font-weight: 500; letter-spacing: -0.02em; margin: 0; color: var(--ink-900);\">Брендирование под вас</h3>\n          <p style=\"font-size: 15px; line-height: 1.5; color: var(--ink-900); margin: 14px 0 0; opacity: .8;\">Логотип, цвета и свой домен. Опрос выглядит как часть вашего продукта.</p>\n        </div>\n      </div>\n    </div>\n  </section>\n\n\n\n  <!-- QUOTE -->\n  <section style=\"padding: clamp(72px, 10vw, 130px) clamp(20px, 5vw, 64px); background-color: var(--ink-100); background-image: linear-gradient(rgba(43,45,51,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(43,45,51,0.05) 1px, transparent 1px); background-size: 40px 40px;\">\n    <div data-reveal style=\"max-width: 980px; margin: 0 auto; text-align: center; opacity: 0; transform: translateY(28px); transition: opacity .8s var(--ease-standard), transform .8s var(--ease-standard);\">\n      <div style=\"width: 56px; height: 56px; margin: 0 auto 28px; border-radius: 999px; background: var(--raif-yellow); display: flex; align-items: center; justify-content: center; gap: 5px;\">\n        <span style=\"width: 7px; height: 7px; border-radius: 999px; background: var(--ink-900);\"></span>\n        <span style=\"width: 7px; height: 7px; border-radius: 999px; background: var(--ink-900);\"></span>\n        <span style=\"width: 7px; height: 7px; border-radius: 999px; background: var(--ink-900);\"></span>\n      </div>\n      <p style=\"font-size: clamp(26px, 4vw, 46px); line-height: 1.25; letter-spacing: -0.02em; font-weight: 500; color: var(--ink-800); margin: 0 0 28px; text-wrap: balance;\">«„Есть вопросы“ заменил нам три инструмента. Теперь обратная связь — это не опрос раз в год, а ежедневная привычка команды.»</p>\n      <div style=\"font-size: 16px; color: var(--ink-500);\">Андрей Захаров · директор по стратегии, Райффайзенбанк</div>\n    </div>\n  </section>\n\n  <!-- FINAL CTA -->\n  <section style=\"padding: clamp(20px, 5vw, 48px);\">\n    <div data-reveal style=\"max-width: 1180px; margin: 0 auto; background: var(--raif-yellow); border-radius: 48px; padding: clamp(48px, 8vw, 96px) clamp(28px, 6vw, 80px); text-align: center; position: relative; overflow: hidden; opacity: 0; transform: translateY(28px); transition: opacity .8s var(--ease-standard), transform .8s var(--ease-standard);\">\n      <div style=\"position: absolute; top: -40px; right: -30px; width: 200px; height: 200px; border-radius: 999px; background: var(--raif-yellow-deep); opacity: .35;\"></div>\n      <div style=\"position: relative; z-index: 1;\">\n        <h2 style=\"font-size: clamp(34px, 6vw, 76px); line-height: 1.04; letter-spacing: -0.03em; font-weight: 500; margin: 0 0 22px; color: var(--ink-900);\">Начните слушать<br>уже сегодня</h2>\n        <p style=\"font-size: clamp(17px, 2vw, 21px); color: var(--ink-900); opacity: .82; margin: 0 0 36px; max-width: 540px; margin-left: auto; margin-right: auto;\">Первый опрос — за 30 секунд. Бесплатно, без карты и установки.</p>\n        <a href=\"/create\" data-go-builder style=\"display: inline-flex; text-decoration: none;\" data-hover>\n          <span style=\"display:inline-flex;align-items:center;justify-content:center;height:56px;padding:0 32px;background:var(--ink-900);color:var(--white);font-size:16px;font-weight:600;border-radius:999px;white-space:nowrap;transition:background .2s var(--ease-standard)\">Создать первый опрос</span>\n        </a>\n      </div>\n    </div>\n  </section>\n\n  <!-- FOOTER -->\n  <footer style=\"padding: 64px clamp(20px, 5vw, 64px) 48px; background: var(--ink-100);\">\n    <div style=\"max-width: 1180px; margin: 0 auto;\">\n      <div style=\"height: 2px; background: var(--ink-800); margin-bottom: 36px;\"></div>\n      <div style=\"display: flex; justify-content: space-between; flex-wrap: wrap; gap: 32px; align-items: flex-start;\">\n        <div data-hover>\n          <span style=\"position: relative; display: inline-flex; align-items: center; padding: 9px 16px; background: var(--sochi-35); border-radius: 14px; font-size: 19px; font-weight: 600; letter-spacing: -0.02em; color: var(--sochi-text); white-space: nowrap;\">Есть вопросы<span style=\"position: absolute; bottom: -7px; right: 20px; width: 0; height: 0; border-left: 11px solid transparent; border-right: 6px solid transparent; border-top: 11px solid var(--sochi-35);\"></span></span>\n        </div>\n        <div style=\"display: flex; gap: clamp(32px, 6vw, 80px); flex-wrap: wrap; font-size: 15px;\">\n          <div style=\"display: flex; flex-direction: column; gap: 12px;\">\n            <span style=\"color: var(--ink-400); font-size: 13px; letter-spacing: 0.04em;\">ПРОДУКТ</span>\n            <a href=\"#features\" data-hover style=\"color: var(--ink-700); text-decoration: none;\">Возможности</a>\n            <a href=\"#demo\" data-hover style=\"color: var(--ink-700); text-decoration: none;\">Демо</a>\n            <a href=\"#how\" data-hover style=\"color: var(--ink-700); text-decoration: none;\">Тарифы</a>\n          </div>\n          <div style=\"display: flex; flex-direction: column; gap: 12px;\">\n            <span style=\"color: var(--ink-400); font-size: 13px; letter-spacing: 0.04em;\">КОМПАНИЯ</span>\n            <a href=\"#\" data-hover style=\"color: var(--ink-700); text-decoration: none;\">О нас</a>\n            <a href=\"#\" data-hover style=\"color: var(--ink-700); text-decoration: none;\">Блог</a>\n            <a href=\"#\" data-hover style=\"color: var(--ink-700); text-decoration: none;\">Контакты</a>\n          </div>\n        </div>\n      </div>\n      <div style=\"margin-top: 40px; font-size: 13px; color: var(--ink-400);\">© 2026 «Есть вопросы» · Все права защищены</div>\n    </div>\n  </footer>\n\n  <!-- custom cursor -->\n  <div data-r=\"ring\" style=\"position: fixed; top: 0; left: 0; width: 34px; height: 34px; border: 2px solid var(--ink-800); border-radius: 999px; transform: translate(-100px, -100px) translate(-50%, -50%); pointer-events: none; z-index: 9999; transition: width .2s var(--ease-standard), height .2s var(--ease-standard), background .2s var(--ease-standard), border-color .2s var(--ease-standard); mix-blend-mode: normal;\"></div>\n  <div data-r=\"dot\" style=\"position: fixed; top: 0; left: 0; width: 6px; height: 6px; border-radius: 999px; background: var(--ink-800); transform: translate(-100px, -100px) translate(-50%, -50%); pointer-events: none; z-index: 9999;\"></div>\n\n</div>\n"

export default function HomePage() {
  const ref = useRef(null)
  const wired = useRef(false)

  useEffect(() => {
    const host = ref.current
    if (!host || wired.current) return
    wired.current = true
    const ctx = { _cleanup: [], _unmounted: false }
    ctx._landing = host.querySelector('[data-r="landing"]') || host
    ctx._shapes = host.querySelector('[data-r="shapes"]')
    ctx._prog = host.querySelector('[data-r="prog"]')
    ctx._ring = host.querySelector('[data-r="ring"]')
    ctx._dot = host.querySelector('[data-r="dot"]')

function _setup() {
    const root = ctx._landing;
    if (!root) return;
    _setupCursor(root);
    _setupParallax(root);
    _setupProgress();
    _setupObserver(root);
    _setupDemo(root);
    _setupJoin(root);
  }

function _setupJoin(root) {
    const form = root.querySelector('[data-join-form]');
    if (!form) return;
    const input = form.querySelector('[data-join-input]');
    const btn = form.querySelector('[data-join-btn]');
    const hint = form.querySelector('[data-join-hint]');
    const defaultHint = 'Быстрый вход на мероприятие';

    const setHint = (text, color) => { if (hint) { hint.textContent = text; hint.style.color = color; } };

    input.addEventListener('focus', () => { input.style.borderColor = 'var(--ink-800)'; });
    input.addEventListener('blur', () => { input.style.borderColor = 'var(--ink-200)'; });
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
      if (hint.textContent !== defaultHint) setHint(defaultHint, 'var(--ink-400)');
    });
    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--raif-yellow-deep)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--raif-yellow)'; });
    btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.97)'; });
    btn.addEventListener('mouseup', () => { btn.style.transform = 'none'; });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (input.value || '').trim();
      if (code.length < 4) {
        input.style.borderColor = '#e5484d';
        setHint('Введите код мероприятия (4–6 символов)', '#e5484d');
        input.focus();
        return;
      }
      btn.textContent = 'Подключаем…';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      setHint('Ищем мероприятие с кодом ' + code + '…', 'var(--ink-500)');
      ctx._joinTimer = setTimeout(() => {
        if (ctx._unmounted) return;
        btn.textContent = 'Войти';
        btn.disabled = false;
        btn.style.opacity = '1';
        input.style.borderColor = 'var(--sochi-text)';
        setHint('Вы в эфире! Прокрутите вниз — так выглядит сессия глазами участника.', 'var(--sochi-text)');
        const demo = root.querySelector('#demo');
        if (demo) window.scrollTo({ top: demo.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
      }, 1100);
    });
    ctx._cleanup.push(() => clearTimeout(ctx._joinTimer));
  }

function _setupDemo(root) {
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    // ===== Mode switching (presenter drives participant) =====
    let mode = 'qa';
    const partStatus = root.querySelector('[data-part-status]');
    const adminStatus = root.querySelector('[data-admin-status]');
    const launchBtns = [...root.querySelectorAll('[data-launch]')];
    const partLabels = { poll: 'Идёт опрос', quiz: 'Идёт квиз', qa: 'Вопросы и ответы' };
    const adminLabels = { poll: 'Опрос', quiz: 'Квиз', qa: 'Модерация' };
    const setMode = (m) => {
      mode = m;
      ['poll', 'quiz', 'qa'].forEach((k) => {
        const disp = k === 'qa' ? 'flex' : 'block';
        root.querySelectorAll('[data-view="' + k + '"]').forEach((el) => { el.style.display = k === m ? disp : 'none'; });
        root.querySelectorAll('[data-admin="' + k + '"]').forEach((el) => { el.style.display = k === m ? disp : 'none'; });
      });
      launchBtns.forEach((b) => {
        const on = b.getAttribute('data-launch') === m;
        b.style.background = on ? 'var(--raif-yellow)' : 'var(--white)';
        b.style.color = on ? 'var(--ink-900)' : 'var(--ink-700)';
        b.style.fontWeight = on ? '600' : '500';
      });
      if (partStatus) partStatus.textContent = partLabels[m];
      if (adminStatus) adminStatus.textContent = adminLabels[m];
    };
    launchBtns.forEach((b) => {
      const m = b.getAttribute('data-launch');
      b.addEventListener('click', () => setMode(m));
      b.addEventListener('mouseenter', () => { if (mode !== m) b.style.background = 'var(--sochi-35)'; });
      b.addEventListener('mouseleave', () => { if (mode !== m) b.style.background = 'var(--white)'; });
    });

    // ===== Interactive poll (+ mirror to presenter panel) =====
    const btns = [...root.querySelectorAll('[data-poll-opt]')];
    if (btns.length) {
      const totalEl = root.querySelector('[data-poll-total]');
      const hintEl = root.querySelector('[data-poll-hint]');
      const adminTotal = root.querySelector('[data-admin-total]');
      const adminLeader = root.querySelector('[data-admin-leader]');
      const labels = ['Скорость работы', 'Дизайн интерфейса', 'Поддержка'];
      const base = btns.map((b) => parseInt(b.getAttribute('data-votes'), 10) || 0);
      let pick = -1;
      const render = () => {
        const cur = base.slice();
        if (pick >= 0) cur[pick] += 1;
        const total = cur.reduce((a, b) => a + b, 0) || 1;
        let leadI = 0;
        btns.forEach((btn, i) => {
          if (cur[i] > cur[leadI]) leadI = i;
          const pct = Math.round((cur[i] / total) * 100);
          const bar = btn.querySelector('[data-bar]');
          const pctEl = btn.querySelector('[data-pct]');
          const check = btn.querySelector('[data-check]');
          if (bar) bar.style.width = pct + '%';
          if (pctEl) pctEl.textContent = pct + '%';
          if (check) check.style.display = i === pick ? 'inline-flex' : 'none';
          btn.style.background = i === pick ? 'rgba(43,45,51,0.06)' : 'transparent';
        });
        if (totalEl) totalEl.textContent = total.toLocaleString('ru-RU');
        if (adminTotal) adminTotal.textContent = total.toLocaleString('ru-RU');
        if (adminLeader) adminLeader.textContent = labels[leadI];
        if (hintEl) hintEl.textContent = pick >= 0 ? 'Спасибо! Ваш голос учтён' : 'Нажмите на вариант, чтобы проголосовать';
      };
      btns.forEach((btn, i) => {
        btn.addEventListener('click', () => { pick = pick === i ? -1 : i; render(); });
        btn.addEventListener('mouseenter', () => { if (i !== pick) btn.style.background = 'rgba(43,45,51,0.04)'; });
        btn.addEventListener('mouseleave', () => { if (i !== pick) btn.style.background = 'transparent'; });
      });
      render();
      // live incoming votes only while the poll is the active activity
      ctx._demoSim = setInterval(() => {
        if (ctx._unmounted || mode !== 'poll') return;
        base[Math.floor(Math.random() * base.length)] += 1 + Math.floor(Math.random() * 3);
        render();
      }, 1700);
      ctx._cleanup.push(() => clearInterval(ctx._demoSim));
    }

    // ===== Interactive quiz =====
    const qOpts = [...root.querySelectorAll('[data-quiz-opt]')];
    if (qOpts.length) {
      const feedback = root.querySelector('[data-quiz-feedback]');
      const youScore = root.querySelector('[data-you-score]');
      const youRank = root.querySelector('[data-you-rank]');
      const youRow = root.querySelector('[data-board-you]');
      let answered = false;
      qOpts.forEach((opt) => {
        opt.addEventListener('mouseenter', () => { if (!answered) opt.style.borderColor = 'var(--ink-200)'; });
        opt.addEventListener('mouseleave', () => { if (!answered) opt.style.borderColor = 'transparent'; });
        opt.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const correct = opt.getAttribute('data-correct') === '1';
          qOpts.forEach((o) => {
            o.style.pointerEvents = 'none';
            const mark = o.querySelector('[data-quiz-mark]');
            if (o.getAttribute('data-correct') === '1') {
              o.style.borderColor = 'var(--sochi-text)'; o.style.background = 'var(--sochi-35)';
              if (mark) mark.style.display = 'flex';
            } else if (o === opt) {
              o.style.borderColor = '#e5484d'; o.style.background = 'rgba(229,72,77,.1)';
              if (mark) mark.style.display = 'flex';
            }
          });
          if (feedback) {
            feedback.textContent = correct ? 'Верно! +100 очков — вы поднялись в таблице лидеров.' : 'Почти! Правильный ответ — «Код с экрана».';
            feedback.style.color = correct ? 'var(--sochi-text)' : '#e5484d';
          }
          const pts = correct ? 100 : 0;
          if (youScore) youScore.textContent = pts;
          if (correct && youRank && youRow) {
            youRank.textContent = '3';
            const board = youRow.parentNode;
            const third = [...board.children].find((c) => c !== youRow && c.querySelector('span') && c.querySelector('span').textContent.trim() === '3');
            if (third) { third.querySelector('span').textContent = '4'; board.insertBefore(youRow, third); }
          }
        });
      });
    }

    // ===== Q&A votes + moderation loop =====
    const list = root.querySelector('[data-qa-list]');
    if (list) {
      const numEl = root.querySelector('[data-qa-num]');
      const queue = root.querySelector('[data-mod-queue]');
      const modCountEl = root.querySelector('[data-mod-count]');
      const modEmpty = root.querySelector('[data-mod-empty]');
      let qaNum = parseInt((numEl && numEl.textContent) || '23', 10) || 23;

      const resort = () => {
        [...list.querySelectorAll('[data-qa-item]')]
          .sort((a, b) => (b._base + b._vote) - (a._base + a._vote))
          .forEach((n) => list.appendChild(n));
      };
      const wire = (item) => {
        const countEl = item.querySelector('[data-qa-count]');
        const up = item.querySelector('[data-qa-up]');
        const down = item.querySelector('[data-qa-down]');
        if (item._base == null) item._base = parseInt(countEl.textContent, 10) || 0;
        if (item._vote == null) item._vote = 0;
        const upd = () => {
          countEl.textContent = item._base + item._vote;
          if (up) up.style.stroke = item._vote === 1 ? 'var(--sochi-text)' : '';
          if (down) { down.style.stroke = item._vote === -1 ? '#e5484d' : ''; down.style.opacity = item._vote === -1 ? '1' : '.4'; }
          resort();
        };
        if (up) up.addEventListener('click', (e) => { e.stopPropagation(); item._vote = item._vote === 1 ? 0 : 1; upd(); });
        if (down) down.addEventListener('click', (e) => { e.stopPropagation(); item._vote = item._vote === -1 ? 0 : -1; upd(); });
      };
      [...list.querySelectorAll('[data-qa-item]')].forEach(wire);

      const publicNode = (text, meta) => {
        const node = document.createElement('div');
        node.setAttribute('data-qa-item', '');
        node.style.cssText = 'display: flex; gap: 14px; align-items: center; background: var(--sochi-35); border: 1px solid var(--sochi-60); border-radius: 16px; padding: 13px 14px; transition: background .2s var(--ease-standard); opacity: 0; transform: translateY(-8px);';
        node.innerHTML = `
          <div style="flex: none; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 46px; padding: 7px 0; border-radius: 12px; background: var(--ink-100); color: var(--ink-800);">
            <svg data-qa-up width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer;"><path d="M6 15l6-6 6 6"></path></svg>
            <span data-qa-count style="font-weight: 600; font-size: 14px;">1</span>
            <svg data-qa-down width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="opacity: .4; cursor: pointer;"><path d="M6 9l6 6 6-6"></path></svg>
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 15px; line-height: 1.35; margin-bottom: 7px; color: var(--ink-800);">${esc(text)}</div>
            <div style="display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-400);"><span style="flex: none; width: 18px; height: 18px; border-radius: 999px; background: var(--sochi-60); color: var(--ink-900); display: flex; align-items: center; justify-content: center;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>${esc(meta)}</div>
          </div>`;
        node._base = 1; node._vote = 0;
        list.insertBefore(node, list.firstChild);
        wire(node);
        requestAnimationFrame(() => { node.style.opacity = '1'; node.style.transform = 'none'; });
        setTimeout(() => { node.style.background = 'var(--white)'; node.style.borderColor = 'transparent'; }, 1400);
        qaNum += 1; if (numEl) numEl.textContent = qaNum;
      };

      const refreshMod = () => {
        const n = queue ? queue.querySelectorAll('[data-mod-item]').length : 0;
        if (modCountEl) modCountEl.textContent = n;
        if (modEmpty) modEmpty.style.display = n === 0 ? 'flex' : 'none';
        if (queue) queue.style.display = n === 0 ? 'none' : 'flex';
      };
      const wireMod = (item, meta) => {
        const approve = item.querySelector('[data-mod-approve]');
        const hide = item.querySelector('[data-mod-hide]');
        const remove = () => { item.style.opacity = '0'; item.style.transform = 'translateY(-8px)'; setTimeout(() => { item.remove(); refreshMod(); }, 260); };
        if (approve) approve.addEventListener('click', () => {
          const t = (item.getAttribute('data-text') || (item.querySelector('div') && item.querySelector('div').textContent) || '').trim();
          publicNode(t, meta || 'Одобрено ведущим');
          remove();
        });
        if (hide) hide.addEventListener('click', remove);
      };
      if (queue) [...queue.querySelectorAll('[data-mod-item]')].forEach((it) => wireMod(it, 'Одобрено ведущим'));
      refreshMod();

      // ask a question -> goes to moderation queue
      const form = root.querySelector('[data-qa-form]');
      if (form) {
        const input = form.querySelector('[data-qa-input]');
        const send = form.querySelector('[data-qa-send]');
        input.addEventListener('focus', () => { input.style.borderColor = 'var(--raif-yellow-deep)'; });
        input.addEventListener('blur', () => { input.style.borderColor = 'var(--ink-200)'; });
        send.addEventListener('mouseenter', () => { send.style.background = 'var(--raif-yellow-deep)'; });
        send.addEventListener('mouseleave', () => { send.style.background = 'var(--raif-yellow)'; });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const text = (input.value || '').trim();
          if (text.length < 3) { input.style.borderColor = '#e5484d'; input.focus(); return; }
          input.value = '';
          if (!queue) { publicNode(text, 'Вы · только что'); return; }
          const m = document.createElement('div');
          m.setAttribute('data-mod-item', '');
          m.setAttribute('data-text', text);
          m.style.cssText = 'background: var(--white); border: 1px solid var(--sochi-35); border-radius: 14px; padding: 14px; opacity: 0; transform: translateY(-8px); transition: opacity .3s var(--ease-standard), transform .3s var(--ease-standard);';
          m.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;"><span style="font-size: 10px; letter-spacing: 0.04em; font-weight: 600; color: var(--ink-900); background: var(--raif-yellow); border-radius: 999px; padding: 2px 8px;">НОВЫЙ</span><span style="font-size: 12px; color: var(--ink-400);">от участника</span></div>
            <div style="font-size: 14px; line-height: 1.35; margin-bottom: 12px; color: var(--ink-800);">${esc(text)}</div>
            <div style="display: flex; gap: 8px;">
              <button data-mod-approve style="appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; border: none; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 600; background: var(--raif-yellow); color: var(--ink-900);">Одобрить</button>
              <button data-mod-hide style="appearance: none; -webkit-appearance: none; cursor: pointer; font-family: inherit; border: none; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 500; background: var(--ink-100); color: var(--ink-600);">Скрыть</button>
            </div>`;
          queue.insertBefore(m, queue.firstChild);
          wireMod(m, 'Вы · одобрено');
          refreshMod();
          requestAnimationFrame(() => { m.style.opacity = '1'; m.style.transform = 'none'; });
          // nudge the presenter status so the user notices the new item on the right
          if (adminStatus && mode !== 'qa') adminStatus.textContent = adminLabels[mode] + ' · +1 на модерации';
        });
      }
    }

    setMode('qa');
  }

function _setupCursor(root) {
    const ring = ctx._ring, dot = ctx._dot;
    if (!ring || !dot) return;
    let rx = -100, ry = -100, x = -100, y = -100;
    const move = (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      ctx._curRaf = requestAnimationFrame(loop);
    };
    const over = (e) => {
      if (e.target.closest && e.target.closest('[data-hover], a, button')) {
        ring.style.width = '56px'; ring.style.height = '56px';
        ring.style.background = 'rgba(254,230,0,0.22)'; ring.style.borderColor = 'var(--raif-yellow-deep)';
      }
    };
    const out = (e) => {
      if (e.target.closest && e.target.closest('[data-hover], a, button')) {
        ring.style.width = '34px'; ring.style.height = '34px';
        ring.style.background = 'transparent'; ring.style.borderColor = 'var(--ink-800)';
      }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mouseout', out);
    loop();
    // hide native cursor only after ours is live, and only on fine pointers
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      root.style.cursor = 'none';
    } else {
      ring.style.display = 'none'; dot.style.display = 'none';
    }
    ctx._cleanup.push(() => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mouseout', out);
      cancelAnimationFrame(ctx._curRaf);
      root.style.cursor = '';
    });
  }

function _setupParallax(root) {
    const shapes = ctx._shapes;
    if (!shapes) return;
    const items = Array.from(shapes.querySelectorAll('[data-depth]'));
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const move = (e) => {
      const w = window.innerWidth, h = window.innerHeight;
      tx = (e.clientX - w / 2); ty = (e.clientY - h / 2);
    };
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      items.forEach((el) => {
        const d = parseFloat(el.getAttribute('data-depth')) || 0;
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
      ctx._pxRaf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move);
    loop();
    ctx._cleanup.push(() => { window.removeEventListener('mousemove', move); cancelAnimationFrame(ctx._pxRaf); });
  }

function _setupProgress() {
    const prog = ctx._prog;
    if (!prog) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY || doc.scrollTop) / max : 0;
      prog.style.width = Math.max(0, Math.min(1, p)) * 100 + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    ctx._cleanup.push(() => window.removeEventListener('scroll', onScroll));
  }

function _setupObserver(root) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.hasAttribute('data-reveal')) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
        // counters & bars inside this revealed block
        _animateCounters(el);
        _animateBars(el);
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    ctx._io = io;
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    // Robust fallback — IntersectionObserver does not deliver entries in some
    // embed environments. A scroll-driven check reveals any block once its top
    // crosses ~92% of the viewport, and runs once on load for above-fold blocks.
    const revealVisible = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      root.querySelectorAll('[data-reveal]').forEach((el) => {
        if (el._revealed) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          el._revealed = true;
          el.style.opacity = '1';
          el.style.transform = 'none';
          _animateCounters(el);
          _animateBars(el);
        }
      });
    };
    window.addEventListener('scroll', revealVisible, { passive: true });
    window.addEventListener('resize', revealVisible);
    revealVisible();
    // run a few more times as fonts/layout settle
    [120, 400, 900].forEach((t) => setTimeout(revealVisible, t));
    ctx._cleanup.push(() => {
      window.removeEventListener('scroll', revealVisible);
      window.removeEventListener('resize', revealVisible);
    });

    // hero bars animate immediately (variant B)
    _animateBars(root);
  }

function _animateCounters(scope) {
    scope.querySelectorAll('[data-count]').forEach((el) => {
      if (el._done) return; el._done = true;
      const target = parseFloat(el.getAttribute('data-count')) || 0;
      const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      const dur = 1400; const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        const v = (target * e).toFixed(dec);
        el.textContent = String(v).replace('.', ',');
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

function _animateBars(scope) {
    scope.querySelectorAll('[data-bar]').forEach((el) => {
      if (el._done) return; el._done = true;
      const target = parseFloat(el.getAttribute('data-bar')) || 0;
      requestAnimationFrame(() => { el.style.width = target + '%'; });
    });
    scope.querySelectorAll('[data-pct]').forEach((el) => {
      if (el._done) return; el._done = true;
      const target = parseFloat(el.getAttribute('data-pct')) || 0;
      const dur = 1200; const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * e) + '%';
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

function _setupNav() {
    const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    const showBuilder = () => {
      if (ctx._landing) ctx._landing.style.display = 'none';
      if (ctx._builder) ctx._builder.style.display = 'flex';
      if (ctx._prog) ctx._prog.style.display = 'none';
      if (ctx._ring) ctx._ring.style.display = 'none';
      if (ctx._dot) ctx._dot.style.display = 'none';
      window.scrollTo(0, 0);
    };
    const showLanding = (demo) => {
      if (ctx._builder) ctx._builder.style.display = 'none';
      if (ctx._landing) ctx._landing.style.display = 'block';
      if (ctx._prog) ctx._prog.style.display = '';
      if (fine && ctx._ring) ctx._ring.style.display = '';
      if (fine && ctx._dot) ctx._dot.style.display = '';
      const d = demo && ctx._landing && ctx._landing.querySelector('#demo');
      requestAnimationFrame(() => {
        if (d) window.scrollTo({ top: d.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
        else window.scrollTo(0, 0);
      });
    };
    document.addEventListener('click', (e) => {
      if (!e.target.closest) return;
      const gb = e.target.closest('[data-go-builder]');
      const gd = e.target.closest('[data-go-demo]');
      const gl = e.target.closest('[data-go-landing]');
      if (gb) { e.preventDefault(); window.location.assign('/create'); }
      else if (gd) { e.preventDefault(); showLanding(true); }
      else if (gl) { e.preventDefault(); showLanding(false); }
    });
  }

    ctx._raf = requestAnimationFrame(() => { _setup(); _setupNav() })

    return () => {
      ctx._unmounted = true
      cancelAnimationFrame(ctx._raf)
      clearInterval(ctx._demoSim)
      clearTimeout(ctx._demoWatch)
      clearTimeout(ctx._joinTimer)
      if (ctx._io) ctx._io.disconnect()
      ctx._cleanup.forEach((f) => { try { f() } catch (e) {} })
    }
  }, [])

  return (
    <>
      <style>{STYLE}</style>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: MARKUP }} />
    </>
  )
}
