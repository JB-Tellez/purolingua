---
phase: 10-data-migration
plan: "01"
subsystem: data
tags: [typescript, italian, cards, cefr, a1, a2, leitner]

# Dependency graph
requires:
  - phase: 09-scaffold
    provides: src/types/index.ts with Card, Level, DeckId types
provides:
  - src/data/it/daily.ts — italianDaily Card[] (40 cards)
  - src/data/it/restaurant.ts — italianRestaurant Card[] (40 cards)
  - src/data/it/travel.ts — italianTravel Card[] (40 cards)
  - src/data/it/shopping.ts — italianShopping Card[] (40 cards)
  - src/data/it/hotel.ts — italianHotel Card[] (40 cards)
  - src/data/it/emergencies.ts — italianEmergencies Card[] (40 cards)
  - src/data/it/social.ts — italianSocial Card[] (40 cards)
  - src/data/it/weather.ts — italianWeather Card[] (40 cards)
affects:
  - 10-data-migration (plans 02, 03)
  - 11-srs-hooks
  - 12-routing

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Italian deck modules: import type { Card } from '@/types' + single named export as Card[]"
    - "Export naming: 'italian' prefix + PascalCase deck name (italianDaily, italianRestaurant, etc.)"
    - "Card ordering: 20 A2 cards first, 20 A1 cards appended — positional indices are SRS keys"

key-files:
  created:
    - src/data/it/daily.ts
    - src/data/it/restaurant.ts
    - src/data/it/travel.ts
    - src/data/it/shopping.ts
    - src/data/it/hotel.ts
    - src/data/it/emergencies.ts
    - src/data/it/social.ts
    - src/data/it/weather.ts
  modified: []

key-decisions:
  - "Card order preserved exactly from main-branch source — A2 first, A1 appended — to maintain SRS key integrity ({deckId}_{cardIndex})"
  - "Only front/back/level fields copied; id/title/description/icon/theme omitted (go in Plan 03 metadata module)"

patterns-established:
  - "Data module pattern: one file per deck, one named export, import type only from @/types"

requirements-completed: [DATA-02]

# Metrics
duration: 15min
completed: 2026-03-05
---

# Phase 10 Plan 01: Italian Deck Data Migration Summary

**320 Italian vocabulary cards ported to 8 typed TypeScript modules in src/data/it/ — 40 cards each (20 A2 + 20 A1), build clean**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-05T08:22:00Z
- **Completed:** 2026-03-05T08:37:27Z
- **Tasks:** 2
- **Files modified:** 8 created

## Accomplishments
- All 8 Italian vocabulary decks ported from vanilla JS source (main branch) to typed TypeScript
- 320 total cards preserved in original order — positional SRS key integrity maintained
- Level distribution confirmed: every deck has exactly 20 A2 + 20 A1 cards
- `bun run build` exits 0 with all 8 new modules present and type-checked

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Italian deck TypeScript modules** + **Task 2: Verify card counts** - `a9ca466` (feat)

## Files Created/Modified
- `src/data/it/daily.ts` — italianDaily Card[] — 40 cards (daily life phrases)
- `src/data/it/restaurant.ts` — italianRestaurant Card[] — 40 cards (restaurant/dining)
- `src/data/it/travel.ts` — italianTravel Card[] — 40 cards (transport/navigation)
- `src/data/it/shopping.ts` — italianShopping Card[] — 40 cards (retail/market)
- `src/data/it/hotel.ts` — italianHotel Card[] — 40 cards (hotel/accommodation)
- `src/data/it/emergencies.ts` — italianEmergencies Card[] — 40 cards (emergency phrases)
- `src/data/it/social.ts` — italianSocial Card[] — 40 cards (social/introductions)
- `src/data/it/weather.ts` — italianWeather Card[] — 40 cards (weather/seasons)

## Decisions Made
- Card order preserved exactly from main-branch source — A2 first, A1 appended — to maintain SRS key integrity (`{deckId}_{cardIndex}`)
- Only `front`/`back`/`level` fields copied from source; `id`/`title`/`description`/`icon`/`theme` are omitted (they go in the Plan 03 metadata module)
- Used `import type { Card }` (not value import) per plan spec

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 8 Italian deck data modules ready for consumption by Phase 11 (SRS hooks) and Phase 12 (routing)
- Plan 10-02 (Spanish decks) and Plan 10-03 (metadata module) can proceed independently
- No blockers

---
*Phase: 10-data-migration*
*Completed: 2026-03-05*
