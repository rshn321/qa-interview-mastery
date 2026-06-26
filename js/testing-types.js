/* ============================================================================
 * QA Interview Mastery — Catalog of Testing Types
 * "Every kind of testing", organized by category.
 * window.QA_TYPES is consumed by app.js -> types() view.
 * Each: { t: name, cat: categoryId, d: definition, eg?: when/example }
 * ==========================================================================*/
(function () {
  "use strict";

  const categories = [
    { id: "approach", name: "By Approach & Method", icon: "🧭" },
    { id: "levels", name: "By Test Level", icon: "🔺" },
    { id: "functional", name: "Functional Testing", icon: "⚙️" },
    { id: "nonfunc", name: "Non-Functional Testing", icon: "📊" },
    { id: "perf", name: "Performance Testing", icon: "⚡" },
    { id: "security", name: "Security Testing", icon: "🔒" },
    { id: "change", name: "Maintenance & Change", icon: "🔧" },
    { id: "dev", name: "Development-Driven", icon: "🧪" },
    { id: "specialized", name: "Specialized & Modern", icon: "🚀" },
    { id: "domain", name: "Domain / Platform-Specific", icon: "📱" },
  ];

  const types = [
    /* ── By Approach & Method ── */
    { t: "Black-Box Testing", cat: "approach", d: "Testing from requirements via inputs/outputs only, with no knowledge of internal code.", eg: "QA validating a feature against acceptance criteria." },
    { t: "White-Box Testing", cat: "approach", d: "Testing based on internal code structure — exercising statements, branches, conditions and paths.", eg: "Developer covering all branches of a function." },
    { t: "Gray-Box Testing", cat: "approach", d: "A hybrid using partial internal knowledge (e.g. DB schema, architecture) to design better black-box tests." },
    { t: "Static Testing", cat: "approach", d: "Examining work products without executing code — reviews, walkthroughs, inspections, and static analysis.", eg: "Code review, requirement review, linting." },
    { t: "Dynamic Testing", cat: "approach", d: "Testing that executes the software with inputs and verifies the actual behaviour/output." },
    { t: "Manual Testing", cat: "approach", d: "A human executes test cases and judges results, without automation tools." },
    { t: "Automated Testing", cat: "approach", d: "Tools/scripts execute tests, compare results and report — ideal for repetitive regression." },
    { t: "Positive Testing", cat: "approach", d: "Feeding valid, expected inputs to confirm the system works as intended ('happy path')." },
    { t: "Negative Testing", cat: "approach", d: "Feeding invalid/unexpected inputs to confirm the system fails gracefully and validates correctly." },
    { t: "Exploratory Testing", cat: "approach", d: "Simultaneous learning, test design and execution guided by tester intuition rather than scripts." },
    { t: "Ad-hoc Testing", cat: "approach", d: "Informal, unstructured testing without documentation, relying on tester experience to find defects." },
    { t: "Monkey Testing", cat: "approach", d: "Feeding random inputs/actions to see whether the system crashes — fully random, no test cases." },
    { t: "Gorilla Testing", cat: "approach", d: "Hammering a single module repeatedly and intensively to confirm its robustness." },
    { t: "Pair Testing", cat: "approach", d: "Two people (often tester + developer) testing the same feature together at one workstation." },

    /* ── By Test Level ── */
    { t: "Unit Testing", cat: "levels", d: "Testing the smallest testable unit (function/class) in isolation; usually written by developers." },
    { t: "Component Testing", cat: "levels", d: "Testing an individual module/component in isolation (often used interchangeably with unit testing)." },
    { t: "Integration Testing", cat: "levels", d: "Verifying that combined modules/services work together correctly; catches interface and contract defects." },
    { t: "Big Bang Integration", cat: "levels", d: "Integrating all modules at once then testing together — fast to set up but hard to localize defects." },
    { t: "Top-Down Integration", cat: "levels", d: "Integrating from top-level modules downward, using stubs for lower modules not yet ready." },
    { t: "Bottom-Up Integration", cat: "levels", d: "Integrating from low-level modules upward, using drivers to simulate higher-level callers." },
    { t: "Sandwich / Hybrid Integration", cat: "levels", d: "Combining top-down and bottom-up integration, meeting in the middle layer." },
    { t: "System Testing", cat: "levels", d: "Testing the fully integrated application end-to-end against the specified requirements." },
    { t: "System Integration Testing", cat: "levels", d: "Verifying interactions between the system and external/third-party systems and interfaces.", eg: "SIT across payment gateway + ERP + CRM." },
    { t: "End-to-End Testing", cat: "levels", d: "Testing a complete real-world user journey across the whole stack as a user would experience it." },
    { t: "Acceptance Testing (UAT)", cat: "levels", d: "Final validation by business/end users that the software meets the real need; the gate to release." },
    { t: "Alpha Testing", cat: "levels", d: "Acceptance testing performed in-house by internal staff before external release." },
    { t: "Beta Testing", cat: "levels", d: "Testing by real users in their own environment before general release, to gather real-world feedback." },
    { t: "Operational Acceptance Testing", cat: "levels", d: "Validating operational readiness — backups, recovery, maintenance, security procedures (OAT)." },
    { t: "Contract Acceptance Testing", cat: "levels", d: "Confirming the software meets the criteria agreed in a contract before sign-off." },
    { t: "Regulatory Acceptance Testing", cat: "levels", d: "Confirming the software complies with legal/regulatory standards before release." },

    /* ── Functional Testing ── */
    { t: "Functional Testing", cat: "functional", d: "Verifying the system does what it should — every feature, input and business rule meets requirements." },
    { t: "Smoke Testing", cat: "functional", d: "A wide, shallow check that a new build's critical paths work ('build verification'); if it fails, reject the build." },
    { t: "Sanity Testing", cat: "functional", d: "A narrow, deep check of a specific fix or feature after a minor change, before deeper testing." },
    { t: "Regression Testing", cat: "functional", d: "Re-running existing tests to confirm new changes haven't broken previously working functionality." },
    { t: "Re-testing / Confirmation Testing", cat: "functional", d: "Verifying that a specific reported defect has actually been fixed (distinct from regression)." },
    { t: "Interface Testing", cat: "functional", d: "Verifying communication and data exchange between two components or systems through their interface." },
    { t: "API Testing", cat: "functional", d: "Testing application programming interfaces directly — status codes, schema, auth, errors — below the UI." },
    { t: "Database Testing", cat: "functional", d: "Validating data integrity, CRUD operations, schema, stored procedures, triggers and constraints." },
    { t: "GUI / UI Testing", cat: "functional", d: "Verifying graphical interface elements — layout, fonts, alignment, controls — appear and behave correctly." },
    { t: "Backend Testing", cat: "functional", d: "Testing the server side: databases, APIs and business logic beneath the UI." },
    { t: "Boundary Value Testing", cat: "functional", d: "Testing at the edges of input ranges (min, min±1, max, max±1) where off-by-one defects cluster." },
    { t: "Use Case Testing", cat: "functional", d: "Deriving tests from use cases — the end-to-end transactions a user performs with the system." },
    { t: "Globalization Testing", cat: "functional", d: "Ensuring software works correctly across all target regions, languages and cultural settings worldwide." },
    { t: "Internationalization Testing (i18n)", cat: "functional", d: "Verifying the product is built to support multiple locales without code changes (unicode, RTL layout)." },
    { t: "Localization Testing (l10n)", cat: "functional", d: "Verifying correct adaptation to a specific locale — language, currency, date formats, cultural norms." },
    { t: "ETL / Data Pipeline Testing", cat: "functional", d: "Validating Extract-Transform-Load: completeness, transformation rules, integrity and source-to-target reconciliation." },

    /* ── Non-Functional Testing ── */
    { t: "Non-Functional Testing", cat: "nonfunc", d: "Verifying quality attributes — how well the system performs — rather than what it does." },
    { t: "Usability Testing", cat: "nonfunc", d: "Evaluating how easy, intuitive and satisfying the product is for real users to use." },
    { t: "Accessibility Testing", cat: "nonfunc", d: "Verifying the product is usable by people with disabilities, against standards like WCAG (screen readers, contrast, keyboard nav)." },
    { t: "Compatibility Testing", cat: "nonfunc", d: "Checking the software works across different browsers, devices, OSes and configurations." },
    { t: "Cross-Browser Testing", cat: "nonfunc", d: "Compatibility testing focused on consistent behaviour across web browsers (Chrome, Firefox, Safari, Edge)." },
    { t: "Cross-Platform Testing", cat: "nonfunc", d: "Verifying consistent behaviour across operating systems (Windows, macOS, Linux, Android, iOS)." },
    { t: "Reliability Testing", cat: "nonfunc", d: "Verifying the system performs failure-free for a specified period under stated conditions." },
    { t: "Recovery Testing", cat: "nonfunc", d: "Verifying the system recovers gracefully from crashes, network loss and hardware failure." },
    { t: "Failover Testing", cat: "nonfunc", d: "Verifying the system switches to a backup/redundant system without data loss when a component fails." },
    { t: "Installation Testing", cat: "nonfunc", d: "Verifying the software installs, upgrades and uninstalls correctly across environments." },
    { t: "Configuration Testing", cat: "nonfunc", d: "Verifying the system behaves correctly under different hardware/software configurations and settings." },
    { t: "Compliance / Conformance Testing", cat: "nonfunc", d: "Verifying the system adheres to standards, regulations or internal guidelines (e.g. GDPR, HIPAA, ISO)." },
    { t: "Maintainability Testing", cat: "nonfunc", d: "Assessing how easily the software can be modified, corrected or enhanced." },
    { t: "Portability Testing", cat: "nonfunc", d: "Assessing how easily the software can be moved to different environments or platforms." },
    { t: "Efficiency Testing", cat: "nonfunc", d: "Measuring how well the system uses resources (CPU, memory, network) for the work it performs." },

    /* ── Performance Testing ── */
    { t: "Performance Testing", cat: "perf", d: "Evaluating speed, responsiveness and stability under a given workload (the parent category)." },
    { t: "Load Testing", cat: "perf", d: "Testing at expected concurrent load to verify response time and throughput meet SLAs." },
    { t: "Stress Testing", cat: "perf", d: "Pushing beyond capacity to find the breaking point and observe the failure mode (graceful vs crash)." },
    { t: "Spike Testing", cat: "perf", d: "Applying a sudden sharp surge in load to test autoscaling and recovery (e.g. a flash sale)." },
    { t: "Soak / Endurance Testing", cat: "perf", d: "Sustained load over hours/days to expose memory leaks and resource exhaustion." },
    { t: "Volume Testing", cat: "perf", d: "Testing with large volumes of data to evaluate database and query performance." },
    { t: "Scalability Testing", cat: "perf", d: "Verifying capacity grows appropriately (ideally linearly) as resources are added." },
    { t: "Concurrency Testing", cat: "perf", d: "Testing simultaneous access by many users/threads to expose race conditions, deadlocks and lost updates." },

    /* ── Security Testing ── */
    { t: "Security Testing", cat: "security", d: "Verifying the system protects data and resists attack — confidentiality, integrity, availability." },
    { t: "Vulnerability Scanning", cat: "security", d: "Automated scanning for known weaknesses (outdated libs, misconfigurations, open ports)." },
    { t: "Penetration Testing", cat: "security", d: "Authorised simulated attacks that find and exploit vulnerabilities before real attackers do." },
    { t: "Ethical Hacking", cat: "security", d: "Authorised offensive security probing of a system to discover exploitable weaknesses." },
    { t: "SAST", cat: "security", d: "Static Application Security Testing — analysing source code for vulnerabilities without running it." },
    { t: "DAST", cat: "security", d: "Dynamic Application Security Testing — probing the running application for vulnerabilities." },
    { t: "Risk Assessment / Security Audit", cat: "security", d: "Systematic review of security controls, policies and configuration against a standard." },

    /* ── Maintenance & Change ── */
    { t: "Maintenance Testing", cat: "change", d: "Testing changes to a system already in production — fixes, enhancements, migrations, retirements." },
    { t: "Confirmation Testing", cat: "change", d: "Re-running the failing test after a fix to confirm the original defect is resolved." },
    { t: "Impact Analysis", cat: "change", d: "Determining what areas a change affects, to scope the regression set efficiently." },
    { t: "Smoke (Build Verification)", cat: "change", d: "An automated smoke suite run on each build to confirm it's stable enough for further testing." },

    /* ── Development-Driven ── */
    { t: "Test-Driven Development (TDD)", cat: "dev", d: "Write a failing test first, then minimal code to pass it, then refactor (red-green-refactor)." },
    { t: "Behavior-Driven Development (BDD)", cat: "dev", d: "Executable specs in plain language (Gherkin Given/When/Then) shared by business, dev and QA." },
    { t: "Acceptance Test-Driven Development (ATDD)", cat: "dev", d: "The team defines acceptance tests collaboratively before development, driving the implementation." },
    { t: "Specification by Example", cat: "dev", d: "Deriving requirements and tests from concrete examples agreed with stakeholders." },
    { t: "Unit-Test-First / Component Tests", cat: "dev", d: "Developer-authored automated checks at the base of the pyramid, run on every change in CI." },

    /* ── Specialized & Modern ── */
    { t: "A/B Testing", cat: "specialized", d: "Comparing two variants with real users to measure which performs better on a metric." },
    { t: "Canary Testing", cat: "specialized", d: "Releasing a change to a small subset of users first, monitoring, then expanding if healthy." },
    { t: "Chaos Engineering", cat: "specialized", d: "Deliberately injecting failures in production-like environments to test resilience." },
    { t: "Mutation Testing", cat: "specialized", d: "Introducing small code mutations to check whether the test suite detects them — measures test quality." },
    { t: "Fuzz Testing (Fuzzing)", cat: "specialized", d: "Feeding large amounts of malformed/random data to find crashes, leaks and security holes." },
    { t: "Property-Based Testing", cat: "specialized", d: "Asserting that properties hold across many auto-generated inputs, rather than fixed examples." },
    { t: "Contract Testing", cat: "specialized", d: "Verifying a consumer and provider agree on the API interface independently (e.g. Pact), avoiding full E2E." },
    { t: "Visual Regression Testing", cat: "specialized", d: "Comparing screenshots against a baseline to catch unintended visual/UI changes." },
    { t: "Snapshot Testing", cat: "specialized", d: "Saving a rendered output and asserting future runs match the stored snapshot." },
    { t: "Model-Based Testing", cat: "specialized", d: "Generating test cases automatically from a model of the system's expected behaviour." },
    { t: "Risk-Based Testing", cat: "specialized", d: "Prioritising test effort by risk (probability × impact) so high-risk areas get the deepest testing." },
    { t: "Data-Driven Testing", cat: "specialized", d: "Running the same test logic against multiple data sets stored externally (CSV, Excel, JSON)." },
    { t: "Keyword-Driven Testing", cat: "specialized", d: "Building tests from reusable keywords/actions, separating test logic from test design." },
    { t: "Pairwise / Combinatorial Testing", cat: "specialized", d: "Covering all pairs of input values to slash combinations while keeping high defect-detection." },
    { t: "Continuous Testing", cat: "specialized", d: "Running automated tests continuously throughout the CI/CD pipeline for fast quality feedback." },
    { t: "Testing in Production (Shift-Right)", cat: "specialized", d: "Validating in the live environment via canary, feature flags, observability and synthetic monitoring." },
    { t: "Synthetic Monitoring", cat: "specialized", d: "Running scripted transactions against production continuously to detect issues before users do." },
    { t: "Agile Testing", cat: "specialized", d: "Testing embedded within iterative development — in-sprint, whole-team-owned, continuous." },

    /* ── Domain / Platform-Specific ── */
    { t: "Mobile Application Testing", cat: "domain", d: "Testing mobile apps across devices, OS versions, networks, gestures, interruptions and battery/perf." },
    { t: "Responsive / Cross-Device Testing", cat: "domain", d: "Verifying layout and behaviour adapt correctly across screen sizes and devices." },
    { t: "Cloud Testing", cat: "domain", d: "Testing applications and infrastructure hosted in the cloud — scalability, multi-tenancy, services." },
    { t: "Big Data Testing", cat: "domain", d: "Validating processing, quality and performance of very large datasets across distributed systems." },
    { t: "Analytics / Reporting UI Testing", cat: "domain", d: "Validating dashboards: sorting, filtering, charts, drilldowns and UI-to-database data accuracy." },
    { t: "Game Testing", cat: "domain", d: "Testing video games — functionality, performance, graphics, multiplayer, balance and exploits." },
    { t: "IoT / Embedded Testing", cat: "domain", d: "Testing connected devices and firmware — hardware-software integration, connectivity, power, sensors." },
    { t: "Cookie / Session Testing", cat: "domain", d: "Verifying correct creation, expiry and handling of cookies and user sessions (timeouts, concurrent logins)." },
    { t: "Email / Notification Testing", cat: "domain", d: "Verifying transactional emails/push/SMS — triggers, content, links, rendering and deliverability." },
    { t: "Localization (Language) Testing", cat: "domain", d: "Verifying translated UIs render correctly without truncation, encoding or layout breakage." },
  ];

  window.QA_TYPES = { categories, types };
})();
