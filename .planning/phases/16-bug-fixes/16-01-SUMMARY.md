---
phase: 16-bug-fixes
plan: 01
subsystem: ui
tags: [react, vitest, testing-library, srs, level-filter, badge]

# Dependency graph
requires:
  - phase: 16-bug-fixes/16-02
    provides: DECK_MAP shared module (src/data/deckMap.ts) used by DeckGrid badge computation
provides:
  - Live SRS due-count badge in DeckGrid (replaces static deck.cardCount)
  - Checkmark (✓) when 0 cards are due for a deck
  - DeckGrid.test.tsx covering BUGFIX-01 badge behaviors (4 tests)
affects:
  - 17-qa-mode
  - Any phase touching src/app/[lang]/page.tsx or DeckGrid rendering

# Tech tracking
tech-stack:
  added: []
  patterns: [index-preserving filter (.map((card,i)=>({card,i})).filter().length), TDD red-green]

key-files:
  created:
    - src/__tests__/components/DeckGrid.test.tsx
  modified:
    - src/app/[lang]/page.tsx

key-decisions:
  - "Compute due count inline in DeckGrid render (no useState cache) — hooks are reactive so count stays fresh"
  - "getDueCount helper inside DeckGrid function uses same index-preserving pattern as StudySession allDecksEmpty fix"
  - "Removed tc (useTranslations()) and deckCardCount i18n key — badge now shows raw number or checkmark, not translated string"
  - "deck-card-badge--done CSS modifier class added when due === 0 for styling hook"

patterns-established:
  - "Index-preserving filter: .map((card,i)=>({card,i})).filter(({card})=>...).filter(({i})=>...).length"
  - "TDD wave 0: write failing tests first, commit RED, implement, commit GREEN"

requirements-completed: [BUGFIX-01]

# Metrics
duration: 8min
completed: 2026-03-09
---

# Phase 16 Plan 01: DeckGrid Live Badge Summary

**DeckGrid now shows live SRS due-count per deck (or checkmark when 0) computed from useSRS + useLevelFilter, replacing the static deck.cardCount badge**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-09T11:24:18Z
- **Completed:** 2026-03-09T11:32:00Z
- **Tasks:** 2 (TDD: RED test commit + GREEN implementation commit)
- **Files modified:** 2

## Accomplishments

- Wrote 4-test DeckGrid badge suite (RED phase) covering live count, new-user count, zero checkmark, filter reactivity
- Replaced static `deck.cardCount` badge with live computation: `DECK_MAP[lang][deck.id]` filtered by `activeLevels` then `isCardDueForDeck`
- Badge renders numeric due count or Unicode checkmark (✓) with `deck-card-badge--done` CSS modifier when 0 cards due
- 63/63 tests pass with no regressions; TypeScript build clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Write DeckGrid test suite (TDD RED)** - `d5a8992` (test)
2. **Task 2: Wire useSRS + useLevelFilter into DeckGrid** - `929978e` (feat)

**Plan metadata:** (docs commit, see final_commit step)

_Note: TDD tasks have two commits (test RED → feat GREEN)_

## Files Created/Modified

- `src/__tests__/components/DeckGrid.test.tsx` - 4 badge behavior tests; mocks useSRS, useLevelFilter, DECK_MAP, deckMetadata, next-intl, next/link, next/navigation, LevelFilterChips
- `src/app/[lang]/page.tsx` - DeckGrid now calls useSRS(lang) + useLevelFilter(lang, hasProgress); getDueCount helper; live badge with checkmark fallback; removed unused tc/deckCardCount

## Decisions Made

- Compute due count inline in the `decks.map()` render callback (not in a `useState` or `useMemo`) — reactive hook values automatically propagate badge changes when `isCardDueForDeck` or `activeLevels` update.
- Removed `tc = useTranslations()` and the `deckCardCount` i18n key from DeckGrid since the badge now shows raw numbers. The key still exists in locale files but is no longer used by this component.
- Added `deck-card-badge--done` CSS modifier class to provide a styling hook for the checkmark state.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- BUGFIX-01 complete: DeckGrid badge accurately reflects SRS state under current level filter
- Phase 16 (both plans) now done; ready for Phase 17 Q&A Mode
- No blockers or concerns

## Self-Check: PASSED

- src/__tests__/components/DeckGrid.test.tsx: FOUND
- src/app/[lang]/page.tsx: FOUND
- .planning/phases/16-bug-fixes/16-01-SUMMARY.md: FOUND
- Commits d5a8992 and 929978e: FOUND

---
*Phase: 16-bug-fixes*
*Completed: 2026-03-09*
