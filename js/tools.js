/* ============================================================================
 * QA Interview Mastery — Tools & Tech reference
 * SQL · Automation frameworks · Performance/Load tools · CI/CD & DevOps tools
 * window.QA_TOOLS is consumed by app.js -> tools() view.
 * Each: { t, cat, d, what, features?[], pros?[], cons?[], when?, code?, tip?, related?[] }
 * ==========================================================================*/
(function () {
  "use strict";

  const categories = [
    { id: "sql", name: "SQL for QA", icon: "🗄️" },
    { id: "automation", name: "Automation Frameworks", icon: "🤖" },
    { id: "perf", name: "Performance / Load Tools", icon: "⚡" },
    { id: "cicd", name: "CI/CD & DevOps Tools", icon: "🚦" },
  ];

  const tools = [
    /* ════════════════ SQL FOR QA ════════════════ */
    { t: "SELECT & Filtering (WHERE)", cat: "sql", d: "The foundation: retrieve specific columns and filter rows with WHERE.",
      what: "Every data-validation query starts with SELECT to choose columns and WHERE to filter rows. Operators you must know: =, <>, <, >, BETWEEN, IN, LIKE, IS NULL, AND/OR/NOT.",
      when: "Cross-checking any UI value, isolating records, or pulling a filtered set to compare against the app.",
      code: `-- Active customers created this month
SELECT id, email, status, created_at
FROM customers
WHERE status = 'active'
  AND created_at >= '2026-06-01'
  AND email LIKE '%@gmail.com'
ORDER BY created_at DESC;`,
      tip: "Match the UI's exact filter logic — a UI/DB count mismatch is usually a WHERE-clause difference.",
      related: ["JOINs (INNER / LEFT / RIGHT / FULL)", "Aggregations & GROUP BY", "NULL Handling & COALESCE"] },

    { t: "JOINs (INNER / LEFT / RIGHT / FULL)", cat: "sql", d: "Combine rows across tables — and the anti-join is the QA workhorse.",
      what: "INNER returns matches in both tables; LEFT returns all left rows + matches (NULLs where none); RIGHT is the mirror; FULL returns all from both. The anti-join (LEFT JOIN ... WHERE right.id IS NULL) finds missing/orphan rows.",
      when: "Reconciling related tables, finding records with no related row, checking referential integrity.",
      code: `-- Users who never placed an order (anti-join)
SELECT u.id, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- Orphan orders (broken FK)
SELECT o.id FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE c.id IS NULL;`,
      tip: "Beware join fan-out: a one-to-many join multiplies rows and silently inflates SUM/COUNT — use COUNT(DISTINCT ...).",
      related: ["SELECT & Filtering (WHERE)", "Aggregations & GROUP BY", "Data Validation & Reconciliation"] },

    { t: "Aggregations & GROUP BY", cat: "sql", d: "COUNT, SUM, AVG, MIN, MAX over groups of rows.",
      what: "Aggregate functions collapse many rows into a summary. GROUP BY defines the buckets. Essential for reconciling totals shown on dashboards.",
      when: "Verifying report tiles (totals, counts per category), checking distributions, cross-checking charts.",
      code: `-- Revenue & order count per region (matches the dashboard?)
SELECT region,
       COUNT(*)            AS orders,
       SUM(amount)         AS revenue,
       AVG(amount)         AS avg_order,
       COUNT(DISTINCT user_id) AS unique_buyers
FROM orders
GROUP BY region
ORDER BY revenue DESC;`,
      tip: "COUNT(*) counts rows incl. NULLs; COUNT(col) ignores NULLs; COUNT(DISTINCT col) de-duplicates. Know the difference.",
      related: ["WHERE vs HAVING", "JOINs (INNER / LEFT / RIGHT / FULL)", "Window Functions"] },

    { t: "WHERE vs HAVING", cat: "sql", d: "WHERE filters rows before grouping; HAVING filters groups after aggregation.",
      what: "You cannot use an aggregate (COUNT, SUM) in WHERE — that's what HAVING is for. WHERE runs first on raw rows; HAVING runs on the grouped result.",
      when: "Finding groups that meet an aggregate condition — e.g. duplicates, or categories above a threshold.",
      code: `-- Emails used by more than one account (duplicates)
SELECT email, COUNT(*) AS cnt
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;`,
      tip: "Classic interview question — 'aggregate in WHERE' is illegal; move it to HAVING.",
      related: ["Aggregations & GROUP BY", "Finding Duplicates", "Subqueries"] },

    { t: "Subqueries", cat: "sql", d: "A query nested inside another — scalar, IN-lists, correlated, or derived tables.",
      what: "Subqueries let you filter or compute against the result of another query. Forms: scalar (single value), IN/EXISTS (membership), correlated (references the outer row), and derived tables (a subquery in FROM).",
      when: "Comparisons against a computed value, existence checks, or staged transformations.",
      code: `-- Customers who spent above the overall average
SELECT customer_id, SUM(amount) AS spent
FROM orders
GROUP BY customer_id
HAVING SUM(amount) > (SELECT AVG(total) FROM (
  SELECT SUM(amount) AS total FROM orders GROUP BY customer_id
) t);`,
      tip: "EXISTS is often faster than IN for large correlated checks — and handles NULLs more predictably.",
      related: ["WHERE vs HAVING", "Window Functions", "Set Operations (UNION / EXCEPT)"] },

    { t: "Window Functions", cat: "sql", d: "ROW_NUMBER, RANK, DENSE_RANK and running totals — without collapsing rows.",
      what: "Window functions compute across a set of rows related to the current row, keeping each row (unlike GROUP BY). Great for ranking, de-duplication, and running totals.",
      when: "Nth-highest queries, de-duplicating, top-N-per-group, running/moving aggregates.",
      code: `-- 2nd highest salary (ties-aware)
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t WHERE rnk = 2;

-- Keep only the latest row per customer
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
  FROM orders
) t WHERE rn = 1;`,
      tip: "RANK leaves gaps after ties (1,1,3); DENSE_RANK doesn't (1,1,2); ROW_NUMBER is always unique.",
      related: ["Aggregations & GROUP BY", "Nth Highest Value", "Finding Duplicates"] },

    { t: "Set Operations (UNION / EXCEPT)", cat: "sql", d: "Combine or diff two result sets: UNION, UNION ALL, INTERSECT, EXCEPT/MINUS.",
      what: "UNION merges and de-duplicates; UNION ALL keeps duplicates (faster); INTERSECT keeps common rows; EXCEPT/MINUS returns rows in the first set not in the second — perfect for diffing source vs target.",
      when: "Source-to-target reconciliation, finding rows present in one dataset but not another.",
      code: `-- Rows in source that didn't make it to the target (ETL gap)
SELECT id FROM staging_orders
EXCEPT
SELECT order_id FROM dw_orders;`,
      tip: "Use UNION ALL unless you actually need de-duplication — UNION pays a sort/distinct cost.",
      related: ["JOINs (INNER / LEFT / RIGHT / FULL)", "Data Validation & Reconciliation", "Subqueries"] },

    { t: "Finding Duplicates", cat: "sql", d: "GROUP BY the key with HAVING COUNT(*) > 1 — the uniqueness check.",
      what: "Duplicate detection is a core data-quality test. Group by the column(s) that should be unique and keep groups appearing more than once.",
      when: "Validating the uniqueness data-quality dimension after loads, migrations or imports.",
      code: `-- Duplicate (email) accounts and how many
SELECT email, COUNT(*) AS dupes
FROM customers
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY dupes DESC;`,
      tip: "To delete dupes keeping one row, use ROW_NUMBER() OVER (PARTITION BY key ORDER BY id) and delete rn > 1.",
      related: ["WHERE vs HAVING", "Window Functions", "Data Validation & Reconciliation"] },

    { t: "Nth Highest Value", cat: "sql", d: "A perennial interview question — solved with subquery or window function.",
      what: "Find the Nth largest value (e.g. 2nd-highest salary). Portable answer uses a correlated subquery; the modern, ties-aware answer uses DENSE_RANK.",
      when: "Interview rounds, and 'top performer / Nth largest' reporting checks.",
      code: `-- Nth highest, portable (N=2)
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Nth highest, ties-aware via window function
SELECT DISTINCT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) rnk FROM employees
) t WHERE rnk = 3;`,
      tip: "Clarify tie behaviour with the interviewer — do duplicate salaries count as one rank or many?",
      related: ["Window Functions", "Subqueries", "Aggregations & GROUP BY"] },

    { t: "NULL Handling & COALESCE", cat: "sql", d: "NULL means 'unknown' — it breaks =, and COALESCE/ISNULL provide defaults.",
      what: "NULL is not equal to anything (even NULL) — use IS NULL / IS NOT NULL. COALESCE returns the first non-NULL value; great for defaults and for catching unexpected NULLs in validation.",
      when: "Completeness checks (unexpected NULLs), and explaining 'UI shows 0 but DB has NULL' defects.",
      code: `-- Completeness: rows missing required data
SELECT COUNT(*) FROM orders
WHERE amount IS NULL OR shipping_address IS NULL;

-- Default a NULL to 0 for display reconciliation
SELECT id, COALESCE(discount, 0) AS discount FROM orders;`,
      tip: "A LEFT JOIN + WHERE col = x silently drops NULLs — use IS NULL or move the predicate into the JOIN.",
      related: ["JOINs (INNER / LEFT / RIGHT / FULL)", "Data Validation & Reconciliation", "SELECT & Filtering (WHERE)"] },

    { t: "Data Validation & Reconciliation", cat: "sql", d: "The QA query toolkit: count match, aggregate match, dup/null/orphan checks.",
      what: "A set of reusable patterns to prove UI/report data against the source of truth: row-count reconciliation, aggregate cross-check, duplicate hunt, NULL/validity, orphan detection (anti-join), and source-to-target diffs.",
      when: "UI-to-DB verification, analytics/reporting validation, and ETL testing.",
      code: `-- 1) Count reconciliation (UI 'Active: 1,190' vs source)
SELECT COUNT(*) FROM customers WHERE status = 'active';
-- 2) Aggregate cross-check
SELECT SUM(amount) FROM orders WHERE order_date >= '2026-06-01';
-- 3) Orphans (anti-join) & 4) bad values
SELECT COUNT(*) FROM orders WHERE amount < 0 OR amount IS NULL;`,
      tip: "When UI and SQL disagree, suspect filter logic, join fan-out, timezone boundaries, or rounding — in that order.",
      related: ["JOINs (INNER / LEFT / RIGHT / FULL)", "Set Operations (UNION / EXCEPT)", "Finding Duplicates"] },

    { t: "ACID & Transactions", cat: "sql", d: "Atomicity, Consistency, Isolation, Durability — the guarantees behind data integrity.",
      what: "A transaction groups statements so they all succeed or all roll back. ACID: Atomicity (all-or-nothing), Consistency (constraints hold), Isolation (concurrent txns don't corrupt each other), Durability (survives crash).",
      when: "Testing multi-step operations, concurrency/race conditions, and data-integrity scenarios.",
      code: `BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- ROLLBACK; would undo both`,
      tip: "Test atomicity by killing a transaction mid-way and asserting no partial writes; test isolation with concurrent updates to one row.",
      related: ["Data Validation & Reconciliation", "Indexes & Query Performance", "NULL Handling & COALESCE"] },

    { t: "Indexes & Query Performance", cat: "sql", d: "Why queries are slow — and what QA should know about indexes and EXPLAIN.",
      what: "Indexes speed up lookups but slow writes and cost storage. A missing index causes full table scans. EXPLAIN / EXPLAIN ANALYZE shows the query plan so you can spot scans, bad joins and cardinality issues.",
      when: "Performance/volume testing, investigating slow reports, and backend perf validation.",
      code: `-- See the plan; look for 'Seq Scan' on big tables
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42;

-- An index that would make the above an index scan
CREATE INDEX idx_orders_customer ON orders(customer_id);`,
      tip: "The DB is the usual performance suspect — check slow-query logs and missing indexes first, but prove it with EXPLAIN.",
      related: ["ACID & Transactions", "Aggregations & GROUP BY", "Data Validation & Reconciliation"] },

    /* ════════════════ AUTOMATION FRAMEWORKS ════════════════ */
    { t: "Selenium WebDriver", cat: "automation", d: "The long-standing open-source standard for browser automation across languages.",
      what: "Selenium drives real browsers via the W3C WebDriver protocol. It is language-agnostic (Java, Python, C#, JS, Ruby), browser-agnostic (Chrome, Firefox, Edge, Safari), and the de-facto industry baseline. Selenium Grid runs tests in parallel across machines/browsers.",
      features: ["W3C WebDriver protocol, all major browsers", "Bindings for Java/Python/C#/JS/Ruby", "Selenium Grid for parallel & cross-browser", "Huge ecosystem and community", "Integrates with TestNG/JUnit/Pytest + Page Object Model"],
      pros: ["Mature, stable, massive community", "Language & browser flexibility", "Free and open-source", "Industry-standard skill on every JD"],
      cons: ["No built-in waits — you manage explicit waits (flakiness risk)", "No built-in reporting/test runner", "Slower setup; more boilerplate", "Can't easily handle network/mocking natively"],
      when: "Cross-browser web automation in a team standardized on a JVM/Python stack, or where the broad ecosystem matters.",
      code: `// Java + explicit wait + Page Object style
WebDriver driver = new ChromeDriver();
driver.get("https://example.com/login");
new WebDriverWait(driver, Duration.ofSeconds(10))
   .until(ExpectedConditions.elementToBeClickable(By.id("user")))
   .sendKeys("alice");
driver.findElement(By.id("pass")).sendKeys("secret");
driver.findElement(By.cssSelector("button[type=submit]")).click();`,
      tip: "Never use Thread.sleep — use explicit waits (WebDriverWait + ExpectedConditions). Mixing implicit + explicit waits causes unpredictable timing.",
      related: ["Playwright", "Cypress", "Selenium vs Playwright vs Cypress", "Appium"] },

    { t: "Playwright", cat: "automation", d: "Microsoft's modern framework: fast, auto-waiting, multi-browser, great tooling.",
      what: "Playwright automates Chromium, Firefox and WebKit with one API. Its killer features are auto-waiting (no flaky manual waits), network interception/mocking, parallel execution, and excellent debugging (trace viewer, codegen). Supports TypeScript/JS, Python, Java, .NET.",
      features: ["Auto-waiting for elements (low flakiness)", "Chromium, Firefox, WebKit with one API", "Network interception & mocking built-in", "Auto-wait, traces, codegen, video, screenshots", "Parallelism & sharding out of the box", "Web-first assertions + API testing support"],
      pros: ["Fast and reliable (auto-wait kills most flakiness)", "Superb debugging: trace viewer, codegen", "True cross-browser incl. WebKit/Safari", "Built-in mocking, parallelism, API testing"],
      cons: ["Newer — smaller (but fast-growing) community than Selenium", "No real Safari on macOS-only quirks (uses WebKit engine)", "Team must learn its conventions"],
      when: "New web automation projects wanting speed, low flakiness and modern tooling — increasingly the default choice.",
      code: `// TypeScript — auto-waiting, web-first assertions
import { test, expect } from '@playwright/test';
test('login', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByTestId('username').fill('alice');
  await page.getByTestId('password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/dashboard/);
});`,
      tip: "Its auto-waiting + web-first assertions (expect(locator).toBeVisible()) remove most explicit waits — a major flakiness reduction vs Selenium.",
      related: ["Selenium WebDriver", "Cypress", "Selenium vs Playwright vs Cypress"] },

    { t: "Cypress", cat: "automation", d: "JavaScript-first, developer-friendly framework that runs inside the browser.",
      what: "Cypress runs in the same run-loop as your app (in-browser), giving fast feedback, automatic waiting, time-travel debugging and a great DX. It's JS/TS only and historically focused on Chromium-family browsers (now with broader support).",
      features: ["Runs in-browser → fast, reliable", "Automatic waiting & retries on assertions", "Time-travel debugging in the Test Runner", "Network stubbing (cy.intercept)", "Great developer experience & docs"],
      pros: ["Excellent DX and debugging (time-travel)", "Automatic waiting reduces flakiness", "Easy setup for JS/TS front-end teams", "Strong for component + E2E testing"],
      cons: ["JavaScript/TypeScript only", "Weaker multi-tab / multi-origin support (improving)", "Runs inside the browser → some architectural limits", "Less suited to non-web / mobile"],
      when: "Front-end JS/TS teams wanting fast, developer-owned E2E and component tests with minimal setup.",
      code: `// JavaScript — Cypress auto-retries assertions
describe('login', () => {
  it('signs in', () => {
    cy.visit('/login');
    cy.get('[data-testid=username]').type('alice');
    cy.get('[data-testid=password]').type('secret');
    cy.contains('button', 'Sign in').click();
    cy.url().should('include', '/dashboard');
  });
});`,
      tip: "Cypress auto-retries the *assertion* until it passes or times out — don't add manual waits; fix the assertion instead.",
      related: ["Selenium WebDriver", "Playwright", "Selenium vs Playwright vs Cypress"] },

    { t: "Selenium vs Playwright vs Cypress", cat: "automation", d: "The comparison interviewers love — pick the right tool with reasons.",
      what: "Selenium: most mature, language/browser-agnostic, but you manage waits and runners. Playwright: modern, fast, auto-waiting, true cross-browser (incl. WebKit), multi-language, rich tooling. Cypress: best DX for JS/TS front-end teams, in-browser, time-travel, but JS-only with some architectural limits.",
      features: ["Language: Selenium=many · Playwright=many · Cypress=JS/TS only", "Browsers: Selenium & Playwright=all incl. Safari/WebKit · Cypress=mostly Chromium+", "Waiting: Selenium=manual · Playwright & Cypress=auto", "Architecture: Selenium/Playwright=out-of-process · Cypress=in-browser", "Speed/flakiness: Playwright & Cypress generally faster/less flaky than Selenium"],
      when: "Choosing a framework: legacy/multi-language/maximum browser reach → Selenium or Playwright; modern greenfield → Playwright; JS front-end team wanting DX → Cypress.",
      tip: "There's no single 'best' — answer with trade-offs tied to the team's stack, browser needs and flakiness tolerance. That nuance is the senior signal.",
      related: ["Selenium WebDriver", "Playwright", "Cypress"] },

    { t: "Appium", cat: "automation", d: "The Selenium of mobile — cross-platform automation for iOS & Android apps.",
      what: "Appium automates native, hybrid and mobile-web apps on iOS and Android using the WebDriver protocol, so you reuse Selenium-style skills. One API across platforms.",
      features: ["iOS + Android, native/hybrid/web", "WebDriver protocol (familiar to Selenium users)", "Multiple languages", "No app source changes needed"],
      pros: ["Cross-platform with one API", "Reuses WebDriver knowledge", "Open-source"],
      cons: ["Slower; mobile setup is fiddly (simulators/devices)", "Can be flaky without device farms"],
      when: "Automating mobile app testing across iOS and Android.",
      tip: "Pair with a real-device cloud (BrowserStack/Sauce) — emulators miss real sensor/perf behaviour.",
      related: ["Selenium WebDriver", "WebdriverIO", "Robot Framework"] },

    { t: "Cucumber (BDD)", cat: "automation", d: "Runs plain-language Gherkin specs as automated tests.",
      what: "Cucumber executes Given/When/Then scenarios by mapping each step to code, turning business-readable specs into living, automated acceptance tests. Often layered on top of Selenium/Playwright.",
      features: ["Gherkin Given/When/Then", "Business-readable living documentation", "Pluggable step definitions over any driver", "Java/JS/Ruby (and SpecFlow for .NET)"],
      pros: ["Shared language across business/dev/QA", "Specs double as documentation"],
      cons: ["Extra layer/maintenance overhead", "Gherkin abused as scripting becomes brittle"],
      when: "Teams practicing BDD/ATDD who want collaboration and readable specs.",
      tip: "BDD's value is the conversation and shared examples — not the tooling. Don't write Gherkin no business person will read.",
      related: ["Selenium WebDriver", "Playwright", "Robot Framework"] },

    { t: "WebdriverIO", cat: "automation", d: "A flexible Node.js automation framework over WebDriver and DevTools.",
      what: "WebdriverIO is a progressive Node.js test framework supporting WebDriver and Chrome DevTools protocols, web and mobile (via Appium), with a rich plugin ecosystem and built-in services/reporters.",
      features: ["WebDriver + DevTools protocols", "Web and mobile (Appium) support", "Large plugin/service ecosystem", "Built-in runner & reporters"],
      pros: ["Flexible, extensible, good for JS teams", "Web + mobile in one tool"],
      cons: ["Config can be complex", "Smaller community than Selenium/Cypress"],
      when: "Node.js teams wanting WebDriver flexibility with batteries included.",
      tip: "A solid middle ground if you want WebDriver compatibility but a nicer DX than raw Selenium.",
      related: ["Selenium WebDriver", "Appium", "Cypress"] },

    { t: "API Test Tools (Postman / REST Assured)", cat: "automation", d: "Test APIs directly — Postman for exploration, REST Assured for code-based suites.",
      what: "Postman is a GUI for building, exploring and collection-running API requests (with JS tests). REST Assured is a Java DSL for fluent, code-based API assertions integrated into JUnit/TestNG. Both validate status, schema, headers, auth and data.",
      features: ["Postman: collections, environments, Newman CLI for CI", "REST Assured: given/when/then fluent assertions", "Schema validation, auth/token handling", "Easy CI integration"],
      when: "API/integration testing below the UI — fast, stable, powerful.",
      code: `// REST Assured (Java)
given().header("Authorization", "Bearer " + token)
.when().get("/orders/42")
.then().statusCode(200)
       .body("status", equalTo("SHIPPED"));`,
      tip: "Push verification to the API layer — it's faster and less brittle than driving the same logic through the UI.",
      related: ["Playwright", "Selenium WebDriver", "Cucumber (BDD)"] },

    { t: "Robot Framework", cat: "automation", d: "Keyword-driven, human-readable automation framework (Python-based).",
      what: "Robot Framework is a generic, keyword-driven test automation framework with a readable tabular syntax. Extensible via libraries (Selenium, Browser/Playwright, Appium, REST). Popular for acceptance testing and non-developers.",
      features: ["Keyword-driven, readable syntax", "Rich libraries (Selenium, Playwright, API)", "Strong reporting/logging", "Python-extensible"],
      pros: ["Readable by non-programmers", "Great reports out of the box"],
      cons: ["Keyword abstraction can hide complexity", "Less flexible than code for complex logic"],
      when: "Acceptance/keyword-driven testing where non-developers contribute tests.",
      tip: "Pairs keyword-driven and data-driven approaches well — good for broad, maintainable acceptance suites.",
      related: ["Cucumber (BDD)", "Selenium WebDriver", "Playwright"] },

    /* ════════════════ PERFORMANCE / LOAD TOOLS ════════════════ */
    { t: "Apache JMeter", cat: "perf", d: "The open-source standard for load & performance testing across many protocols.",
      what: "JMeter is a free, Java-based load-testing tool with a GUI to build test plans (thread groups, samplers, listeners) and a CLI/non-GUI mode for real load runs. It supports HTTP, REST, SOAP, JDBC, JMS, FTP and more, with assertions, correlation, and pluggable reporting.",
      features: ["GUI test-plan builder + non-GUI CLI for load", "HTTP, JDBC, JMS, SOAP, FTP, gRPC (plugins)", "Thread groups, timers, assertions, listeners", "Distributed load via multiple slaves", "BlazeMeter/Taurus & CI integration", "HTML dashboard reports"],
      pros: ["Free, mature, huge community", "Protocol breadth beyond just HTTP", "Distributed load generation", "Lots of plugins & integrations"],
      cons: ["GUI is heavy; record-and-replay can get messy", "Higher resource use per thread than code tools (k6/Gatling)", "Scripting complex correlation is fiddly", "Not developer-code-centric"],
      when: "Open-source load testing across diverse protocols, or teams wanting a GUI-driven tool with broad reach.",
      code: `# Run a JMeter plan headless and produce an HTML report
jmeter -n -t loadtest.jmx \\
  -Jthreads=200 -Jrampup=60 -Jduration=600 \\
  -l results.jtl -e -o ./html-report`,
      tip: "Always run real load in non-GUI mode (-n) — the GUI is for building/debugging only; it can't drive high load reliably. Report p95/p99, not averages.",
      related: ["LoadRunner", "k6", "Gatling"] },

    { t: "LoadRunner", cat: "perf", d: "The enterprise-grade performance suite (OpenText/Micro Focus), broad protocol support.",
      what: "LoadRunner is a long-established enterprise load-testing platform. VuGen records/scripts virtual users (in C-like scripting), the Controller orchestrates load scenarios, and Analysis produces deep reports. It supports an exceptionally wide range of protocols (web, SAP, Citrix, Oracle, mainframe) and integrates with APM for diagnostics.",
      features: ["VuGen scripting + Controller + Analysis", "Very broad protocol support (SAP, Citrix, Oracle, web…)", "Detailed correlation & parameterization", "Deep analysis & APM/diagnostics integration", "Cloud/distributed load (LoadRunner Cloud)"],
      pros: ["Powerful for complex enterprise/legacy protocols", "Mature analysis & diagnostics", "Strong vendor support", "Handles very large, complex scenarios"],
      cons: ["Commercial & expensive (licensed by virtual users)", "Steeper learning curve; heavier tooling", "Less CI/developer-centric than k6/JMeter"],
      when: "Large enterprises testing complex or legacy protocol stacks (SAP, Citrix, mainframe) needing deep analysis and vendor support.",
      code: `// VuGen (C-like) — a recorded web step with correlation
web_url("login",
  "URL=https://app.example.com/login",
  "Method=GET", LAST);
lr_start_transaction("submit_login");
web_submit_data("login", "Action=...", ITEMDATA,
  "Name=user", "Value=alice", ENDITEM,
  "Name=token", "Value={correlated_token}", ENDITEM, LAST);
lr_end_transaction("submit_login", LR_AUTO);`,
      tip: "Know the trio: VuGen (script) → Controller (run scenario) → Analysis (report). The classic JMeter-vs-LoadRunner answer: JMeter is free/open-source/protocol-flexible; LoadRunner is licensed but stronger on enterprise protocols and analysis.",
      related: ["Apache JMeter", "Gatling", "k6"] },

    { t: "k6", cat: "perf", d: "Modern, developer-centric load testing — scripted in JavaScript, CLI-first.",
      what: "k6 (by Grafana) is an open-source load-testing tool where tests are JavaScript, run from a fast Go engine via CLI — ideal for CI/CD and 'performance as code'. Great metrics output and Grafana integration.",
      features: ["Tests written in JavaScript (ES modules)", "Fast Go engine, low resource per VU", "CLI-first → easy CI/CD integration", "Thresholds as pass/fail gates", "Grafana/Prometheus output"],
      pros: ["Developer-friendly, code-reviewed tests", "Lightweight & fast", "First-class CI/CD & thresholds"],
      cons: ["HTTP-focused (fewer protocols than JMeter/LoadRunner)", "No GUI builder", "Browser-level testing is newer"],
      when: "Dev/DevOps teams doing 'performance as code' and gating CI on performance thresholds.",
      code: `import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = { vus: 200, duration: '5m',
  thresholds: { http_req_duration: ['p(95)<500'] } };
export default function () {
  const res = http.get('https://api.example.com/orders');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}`,
      tip: "Its thresholds make perf a CI quality gate — the build fails if p95 latency exceeds your SLA.",
      related: ["Apache JMeter", "LoadRunner", "Gatling"] },

    { t: "Gatling", cat: "perf", d: "High-performance, code-based load testing (Scala/Java/Kotlin DSL).",
      what: "Gatling is an open-source load tool using an expressive code DSL and an efficient async engine, producing rich HTML reports. Popular for high-throughput HTTP load with maintainable, version-controlled scenarios.",
      features: ["Expressive Scala/Java/Kotlin DSL", "Efficient async engine (high load per machine)", "Beautiful HTML reports", "CI-friendly; Gatling Enterprise for scale"],
      pros: ["High performance & low resource use", "Maintainable code-based scenarios", "Excellent reports"],
      cons: ["DSL learning curve (esp. Scala)", "Mainly HTTP/web protocols"],
      when: "Engineering teams wanting maintainable, high-throughput HTTP load tests as code.",
      tip: "Like k6, it favors 'load tests as code' over GUI record/replay — better for version control and review.",
      related: ["k6", "Apache JMeter", "LoadRunner"] },

    { t: "Locust", cat: "perf", d: "Open-source load testing where you define user behaviour in Python.",
      what: "Locust lets you script virtual-user behaviour in plain Python, scales across distributed workers, and offers a live web UI to watch metrics. Code-first and developer-friendly.",
      features: ["User behaviour as Python code", "Distributed/scalable workers", "Live web UI for real-time metrics", "Easy to extend"],
      pros: ["Pythonic and approachable", "Scales horizontally", "Code-based & version-controllable"],
      cons: ["HTTP-focused", "You write more of the harness yourself"],
      when: "Python teams wanting flexible, code-based load testing.",
      tip: "Good fit when your team already lives in Python and wants load tests in the same language.",
      related: ["k6", "Apache JMeter", "Gatling"] },

    /* ════════════════ CI/CD & DEVOPS TOOLS ════════════════ */
    { t: "Jenkins", cat: "cicd", d: "The open-source automation server that pioneered mainstream CI/CD.",
      what: "Jenkins is a widely-used, self-hosted automation server for building, testing and deploying via pipelines. Pipelines are defined as code in a Jenkinsfile (declarative or scripted Groovy). A vast plugin ecosystem integrates virtually any tool; agents distribute work across machines.",
      features: ["Pipeline-as-code (Jenkinsfile, Groovy)", "1800+ plugins (Git, Docker, K8s, test reporters)", "Distributed builds via agents/nodes", "Self-hosted & highly customizable", "Stages, parallelism, quality gates"],
      pros: ["Free, flexible, huge plugin ecosystem", "Full control (self-hosted)", "Mature & ubiquitous skill"],
      cons: ["You maintain/secure the server & plugins", "Plugin sprawl & upkeep overhead", "UI/config dated vs modern SaaS CI"],
      when: "Teams wanting a free, self-hosted, highly customizable CI/CD server with deep integrations.",
      code: `// Jenkinsfile — staged quality gates
pipeline {
  agent any
  stages {
    stage('Build')   { steps { sh 'npm ci' } }
    stage('Unit')    { steps { sh 'npm run test:unit' } }
    stage('E2E')     { steps { sh 'npx playwright test' } }
    stage('Deploy')  { when { branch 'main' }
                       steps { sh './deploy.sh' } }
  }
  post { always { junit 'reports/*.xml' } }
}`,
      tip: "Where QA fits: tests run as staged gates (lint/unit → API → E2E) that block promotion. Keep the PR gate under ~10 min; run heavy regression nightly.",
      related: ["GitHub Actions", "GitLab CI/CD", "Docker", "Kubernetes"] },

    { t: "Kubernetes", cat: "cicd", d: "The container orchestration platform — runs, scales and heals containerized apps.",
      what: "Kubernetes (K8s) automates deployment, scaling and management of containerized applications across a cluster. Core objects: Pods (containers), Deployments (desired state/rollouts), Services (stable networking), Namespaces (isolation). It self-heals (restarts failed pods) and scales horizontally.",
      features: ["Self-healing & auto-restart of pods", "Horizontal autoscaling & rolling updates", "Service discovery & load balancing", "Declarative config (YAML manifests)", "Namespaces for isolation (great for ephemeral test envs)"],
      pros: ["Resilient, scalable, cloud-agnostic", "Declarative, reproducible infrastructure", "Enables ephemeral per-PR test environments", "Industry-standard orchestration"],
      cons: ["Steep learning curve; operationally complex", "Overkill for small/simple apps", "Requires solid observability to debug"],
      when: "Running scalable, resilient microservices — and spinning up isolated, ephemeral environments per pull request for testing.",
      code: `# Deployment: 3 replicas, rolling updates, self-healing
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: web
          image: myapp:1.4.2
          readinessProbe: { httpGet: { path: /health, port: 8080 } }`,
      tip: "QA angle: K8s enables ephemeral environments (a fresh, isolated env per PR) — no more 'someone broke staging'. Readiness/liveness probes are also testable resilience features.",
      related: ["Docker", "Jenkins", "GitHub Actions", "Kubernetes for QA"] },

    { t: "Kubernetes for QA", cat: "cicd", d: "Why testers care about K8s: ephemeral envs, resilience testing, and scaling.",
      what: "For QA, Kubernetes is less about ops and more about three superpowers: (1) ephemeral environments spun up per branch/PR and torn down after, giving perfect isolation; (2) resilience/chaos testing by killing pods and verifying self-healing/failover; (3) realistic scaling for performance tests.",
      features: ["Per-PR ephemeral test environments", "Kill-a-pod resilience & failover testing", "Scale replicas to mirror prod for perf tests", "Namespace isolation for parallel test runs"],
      when: "Modern microservice testing — isolation, resilience and scalable performance environments.",
      tip: "Great senior answer: 'K8s lets me give every PR its own isolated environment and lets me chaos-test self-healing — quality benefits, not just ops.'",
      related: ["Kubernetes", "Docker", "Jenkins"] },

    { t: "Docker", cat: "cicd", d: "Containerization — package an app and its dependencies into a portable image.",
      what: "Docker packages an application with everything it needs into a container image that runs identically anywhere, eliminating 'works on my machine'. Containers are lightweight, fast to start, and the building block under Kubernetes.",
      features: ["Consistent, reproducible environments", "Lightweight & fast vs VMs", "Dockerfile = environment as code", "Compose for multi-service local stacks", "Foundation for CI test envs & K8s"],
      pros: ["Kills environment drift", "Fast, disposable test environments", "Portable across machines/CI/cloud"],
      cons: ["Learning curve for images/networking/volumes", "Stateful data & persistence need care"],
      when: "Standardizing dev/test/prod environments, spinning up service dependencies for integration tests, and as the unit K8s orchestrates.",
      code: `# docker-compose: app + db for integration tests
services:
  app:
    build: .
    ports: ["8080:8080"]
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: test }`,
      tip: "QA uses Docker/Compose to spin up the app + a real database + mocked third parties for deterministic integration tests, then tear it all down.",
      related: ["Kubernetes", "Jenkins", "GitHub Actions"] },

    { t: "GitHub Actions", cat: "cicd", d: "CI/CD built into GitHub — workflows as YAML, triggered on repo events.",
      what: "GitHub Actions runs workflows (YAML in .github/workflows) on events like push and pull_request. A huge marketplace of reusable actions, hosted runners, matrix builds and secrets management make it a popular, low-friction CI/CD for GitHub repos.",
      features: ["YAML workflows triggered on repo events", "Hosted runners (Linux/macOS/Windows)", "Matrix builds & sharding for parallel tests", "Marketplace of reusable actions", "Secrets, environments & deploy gates"],
      pros: ["Zero setup if you're on GitHub", "Great for matrix/parallel test runs", "Large marketplace; easy deploys (e.g. Pages)"],
      cons: ["Tied to GitHub", "Costs scale with runner minutes", "Complex pipelines get YAML-heavy"],
      when: "Projects hosted on GitHub wanting fast, integrated CI/CD with minimal infrastructure.",
      code: `name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy: { matrix: { shard: [1,2,3,4] } }
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test --shard=\${{ matrix.shard }}/4`,
      tip: "This very app deploys to GitHub Pages on push — Actions is the natural place to add an oxlint/test gate before deploy.",
      related: ["Jenkins", "GitLab CI/CD", "Docker"] },

    { t: "GitLab CI/CD", cat: "cicd", d: "Integrated CI/CD inside GitLab, configured via .gitlab-ci.yml.",
      what: "GitLab CI/CD is built into GitLab: pipelines defined in .gitlab-ci.yml run on GitLab Runners across stages, with built-in container registry, environments and review apps — an all-in-one DevOps platform.",
      features: ["Pipelines as .gitlab-ci.yml", "Stages, jobs, artifacts, caching", "Built-in container registry & environments", "Review apps (ephemeral preview envs)", "Auto DevOps option"],
      pros: ["All-in-one DevOps platform", "Review apps great for QA", "Strong self-hosted option"],
      cons: ["Best within the GitLab ecosystem", "Runner management when self-hosted"],
      when: "Teams on GitLab wanting an integrated source + CI/CD + registry platform.",
      tip: "Review apps spin up a live, per-merge-request environment — excellent for QA to test changes in isolation.",
      related: ["Jenkins", "GitHub Actions", "Kubernetes"] },

    { t: "Azure DevOps", cat: "cicd", d: "Microsoft's end-to-end suite: Boards, Repos, Pipelines, Test Plans, Artifacts.",
      what: "Azure DevOps bundles work tracking (Boards), Git hosting (Repos), CI/CD (Pipelines, YAML or classic), package feeds (Artifacts) and manual/exploratory testing (Test Plans) — a full ALM platform popular in enterprises.",
      features: ["Pipelines (YAML or classic) for CI/CD", "Boards for agile work tracking", "Test Plans for manual/exploratory testing", "Artifacts package feeds", "Tight Microsoft ecosystem integration"],
      pros: ["End-to-end ALM in one suite", "Strong enterprise & Microsoft integration", "Built-in Test Plans for manual QA"],
      cons: ["Heavier; best in MS-centric shops", "More moving parts to learn"],
      when: "Enterprises (often .NET/Microsoft stacks) wanting integrated planning, source, CI/CD and test management.",
      tip: "Azure Test Plans is one of the few CI suites with first-class manual/exploratory test management built in.",
      related: ["Jenkins", "GitHub Actions", "GitLab CI/CD"] },
  ];

  window.QA_TOOLS = { categories, tools };
})();
