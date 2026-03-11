---
phase: 17-qa-data
plan: 03
subsystem: testing
tags: [react, hooks, srs, leitner, localStorage, vitest, tdd]

# Dependency graph
requires:
  - phase: 17-01
    provides: QACard/ScenarioId/ProgressRecord types in src/types/index.ts
  - phase: 17-02
    provides: Q&A scenario card data (src/data/qa/)
  - phase: 11-logic-and-tests
    provides: useSRS.ts localStorage pattern and srs.ts pure functions
provides:
  - useQASRS hook (src/hooks/useQASRS.ts) with dueCards, updateCard, isCardDueForScenario, hasProgress, progress
  - Full Vitest test suite (12 tests) covering SRS math, level filtering, key isolation, language isolation
affects: [18-qa-browser, 19-qa-session]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "qa_{scenarioId}_{cardId} key prefix guarantees no collision with Rephrase keys ({deckId}_{index})"
    - "useQASRS mirrors useSRS localStorage pattern — shared {lang}-progress key, disjoint key namespaces"
    - "useMemo for dueCards with [cards, activeLevels, progress, scenarioId] deps — reactive to all filter dimensions"

key-files:
  created:
    - src/hooks/useQASRS.ts
    - src/__tests__/hooks/useQASRS.test.tsx
  modified: []

key-decisions:
  - "Hook signature uses (lang, scenarioId, cards, activeLevels) — scenarioId needed at memo time to build Q&A keys"
  - "updateCard(cardId, isCorrect) — scenarioId captured via closure, not passed per-call — matches caller ergonomics"
  - "Q&A and Rephrase progress coexist in same {lang}-progress record — 'qa_' prefix is the collision firewall"

patterns-established:
  - "Q&A key format: qa_{scenarioId}_{cardId} — all Phase 18/19 Q&A storage must use this format"
  - "TDD RED-GREEN pattern: test file committed as RED, implementation committed as GREEN in separate commits"

requirements-completed: [QAFLOW-06]

# Metrics
duration: 15min
completed: 2026-03-09
---

# Phase 17 Plan 03: useQASRS Hook Summary

**useQASRS hook with qa-prefixed Leitner SRS keys, activeLevels filtering, and 12 passing Vitest tests covering all SRS math and isolation behaviors**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-09T23:00:00Z
- **Completed:** 2026-03-09T23:11:57Z
- **Tasks:** 2 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Wrote 12 failing Vitest tests covering initial state, level filtering, updateCard, key isolation, and language isolation (RED)
- Implemented useQASRS hook using loadFromStorage/saveToStorage pattern from useSRS, with qa-prefixed keys and activeLevels memo filtering (GREEN)
- All 12 tests pass; TypeScript compiles cleanly for hook and test files

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing Vitest tests for useQASRS (RED phase)** - `6af8b7d` (test)
2. **Task 2: Implement useQASRS until all tests pass (GREEN phase)** - `5f59d49` (feat)

**Plan metadata:** (docs commit — see final_commit step)

_Note: TDD tasks have two commits (test RED → feat GREEN)_

## Files Created/Modified
- `src/hooks/useQASRS.ts` - Q&A mode SRS hook; accepts (lang, scenarioId, cards, activeLevels); returns dueCards, updateCard, isCardDueForScenario, hasProgress, progress
- `src/__tests__/hooks/useQASRS.test.tsx` - 12-test Vitest suite covering all SRS behaviors with inline mockCards fixture

## Decisions Made
- Hook signature includes `scenarioId` as a parameter (not just inside `updateCard`) because `useMemo` for `dueCards` needs it to build Q&A card keys at filter time
- `updateCard(cardId, isCorrect)` omits `scenarioId` from call site — it's captured from hook scope, matching the ergonomic pattern of `useSRS.updateCard(deckId, cardIndex, isCorrect)` where deckId is per-call
- Q&A and Rephrase progress share the same `{lang}-progress` localStorage record — the `qa_` prefix is a reliable namespace separator (Rephrase keys are `{deckId}_{index}` which can never start with `qa_`)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript error in `src/__tests__/components/FeedbackMessage.test.tsx` (uses `vi` without import, from Phase 15-02). Out of scope — logged to deferred items. The useQASRS hook and its test file are type-clean.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `useQASRS` is importable via `@/hooks/useQASRS` — Phase 18 (Q&A browser) can call it identically to how Phase 12/13 components call `useSRS`
- `progress` record exposed — Phase 18 badge counts can derive due-card totals from it without additional hooks
- Key format `qa_{scenarioId}_{cardId}` is tested and locked — Phase 19 session writes must use the same format (already guaranteed by the hook)

---
*Phase: 17-qa-data*
*Completed: 2026-03-09*

## Self-Check: PASSED
- `src/hooks/useQASRS.ts` — FOUND
- `src/__tests__/hooks/useQASRS.test.tsx` — FOUND
- Commit `6af8b7d` — FOUND (test RED phase)
- Commit `5f59d49` — FOUND (feat GREEN phase)
- All 12 tests pass: confirmed by `bun run test -- useQASRS`
