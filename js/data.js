/* ============================================================================
 * QA Interview Mastery — Content Bank
 * Curated for Senior / Lead QA Engineer interviews.
 * `window.QA_DATA` is consumed by app.js
 * ==========================================================================*/
(function () {
  "use strict";

  /* ----- Learning tracks: deep Q&A organised by domain ----- */
  const tracks = [
    {
      id: "strategy",
      name: "Test Strategy & QA Leadership",
      icon: "🧭",
      blurb: "The signal interviewers look for in a senior hire: how you think about quality at scale.",
      tags: ["senior", "leadership", "must-know"],
      cards: [
        {
          q: "What is the difference between a Test Strategy and a Test Plan?",
          level: "Senior",
          a: `A **Test Strategy** is a high-level, relatively static document owned at the org/program level. It defines the *approach* to quality: testing types in scope, risk model, automation vs. manual split, environments, entry/exit criteria, tooling standards, and roles. It rarely changes per release.

A **Test Plan** is project/release specific and tactical. It instantiates the strategy: scope for *this* release, schedule, resource allocation, specific test deliverables, and the test cases/suites to run.

**Senior framing:** "Strategy answers *how we test as an organisation*; the plan answers *what we test for this release and when*." A red flag in interviews is treating them as synonyms.`,
          code: null,
        },
        {
          q: "How do you build a risk-based testing approach?",
          level: "Senior",
          a: `Risk = **Probability of failure × Impact of failure**. The goal is to spend test effort where it buys the most risk reduction, because you can never test everything.

Process:
1. **Identify risk items** — features, integrations, changed areas (use code churn + git history).
2. **Score** each on likelihood (complexity, new tech, defect history) and impact (revenue, data integrity, compliance, user reach).
3. **Prioritise** into a matrix: High/High gets deep exploratory + automation + edge cases; Low/Low gets a smoke check.
4. **Allocate** depth of testing to the score, not uniformly.
5. **Revisit** every release using actual defect-leakage data.

**Senior signal:** tie it to data — "we mined production incidents and defect density per module to weight the matrix, which cut regression time 30% without raising escaped defects."`,
          code: null,
        },
        {
          q: "Define entry and exit criteria. Who owns the go/no-go call?",
          level: "Senior",
          a: `**Entry criteria** — conditions that must be true before testing *starts*: build deployed to test env, smoke passing, test data ready, requirements baselined.

**Exit criteria** — conditions to *stop* testing and release: % test cases executed, % pass rate, zero open Sev-1/Sev-2 defects, code coverage thresholds, all critical risks mitigated.

**Go/no-go:** QA *provides the quality signal and a release recommendation with the residual-risk picture*; the final business decision is owned by the Release Manager / Product Owner. A senior QA never says "it's not my call" — they present risk clearly enough that the decision is obvious, and document the known residual risk if the business ships anyway.`,
          code: null,
        },
        {
          q: "How do you measure QA effectiveness? Which metrics actually matter?",
          level: "Lead",
          a: `Avoid vanity metrics (raw test-case count, raw bug count). Use outcome metrics:

- **Defect Escape Rate / Defect Leakage** = defects found in prod ÷ (prod + pre-prod). The single best measure of QA effectiveness.
- **Defect Removal Efficiency (DRE)** = defects found before release ÷ total defects. Aim >90%.
- **Escaped-defect severity mix** — leaking Sev-3s is fine; leaking Sev-1s is not.
- **Mean Time To Detect / Mean Time To Resolve**.
- **Automation ROI / flaky-test rate** — coverage that isn't trusted has negative value.
- **Lead time for a change to pass QA** (DORA-adjacent).

**Senior framing:** "I optimise for *escaped defects per release weighted by severity*, and treat test count as a cost, not an achievement."`,
          code: null,
        },
        {
          q: "A release is due tomorrow and regression isn't finished. What do you do?",
          level: "Lead",
          a: `This tests judgement under pressure, not heroics.

1. **Don't promise to finish by cutting corners silently.** Quantify the gap: what's tested, what's not, what risk the untested area carries.
2. **Re-prioritise with risk-based testing** — run the highest-risk, highest-impact remainder first (payments, auth, data writes), defer cosmetic/low-traffic paths.
3. **Present options to stakeholders with residual risk**: (a) ship on time with documented untested areas + a feature flag / canary, (b) slip the date, (c) descope the risky feature.
4. **Recommend**, don't just escalate — seniors give a recommendation.
5. **Post-release:** monitor the untested paths via observability + add the missing automation so it never recurs.`,
          code: null,
        },
      ],
    },

    {
      id: "design",
      name: "Test Design & Manual Testing",
      icon: "🧪",
      blurb: "Black-box design techniques separate a tester from someone who just clicks buttons.",
      tags: ["fundamentals", "must-know"],
      cards: [
        {
          q: "Explain Equivalence Partitioning and Boundary Value Analysis with an example.",
          level: "Mid/Senior",
          a: `Both reduce a huge input space to a small, high-yield set of cases.

**Equivalence Partitioning (EP):** divide inputs into classes where the system should behave identically; test one representative per class.

**Boundary Value Analysis (BVA):** bugs cluster at boundaries, so test the edges of each partition.

*Example — an age field valid for 18–60:*
- EP classes: invalid-low (<18), valid (18–60), invalid-high (>60), plus non-numeric/empty.
- BVA values: 17, 18, 19 … 59, 60, 61.

Together you cover the field with ~9 cases instead of 100. Seniors mention BVA catches off-by-one errors that EP alone misses.`,
          code: null,
        },
        {
          q: "What is a Decision Table and when is it the right technique?",
          level: "Senior",
          a: `A decision table maps **combinations of conditions** to **expected actions**. Use it when business rules depend on several interacting inputs — exactly where ad-hoc testing misses combinations.

| Logged in | Premium | Action |
|-----------|---------|--------|
| F | – | Redirect to login |
| T | F | Show upgrade banner |
| T | T | Show premium dashboard |

It guarantees every meaningful rule combination is covered and exposes contradictory or missing requirements. Pair with **pairwise/all-pairs** testing when the combinatorial space explodes (e.g., 5 dropdowns × 4 options = 1024 combos → ~20 pairwise cases).`,
          code: null,
        },
        {
          q: "How do you write a high-quality bug report?",
          level: "All",
          a: `A good bug report gets fixed fast because it removes ambiguity. Essential fields:

- **Title:** concise + specific — "Checkout fails with 500 when coupon + gift card applied together" not "Checkout broken".
- **Environment:** build/version, OS, browser, device, account/role.
- **Preconditions** and **exact reproduction steps** (numbered).
- **Expected vs. Actual result.**
- **Severity** (impact) and **Priority** (urgency) — distinct.
- **Evidence:** screenshot/video, logs, network trace, correlation ID.
- **Reproducibility:** always / intermittent (X of Y).

**Senior signal:** include the *narrowest* repro and a hypothesis on root cause/area, and attach the request ID so engineers can grep logs instantly.`,
          code: null,
        },
        {
          q: "Severity vs. Priority — give an example where they diverge.",
          level: "All",
          a: `**Severity** = technical impact of the defect. **Priority** = business urgency to fix.

- **High severity, low priority:** the app crashes on a deprecated browser used by 0.01% of users. Bad bug, but fix it later.
- **Low severity, high priority:** the company logo is misspelled on the homepage. Trivial technically, but fix *now* — it's on every page during a launch.

Interviewers ask this to check you don't conflate "scary bug" with "fix-first." Seniors note the two axes are owned differently: QA proposes severity, Product/Release owns priority.`,
          code: null,
        },
        {
          q: "What is exploratory testing and how do you make it rigorous, not random?",
          level: "Senior",
          a: `Exploratory testing is *simultaneous* learning, test design, and execution — guided by the tester's intuition rather than pre-scripted steps. It excels at finding the bugs scripted tests can't anticipate.

To keep it disciplined, use **Session-Based Test Management (SBTM):**
- Time-boxed sessions (60–90 min) with a written **charter** ("Explore coupon stacking to discover pricing-calculation bugs").
- Capture notes, bugs, and questions as you go.
- Debrief: coverage achieved, follow-up charters.

Pair it with **heuristics** like SFDIPOT / "Test it like a maniac" (boundaries, interruptions, double-submit, back button, network loss). Senior framing: exploratory complements automation — automation guards known behaviour, exploration discovers the unknown.`,
          code: null,
        },
      ],
    },

    {
      id: "automation",
      name: "Test Automation & Frameworks",
      icon: "🤖",
      blurb: "Design questions: frameworks, flakiness, the pyramid, and when NOT to automate.",
      tags: ["senior", "must-know", "coding"],
      cards: [
        {
          q: "Explain the Test Automation Pyramid. Why is the inverted 'ice-cream cone' an anti-pattern?",
          level: "Senior",
          a: `The pyramid prescribes the *ratio* of tests by level:
- **Unit (base, many):** fast, isolated, cheap, run in ms.
- **Integration/API/Service (middle):** verify component contracts.
- **UI/E2E (tip, few):** slow, brittle, expensive — only critical user journeys.

The **ice-cream cone** inverts this: lots of slow UI tests, few unit tests. Result: pipelines take hours, tests are flaky, failures are hard to localise, and engineers stop trusting the suite.

**Senior nuance:** push verification *down* the pyramid — if a bug can be caught by an API or unit test, don't write a UI test for it. Modern variant: the "**testing trophy**" (Kent C. Dodds) weights integration tests heavily for web apps.`,
          code: null,
        },
        {
          q: "How do you design a maintainable automation framework? What is the Page Object Model?",
          level: "Senior",
          a: `Goals: readable, DRY, resilient to UI change, parallel-safe, CI-friendly.

**Page Object Model (POM):** each page/component is a class exposing *behaviours* (methods), hiding locators. Tests speak business language; when the UI changes you fix one page object, not 50 tests.

Layered framework:
- **Tests** — business intent only (Given/When/Then).
- **Page objects / components** — interactions + locators.
- **Core/utilities** — driver factory, waits, config, API/DB helpers, test-data builders.
- **Reporting** — Allure/ExtentReports.

Principles: stable locators (data-testid > brittle XPath), explicit waits (never Thread.sleep), independent atomic tests, externalised config/data, and parallel execution.`,
          code: `// Playwright Page Object (TypeScript)
export class LoginPage {
  constructor(private page: Page) {}
  private user = () => this.page.getByTestId('username');
  private pass = () => this.page.getByTestId('password');
  private submit = () => this.page.getByRole('button', { name: 'Sign in' });

  async login(u: string, p: string) {
    await this.user().fill(u);
    await this.pass().fill(p);
    await this.submit().click();
    await this.page.waitForURL('**/dashboard');
  }
}`,
        },
        {
          q: "How do you deal with flaky tests?",
          level: "Lead",
          a: `Flaky = passes and fails on the same code. It's the #1 killer of trust in a suite. Treat flakiness as a **defect class**, not noise.

**Root causes & fixes:**
- **Bad waits / timing** → replace sleeps with explicit conditions (wait for element state / network idle / API response). Most common cause.
- **Test interdependence / shared state** → make tests atomic; isolate data per test; reset state.
- **Test order / parallelism races** → unique test data, no shared accounts.
- **Animations / dynamic content** → wait on stable signals, disable animations.
- **Environment / network** → mock 3rd parties, retry at the network layer, stable test env.

**Process:** quarantine flaky tests immediately (don't let them block the pipeline), track a flaky-rate metric, and fix or delete — a quarantined test that's ignored for a month should be deleted. Retries hide flakiness; use them as a safety net while investigating, never as the cure.`,
          code: null,
        },
        {
          q: "When should you NOT automate a test?",
          level: "Senior",
          a: `Automation has a cost (build + maintain). Don't automate when ROI is negative:

- **One-off / throwaway** checks run once.
- **Highly volatile UI** still changing every sprint — you'll rewrite tests constantly.
- **Tests needing human judgement** — visual aesthetics, UX "feel," exploratory discovery, usability.
- **Unstable requirements** — automating a moving target.
- **Extremely complex setup** where the test costs more than the risk it covers.
- **Low-risk, rarely-used** paths.

**Senior framing:** "I automate the *stable, repetitive, high-risk* regression core, and keep humans on exploratory + UX. Automation is a regression-protection investment, not a goal in itself."`,
          code: null,
        },
        {
          q: "Implicit vs. Explicit vs. Fluent waits — which and why?",
          level: "Mid/Senior",
          a: `- **Implicit wait:** global setting; the driver polls for *element presence* up to a timeout. Convenient but blunt — applies to every lookup and can mask real slowness.
- **Explicit wait:** wait for a *specific condition* on a specific element (clickable, visible, text present). Precise, the recommended default.
- **Fluent wait:** an explicit wait with custom polling interval + ignored exceptions.

**Gotcha interviewers love:** mixing implicit + explicit waits can cause unpredictable, additive wait times — pick one model (prefer explicit). And **never** use Thread.sleep — it's a fixed delay that's either too short (flaky) or too long (slow).`,
          code: `// Selenium explicit wait (Java)
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.elementToBeClickable(By.id("checkout")));`,
        },
      ],
    },

    {
      id: "api",
      name: "API Testing",
      icon: "🔌",
      blurb: "Where senior testing lives — fast, stable, below the brittle UI.",
      tags: ["senior", "must-know"],
      cards: [
        {
          q: "Walk through how you test a REST API thoroughly.",
          level: "Senior",
          a: `Cover far more than the happy path:

1. **Functional / contract:** status codes, response schema, correct data, against the spec (OpenAPI/Swagger).
2. **Positive & negative:** valid payloads, then missing/extra/wrong-type fields, invalid enums.
3. **Boundary & data validation:** field lengths, numeric ranges, special chars, unicode.
4. **Auth & authz:** no token (401), wrong role (403), expired token, token of another user (IDOR/broken object-level auth).
5. **Status-code correctness:** 200 vs 201 vs 204; 400 vs 422; 404 vs 403.
6. **Idempotency & methods:** GET safe, PUT/DELETE idempotent, POST not; wrong method → 405.
7. **Headers, pagination, sorting, filtering, rate limits.**
8. **Error contract:** consistent error body, no stack traces leaked.
9. **Performance & concurrency:** latency, parallel writes, race conditions.
10. **Backward compatibility / versioning.**`,
          code: null,
        },
        {
          q: "What HTTP status codes must a QA engineer know cold?",
          level: "All",
          a: `**2xx success:** 200 OK, 201 Created, 202 Accepted, 204 No Content.
**3xx redirect:** 301 Moved Permanently, 304 Not Modified (caching).
**4xx client error:** 400 Bad Request, 401 Unauthorized (not authenticated), 403 Forbidden (authenticated but not allowed), 404 Not Found, 405 Method Not Allowed, 409 Conflict, 422 Unprocessable Entity (validation), 429 Too Many Requests (rate limit).
**5xx server error:** 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout.

**Classic trap:** 401 vs 403. 401 = "I don't know who you are" (authentication). 403 = "I know who you are, you can't do this" (authorization). And 400 vs 422: 400 = malformed request; 422 = well-formed but semantically invalid.`,
          code: null,
        },
        {
          q: "How do you handle authentication in API automation (e.g. OAuth tokens)?",
          level: "Senior",
          a: `Don't hard-code tokens — they expire and leak. Pattern:

1. **Acquire a token programmatically** in setup: call the token endpoint with client credentials / a test user, parse the access token.
2. **Cache & reuse** the token across the suite until near expiry; refresh proactively (handle 401 → refresh → retry once).
3. **Inject** via an Authorization: Bearer header in a base request spec / interceptor so every request inherits it.
4. **Isolate secrets** in env vars / a vault, never in the repo.
5. **Test the auth itself** separately: expired token, tampered signature, wrong scope, refresh flow.

For multi-role testing, build a small token-factory keyed by role so tests can request "an admin token" or "a read-only token."`,
          code: `// REST Assured (Java) — reusable auth
RequestSpecification spec = new RequestSpecBuilder()
    .setBaseUri(BASE_URL)
    .addHeader("Authorization", "Bearer " + TokenFactory.forRole("admin"))
    .setContentType(ContentType.JSON)
    .build();

given().spec(spec).when().get("/orders/42")
    .then().statusCode(200)
    .body("status", equalTo("SHIPPED"));`,
        },
        {
          q: "What's the difference between contract testing and end-to-end testing?",
          level: "Lead",
          a: `**E2E** exercises the whole stack through real services — high confidence but slow, flaky, and requires every service deployed together.

**Contract testing** (e.g. Pact) verifies that a **consumer** and **provider** agree on the interface, *independently*. The consumer publishes expectations; the provider verifies it can meet them — no need to spin up both at once.

**Why seniors love it in microservices:** it catches breaking API changes at build time, in isolation, without the cost and flakiness of full E2E. The mantra: "Use contract tests for *integration confidence between services*, reserve a handful of E2E tests for *critical user journeys*."`,
          code: null,
        },
      ],
    },

    {
      id: "performance",
      name: "Performance & Non-Functional",
      icon: "⚡",
      blurb: "Load, stress, soak — and the metrics that matter to a senior.",
      tags: ["senior"],
      cards: [
        {
          q: "Differentiate Load, Stress, Spike, Soak, and Volume testing.",
          level: "Senior",
          a: `- **Load testing:** expected concurrent load → verify response time & throughput meet SLAs.
- **Stress testing:** push *beyond* capacity to find the breaking point and observe failure mode (graceful degradation vs. crash).
- **Spike testing:** sudden sharp surge (e.g., flash sale) → does autoscaling cope and recover?
- **Soak / endurance testing:** sustained load for hours/days → exposes memory leaks, connection-pool exhaustion, log-disk fill.
- **Volume testing:** large *data* volumes (huge DB, big payloads) → DB and query performance.
- **Scalability testing:** does adding resources increase capacity linearly?

**Senior signal:** name the *defect class* each finds — soak finds leaks, stress finds the failure mode, spike finds autoscaling lag.`,
          code: null,
        },
        {
          q: "Which performance metrics do you report, and why not just averages?",
          level: "Senior",
          a: `Report **percentiles, not averages** — averages hide the tail that hurts real users.

- **Latency:** p50, p90, **p95, p99** response times. p99 = the experience of your slowest 1%.
- **Throughput:** requests/sec, transactions/sec.
- **Error rate** under load.
- **Concurrency:** active users / connections.
- **Resource saturation:** CPU, memory, GC pauses, DB connections, I/O.
- **Apdex** (user-satisfaction score) for an executive summary.

**Why percentiles:** a 200 ms average can hide a 4 s p99 affecting thousands of users. The classic line: "I care about the tail — p95/p99 is where SLA breaches and angry users live."`,
          code: null,
        },
        {
          q: "How do you find the root cause of a performance bottleneck?",
          level: "Lead",
          a: `Methodically, layer by layer — don't guess.

1. **Establish a baseline & SLA** so "slow" is defined.
2. **Reproduce** under controlled load (JMeter/k6/Gatling).
3. **Observe the whole stack** with APM (Datadog/New Relic) + distributed tracing: where does the time actually go?
4. **Isolate the layer:** client → CDN → LB → app → DB → external deps. Common culprits: N+1 queries, missing indexes, lock contention, connection-pool exhaustion, chatty service calls, GC pauses.
5. **Profile** the hot path (DB slow-query log, flame graphs).
6. **Hypothesise → fix one thing → re-measure** (change one variable at a time).
7. **Document** the bottleneck and add a regression perf test.

**Senior signal:** "The DB is the usual suspect — I check slow queries and indexes first, but I prove it with tracing rather than assuming."`,
          code: null,
        },
      ],
    },

    {
      id: "cicd",
      name: "CI/CD, DevOps & Shift-Left",
      icon: "🚀",
      blurb: "Where quality engineering meets the pipeline.",
      tags: ["senior", "must-know"],
      cards: [
        {
          q: "What does 'shift-left testing' mean and how do you implement it?",
          level: "Senior",
          a: `Shift-left = move testing activities *earlier* in the SDLC, where defects are exponentially cheaper to fix.

Implementation:
- **Requirements phase:** QA reviews stories for testability + acceptance criteria; "three amigos" (PO + Dev + QA) refinement.
- **Design phase:** risk analysis, test design before code is written (think TDD/BDD).
- **Code phase:** unit tests, static analysis/linting, peer review, pre-commit hooks.
- **Build phase:** automated tests gating every PR in CI.
- **Practices:** BDD with Gherkin so specs are executable, contract tests, test-data management.

**Counterpart — shift-right:** testing in production (canary, feature flags, observability, chaos, synthetic monitoring). Seniors do both: catch early, *and* learn from prod.`,
          code: null,
        },
        {
          q: "How do automated tests fit into a CI/CD pipeline? What's a quality gate?",
          level: "Senior",
          a: `Tests run as **staged gates**, fast-to-slow, failing fast:

1. **Commit/PR stage:** lint + unit + static analysis (seconds–1 min). Blocks merge.
2. **Build stage:** integration + API/contract tests (minutes).
3. **Post-deploy to staging:** smoke + critical E2E + security scan.
4. **Pre-prod / prod:** canary + synthetic monitoring + performance baseline.

A **quality gate** is an automated pass/fail checkpoint — e.g., "coverage ≥ 80%, zero new critical SonarQube issues, all P1 tests green" — that *blocks promotion* if unmet.

**Senior principles:** keep the PR gate under ~10 min (developers context-switch otherwise), parallelise, run the slow full-regression nightly or on a schedule, and make failures actionable (clear logs, screenshots, traces).`,
          code: `# GitHub Actions — staged quality gate (excerpt)
jobs:
  unit:
    steps: [ {run: npm ci}, {run: npm run test:unit} ]
  api:
    needs: unit
    steps: [ {run: npm run test:api} ]
  e2e:
    needs: api
    steps:
      - run: npx playwright test --shard=\${{ matrix.shard }}/4
    strategy: { matrix: { shard: [1,2,3,4] } }   # parallel`,
        },
        {
          q: "How do you manage test data and test environments at scale?",
          level: "Lead",
          a: `Two of the hardest real-world problems; seniors are expected to have opinions.

**Test data:**
- **Generate, don't copy** — build data via API/factory builders so each test owns isolated, deterministic data and cleans up after itself.
- For prod-like data, **mask/anonymise** PII (GDPR).
- Avoid shared mutable fixtures — they cause flaky, order-dependent tests.

**Environments:**
- **Ephemeral environments** spun up per PR (containers/k8s) → isolation, no "someone broke staging."
- **Service virtualisation / mocks** for unavailable or costly third parties (WireMock, Mountebank).
- **Config as code**; parity with production to avoid "works in staging."
- **Stable, monitored** lower environments — a flaky env produces flaky tests and erodes trust.`,
          code: null,
        },
      ],
    },

    {
      id: "sql",
      name: "SQL & Backend Validation",
      icon: "🗄️",
      blurb: "Almost every QA interview has a live SQL question. Be ready.",
      tags: ["coding", "must-know"],
      cards: [
        {
          q: "Explain the JOIN types. What does an INNER vs. LEFT JOIN return?",
          level: "All",
          a: `- **INNER JOIN:** only rows with a match in *both* tables.
- **LEFT (OUTER) JOIN:** all rows from the left table + matched rows from the right; non-matches are NULL on the right.
- **RIGHT JOIN:** mirror of LEFT.
- **FULL OUTER JOIN:** all rows from both, NULLs where no match.
- **CROSS JOIN:** Cartesian product (every combination).

**Classic QA test scenario:** "Find users who registered but never placed an order." → LEFT JOIN orders, then \`WHERE orders.id IS NULL\`. This anti-join pattern is a very common interview question.`,
          code: `-- Users with no orders (data-integrity check)
SELECT u.id, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;`,
        },
        {
          q: "Write a query to find duplicate records, and the 2nd-highest value.",
          level: "Mid/Senior",
          a: `**Find duplicates** — group and keep groups with count > 1. Essential for data-integrity testing.

**2nd highest salary** — a perennial interview question. Cleanest portable answer uses a subquery; modern answer uses a window function (\`DENSE_RANK\`), which also handles ties correctly.`,
          code: `-- Duplicate emails
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 2nd highest salary (subquery)
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- 2nd highest, ties-aware (window function)
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t WHERE rnk = 2;`,
        },
        {
          q: "WHERE vs. HAVING, and what are ACID properties?",
          level: "Mid/Senior",
          a: `**WHERE vs. HAVING:** WHERE filters *rows before* grouping; HAVING filters *groups after* aggregation. You can't use an aggregate (COUNT, SUM) in WHERE — that's what HAVING is for.

**ACID** — the guarantees a transaction provides (vital when testing data integrity & concurrency):
- **Atomicity:** all-or-nothing; partial failure rolls back.
- **Consistency:** a transaction moves the DB from one valid state to another (constraints hold).
- **Isolation:** concurrent transactions don't corrupt each other (isolation levels: read-committed, repeatable-read, serializable).
- **Durability:** once committed, it survives a crash.

**QA angle:** test atomicity by killing a multi-step transaction mid-way and asserting no partial writes; test isolation with concurrent updates to expose race conditions / lost updates.`,
          code: null,
        },
      ],
    },

    {
      id: "coding",
      name: "Coding & Programming Logic",
      icon: "💻",
      blurb: "Senior QA is expected to code. Expect string/array logic and OOP.",
      tags: ["coding", "senior"],
      cards: [
        {
          q: "Reverse a string and check if it's a palindrome (without library reverse).",
          level: "Mid",
          a: `A staple warm-up. Show you can do it with a two-pointer approach (O(n) time, O(1) extra space) rather than only \`str[::-1]\`. Interviewers want to see edge cases: empty string, single char, case-insensitivity, ignoring non-alphanumerics.`,
          code: `// JavaScript — two-pointer palindrome
function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (s[i] !== s[j]) return false;
    i++; j--;
  }
  return true;
}
// isPalindrome("A man, a plan, a canal: Panama") -> true`,
        },
        {
          q: "Find the first non-repeating character / count word frequency.",
          level: "Mid",
          a: `Tests your grasp of **hash maps** — the single most useful data structure in coding interviews. First non-repeating char = count occurrences in one pass, then find the first char with count 1 in a second pass. O(n).`,
          code: `# Python — first non-repeating character
from collections import Counter
def first_unique(s):
    counts = Counter(s)
    for ch in s:
        if counts[ch] == 1:
            return ch
    return None

# Word frequency
def word_freq(text):
    return Counter(text.lower().split())`,
        },
        {
          q: "Explain the 4 pillars of OOP with a testing-framework example.",
          level: "Senior",
          a: `- **Encapsulation:** hide internals behind methods. *Page Objects* encapsulate locators — tests call \`login()\`, not raw selectors.
- **Inheritance:** a \`BaseTest\` class holds setup/teardown/driver init; every test class extends it (DRY).
- **Polymorphism:** a \`Browser\` interface with Chrome/Firefox/Edge implementations; the framework calls the same method, the right one runs. Enables cross-browser via config.
- **Abstraction:** expose *what* (a \`PaymentGateway.pay()\`), hide *how*; tests don't care about the implementation.

**Senior signal:** ground every pillar in your framework, not textbook \`Animal/Dog\` examples — it proves you've actually architected automation, not just written scripts.`,
          code: null,
        },
        {
          q: "FizzBuzz — and why interviewers still ask it.",
          level: "Junior/Mid",
          a: `Print 1..n, but "Fizz" for multiples of 3, "Buzz" for 5, "FizzBuzz" for both. It filters out people who can't translate simple logic to code at all. The senior twist: keep it readable and note the modulo-order matters (check 15/both first, or build the string).`,
          code: `for (let i = 1; i <= 100; i++) {
  let out = '';
  if (i % 3 === 0) out += 'Fizz';
  if (i % 5 === 0) out += 'Buzz';
  console.log(out || i);
}`,
        },
      ],
    },

    {
      id: "agile",
      name: "Agile, SDLC & Process",
      icon: "🔁",
      blurb: "Process fluency — STLC, Agile ceremonies, and the QA role within them.",
      tags: ["fundamentals", "must-know"],
      cards: [
        {
          q: "Walk me through the STLC (Software Testing Life Cycle).",
          level: "All",
          a: `1. **Requirement analysis** — review requirements for testability; identify what's testable; raise ambiguities early.
2. **Test planning** — scope, strategy, effort estimation, tools, resources, risk.
3. **Test case design** — write cases + scripts using design techniques; prepare test data.
4. **Test environment setup** — provision env + data; smoke-test it.
5. **Test execution** — run cases, log defects, retest, track.
6. **Test cycle closure** — exit criteria check, metrics, lessons learned, sign-off.

Each phase has **entry/exit criteria** and **deliverables**. Note STLC is *independent* of SDLC but runs in parallel — shift-left means STLC activities start at the SDLC requirements phase.`,
          code: null,
        },
        {
          q: "What is the QA role in each Agile/Scrum ceremony?",
          level: "Senior",
          a: `- **Backlog refinement / Three Amigos:** QA clarifies acceptance criteria, raises edge cases, ensures stories are testable *before* they're pulled in.
- **Sprint planning:** estimate test effort, flag risky stories, agree the Definition of Done includes testing.
- **Daily stand-up:** surface blockers (env down, builds failing), test progress.
- **Development:** test in-sprint, automate alongside, pair with devs (no "throw over the wall").
- **Sprint review/demo:** validate delivered increment against acceptance criteria.
- **Retrospective:** raise quality process improvements (flaky pipeline, escaped defects).

**Senior framing:** "Quality is the *whole team's* responsibility; I embed it into the DoD and the process, I'm not a downstream gatekeeper."`,
          code: null,
        },
        {
          q: "Whole-team quality: how do you handle 'QA is the bottleneck'?",
          level: "Lead",
          a: `This is a leadership/culture question.

Diagnose first — usually the bottleneck is structural, not effort:
- **Big-bang testing at sprint-end** → shift-left, test stories as they finish, not in a crunch.
- **Manual regression burden** → invest in automation + CI gates so regression is continuous.
- **Unclear acceptance criteria** → bugs found late; fix at refinement.
- **Knowledge silo** → QA-of-one. Spread testing skills: devs write unit/integration tests, pair on automation, build a shared quality culture.

**Reframe:** "QA isn't a phase or a person to bottleneck on — it's a property of how the team builds. My job as a senior is to make quality everyone's habit and remove the gate, not be the gate."`,
          code: null,
        },
      ],
    },

    {
      id: "security",
      name: "Security Testing Basics",
      icon: "🔒",
      blurb: "Senior QA is expected to catch the common OWASP issues.",
      tags: ["senior"],
      cards: [
        {
          q: "Name the OWASP Top 10 categories a QA should test for.",
          level: "Senior",
          a: `You're not expected to be a pentester, but you should test for the common classes (OWASP Top 10, current themes):

1. **Broken Access Control** — IDOR, privilege escalation, forced browsing. *(Most common.)*
2. **Cryptographic Failures** — data in transit/at rest not encrypted.
3. **Injection** — SQL/NoSQL/command/LDAP injection, XSS.
4. **Insecure Design** — missing security controls by design.
5. **Security Misconfiguration** — default creds, verbose errors, open ports.
6. **Vulnerable/Outdated Components** — old libraries (check with dependency scanners).
7. **Identification & Authentication Failures** — weak passwords, session fixation.
8. **Software & Data Integrity Failures** — insecure deserialization, unsigned updates.
9. **Security Logging & Monitoring Failures.**
10. **Server-Side Request Forgery (SSRF).**

QA's practical hits: test authorization (can user A read user B's data?), input validation, and error messages that leak info.`,
          code: null,
        },
        {
          q: "How would you test for SQL Injection and XSS as a QA engineer?",
          level: "Senior",
          a: `**SQL Injection** — try inputs that break out of the query: \`' OR '1'='1\`, \`'; DROP TABLE--\`, \`admin'--\`. A vulnerable app returns extra data, errors with SQL in the message, or bypasses login. The fix you should verify: **parameterised queries / prepared statements** (never string concatenation).

**XSS (Cross-Site Scripting)** — inject script payloads into any field that's later rendered: \`<script>alert(1)</script>\`, \`"><img src=x onerror=alert(1)>\`. If it executes, the input isn't being **output-encoded/sanitised**. Test stored (saved to DB), reflected (in URL/response), and DOM-based variants.

**Senior framing:** "I run these as part of negative testing and integrate SAST/DAST (e.g., OWASP ZAP) into the pipeline so it's continuous, not a one-off manual probe. I also verify the *fix* — parameterisation and context-aware output encoding — not just that my one payload was blocked."`,
          code: null,
        },
        {
          q: "What is an IDOR vulnerability and how do you test for it?",
          level: "Senior",
          a: `**IDOR (Insecure Direct Object Reference)** = broken object-level authorization. The app exposes a reference (e.g., \`/api/invoices/1042\`) and fails to check that the *current* user is allowed to access *that* object.

**Test it:**
1. Log in as User A, capture a request for A's resource (\`GET /api/orders/100\`).
2. Replay it as User B (swap the auth token, keep the ID).
3. If B sees A's order → IDOR. Also try incrementing/decrementing IDs and switching numeric IDs to other users' objects.

It's the practical face of "Broken Access Control" — OWASP's #1 — and one of the highest-value checks a QA can run, because devs frequently authenticate ("are you logged in?") but forget to authorize ("is this *yours*?").`,
          code: null,
        },
      ],
    },

    {
      id: "sysdesign",
      name: "System Design for QA",
      icon: "🏗️",
      blurb: "Senior rounds increasingly ask you to design a test strategy for a whole system.",
      tags: ["senior", "lead"],
      cards: [
        {
          q: "How would you design a test strategy for a system like a ride-sharing app (Uber)?",
          level: "Lead",
          a: `Structure your answer like a system-design round:

1. **Clarify scope & requirements** — which flows? (rider request → match → ride → pay). Scale? Platforms?
2. **Decompose into components** — auth, location/maps, matching engine, pricing/surge, payments, notifications, ratings.
3. **Map test types per component:**
   - Matching engine → algorithm correctness, edge cases (no drivers, simultaneous requests) → unit + integration.
   - Pricing/surge → decision tables, boundary on multipliers.
   - Payments → contract tests, idempotency, partial failures, refunds.
   - Geolocation → simulated GPS, real-device, network-loss handling.
4. **Non-functional:** load (peak-hour surge), performance (match latency), security (PII, payments), resilience (driver-app offline).
5. **Strategy:** pyramid-heavy on unit/integration, contract tests between services, few E2E for the golden path, chaos testing for resilience, prod observability + synthetic monitors.
6. **Risk-based prioritisation** — payments & matching are highest risk.`,
          code: null,
        },
        {
          q: "How do you test microservices and asynchronous/event-driven systems?",
          level: "Lead",
          a: `**Microservices** challenges: many services, independent deploys, network unreliability.
- **Contract testing** (Pact) per service pair — catch breaking changes without full E2E.
- **Service virtualisation** to test one service with others mocked.
- **Component tests** in isolation; a thin layer of E2E for critical journeys only.
- Test **resilience**: timeouts, retries, circuit breakers, partial outages (chaos engineering).

**Async / event-driven (Kafka, queues):**
- No synchronous response — assert on the **eventual outcome** (poll the DB / consume the output topic) with a sensible timeout.
- Test **ordering, duplicates (idempotency), and lost messages**; replay dead-letter queues.
- Watch for **race conditions** and eventual-consistency windows.
- Verify **at-least-once vs. exactly-once** semantics are handled by the consumer.

**Senior signal:** "Async breaks the assert-immediately model — I design tests around eventual consistency and idempotency, and I poll for outcomes instead of sleeping."`,
          code: null,
        },
      ],
    },

    {
      id: "behavioral",
      name: "Behavioral & Leadership",
      icon: "🗣️",
      blurb: "Senior offers are won or lost here. Use STAR; show ownership and influence.",
      tags: ["senior", "lead", "must-know"],
      cards: [
        {
          q: "How should you structure behavioral answers? (The STAR method)",
          level: "All",
          a: `**STAR** keeps stories crisp and outcome-focused:
- **Situation** — brief context (1–2 sentences).
- **Task** — your specific responsibility/goal.
- **Action** — what *you* did (use "I", not "we"; show decisions and trade-offs).
- **Result** — the measurable outcome (numbers!), and what you learned.

**Senior add-on:** for leadership questions, layer in *influence without authority* and *business impact*. Prepare 5–6 flexible stories (a hard bug, a conflict, a failure, a process you improved, a mentoring moment, a high-pressure release) and map them to common prompts. Always quantify the result — "cut regression from 3 days to 4 hours," "reduced escaped defects 40%."`,
          code: null,
        },
        {
          q: "\"Tell me about a time you disagreed with a developer or manager about quality.\"",
          level: "Senior",
          a: `They're testing influence, professionalism, and judgement — not whether you "win."

Strong answer shape:
- **Situation:** a dev/PM wanted to ship with a known defect you considered risky.
- **Action:** you didn't dig in emotionally — you made the risk *objective*: data on impact, affected users, a reproducible demo, and *options* (fix now / feature-flag / fast-follow). You sought to understand their pressure (deadline, business driver) too.
- **Result:** a shared decision — ideally they agreed, or the business accepted a *documented* residual risk and you added monitoring + a fast-follow.

**Key senior signals:** you disagree with data not ego, you offer options not just objections, you respect that not every call is yours, and you "disagree and commit" once decided. Avoid villain stories.`,
          code: null,
        },
        {
          q: "\"A critical bug escaped to production. Walk me through what you did.\"",
          level: "Lead",
          a: `Show ownership and a blameless, systemic mindset.

1. **Immediate response:** help triage and mitigate first — rollback / hotfix / feature-flag off to stop user impact. Communicate clearly to stakeholders.
2. **Root cause:** reproduce, find the actual cause (and *why it escaped* — was there a coverage gap, a flaky test ignored, a missing env?).
3. **Blameless postmortem:** focus on the process hole, not the person. Document the timeline.
4. **Systemic fix:** add the missing test, close the coverage/process gap, add monitoring/alerting so it's *detected* next time even if it slips.
5. **Prevent recurrence:** is this a class of bug? Add a check to the pipeline.

**Senior signal:** "I care less about who wrote the bug and more about why our system let it through — and I fix the system, then add a regression test so it can't recur."`,
          code: null,
        },
        {
          q: "\"How do you mentor junior QAs and grow a team's quality culture?\"",
          level: "Lead",
          a: `A lead-level question about scaling *yourself*.

- **Mentoring:** pair on test design and automation, code-review their tests, set stretch goals, give specific feedback, and gradually delegate ownership of areas so they grow.
- **Knowledge sharing:** brown-bags, internal docs/runbooks, a "definition of a good bug report," automation patterns library.
- **Culture:** make quality a *team* property — devs own unit/integration tests, embed QA in refinement, celebrate prevented defects not just found ones.
- **Process:** establish standards (review checklists, flaky-test policy), but lead by influence and example, not mandate.

**Senior signal:** "I measure my success by the team's capability, not my personal bug count — a great senior QA makes everyone around them test better."`,
          code: null,
        },
      ],
    },
  ];

  /* ----- Mock-interview question pool (MCQ + short-answer) ----- */
  const quiz = [
    { q: "401 vs 403 — which means 'authenticated but not permitted'?", o: ["401 Unauthorized", "403 Forbidden", "400 Bad Request", "422 Unprocessable"], c: 1, e: "403 = known identity, no permission. 401 = not authenticated.", topic: "API" },
    { q: "In the test automation pyramid, which layer should have the FEWEST tests?", o: ["Unit", "Integration/API", "UI / End-to-End", "Static analysis"], c: 2, e: "UI/E2E are slow and brittle — keep them few and reserved for critical journeys.", topic: "Automation" },
    { q: "Which technique best targets off-by-one errors at the edge of valid ranges?", o: ["Equivalence Partitioning", "Boundary Value Analysis", "Decision Tables", "Exploratory testing"], c: 1, e: "BVA tests the edges (e.g., 17/18/19 for a min-age of 18) where off-by-one bugs hide.", topic: "Design" },
    { q: "A logo is misspelled on the homepage during a launch. This is best described as:", o: ["High severity, high priority", "High severity, low priority", "Low severity, high priority", "Low severity, low priority"], c: 2, e: "Trivial technically (low severity) but must be fixed now (high priority).", topic: "Design" },
    { q: "The single best measure of QA effectiveness is:", o: ["Number of test cases written", "Number of bugs filed", "Defect escape/leakage rate", "Lines of automation code"], c: 2, e: "Escaped defects measure what quality you actually delivered; counts are vanity metrics.", topic: "Strategy" },
    { q: "Which performance metric best represents your slowest users' experience?", o: ["Average latency", "Median (p50)", "p99 latency", "Total throughput"], c: 2, e: "p99 = the slowest 1%. Averages hide the painful tail.", topic: "Performance" },
    { q: "To find 'users who never placed an order', you'd use:", o: ["INNER JOIN", "LEFT JOIN ... WHERE orders.id IS NULL", "CROSS JOIN", "RIGHT JOIN with COUNT"], c: 1, e: "An anti-join: LEFT JOIN then filter for NULL on the right side.", topic: "SQL" },
    { q: "Which is the #1 OWASP risk category QA should test (authorization)?", o: ["Injection", "Broken Access Control", "Cryptographic Failures", "SSRF"], c: 1, e: "Broken Access Control (incl. IDOR) tops the OWASP list — test 'can user A access user B's data?'", topic: "Security" },
    { q: "The BEST first response to a flaky test is to:", o: ["Add a Thread.sleep", "Add automatic retries forever", "Replace fixed sleeps with explicit waits on a condition", "Delete it immediately"], c: 2, e: "Bad waits are the #1 flakiness cause; explicit condition-based waits fix most of them.", topic: "Automation" },
    { q: "Which testing type best uncovers a memory leak?", o: ["Spike testing", "Soak/Endurance testing", "Smoke testing", "Volume testing"], c: 1, e: "Sustained load over hours/days (soak) surfaces leaks and resource exhaustion.", topic: "Performance" },
    { q: "Contract testing (e.g., Pact) is primarily used to:", o: ["Replace all E2E tests", "Verify consumer/provider API agreement independently", "Load test an API", "Test the UI"], c: 1, e: "It validates the interface between services in isolation, avoiding full E2E cost/flakiness.", topic: "API" },
    { q: "WHERE vs HAVING: an aggregate like COUNT(*) > 1 must go in:", o: ["WHERE", "HAVING", "Either", "ORDER BY"], c: 1, e: "HAVING filters groups after aggregation; WHERE filters rows before grouping.", topic: "SQL" },
    { q: "'Shift-left testing' means:", o: ["Test only in production", "Move testing earlier in the SDLC", "Use left-aligned reports", "Test only the left navigation"], c: 1, e: "Catch defects earlier, where they're far cheaper to fix.", topic: "CICD" },
    { q: "An IDOR vulnerability is tested by:", o: ["Sending malformed JSON", "Replaying user A's request with user B's token but A's resource ID", "Load testing the endpoint", "Checking response time"], c: 1, e: "If user B can access user A's object by ID, object-level authorization is broken.", topic: "Security" },
    { q: "In async/event-driven systems, the correct assertion approach is to:", o: ["Assert immediately after publishing", "Use a fixed sleep then assert", "Poll for the eventual outcome with a timeout", "Skip assertions"], c: 2, e: "Eventual consistency means you wait for the outcome (poll), not assert synchronously.", topic: "SysDesign" },
    { q: "A good Page Object should expose:", o: ["Raw locators to tests", "Business behaviours (methods), hiding locators", "Database queries", "HTTP status codes"], c: 1, e: "Encapsulation: tests call login(); locators live in one place for easy maintenance.", topic: "Automation" },
    { q: "201 vs 200: a successful POST that creates a resource should return:", o: ["200 OK", "201 Created", "204 No Content", "202 Accepted"], c: 1, e: "201 signals a new resource was created (often with a Location header).", topic: "API" },
    { q: "Best technique when business logic depends on several interacting conditions:", o: ["Boundary Value Analysis", "Decision Table", "Smoke testing", "Soak testing"], c: 1, e: "Decision tables map every combination of conditions to expected actions.", topic: "Design" },
    { q: "Atomicity (the 'A' in ACID) guarantees:", o: ["Concurrent isolation", "All-or-nothing transactions", "Durability after crash", "Schema consistency"], c: 1, e: "A transaction fully completes or fully rolls back — no partial writes.", topic: "SQL" },
    { q: "A PR-stage CI quality gate should ideally complete in:", o: ["Under ~10 minutes", "About 1 hour", "Overnight only", "It doesn't matter"], c: 0, e: "Fast feedback keeps developers in flow; run heavy regression nightly.", topic: "CICD" },
    { q: "The STAR method's 'A' stands for:", o: ["Analysis", "Action (what YOU did)", "Assessment", "Agile"], c: 1, e: "Situation, Task, Action, Result — emphasise your specific actions with 'I'.", topic: "Behavioral" },
    { q: "Which is NOT a good reason to automate a test?", o: ["Stable, repetitive regression", "High-risk critical path", "A one-off throwaway check", "Data-driven validation"], c: 2, e: "Automating one-off or highly volatile tests has negative ROI.", topic: "Automation" },
    { q: "400 vs 422: a well-formed request that fails business validation returns:", o: ["400 Bad Request", "422 Unprocessable Entity", "404 Not Found", "500 Internal Error"], c: 1, e: "400 = malformed syntax; 422 = syntactically valid but semantically invalid.", topic: "API" },
    { q: "Risk in risk-based testing is calculated as:", o: ["Probability × Impact", "Cost × Time", "Coverage ÷ Effort", "Bugs × Severity"], c: 0, e: "Likelihood of failure times the impact if it fails — focus effort on the high-scorers.", topic: "Strategy" },
  ];

  window.QA_DATA = { tracks, quiz };
})();
