/* ============================================================================
 * QA Interview Mastery — Animated Deep-Dive Docs
 * window.QA_DOCS.chapters is consumed by app.js -> docs() view.
 * Each chapter: { id, num, icon, title, lede, visual(HTML), body(md[]),
 *                 keyPoints[], quiz[{q,o,c,e}] }
 * `visual` strings use classes animated by css/docs.css when .in-view is set.
 * ==========================================================================*/
(function () {
  "use strict";

  const chapters = [
    /* 1 ───────────────────────────────────────────── */
    {
      id: "qa-qc",
      num: 1,
      icon: "🛡️",
      title: "QA vs QC vs Testing",
      lede: "Three words people use interchangeably — and getting them right is the first signal of a real QA professional.",
      visual: `
        <div class="anim-compare">
          <div class="cmp-card cmp-a">
            <span class="cmp-ico">🛡️</span><h4>Quality Assurance</h4>
            <span class="cmp-tag">Process · Proactive</span>
            <p><strong>Prevents</strong> defects by building the right <em>process</em>. "Are we doing the right things, the right way?"</p>
          </div>
          <div class="cmp-arrow">contains →</div>
          <div class="cmp-card cmp-b">
            <span class="cmp-ico">🔍</span><h4>Quality Control</h4>
            <span class="cmp-tag">Product · Reactive</span>
            <p><strong>Detects</strong> defects in the actual <em>product</em>. "Did we build it right?"</p>
          </div>
          <div class="cmp-arrow">contains →</div>
          <div class="cmp-card cmp-c">
            <span class="cmp-ico">🧪</span><h4>Testing</h4>
            <span class="cmp-tag">Activity · Execution</span>
            <p><strong>Executes</strong> the software to find defects. A core activity <em>within</em> QC.</p>
          </div>
        </div>`,
      body: [
        "**Quality Assurance (QA)** is *process-oriented and preventive*. It defines standards, reviews, audits, and ways of working so that defects are far less likely to be introduced in the first place. QA owns the question: *are our processes good enough to produce quality?*",
        "**Quality Control (QC)** is *product-oriented and detective*. It inspects the actual deliverable — running tests, reviewing builds — to find defects that slipped through. QC asks: *does this specific product meet the requirements?*",
        "**Testing** is the hands-on *activity* of executing software (manually or automated) to discover defects and verify behaviour. It is a subset of QC. So the relationship nests neatly: **QA ⊃ QC ⊃ Testing**.",
        "Mental model: QA is *writing a good recipe and kitchen process*; QC is *tasting the dish before it leaves the kitchen*; testing is *the act of tasting*. A senior engineer invests in QA because preventing a defect is cheaper than catching it — and far cheaper than a customer finding it.",
      ],
      keyPoints: [
        "QA = process, prevention, proactive. QC = product, detection, reactive.",
        "Testing is one activity inside QC; QC is inside QA.",
        "Cost of a defect rises ~10× at each stage it escapes — prevention wins.",
      ],
      quiz: [
        { q: "A team introduces mandatory peer code reviews and a definition-of-done checklist. This is primarily:", o: ["Quality Control", "Quality Assurance", "Testing", "Debugging"], c: 1, e: "Defining a process to prevent defects is QA — it's proactive and process-oriented, not inspecting a finished product." },
        { q: "Which statement about the relationship is correct?", o: ["Testing contains QA", "QA and QC are unrelated", "QA ⊃ QC ⊃ Testing", "QC contains QA"], c: 2, e: "QA is the broadest (process); QC sits inside it (product inspection); testing is an activity within QC." },
      ],
    },

    /* 2 ───────────────────────────────────────────── */
    {
      id: "sdlc",
      num: 2,
      icon: "🔄",
      title: "The SDLC & Where QA Lives",
      lede: "Quality isn't a phase at the end — it threads through every stage of building software.",
      visual: `
        <div class="anim-pipeline">
          <div class="pl-track"><span class="pl-dot"></span></div>
          <div class="pl-nodes">
            <div class="pl-node"><span class="pl-i">1</span><b>Requirements</b><small>QA reviews testability</small></div>
            <div class="pl-node"><span class="pl-i">2</span><b>Design</b><small>QA plans test strategy</small></div>
            <div class="pl-node"><span class="pl-i">3</span><b>Development</b><small>QA writes test cases</small></div>
            <div class="pl-node pl-hot"><span class="pl-i">4</span><b>Testing</b><small>execute &amp; report</small></div>
            <div class="pl-node"><span class="pl-i">5</span><b>Deployment</b><small>QA smoke &amp; sign-off</small></div>
            <div class="pl-node"><span class="pl-i">6</span><b>Maintenance</b><small>QA regression</small></div>
          </div>
        </div>`,
      body: [
        "The **Software Development Life Cycle (SDLC)** is the framework of phases software passes through: *Requirements → Design → Development → Testing → Deployment → Maintenance*.",
        "A junior assumes QA only appears at the **Testing** phase. A senior knows QA participates in *every* phase — this is **shift-left**:",
        "- **Requirements:** review for clarity, completeness and *testability*; raise ambiguities before a line of code exists.\n- **Design:** craft the test strategy, identify risk areas, choose automation scope.\n- **Development:** author test cases and automation alongside the code; unit tests + static analysis.\n- **Testing:** execute, log defects, retest, track to exit criteria.\n- **Deployment:** smoke tests, release sign-off, go/no-go input.\n- **Maintenance:** regression on every change, monitor production.",
        "Common SDLC models: **Waterfall** (sequential, heavy upfront docs), the **V-Model** (each dev phase paired with a test level), **Agile/Scrum** (iterative, continuous testing) and **DevOps** (continuous delivery with automated quality gates).",
      ],
      keyPoints: [
        "SDLC = Requirements → Design → Development → Testing → Deployment → Maintenance.",
        "QA is involved in every phase (shift-left), not just the Testing phase.",
        "Models: Waterfall, V-Model, Agile, DevOps — testing's role differs in each.",
      ],
      quiz: [
        { q: "'Shift-left testing' means:", o: ["Test only after deployment", "Move QA activities earlier in the SDLC", "Use the left half of the screen", "Skip the design phase"], c: 1, e: "Shift-left pulls testing forward — reviewing requirements and designing tests early, where defects are cheapest to fix." },
        { q: "In which model is each development phase paired with a corresponding test level?", o: ["Waterfall", "V-Model", "Big Bang", "Kanban"], c: 1, e: "The V-Model maps each build phase (requirements, design, coding) to a matching test level (acceptance, integration, unit)." },
      ],
    },

    /* 3 ───────────────────────────────────────────── */
    {
      id: "stlc",
      num: 3,
      icon: "🧬",
      title: "The Software Testing Life Cycle (STLC)",
      lede: "The testing process has its own life cycle — six phases, each with entry/exit criteria and deliverables.",
      visual: `
        <div class="anim-steps">
          ${[
            ["1", "Requirement Analysis", "Identify what's testable; raise gaps. → RTM"],
            ["2", "Test Planning", "Scope, strategy, effort, tools, risk. → Test Plan"],
            ["3", "Test Case Design", "Write cases & scripts; prep data. → Test Cases"],
            ["4", "Environment Setup", "Provision env + data; smoke it. → Ready env"],
            ["5", "Test Execution", "Run cases, log & retest defects. → Test Results"],
            ["6", "Cycle Closure", "Exit check, metrics, lessons learned. → Closure Report"],
          ].map(([n, t, d]) => `
            <div class="stp">
              <span class="stp-n">${n}</span>
              <div class="stp-body"><strong>${t}</strong><small>${d}</small></div>
            </div>`).join("")}
        </div>`,
      body: [
        "Where the SDLC governs *building*, the **STLC** governs *testing*. It runs in parallel with the SDLC and has six phases:",
        "1. **Requirement Analysis** — study requirements from a testing lens, decide what's testable, build the **Requirements Traceability Matrix (RTM)** linking requirements to tests.\n2. **Test Planning** — the senior-owned phase: define scope, approach, estimation, resources, schedule, tools and risk. Deliverable: the **Test Plan**.\n3. **Test Case Design** — write detailed test cases and automation scripts; prepare test data; peer-review them.\n4. **Test Environment Setup** — provision hardware/software/data that mirrors production; run a smoke test to confirm it's usable.\n5. **Test Execution** — run cases, compare actual vs expected, log defects, retest fixes, update the RTM.\n6. **Test Cycle Closure** — verify exit criteria met, produce metrics and a closure report, capture lessons learned.",
        "Every phase has **entry criteria** (what must be ready to start) and **exit criteria** (what must be true to finish) plus concrete **deliverables** — that rigour is what distinguishes a *process* from ad-hoc clicking.",
      ],
      keyPoints: [
        "Six phases: Requirement Analysis → Planning → Design → Env Setup → Execution → Closure.",
        "Each phase has entry criteria, exit criteria, and deliverables.",
        "RTM (Requirements Traceability Matrix) ties requirements to test cases for coverage.",
      ],
      quiz: [
        { q: "Which artefact maps each requirement to its test cases to prove coverage?", o: ["Test Plan", "Requirements Traceability Matrix (RTM)", "Defect Report", "Burndown chart"], c: 1, e: "The RTM links requirements ↔ test cases bidirectionally, exposing any requirement with no test (a coverage gap)." },
        { q: "Producing the closure report, metrics and lessons learned happens in which STLC phase?", o: ["Test Planning", "Test Execution", "Test Cycle Closure", "Requirement Analysis"], c: 2, e: "Test Cycle Closure wraps up: confirm exit criteria, publish metrics, and record lessons learned for next time." },
      ],
    },

    /* 4 ───────────────────────────────────────────── */
    {
      id: "levels",
      num: 4,
      icon: "🔺",
      title: "Levels of Testing & the Test Pyramid",
      lede: "Testing happens at distinct levels — and how you distribute effort across them decides whether your suite is fast or fragile.",
      visual: `
        <div class="anim-stack">
          <div class="stk-layer l4"><b>Acceptance / E2E</b><small>few · slow · user journeys</small></div>
          <div class="stk-layer l3"><b>System Testing</b><small>whole app, end-to-end behaviour</small></div>
          <div class="stk-layer l2"><b>Integration / API</b><small>modules &amp; services together</small></div>
          <div class="stk-layer l1"><b>Unit Testing</b><small>many · fast · cheap · isolated</small></div>
        </div>`,
      body: [
        "Testing is performed at four classic **levels**, smallest scope to largest:",
        "- **Unit testing** — a single function/class in isolation, written by developers, run in milliseconds.\n- **Integration testing** — modules or services working together; catches interface/contract bugs (API testing lives here).\n- **System testing** — the fully integrated application tested end-to-end against requirements.\n- **Acceptance testing (UAT)** — the business/user confirms it solves the real need; the gate to release.",
        "The **Test Automation Pyramid** prescribes the *ratio*: a wide base of fast **unit** tests, fewer **integration/API** tests, and only a thin tip of slow **UI/E2E** tests. Push every check to the lowest level that can catch the bug.",
        "The anti-pattern is the **ice-cream cone** — mostly slow UI tests and few unit tests. It produces pipelines that take hours, flaky failures, and a team that stops trusting the suite. If a bug can be caught by a unit or API test, never write a UI test for it.",
      ],
      keyPoints: [
        "Four levels: Unit → Integration → System → Acceptance (UAT).",
        "Pyramid: many fast unit tests, few slow UI/E2E tests.",
        "Inverted 'ice-cream cone' (UI-heavy) = slow, flaky, distrusted suite.",
      ],
      quiz: [
        { q: "In a healthy test pyramid, which layer should have the FEWEST tests?", o: ["Unit", "Integration/API", "UI / End-to-End", "Static analysis"], c: 2, e: "UI/E2E tests are slow and brittle — keep them few and reserved for critical journeys; pile cheap, fast tests at the unit base." },
        { q: "Who typically owns acceptance testing (UAT)?", o: ["Developers", "The business / end users", "DevOps", "Security team"], c: 1, e: "UAT validates the software solves the real business need — it's owned by users/business stakeholders, the final gate before release." },
      ],
    },

    /* 5 ───────────────────────────────────────────── */
    {
      id: "types",
      num: 5,
      icon: "🌳",
      title: "Functional vs Non-Functional Testing",
      lede: "Two great families of testing: does it do the right thing, and does it do it well?",
      visual: `
        <div class="anim-tree">
          <div class="tr-root">Testing Types</div>
          <div class="tr-branches">
            <div class="tr-branch tr-f">
              <div class="tr-head">⚙️ Functional <small>“what it does”</small></div>
              <ul><li>Smoke</li><li>Sanity</li><li>Regression</li><li>Integration</li><li>UAT</li></ul>
            </div>
            <div class="tr-branch tr-n">
              <div class="tr-head">📊 Non-Functional <small>“how well it does it”</small></div>
              <ul><li>Performance</li><li>Security</li><li>Usability</li><li>Compatibility</li><li>Reliability</li></ul>
            </div>
          </div>
        </div>`,
      body: [
        "**Functional testing** verifies the system behaves *correctly* against requirements — every feature, input, and rule. Key members of the family:",
        "- **Smoke testing** — a shallow, wide check that the build is stable enough to test at all ('build verification').\n- **Sanity testing** — a narrow, deep check of a specific fix or feature after a minor change.\n- **Regression testing** — re-running existing tests to confirm new changes didn't break old behaviour.\n- **Re-testing** — verifying a *specific* fixed defect is actually fixed (don't confuse with regression).",
        "**Non-functional testing** verifies *quality attributes* — how well it performs, not what it does:",
        "- **Performance** (load, stress, soak, spike) — speed and stability under load.\n- **Security** — resistance to attack (OWASP: access control, injection, etc.).\n- **Usability** — how easy and intuitive it is.\n- **Compatibility** — across browsers, devices, OSes.\n- **Reliability / Availability** — uptime and graceful failure.",
        "**Smoke vs Sanity** is a classic trap: smoke is *wide and shallow on a new build*; sanity is *narrow and deep on a specific change*. **Re-test vs Regression**: re-test targets the exact bug; regression guards everything around it.",
      ],
      keyPoints: [
        "Functional = what it does; Non-functional = how well it does it.",
        "Smoke = wide+shallow build check; Sanity = narrow+deep change check.",
        "Re-testing verifies a specific fix; regression guards against side-effects.",
      ],
      quiz: [
        { q: "A quick check that a new build's critical paths work before deeper testing begins is called:", o: ["Sanity testing", "Smoke testing", "Regression testing", "Soak testing"], c: 1, e: "Smoke testing is the wide-but-shallow build-verification gate — if it fails, you reject the build rather than testing further." },
        { q: "Load, stress, and soak testing are all forms of:", o: ["Functional testing", "Non-functional (performance) testing", "Unit testing", "Sanity testing"], c: 1, e: "They measure a quality attribute — behaviour under load — which is non-functional, specifically performance testing." },
      ],
    },

    /* 6 ───────────────────────────────────────────── */
    {
      id: "testcase",
      num: 6,
      icon: "📝",
      title: "Anatomy of a Test Case",
      lede: "The atomic unit of testing. A great test case is unambiguous, repeatable, and traceable.",
      visual: `
        <div class="anim-doc">
          ${[
            ["ID", "TC-014"],
            ["Title", "Login fails with a clear error on wrong password"],
            ["Priority", "High"],
            ["Preconditions", "User account exists; user is on the login page"],
            ["Test Data", "email: user@x.com · password: WRONG"],
            ["Steps", "1. Enter email  2. Enter wrong password  3. Click ‘Sign in’"],
            ["Expected", "Stay on login; show ‘Invalid email or password’; no redirect"],
            ["Actual", "— filled during execution —"],
            ["Status", "Pass / Fail / Blocked"],
          ].map(([k, v]) => `<div class="doc-row"><span class="doc-k">${k}</span><span class="doc-v">${v}</span></div>`).join("")}
        </div>`,
      body: [
        "A **test case** is a documented set of conditions and steps to verify one specific behaviour. Its essential fields:",
        "- **ID & Title** — unique reference and a precise, behaviour-describing name.\n- **Priority** — how important this scenario is.\n- **Preconditions** — what must be true before you start.\n- **Test Data** — the exact inputs used.\n- **Steps** — numbered, unambiguous actions any tester can follow identically.\n- **Expected Result** — the precise, verifiable outcome (the heart of the case).\n- **Actual Result & Status** — recorded during execution (Pass / Fail / Blocked).",
        "Qualities of a *good* test case: **atomic** (tests one thing), **independent** (doesn't rely on another case's leftovers), **repeatable** (same result every run), **clear** (no interpretation needed), and **traceable** (linked to a requirement via the RTM).",
        "Design test cases with formal techniques — **equivalence partitioning, boundary value analysis, decision tables, state transition** — so a small set of cases covers a large input space, instead of guessing.",
      ],
      keyPoints: [
        "Core fields: ID, Title, Preconditions, Test Data, Steps, Expected, Actual, Status.",
        "Good cases are atomic, independent, repeatable, clear and traceable.",
        "Use design techniques (EP, BVA, decision tables) to cover more with fewer cases.",
      ],
      quiz: [
        { q: "Which single field is the 'heart' of a test case — what determines pass or fail?", o: ["Priority", "Preconditions", "Expected Result", "Test Case ID"], c: 2, e: "Without a precise, verifiable Expected Result you can't objectively decide pass/fail — it's the core of the case." },
        { q: "A test case that depends on data left behind by a previous test violates which quality?", o: ["Atomicity", "Independence", "Traceability", "Priority"], c: 1, e: "Independence means a case must set up its own state and not rely on another test's side-effects — otherwise order changes break it." },
      ],
    },

    /* 7 ───────────────────────────────────────────── */
    {
      id: "defect",
      num: 7,
      icon: "🐞",
      title: "The Defect Life Cycle",
      lede: "Every bug travels through a state machine from discovery to closure. Knowing it cold is interview table-stakes.",
      visual: `
        <div class="anim-flow">
          <span class="fl-token"></span>
          <div class="fl-node n-start">New</div>
          <div class="fl-arrow">→</div>
          <div class="fl-node">Assigned</div>
          <div class="fl-arrow">→</div>
          <div class="fl-node">Open / In&nbsp;Progress</div>
          <div class="fl-arrow">→</div>
          <div class="fl-node">Fixed</div>
          <div class="fl-arrow">→</div>
          <div class="fl-node">Retest</div>
          <div class="fl-arrow">→</div>
          <div class="fl-node n-end">Verified → Closed</div>
        </div>
        <div class="fl-alt">
          <span>↩ Reopened (retest failed)</span>
          <span>✕ Rejected</span>
          <span>⧉ Duplicate</span>
          <span>⏸ Deferred</span>
        </div>`,
      body: [
        "When a tester finds a bug, it enters a workflow (the exact state names vary by tool, but the shape is universal):",
        "1. **New** — defect logged by QA.\n2. **Assigned** — triaged and given to a developer.\n3. **Open / In Progress** — developer is investigating/fixing.\n4. **Fixed** — developer marks it resolved (often in a new build).\n5. **Retest** — QA re-tests the fix.\n6. **Verified → Closed** — fix confirmed; the defect is closed.",
        "Branches off the happy path:\n- **Reopened** — retest failed, it goes back to the developer.\n- **Rejected** — not a valid defect (works as designed).\n- **Duplicate** — already reported.\n- **Deferred** — valid but won't be fixed this release (low priority/risk).",
        "Two attributes drive triage and are *independent*:\n- **Severity** = technical impact (how badly it breaks the system) — owned by QA.\n- **Priority** = business urgency to fix — owned by Product/Release.\nA crash on a dead browser is high-severity/low-priority; a typo in the company name on a launch page is low-severity/high-priority.",
      ],
      keyPoints: [
        "Happy path: New → Assigned → Open → Fixed → Retest → Verified → Closed.",
        "Branches: Reopened, Rejected, Duplicate, Deferred.",
        "Severity (technical impact, QA-owned) ≠ Priority (business urgency, Product-owned).",
      ],
      quiz: [
        { q: "A developer marks a defect Fixed, QA re-tests, and the bug still occurs. The defect moves to:", o: ["Closed", "Deferred", "Reopened", "Duplicate"], c: 2, e: "A failed retest sends the defect back to the developer as Reopened — it is not closed until verified fixed." },
        { q: "App crashes only on Internet Explorer 8 (0.01% of users). Best classification?", o: ["High severity, low priority", "Low severity, high priority", "High severity, high priority", "Low severity, low priority"], c: 0, e: "A crash is technically severe (high severity), but the tiny, deprecated audience makes it low business urgency (low priority)." },
      ],
    },

    /* 8 ───────────────────────────────────────────── */
    {
      id: "agile",
      num: 8,
      icon: "🔁",
      title: "QA in Agile & Scrum",
      lede: "In Agile, quality isn't a downstream gate — it's woven into every ceremony of the sprint.",
      visual: `
        <div class="anim-loop">
          <div class="lp-orbit"><span class="lp-sat"></span></div>
          <div class="lp-center"><b>Sprint</b><small>1–4 weeks</small></div>
          <div class="lp-points">
            <span class="lp-pt pt1">Refinement<small>clarify acceptance criteria</small></span>
            <span class="lp-pt pt2">Planning<small>estimate test effort</small></span>
            <span class="lp-pt pt3">Daily Stand-up<small>surface blockers</small></span>
            <span class="lp-pt pt4">Development<small>test in-sprint, automate</small></span>
            <span class="lp-pt pt5">Review / Demo<small>validate increment</small></span>
            <span class="lp-pt pt6">Retrospective<small>improve quality process</small></span>
          </div>
        </div>`,
      body: [
        "Agile delivers software in short **sprints** (1–4 weeks). QA is embedded throughout — there's no 'testing phase' bolted on the end. The QA role per ceremony:",
        "- **Backlog refinement / Three Amigos (PO + Dev + QA):** clarify and sharpen *acceptance criteria*, surface edge cases, ensure each story is testable *before* it's pulled in.\n- **Sprint planning:** estimate test effort, flag risky stories, agree the **Definition of Done** includes testing/automation.\n- **Daily stand-up:** raise blockers (env down, build broken), report progress.\n- **Development:** test stories *as they're built* — in-sprint — and automate alongside; pair with developers (no 'throw it over the wall').\n- **Sprint review / demo:** validate the increment against acceptance criteria.\n- **Retrospective:** raise process improvements (flaky pipeline, escaped defects).",
        "The governing idea: **whole-team quality**. Developers write unit/integration tests; QA designs strategy, exploratory testing and automation; everyone owns the **Definition of Done**. A senior QA *removes the bottleneck* rather than being it.",
        "**Acceptance criteria** (often written as Gherkin **Given/When/Then**) are the shared contract that makes a story testable and turns specs into executable **BDD** tests.",
      ],
      keyPoints: [
        "QA participates in every Scrum ceremony — refinement, planning, stand-up, review, retro.",
        "Test in-sprint; the Definition of Done includes testing & automation.",
        "Whole-team quality: QA enables the team rather than acting as a final gate.",
      ],
      quiz: [
        { q: "Where does QA add the most value by clarifying acceptance criteria and edge cases BEFORE coding starts?", o: ["Retrospective", "Backlog refinement / Three Amigos", "Sprint review", "Deployment"], c: 1, e: "Refinement (the 'Three Amigos' of PO+Dev+QA) is where ambiguous stories get sharpened and made testable before work begins — the cheapest place to prevent defects." },
        { q: "'Whole-team quality' in Agile means:", o: ["Only QA is responsible for quality", "Quality is checked only at release", "The whole team owns quality; QA enables rather than gatekeeps", "Developers never write tests"], c: 2, e: "Agile distributes quality across the team — devs write unit tests, the DoD includes testing, and QA enables the team instead of being a downstream bottleneck." },
      ],
    },

    /* 9 ───────────────────────────────────────────── */
    {
      id: "automation",
      num: 9,
      icon: "🚦",
      title: "Automation, CI/CD & Quality Gates",
      lede: "Modern QA runs continuously inside the pipeline — fast feedback, staged gates, fail fast.",
      visual: `
        <div class="anim-cicd">
          <span class="ci-token"></span>
          ${[
            ["Commit", "lint + static"],
            ["Build", "compile"],
            ["Unit", "seconds"],
            ["API / Integration", "minutes"],
            ["E2E", "critical paths"],
            ["Deploy", "canary + monitor"],
          ].map(([t, d], i) => `
            <div class="ci-stage" style="--i:${i}">
              <span class="ci-gate"></span>
              <b>${t}</b><small>${d}</small>
            </div>`).join('<div class="ci-link"></div>')}
        </div>`,
      body: [
        "**Test automation** turns repetitive regression checks into code that runs on every change. It's a regression-protection *investment* — not every test should be automated (skip throwaway, highly-volatile-UI, or human-judgement tests).",
        "Automated tests live in the **CI/CD pipeline** as staged **quality gates**, ordered fast-to-slow so failures surface early:",
        "1. **Commit / PR stage** — lint + static analysis + unit tests (seconds). Blocks the merge.\n2. **Build stage** — integration + API + contract tests (minutes).\n3. **Post-deploy to staging** — smoke + critical E2E + security scan.\n4. **Pre-prod / prod** — canary release, synthetic monitoring, performance baseline.",
        "A **quality gate** is an automated pass/fail checkpoint — e.g. *'coverage ≥ 80%, zero new critical issues, all P1 tests green'* — that **blocks promotion** if unmet. Keep the PR gate under ~10 minutes so developers stay in flow; run heavy full-regression nightly.",
        "Pillars of a maintainable framework: the **Page Object Model** (encapsulate locators behind behaviours), **explicit waits** (never fixed sleeps), **independent atomic tests**, **parallel execution**, and a ruthless **flaky-test policy** (quarantine, then fix or delete).",
      ],
      keyPoints: [
        "Automate stable, repetitive, high-risk regression — not throwaway or volatile tests.",
        "Pipeline gates run fast→slow: lint/unit → integration/API → E2E → deploy.",
        "A quality gate blocks promotion until criteria are met; keep PR gates < ~10 min.",
      ],
      quiz: [
        { q: "Why are unit tests placed FIRST in the pipeline, before E2E tests?", o: ["They're the most thorough", "They're fast, so they give the earliest failure feedback", "They test the UI", "They require a deployed environment"], c: 1, e: "Fast tests run first so the pipeline 'fails fast' — developers get feedback in seconds instead of waiting for slow E2E runs." },
        { q: "A checkpoint that blocks code promotion unless 'coverage ≥ 80% and all P1 tests pass' is called a:", o: ["Smoke test", "Quality gate", "Page object", "Burndown"], c: 1, e: "That's a quality gate: an automated pass/fail criterion that must be satisfied before the build advances to the next stage." },
      ],
    },

    /* 10 ───────────────────────────────────────────── */
    {
      id: "metrics",
      num: 10,
      icon: "📈",
      title: "Metrics, Reporting & Exit Criteria",
      lede: "You can't manage what you don't measure — but measure outcomes, not vanity counts.",
      visual: `
        <div class="anim-metrics">
          <div class="mx"><div class="mx-num" data-countup="92" data-suffix="%">0</div><div class="mx-lbl">Defect Removal Efficiency</div></div>
          <div class="mx"><div class="mx-num" data-countup="3" data-suffix="%">0</div><div class="mx-lbl">Defect Leakage (escaped)</div></div>
          <div class="mx"><div class="mx-num" data-countup="98" data-suffix="%">0</div><div class="mx-lbl">Test Pass Rate</div></div>
          <div class="mx"><div class="mx-num" data-countup="0" data-suffix="" data-text="0">0</div><div class="mx-lbl">Open Sev-1 Defects</div></div>
        </div>`,
      body: [
        "QA reports the *quality signal* with metrics — but a senior optimises **outcome** metrics, not **vanity** ones (raw test or bug counts mean nothing on their own).",
        "- **Defect Removal Efficiency (DRE)** = defects found before release ÷ total defects. Aim > 90%.\n- **Defect Leakage / Escape Rate** = defects found in production ÷ total — the single best measure of QA effectiveness. *Weight it by severity* — leaking Sev-3s is fine, leaking Sev-1s is not.\n- **Test Pass Rate, Coverage, Defect Density** (defects per module/KLOC).\n- **Mean Time To Detect / Resolve** and flaky-test rate.",
        "**Exit criteria** decide when testing stops and the product can ship. A typical set: *all planned cases executed*, *pass rate ≥ target*, *zero open Sev-1/Sev-2 defects*, *coverage threshold met*, *critical risks mitigated*.",
        "The **go/no-go** decision: QA *presents the residual-risk picture and a release recommendation*; the business (Release Manager / Product Owner) owns the final call. A senior QA makes the risk clear enough that the right decision is obvious — and documents accepted residual risk if the business ships anyway.",
      ],
      keyPoints: [
        "Optimise outcome metrics (escape rate, DRE), not vanity counts (test/bug totals).",
        "Defect Leakage (severity-weighted) is the best single measure of QA effectiveness.",
        "Exit criteria + go/no-go: QA recommends with residual risk; the business decides.",
      ],
      quiz: [
        { q: "Which is the single BEST measure of how effective your QA process was?", o: ["Number of test cases written", "Number of bugs filed", "Defect escape/leakage rate", "Lines of automation code"], c: 2, e: "Escaped defects (severity-weighted) measure the quality you actually shipped. Test and bug counts are vanity metrics — effort, not outcome." },
        { q: "On a go/no-go decision, the QA engineer's role is to:", o: ["Make the final release decision alone", "Provide the residual-risk picture and a recommendation; the business decides", "Refuse to comment", "Automatically block any release with open defects"], c: 1, e: "QA surfaces risk clearly and recommends; the Release Manager/PO owns the business decision, accepting documented residual risk if they ship." },
      ],
    },

    /* 11 ─── DATA QA TRACK ────────────────────────── */
    {
      id: "data-validation",
      num: 11,
      icon: "🔁",
      title: "Data Validation & UI-to-Database Verification",
      lede: "The core skill of a data/analytics QA: proving that what the screen shows is exactly what the source of truth holds.",
      visual: `
        <div class="anim-recon">
          <div class="rc-panel rc-ui">
            <span class="rc-tag">🖥️ UI shows</span>
            <div class="rc-val">Total Orders <b>1,248</b></div>
            <div class="rc-val">Revenue <b>$84,300</b></div>
            <div class="rc-val">Status <b>Active: 1,190</b></div>
          </div>
          <div class="rc-eq"><span>=?</span><small>reconcile</small></div>
          <div class="rc-panel rc-db">
            <span class="rc-tag">🗄️ Database (source of truth)</span>
            <div class="rc-val">COUNT(*) → <b>1,248</b> <i>✓</i></div>
            <div class="rc-val">SUM(amount) → <b>84,300</b> <i>✓</i></div>
            <div class="rc-val">WHERE status='active' → <b>1,190</b> <i>✓</i></div>
          </div>
        </div>`,
      body: [
        "**Data validation** confirms that data is *accurate, complete, consistent and correctly transformed* as it moves between layers — and **UI-to-database verification** is the most common form: take a value displayed in the UI and prove it against the database with a query.",
        "The workflow for every UI-to-DB check:\n1. **Identify the displayed value** and the business rule behind it (e.g. 'Active customers this month').\n2. **Trace it to source** — which table(s)/column(s)/filters produce it.\n3. **Write the equivalent SQL** and run it against the same data snapshot.\n4. **Reconcile** UI value == query result. Investigate any mismatch.",
        "The **data-quality dimensions** you're validating (memorise these — they come up constantly):\n- **Accuracy** — values are correct vs the source.\n- **Completeness** — no missing rows/fields (row counts match; no unexpected NULLs).\n- **Consistency** — the same fact agrees across screens/reports/systems.\n- **Uniqueness** — no unintended duplicates.\n- **Validity / Conformity** — values respect format, type, range and constraints.\n- **Integrity** — relationships hold (no orphan foreign keys).\n- **Timeliness** — data is fresh/up to date.",
        "Common defects this catches: rounding/format differences (UI shows `$84.3K`, DB has `84300.00`), timezone shifts in dates, a UI filter that doesn't match the query's `WHERE`, NULLs rendered as `0`, currency/locale mismatches, and stale caches showing old aggregates.",
      ],
      keyPoints: [
        "UI-to-DB verification = take a displayed value, write SQL against the source, and reconcile.",
        "Validate the 7 data-quality dimensions: accuracy, completeness, consistency, uniqueness, validity, integrity, timeliness.",
        "Watch for rounding, timezone, locale, NULL-as-0 and filter-mismatch defects between UI and DB.",
      ],
      quiz: [
        { q: "A dashboard shows 'Active Customers: 1,190' but the source query returns 1,205. The MOST likely cause to investigate first is:", o: ["The database is corrupted", "A mismatch between the UI's filter logic and the query's WHERE clause (or a stale cache)", "The user's screen resolution", "Nothing — a 15-row difference is acceptable"], c: 1, e: "Reconciliation mismatches usually come from differing filter/aggregation logic (or caching/timezone), not corruption. Align the UI's business rule with the SQL and re-check." },
        { q: "Verifying there are no unintended duplicate customer records tests which data-quality dimension?", o: ["Timeliness", "Uniqueness", "Validity", "Accuracy"], c: 1, e: "Uniqueness is the dimension that no entity is recorded more than once unintentionally — typically checked with GROUP BY ... HAVING COUNT(*) > 1." },
      ],
    },

    /* 12 ───────────────────────────────────────────── */
    {
      id: "analytics-ui",
      num: 12,
      icon: "📊",
      title: "Validating Analytics & Reporting UIs",
      lede: "Dashboards add their own failure modes: sorting, filtering, charts, drilldowns and aggregations must all stay true to the data.",
      visual: `
        <div class="anim-dash">
          <div class="dh-toolbar">
            <span class="dh-ctrl">⇅ Sort</span><span class="dh-ctrl">⛃ Filter</span>
            <span class="dh-ctrl">📅 Date range</span><span class="dh-ctrl">⤓ Export</span>
          </div>
          <div class="dh-body">
            <div class="dh-chart">
              <span class="dh-bar" style="--h:55%"></span><span class="dh-bar" style="--h:80%"></span>
              <span class="dh-bar" style="--h:38%"></span><span class="dh-bar" style="--h:95%"></span>
              <span class="dh-bar" style="--h:66%"></span>
            </div>
            <div class="dh-table">
              <div class="dh-row dh-h"><span>Region</span><span>Orders</span><span>Revenue</span></div>
              <div class="dh-row"><span>APAC ▸</span><span>412</span><span>$28,100</span></div>
              <div class="dh-row"><span>EMEA ▸</span><span>388</span><span>$26,540</span></div>
              <div class="dh-row"><span>AMER ▸</span><span>448</span><span>$29,660</span></div>
            </div>
          </div>
        </div>`,
      body: [
        "Reporting UIs aren't just 'does the page load'. Each interactive control is a distinct test surface that must stay faithful to the underlying data:",
        "- **Sorting** — sort each column asc/desc; verify ordering is correct for the *data type* (numeric `2 < 10`, not string `'10' < '2'`), nulls land consistently, and sorting doesn't drop or duplicate rows.\n- **Filtering** — single and combined filters; verify the result set exactly matches the equivalent SQL `WHERE`; test 'no results', 'select all', clearing filters, and that totals/charts recompute with the filter applied.\n- **Charts/visualisations** — the plotted values match the table and the query; correct axes, units, scale, legends, time-bucketing; tooltips show accurate numbers; empty/zero/negative handled.\n- **Drilldowns** — clicking a summary (e.g. a bar or 'APAC ▸') opens detail whose rows **sum back** to the parent figure. Drill-down totals must reconcile with drill-up.\n- **Aggregations** — SUM/COUNT/AVG/DISTINCT computed correctly, with the right grouping and de-duplication; beware double-counting from joins.",
        "**Cross-checking is the throughline:** for every visual element, the rule is *UI value == table value == SQL result*. Also test **pagination** (counts and totals are for the whole set, not just the page), **export** (CSV/Excel matches what's on screen), **date ranges & timezones**, **currency/number formatting and rounding**, and **role-based data** (a regional manager sees only their region).",
        "Non-functional angles for BI: **performance** of heavy queries under realistic data volume, **refresh/latency** (how fresh is the data?), and **concurrency** (many users slicing simultaneously).",
      ],
      keyPoints: [
        "Test every control as its own surface: sorting, filtering, charts, drilldowns, aggregations.",
        "Drilldown detail must sum back to the summary; filtered charts/totals must recompute correctly.",
        "Golden rule: UI value == table value == SQL result — and verify pagination, export, timezones & rounding.",
      ],
      quiz: [
        { q: "A 'Revenue by Region' bar chart's APAC bar is clicked, opening an order list. What's the key data-accuracy check?", o: ["The list loads within 2 seconds", "The detail rows' revenue sums back to the APAC bar's value", "The list is sorted alphabetically", "The chart uses brand colors"], c: 1, e: "Drilldown integrity: the detailed rows must reconcile (sum) to the aggregated parent value — otherwise the drilldown is misrepresenting the summary." },
        { q: "A numeric 'Orders' column sorts as 1, 10, 2, 22, 3. This is a classic sign of:", o: ["Correct numeric sorting", "String/lexicographic sorting applied to numbers", "A database outage", "A rounding error"], c: 1, e: "1, 10, 2, 3... is lexicographic (string) ordering. Numeric columns must sort by numeric value — a very common reporting-UI defect to catch." },
      ],
    },

    /* 13 ───────────────────────────────────────────── */
    {
      id: "sql-validation",
      num: 13,
      icon: "🗄️",
      title: "SQL for Backend Data Validation",
      lede: "SQL is the data QA's primary tool — to cross-check the UI, reconcile counts, and hunt data-quality defects directly at the source.",
      visual: `
        <div class="anim-steps">
          ${[
            ["1", "Row-count reconciliation", "Does the UI total match COUNT(*) with the same filters?"],
            ["2", "Aggregate cross-check", "Re-compute SUM/AVG/DISTINCT and compare to the report."],
            ["3", "Duplicate detection", "GROUP BY key HAVING COUNT(*) > 1."],
            ["4", "NULL & validity checks", "Unexpected NULLs, out-of-range or malformed values."],
            ["5", "Referential integrity", "Anti-join to find orphan foreign keys."],
            ["6", "Source-to-target", "Compare source rows against the loaded target (ETL)."],
          ].map(([n, t, d]) => `<div class="stp"><span class="stp-n">${n}</span><div class="stp-body"><strong>${t}</strong><small>${d}</small></div></div>`).join("")}
        </div>`,
      code:
`-- 1) Row-count reconciliation (UI 'Active: 1,190' vs source)
SELECT COUNT(*) FROM customers WHERE status = 'active';

-- 2) Aggregate cross-check (matches the revenue tile?)
SELECT region, SUM(amount) AS revenue, COUNT(*) AS orders
FROM orders WHERE order_date >= '2026-06-01'
GROUP BY region ORDER BY revenue DESC;

-- 3) Duplicate detection (uniqueness)
SELECT email, COUNT(*) AS dupes
FROM customers GROUP BY email HAVING COUNT(*) > 1;

-- 4) Completeness / validity (unexpected NULLs or bad values)
SELECT COUNT(*) FROM orders
WHERE amount IS NULL OR amount < 0;

-- 5) Referential integrity (orphan rows — anti-join)
SELECT o.id FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE c.id IS NULL;

-- 6) Source-to-target completeness (ETL): rows that didn't load
SELECT s.id FROM staging_orders s
LEFT JOIN dw_orders t ON t.order_id = s.id
WHERE t.order_id IS NULL;`,
      body: [
        "Every UI number a data QA validates ultimately becomes a SQL query. The essential toolkit:",
        "- **JOINs** — `INNER` (matches in both), `LEFT` (all left + matches), and the **anti-join** (`LEFT JOIN ... WHERE right.id IS NULL`) to find missing/orphan rows. The anti-join is the workhorse for completeness and referential-integrity checks.\n- **Aggregations** — `COUNT`, `SUM`, `AVG`, `MIN/MAX`, `COUNT(DISTINCT …)` with `GROUP BY`; remember `WHERE` filters rows *before* grouping and `HAVING` filters groups *after*.\n- **Set operations** — `EXCEPT`/`MINUS` to diff two result sets (e.g. source vs target rows that don't match).\n- **Window functions** — `ROW_NUMBER`/`RANK`/`DENSE_RANK` for de-duplication and 'Nth' checks.",
        "Reconciliation patterns you'll reuse daily: **count match** (source rows == target rows), **aggregate match** (sums/totals agree to the cent), **duplicate hunt** (`GROUP BY … HAVING COUNT(*) > 1`), **NULL/range validity**, and **orphan detection** via anti-join. When UI and SQL disagree, suspect *filter logic, joins causing fan-out/double counting, timezone boundaries, or rounding* first.",
        "**Beware join fan-out:** a one-to-many join can multiply rows and silently inflate a `SUM`. Validate aggregates at the right grain, and use `COUNT(DISTINCT …)` when joins can duplicate.",
      ],
      keyPoints: [
        "Anti-join (LEFT JOIN ... WHERE x IS NULL) finds missing/orphan rows — the key completeness & integrity check.",
        "Reconcile by count, by aggregate, by duplicates (GROUP BY ... HAVING), and by NULL/validity.",
        "Watch join fan-out inflating SUMs; WHERE filters rows pre-group, HAVING filters post-group.",
      ],
      quiz: [
        { q: "Which query pattern finds orders whose customer no longer exists (a referential-integrity break)?", o: ["INNER JOIN customers", "LEFT JOIN customers ... WHERE customers.id IS NULL", "GROUP BY customer_id", "SELECT DISTINCT customer_id"], c: 1, e: "The anti-join — LEFT JOIN then filter for NULL on the right — returns left rows with no match, i.e. orphan foreign keys." },
        { q: "A revenue SUM in your validation query is double the report's value after joining orders to order_items. The likely cause is:", o: ["The report is wrong", "Join fan-out — the one-to-many join multiplied order rows", "A NULL in the amount column", "The database timezone"], c: 1, e: "Joining to a child table repeats parent rows (fan-out), inflating SUM. Aggregate at the correct grain or use DISTINCT to avoid double counting." },
      ],
    },

    /* 14 ───────────────────────────────────────────── */
    {
      id: "etl",
      num: 14,
      icon: "🔀",
      title: "ETL & Data Pipeline Testing",
      lede: "Behind every dashboard is a pipeline moving data from sources to a warehouse. ETL testing proves that movement is complete and correct.",
      visual: `
        <div class="anim-flow">
          <span class="fl-token"></span>
          <div class="fl-node n-start">Extract<small>from source systems</small></div>
          <div class="fl-arrow">→</div>
          <div class="fl-node">Transform<small>cleanse · map · aggregate</small></div>
          <div class="fl-arrow">→</div>
          <div class="fl-node">Load<small>into warehouse / target</small></div>
          <div class="fl-arrow">→</div>
          <div class="fl-node n-end">BI &amp; Reports</div>
        </div>
        <div class="fl-alt">
          <span>✔ Completeness (counts match)</span>
          <span>✔ Transformation rules</span>
          <span>✔ No duplicates</span>
          <span>✔ Data quality</span>
        </div>`,
      body: [
        "**ETL** stands for **Extract → Transform → Load**: pull data from source systems, apply business/cleansing/aggregation rules, and load it into a target (data warehouse/lake) that BI reports read. **ETL testing** validates that this journey preserves and correctly transforms the data.",
        "The heart of it is the **source-to-target mapping (STM)** document — it specifies, per target column, where it comes from and what transformation applies. Your tests assert each mapping holds. Key check categories:",
        "- **Completeness** — every expected source row reaches the target (count reconciliation; anti-join for rows that didn't load); no truncation of values.\n- **Transformation correctness** — business rules applied right: type conversions, lookups, derived columns, aggregations, default values, code translations.\n- **Data quality** — no unexpected NULLs, duplicates, or out-of-range/malformed values after load.\n- **Integrity** — keys and relationships preserved; no orphans in the warehouse.\n- **Incremental loads / CDC** — only changed data loads correctly; updates and deletes are handled; no duplication on re-runs (idempotency).\n- **Reconciliation** — source totals == target totals (counts and sums).",
        "Watch for ETL-specific failures: **truncated fields** (target column too small), **silent type coercion**, **duplicate loads** on pipeline re-run, **late-arriving / out-of-order data**, **timezone/locale drift during transform**, and **SCD (Slowly Changing Dimension)** history handled incorrectly. The ultimate goal: the numbers a user sees in the dashboard trace cleanly back through Load → Transform → Extract to the original source — which is exactly why ETL testing and UI-to-DB verification are two ends of the same chain.",
      ],
      keyPoints: [
        "ETL = Extract → Transform → Load; test against the source-to-target mapping (STM).",
        "Validate completeness (counts), transformation rules, data quality, integrity, and incremental/CDC loads.",
        "Guard against truncation, duplicate re-runs, type coercion and timezone drift; reconcile source totals to target.",
      ],
      quiz: [
        { q: "Which document specifies, for each target column, its source and the transformation rule — the basis of ETL test cases?", o: ["Test Plan", "Source-to-Target Mapping (STM)", "Burndown chart", "RTM"], c: 1, e: "The STM (mapping) defines source → transformation → target per field; ETL tests assert each mapping is applied correctly." },
        { q: "After re-running a nightly ETL job, the warehouse shows each order twice. This is a failure of:", o: ["Transformation accuracy", "Idempotency / duplicate handling in the load", "Referential integrity", "Chart rendering"], c: 1, e: "A re-run should not duplicate data — the load must be idempotent (upsert/merge or de-dupe). Duplicate rows on re-run is a classic incremental-load defect." },
      ],
    },
  ];

  window.QA_DOCS = { chapters };
})();
