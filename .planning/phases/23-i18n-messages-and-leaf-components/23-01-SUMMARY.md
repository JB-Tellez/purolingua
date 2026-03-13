---
phase: 23-i18n-messages-and-leaf-components
plan: 01
subsystem: testing
tags: [vitest, vue, nuxt, tdd, components]

# Dependency graph
requires:
  - phase: 22-composables
    provides: "mountSuspended test pattern, app/types Level type"
provides:
  - "Six RED test files defining contracts for ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips, SiteHeader"
affects:
  - 23-02
  - 23-03

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "mountSuspended with dynamic import for each it() block — avoids stale component cache"
    - "data-* attribute selectors for semantic test targeting (data-speaker, data-back, data-locale-switcher, data-reset)"

key-files:
  created:
    - tests/nuxt/ChoiceButton.test.ts
    - tests/nuxt/AudioButton.test.ts
    - tests/nuxt/MicButton.test.ts
    - tests/nuxt/FeedbackMessage.test.ts
    - tests/nuxt/LevelFilterChips.test.ts
    - tests/nuxt/SiteHeader.test.ts
  modified: []

key-decisions:
  - "data-* attribute selectors used for speaker span, back link, locale switcher, and reset button — avoids brittle class/text matching"
  - "Per-test dynamic import inside each it() block — matches smoke.test.ts established pattern"
  - "SiteHeader route option passed to mountSuspended for path-depth back-button tests"

patterns-established:
  - "RED test stubs import components that don't exist yet — all fail with Failed to resolve import (not syntax error)"
  - "LevelFilterChips emitted value typed as Level[] to verify correct type contract"

requirements-completed: [UI-01, UI-02]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 23 Plan 01: i18n Messages and Leaf Components — Test Stubs Summary

**Six RED test files defining component contracts for ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips, and SiteHeader using mountSuspended TDD pattern**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T01:11:56Z
- **Completed:** 2026-03-13T01:15:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Five leaf-component test stubs (Task 1) define emits, props, disabled state, CSS class, and accessibility contracts
- SiteHeader test stub (Task 2) covers logo, back button path-depth logic, locale switcher, and reset button
- All six files fail with `Failed to resolve import` (not syntax errors) — clean RED phase
- Existing 32 passing tests unaffected

## Task Commits

Each task was committed atomically:

1. **Task 1: Write test stubs for leaf components** - `ffe91da` (test)
2. **Task 2: Write test stub for SiteHeader** - `803fb53` (test)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified
- `tests/nuxt/ChoiceButton.test.ts` — click/speak emits, disabled state when prop or state != idle, keyboard events on speaker span
- `tests/nuxt/AudioButton.test.ts` — aria-label presence, SSR safety guard (no crash on mount)
- `tests/nuxt/MicButton.test.ts` — press emit, mic-btn--listening/error CSS classes, clean idle state
- `tests/nuxt/FeedbackMessage.test.ts` — null hides element, p[role=status] rendered per state, color classes per state
- `tests/nuxt/LevelFilterChips.test.ts` — two buttons, active class presence, update:activeLevels emit with correct values
- `tests/nuxt/SiteHeader.test.ts` — logo text, back button hidden at / and /it, visible at /it/rephrase, links to /it, locale switcher, reset button

## Decisions Made
- Used `data-*` attribute selectors (`data-speaker`, `data-back`, `data-locale-switcher`, `data-reset`) so Plan 02 implementations must add those attributes — avoids brittle text or class matchers
- Dynamic import placed inside each `it()` block following the smoke.test.ts pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All six test files define the full component contract Plans 02–03 must satisfy
- Plans 02 and 03 can begin implementing components against these RED tests
- `data-*` attributes required by tests are documented per-component in each test file

---
*Phase: 23-i18n-messages-and-leaf-components*
*Completed: 2026-03-13*
