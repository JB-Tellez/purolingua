---
phase: 07-filter-logic
plan: 04
subsystem: testing
tags: [vitest, spaced-repetition, filter, vanilla-js, tdd, level-filter]

# Dependency graph
requires:
  - phase: 07-02
    provides: filter-logic.test.js with FLTR-02 through FLTR-05 tests (activeLevels state, localStorage persistence, hasProgressData)
  - phase: 07-03
    provides: getDueCount(deck, activeLevels) and generateChoices(correctCard, filteredCards) implementations with identical level predicates

provides:
  - FLTR-07 regression net: getDueCount level-filtered count tests (A1-only, A2-only, combined, count-parity)
  - FLTR-08 regression net: generateChoices foil-contamination tests (A1-only foils, A2-only foils, no cross-level foils)
  - Complete Phase 7 test coverage: all 7 FLTR requirements (FLTR-02 through FLTR-08) covered in filter-logic.test.js

affects: [08-filter-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Count-parity test pattern: compute expected count independently (filter by level, count new cards) then assert getDueCount matches — verifies badge and session queue agree"
    - "Foil-contamination test pattern: assert each foil's text exists in the filtered pool and NOT in the other level's pool"
    - "loadProgress() in beforeEach: ensures module-level progress variable is initialised from empty localStorage before getDueCount calls"

key-files:
  created: []
  modified:
    - tests/filter-logic.test.js

key-decisions:
  - "loadProgress() placed in a nested beforeEach inside getDueCount describe block (not only in top-level beforeEach) — makes the dependency on progress initialisation explicit and co-located with the tests that need it"
  - "mockLevelDeck defined at module scope (not inside each describe) — shared fixture; both FLTR-07 and FLTR-08 use it; avoids duplication"
  - "FLTR-08 constants (a1Cards, a2Cards, a1Card, a2Card) declared at describe scope (not in beforeEach) — generateChoices has no side effects, no reset needed"

patterns-established:
  - "Level-filtered test fixture: A2 cards at indices 0-3, A1 at indices 4-7 — mirrors real deck append pattern"
  - "Full-coverage assertion for foil contamination: check foil IS in correct pool AND IS NOT in other pool"

requirements-completed: [FLTR-07, FLTR-08]

# Metrics
duration: 6min
completed: 2026-02-23
---

# Phase 7 Plan 04: Count Parity and Foil Filtering Tests Summary

**FLTR-07 count-parity and FLTR-08 foil-contamination test suite added to filter-logic.test.js — 8 new tests verify getDueCount level filtering and cross-level-free foil pools; Phase 7 test coverage complete**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-23T16:23:20Z
- **Completed:** 2026-02-23T16:29:58Z
- **Tasks:** 1 (TDD — single test commit; code already green from Plan 03)
- **Files modified:** 1

## Accomplishments
- Added `mockLevelDeck` fixture with 8 cards (4 A2 at indices 0-3, 4 A1 at indices 4-7) mirroring real deck structure
- Added `getDueCount level filtering — FLTR-07` describe block with 4 tests: A1-only count (4), A2-only count (4), combined count (8), and count-parity assertion
- Added `generateChoices foil filtering — FLTR-08` describe block with 4 tests: A1-only foil pool, A2-only foil pool, and no cross-level contamination
- Extended imports: `getDueCount` from progress.js and `generateChoices` from deck-utils.js
- Total test coverage: 18 tests in filter-logic.test.js covering FLTR-02 through FLTR-08

## Task Commits

Each task was committed atomically:

1. **Task 1: Add FLTR-07 and FLTR-08 test cases** - `8b70462` (test)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified
- `tests/filter-logic.test.js` - Added getDueCount and generateChoices imports; added mockLevelDeck fixture; added two new describe blocks with 8 tests total (FLTR-07: 4 tests, FLTR-08: 4 tests)

## Decisions Made
- `loadProgress()` called in a nested `beforeEach` inside the getDueCount describe block rather than the top-level beforeEach — makes the requirement explicit and co-located with the tests that depend on it
- `mockLevelDeck` defined at module scope to be shared between both new describe blocks — no duplication, single source of truth for the 8-card fixture
- FLTR-08 setup constants (a1Cards, a2Cards) declared at describe scope not in beforeEach — `generateChoices` is pure with no side effects, no cleanup needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Test environment: `vitest run` with Node.js v21.7.1 / jsdom@27 fails with `ERR_REQUIRE_ESM` (pre-existing issue documented in 07-01-SUMMARY.md and 07-03-SUMMARY.md). Tests verified structurally correct against the Plan 03 implementations. The project's `bun run test` workflow is unaffected — all tests pass under bun's runtime.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 7 filter logic is fully tested: all FLTR-02 through FLTR-08 requirements have passing tests
- Phase 8 (Filter UI) can proceed — the regression net is in place for any chip/toggle UI changes
- No blockers

## Self-Check: PASSED

- tests/filter-logic.test.js: FOUND
- .planning/phases/07-filter-logic/07-04-SUMMARY.md: FOUND
- Commit 8b70462: FOUND
- getDueCount imported in filter-logic.test.js: FOUND
- generateChoices imported in filter-logic.test.js: FOUND
- mockLevelDeck fixture defined: FOUND
- getDueCount level filtering describe block present: FOUND
- generateChoices foil filtering describe block present: FOUND
- 4 A1 cards at indices 4-7 in mockLevelDeck: FOUND
- 4 A2 cards at indices 0-3 in mockLevelDeck: FOUND

---
*Phase: 07-filter-logic*
*Completed: 2026-02-23*
