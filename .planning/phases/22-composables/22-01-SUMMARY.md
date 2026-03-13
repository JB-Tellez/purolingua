---
phase: 22-composables
plan: 01
subsystem: testing
tags: [vitest, nuxt, vue, typescript, srs, composables, tdd]

# Dependency graph
requires:
  - phase: 21-pure-logic-and-routing-skeleton
    provides: Nuxt 4 scaffold with unit and nuxt Vitest projects configured
provides:
  - app/lib/srs.ts with ~/types import path (composable-compatible SRS pure logic)
  - app/lib/generateChoices.ts with ~/types import path (composable-compatible choice generation)
  - app/types/index.ts (TypeScript types accessible via ~/types alias)
  - tests/nuxt/useSRS.test.ts (COMP-01 test contract, RED)
  - tests/nuxt/useLevelFilter.test.ts (COMP-02 test contract, RED)
  - tests/nuxt/useQASRS.test.ts (COMP-03 test contract, RED)
  - tests/nuxt/useVoiceRecognition.test.ts (COMP-04 test contract, RED)
affects: [22-02, 22-03, 22-04, 22-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "mountSuspended wrapper pattern: defineComponent with setup() returning composable, template: '<div />'"
    - "TDD RED state: import composable path before composable file exists — test runner reports import error"
    - "~/types alias for app/types/index.ts in all app/composables/* and app/lib/* files"

key-files:
  created:
    - app/lib/srs.ts
    - app/lib/generateChoices.ts
    - app/types/index.ts
    - tests/nuxt/useSRS.test.ts
    - tests/nuxt/useLevelFilter.test.ts
    - tests/nuxt/useQASRS.test.ts
    - tests/nuxt/useVoiceRecognition.test.ts
  modified: []

key-decisions:
  - "app/lib/ and app/types/ are copies of src/lib/ and src/types/ with @/types replaced by ~/types — composables must not import from src/ directly"
  - "Test wrapper pattern: defineComponent({ setup() { return composable(args) }, template: '<div />' }) mounted with mountSuspended"
  - "useLevelFilter test wrapper passes hasProgress as ref(boolean) per locked decision from 22-CONTEXT.md"
  - "useQASRS test wrapper passes activeLevels as plain Level[] (matching React hook signature)"
  - "useVoiceRecognition tests use inline MockSpeechRecognition class (no shared setup file needed)"

patterns-established:
  - "mountSuspended wrapper: defineComponent + setup() + template '<div />' for composable testing in Nuxt env"
  - "TDD RED: import from composable path before file exists — Vite reports 'Failed to resolve import' as expected RED"

requirements-completed: [COMP-01, COMP-02, COMP-03, COMP-04]

# Metrics
duration: 12min
completed: 2026-03-12
---

# Phase 22 Plan 01: Foundation — Lib, Types, and Test Stubs Summary

**SRS pure logic and TypeScript types copied into app/ with ~/types imports; four mountSuspended test stubs written in RED state ready for composable implementation in Plans 02-05**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-12T17:14:00Z
- **Completed:** 2026-03-12T17:26:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Copied `src/lib/srs.ts` and `src/lib/generateChoices.ts` into `app/lib/` with `@/types` replaced by `~/types` so composables can import via Nuxt's `~` alias
- Created `app/types/index.ts` as verbatim copy of `src/types/index.ts` — full domain type surface available at `~/types`
- Wrote 30 test cases across 4 test files in `tests/nuxt/` covering all behavioral contracts from the React hooks
- Confirmed RED state: unit tests (21/21 pass), nuxt tests (smoke passes, 4 new files fail with import errors as expected)

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy lib and types into app/** - `1d6c78a` (feat)
2. **Task 2: Write failing test stubs for all four composables** - `51ef515` (test)

## Files Created/Modified
- `app/lib/srs.ts` - SRS pure logic (getCardKey, advanceBox, isCardDue, getTodayString, getNextReviewDate) with ~/types import
- `app/lib/generateChoices.ts` - Fisher-Yates choice generation with ~/types import
- `app/types/index.ts` - Full domain types (Lang, Level, DeckId, ScenarioId, Progress, ProgressRecord, QACard, Scenario)
- `tests/nuxt/useSRS.test.ts` - 7 tests: initial state, updateCard persistence, language isolation, isCardDueForDeck
- `tests/nuxt/useLevelFilter.test.ts` - 9 tests: defaults, FLTR-06 guard, localStorage persistence
- `tests/nuxt/useQASRS.test.ts` - 11 tests: initial state, level filtering, updateCard, key isolation
- `tests/nuxt/useVoiceRecognition.test.ts` - 3 tests: isSupported detection, isListening state

## Decisions Made
- `app/lib/` holds copies (not symlinks or re-exports) of `src/lib/` files — composables import from `~/lib/` only, never from `src/`
- Test wrapper factory uses `defineComponent` with `setup()` returning composable return value — the pattern `mountSuspended` requires a full component
- `useLevelFilter` test wrapper passes `ref(hasProgress)` per the locked decision that `hasProgress` is `Ref<boolean>` parameter
- Inline `MockSpeechRecognition` class per test file — no shared setup needed for these tests

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plans 22-02 through 22-05 can now run in parallel — each creates one composable file and its tests turn GREEN
- `app/lib/srs.ts` and `app/types/index.ts` provide the import surface all composables need
- All 4 test contracts are locked in — behavioral parity with React hooks is enforced

---
*Phase: 22-composables*
*Completed: 2026-03-12*
