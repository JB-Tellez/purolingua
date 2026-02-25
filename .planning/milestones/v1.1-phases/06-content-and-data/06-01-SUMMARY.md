---
phase: 06-content-and-data
plan: 01
subsystem: content
tags: [italian, decks, flashcards, difficulty-levels, A1, A2, leitner]

# Dependency graph
requires: []
provides:
  - "Italian deck data file with level field on all 320 cards (160 A2 + 160 A1)"
  - "A2 level tag on all 160 existing Italian cards (indices 0-19 per deck)"
  - "20 A1 beginner cards appended to each of 8 Italian topic decks (indices 20-39)"
affects:
  - "07-filter-logic (reads card level field for SRS filter)"
  - "08-filter-ui (displays level labels from card data)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Card schema pattern: {front, back, level} — level field required on all cards"
    - "Append-only deck expansion: new cards always added at end; never inserted before existing cards"
    - "SRS key stability: card indices are immutable (deckId_cardIndex); positional order is never changed"

key-files:
  created: []
  modified:
    - "src/locales/it/decks.js"

key-decisions:
  - "A1 cards appended to END of each deck array to preserve SRS key integrity (deckId_cardIndex)"
  - "level field placed after back field in each card object for consistency"
  - "20 A1 cards per deck gives minimum foil pool coverage for 4-option quiz format"

patterns-established:
  - "Card level schema: every card object must have {front, back, level} with level one of 'A1' | 'A2'"
  - "Deck expansion: append-only; never insert before existing cards"

requirements-completed: [CONT-01, CONT-02]

# Metrics
duration: 4min
completed: 2026-02-23
---

# Phase 6 Plan 01: Italian Deck Content — A2 Tagging and A1 Cards Summary

**160 existing Italian cards tagged level A2 and 160 new A1 beginner phrase cards appended across 8 topic decks, establishing the card schema required for Phase 7 difficulty filter logic**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-23T06:18:39Z
- **Completed:** 2026-02-23T06:22:07Z
- **Tasks:** 2 (executed together in one file write)
- **Files modified:** 1

## Accomplishments

- Tagged all 160 existing Italian A2 cards with `"level": "A2"` — no card reordered or moved
- Appended 20 A1 beginner phrase cards to each of the 8 Italian topic decks (daily, restaurant, travel, shopping, hotel, emergencies, social, weather)
- Each deck now has exactly 40 cards: A2 at indices 0-19, A1 at indices 20-39
- File parses and exports correctly — 8 decks confirmed via node import check

## Task Commits

Each task was committed atomically:

1. **Task 1: Tag all existing Italian cards with level A2** - `b1c43da` (feat)
2. **Task 2: Append A1 phrase cards to all 8 Italian decks** - `b1c43da` (feat — combined with Task 1 in same file write)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified

- `src/locales/it/decks.js` — Added `level: "A2"` to 160 existing cards; appended 20 A1 cards per deck (8 decks x 20 = 160 new cards); total 320 cards across 8 decks of 40 each

## Decisions Made

- Tasks 1 and 2 were executed in a single atomic file write since both modify the same file and were planned back-to-back. This avoids an intermediate state where A2 cards exist without A1 cards.
- A1 card content authored directly in Italian (culturally appropriate phrases: greetings, basic orders, simple directions, colors, body parts, introductions, weather vocabulary) — not translated from Spanish.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/locales/it/decks.js` is ready for Phase 7 filter logic
- All Italian cards have the `level` field required by the filter system
- A2 cards at indices 0-19, A1 cards at indices 20-39 in every deck — ordering is stable for SRS key lookup
- Concern noted in STATE.md: A1 Italian phrase quality should be reviewed by a native speaker before shipping

## Self-Check: PASSED

- FOUND: `src/locales/it/decks.js` (320 cards, 8 decks of 40)
- FOUND: `.planning/phases/06-content-and-data/06-01-SUMMARY.md`
- FOUND: commit `b1c43da` (feat(06-01): tag all 160 existing Italian cards with level A2)
- A2 count: 160 confirmed
- A1 count: 160 confirmed
- Deck ordering: PASS (A2 at 0-19, A1 at 20-39 in all 8 decks)

---
*Phase: 06-content-and-data*
*Completed: 2026-02-23*
