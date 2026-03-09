---
phase: 13-ui-i18n-and-styling
plan: "01"
subsystem: ui
tags: [next-intl, i18n, react, typescript, filter-chips, leitner]

requires:
  - phase: 12-routing
    provides: src/app/[lang]/page.tsx, useSRS, useLevelFilter hooks, style-reference.css classes
  - phase: 11-logic-and-tests
    provides: useLevelFilter hook with FLTR-06 guard, useSRS hook
provides:
  - messages/it.json with full UI string set (nav, page, decks, filter.chips, study)
  - messages/es.json with full UI string set (nav, page, decks, filter.chips, study)
  - src/components/LevelFilterChips.tsx — client component rendering A1/A2 filter chips
  - src/app/[lang]/page.tsx — deck grid page with translated strings and LevelFilterChips
affects: [13-ui-i18n-and-styling/13-02, plan-02-study-session]

tech-stack:
  added: []
  patterns:
    - useTranslations() consumed in client components under next-intl NextIntlClientProvider
    - t(deck.i18nKey) pattern for deck name lookups — i18nKey equals DeckId string
    - LANG_NAMES static map for proper nouns (Italiano, Español) not managed by i18n
    - LevelFilterChips toggle logic with FLTR-06 guard via setActiveLevels

key-files:
  created:
    - src/components/LevelFilterChips.tsx
  modified:
    - messages/it.json
    - messages/es.json
    - src/app/[lang]/page.tsx

key-decisions:
  - "LANG_NAMES static map used for language proper nouns (Italiano, Español) — these are not i18n-managed strings"
  - "deck-card-badge no longer appends 'due' text — badge shows count only (matching original design)"

patterns-established:
  - "useTranslations namespace per UI section: 'decks', 'filter', 'page', 'study', 'nav'"
  - "LevelFilterChips is a standalone client component imported into any page that needs filter UI"

requirements-completed: [UI-01, I18N-01, I18N-02]

duration: 2min
completed: 2026-03-05
---

# Phase 13 Plan 01: UI i18n and Styling Summary

**next-intl message files expanded with full UI string set; LevelFilterChips client component built and wired above deck grid with useLevelFilter + FLTR-06 guard**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T04:50:12Z
- **Completed:** 2026-03-06T04:52:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Both `messages/it.json` and `messages/es.json` expanded with nav.backToDecks, page namespace, filter.chips A1/A2, and full study namespace (8 keys)
- `src/components/LevelFilterChips.tsx` created — renders A1/A2 chips, uses useLevelFilter + useSRS, respects FLTR-06 guard, uses useTranslations('filter')
- `src/app/[lang]/page.tsx` updated — deck names from `t(deck.i18nKey)`, subtitle from `t('chooseDeck')`, LevelFilterChips rendered above DeckGrid, hardcoded strings removed
- `bun run build` exits 0 — 22 static pages generated, no TypeScript errors
- All 37 unit tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand message files with full UI string set** - `80b905b` (feat)
2. **Task 2: Build LevelFilterChips and wire into deck grid page** - `1fe7605` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `messages/it.json` — expanded with nav.backToDecks, page, filter.chips, study namespaces
- `messages/es.json` — expanded with nav.backToDecks, page, filter.chips, study namespaces
- `src/components/LevelFilterChips.tsx` — new client component, renders A1/A2 filter chips with toggle logic
- `src/app/[lang]/page.tsx` — deck names from t(deck.i18nKey), subtitle from t('chooseDeck'), LevelFilterChips wired above DeckGrid

## Decisions Made

- LANG_NAMES static map used for language proper nouns (Italiano, Español) — these are proper nouns, not i18n-managed strings, consistent with existing plan spec
- deck-card-badge simplified to count only (no 'due' suffix) — matches original design intent

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- LevelFilterChips and message files ready for Plan 02 to wire study session translations
- filter.chips and study namespace keys available for StudySession component
- No blockers

---
*Phase: 13-ui-i18n-and-styling*
*Completed: 2026-03-05*
