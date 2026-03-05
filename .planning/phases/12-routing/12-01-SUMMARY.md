---
phase: 12-routing
plan: "01"
subsystem: ui
tags: [nextjs, react, tailwind, deckgrid, srs, localization]

# Dependency graph
requires:
  - phase: 11-logic-and-tests
    provides: useSRS hook with localStorage progress state
  - phase: 10-data-migration
    provides: deckMetadata and DECK_IDS from src/data/decks.ts
provides:
  - DeckGrid client component rendering 8 deck tiles per language with due-count badges
  - /it and /es pages with functional deck grids linking to /[lang]/[deckId]
affects: [13-i18n, phase-13]

# Tech tracking
tech-stack:
  added: []
  patterns: [client-component-in-page-file, useparams-for-client-lang, progress-badge-from-localStorage]

key-files:
  created: []
  modified:
    - src/app/[lang]/page.tsx

key-decisions:
  - "Page is entirely 'use client' — DeckGrid and LangPage coexist in same file; setRequestLocale delegated to layout.tsx which already calls it"
  - "generateStaticParams cannot coexist with 'use client' in Next.js 16; layout.tsx export covers the [lang] segment for SSG"
  - "useSRS actual API (updateCard, isCardDueForDeck, hasProgress) differs from plan spec (getDueCount); due count computed from progress entries directly"
  - "Due badge counts localStorage progress keys starting with {deckId}_ where nextReview <= today; shows 0 for new users"

patterns-established:
  - "Client page pattern: 'use client' + useParams() for lang — avoids server/client boundary split when hook usage required"
  - "Due badge pattern: filter ProgressRecord keys by deckId prefix and compare nextReview to today ISO string"

requirements-completed: [ROUTE-01, ROUTE-02, ROUTE-04]

# Metrics
duration: 15min
completed: 2026-03-05
---

# Phase 12 Plan 01: Deck Grid Page Summary

**'use client' DeckGrid with due-count badges in /[lang]/page.tsx, rendering 8 Tailwind deck tiles per locale linking to /[lang]/[deckId]**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-05T17:30:00Z
- **Completed:** 2026-03-05T17:45:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced stub page.tsx with full DeckGrid + LangPage client components in same file
- DeckGrid filters deckMetadata by lang, renders 8 tiles with icon, name, and due-count badge
- Due-count badge computed from localStorage SRS progress without needing card data
- Build exits 0; out/it/index.html and out/es/index.html generated via SSG

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement DeckGrid client component inside /[lang]/page.tsx** - `a70aa2c` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `src/app/[lang]/page.tsx` - Replaced stub with 'use client' LangPage + DeckGrid; 8 deck tiles per lang with Tailwind styling and due-count badges

## Decisions Made

- Made the entire page `'use client'` to keep DeckGrid inline — Next.js prohibits `generateStaticParams` in client pages, so layout.tsx's export handles SSG for the [lang] segment
- Used `useParams()` instead of async `params` prop since the whole file is a client component
- Due count computed from `progress` object in useSRS by filtering keys with `{deckId}_` prefix and comparing `nextReview` to today's ISO date — avoids needing card count data (TODO Phase 13)
- Actual useSRS API differs from plan's interface spec: plan showed `getDueCount(deckId, cards)` but implementation exports `updateCard`, `isCardDueForDeck`, `hasProgress`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed generateStaticParams from page.tsx**
- **Found during:** Task 1 (build verification)
- **Issue:** Next.js 16 throws build error if a `'use client'` page also exports `generateStaticParams` — "App pages cannot use both 'use client' and export function 'generateStaticParams()'"
- **Fix:** Removed `generateStaticParams` and `routing` import from page.tsx; layout.tsx already exports it and covers all [lang] child pages
- **Files modified:** src/app/[lang]/page.tsx
- **Verification:** `bun run build` exits 0 with 22 static pages generated
- **Committed in:** a70aa2c

**2. [Rule 1 - Bug] useSRS interface mismatch — adapted due-count computation**
- **Found during:** Task 1 (reading actual useSRS implementation)
- **Issue:** Plan spec showed `getDueCount(deckId, cards)` but useSRS exports `updateCard`, `isCardDueForDeck`, `hasProgress` — no getDueCount function
- **Fix:** Computed due count by filtering ProgressRecord keys directly: `key.startsWith(\`${deck.id}_\`)` and `nextReview <= today`
- **Files modified:** src/app/[lang]/page.tsx
- **Verification:** Badge renders 0 for new users; increments when progress entries exist for the deck
- **Committed in:** a70aa2c

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug/adaptation)
**Impact on plan:** Both fixes necessary for build success and correctness. No scope creep.

## Issues Encountered

- The implementation for plan 12-01 was already included in commit `a70aa2c` which was labeled as 12-02 (study session page). The DeckGrid work was done as part of the prior agent's 12-02 execution. The task was verified complete: build passes, files match spec, out/it and out/es generated.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/it` and `/es` render 8 deck tiles each, linking to `/[lang]/[deckId]`
- Due-count badge shows 0 for new users; real counts wired in Phase 13 with actual card data
- Root `/` page.tsx confirmed untouched — links to /it and /es as per ROUTE-01
- Phase 13 (i18n + translations) can extract DeckGrid to components/ and add `useTranslations` for deck names

---
*Phase: 12-routing*
*Completed: 2026-03-05*
