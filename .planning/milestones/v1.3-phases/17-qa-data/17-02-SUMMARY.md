---
phase: 17-qa-data
plan: 02
subsystem: data
tags: [typescript, qa-mode, bilingual, content, italian, spanish, scenarios]

# Dependency graph
requires:
  - phase: 17-01
    provides: QACard, ScenarioId, and Scenario TypeScript interfaces in src/types/index.ts
provides:
  - 7 bilingual Scenario data files with 8 QACards each (56 cards total)
  - src/data/qa/index.ts barrel exporting all 7 scenarios as ordered array
  - 5 A1 scenarios: caffe, albergo, ristorante, strada, presentazioni
  - 2 A2 scenarios: negozio, treno
  - 112 content sets (56 Italian + 56 Spanish parallel translations)
affects: [17-03, 18-qa-browser, 19-qa-session]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bilingual scenario file pattern: single export const typed as Scenario, Italian base fields + Es-suffixed Spanish parallel fields"
    - "Foil cross-context strategy: each foil is a grammatically natural response from a DIFFERENT scenario context (wrong context, not wrong grammar)"
    - "A1-before-A2 array ordering in index.ts establishes canonical display order for Phase 18 browser"

key-files:
  created:
    - src/data/qa/caffe.ts
    - src/data/qa/albergo.ts
    - src/data/qa/ristorante.ts
    - src/data/qa/strada.ts
    - src/data/qa/presentazioni.ts
    - src/data/qa/negozio.ts
    - src/data/qa/treno.ts
    - src/data/qa/index.ts
  modified: []

key-decisions:
  - "Foil authoring strategy: foils are responses from other scenario contexts (hotel phrasing answering coffee question) — contextually wrong but grammatically natural, which is the correct A1/A2 distractor approach"
  - "A1-before-A2 canonical order in scenarios[] array in index.ts — Phase 18 browser inherits this display order"
  - "index.ts exports both named exports (caffe, albergo, etc.) and the scenarios array — named exports enable selective import by Phase 18/19 when rendering a single scenario"

patterns-established:
  - "Cross-context foil pattern: foils in caffe use hotel/train phrasing; foils in albergo use cafe/directions phrasing — ensures distractors are plausible but contextually incorrect"
  - "Parallel translation pattern: every Es-field is a direct translation preserving the same conversational meaning, register, and tone as the Italian field"

requirements-completed:
  - QADATA-01
  - QADATA-02

# Metrics
duration: 15min
completed: 2026-03-09
---

# Phase 17 Plan 02: Q&A Bilingual Scenario Data Summary

**7 bilingual Italian/Spanish Scenario data files authored with 8 QACards each — 56 Italian cards + 56 parallel Spanish translations — covering 5 A1 and 2 A2 conversational settings**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-09T23:04:34Z
- **Completed:** 2026-03-09T23:20:00Z
- **Tasks:** 2
- **Files modified:** 8 (all created)

## Accomplishments

- Authored 5 A1 scenarios (caffe, albergo, ristorante, strada, presentazioni) with 8 bilingual cards each, covering natural conversational arcs for each setting
- Authored 2 A2 scenarios (negozio, treno) with 8 bilingual cards each at slightly elevated vocabulary complexity appropriate for A2 learners
- Created src/data/qa/index.ts barrel exporting all 7 scenarios as an ordered array (A1 before A2) and as named exports
- All 56 cards typed as QACard with fixed-tuple [string, string, string] foils and foilsEs — tsc --noEmit confirms no type errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Author 5 A1 scenario files (caffe, albergo, ristorante, strada, presentazioni)** - `c29bb27` (feat)
2. **Task 2: Author 2 A2 scenario files (negozio, treno) and create index barrel** - `dc6bf0e` (feat)

## Files Created/Modified

- `src/data/qa/caffe.ts` - Al Caffè / En el Café scenario (A1), 8 cards covering arrival, ordering, seating, payment, farewell
- `src/data/qa/albergo.ts` - In Albergo / En el Hotel scenario (A1), 8 cards covering check-in, room type, amenities, WiFi, check-out
- `src/data/qa/ristorante.ts` - Al Ristorante / En el Restaurante scenario (A1), 8 cards covering reservation, first course, drinks, steak doneness, dessert, coffee, payment
- `src/data/qa/strada.ts` - Per Strada / En la Calle scenario (A1), 8 cards covering directions to station/bus/museum/pharmacy, distance, transport advice, gratitude
- `src/data/qa/presentazioni.ts` - Presentazioni / Presentaciones scenario (A1), 8 cards covering greetings, origin, age, occupation, language learning, hobbies, trip purpose, farewell
- `src/data/qa/negozio.ts` - Al Negozio / En la Tienda scenario (A2), 8 cards covering greeting, sizing, try-on, fit, color options, price, payment, return policy
- `src/data/qa/treno.ts` - In Treno / En el Tren scenario (A2), 8 cards covering seat availability, delay, connections, seat finding, luggage, dining car, missing connections, stop identification
- `src/data/qa/index.ts` - Barrel: imports all 7 scenarios, exports named and as `scenarios` array

## Decisions Made

- Foil authoring strategy: foils are responses from other scenario contexts (a hotel phrase answering a coffee question) — contextually wrong but grammatically natural. This is the correct distractor approach for A1/A2 comprehension questions.
- Canonical display order established in index.ts: A1 scenarios first (5), A2 scenarios last (2). Phase 18 browser inherits this ordering from the array.
- index.ts exports both named const exports and the scenarios array — named exports allow Phase 18/19 to import a single scenario directly when rendering a session.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing tsc error `Cannot find name 'vi'` in `src/__tests__/components/FeedbackMessage.test.tsx` was present before these changes (documented in 17-01-SUMMARY.md). Out of scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `src/data/qa/` contains all 7 scenario files + index.ts
- `import { scenarios } from '@/data/qa'` resolves to array of 7 Scenario objects
- All cards have bilingual Italian and Spanish content typed correctly as QACard
- Plan 17-03 (useQASession hook) can now import and consume these scenario objects
- Plan 18-qa-browser can import `scenarios` to build the scenario browser UI

## Self-Check: PASSED

- All 8 files in src/data/qa/ confirmed present
- Commits c29bb27 and dc6bf0e confirmed in git log
- tsc --noEmit exits with only pre-existing FeedbackMessage.test.tsx error (unrelated)

---
*Phase: 17-qa-data*
*Completed: 2026-03-09*
