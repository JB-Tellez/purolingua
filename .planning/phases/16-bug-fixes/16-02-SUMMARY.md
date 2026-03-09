---
phase: 16-bug-fixes
plan: 02
subsystem: ui
tags: [react, typescript, srs, flashcards, bugfix]

# Dependency graph
requires:
  - phase: 15-study-session-ux-polish
    provides: StudySession component with voice recognition and level filtering
provides:
  - src/data/deckMap.ts — shared DECK_MAP: Record<Lang, Record<DeckId, Card[]>>
  - Fixed allDecksEmpty in StudySession — lang-scoped, per-deck card arrays, index-preserving filter
affects:
  - 16-bug-fixes (BUGFIX-01)
  - 17-qa-mode (imports DECK_MAP or similar deck data structures)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Index-preserving filter pattern: .map((c,i)=>({c,i})).filter(({c})=>...).every(({i})=>...)"
    - "Shared data module pattern: extract shared constants to src/data/ rather than declaring inline in page components"

key-files:
  created:
    - src/data/deckMap.ts
  modified:
    - src/app/[lang]/[deck]/page.tsx
    - src/app/[lang]/[deck]/StudySession.tsx
    - src/__tests__/components/StudySession.test.tsx

key-decisions:
  - "Extract DECK_MAP to src/data/deckMap.ts as a shared module used by both DeckPage and StudySession"
  - "Use deckMetadata.filter(d => d.lang === lang) instead of DECK_IDS for language-scoped allDecksEmpty check"
  - "Per-deckId call counters in tests to distinguish initial snapshot call from allDecksEmpty calls"

patterns-established:
  - "Index-preserving filter: always use .map((card,i)=>({card,i})).filter(...).every(({i})=>...) when SRS key depends on original card index"

requirements-completed: [BUGFIX-02]

# Metrics
duration: 7min
completed: 2026-03-09
---

# Phase 16 Plan 02: allDecksEmpty Bug Fix Summary

**Fixed premature all-done screen by extracting shared DECK_MAP and correcting allDecksEmpty to use per-deck card arrays with language scoping and index-preserving filter pattern**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-09T11:15:56Z
- **Completed:** 2026-03-09T11:22:15Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `src/data/deckMap.ts` exporting `DECK_MAP: Record<Lang, Record<DeckId, Card[]>>` — shared by DeckPage and StudySession
- Removed duplicated DECK_MAP and 16 individual card imports from `page.tsx`
- Fixed `allDecksEmpty` in `StudySession.handleAnswer` to use `deckMetadata.filter(d => d.lang === lang)` (language-scoped) and `DECK_MAP[lang][id]` (per-deck card arrays) with index-preserving `.map((card,i)=>({card,i})).filter(...).every(({i})=>...)` pattern
- Added BUGFIX-02 test suite (tests E and F) covering cross-deck index correctness and language-scope isolation

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract shared DECK_MAP** - `2b30cb2` (feat) — RED tests not yet written
2. **Task 2 RED: Failing BUGFIX-02 tests** - `997a57c` (test)
3. **Task 2 GREEN: Fix StudySession allDecksEmpty** - `8a5954e` (feat)

_Note: TDD task 2 has two commits: test (RED) then implementation (GREEN)_

## Files Created/Modified
- `src/data/deckMap.ts` — New shared card map module, exports DECK_MAP for all 16 lang x deck combinations
- `src/app/[lang]/[deck]/page.tsx` — Removed local DECK_MAP and all per-deck imports; imports DECK_MAP from '@/data/deckMap'
- `src/app/[lang]/[deck]/StudySession.tsx` — Fixed allDecksEmpty: lang-scoped deck list, per-deck card arrays, index-preserving filter
- `src/__tests__/components/StudySession.test.tsx` — Added mock for '@/data/deckMap', controllable isDueImpl, BUGFIX-02 test E and F

## Decisions Made
- Extracted DECK_MAP to `src/data/deckMap.ts` so both `page.tsx` and `StudySession.tsx` import from a single source of truth, eliminating duplication and enabling the cross-deck lookup needed for the fix
- Used `deckMetadata.filter(d => d.lang === lang)` rather than `DECK_IDS` (language-neutral 8 IDs) to correctly scope the allDecksEmpty check to only the current user's language
- Used per-deckId call counters in tests to distinguish the initial `dueCards` snapshot call from the post-answer `allDecksEmpty` calls, enabling precise control over mock behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Initial test design (test E) had to be refined: the bug is specifically about index position, so the mock DECK_MAP needed a `restaurant` deck with an A2 card at index 0 and A1 card at index 1 to expose the index-mapping bug. Simpler single-card approaches passed coincidentally with buggy code.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `src/data/deckMap.ts` is available for phase 17 (Q&A mode) if card data access is needed
- allDecksEmpty correctly scoped to language — A1-only users will no longer see premature all-done screen
- All 59 tests pass, build clean

---
*Phase: 16-bug-fixes*
*Completed: 2026-03-09*

## Self-Check: PASSED
- src/data/deckMap.ts: FOUND
- src/app/[lang]/[deck]/StudySession.tsx: FOUND
- .planning/phases/16-bug-fixes/16-02-SUMMARY.md: FOUND
- commit 2b30cb2: FOUND
- commit 997a57c: FOUND
- commit 8a5954e: FOUND
