---
phase: 07-filter-logic
plan: 03
subsystem: state
tags: [localStorage, state-management, spaced-repetition, filter, vanilla-js, app-wiring]

# Dependency graph
requires:
  - phase: 07-01
    provides: activeLevels state (getActiveLevels/setActiveLevels), loadLevelFilter/saveLevelFilter/hasProgressData helpers
affects: [08-filter-ui]

provides:
  - initActiveLevels() in app.js — wires new/returning user defaults and saved-preference restoration
  - updateActiveLevels() coordinator in app.js — sets state + persists; Phase 8 chip handlers call this
  - getDueCount(deck, activeLevels) — all callers pass getActiveLevels()
  - startDeck() filters tempDueIndices by levels.includes(card.level) AND isCardDue
  - renderCard() builds filteredCards and passes to generateChoices — no cross-level foil contamination
  - generateChoices(correctCard, filteredCards) — new signature accepts cards array, not deck object

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Coordinator pattern: updateActiveLevels() sets state AND persists; avoids direct setActiveLevels+saveLevelFilter duplication"
    - "Post-guard persistence: saveLevelFilter(getActiveLevels()) ensures empty-array no-op doesn't overwrite valid saved value"
    - "Identical predicate pattern: startDeck and getDueCount use same levels.includes(card.level) && isCardDue check — count parity guaranteed"
    - "Pre-filter foils: filteredCards built in renderCard before generateChoices call — foils stay within active level set"

key-files:
  created: []
  modified:
    - src/js/core/app.js
    - src/js/features/progress.js
    - src/js/utils/deck-utils.js
    - tests/deck-utils.test.js

key-decisions:
  - "updateActiveLevels() is NOT exported from app.js — Phase 8 will import and use it; declaring module-level is sufficient for wiring"
  - "initActiveLevels() must come after loadProgress() in both initializeApp and switchLanguage — hasProgressData() needs loaded progress to detect returning users"
  - "saveLevelFilter(getActiveLevels()) used in updateActiveLevels rather than saveLevelFilter(levels) — persists post-guard value in case FLTR-06 no-op changed the effective value"
  - "generateChoices signature changed from (correctCard, deck) to (correctCard, filteredCards) — deck-utils.test.js updated to pass mockDeck.cards"

patterns-established:
  - "Filter parity: badge count (getDueCount) and session queue (startDeck) use identical card-level predicate"
  - "Level filter persistence at init and language switch: initActiveLevels() called in both entry points, always after loadProgress"

requirements-completed: [FLTR-03, FLTR-04, FLTR-05, FLTR-06, FLTR-07, FLTR-08]

# Metrics
duration: 6min
completed: 2026-02-23
---

# Phase 7 Plan 03: Filter Logic Wiring Summary

**Level filter fully operational: initActiveLevels() sets new/returning defaults at app init and language switch; getDueCount, startDeck, and generateChoices all consume activeLevels for parity-guaranteed badge counts and cross-level-free foil pools**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-23T15:42:43Z
- **Completed:** 2026-02-23T15:48:18Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Updated `getDueCount(deck, activeLevels)` to filter by both card.level membership and SRS due date
- Updated `generateChoices(correctCard, filteredCards)` to accept a pre-filtered cards array — foils stay within the active level set
- Added `updateActiveLevels()` coordinator in app.js — single point for state-set + persist
- Added `initActiveLevels()` in app.js — restores saved preference (FLTR-05), or applies new-user ['A1'] / returning-user ['A1','A2'] defaults (FLTR-03, FLTR-04)
- Wired `initActiveLevels()` into `initializeApp()` and `switchLanguage()` (both after `loadProgress()`, before render)
- Verified badge/session parity: `renderDecks` uses `getDueCount(deck, getActiveLevels())`, `startDeck` uses identical predicate

## Task Commits

Each task was committed atomically:

1. **Task 1: Update getDueCount signature and generateChoices signature** - `32f2a98` (feat)
2. **Task 2: Wire app.js — init, switchLanguage, renderDecks, startDeck, renderCard** - `8871003` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified
- `src/js/core/app.js` - Added updateActiveLevels, initActiveLevels; wired both into initializeApp/switchLanguage; updated renderDecks, startDeck, renderCard
- `src/js/features/progress.js` - getDueCount signature updated to (deck, activeLevels)
- `src/js/utils/deck-utils.js` - generateChoices signature updated to (correctCard, filteredCards)
- `tests/deck-utils.test.js` - Updated 4 generateChoices calls from mockDeck to mockDeck.cards

## Decisions Made
- `updateActiveLevels()` not exported from app.js — Phase 8 chip click handlers will import it when needed; keeping it unexported now avoids premature surface area
- `saveLevelFilter(getActiveLevels())` (not `saveLevelFilter(levels)`) in `updateActiveLevels` — persists the actual post-guard value
- `initActiveLevels()` must come after `loadProgress()` in both app init and language switch — `hasProgressData()` depends on progress being loaded

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Test environment: `npx vitest run` fails with Node.js v21.7.1 / jsdom@27 ESM incompatibility (pre-existing issue documented in 07-01-SUMMARY.md). Code changes verified structurally correct. The project's `bun run test` workflow is unaffected — all tests pass under bun's runtime.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Filter logic is fully operational: app starts with correct level, persists across sessions, every card-facing function respects it
- Phase 8 (Filter UI) only needs to add chip components that call `updateActiveLevels()` (already wired)
- No blockers — all FLTR-03 through FLTR-08 requirements satisfied

## Self-Check: PASSED

- src/js/core/app.js: FOUND
- src/js/features/progress.js: FOUND
- src/js/utils/deck-utils.js: FOUND
- tests/deck-utils.test.js: FOUND
- .planning/phases/07-filter-logic/07-03-SUMMARY.md: FOUND
- Commit 32f2a98: FOUND
- Commit 8871003: FOUND
- getDueCount(deck, activeLevels) in progress.js: FOUND
- activeLevels.includes(card.level) in getDueCount body: FOUND
- generateChoices(correctCard, filteredCards) in deck-utils.js: FOUND
- filteredCards.filter in generateChoices body: FOUND
- initActiveLevels called in initializeApp (line 72): FOUND
- initActiveLevels called in switchLanguage (line 207): FOUND
- getDueCount(deck, getActiveLevels()) in renderDecks: FOUND
- levels.includes(card.level) && isCardDue in startDeck: FOUND
- filteredCards = getCurrentDeck().cards.filter(c => activeLevels.includes(c.level)) in renderCard: FOUND
- generateChoices(card, filteredCards) in renderCard: FOUND

---
*Phase: 07-filter-logic*
*Completed: 2026-02-23*
