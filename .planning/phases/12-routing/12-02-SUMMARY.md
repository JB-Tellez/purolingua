---
phase: 12-routing
plan: "02"
subsystem: ui
tags: [nextjs, react, static-export, srs, leitner, routing, styling]

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
  - src/app/[lang]/[deck]/StudySession.tsx — client quiz flow component with original design
  - src/app/[lang]/page.tsx — deck grid page with themed card tiles
  - src/app/globals.css — imports style-reference.css design system
  - Full static export: out/ contains all 18 HTML files (1 root + 2 lang + 16 deck)

affects:
  - phase: 13-styling (may further refine UI)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server/client split: page.tsx (server) imports StudySession.tsx (client) — clean boundary
    - generateStaticParams flatMap pattern: routing.locales x DECK_IDS = 16 paths
    - DECK_MAP lookup: Record<Lang, Record<DeckId, Card[]>> for O(1) card array access
    - SRS integration: filter cards by isCardDueForDeck + level, call updateCard on answer
    - CSS design system: style-reference.css imported via globals.css; classes used directly in JSX

key-files:
  created:
    - src/app/[lang]/[deck]/page.tsx
    - src/app/[lang]/[deck]/StudySession.tsx
    - src/style-reference.css
  modified:
    - src/app/[lang]/page.tsx
    - src/app/globals.css

key-decisions:
  - "StudySession placed in separate file from page.tsx to satisfy Next.js 'use client' + generateStaticParams separation constraint"
  - "StudySession uses isCardDueForDeck + updateCard (actual useSRS API) not getDueCards/markCard (plan pseudocode)"
  - "Due-card list built at render time by mapping card indices through isCardDueForDeck — avoids snapshot staleness"
  - "style-reference.css imported in globals.css (not scoped per component) so all design system variables and classes are globally available"
  - "Deck grid uses .deck-card.theme-* classes directly from style-reference.css; theme name comes from deckMetadata"

patterns-established:
  - "Phase 12 page pattern: server page.tsx (no use client) imports client StudySession.tsx"
  - "DECK_MAP lookup: Record<Lang, Record<DeckId, Card[]>> maps lang+deckId -> Card[]"
  - "Global CSS import: style-reference.css design system injected via globals.css @import"

requirements-completed: [ROUTE-03, ROUTE-04]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 12 Plan 02: Study Session Page Summary

**[lang]/[deck] study session with full Leitner quiz flow and original Mediterranean design — themed deck card tiles, 3D card flip, progress bar, and Correct/Incorrect controls — covering all 16 static lang x deck paths**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-05T15:30:18Z
- **Completed:** 2026-03-05T19:22:xx Z
- **Tasks:** 2 of 2 complete (Task 2 was human-verify; continuation applied original design)
- **Files modified:** 5

## Accomplishments

**Task 1 (prior session):**
- Created `src/app/[lang]/[deck]/StudySession.tsx` — client component with full quiz flow (front, reveal, correct/incorrect, done state)
- Created `src/app/[lang]/[deck]/page.tsx` — server component with `generateStaticParams` producing all 16 lang x deck paths
- `bun run build` exits 0 with 22 static pages (1 root + 2 lang + 16 deck + 1 not-found)

**Task 2 continuation (styling):**
- Added `src/style-reference.css` to repository (Mediterranean design system with CSS variables, `.deck-card`, `.card-container`, `.btn`, etc.)
- Imported `style-reference.css` into `src/app/globals.css` so all classes are globally available
- Rewrote `src/app/[lang]/page.tsx` deck grid to use `.deck-grid`, `.deck-card.theme-*`, `.deck-icon-circle`, `.deck-card-badge`
- Rewrote `src/app/[lang]/[deck]/StudySession.tsx` to use `.card-container`, `.card`, `.card-face`, `.card-front`, `.card-back` flip layout
- Progress bar uses `.progress-bar` / `.progress-fill` with animated golden fill
- Controls use `.controls`, `.btn.primary`, `.btn.secondary`
- Card front text uses `#card-front-text` for Crimson Text serif styling
- All 37 unit tests continue to pass — no regressions

## Task Commits

1. **Task 1: Create /[lang]/[deck]/page.tsx with generateStaticParams and StudySession quiz flow** - `a70aa2c` (feat)
2. **Task 2: Apply original design styles to deck grid and study session** - `e9dc1c6` (feat)

## Files Created/Modified

- `src/app/[lang]/[deck]/page.tsx` - Server component: validates params, loads Card[], renders StudySession
- `src/app/[lang]/[deck]/StudySession.tsx` - Client component: quiz flow with original card-flip design
- `src/app/[lang]/page.tsx` - Deck grid with themed `.deck-card.theme-*` tiles
- `src/app/globals.css` - Added `@import "../style-reference.css"`
- `src/style-reference.css` - Mediterranean design system (CSS variables, card flip, deck cards, buttons, progress)

## Decisions Made

- StudySession placed in a separate `.tsx` file (not inlined in page.tsx) to maintain the server/client component boundary required by Next.js
- Used the actual useSRS API (`isCardDueForDeck` + `updateCard`) rather than the idealized pseudocode in the plan (`getDueCards` + `markCard`)
- Due-card list built by filtering `cards.map((c, i) => ...)` through `isCardDueForDeck` at render time
- `style-reference.css` imported globally in `globals.css` (not scoped per component) — simpler and matches the original vanilla JS app's global CSS approach
- Deck theme class (`theme-teal`, `theme-red`, etc.) sourced directly from `deckMetadata[].theme`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed duplicate generateStaticParams from src/app/[lang]/page.tsx**
- **Found during:** Task 1 build verification
- **Issue:** `[lang]/page.tsx` had both `'use client'` and `export function generateStaticParams()`. Next.js 16 disallows this combination on a page file and exits build with error.
- **Fix:** Removed the `generateStaticParams` export from `[lang]/page.tsx` since it is already declared in `[lang]/layout.tsx`.
- **Files modified:** `src/app/[lang]/page.tsx`
- **Verification:** `bun run build` exits 0 after fix
- **Committed in:** `a70aa2c` (Task 1 commit)

**2. [Continuation] Applied original design styles post-human-verify**
- **Found during:** Task 2 human verification
- **Issue:** Minimal Tailwind placeholder UI did not match the original purolingua.com design
- **Fix:** Imported `style-reference.css` and applied original CSS classes to both pages
- **Files modified:** `src/app/globals.css`, `src/app/[lang]/page.tsx`, `src/app/[lang]/[deck]/StudySession.tsx`, `src/style-reference.css`
- **Committed in:** `e9dc1c6`

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug) + 1 continuation styling fix
**Impact on plan:** Required for visual parity with original design.

## Issues Encountered
- Plan interfaces described `getDueCards(deckId, cards)` and `markCard(deckId, index, correct)`, but the actual useSRS hook (from Phase 11) exposes `isCardDueForDeck(deckId, index)` and `updateCard(deckId, index, correct)`. StudySession was implemented using the actual API.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 routing requirements satisfied: ROUTE-01 (home), ROUTE-02 (deck grid), ROUTE-03 (study session), ROUTE-04 (16 static paths)
- Visual design matches original purolingua.com Mediterranean style
- Phase 13 (if needed) can further refine i18n deck name labels and level filter chips UI

---
*Phase: 12-routing*
*Completed: 2026-03-05*
