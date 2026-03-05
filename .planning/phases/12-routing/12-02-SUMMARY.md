---
phase: 12-routing
plan: "02"
subsystem: ui
tags: [nextjs, react, static-export, srs, leitner, routing]

# Dependency graph
requires:
  - phase: 12-routing-01
    provides: home page and [lang] deck grid page
  - phase: 11-logic-and-tests
    provides: useSRS and useLevelFilter hooks
  - phase: 10-data-migration
    provides: Card[] arrays in src/data/it and src/data/es

provides:
  - src/app/[lang]/[deck]/page.tsx — server component with generateStaticParams for 16 paths
  - src/app/[lang]/[deck]/StudySession.tsx — client quiz flow component
  - Full static export: out/ contains all 18 HTML files (1 root + 2 lang + 16 deck)

affects:
  - phase: 13-styling (will enhance StudySession UI with proper Tailwind classes)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server/client split: page.tsx (server) imports StudySession.tsx (client) — clean boundary
    - generateStaticParams flatMap pattern: routing.locales x DECK_IDS = 16 paths
    - DECK_MAP lookup: Record<Lang, Record<DeckId, Card[]>> for O(1) card array access
    - SRS integration: filter cards by isCardDueForDeck + level, call updateCard on answer

key-files:
  created:
    - src/app/[lang]/[deck]/page.tsx
    - src/app/[lang]/[deck]/StudySession.tsx
  modified:
    - src/app/[lang]/page.tsx

key-decisions:
  - "StudySession placed in separate file from page.tsx to satisfy Next.js 'use client' + generateStaticParams separation constraint"
  - "StudySession uses isCardDueForDeck + updateCard (actual useSRS API) not getDueCards/markCard (plan pseudocode)"
  - "Due-card list built at render time by mapping card indices through isCardDueForDeck — avoids snapshot staleness"

patterns-established:
  - "Phase 12 page pattern: server page.tsx (no use client) imports client StudySession.tsx"
  - "DECK_MAP lookup: Record<Lang, Record<DeckId, Card[]>> maps lang+deckId -> Card[]"

requirements-completed: [ROUTE-03, ROUTE-04]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 12 Plan 02: Study Session Page Summary

**[lang]/[deck] study session with full Leitner quiz flow — show front, reveal back, mark correct/incorrect, advance SRS — covering all 16 static lang x deck paths in the static export**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-05T15:30:18Z
- **Completed:** 2026-03-05T15:32:xx Z
- **Tasks:** 1 of 2 complete (Task 2 is a human-verify checkpoint)
- **Files modified:** 3

## Accomplishments
- Created `src/app/[lang]/[deck]/StudySession.tsx` — client component with full quiz flow (front, reveal, correct/incorrect, done state)
- Created `src/app/[lang]/[deck]/page.tsx` — server component with `generateStaticParams` producing all 16 lang x deck paths
- `bun run build` exits 0 with 22 static pages (1 root + 2 lang + 16 deck + 1 not-found)
- All 37 unit tests continue to pass — no regressions

## Task Commits

1. **Task 1: Create /[lang]/[deck]/page.tsx with generateStaticParams and StudySession quiz flow** - `a70aa2c` (feat)

**Plan metadata:** (pending final commit after checkpoint approval)

## Files Created/Modified
- `src/app/[lang]/[deck]/page.tsx` - Server component: validates params, loads Card[], renders StudySession
- `src/app/[lang]/[deck]/StudySession.tsx` - Client component: quiz flow with useSRS + useLevelFilter integration
- `src/app/[lang]/page.tsx` - Removed duplicate generateStaticParams (incompatible with 'use client')

## Decisions Made
- StudySession placed in a separate `.tsx` file (not inlined in page.tsx) to maintain the server/client component boundary required by Next.js
- Used the actual useSRS API (`isCardDueForDeck` + `updateCard`) rather than the idealized pseudocode in the plan (`getDueCards` + `markCard`)
- Due-card list built by filtering `cards.map((c, i) => ...)` through `isCardDueForDeck` at render time

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed duplicate generateStaticParams from src/app/[lang]/page.tsx**
- **Found during:** Task 1 build verification
- **Issue:** `[lang]/page.tsx` had both `'use client'` and `export function generateStaticParams()`. Next.js 16 disallows this combination on a page file and exits build with error.
- **Fix:** Removed the `generateStaticParams` export from `[lang]/page.tsx` since it is already declared in `[lang]/layout.tsx`.
- **Files modified:** `src/app/[lang]/page.tsx`
- **Verification:** `bun run build` exits 0 after fix
- **Committed in:** `a70aa2c` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required for build to succeed. No scope creep.

## Issues Encountered
- Plan interfaces described `getDueCards(deckId, cards)` and `markCard(deckId, index, correct)`, but the actual useSRS hook (from Phase 11) exposes `isCardDueForDeck(deckId, index)` and `updateCard(deckId, index, correct)`. StudySession was implemented using the actual API.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 routing requirements satisfied: ROUTE-01 (home), ROUTE-02 (deck grid), ROUTE-03 (study session), ROUTE-04 (16 static paths)
- Phase 13 (styling) can enhance StudySession.tsx and the deck grid tiles with full Tailwind design
- Human verification checkpoint (Task 2) pending — user should run `bun run dev` and test the full routing flow in browser

---
*Phase: 12-routing*
*Completed: 2026-03-05*
