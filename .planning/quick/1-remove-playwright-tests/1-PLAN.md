---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - playwright.config.js
  - e2e/deck-selection.spec.js
  - e2e/flashcard.spec.js
  - e2e/language-selection.spec.js
  - e2e/reset-progress.spec.js
autonomous: true
requirements: []

must_haves:
  truths:
    - "No Playwright test files exist in the repo"
    - "No Playwright config or dependency remains"
    - "Unit tests (Vitest) still run and pass"
  artifacts:
    - path: "package.json"
      provides: "devDependencies without @playwright/test"
      contains: "vitest"
    - path: "e2e/"
      provides: "directory removed"
  key_links:
    - from: "package.json"
      to: "node_modules"
      via: "bun install after removal"
      pattern: "playwright"
---

<objective>
Remove Playwright E2E tests and all related configuration from the project.

Purpose: Simplify the project — Playwright is not being used actively and adds maintenance overhead. Vitest unit tests remain as the primary test suite.
Output: No e2e/ directory, no playwright.config.js, no @playwright/test dependency. Unit tests still pass.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Delete Playwright files and config</name>
  <files>
    e2e/deck-selection.spec.js
    e2e/flashcard.spec.js
    e2e/language-selection.spec.js
    e2e/reset-progress.spec.js
    playwright.config.js
  </files>
  <action>
    Delete the following:
    - The entire `e2e/` directory (all 4 spec files)
    - `playwright.config.js` in the project root

    Do NOT touch `playwright-report/` — it is already gitignored and can remain locally.

    Use the Bash tool to remove:
    ```
    rm -rf /Users/jbtellez/genies/purolingua/e2e
    rm /Users/jbtellez/genies/purolingua/playwright.config.js
    ```
  </action>
  <verify>
    <automated>ls /Users/jbtellez/genies/purolingua/e2e 2>&1 | grep "No such file" && ls /Users/jbtellez/genies/purolingua/playwright.config.js 2>&1 | grep "No such file"</automated>
  </verify>
  <done>e2e/ directory and playwright.config.js no longer exist in the project.</done>
</task>

<task type="auto">
  <name>Task 2: Remove @playwright/test from package.json and reinstall</name>
  <files>package.json</files>
  <action>
    Remove `@playwright/test` from `devDependencies` in `package.json`. The entry to remove is:
    ```
    "@playwright/test": "^1.58.2",
    ```

    After editing package.json, run `bun install` to update the lockfile and remove the Playwright package from node_modules.

    Do NOT remove `@types/node` — it is used by other tooling.
  </action>
  <verify>
    <automated>cd /Users/jbtellez/genies/purolingua && node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8')); process.exit(p.devDependencies['@playwright/test'] ? 1 : 0)" && echo "playwright removed from package.json"</automated>
  </verify>
  <done>package.json has no @playwright/test entry. bun install has run and lockfile is updated.</done>
</task>

<task type="auto">
  <name>Task 3: Verify unit tests still pass</name>
  <files></files>
  <action>
    Run the Vitest unit test suite to confirm nothing was broken by the removal.

    Command: `cd /Users/jbtellez/genies/purolingua && bun run test`

    All tests should pass. Do not proceed if any tests fail — investigate and fix before marking done.
  </action>
  <verify>
    <automated>cd /Users/jbtellez/genies/purolingua && bun run test</automated>
  </verify>
  <done>All Vitest unit tests pass. No Playwright reference remains in the project.</done>
</task>

</tasks>

<verification>
- `e2e/` directory does not exist
- `playwright.config.js` does not exist
- `package.json` has no `@playwright/test` entry
- `bun run test` passes (Vitest only)
</verification>

<success_criteria>
Playwright is fully removed. Running `bun run test` executes only Vitest unit tests and they all pass. No E2E test infrastructure remains.
</success_criteria>

<output>
After completion, create `.planning/quick/1-remove-playwright-tests/1-SUMMARY.md`
</output>
