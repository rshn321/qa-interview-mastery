# 🎯 QA Interview Mastery

A professional, interactive web app that coaches QA engineers to crack the **Senior QA Engineer** interview.

No build step, no dependencies — pure HTML/CSS/vanilla JS. Just open it.

## Features
- **Dashboard** — live mastery %, best mock score, and per-domain progress (saved in `localStorage`).
- **QA Process (animated deep-dive)** — 10 scroll-revealed chapters covering the whole process (QA vs QC → SDLC/STLC → levels & pyramid → test types → test cases → defect life cycle → Agile → CI/CD → metrics), each with a custom animated diagram and an inline "check your understanding" quiz. Reading-progress bar, chapter nav, reduced-motion friendly.
- **Learn** — 12 curated domains, 44 senior-grade Q&A with code snippets, tables and "mark as mastered".
- **Flashcards** — flip-to-reveal active recall, shuffle, keyboard nav (← → Space).
- **Mock Interview** — timed, scored MCQ engine with instant explanations and a per-topic breakdown.
- **Roadmap** — a 6-week, phase-by-phase plan to interview-ready.
- **Global search**, light/dark theme, fully responsive.

## Domains covered
Test Strategy & Leadership · Test Design & Manual · Automation & Frameworks · API Testing ·
Performance & Non-Functional · CI/CD & Shift-Left · SQL & Backend · Coding & Logic ·
Agile & Process · Security (OWASP) · System Design for QA · Behavioral & Leadership.

## Run it
```bash
# Option A — just open the file
open index.html

# Option B — serve locally (recommended)
npm start            # python3 -m http.server 8080
npm run serve        # or: npx serve .
```
Then visit `http://localhost:8080`.

## Tooling — linted with [oxc](https://oxc.rs)
This project uses the Rust-based **oxc** toolchain (`oxlint`) for fast static analysis.
Config lives in `.oxlintrc.json` (browser env, `unicorn` + `oxc` plugins, `correctness`/`perf` categories).

```bash
npm install          # installs oxlint (devDependency)
npm run lint         # lint js/
npm run lint:fix     # auto-fix what it can
npm run check        # strict: fails on any warning (--max-warnings 0) — used in CI
```
The codebase passes `npm run check` with **zero warnings**.

## Structure
```
qa-interview-prep/
├── index.html          # app shell
├── css/styles.css      # design system (light/dark)
└── js/
    ├── data.js         # content bank (Q&A + quiz pool)
    └── app.js          # router, rendering, progress, mock engine, search
```

To add content, edit `js/data.js` — add cards to a track or questions to the `quiz` array. No rebuild needed.
