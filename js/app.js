/* ============================================================================
 * QA Interview Mastery — application logic
 * ==========================================================================*/
(function () {
  "use strict";

  const { tracks, quiz } = window.QA_DATA;
  const STORE_KEY = "qa_mastery_v1";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- persistent state ---------- */
  const defaultState = { done: {}, theme: "dark", bestScore: 0, mocksTaken: 0, lastView: "dashboard", docsQuiz: {} };
  let state = load();

  function load() {
    try {
      return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(STORE_KEY)) || {});
    } catch { return { ...defaultState }; }
  }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  const cardId = (t, i) => `${t}:${i}`;
  const totalCards = tracks.reduce((n, t) => n + t.cards.length, 0);
  const doneCount = () => Object.values(state.done).filter(Boolean).length;
  const trackDone = (t) => t.cards.filter((_, i) => state.done[cardId(t.id, i)]).length;
  const overallPct = () => Math.round((doneCount() / totalCards) * 100);

  /* ---------- mini markdown → html ---------- */
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function mdInline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function mdTable(lines) {
    const rows = lines.filter((l) => l.includes("|"));
    if (rows.length < 2) return "";
    const cells = (l) => l.split("|").slice(1, -1).map((c) => c.trim());
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    let h = "<table><thead><tr>" + head.map((c) => `<th>${mdInline(c)}</th>`).join("") + "</tr></thead><tbody>";
    h += body.map((r) => "<tr>" + r.map((c) => `<td>${mdInline(c)}</td>`).join("") + "</tr>").join("");
    return h + "</tbody></table>";
  }

  function renderMarkdown(md) {
    const blocks = md.split(/\n\n+/);
    let html = "";
    for (const block of blocks) {
      const lines = block.split("\n");
      // table
      if (lines.length >= 2 && lines[0].includes("|") && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[1])) {
        html += mdTable(lines); continue;
      }
      // ordered list
      if (/^\d+\.\s/.test(lines[0])) {
        html += "<ol>" + groupList(lines, /^\d+\.\s/) + "</ol>"; continue;
      }
      // unordered list
      if (/^[-*]\s/.test(lines[0])) {
        html += "<ul>" + groupList(lines, /^[-*]\s/) + "</ul>"; continue;
      }
      html += `<p>${mdInline(block.replace(/\n/g, " "))}</p>`;
    }
    return html;
  }

  // supports nested sub-bullets indented under a list item
  function groupList(lines, re) {
    let out = "", cur = null;
    for (const ln of lines) {
      if (re.test(ln)) {
        if (cur !== null) out += `<li>${mdInline(cur)}</li>`;
        cur = ln.replace(re, "");
      } else if (/^\s+[-*]\s/.test(ln)) {
        cur += ` — ${mdInline(ln.replace(/^\s+[-*]\s/, ""))}`;
      } else if (cur !== null) {
        cur += " " + ln.trim();
      }
    }
    if (cur !== null) out += `<li>${mdInline(cur)}</li>`;
    return out;
  }

  function codeBlock(code) {
    return `<pre class="codeblock">${esc(code)}</pre>`;
  }

  /* ============================ VIEWS ============================ */
  const content = $("#content");
  let mockTimer = null;
  let viewTeardown = null; // cleanup for listeners/observers a view installs

  function setView(view, opts = {}) {
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    if (viewTeardown) { viewTeardown(); viewTeardown = null; }
    state.lastView = view; save();
    $$(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $("#sidebar").classList.remove("open");
    const fn = views[view] || views.dashboard;
    content.innerHTML = "";
    fn(opts);
    content.scrollIntoView({ block: "start" });
    window.scrollTo(0, 0);
  }

  const views = { dashboard, learn, flashcards, mock, roadmap, guide, docs, glossary, types, tools };

  /* ---------- DASHBOARD ---------- */
  function dashboard() {
    const pct = overallPct();

    content.innerHTML = `
      <section class="hero">
        <span class="eyebrow" style="color:#fff;opacity:.85">Senior QA Engineer · Interview Prep</span>
        <h1>Crack your next QA interview with confidence.</h1>
        <p>A structured path through ${totalCards} senior-level questions across ${tracks.length} domains — test strategy, automation architecture, API, performance, SQL, security, system design & behavioral. Learn it, flip it, then prove it in a timed mock.</p>
        <div class="hero-cta">
          <button class="btn btn-light" data-go="learn">📚 Start learning</button>
          <button class="btn btn-outline" data-go="mock">🎤 Take a mock interview</button>
        </div>
      </section>

      <div class="stat-grid">
        ${stat("📈", pct + "%", "Overall mastery", true, pct)}
        ${stat("🔬", docsCompletedCount() + " / " + docsData.length, "Process chapters", true, docsPct())}
        ${stat("✅", doneCount() + " / " + totalCards, "Questions mastered")}
        ${stat("🏆", (state.bestScore || 0) + "%", "Best mock score")}
        ${stat("🎤", state.mocksTaken || 0, "Mocks completed")}
      </div>

      <div class="dash-cols">
        <div class="card">
          <div style="padding:18px 20px 6px"><div class="section-title">🎯 Progress by domain</div></div>
          <div class="topic-row feat-row" data-go="docs">
            <span class="t-ico">🔬</span>
            <span class="t-name">QA Process · animated deep-dive <span class="pill accent" style="margin-left:6px">guided</span></span>
            <div class="t-bar progress-track" style="margin-top:0"><div class="progress-fill" style="width:${docsPct()}%"></div></div>
            <span class="t-pct">${docsCompletedCount()}/${docsData.length}</span>
          </div>
          <div>${tracks.map(topicRow).join("")}</div>
        </div>
        <div class="card">
          <div style="padding:18px 20px 6px"><div class="section-title">💡 Senior interview edge</div></div>
          <div class="tip-list">
            ${tip("Lead with the <strong>why</strong>, not the <strong>what</strong> — seniors are hired for judgement and trade-offs.")}
            ${tip("Always quantify results: “cut regression from 3 days to 4 hours”, “reduced escaped defects 40%.”")}
            ${tip("Frame quality as a <strong>whole-team</strong> property — you remove the gate, you’re not the gate.")}
            ${tip("Use <strong>STAR</strong> for behavioral, and tie every story to business impact.")}
            ${tip("When unsure, reason out loud about <strong>risk</strong> — it’s the senior mindset interviewers test for.")}
          </div>
        </div>
      </div>`;
  }

  const stat = (ico, num, lbl, bar, pct) => `
    <div class="card stat">
      <span class="ico">${ico}</span>
      <div class="num">${num}</div>
      <div class="lbl">${lbl}</div>
      ${bar ? `<div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>` : ""}
    </div>`;

  const tip = (html) => `<div class="tip"><span class="tip-ico">→</span><span>${html}</span></div>`;

  function topicRow(t) {
    const d = trackDone(t), total = t.cards.length, pct = Math.round((d / total) * 100);
    return `<div class="topic-row" data-track="${t.id}">
      <span class="t-ico">${t.icon}</span>
      <span class="t-name">${t.name}</span>
      <div class="t-bar progress-track" style="margin-top:0"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="t-pct">${d}/${total}</span>
    </div>`;
  }

  /* ---------- LEARN (track list + detail) ---------- */
  function learn(opts) {
    if (opts.track) return learnDetail(opts.track);
    content.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">Learn</span>
        <h1>Study domains</h1>
        <p>Twelve curated tracks. Expand a question to see a senior-grade answer, mark it mastered, and watch your progress climb.</p>
      </div>
      <div class="track-grid">
        ${tracks.map((t) => {
          const d = trackDone(t), total = t.cards.length, pct = Math.round((d / total) * 100);
          return `<div class="card track-card" data-track="${t.id}">
            <span class="tc-ico">${t.icon}</span>
            <h3>${t.name}</h3>
            <p>${t.blurb}</p>
            <div class="tag-row">${(t.tags || []).map((x) => `<span class="pill">${x}</span>`).join("")}</div>
            <div class="tc-foot">
              <span class="muted tiny">${d}/${total} mastered</span>
              <div class="t-bar progress-track" style="width:80px;margin-top:0"><div class="progress-fill" style="width:${pct}%"></div></div>
            </div>
          </div>`;
        }).join("")}
      </div>`;
  }

  function learnDetail(trackId) {
    const t = tracks.find((x) => x.id === trackId);
    if (!t) return learn({});
    content.innerHTML = `
      <button class="back-link" data-go="learn">← All domains</button>
      <div class="page-head">
        <span class="eyebrow">${t.icon} ${(t.tags || []).join(" · ")}</span>
        <h1>${t.name}</h1>
        <p>${t.blurb}</p>
      </div>
      <div id="qaList">${t.cards.map((c, i) => qaCard(t, c, i)).join("")}</div>`;
  }

  function qaCard(t, c, i) {
    const id = cardId(t.id, i);
    const done = !!state.done[id];
    return `<div class="card qa ${done ? "done" : ""}" data-card="${id}">
      <div class="qa-head">
        <div class="qa-check" data-check="${id}" title="Mark mastered">✓</div>
        <div class="qa-q">${mdInline(c.q)}</div>
        <span class="lvl-tag">${c.level}</span>
        <span class="qa-chev">▶</span>
      </div>
      <div class="qa-body">
        ${renderMarkdown(c.a)}
        ${c.code ? codeBlock(c.code) : ""}
      </div>
    </div>`;
  }

  /* ---------- FLASHCARDS ---------- */
  let fcDeck = [], fcIndex = 0;

  function flashcards() {
    content.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">Flashcards</span>
        <h1>Active recall</h1>
        <p>The fastest way to make answers stick. Pick a domain, read the question, recall the answer, then flip to check.</p>
      </div>
      <div class="fc-toolbar">
        <select id="fcSelect">
          <option value="all">🎴 All domains (${totalCards})</option>
          ${tracks.map((t) => `<option value="${t.id}">${t.icon} ${t.name} (${t.cards.length})</option>`).join("")}
        </select>
        <button class="btn btn-ghost" id="fcShuffle">🔀 Shuffle</button>
      </div>
      <div class="fc-stage" id="fcStage"></div>`;

    $("#fcSelect").addEventListener("change", buildDeck);
    $("#fcShuffle").addEventListener("click", () => { shuffle(fcDeck); fcIndex = 0; renderCard(); });
    buildDeck();
  }

  function buildDeck() {
    const sel = $("#fcSelect").value;
    fcDeck = [];
    tracks.forEach((t) => {
      if (sel === "all" || sel === t.id)
        t.cards.forEach((c, i) => fcDeck.push({ ...c, trackId: t.id, idx: i, icon: t.icon, track: t.name }));
    });
    fcIndex = 0;
    renderCard();
  }

  function renderCard() {
    const stage = $("#fcStage");
    if (!fcDeck.length) { stage.innerHTML = `<p class="muted">No cards.</p>`; return; }
    const c = fcDeck[fcIndex];
    const id = cardId(c.trackId, c.idx);
    const done = !!state.done[id];
    stage.innerHTML = `
      <div class="flashcard" id="flashcard">
        <div class="fc-inner">
          <div class="fc-face fc-front fc-front-bg">
            <div class="fc-label">${c.icon} ${c.track} · ${c.level}</div>
            <div class="fc-q">${mdInline(c.q)}</div>
            <div class="fc-hint">Click to reveal the answer ↻</div>
          </div>
          <div class="fc-face fc-back">
            <div class="fc-label">Answer</div>
            <div class="fc-a">${renderMarkdown(c.a)}${c.code ? codeBlock(c.code) : ""}</div>
          </div>
        </div>
      </div>
      <div class="fc-controls">
        <button class="btn btn-ghost" id="fcPrev">← Prev</button>
        <span class="fc-counter">${fcIndex + 1} / ${fcDeck.length}</span>
        <button class="btn btn-ghost" id="fcNext">Next →</button>
      </div>
      <button class="btn ${done ? "btn-ghost" : "btn-primary"}" id="fcMaster">${done ? "✓ Mastered — undo" : "✓ Mark mastered"}</button>
      <p class="fc-hint">Tip: use ← / → keys to navigate, Space to flip.</p>`;

    $("#flashcard").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
    $("#fcPrev").addEventListener("click", (e) => { e.stopPropagation(); fcIndex = (fcIndex - 1 + fcDeck.length) % fcDeck.length; renderCard(); });
    $("#fcNext").addEventListener("click", (e) => { e.stopPropagation(); fcIndex = (fcIndex + 1) % fcDeck.length; renderCard(); });
    $("#fcMaster").addEventListener("click", (e) => { e.stopPropagation(); toggleDone(id); renderCard(); });
  }

  /* ---------- MOCK INTERVIEW ---------- */
  let mockState = null;

  function mock() {
    content.innerHTML = `
      <div class="mock-setup">
        <div class="big-ico">🎤</div>
        <div class="page-head" style="margin-bottom:8px">
          <h1>Mock Interview</h1>
          <p>Simulate the rapid-fire technical screen. Multiple choice, instant feedback, scored by domain — under the clock.</p>
        </div>
        <p class="muted" style="margin-top:18px">How many questions?</p>
        <div class="mock-opts" id="lenOpts">
          <button class="opt-chip sel" data-len="8">Quick · 8</button>
          <button class="opt-chip" data-len="15">Standard · 15</button>
          <button class="opt-chip" data-len="${quiz.length}">Full · ${quiz.length}</button>
        </div>
        <p class="muted" style="margin-top:6px">Timed?</p>
        <div class="mock-opts" id="timeOpts">
          <button class="opt-chip sel" data-time="0">Relaxed (no timer)</button>
          <button class="opt-chip" data-time="45">45s / question</button>
        </div>
        <button class="btn btn-primary" id="startMock" style="margin-top:20px;padding:13px 30px">Start interview →</button>
      </div>`;

    let len = 8, perQ = 0;
    $("#lenOpts").addEventListener("click", (e) => {
      const b = e.target.closest(".opt-chip"); if (!b) return;
      $$("#lenOpts .opt-chip").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel"); len = +b.dataset.len;
    });
    $("#timeOpts").addEventListener("click", (e) => {
      const b = e.target.closest(".opt-chip"); if (!b) return;
      $$("#timeOpts .opt-chip").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel"); perQ = +b.dataset.time;
    });
    $("#startMock").addEventListener("click", () => startMock(len, perQ));
  }

  function startMock(len, perQ) {
    const pool = shuffle([...quiz]).slice(0, len);
    mockState = { pool, i: 0, answers: Array.from({ length: pool.length }, () => null), perQ, timeLeft: perQ };
    renderQuestion();
  }

  function renderQuestion() {
    const m = mockState;
    const q = m.pool[m.i];
    const pct = Math.round((m.i / m.pool.length) * 100);
    content.innerHTML = `
      <div class="quiz-top">
        <span class="pill accent">Question ${m.i + 1} of ${m.pool.length}</span>
        <div class="quiz-progress progress-track" style="margin-top:0"><div class="progress-fill" style="width:${pct}%"></div></div>
        ${m.perQ ? `<span class="timer" id="timer">${m.timeLeft}s</span>` : `<span class="pill">${q.topic}</span>`}
      </div>
      <div class="card question-card">
        <div class="q-num">${q.topic}</div>
        <div class="q-text">${mdInline(q.q)}</div>
        <div class="answers" id="answers">
          ${q.o.map((opt, idx) => `<button class="answer" data-idx="${idx}">
            <span class="key">${String.fromCharCode(65 + idx)}</span><span>${mdInline(opt)}</span>
          </button>`).join("")}
        </div>
        <div id="explainSlot"></div>
        <div class="quiz-foot">
          <button class="btn btn-ghost" id="quitMock">✕ End</button>
          <button class="btn btn-primary hidden" id="nextQ">Next →</button>
        </div>
      </div>`;

    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    if (m.perQ) {
      m.timeLeft = m.perQ;
      mockTimer = setInterval(() => {
        m.timeLeft--;
        const t = $("#timer");
        if (t) { t.textContent = m.timeLeft + "s"; t.classList.toggle("warn", m.timeLeft <= 10); }
        if (m.timeLeft <= 0) { clearInterval(mockTimer); mockTimer = null; pick(-1); }
      }, 1000);
    }

    $$("#answers .answer").forEach((b) => b.addEventListener("click", () => pick(+b.dataset.idx)));
    $("#quitMock").addEventListener("click", () => { if (confirm("End the mock interview?")) mock(); });
    $("#nextQ").addEventListener("click", advance);
  }

  function pick(idx) {
    const m = mockState, q = m.pool[m.i];
    if (m.answers[m.i] !== null) return;
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    m.answers[m.i] = idx;
    $$("#answers .answer").forEach((b) => {
      const bi = +b.dataset.idx;
      b.disabled = true;
      if (bi === q.c) b.classList.add("correct");
      else if (bi === idx) b.classList.add("wrong");
    });
    const ok = idx === q.c;
    $("#explainSlot").innerHTML = `<div class="explain">
      <strong>${ok ? "✓ Correct." : idx === -1 ? "⌛ Time's up." : "✗ Not quite."}</strong>
      ${mdInline(q.e)}</div>`;
    $("#nextQ").classList.remove("hidden");
    $("#nextQ").textContent = m.i === m.pool.length - 1 ? "See results →" : "Next →";
  }

  function advance() {
    const m = mockState;
    if (m.i === m.pool.length - 1) return showResults();
    m.i++; renderQuestion();
  }

  function showResults() {
    const m = mockState;
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    let correct = 0;
    const byTopic = {};
    m.pool.forEach((q, i) => {
      const ok = m.answers[i] === q.c;
      if (ok) correct++;
      byTopic[q.topic] = byTopic[q.topic] || { ok: 0, n: 0 };
      byTopic[q.topic].n++; if (ok) byTopic[q.topic].ok++;
    });
    const pct = Math.round((correct / m.pool.length) * 100);
    state.mocksTaken = (state.mocksTaken || 0) + 1;
    state.bestScore = Math.max(state.bestScore || 0, pct);
    save();

    const verdict = pct >= 85 ? "🏆 Interview-ready — outstanding!"
      : pct >= 70 ? "💪 Strong — polish the weak spots."
      : pct >= 50 ? "📈 Getting there — review and retry."
      : "🌱 Early days — hit the Learn tracks first.";

    const circ = 2 * Math.PI * 80;
    const offset = circ * (1 - pct / 100);

    content.innerHTML = `
      <div class="result-wrap">
        <span class="eyebrow">Mock complete</span>
        <div class="score-ring">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient></defs>
            <circle class="ring-bg" cx="90" cy="90" r="80" fill="none" stroke-width="14"/>
            <circle class="ring-fg" cx="90" cy="90" r="80" fill="none" stroke-width="14"
              stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="ringFg"/>
          </svg>
          <div class="ring-label"><div class="pct">${pct}%</div><div class="sub">${correct}/${m.pool.length} correct</div></div>
        </div>
        <div class="verdict">${verdict}</div>
        <p class="muted">Best score: ${state.bestScore}% · Mocks taken: ${state.mocksTaken}</p>

        <div class="card breakdown" style="padding:8px 20px">
          ${Object.entries(byTopic).map(([topic, s]) => {
            const tp = Math.round((s.ok / s.n) * 100);
            const color = tp >= 70 ? "var(--good)" : tp >= 40 ? "var(--warn)" : "var(--bad)";
            return `<div class="bd-row">
              <span class="bd-topic">${topic}</span>
              <div class="t-bar progress-track" style="width:120px;margin-top:0"><div class="progress-fill" style="width:${tp}%;background:${color}"></div></div>
              <span class="bd-score" style="color:${color}">${s.ok}/${s.n}</span>
            </div>`;
          }).join("")}
        </div>

        <div class="hero-cta" style="justify-content:center">
          <button class="btn btn-primary" data-go="mock">↻ New mock</button>
          <button class="btn btn-ghost" data-go="learn">📚 Review domains</button>
        </div>
      </div>`;

    requestAnimationFrame(() => { const r = $("#ringFg"); if (r) r.style.strokeDashoffset = offset; });
  }

  /* ---------- ROADMAP ---------- */
  function roadmap() {
    const steps = [
      { n: "1", t: "Master the fundamentals", m: "Week 1 · Foundations", p: "Lock in the vocabulary interviewers expect instantly — no hesitation allowed.", items: ["SDLC/STLC, severity vs priority, test design techniques (EP, BVA, decision tables)", "HTTP status codes cold (401 vs 403, 400 vs 422)", "Write a flawless bug report"] },
      { n: "2", t: "Go deep on automation", m: "Week 2 · Craft", p: "This is where senior candidates win or lose. Show architecture, not scripts.", items: ["Automation pyramid & the ice-cream-cone anti-pattern", "Page Object Model + a maintainable framework design", "Flaky-test strategy, waits, parallel execution"] },
      { n: "3", t: "Backend & API depth", m: "Week 3 · Below the UI", p: "Senior testing lives at the API/DB layer — fast, stable, powerful.", items: ["REST API testing checklist, auth/token handling, contract testing", "SQL: joins, anti-joins, duplicates, 2nd-highest, ACID", "Coding warm-ups: strings, hash maps, OOP pillars"] },
      { n: "4", t: "Non-functional & systems", m: "Week 4 · Scale", p: "Performance, security, and designing a test strategy for a whole system.", items: ["Load/stress/soak/spike + p95/p99 thinking", "OWASP Top 10 basics: broken access control, injection, XSS, IDOR", "System design for QA: microservices, async/event-driven, contract tests"] },
      { n: "5", t: "Strategy & leadership", m: "Week 5 · Seniority", p: "The differentiator for a senior/lead title — judgement, influence, ownership.", items: ["Risk-based testing, entry/exit criteria, go/no-go", "QA metrics that matter (escape rate, DRE) — not vanity counts", "Whole-team quality, mentoring, removing the QA bottleneck"] },
      { n: "6", t: "Rehearse & mock", m: "Week 6 · Game day", p: "Turn knowledge into fluent, confident answers under pressure.", items: ["Prepare 5–6 STAR stories mapped to common behavioral prompts", "Run timed mock interviews here until 85%+ consistently", "Practice thinking out loud and reasoning about trade-offs"] },
    ];
    content.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">Roadmap</span>
        <h1>A 6-week plan to interview-ready</h1>
        <p>Follow the path top-to-bottom. Each phase maps to the Learn tracks above and ends with a timed mock to validate retention.</p>
      </div>
      <div class="timeline">
        ${steps.map((s) => `<div class="tl-item">
          <div class="tl-dot">${s.n}</div>
          <div class="tl-meta">${s.m}</div>
          <h3>${s.t}</h3>
          <p>${s.p}</p>
          <ul>${s.items.map((i) => `<li>${mdInline(i)}</li>`).join("")}</ul>
        </div>`).join("")}
      </div>
      <div style="margin-top:24px" class="hero-cta">
        <button class="btn btn-primary" data-go="learn">📚 Jump into the domains</button>
        <button class="btn btn-ghost" data-go="mock">🎤 Test yourself</button>
      </div>`;
  }

  /* ---------- GUIDE (read everything in one place) ---------- */
  function guide() {
    const faqs = [
      ["What is this app?", "A self-paced, interactive platform that takes a QA engineer from solid fundamentals to **Senior / Lead QA Engineer** interview-ready. It bundles a curated handbook, active-recall flashcards, a timed mock-interview engine, and a 6-week roadmap — all in one place, with your progress saved in the browser."],
      ["Who is it for?", "Mid-level QAs targeting a senior title, senior QAs brushing up before a loop, and SDETs who want a single source of truth for the topics that actually come up. The answers are written at *senior altitude* — they explain the **why** and the trade-offs, not just definitions."],
      ["How should I use it?", "Follow the **Roadmap** week by week. Read a domain here in the **Guide** or expand cards in **Learn**, mark each one mastered, drill them in **Flashcards**, then prove retention in a timed **Mock Interview**. Aim for a consistent 85%+ before your real interview."],
      ["How is my progress tracked?", "Everything (mastered questions, best mock score, theme) is stored locally in your browser via `localStorage` — nothing is uploaded anywhere. Use **Reset progress** in the sidebar to start fresh."],
      ["How do I get the most out of an interview?", "Lead with judgement: reason out loud about **risk**, give a recommendation rather than a list of options, and quantify every result (\"cut regression from 3 days to 4 hours\"). Treat quality as a whole-team property — you remove the gate, you're not the gate."],
    ];

    content.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">📖 The Complete Guide</span>
        <h1>Read all about it</h1>
        <p>The entire handbook on one page — every domain and every senior-grade answer, laid out to read end-to-end. Skim the contents, then dive in. (Prefer bite-sized? Use <a data-go="learn" href="#">Learn</a> or <a data-go="flashcards" href="#">Flashcards</a>.)</p>
      </div>

      <article class="guide">
        <section class="guide-about card">
          <h2>About this platform</h2>
          ${faqs.map(([q, a]) => `
            <div class="faq">
              <h3>${mdInline(q)}</h3>
              ${renderMarkdown(a)}
            </div>`).join("")}
        </section>

        <nav class="guide-toc card" aria-label="Contents">
          <h2>Contents · ${tracks.length} domains, ${totalCards} questions</h2>
          <ol>
            ${tracks.map((t) => `<li><a href="#g-${t.id}" data-toc="${t.id}">
              <span>${t.icon}</span> ${t.name}
              <span class="toc-count">${t.cards.length}</span>
            </a></li>`).join("")}
          </ol>
        </nav>

        ${tracks.map((t) => `
          <section class="guide-domain" id="g-${t.id}">
            <header class="gd-head">
              <span class="gd-ico">${t.icon}</span>
              <div>
                <span class="eyebrow">${(t.tags || []).join(" · ")}</span>
                <h2>${t.name}</h2>
                <p class="muted">${t.blurb}</p>
              </div>
            </header>
            ${t.cards.map((c) => `
              <div class="gd-qa">
                <h3>${mdInline(c.q)} <span class="lvl-tag">${c.level}</span></h3>
                <div class="gd-a">${renderMarkdown(c.a)}${c.code ? codeBlock(c.code) : ""}</div>
              </div>`).join("")}
            <a class="gd-top" href="#top">↑ Back to contents</a>
          </section>`).join("")}

        <footer class="guide-foot card">
          <h2>You've read the whole thing. 🎉</h2>
          <p class="muted">Now lock it in — drill the flashcards and prove it under the clock.</p>
          <div class="hero-cta" style="justify-content:center">
            <button class="btn btn-primary" data-go="flashcards">🃏 Drill flashcards</button>
            <button class="btn btn-ghost" data-go="mock">🎤 Take a mock</button>
          </div>
        </footer>
      </article>`;

    // smooth-scroll for in-page TOC + back links (skip nav links — handled globally by data-go)
    content.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        if (a.dataset.go) return; // let the global [data-go] handler navigate
        const href = a.getAttribute("href");
        if (href === "#top" || href === "#") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
        const target = content.querySelector(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
      }));
  }

  /* ---------- DOCS (animated deep-dive + inline quizzes) ---------- */
  const docsData = (window.QA_DOCS && window.QA_DOCS.chapters) || [];

  const chapterSolved = (ch) =>
    ch.quiz.every((_, qi) => state.docsQuiz[`${ch.id}:${qi}`] === ch.quiz[qi].c);
  const docsCompletedCount = () => docsData.filter(chapterSolved).length;
  const docsPct = () => (docsData.length ? Math.round((docsCompletedCount() / docsData.length) * 100) : 0);

  function docs() {
    content.innerHTML = `
      <div class="docs-progress"><div class="dp-fill" id="dpFill"></div></div>
      <div class="page-head">
        <span class="eyebrow">🔬 Deep Dive · Animated</span>
        <h1>The QA Process, in detail</h1>
        <p>${docsData.length} animated chapters that walk the entire quality process end-to-end — from QA vs QC, through the data/analytics QA track (UI-to-DB, reporting UIs, SQL & ETL), all the way to metrics and go/no-go. Scroll to watch each concept build, then test yourself with the inline quiz. Read it once and you'll know every bit of it.</p>
      </div>

      ${journeyMap()}

      ${docsData.map(renderChapter).join("")}

      <div class="guide-foot card" style="text-align:center;padding:30px;margin-top:10px">
        <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:4px">That's the whole QA process. 🎓</h2>
        <p class="muted">You've seen prevention to release. Now prove it under the clock.</p>
        <div class="hero-cta" style="justify-content:center">
          <button class="btn btn-primary" data-go="mock">🎤 Take a mock interview</button>
          <button class="btn btn-ghost" data-go="flashcards">🃏 Drill flashcards</button>
        </div>
      </div>`;

    wireDocs();
  }

  function journeyMap() {
    const done = docsCompletedCount(), total = docsData.length, pct = docsPct();
    return `<div class="journey" id="docsNav">
      <div class="jr-bar">
        <div class="jr-ring" id="jrRing" style="--pct:${pct}">
          <span class="jr-ring-label"><b id="jrCount">${done}</b><small>/ ${total}</small></span>
        </div>
        <div class="jr-meta">
          <span class="eyebrow">Your learning journey</span>
          <strong>${done === total ? "Process mastered — every chapter complete! 🎓" : `${done} of ${total} chapters complete`}</strong>
          <p class="muted tiny">Answer both quiz questions in a chapter to complete it. Tap any stop to jump there.</p>
        </div>
      </div>
      <div class="jr-track">
        ${docsData.map((ch, i) => {
          const solved = chapterSolved(ch);
          return `${i ? '<span class="jr-link"></span>' : ""}<a class="jr-node ${solved ? "done" : ""}" data-jump="${ch.id}" title="${esc(ch.title)}" style="--d:${i * 0.05}s">
            <span class="jr-dot"><span class="jr-num">${ch.num}</span><span class="jr-ico">${ch.icon}</span></span>
            <span class="jr-title">${esc(ch.title)}</span>
          </a>`;
        }).join("")}
      </div>
    </div>`;
  }

  function updateJourney() {
    const done = docsCompletedCount(), pct = docsPct();
    const ring = content.querySelector("#jrRing");
    const count = content.querySelector("#jrCount");
    const strong = content.querySelector(".jr-meta strong");
    if (ring) ring.style.setProperty("--pct", pct);
    if (count) count.textContent = done;
    if (strong) strong.textContent = done === docsData.length
      ? "Process mastered — every chapter complete! 🎓"
      : `${done} of ${docsData.length} chapters complete`;
  }

  function renderChapter(ch) {
    return `<section class="chapter" id="ch-${ch.id}" data-ch="${ch.id}">
      <div class="ch-head">
        <div class="ch-badge">${ch.icon}<span class="ch-num">${ch.num}</span></div>
        <h2>${ch.title}</h2>
      </div>
      <p class="ch-lede">${mdInline(ch.lede)}</p>
      <div class="ch-visual">${ch.visual}</div>
      <div class="ch-body">${ch.body.map((p) => renderMarkdown(p)).join("")}</div>
      ${ch.code ? codeBlock(ch.code) : ""}
      <div class="key-points">
        <h4>Key takeaways</h4>
        <ul>${ch.keyPoints.map((k) => `<li>${mdInline(k)}</li>`).join("")}</ul>
      </div>
      ${renderInlineQuiz(ch)}
    </section>`;
  }

  function renderInlineQuiz(ch) {
    return `<div class="inline-quiz ${chapterSolved(ch) ? "solved" : ""}" data-quiz="${ch.id}">
      <div class="iq-title">🧠 Check your understanding</div>
      <div class="iq-sub">Answer both to mark this chapter complete.</div>
      ${ch.quiz.map((q, qi) => {
        const picked = state.docsQuiz[`${ch.id}:${qi}`];
        const answered = picked !== undefined;
        return `<div class="iq-q" data-qi="${qi}">
          <div class="iq-prompt">${qi + 1}. ${mdInline(q.q)}</div>
          <div class="iq-opts">
            ${q.o.map((opt, oi) => {
              let cls = "";
              if (answered) {
                if (oi === q.c) cls = "correct";
                else if (oi === picked) cls = "wrong";
              }
              return `<button class="iq-opt ${cls}" data-oi="${oi}" ${answered ? "disabled" : ""}>
                <span class="iq-key">${String.fromCharCode(65 + oi)}</span><span>${mdInline(opt)}</span>
              </button>`;
            }).join("")}
          </div>
          ${answered ? `<div class="iq-explain"><strong>${picked === q.c ? "✓ Correct." : "✗ Not quite."}</strong> ${mdInline(q.e)}</div>` : ""}
        </div>`;
      }).join("")}
      <div class="iq-done">✓ Chapter complete — nicely done.</div>
    </div>`;
  }

  function wireDocs() {
    // inline-quiz answering
    content.querySelectorAll(".inline-quiz").forEach((quizEl) => {
      const chId = quizEl.dataset.quiz;
      const ch = docsData.find((c) => c.id === chId);
      quizEl.addEventListener("click", (e) => {
        const opt = e.target.closest(".iq-opt");
        if (!opt || opt.disabled) return;
        const qEl = opt.closest(".iq-q");
        const qi = +qEl.dataset.qi, oi = +opt.dataset.oi;
        const q = ch.quiz[qi];
        state.docsQuiz[`${chId}:${qi}`] = oi; save();
        qEl.querySelectorAll(".iq-opt").forEach((b) => {
          b.disabled = true;
          const bi = +b.dataset.oi;
          if (bi === q.c) b.classList.add("correct");
          else if (bi === oi) b.classList.add("wrong");
        });
        qEl.insertAdjacentHTML("beforeend",
          `<div class="iq-explain"><strong>${oi === q.c ? "✓ Correct." : "✗ Not quite."}</strong> ${mdInline(q.e)}</div>`);
        if (chapterSolved(ch)) {
          quizEl.classList.add("solved");
          const node = content.querySelector(`#docsNav .jr-node[data-jump="${chId}"]`);
          if (node) node.classList.add("done", "just-done");
          updateJourney();
        }
      });
    });

    // mini-nav smooth scroll
    content.querySelectorAll("#docsNav a[data-jump]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const t = content.querySelector(`#ch-${a.dataset.jump}`);
        if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      }));

    // scroll-reveal animations + count-ups
    const counted = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in-view");
          if (!counted.has(en.target)) {
            counted.add(en.target);
            en.target.querySelectorAll("[data-countup]").forEach(countUp);
          }
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    content.querySelectorAll(".chapter").forEach((c) => io.observe(c));

    // reading-progress bar
    const fill = content.querySelector("#dpFill");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      if (fill) fill.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    viewTeardown = () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }

  function countUp(el) {
    const target = +el.dataset.countup;
    const suffix = el.dataset.suffix || "";
    const dur = 1100, start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- GLOSSARY (the complete QA vocabulary) ---------- */
  const glossaryData = window.QA_GLOSSARY || { categories: [], terms: [] };

  function glossary() {
    const cats = glossaryData.categories;
    content.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">📒 Reference</span>
        <h1>QA Glossary</h1>
        <p>Every term you'll meet in QA — ${glossaryData.terms.length} definitions across ${cats.length} categories. Filter by topic or type to find any term instantly.</p>
      </div>
      <div class="gl-toolbar">
        <div class="search-wrap" style="max-width:none">
          <span class="search-ico">🔎</span>
          <input id="glSearch" type="search" placeholder="Filter terms… (e.g. flaky, idempotency, ETL)" autocomplete="off" />
        </div>
      </div>
      <div class="gl-chips" id="glChips">
        <button class="opt-chip sel" data-cat="all">All (${glossaryData.terms.length})</button>
        ${cats.map((c) => `<button class="opt-chip" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join("")}
      </div>
      <div id="glList"></div>`;

    let activeCat = "all", term = "";

    function draw() {
      const list = $("#glList");
      let items = glossaryData.terms.filter((x) => activeCat === "all" || x.cat === activeCat);
      if (term) {
        const q = term.toLowerCase();
        items = items.filter((x) => (x.t + " " + (x.abbr || "") + " " + x.d).toLowerCase().includes(q));
      }
      items = items.toSorted((a, b) => a.t.localeCompare(b.t));
      if (!items.length) { list.innerHTML = `<div class="sr-empty">No terms match your filter.</div>`; return; }

      // group alphabetically when showing everything unfiltered; else flat
      const byCat = {};
      glossaryData.categories.forEach((c) => (byCat[c.id] = c));
      list.innerHTML = `<p class="muted tiny" style="margin-bottom:14px">${items.length} term${items.length === 1 ? "" : "s"}</p>
        <div class="gl-grid">
          ${items.map((x) => {
            const c = byCat[x.cat] || { icon: "", name: "" };
            return `<div class="gl-card">
              <div class="gl-term">${highlightTerm(x.t, term)}${x.abbr ? `<span class="gl-abbr">${esc(x.abbr)}</span>` : ""}</div>
              <div class="gl-def">${renderMarkdown(x.d)}</div>
              <div class="gl-cat">${c.icon} ${c.name}</div>
            </div>`;
          }).join("")}
        </div>`;
    }

    function highlightTerm(text, q) {
      if (!q) return mdInline(text);
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return mdInline(text);
      return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
    }

    $("#glChips").addEventListener("click", (e) => {
      const b = e.target.closest(".opt-chip"); if (!b) return;
      $$("#glChips .opt-chip").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel"); activeCat = b.dataset.cat; draw();
    });
    $("#glSearch").addEventListener("input", (e) => { term = e.target.value.trim(); draw(); });
    draw();
  }

  /* ---------- TESTING TYPES (the full catalog) ---------- */
  const typesData = window.QA_TYPES || { categories: [], types: [] };

  const typeByName = new Map(typesData.types.map((x, i) => [x.t, i]));
  const typeCat = (id) => typesData.categories.find((c) => c.id === id) || { icon: "", name: "" };

  function types() {
    const cats = typesData.categories;
    content.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">🧪 Catalog</span>
        <h1>Every Kind of Testing</h1>
        <p>A complete, categorized map of testing types — ${typesData.types.length} kinds across ${cats.length} families, from black-box and the test levels to performance, security, and modern techniques like chaos and mutation testing. <strong>Click any card</strong> for the full detail: when to use it, how it's done, and a practical tip.</p>
      </div>
      <div class="gl-toolbar">
        <div class="search-wrap" style="max-width:none">
          <span class="search-ico">🔎</span>
          <input id="tySearch" type="search" placeholder="Search testing types… (e.g. smoke, soak, mutation, chaos)" autocomplete="off" />
        </div>
      </div>
      <div class="gl-chips" id="tyChips">
        <button class="opt-chip sel" data-cat="all">All (${typesData.types.length})</button>
        ${cats.map((c) => `<button class="opt-chip" data-cat="${c.id}">${c.icon} ${c.name} (${typesData.types.filter((t) => t.cat === c.id).length})</button>`).join("")}
      </div>
      <div id="tyList"></div>
      <div class="ty-modal-overlay hidden" id="tyModal"></div>`;

    let activeCat = "all", term = "";
    const modal = $("#tyModal");

    function draw() {
      const list = $("#tyList");
      const q = term.toLowerCase();
      const matches = (x) => !q || (x.t + " " + x.d + " " + (x.long || "") + " " + (x.eg || "")).toLowerCase().includes(q);
      const shownCats = cats.filter((c) => activeCat === "all" || c.id === activeCat);

      let total = 0;
      const sections = shownCats.map((c) => {
        const items = typesData.types.filter((x) => x.cat === c.id && matches(x));
        total += items.length;
        if (!items.length) return "";
        return `<section class="ty-section">
          <h2 class="ty-h">${c.icon} ${c.name} <span class="ty-count">${items.length}</span></h2>
          <div class="gl-grid">
            ${items.map((x) => `<div class="gl-card ty-card" data-ty="${typeByName.get(x.t)}" role="button" tabindex="0">
              <div class="gl-term">${hlMark(x.t, term)}</div>
              <div class="gl-def">${renderMarkdown(x.d)}</div>
              <span class="ty-more">View detail →</span>
            </div>`).join("")}
          </div>
        </section>`;
      }).join("");

      list.innerHTML = total
        ? `<p class="muted tiny" style="margin-bottom:14px">${total} testing type${total === 1 ? "" : "s"} · click for detail</p>${sections}`
        : `<div class="sr-empty">No testing types match your search.</div>`;
    }

    function hlMark(text, t) {
      if (!t) return mdInline(text);
      const i = text.toLowerCase().indexOf(t.toLowerCase());
      if (i < 0) return mdInline(text);
      return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + t.length)) + "</mark>" + esc(text.slice(i + t.length));
    }

    function openModal(i) {
      const x = typesData.types[i];
      if (!x) return;
      const c = typeCat(x.cat);
      const meta = [
        ["🎯", "When to use", x.when],
        ["🛠️", "How it's done", x.how],
        ["💡", "Tip", x.tip],
        ["📌", "Example", x.eg],
      ].filter((m) => m[2]);
      modal.innerHTML = `
        <div class="ty-modal" role="dialog" aria-modal="true" aria-label="${esc(x.t)}">
          <button class="ty-close" aria-label="Close">✕</button>
          <span class="pill accent">${c.icon} ${c.name}</span>
          <h2 class="ty-modal-title">${mdInline(x.t)}</h2>
          <p class="ty-modal-lead">${mdInline(x.d)}</p>
          ${x.long ? `<div class="ty-block"><h4>In detail</h4>${renderMarkdown(x.long)}</div>` : ""}
          ${meta.length ? `<div class="ty-meta-grid">
            ${meta.map(([ico, label, val]) => `<div class="ty-meta-card"><h4>${ico} ${label}</h4>${renderMarkdown(val)}</div>`).join("")}
          </div>` : ""}
          ${(x.related && x.related.length) ? `<div class="ty-block"><h4>Related types</h4>
            <div class="ty-related">${x.related.map((r) => {
              const ri = typeByName.get(r);
              return ri !== undefined
                ? `<button class="ty-rel" data-ty="${ri}">${esc(r)} →</button>`
                : `<span class="ty-rel ty-rel-dead">${esc(r)}</span>`;
            }).join("")}</div></div>` : ""}
        </div>`;
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      const m = modal.querySelector(".ty-modal");
      if (m) m.scrollTop = 0;
    }

    function closeModal() {
      modal.classList.add("hidden");
      modal.innerHTML = "";
      document.body.style.overflow = "";
    }

    $("#tyChips").addEventListener("click", (e) => {
      const b = e.target.closest(".opt-chip"); if (!b) return;
      $$("#tyChips .opt-chip").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel"); activeCat = b.dataset.cat; draw();
    });
    $("#tySearch").addEventListener("input", (e) => { term = e.target.value.trim(); draw(); });

    $("#tyList").addEventListener("click", (e) => {
      const card = e.target.closest(".ty-card[data-ty]");
      if (card) openModal(+card.dataset.ty);
    });
    $("#tyList").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".ty-card[data-ty]");
      if (card) { e.preventDefault(); openModal(+card.dataset.ty); }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".ty-close")) { closeModal(); return; }
      const rel = e.target.closest(".ty-rel[data-ty]");
      if (rel) openModal(+rel.dataset.ty);
    });

    const onKey = (e) => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); };
    document.addEventListener("keydown", onKey);
    viewTeardown = () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };

    draw();
  }

  /* ---------- TOOLS & TECH (SQL, automation, perf, CI/CD) ---------- */
  const toolsData = window.QA_TOOLS || { categories: [], tools: [] };
  const toolByName = new Map(toolsData.tools.map((x, i) => [x.t, i]));
  const toolCat = (id) => toolsData.categories.find((c) => c.id === id) || { icon: "", name: "" };

  function tools() {
    const cats = toolsData.categories;
    content.innerHTML = `
      <div class="page-head">
        <span class="eyebrow">🧰 Reference</span>
        <h1>Tools &amp; Tech</h1>
        <p>Deep, practical knowledge of the tools every QA is expected to know — SQL, automation frameworks (Selenium, Playwright, Cypress), load tools (JMeter, LoadRunner, k6) and CI/CD (Jenkins, Kubernetes, Docker). <strong>Click any card</strong> for features, pros &amp; cons, when to use it, and a code example.</p>
      </div>
      <div class="gl-toolbar">
        <div class="search-wrap" style="max-width:none">
          <span class="search-ico">🔎</span>
          <input id="tlSearch" type="search" placeholder="Search tools… (e.g. JOIN, Playwright, JMeter, Jenkins, k8s)" autocomplete="off" />
        </div>
      </div>
      <div class="gl-chips" id="tlChips">
        <button class="opt-chip sel" data-cat="all">All (${toolsData.tools.length})</button>
        ${cats.map((c) => `<button class="opt-chip" data-cat="${c.id}">${c.icon} ${c.name} (${toolsData.tools.filter((t) => t.cat === c.id).length})</button>`).join("")}
      </div>
      <div id="tlList"></div>
      <div class="ty-modal-overlay hidden" id="tlModal"></div>`;

    let activeCat = "all", term = "";
    const modal = $("#tlModal");

    function draw() {
      const list = $("#tlList");
      const q = term.toLowerCase();
      const matches = (x) => !q || (x.t + " " + x.d + " " + (x.what || "") + " " + (x.code || "")).toLowerCase().includes(q);
      const shownCats = cats.filter((c) => activeCat === "all" || c.id === activeCat);

      let total = 0;
      const sections = shownCats.map((c) => {
        const items = toolsData.tools.filter((x) => x.cat === c.id && matches(x));
        total += items.length;
        if (!items.length) return "";
        return `<section class="ty-section">
          <h2 class="ty-h">${c.icon} ${c.name} <span class="ty-count">${items.length}</span></h2>
          <div class="gl-grid">
            ${items.map((x) => `<div class="gl-card ty-card" data-tl="${toolByName.get(x.t)}" role="button" tabindex="0">
              <div class="gl-term">${hlMark(x.t, term)}</div>
              <div class="gl-def">${renderMarkdown(x.d)}</div>
              <span class="ty-more">View detail →</span>
            </div>`).join("")}
          </div>
        </section>`;
      }).join("");

      list.innerHTML = total
        ? `<p class="muted tiny" style="margin-bottom:14px">${total} item${total === 1 ? "" : "s"} · click for detail</p>${sections}`
        : `<div class="sr-empty">No tools match your search.</div>`;
    }

    function hlMark(text, t) {
      if (!t) return mdInline(text);
      const i = text.toLowerCase().indexOf(t.toLowerCase());
      if (i < 0) return mdInline(text);
      return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + t.length)) + "</mark>" + esc(text.slice(i + t.length));
    }

    function bulletList(label, ico, arr) {
      if (!arr || !arr.length) return "";
      return `<div class="ty-block"><h4>${ico} ${label}</h4>
        <ul class="ty-ul">${arr.map((i) => `<li>${mdInline(i)}</li>`).join("")}</ul></div>`;
    }

    function openModal(i) {
      const x = toolsData.tools[i];
      if (!x) return;
      const c = toolCat(x.cat);
      const prosCons = (x.pros || x.cons)
        ? `<div class="ty-proscons">
            ${x.pros ? `<div class="pc-col pc-pro"><h4>✅ Strengths</h4><ul>${x.pros.map((p) => `<li>${mdInline(p)}</li>`).join("")}</ul></div>` : ""}
            ${x.cons ? `<div class="pc-col pc-con"><h4>⚠️ Limitations</h4><ul>${x.cons.map((p) => `<li>${mdInline(p)}</li>`).join("")}</ul></div>` : ""}
          </div>` : "";
      modal.innerHTML = `
        <div class="ty-modal" role="dialog" aria-modal="true" aria-label="${esc(x.t)}">
          <button class="ty-close" aria-label="Close">✕</button>
          <span class="pill accent">${c.icon} ${c.name}</span>
          <h2 class="ty-modal-title">${mdInline(x.t)}</h2>
          <p class="ty-modal-lead">${mdInline(x.d)}</p>
          ${x.what ? `<div class="ty-block"><h4>Overview</h4>${renderMarkdown(x.what)}</div>` : ""}
          ${bulletList("Key features", "✨", x.features)}
          ${prosCons}
          ${x.when ? `<div class="ty-block"><h4>🎯 When to use</h4>${renderMarkdown(x.when)}</div>` : ""}
          ${x.code ? `<div class="ty-block"><h4>💻 Example</h4>${codeBlock(x.code)}</div>` : ""}
          ${x.tip ? `<div class="ty-meta-card" style="margin-bottom:18px"><h4>💡 Tip</h4>${renderMarkdown(x.tip)}</div>` : ""}
          ${(x.related && x.related.length) ? `<div class="ty-block"><h4>Related</h4>
            <div class="ty-related">${x.related.map((r) => {
              const ri = toolByName.get(r);
              return ri !== undefined
                ? `<button class="ty-rel" data-tl="${ri}">${esc(r)} →</button>`
                : `<span class="ty-rel ty-rel-dead">${esc(r)}</span>`;
            }).join("")}</div></div>` : ""}
        </div>`;
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      const m = modal.querySelector(".ty-modal");
      if (m) m.scrollTop = 0;
    }

    function closeModal() {
      modal.classList.add("hidden");
      modal.innerHTML = "";
      document.body.style.overflow = "";
    }

    $("#tlChips").addEventListener("click", (e) => {
      const b = e.target.closest(".opt-chip"); if (!b) return;
      $$("#tlChips .opt-chip").forEach((x) => x.classList.remove("sel"));
      b.classList.add("sel"); activeCat = b.dataset.cat; draw();
    });
    $("#tlSearch").addEventListener("input", (e) => { term = e.target.value.trim(); draw(); });

    $("#tlList").addEventListener("click", (e) => {
      const card = e.target.closest(".ty-card[data-tl]");
      if (card) openModal(+card.dataset.tl);
    });
    $("#tlList").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".ty-card[data-tl]");
      if (card) { e.preventDefault(); openModal(+card.dataset.tl); }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".ty-close")) { closeModal(); return; }
      const rel = e.target.closest(".ty-rel[data-tl]");
      if (rel) openModal(+rel.dataset.tl);
    });

    const onKey = (e) => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); };
    document.addEventListener("keydown", onKey);
    viewTeardown = () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };

    draw();
  }

  /* ============================ INTERACTIONS ============================ */
  function toggleDone(id) {
    state.done[id] = !state.done[id];
    if (!state.done[id]) delete state.done[id];
    save();
  }

  // event delegation for the whole content area
  content.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { setView(go.dataset.go); return; }

    const check = e.target.closest("[data-check]");
    if (check) {
      e.stopPropagation();
      const id = check.dataset.check;
      toggleDone(id);
      check.closest(".qa").classList.toggle("done", !!state.done[id]);
      return;
    }

    const head = e.target.closest(".qa-head");
    if (head) { head.closest(".qa").classList.toggle("open"); return; }

    const trackEl = e.target.closest("[data-track]");
    if (trackEl) { setView("learn", { track: trackEl.dataset.track }); return; }
  });

  // keyboard for flashcards
  document.addEventListener("keydown", (e) => {
    if (state.lastView !== "flashcards" || !fcDeck.length) return;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight") { fcIndex = (fcIndex + 1) % fcDeck.length; renderCard(); }
    else if (e.key === "ArrowLeft") { fcIndex = (fcIndex - 1 + fcDeck.length) % fcDeck.length; renderCard(); }
    else if (e.key === " ") { e.preventDefault(); const f = $("#flashcard"); if (f) f.classList.toggle("flipped"); }
  });

  /* ---------- nav ---------- */
  $("#nav").addEventListener("click", (e) => {
    const b = e.target.closest(".nav-item"); if (b) setView(b.dataset.view);
  });
  $("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

  /* ---------- theme ---------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    $("#themeToggle").textContent = state.theme === "dark" ? "🌙" : "☀️";
  }
  $("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark"; save(); applyTheme();
  });

  /* ---------- reset ---------- */
  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all progress, scores and mastered questions?")) return;
    const theme = state.theme;
    state = { ...defaultState, theme, done: {}, docsQuiz: {} };
    save(); setView("dashboard");
  });

  /* ---------- global search ---------- */
  const overlay = $("#searchOverlay"), panel = $("#searchPanel"), searchInput = $("#globalSearch");
  const searchIndex = [];
  tracks.forEach((t) => t.cards.forEach((c, i) =>
    searchIndex.push({ trackId: t.id, idx: i, q: c.q, a: c.a, track: t.name, icon: t.icon, level: c.level })));

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    if (!term) { overlay.classList.add("hidden"); return; }
    const hits = searchIndex.filter((x) =>
      (x.q + " " + x.a + " " + x.track).toLowerCase().includes(term)).slice(0, 12);
    panel.innerHTML = hits.length
      ? hits.map((h) => `<div class="sr-item" data-tk="${h.trackId}" data-ix="${h.idx}">
          <div class="sr-q">${highlight(h.q, term)}</div>
          <div class="sr-meta">${h.icon} ${h.track} · ${h.level}</div>
        </div>`).join("")
      : `<div class="sr-empty">No matches for “${esc(term)}”.</div>`;
    overlay.classList.remove("hidden");
  });

  function highlight(text, term) {
    const i = text.toLowerCase().indexOf(term);
    if (i < 0) return mdInline(text);
    return mdInline(text.slice(0, i)) + "<mark style='background:var(--glow);color:var(--accent);border-radius:3px;padding:0 2px'>" +
      esc(text.slice(i, i + term.length)) + "</mark>" + mdInline(text.slice(i + term.length));
  }

  panel.addEventListener("click", (e) => {
    const it = e.target.closest(".sr-item"); if (!it) return;
    overlay.classList.add("hidden"); searchInput.value = "";
    setView("learn", { track: it.dataset.tk });
    requestAnimationFrame(() => {
      const el = $(`[data-card="${cardId(it.dataset.tk, it.dataset.ix)}"]`);
      if (el) { el.classList.add("open"); el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.style.transition = "box-shadow .3s"; el.style.boxShadow = "0 0 0 2px var(--accent)";
        setTimeout(() => (el.style.boxShadow = ""), 1400); }
    });
  });

  overlay.addEventListener("click", (e) => { if (e.target === overlay) { overlay.classList.add("hidden"); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") overlay.classList.add("hidden"); });

  /* ---------- utils ---------- */
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- boot ---------- */
  applyTheme();
  setView(state.lastView || "dashboard");
})();
