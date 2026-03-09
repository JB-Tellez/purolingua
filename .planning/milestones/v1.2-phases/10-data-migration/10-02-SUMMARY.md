---
phase: 10-data-migration
plan: "02"
subsystem: data
tags: [typescript, spanish, cards, decks, CEFR, A1, A2]

# Dependency graph
requires:
  - phase: 09-scaffold
    provides: src/types/index.ts with Card, Level, DeckId interfaces
provides:
  - Spanish daily deck as spanishDaily Card[] (src/data/es/daily.ts)
  - Spanish restaurant deck as spanishRestaurant Card[] (src/data/es/restaurant.ts)
  - Spanish travel deck as spanishTravel Card[] (src/data/es/travel.ts)
  - Spanish shopping deck as spanishShopping Card[] (src/data/es/shopping.ts)
  - Spanish hotel deck as spanishHotel Card[] (src/data/es/hotel.ts)
  - Spanish emergencies deck as spanishEmergencies Card[] (src/data/es/emergencies.ts)
  - Spanish social deck as spanishSocial Card[] (src/data/es/social.ts)
  - Spanish weather deck as spanishWeather Card[] (src/data/es/weather.ts)
affects:
  - 10-03 (Spanish deck metadata module consumes these arrays)
  - 11-srs-hooks (useSRS hook imports cards for study sessions)
  - 12-routing (deck pages import card arrays)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Spanish deck modules: import type { Card } from '@/types', single named export per file"
    - "Export naming: 'spanish' prefix + PascalCase deck name (e.g. spanishDaily)"
    - "A2 cards precede A1 cards — positional indices are SRS keys, must not reorder"

key-files:
  created:
    - src/data/es/daily.ts
    - src/data/es/restaurant.ts
    - src/data/es/travel.ts
    - src/data/es/shopping.ts
    - src/data/es/hotel.ts
    - src/data/es/emergencies.ts
    - src/data/es/social.ts
    - src/data/es/weather.ts
  modified: []

key-decisions:
  - "Card order preserved exactly from main-branch vanilla JS source — positional indices are SRS localStorage keys"

patterns-established:
  - "ES deck pattern: import type { Card } from '@/types'; export const spanish{Name}: Card[] = [...]"
  - "A2 cards first (indices 0-19), A1 cards appended (indices 20-39) — never reorder"

requirements-completed: [DATA-03]

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 10 Plan 02: Spanish Deck Data Migration Summary

**320 Spanish flashcards ported from vanilla JS to 8 typed TypeScript Card[] modules under src/data/es/, preserving original positional order for SRS key compatibility**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T08:33:31Z
- **Completed:** 2026-03-05T08:36:47Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- 8 typed TypeScript deck files created in src/data/es/ — one per deck
- All 320 Spanish cards (40 per deck: 20 A2 + 20 A1) faithfully migrated from main-branch src/locales/es/decks.js
- bun run build exits 0 with no TypeScript errors
- Card order preserved exactly — positional indices remain valid SRS localStorage keys

## Task Commits

Each task was committed atomically:

1. **Task 1 + 2: Create Spanish deck TypeScript modules + verify card counts** - `184e2db` (feat)

**Plan metadata:** *(see final docs commit)*

## Files Created/Modified
- `src/data/es/daily.ts` - 40 Spanish daily life cards (spanishDaily export)
- `src/data/es/restaurant.ts` - 40 Spanish restaurant cards (spanishRestaurant export)
- `src/data/es/travel.ts` - 40 Spanish travel cards (spanishTravel export)
- `src/data/es/shopping.ts` - 40 Spanish shopping cards (spanishShopping export)
- `src/data/es/hotel.ts` - 40 Spanish hotel cards (spanishHotel export)
- `src/data/es/emergencies.ts` - 40 Spanish emergencies cards (spanishEmergencies export)
- `src/data/es/social.ts` - 40 Spanish social conversation cards (spanishSocial export)
- `src/data/es/weather.ts` - 40 Spanish weather cards (spanishWeather export)

## Decisions Made
- None - followed plan as specified. Card order preserved to protect SRS key integrity.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 Spanish deck data modules are importable TypeScript and ready for consumption
- Plan 03 (Spanish deck metadata) can import these arrays
- Phase 11 (SRS hooks) and Phase 12 (routing) have the data they need

## Self-Check: PASSED
- All 8 deck files confirmed present on disk
- Commit 184e2db confirmed in git log

---
*Phase: 10-data-migration*
*Completed: 2026-03-05*
