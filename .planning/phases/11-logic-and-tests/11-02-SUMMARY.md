---
phase: 11-logic-and-tests
plan: 02
subsystem: testing
tags: [vitest, srs, leitner, multiple-choice, fisher-yates, typescript]

# Dependency graph
requires:
  - phase: 11-logic-and-tests-01
    provides: Type definitions (Card, Progress, DeckId, ProgressRecord) and test infrastructure setup

provides:
  - Pure Leitner SRS functions: getCardKey, getTodayString, getNextReviewDate, isCardDue, advanceBox
  - Multiple-choice distractor generator: generateChoices + Choice interface with Fisher-Yates shuffle
  - Full unit test suites for both lib modules (21 new test cases)

affects: [11-logic-and-tests-03, phase-12-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "UTC-safe date math: use setUTCDate/getUTCDate when working with ISO date strings to avoid local timezone offset corruption"
    - "TDD sequence: write stub test file first (Plan 01), replace with full suite (Plan 02) when implementation is ready"
    - "Pool isolation: test data for pool-boundary tests must use distinguishable values (e.g., level prefix in card backs)"

key-files:
  created:
    - src/lib/srs.ts
    - src/lib/generateChoices.ts
  modified:
    - src/__tests__/lib/srs.test.ts
    - src/__tests__/lib/generateChoices.test.ts

key-decisions:
  - "addDays uses setUTCDate instead of setDate to avoid PST offset corrupting YYYY-MM-DD date math (new Date('2026-03-05') parses as UTC midnight, setDate uses local time, producing off-by-one in negative UTC-offset zones)"
  - "makeCards test helper includes level in back string (back-A1-0) so pool isolation test can distinguish A1 from A2 foil pools"
  - "Fisher-Yates shuffle used over biased .sort(() => Math.random()) — ported from v1.1 but upgraded"

patterns-established:
  - "Pure function lib modules: no localStorage, no React, no side effects — all date/random inputs come through standard JS globals so tests run without mocks"
  - "advanceBox undefined-current: new card treated as box 1 for advancement purposes (undefined → correct → box 2)"

requirements-completed: [SRS-01, SRS-02, TEST-02, TEST-03]

# Metrics
duration: 4min
completed: 2026-03-05
---

# Phase 11 Plan 02: SRS and generateChoices Implementation Summary

**Pure Leitner SRS functions and Fisher-Yates distractor generator implemented in TypeScript with 21 passing Vitest unit tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-05T09:40:01Z
- **Completed:** 2026-03-05T09:43:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `src/lib/srs.ts` created with 5 pure functions: getCardKey, getTodayString, getNextReviewDate, isCardDue, advanceBox — ported from v1.1 progress.js with UTC-safe date math fix
- `src/lib/generateChoices.ts` created with Fisher-Yates shuffle, generateChoices function, and Choice interface — upgraded from v1.1's biased sort
- Full test suites replace Wave 0 stubs: 15 cases for srs.ts, 6 cases for generateChoices.ts; all 4 test files (23 tests) pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement lib/srs.ts with full unit tests** - `9b09d52` (feat)
2. **Task 2: Implement lib/generateChoices.ts with full unit tests** - `65c8670` (feat)

**Plan metadata:** (see final commit)

_Note: TDD tasks — tests written first (RED), implementation second (GREEN)_

## Files Created/Modified

- `src/lib/srs.ts` - Pure Leitner SRS: box advancement, due-date intervals, card key format matching v1.1
- `src/lib/generateChoices.ts` - Multiple-choice generator: Fisher-Yates shuffle, foil pool isolation, graceful degradation when pool is small
- `src/__tests__/lib/srs.test.ts` - 15-case suite covering all 5 srs.ts exports
- `src/__tests__/lib/generateChoices.test.ts` - 6-case suite covering length, correct count, pool isolation, duplicates, small pool

## Decisions Made

- `addDays` uses `setUTCDate`/`getUTCDate` instead of `setDate`/`getDate` — `new Date('YYYY-MM-DD')` parses as UTC midnight; `setDate` uses local time, causing off-by-one errors in PST (UTC-8) where the date rolls to the previous day
- `makeCards` test helper includes level in back string (`back-A1-0`) so pool isolation test can distinguish A1 foils from A2 foils; original plan had same back values across levels which caused false failures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed UTC timezone off-by-one in addDays**
- **Found during:** Task 1 (srs.ts implementation, GREEN phase)
- **Issue:** `new Date('2026-03-05')` parses as UTC midnight (2026-03-05T00:00:00Z); in PST (UTC-8) this is March 4 local. `setDate(getDate() + 7)` used local date (4) + 7 = 11 = March 11 local = 2026-03-11T08:00Z, returning '2026-03-11' instead of '2026-03-12'
- **Fix:** Changed `date.setDate(date.getDate() + days)` to `date.setUTCDate(date.getUTCDate() + days)` so arithmetic stays in UTC
- **Files modified:** src/lib/srs.ts
- **Verification:** All 15 srs.test.ts cases pass including box 3 (7-day interval)
- **Committed in:** 9b09d52 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed pool isolation test data ambiguity in makeCards**
- **Found during:** Task 2 (generateChoices.ts implementation, GREEN phase)
- **Issue:** `makeCards(4, 'A1')` and `makeCards(4, 'A2')` both generated `back-0, back-1, back-2, back-3` — identical strings. Pool isolation test checked A1 foils against A2 backs set, got matches for unrelated cards, failing `expect(a2Backs.has(f.text)).toBe(false)`
- **Fix:** Changed helper to `back: \`back-${level}-${i}\`` producing `back-A1-0`/`back-A2-0` — now distinguishable
- **Files modified:** src/__tests__/lib/generateChoices.test.ts
- **Verification:** All 6 generateChoices.test.ts cases pass including pool isolation
- **Committed in:** 65c8670 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes corrected incorrect behavior — UTC date bug was a real correctness issue; test data bug prevented a valid test from passing. No scope creep.

## Issues Encountered

None beyond the auto-fixed items above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `src/lib/srs.ts` and `src/lib/generateChoices.ts` ready for import by Wave 3 React hooks (useSRS, useLevelFilter)
- All 4 test files pass (23 tests); build exits 0
- No blockers

---
*Phase: 11-logic-and-tests*
*Completed: 2026-03-05*
