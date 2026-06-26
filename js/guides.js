/* ============================================================================
 * QA Interview Mastery — Deep-Dive Guides
 * Full-length, structured learning pages for the big topics.
 * window.QA_GUIDES.guides is consumed by app.js -> renderGuide().
 * Block types per section: { md } | { h } | { code } | { note, t:'tip|key|warn' }
 * ==========================================================================*/
(function () {
  "use strict";

  const guides = [
    /* ═══════════════════════ SQL FOR QA ═══════════════════════ */
    {
      id: "sql",
      icon: "🗄️",
      title: "SQL for QA Engineers",
      tagline: "From SELECT to source-to-target reconciliation — the data skills behind UI-to-DB verification, analytics validation and ETL testing.",
      sections: [
        { id: "why", h: "Why SQL is a QA superpower", blocks: [
          { md: "Almost every number a user sees on screen comes from a database. **SQL is how you prove the screen is telling the truth.** A QA who can write queries can validate data *independently* of the application — catching bugs the UI hides (caching, rounding, wrong filters) and reconciling reports against the source of truth." },
          { md: "You don't need to be a DBA. You need to **read and write SELECT queries confidently**, understand JOINs and aggregation, and know the handful of validation patterns below cold." },
          { note: "In data/analytics/BI QA roles, live SQL is almost always part of the interview. Practice writing queries by hand, not just reading them.", t: "key" },
        ]},
        { id: "anatomy", h: "Query anatomy & execution order", blocks: [
          { md: "A SELECT statement has a fixed clause order — but the database **executes them in a different order**, which explains why you can't use a column alias or aggregate in `WHERE`." },
          { code: "SELECT   region, SUM(amount) AS revenue   -- 5. pick & compute columns\nFROM     orders                          -- 1. choose source\nWHERE    order_date >= '2026-06-01'       -- 2. filter rows\nGROUP BY region                          -- 3. bucket rows\nHAVING   SUM(amount) > 1000               -- 4. filter groups\nORDER BY revenue DESC                     -- 6. sort\nLIMIT    10;                              -- 7. trim" },
          { md: "**Logical execution order:** `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`. Because `WHERE` runs *before* `GROUP BY` and `SELECT`, it can't see aggregates or aliases — that's what `HAVING` is for." },
          { note: "Interview gold: 'Why can't I use COUNT(*) in WHERE?' → because WHERE runs before grouping; aggregates exist only after GROUP BY, so they belong in HAVING.", t: "tip" },
        ]},
        { id: "where", h: "Filtering rows (WHERE)", blocks: [
          { md: "Operators you must know: `=`, `<>`/`!=`, `<`, `>`, `<=`, `>=`, `BETWEEN a AND b`, `IN (...)`, `LIKE` (wildcards `%` any, `_` one), `IS NULL` / `IS NOT NULL`, combined with `AND` / `OR` / `NOT`." },
          { code: "SELECT id, email, status, created_at\nFROM   customers\nWHERE  status = 'active'\n  AND  created_at >= '2026-06-01'\n  AND  email LIKE '%@gmail.com'\n  AND  country IN ('US','GB','NP')\n  AND  deleted_at IS NULL;" },
          { note: "When a UI count and your query disagree, the cause is almost always a WHERE-clause difference — replicate the UI's exact filter logic.", t: "warn" },
        ]},
        { id: "joins", h: "JOINs — combining tables", blocks: [
          { md: "JOINs stitch rows from multiple tables on a key. The four you must know:" },
          { md: "| Join | Returns |\n|---|---|\n| **INNER JOIN** | Only rows with a match in *both* tables |\n| **LEFT JOIN** | All left rows + matched right (NULLs where none) |\n| **RIGHT JOIN** | All right rows + matched left |\n| **FULL OUTER JOIN** | All rows from both, NULLs where no match |" },
          { md: "The single most useful pattern for QA is the **anti-join** — a LEFT JOIN filtered for NULL on the right side — which finds *missing* or *orphan* rows (completeness and referential-integrity checks)." },
          { code: "-- Users who never placed an order (anti-join)\nSELECT u.id, u.email\nFROM   users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE  o.id IS NULL;\n\n-- Orphan orders whose customer no longer exists (broken FK)\nSELECT o.id\nFROM   orders o\nLEFT JOIN customers c ON c.id = o.customer_id\nWHERE  c.id IS NULL;" },
          { note: "Beware JOIN fan-out: joining a parent to a one-to-many child repeats parent rows and silently inflates SUM/COUNT. Aggregate at the right grain or use COUNT(DISTINCT ...).", t: "warn" },
        ]},
        { id: "agg", h: "Aggregations & GROUP BY", blocks: [
          { md: "Aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) collapse rows into a summary; `GROUP BY` defines the buckets. This is how you reconcile dashboard tiles and charts." },
          { code: "SELECT region,\n       COUNT(*)                AS orders,\n       SUM(amount)             AS revenue,\n       AVG(amount)             AS avg_order,\n       COUNT(DISTINCT user_id) AS unique_buyers\nFROM   orders\nGROUP BY region\nORDER BY revenue DESC;" },
          { md: "- `COUNT(*)` counts all rows including NULLs.\n- `COUNT(col)` ignores NULLs in that column.\n- `COUNT(DISTINCT col)` de-duplicates — vital when joins cause fan-out.\n- `WHERE` filters rows *before* grouping; `HAVING` filters groups *after*." },
        ]},
        { id: "sub", h: "Subqueries & CTEs", blocks: [
          { md: "A **subquery** is a query nested in another (scalar, `IN`/`EXISTS`, correlated, or derived table). A **CTE** (`WITH`) is a named subquery that makes complex queries readable and reusable." },
          { code: "-- CTE: customers who spent above the overall average\nWITH spend AS (\n  SELECT customer_id, SUM(amount) AS total\n  FROM orders GROUP BY customer_id\n)\nSELECT customer_id, total\nFROM   spend\nWHERE  total > (SELECT AVG(total) FROM spend);" },
          { note: "EXISTS is often faster than IN for large correlated membership checks and handles NULLs more predictably.", t: "tip" },
        ]},
        { id: "window", h: "Window functions", blocks: [
          { md: "Window functions compute across a set of rows **without collapsing them** — perfect for ranking, de-duplication and running totals." },
          { code: "-- 2nd highest salary (ties-aware)\nSELECT DISTINCT salary FROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) t WHERE rnk = 2;\n\n-- Keep only the latest order per customer\nSELECT * FROM (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY customer_id ORDER BY created_at DESC) AS rn\n  FROM orders\n) t WHERE rn = 1;" },
          { note: "RANK leaves gaps after ties (1,1,3); DENSE_RANK doesn't (1,1,2); ROW_NUMBER is always unique. Pick based on how you want ties handled.", t: "key" },
        ]},
        { id: "toolkit", h: "The QA data-validation toolkit", blocks: [
          { md: "These reusable patterns prove UI/report data against the source — the heart of **UI-to-DB verification**, **analytics validation** and **ETL testing**:" },
          { md: "1. **Count reconciliation** — UI total vs `COUNT(*)` with the same filters.\n2. **Aggregate cross-check** — re-compute SUM/AVG/DISTINCT and compare.\n3. **Duplicate hunt** — `GROUP BY key HAVING COUNT(*) > 1`.\n4. **Completeness / validity** — unexpected NULLs or out-of-range values.\n5. **Referential integrity** — anti-join for orphans.\n6. **Source-to-target** — `EXCEPT` to find rows that didn't load." },
          { code: "-- Source rows that didn't reach the warehouse (ETL gap)\nSELECT id FROM staging_orders\nEXCEPT\nSELECT order_id FROM dw_orders;\n\n-- Duplicates (uniqueness)\nSELECT email, COUNT(*) FROM customers\nGROUP BY email HAVING COUNT(*) > 1;" },
          { note: "When UI and SQL disagree, suspect filter logic, join fan-out, timezone boundaries, then rounding — in that order.", t: "tip" },
        ]},
        { id: "advanced", h: "NULLs, transactions & performance", blocks: [
          { h: "NULL handling", blocks: [] },
          { md: "`NULL` means *unknown* and is not equal to anything (even another NULL) — always use `IS NULL`/`IS NOT NULL`, and `COALESCE(col, default)` to substitute. A `LEFT JOIN ... WHERE col = x` silently drops NULL rows; move the predicate into the JOIN or test `IS NULL` explicitly." },
          { h: "ACID & transactions", blocks: [] },
          { md: "A transaction is all-or-nothing. **A**tomicity (rolls back on failure), **C**onsistency (constraints hold), **I**solation (concurrent txns don't corrupt each other), **D**urability (survives crashes). Test atomicity by killing a multi-step transaction mid-way and asserting no partial writes; test isolation with concurrent updates to one row." },
          { h: "Performance awareness", blocks: [] },
          { md: "Indexes speed reads but slow writes; a missing index causes full table scans. Use `EXPLAIN ANALYZE` to read the query plan and spot `Seq Scan` on large tables — the usual cause of slow reports." },
        ]},
        { id: "interview", h: "Common SQL interview questions", blocks: [
          { md: "- **Find the 2nd/Nth highest value** → subquery with `MAX(... < MAX)` or `DENSE_RANK`.\n- **Find duplicates** → `GROUP BY key HAVING COUNT(*) > 1`.\n- **Users with no orders** → LEFT JOIN + `WHERE orders.id IS NULL` (anti-join).\n- **WHERE vs HAVING** → row filter before grouping vs group filter after.\n- **INNER vs LEFT JOIN** → matches-in-both vs all-left-plus-matches.\n- **Remove duplicates keeping one** → `ROW_NUMBER() PARTITION BY key`, delete `rn > 1`.\n- **What is ACID** → atomicity, consistency, isolation, durability." },
          { note: "Always state your assumptions out loud (tie handling, NULLs, duplicates) before writing — interviewers score reasoning, not just the final query.", t: "tip" },
        ]},
      ],
    },

    /* ═══════════════════ AUTOMATION FRAMEWORKS ═══════════════════ */
    {
      id: "automation",
      icon: "🤖",
      title: "Test Automation Frameworks",
      tagline: "Architecture, flakiness, CI — and a deep, practical comparison of Selenium, Playwright and Cypress.",
      sections: [
        { id: "what", h: "What & when to automate", blocks: [
          { md: "Automation codifies repetitive checks so a machine runs them on every change. It's a **regression-protection investment**, not a goal in itself — it pays off over many runs of *stable* tests." },
          { md: "**Automate:** stable, repetitive, high-risk regression; data-driven checks; anything run on every build.\n\n**Don't automate:** throwaway one-offs; highly volatile UIs still changing every sprint; tests needing human judgement (aesthetics, UX, exploration)." },
          { note: "Senior framing: 'I automate the stable, high-risk regression core and keep humans on exploratory + UX. Automating a moving target has negative ROI.'", t: "key" },
        ]},
        { id: "pyramid", h: "The test automation pyramid", blocks: [
          { md: "The pyramid prescribes the *ratio* of tests by level:" },
          { md: "- **Unit (wide base):** fast, isolated, cheap — run in ms.\n- **Integration / API (middle):** verify component & service contracts.\n- **UI / E2E (thin tip):** slow, brittle, expensive — only critical journeys." },
          { md: "Push every check to the **lowest level that can catch the bug**. The anti-pattern is the **ice-cream cone** — mostly slow UI tests — which produces hours-long, flaky pipelines the team stops trusting." },
        ]},
        { id: "arch", h: "Framework architecture (Page Object Model)", blocks: [
          { md: "A maintainable framework is **layered**: tests express business intent, page objects hide locators, and a core layer holds driver setup, waits, config and data builders." },
          { md: "The **Page Object Model (POM)** encapsulates each page/component as a class exposing *behaviours* (methods), hiding locators. When the UI changes you fix one object, not 50 tests." },
          { code: "// Playwright Page Object (TypeScript)\nexport class LoginPage {\n  constructor(private page: Page) {}\n  private user = () => this.page.getByTestId('username');\n  private pass = () => this.page.getByTestId('password');\n  private submit = () => this.page.getByRole('button', { name: 'Sign in' });\n\n  async login(u: string, p: string) {\n    await this.user().fill(u);\n    await this.pass().fill(p);\n    await this.submit().click();\n    await this.page.waitForURL('**/dashboard');\n  }\n}" },
          { md: "Principles: stable locators (`data-testid` over brittle XPath), explicit waits (never `sleep`), atomic & independent tests, externalised config/data, and parallel-safe execution." },
        ]},
        { id: "selenium", h: "Selenium WebDriver — deep dive", blocks: [
          { md: "Selenium drives real browsers via the **W3C WebDriver** protocol. It's the long-standing industry standard: **language-agnostic** (Java, Python, C#, JS, Ruby) and **browser-agnostic** (Chrome, Firefox, Edge, Safari). **Selenium Grid** runs tests in parallel across machines and browsers." },
          { code: "// Java + explicit wait + Page Object style\nWebDriver driver = new ChromeDriver();\ndriver.get(\"https://example.com/login\");\nnew WebDriverWait(driver, Duration.ofSeconds(10))\n   .until(ExpectedConditions.elementToBeClickable(By.id(\"user\")))\n   .sendKeys(\"alice\");\ndriver.findElement(By.id(\"pass\")).sendKeys(\"secret\");\ndriver.findElement(By.cssSelector(\"button[type=submit]\")).click();" },
          { md: "**Strengths:** maximum maturity, ecosystem and language/browser flexibility; the most common skill on job descriptions.\n**Trade-offs:** no built-in waits (you manage explicit waits — a flakiness risk), no built-in test runner or reporting, more boilerplate, harder native network mocking." },
          { note: "Never use Thread.sleep. Use WebDriverWait + ExpectedConditions. Mixing implicit and explicit waits causes unpredictable, additive timing.", t: "warn" },
        ]},
        { id: "playwright", h: "Playwright — deep dive", blocks: [
          { md: "Playwright (by Microsoft) automates **Chromium, Firefox and WebKit** with one API. Its standout features: **auto-waiting** (drastically less flaky), built-in **network interception/mocking**, parallelism/sharding, and superb debugging (**trace viewer, codegen, video**). Supports TS/JS, Python, Java, .NET, plus API testing." },
          { code: "// TypeScript — auto-waiting + web-first assertions\nimport { test, expect } from '@playwright/test';\ntest('login', async ({ page }) => {\n  await page.goto('https://example.com/login');\n  await page.getByTestId('username').fill('alice');\n  await page.getByTestId('password').fill('secret');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page).toHaveURL(/dashboard/);   // auto-retries\n});" },
          { md: "**Strengths:** fast and reliable (auto-wait + web-first assertions remove most explicit waits), true cross-browser including WebKit/Safari, built-in mocking and API testing, excellent tooling.\n**Trade-offs:** newer (smaller though fast-growing community than Selenium); team must learn its conventions." },
          { note: "Increasingly the default for greenfield web automation — its auto-waiting is the single biggest flakiness reducer vs Selenium.", t: "key" },
        ]},
        { id: "cypress", h: "Cypress — deep dive", blocks: [
          { md: "Cypress runs **inside the browser**, in the same run-loop as your app — giving fast feedback, automatic waiting, **time-travel debugging**, and a great developer experience. JS/TS only; historically Chromium-focused (now broader)." },
          { code: "// JavaScript — Cypress auto-retries assertions\ndescribe('login', () => {\n  it('signs in', () => {\n    cy.visit('/login');\n    cy.get('[data-testid=username]').type('alice');\n    cy.get('[data-testid=password]').type('secret');\n    cy.contains('button', 'Sign in').click();\n    cy.url().should('include', '/dashboard');   // retried\n  });\n});" },
          { md: "**Strengths:** best-in-class DX and debugging, automatic waiting/retries, easy setup for front-end teams, strong for component + E2E testing.\n**Trade-offs:** JavaScript/TypeScript only, weaker multi-tab/multi-origin handling (improving), in-browser architecture imposes some limits, not suited to mobile/native." },
        ]},
        { id: "compare", h: "Selenium vs Playwright vs Cypress", blocks: [
          { md: "| | **Selenium** | **Playwright** | **Cypress** |\n|---|---|---|---|\n| **Languages** | Java, Py, C#, JS, Ruby | TS/JS, Py, Java, .NET | JS / TS only |\n| **Browsers** | All incl. Safari | All incl. WebKit/Safari | Mostly Chromium+ |\n| **Waiting** | Manual (explicit) | Auto | Auto |\n| **Architecture** | Out-of-process | Out-of-process | In-browser |\n| **Mocking** | External | Built-in | Built-in (cy.intercept) |\n| **Speed / flakiness** | Slower, more flaky | Fast, low flake | Fast, low flake |\n| **Best for** | Multi-language / max reach | Modern greenfield | JS front-end DX |" },
          { note: "There's no single 'best' — answer with trade-offs tied to the team's stack, browser needs and flakiness tolerance. That nuance is the senior signal.", t: "tip" },
        ]},
        { id: "flaky", h: "Waits & flakiness", blocks: [
          { md: "A **flaky test** passes and fails on the same code — the #1 destroyer of suite trust. Treat it as a defect class." },
          { md: "**Root causes & fixes:** bad waits → explicit condition-based waits (never `sleep`); shared state / test interdependence → atomic tests with isolated data; parallel races → unique data per test; animations/dynamic content → wait on stable signals; third parties → mock them." },
          { note: "Quarantine flaky tests immediately so they don't block the pipeline, track a flaky-rate metric, then fix or delete. Retries hide flakiness — use them only as a temporary safety net.", t: "warn" },
        ]},
        { id: "locators", h: "Locator strategy", blocks: [
          { md: "Locators decide how robust your tests are. Preference order: **`data-testid`** (stable, test-dedicated) → role/accessible name → stable IDs → short CSS → **avoid** brittle absolute XPath that breaks on any layout change." },
          { note: "Adding data-testid attributes is the highest-leverage thing a team can do to cut UI-test flakiness.", t: "tip" },
        ]},
        { id: "ci", h: "Running automation in CI", blocks: [
          { md: "Automation only pays off when it runs on every change. Run headless, **shard/parallelise** for speed, capture artifacts (screenshots, video, traces) on failure, and stage fast-to-slow so failures surface early. Keep the PR gate under ~10 minutes; run heavy full-regression nightly." },
          { code: "# GitHub Actions — parallel Playwright shards\njobs:\n  e2e:\n    runs-on: ubuntu-latest\n    strategy: { matrix: { shard: [1,2,3,4] } }\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npx playwright test --shard=${{ matrix.shard }}/4" },
        ]},
        { id: "interview", h: "Interview Q&A", blocks: [
          { md: "- **Why is the POM useful?** Encapsulates locators behind behaviours → UI changes touch one place.\n- **Implicit vs explicit waits?** Global polling vs waiting on a specific condition; prefer explicit, never mix them.\n- **How do you handle flaky tests?** Find root cause (usually waits/state), quarantine, fix or delete, track flaky rate.\n- **When NOT to automate?** Throwaway, volatile UI, human-judgement tests.\n- **Selenium vs Playwright vs Cypress?** Answer with trade-offs, not a winner." },
        ]},
      ],
    },

    /* ═══════════════════ PERFORMANCE TESTING ═══════════════════ */
    {
      id: "performance",
      icon: "⚡",
      title: "Performance & Load Testing",
      tagline: "The types, the metrics that matter, and deep dives into JMeter and LoadRunner.",
      sections: [
        { id: "fundamentals", h: "Performance testing fundamentals", blocks: [
          { md: "Performance testing evaluates **speed, responsiveness and stability under load** — not whether a feature works, but whether it works *well enough* for the expected (and unexpected) demand, measured against SLAs." },
          { note: "Always define a baseline and SLA first, so 'slow' is measurable. Test in a production-like environment with production-shaped data.", t: "key" },
        ]},
        { id: "types", h: "The types of performance testing", blocks: [
          { md: "| Type | What it does | Defect class it finds |\n|---|---|---|\n| **Load** | Expected concurrent load | SLA breaches under normal peak |\n| **Stress** | Beyond capacity to breaking point | Failure mode (crash vs graceful) |\n| **Spike** | Sudden sharp surge | Autoscaling lag, recovery |\n| **Soak / Endurance** | Sustained load for hours/days | Memory leaks, resource exhaustion |\n| **Volume** | Large *data* volumes | DB / query degradation |\n| **Scalability** | Capacity as resources are added | Architectural bottlenecks |" },
          { note: "Name the defect class each type finds — soak finds leaks, stress finds the failure mode, spike finds autoscaling lag. That precision impresses interviewers.", t: "tip" },
        ]},
        { id: "metrics", h: "Metrics that matter (percentiles)", blocks: [
          { md: "Report **percentiles, not averages** — averages hide the painful tail." },
          { md: "- **Latency:** p50, p90, **p95, p99** response times. p99 = the experience of your slowest 1%.\n- **Throughput:** requests/transactions per second.\n- **Error rate** under load.\n- **Concurrency:** active users / connections.\n- **Resource saturation:** CPU, memory, GC pauses, DB connections, I/O." },
          { note: "A 200ms average can hide a 4s p99 affecting thousands of users. 'I care about the tail — p95/p99 is where SLA breaches live.'", t: "key" },
        ]},
        { id: "jmeter", h: "Apache JMeter — deep dive", blocks: [
          { md: "JMeter is the **open-source standard**: a free, Java-based tool with a GUI to build test plans and a non-GUI/CLI mode for real load. It supports HTTP, REST, SOAP, **JDBC**, JMS, FTP and more." },
          { md: "**Core building blocks of a test plan:**\n- **Thread Group** — virtual users, ramp-up and loops.\n- **Samplers** — the requests (HTTP Request, JDBC Request…).\n- **Listeners** — collect/visualise results.\n- **Timers** — pacing/think-time.\n- **Assertions** — pass/fail validation.\n- **Config elements & CSV Data Set** — variables and data-driven inputs.\n- **Pre/Post-processors** — correlation (extract tokens) and parameterization." },
          { code: "# Run a plan headless and produce an HTML dashboard\njmeter -n -t loadtest.jmx \\\n  -Jthreads=200 -Jrampup=60 -Jduration=600 \\\n  -l results.jtl -e -o ./html-report" },
          { md: "**Strengths:** free, mature, huge community, protocol breadth, distributed load via multiple slave nodes, CI integration (Taurus/BlazeMeter).\n**Trade-offs:** heavy GUI; higher resource use per thread than code tools (k6/Gatling); complex correlation is fiddly." },
          { note: "Always run real load in non-GUI mode (-n). The GUI is for building/debugging only — it can't drive high load reliably.", t: "warn" },
        ]},
        { id: "loadrunner", h: "LoadRunner — deep dive", blocks: [
          { md: "LoadRunner (OpenText / Micro Focus) is the **enterprise-grade** performance suite, known for exceptionally broad protocol support (web, **SAP, Citrix, Oracle, mainframe**) and deep analysis." },
          { md: "**The three components to know cold:**\n- **VuGen (Virtual User Generator)** — record and script virtual users (C-like scripting) with correlation and parameterization.\n- **Controller** — design and orchestrate the load scenario (number of Vusers, schedules, ramp).\n- **Analysis** — generate detailed reports and correlate with monitors/APM for diagnostics." },
          { code: "// VuGen (C-like) — a transaction with correlation\nweb_url(\"login\",\n  \"URL=https://app.example.com/login\", \"Method=GET\", LAST);\nlr_start_transaction(\"submit_login\");\nweb_submit_data(\"login\", \"Action=...\", ITEMDATA,\n  \"Name=user\",  \"Value=alice\", ENDITEM,\n  \"Name=token\", \"Value={correlated_token}\", ENDITEM, LAST);\nlr_end_transaction(\"submit_login\", LR_AUTO);" },
          { md: "**Strengths:** powerful for complex/legacy enterprise protocols, mature analysis & diagnostics, strong vendor support, handles very large scenarios.\n**Trade-offs:** commercial and expensive (licensed by virtual users), steeper learning curve, less CI/developer-centric than k6 or JMeter." },
        ]},
        { id: "compare", h: "JMeter vs LoadRunner vs k6 / Gatling", blocks: [
          { md: "| | **JMeter** | **LoadRunner** | **k6 / Gatling** |\n|---|---|---|---|\n| **Cost** | Free / open-source | Commercial (pricey) | Free / open-source |\n| **Scripting** | GUI + XML plan | VuGen (C-like) | Code (JS / Scala) |\n| **Protocols** | Broad | Very broad (enterprise) | Mostly HTTP/web |\n| **Resource use** | Higher per thread | Heavy tooling | Very efficient |\n| **CI / as-code** | Good (Taurus) | Weaker | Excellent |\n| **Best for** | Open-source, multi-protocol | Enterprise/legacy protocols | Dev/DevOps 'perf as code' |" },
          { note: "Classic answer: 'JMeter is free, open-source and protocol-flexible; LoadRunner is licensed but stronger on enterprise protocols and analysis; k6/Gatling bring performance-as-code for CI.'", t: "tip" },
        ]},
        { id: "process", h: "The performance testing process", blocks: [
          { md: "1. **Identify the test environment & tools** (production-like).\n2. **Define performance acceptance criteria** (SLAs: p95/p99, throughput, error rate).\n3. **Plan & design tests** — realistic workload models and scenarios.\n4. **Configure the environment & data.**\n5. **Implement the test** (scripts, correlation, parameterization).\n6. **Execute** — baseline, then load/stress/spike/soak.\n7. **Analyse, tune, retest** — change one variable at a time.\n8. **Report** with percentiles and a clear risk picture." },
        ]},
        { id: "bottleneck", h: "Finding bottlenecks", blocks: [
          { md: "Work methodically, layer by layer — don't guess. Reproduce under controlled load, observe the whole stack with **APM + distributed tracing**, then isolate: client → CDN → load balancer → app → DB → external deps." },
          { md: "Usual culprits: **N+1 queries, missing indexes, lock contention, connection-pool exhaustion, chatty service calls, GC pauses.** The DB is the most common suspect — check slow-query logs and indexes first, but **prove it with tracing** rather than assuming." },
        ]},
        { id: "interview", h: "Interview Q&A", blocks: [
          { md: "- **Load vs stress vs spike vs soak?** Expected load / beyond capacity / sudden surge / sustained duration.\n- **Why percentiles over averages?** Averages hide the tail; p99 is real user pain.\n- **JMeter vs LoadRunner?** Free/open vs enterprise/licensed; protocol and analysis differences.\n- **What does VuGen do?** Records and scripts virtual users in LoadRunner.\n- **How do you find a bottleneck?** Baseline, reproduce under load, trace the stack, isolate the layer, fix one thing, re-measure." },
        ]},
      ],
    },

    /* ═══════════════════ CI/CD & DEVOPS ═══════════════════ */
    {
      id: "cicd",
      icon: "🚦",
      title: "CI/CD & DevOps for QA",
      tagline: "Pipelines, quality gates, and deep dives into Jenkins, Docker and Kubernetes.",
      sections: [
        { id: "fundamentals", h: "CI vs CD vs CD", blocks: [
          { md: "- **Continuous Integration (CI):** frequently merge code into a shared branch, with automated build + tests on every change.\n- **Continuous Delivery (CD):** keep software always in a releasable state via automated pipelines; the release itself is a *manual decision*.\n- **Continuous Deployment:** automatically deploy every change that passes the pipeline to production — no manual gate." },
          { note: "The difference between the two CDs is the final gate: Delivery = ready to release on a button; Deployment = released automatically.", t: "key" },
        ]},
        { id: "pipeline", h: "The pipeline & quality gates", blocks: [
          { md: "Tests run as **staged gates, fast-to-slow, failing fast**:" },
          { md: "1. **Commit / PR:** lint + static analysis + unit (seconds) — blocks merge.\n2. **Build:** integration + API + contract tests (minutes).\n3. **Post-deploy to staging:** smoke + critical E2E + security scan.\n4. **Pre-prod / prod:** canary + synthetic monitoring + performance baseline." },
          { md: "A **quality gate** is an automated pass/fail checkpoint — e.g. *'coverage ≥ 80%, zero new critical issues, all P1 tests green'* — that **blocks promotion** if unmet." },
          { code: "// Jenkinsfile — staged quality gates\npipeline {\n  agent any\n  stages {\n    stage('Build') { steps { sh 'npm ci' } }\n    stage('Unit')  { steps { sh 'npm run test:unit' } }\n    stage('E2E')   { steps { sh 'npx playwright test' } }\n    stage('Deploy'){ when { branch 'main' }\n                     steps { sh './deploy.sh' } }\n  }\n  post { always { junit 'reports/*.xml' } }\n}" },
          { note: "Keep the PR gate under ~10 minutes so developers stay in flow; run heavy full-regression nightly.", t: "tip" },
        ]},
        { id: "shiftleft", h: "Where QA fits (shift-left & shift-right)", blocks: [
          { md: "**Shift-left:** move testing earlier — review requirements for testability, write tests alongside code, gate every PR. Defects are exponentially cheaper the earlier they're caught.\n\n**Shift-right:** test safely *in* production — feature flags, canary releases, observability, synthetic monitoring, chaos engineering. Seniors do both: catch early *and* learn from prod." },
        ]},
        { id: "jenkins", h: "Jenkins — deep dive", blocks: [
          { md: "Jenkins is the widely-used, **self-hosted** automation server that popularised mainstream CI/CD. Pipelines are **code** in a `Jenkinsfile` (declarative or scripted Groovy); a vast **plugin ecosystem** (1800+) integrates virtually any tool; **agents/nodes** distribute builds." },
          { md: "**Key concepts:** Pipeline → Stages → Steps; agents (where work runs); plugins (Git, Docker, K8s, JUnit reporters); credentials store; `post` blocks for always/success/failure actions; parallel stages for speed." },
          { md: "**Strengths:** free, flexible, huge plugin ecosystem, full control (self-hosted), ubiquitous skill.\n**Trade-offs:** you maintain and secure the server and plugins; plugin sprawl; dated UI vs modern SaaS CI." },
          { note: "Where QA fits: tests run as staged gates that block promotion. Publish test reports (junit) and artifacts (screenshots/traces) from the pipeline.", t: "tip" },
        ]},
        { id: "docker", h: "Docker — deep dive", blocks: [
          { md: "Docker packages an app with all its dependencies into a **container image** that runs identically anywhere — killing 'works on my machine'. Containers are lightweight, fast to start, and the building block under Kubernetes." },
          { code: "# docker-compose: app + real DB for integration tests\nservices:\n  app:\n    build: .\n    ports: [\"8080:8080\"]\n  db:\n    image: postgres:16\n    environment: { POSTGRES_PASSWORD: test }" },
          { md: "**QA value:** spin up the app + a real database + mocked third parties for **deterministic integration tests**, then tear it all down. Consistent, disposable environments eliminate drift." },
        ]},
        { id: "k8s", h: "Kubernetes — deep dive", blocks: [
          { md: "Kubernetes (**K8s**) automates deployment, scaling and management of containers across a cluster. **Core objects:** Pods (containers), Deployments (desired state & rolling updates), Services (stable networking/load balancing), Namespaces (isolation). It **self-heals** (restarts failed pods) and scales horizontally." },
          { code: "# Deployment: 3 replicas, rolling updates, health probe\napiVersion: apps/v1\nkind: Deployment\nmetadata: { name: web }\nspec:\n  replicas: 3\n  selector: { matchLabels: { app: web } }\n  template:\n    metadata: { labels: { app: web } }\n    spec:\n      containers:\n        - name: web\n          image: myapp:1.4.2\n          readinessProbe:\n            httpGet: { path: /health, port: 8080 }" },
          { h: "Why QA cares about Kubernetes", blocks: [] },
          { md: "- **Ephemeral environments:** a fresh, isolated environment per pull request — no more 'someone broke staging'.\n- **Resilience testing:** kill a pod and verify self-healing / failover (chaos engineering).\n- **Scalable perf environments:** scale replicas to mirror production for load tests.\n- **Readiness/liveness probes** are themselves testable resilience features." },
          { note: "Strong senior answer: 'K8s lets me give every PR its own isolated environment and chaos-test self-healing — quality benefits, not just ops.'", t: "key" },
        ]},
        { id: "otherci", h: "Other CI platforms", blocks: [
          { md: "- **GitHub Actions** — YAML workflows triggered on repo events; hosted runners; matrix builds; huge marketplace. (This very app deploys to GitHub Pages via push.)\n- **GitLab CI/CD** — `.gitlab-ci.yml`; built-in registry; **review apps** spin up a live per-MR environment — great for QA.\n- **Azure DevOps** — end-to-end suite with Boards, Repos, Pipelines and **Test Plans** for manual/exploratory test management." },
        ]},
        { id: "envdata", h: "Test environments & data in the pipeline", blocks: [
          { md: "Two of the hardest real-world problems:" },
          { md: "**Test data:** generate via API/factory builders so each test owns isolated, deterministic data and cleans up; mask/anonymise PII for prod-like data; avoid shared mutable fixtures (they cause flaky, order-dependent tests).\n\n**Environments:** ephemeral per-PR environments (containers/K8s) for isolation; service virtualisation/mocks for unavailable third parties; config as code; parity with production to avoid 'works in staging'." },
        ]},
        { id: "interview", h: "Interview Q&A", blocks: [
          { md: "- **CI vs CD vs Continuous Deployment?** Integrate+test on merge / always releasable (manual gate) / auto-release every passing change.\n- **What's a quality gate?** An automated pass/fail checkpoint that blocks promotion.\n- **Where do tests run in a pipeline?** Staged fast-to-slow: lint/unit → integration/API → E2E → deploy.\n- **What is a Jenkinsfile?** Pipeline-as-code defining stages/steps.\n- **Why does QA care about Docker/K8s?** Consistent, disposable, isolated environments + resilience testing.\n- **How do you manage test data/environments?** Generate isolated data, mask PII, ephemeral per-PR envs, virtualise third parties." },
        ]},
      ],
    },
  ];

  window.QA_GUIDES = { guides };
})();
