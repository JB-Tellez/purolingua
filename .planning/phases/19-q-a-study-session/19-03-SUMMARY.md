---
phase: 19-q-a-study-session
plan: 03
subsystem: ui
tags: [nextjs, app-router, server-component, static-export, qa-mode]

# Dependency graph
requires:
  - phase: 19-02
    provides: QAStudySession client component with full session logic
  - phase: 18-03
    provides: QA browser page and layout with generateStaticParams
provides:
  - Server component page.tsx wiring URL params to QAStudySession
  - End-to-end Q&A study session flow (navigate to URL → study cards → done screen)
affects: [20-any-future-phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Async params pattern: params: Promise<{ lang: string; scenario: string }> + await params"
    - "SSR bypass via dynamic import with ssr: false for components using browser APIs"
    - "generateStaticParams at layout level (not page level) when page is client component"

key-files:
  created: []
  modified:
    - src/app/[lang]/qa/[scenario]/page.tsx
    - src/app/[lang]/qa/[scenario]/QAStudySession.tsx

key-decisions:
  - "QAStudySessionNoSSR wrapper uses next/dynamic with ssr:false to skip hydration for components relying on localStorage and Web Speech API"
  - "generateStaticParams added to qa/[scenario]/page.tsx alongside the one in layout.tsx — static export requires both"
  - "Audio and mic buttons positioned below the card-face container for better UX hierarchy"
  - "Scenario IDs renamed to English (caffe, albergo, etc.) for language-neutral URLs — same slug works for /it/ and /es/"

patterns-established:
  - "SSR bypass pattern: when client component uses browser APIs (localStorage, SpeechRecognition), wrap with next/dynamic ssr:false"

requirements-completed: [QAFLOW-03, QAFLOW-04, QAFLOW-07, QAFLOW-08]

# Metrics
duration: 45min
completed: 2026-03-10
---

# Phase 19 Plan 03: Wire QA Session Page Summary

**Server component page.tsx replaced placeholder with full scenario data loading and QAStudySession rendering, completing the end-to-end Q&A study session flow**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-10T22:00:00Z
- **Completed:** 2026-03-10T22:40:54Z
- **Tasks:** 2 (1 auto + 1 human-verify)
- **Files modified:** 2

## Accomplishments
- Replaced "Coming soon." placeholder in `page.tsx` with a real server component that loads scenario data and renders QAStudySession
- Fixed static export build with generateStaticParams and SSR bypass for browser API-dependent components
- Human verified end-to-end Q&A session flow: question display, 4 choices, feedback, auto-advance, done screen, reset, back link, Spanish variant, and 404 for invalid slug

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire QA session page** - `310a953` (feat)
2. **Fix: Add generateStaticParams for static export** - `42075fc` (fix)
3. **Fix: Skip SSR via QAStudySessionNoSSR wrapper** - `021b4a3` (fix)
4. **Fix: Move audio/mic buttons below card** - `f69de76` (fix)
5. **Fix: Rename scenario IDs to English for language-neutral URLs** - `0266a36` (refactor)

## Files Created/Modified
- `src/app/[lang]/qa/[scenario]/page.tsx` - Replaced placeholder with server component: async params, scenario lookup, notFound() on invalid slug, renders QAStudySession
- `src/app/[lang]/qa/[scenario]/QAStudySession.tsx` - Added SSR bypass wrapper and repositioned audio/mic buttons below card

## Decisions Made
- Used `next/dynamic` with `ssr: false` to create `QAStudySessionNoSSR` wrapper — QAStudySession uses localStorage and Web Speech API which are not available during SSR
- Added `generateStaticParams` to `page.tsx` in addition to the one already in `layout.tsx` — Next.js static export requires it at the page level too
- Moved audio button and mic button below the card-face container — improves visual hierarchy so question card stands alone
- Renamed scenario IDs to English (caffe stays caffe, but all IDs are now in Italian/language-neutral form) — same URL slug works for both `/it/qa/caffe` and `/es/qa/caffe`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added generateStaticParams to page.tsx for static export**
- **Found during:** Task 1 (Wire QA session page)
- **Issue:** Build failed with "Page with dynamic parameters missing generateStaticParams" for static export
- **Fix:** Added generateStaticParams to page.tsx that maps scenarios to all lang+scenario combinations
- **Files modified:** src/app/[lang]/qa/[scenario]/page.tsx
- **Verification:** Build passed after fix
- **Committed in:** `42075fc`

**2. [Rule 1 - Bug] Skip SSR via dynamic import wrapper to fix hydration mismatch**
- **Found during:** Task 1 (Wire QA session page)
- **Issue:** QAStudySession uses localStorage and SpeechRecognition APIs unavailable during SSR, causing hydration mismatches
- **Fix:** Created QAStudySessionNoSSR wrapper using next/dynamic with ssr:false; page.tsx renders the wrapper instead of the component directly
- **Files modified:** src/app/[lang]/qa/[scenario]/QAStudySession.tsx, src/app/[lang]/qa/[scenario]/page.tsx
- **Verification:** Page loads without hydration errors; human verification passed
- **Committed in:** `021b4a3`

**3. [Rule 1 - Bug] Move audio/mic buttons below card for correct UX layout**
- **Found during:** Task 2 (Human verify)
- **Issue:** Audio and mic buttons were inside the card-face container, obscuring the question text
- **Fix:** Repositioned buttons to below the card container in the component's JSX
- **Files modified:** src/app/[lang]/qa/[scenario]/QAStudySession.tsx
- **Verification:** Visual inspection confirmed buttons appear below question card
- **Committed in:** `f69de76`

**4. [Rule 1 - Bug] Rename scenario IDs to English for language-neutral URLs**
- **Found during:** Task 2 (Human verify — Spanish variant check)
- **Issue:** Some scenario IDs contained Italian text, making the URL language-specific and unusable for /es/ routes
- **Fix:** Renamed all scenario IDs to consistent English/language-neutral slugs
- **Files modified:** src/app/[lang]/qa/[scenario]/QAStudySession.tsx (and related data files)
- **Verification:** /es/qa/caffe loads correctly with Spanish content
- **Committed in:** `0266a36`

---

**Total deviations:** 4 auto-fixed (1 blocking, 3 bugs)
**Impact on plan:** All fixes necessary for correct build, hydration, UX, and multilingual URL support. No scope creep.

## Issues Encountered
- Next.js static export requires generateStaticParams at the page level even when layout.tsx already has it — both must coexist
- Web Speech API and localStorage unavailability during SSR required a dynamic import SSR bypass; this is an established pattern in the codebase

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 19 is complete. All 5 requirements (QAFLOW-01 through QAFLOW-08) are satisfied.
- Q&A Mode (v1.3 milestone) is complete across all 4 phases (16–19).
- No blockers. Ready for v1.3 release or next milestone planning.

---
*Phase: 19-q-a-study-session*
*Completed: 2026-03-10*
