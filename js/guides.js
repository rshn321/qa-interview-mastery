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
    /* ═══════════════════ PLAYWRIGHT (FULL) ═══════════════════ */
    {
      id: "playwright",
      icon: "🎭",
      title: "Playwright — The Complete Guide",
      tagline: "Everything you need: architecture, locators, actions, auto-waiting, web-first assertions, the Page Object Model, fixtures, config, network mocking, API testing, debugging and CI.",
      sections: [
        { id: "why", h: "What is Playwright & why it wins", blocks: [
          { md: "**Playwright** (by Microsoft) is a modern end-to-end testing framework that automates **Chromium, Firefox and WebKit** with a single API. It supports **TypeScript/JavaScript, Python, Java and .NET**." },
          { md: "What sets it apart:\n- **Auto-waiting** — every action waits for the element to be *actionable* (visible, stable, enabled), which removes most flakiness.\n- **Web-first assertions** — `expect(locator)` auto-retries until the condition is met or it times out.\n- **Cross-browser incl. WebKit/Safari** with one API.\n- **Built-in** network interception, parallelism, tracing, video, screenshots and API testing.\n- **Best-in-class tooling** — codegen, Inspector, Trace Viewer, UI Mode." },
          { note: "Mental model: a Locator is a lazy, re-queried description of an element — it finds the element fresh on every action, which is why Playwright is resilient to re-renders.", t: "key" },
        ]},
        { id: "install", h: "Install & project structure", blocks: [
          { md: "Scaffold a project with the official initializer — it installs Playwright, browsers, a config, example tests and (optionally) a GitHub Actions workflow." },
          { code: "# Create a new project (TS/JS)\nnpm init playwright@latest\n\n# Run tests\nnpx playwright test                 # all tests, headless\nnpx playwright test --headed        # see the browser\nnpx playwright test login.spec.ts   # one file\nnpx playwright test -g \"checkout\"    # by title\nnpx playwright test --ui            # interactive UI mode\nnpx playwright show-report          # open HTML report" },
          { md: "Typical layout:" },
          { code: "project/\n├─ playwright.config.ts     # config: browsers, baseURL, reporters\n├─ tests/                   # *.spec.ts test files\n├─ pages/                   # Page Objects (POM)\n├─ fixtures/                # custom fixtures\n└─ playwright-report/       # HTML report output" },
        ]},
        { id: "architecture", h: "Architecture: Browser → Context → Page", blocks: [
          { md: "Three core objects, from heavy to light:\n- **Browser** — a launched browser process (Chromium/Firefox/WebKit). Expensive; shared.\n- **BrowserContext** — an *isolated* incognito-like session (own cookies, storage, cache). Cheap to create — each test gets a fresh one, giving **full isolation**.\n- **Page** — a single tab within a context, where you actually interact." },
          { code: "// Manual control (the test runner does this for you via fixtures)\nconst browser = await chromium.launch();\nconst context = await browser.newContext();   // isolated session\nconst page = await context.newPage();         // a tab\nawait page.goto('https://example.com');\nawait context.close();\nawait browser.close();" },
          { note: "Because each test gets its own BrowserContext, tests are isolated by default — no shared cookies/state. This is a major reliability win.", t: "tip" },
        ]},
        { id: "firsttest", h: "Anatomy of a test", blocks: [
          { md: "Tests import `test` and `expect` from `@playwright/test`. The `{ page }` argument is an injected **fixture** — a fresh page per test." },
          { code: "import { test, expect } from '@playwright/test';\n\ntest('user can log in', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByTestId('username').fill('alice');\n  await page.getByTestId('password').fill('secret');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page).toHaveURL(/dashboard/);\n  await expect(page.getByRole('heading')).toHaveText('Welcome, Alice');\n});" },
        ]},
        { id: "locators", h: "Locators — finding elements the right way", blocks: [
          { md: "A **Locator** describes how to find element(s); it's re-evaluated on each use. Prefer **user-facing, accessibility-first** locators over brittle CSS/XPath." },
          { md: "| Locator | Finds by |\n|---|---|\n| `getByRole('button', { name })` | ARIA role + accessible name **(recommended)** |\n| `getByText('Welcome')` | visible text |\n| `getByLabel('Password')` | associated `<label>` |\n| `getByPlaceholder('Search')` | placeholder |\n| `getByTestId('submit')` | `data-testid` attribute |\n| `getByAltText` / `getByTitle` | image alt / title |\n| `page.locator('css=...')` / `'xpath=...'` | raw CSS / XPath (last resort) |" },
          { md: "**Chaining & filtering** narrow a locator:" },
          { code: "// Filter, scope and index\npage.getByRole('listitem').filter({ hasText: 'Pro plan' });\npage.locator('.card').filter({ has: page.getByRole('button') });\npage.getByRole('row').nth(2);            // third row\npage.getByRole('button').first();        // first match\n// Scope inside a parent\nconst card = page.getByTestId('cart');\nawait card.getByRole('button', { name: 'Remove' }).click();\n// Logical combinators\npage.getByRole('button').and(page.getByTitle('Submit'));\npage.getByRole('button', { name: 'Yes' }).or(page.getByRole('button', { name: 'OK' }));" },
          { note: "Order of preference: getByRole / getByLabel / getByText → getByTestId → CSS → XPath. Avoid absolute XPath — it breaks on any layout change.", t: "key" },
        ]},
        { id: "actions", h: "Actions & methods (interacting)", blocks: [
          { md: "Action methods live on a Locator and **auto-wait** for actionability before running:" },
          { md: "| Method | Does |\n|---|---|\n| `.click()` / `.dblclick()` | click / double-click |\n| `.fill('text')` | clear + set an input value (fast) |\n| `.pressSequentially('txt')` | type char-by-char (real keystrokes) |\n| `.press('Enter')` | a key / shortcut (`Control+A`) |\n| `.check()` / `.uncheck()` / `.setChecked(b)` | checkbox / radio |\n| `.selectOption('US')` | `<select>` dropdown |\n| `.hover()` / `.focus()` / `.blur()` | pointer / focus |\n| `.setInputFiles('f.png')` | file upload |\n| `.dragTo(target)` | drag and drop |\n| `.scrollIntoViewIfNeeded()` | scroll to element |\n| `.tap()` | touch tap (mobile) |" },
          { code: "await page.getByLabel('Email').fill('a@b.com');\nawait page.getByLabel('Country').selectOption('NP');\nawait page.getByRole('checkbox', { name: 'Agree' }).check();\nawait page.getByText('Upload').setInputFiles('avatar.png');\nawait page.getByRole('slider').press('ArrowRight');\nawait page.keyboard.press('Control+S');   // global keyboard\nconst count = await page.getByRole('listitem').count();   // read state" },
          { note: "Prefer .fill() over typing for inputs — it's faster and less flaky. Use pressSequentially only when the app needs real per-key events (e.g. autocomplete).", t: "tip" },
        ]},
        { id: "autowait", h: "Auto-waiting & actionability", blocks: [
          { md: "Before most actions, Playwright **automatically waits** for the element to pass *actionability* checks — so you almost never write manual waits. For `click()` it waits until the element is:" },
          { md: "- **Attached** to the DOM\n- **Visible**\n- **Stable** (not animating)\n- **Enabled** (not disabled)\n- **Receives events** (not obscured by another element)" },
          { md: "If checks don't pass within the timeout, the action fails with a clear actionability error. This is the core reason Playwright tests are far less flaky than manual-wait frameworks." },
          { note: "Don't add sleeps to 'fix' timing — that's an anti-pattern. If something's flaky, assert on the right state with a web-first assertion instead.", t: "warn" },
        ]},
        { id: "assertions", h: "Web-first assertions (expect)", blocks: [
          { md: "`expect(locator)` assertions **auto-retry** until they pass or hit the timeout — no manual waiting needed. This is the single most important Playwright habit." },
          { md: "| Assertion | Passes when |\n|---|---|\n| `toBeVisible()` / `toBeHidden()` | element is shown / hidden |\n| `toBeEnabled()` / `toBeDisabled()` | enabled / disabled |\n| `toBeChecked()` | checkbox checked |\n| `toHaveText('x')` / `toContainText('x')` | exact / substring text |\n| `toHaveValue('x')` | input value |\n| `toHaveAttribute('href', '/x')` | attribute value |\n| `toHaveCount(3)` | N matching elements |\n| `toHaveClass(/active/)` | class present |\n| `toBeFocused()` / `toBeEditable()` | focus / editable |\n| `expect(page).toHaveURL(/x/)` / `toHaveTitle('x')` | page URL / title |\n| `expect(response).toBeOK()` | 2xx response |" },
          { code: "await expect(page.getByRole('alert')).toBeVisible();\nawait expect(page.getByTestId('total')).toHaveText('$84,300');\nawait expect(page.getByRole('listitem')).toHaveCount(5);\nawait expect(page).toHaveURL(/\\/dashboard/);\n// Custom timeout & soft assertions\nawait expect(locator).toBeVisible({ timeout: 10_000 });\nawait expect.soft(locator).toHaveText('x');   // continues on failure" },
          { note: "Use web-first expect() — NOT expect(await locator.textContent()) — so the assertion retries. Awaiting first captures a stale snapshot and reintroduces flakiness.", t: "key" },
        ]},
        { id: "waiting", h: "Explicit waiting & navigation", blocks: [
          { md: "Auto-waiting covers most cases; for navigation and network you occasionally wait explicitly:" },
          { code: "await page.waitForURL('**/dashboard');\nawait page.waitForLoadState('networkidle');\n// Wait for a specific API response\nconst resp = await page.waitForResponse(r =>\n  r.url().includes('/api/orders') && r.status() === 200);\n// Wait for an event / custom condition\nawait page.waitForEvent('download');\nawait page.waitForFunction(() => window.dataLoaded === true);\n// AVOID: fixed delays\nawait page.waitForTimeout(2000);   // last resort only" },
          { note: "waitForTimeout is a code smell — prefer waiting on a concrete signal (URL, response, assertion). Fixed sleeps are either too short (flaky) or too long (slow).", t: "warn" },
        ]},
        { id: "pom", h: "Page Object Model (full pattern)", blocks: [
          { md: "The **Page Object Model (POM)** encapsulates each page/component as a class that exposes **behaviours** (methods) and hides **locators**. Tests read like business intent; when the UI changes you fix one file, not every test." },
          { h: "1) The page object", blocks: [] },
          { code: "// pages/LoginPage.ts\nimport { Page, Locator, expect } from '@playwright/test';\n\nexport class LoginPage {\n  readonly page: Page;\n  readonly username: Locator;\n  readonly password: Locator;\n  readonly submit: Locator;\n  readonly error: Locator;\n\n  constructor(page: Page) {\n    this.page = page;\n    this.username = page.getByTestId('username');\n    this.password = page.getByTestId('password');\n    this.submit   = page.getByRole('button', { name: 'Sign in' });\n    this.error    = page.getByRole('alert');\n  }\n\n  async goto() { await this.page.goto('/login'); }\n\n  async login(user: string, pass: string) {\n    await this.username.fill(user);\n    await this.password.fill(pass);\n    await this.submit.click();\n  }\n\n  async expectError(msg: string) {\n    await expect(this.error).toHaveText(msg);\n  }\n}" },
          { h: "2) The test using it", blocks: [] },
          { code: "// tests/login.spec.ts\nimport { test } from '@playwright/test';\nimport { LoginPage } from '../pages/LoginPage';\n\ntest('invalid password shows an error', async ({ page }) => {\n  const login = new LoginPage(page);\n  await login.goto();\n  await login.login('alice', 'WRONG');\n  await login.expectError('Invalid email or password');\n});" },
          { note: "Keep locators inside the page object, keep assertions about that page's state in its methods, and keep tests free of raw selectors. That separation is what makes a suite maintainable.", t: "key" },
        ]},
        { id: "fixtures", h: "Fixtures (built-in & custom)", blocks: [
          { md: "**Fixtures** set up and tear down what a test needs, injected by name into the test function. Built-in fixtures include `page`, `context`, `browser`, `request` and `browserName`." },
          { md: "**Custom fixtures** are the idiomatic way to provide ready-to-use Page Objects or a logged-in page — cleaner than repeating setup in every test." },
          { code: "// fixtures/test.ts — extend the base test with POM fixtures\nimport { test as base } from '@playwright/test';\nimport { LoginPage } from '../pages/LoginPage';\nimport { DashboardPage } from '../pages/DashboardPage';\n\nexport const test = base.extend<{ loginPage: LoginPage; dashboard: DashboardPage }>({\n  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },\n  dashboard: async ({ page }, use) => { await use(new DashboardPage(page)); },\n});\nexport { expect } from '@playwright/test';\n\n// in a test:\n// test('...', async ({ loginPage, dashboard }) => { ... });" },
          { note: "Fixtures support scopes ('test' or 'worker') and automatic teardown via the code after use(). A 'worker'-scoped fixture runs once per worker — great for expensive shared setup.", t: "tip" },
        ]},
        { id: "hooks", h: "Test structure, hooks & grouping", blocks: [
          { md: "Group related tests with `test.describe`, share setup with hooks, and control execution with modifiers." },
          { code: "test.describe('Checkout', () => {\n  test.beforeEach(async ({ page }) => { await page.goto('/cart'); });\n  test.afterEach(async ({ page }) => { /* cleanup */ });\n\n  test('applies a coupon', async ({ page }) => { /* ... */ });\n  test.skip('legacy gift cards', async () => { /* skipped */ });\n  test.only('focus this one', async () => { /* runs alone */ });\n});\n\ntest('mobile only', async ({ page }) => {\n  test.skip(({ browserName }) => browserName === 'webkit', 'WebKit n/a');\n});\ntest('slow report', async () => { test.slow(); /* 3x timeout */ });" },
          { md: "Modifiers: `test.skip`, `test.only`, `test.fixme`, `test.fail` (expected to fail), `test.slow`, `test.step()` (group steps in the report), and `test.describe.configure({ mode: 'serial' | 'parallel' })`." },
        ]},
        { id: "config", h: "Configuration (playwright.config.ts)", blocks: [
          { md: "The config defines browsers (**projects**), base URL, timeouts, reporters, retries, parallelism and trace/screenshot policy." },
          { code: "import { defineConfig, devices } from '@playwright/test';\n\nexport default defineConfig({\n  testDir: './tests',\n  fullyParallel: true,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 4 : undefined,\n  reporter: [['html'], ['list']],\n  use: {\n    baseURL: 'https://app.example.com',\n    trace: 'on-first-retry',      // capture trace when a test retries\n    screenshot: 'only-on-failure',\n    video: 'retain-on-failure',\n  },\n  projects: [\n    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },\n    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },\n    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },\n    { name: 'mobile',   use: { ...devices['Pixel 7'] } },\n  ],\n});" },
          { note: "baseURL lets you use relative paths (page.goto('/login')). trace: 'on-first-retry' is the sweet spot — full debugging on failures with no overhead on passing runs.", t: "tip" },
        ]},
        { id: "network", h: "Network interception & mocking", blocks: [
          { md: "Intercept requests with `page.route()` to **mock** responses, **stub** third parties, simulate errors, or assert on traffic — without a real backend." },
          { code: "// Mock an API response\nawait page.route('**/api/orders', route => route.fulfill({\n  status: 200,\n  contentType: 'application/json',\n  body: JSON.stringify([{ id: 1, total: 42 }]),\n}));\n\n// Simulate a failure / abort a request (e.g. block analytics)\nawait page.route('**/api/pay', route => route.fulfill({ status: 500 }));\nawait page.route('**/*.{png,jpg}', route => route.abort());\n\n// Modify a real response\nawait page.route('**/api/config', async route => {\n  const res = await route.fetch();\n  const json = await res.json();\n  json.featureFlag = true;\n  await route.fulfill({ response: res, json });\n});" },
          { note: "Mocking makes tests fast and deterministic and lets you exercise error paths (500s, timeouts) you can't easily trigger against a real server.", t: "key" },
        ]},
        { id: "api", h: "API testing with the request fixture", blocks: [
          { md: "Playwright can test **REST APIs directly** via the `request` fixture (or `page.request`) — no UI needed. Great for setup/teardown and pure API suites, reusing the browser's auth context." },
          { code: "test('create order via API', async ({ request }) => {\n  const res = await request.post('/api/orders', {\n    headers: { Authorization: `Bearer ${token}` },\n    data: { item: 'SKU-1', qty: 2 },\n  });\n  expect(res.status()).toBe(201);\n  const body = await res.json();\n  expect(body).toMatchObject({ status: 'CREATED' });\n});" },
          { note: "Common pattern: seed data via request.post() in setup (fast), then verify it through the UI — combining API speed with E2E confidence.", t: "tip" },
        ]},
        { id: "auth", h: "Authentication & storageState", blocks: [
          { md: "Logging in through the UI in every test is slow. The idiomatic Playwright pattern: **log in once in a setup project, save the session to `storageState`, and reuse it** across all tests." },
          { code: "// auth.setup.ts — runs once, saves the signed-in state\nimport { test as setup } from '@playwright/test';\nsetup('authenticate', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByTestId('username').fill('alice');\n  await page.getByTestId('password').fill('secret');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await page.waitForURL('/dashboard');\n  await page.context().storageState({ path: '.auth/user.json' });\n});\n\n// playwright.config.ts — projects reuse the saved state\n// { name: 'setup', testMatch: /auth\\.setup\\.ts/ },\n// { name: 'chromium', dependencies: ['setup'],\n//   use: { storageState: '.auth/user.json' } }" },
          { note: "storageState persists cookies + localStorage. Reusing it means tests start already logged in — a big speed and stability win.", t: "key" },
        ]},
        { id: "advanced", h: "Frames, tabs, dialogs, downloads & uploads", blocks: [
          { code: "// iframes\nconst frame = page.frameLocator('#payment-iframe');\nawait frame.getByLabel('Card number').fill('4242 4242 4242 4242');\n\n// New tab / popup\nconst [popup] = await Promise.all([\n  page.waitForEvent('popup'),\n  page.getByText('Open report').click(),\n]);\nawait popup.waitForLoadState();\n\n// Dialogs (alert/confirm/prompt)\npage.on('dialog', d => d.accept());\n\n// Downloads\nconst [download] = await Promise.all([\n  page.waitForEvent('download'),\n  page.getByText('Export CSV').click(),\n]);\nawait download.saveAs('export.csv');\n\n// Uploads\nawait page.getByLabel('Avatar').setInputFiles('me.png');" },
          { note: "For iframes always use frameLocator — regular locators don't pierce frame boundaries.", t: "tip" },
        ]},
        { id: "debug", h: "Debugging & tooling", blocks: [
          { md: "Playwright's tooling is its superpower — learn these:" },
          { md: "- **Codegen** — record actions into test code: `npx playwright codegen example.com`.\n- **UI Mode** — watch, time-travel and re-run tests visually: `npx playwright test --ui`.\n- **Inspector / debug** — step through: `npx playwright test --debug` or `PWDEBUG=1`.\n- **Trace Viewer** — a full DOM snapshot + network + console timeline for each step: `npx playwright show-trace trace.zip`.\n- **`page.pause()`** — drop into the Inspector mid-test." },
          { note: "The Trace Viewer (enabled by trace: 'on-first-retry') is the fastest way to debug a CI failure — you get a frame-by-frame snapshot of exactly what the test saw.", t: "key" },
        ]},
        { id: "parallel", h: "Parallelism, retries & sharding", blocks: [
          { md: "Playwright runs tests **in parallel across worker processes** by default (files in parallel; `fullyParallel: true` parallelises within files too). Each worker is fully isolated." },
          { code: "# Control workers locally / in CI\nnpx playwright test --workers=4\n# Retry flaky tests (config: retries: 2)\n# Shard across CI machines\nnpx playwright test --shard=1/4   # machine 1 of 4" },
          { md: "Use `test.describe.configure({ mode: 'serial' })` only when tests genuinely must run in order (rare — prefer independent tests). Retries + trace-on-retry give resilience without hiding real flakiness." },
        ]},
        { id: "ci", h: "Running in CI", blocks: [
          { code: "# GitHub Actions — parallel sharded Playwright\njobs:\n  e2e:\n    runs-on: ubuntu-latest\n    strategy: { matrix: { shard: [1,2,3,4] } }\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npx playwright install --with-deps\n      - run: npx playwright test --shard=${{ matrix.shard }}/4\n      - uses: actions/upload-artifact@v4\n        if: ${{ !cancelled() }}\n        with: { name: report-${{ matrix.shard }}, path: playwright-report/ }" },
          { note: "Always run `npx playwright install --with-deps` in CI to get the browsers + OS dependencies. Upload the HTML report / traces as artifacts for debugging failures.", t: "tip" },
        ]},
        { id: "best", h: "Best practices", blocks: [
          { md: "- **Test user-visible behaviour**, not implementation — favour role/label/text locators.\n- **Use web-first assertions** (`expect(locator)`) — never `await` the value first.\n- **No manual sleeps** — rely on auto-waiting and assertion retries.\n- **Isolate tests** — each gets its own context; create its own data; no inter-test dependencies.\n- **Reuse auth** via storageState; seed data via the API.\n- **POM + custom fixtures** to keep tests clean.\n- **Add `data-testid`** for elements without a stable role/label.\n- **Enable trace on retry**; upload artifacts in CI.\n- **Keep the suite fast** — push checks to API/unit where possible; reserve E2E for critical journeys." },
        ]},
        { id: "cheatsheet", h: "Method cheatsheet", blocks: [
          { md: "**Navigation:** `page.goto(url)` · `goBack()` · `reload()` · `waitForURL()`\n**Find:** `getByRole/Text/Label/Placeholder/TestId` · `locator()` · `filter()` · `.first()/.nth()` · `frameLocator()`\n**Act:** `click` · `fill` · `pressSequentially` · `press` · `check/uncheck` · `selectOption` · `hover` · `setInputFiles` · `dragTo`\n**Read:** `textContent` · `inputValue` · `getAttribute` · `count` · `isVisible/isEnabled/isChecked`\n**Assert:** `expect(loc).toBeVisible/toHaveText/toHaveValue/toHaveCount/toHaveAttribute` · `expect(page).toHaveURL/toHaveTitle`\n**Wait:** `waitForResponse/Request` · `waitForLoadState` · `waitForEvent` · `waitForFunction`\n**Network:** `page.route()` → `route.fulfill/abort/fetch/continue`\n**API:** `request.get/post/put/delete()`\n**Debug:** `page.pause()` · `--ui` · `--debug` · `codegen` · `show-trace`" },
        ]},
        { id: "interview", h: "Interview Q&A", blocks: [
          { md: "- **Why is Playwright less flaky than Selenium?** Auto-waiting + actionability checks + web-first retrying assertions.\n- **Browser vs Context vs Page?** Process / isolated session / tab — each test gets its own context for isolation.\n- **What's a web-first assertion?** `expect(locator)` that auto-retries until it passes or times out.\n- **How do you avoid logging in every test?** Authenticate once in a setup project, save `storageState`, reuse it.\n- **How do you mock an API?** `page.route('**/api/**', route => route.fulfill({...}))`.\n- **How do you structure tests?** POM for locators/behaviour + custom fixtures to inject page objects.\n- **How do you debug a CI failure?** Trace Viewer (trace on retry) + uploaded report artifacts." },
        ]},
      ],
    },
  ];

  window.QA_GUIDES = { guides };
})();
