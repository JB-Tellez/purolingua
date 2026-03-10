---
phase: 18-activity-picker-and-scenario-browser
plan: 01
subsystem: ui
tags: [nextjs, routing, i18n, testing, next-intl, vitest]

# Dependency graph
requires:
  - phase: 17-qa-data
    provides: useQASRS hook and QA data types needed by ScenarioGrid (Phase 18 Plans 02-03)
provides:
  - Rephrase route subtree at /[lang]/rephrase with layout, page, and [deck]/ sub-routes
  - ActivityPicker and ScenarioGrid Wave 0 test scaffolds (5 todo tests)
  - Dynamic SiteHeader back navigation via segments.slice(0, -1)
  - activities.rephrase and activities.qa i18n keys in both locale files
affects:
  - 18-02-activity-picker-component
  - 18-03-scenario-grid-component

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Layout-level generateStaticParams: move static param generation to layout.tsx when page.tsx is 'use client'"
    - "Wave 0 test scaffold: it.todo() stubs define expected behavior before components exist"
    - "Dynamic back navigation: segments.slice(0, -1).join('/') drops last path segment generically"

key-files:
  created:
    - src/app/[lang]/rephrase/layout.tsx
    - src/app/[lang]/rephrase/page.tsx
    - src/app/[lang]/rephrase/[deck]/page.tsx
    - src/app/[lang]/rephrase/[deck]/StudySession.tsx
    - src/app/[lang]/rephrase/[deck]/StudySessionNoSSR.tsx
    - src/__tests__/components/ActivityPicker.test.tsx
    - src/__tests__/components/ScenarioGrid.test.tsx
  modified:
    - src/components/SiteHeader.tsx
    - messages/it.json
    - messages/es.json
    - src/__tests__/components/StudySession.test.tsx

key-decisions:
  - "Layout-level generateStaticParams in rephrase/layout.tsx because rephrase/page.tsx is 'use client' (cannot coexist with generateStaticParams)"
  - "Wave 0 test scaffolds use it.todo() not it.skip() — todo shows as pending in output, skip would show differently"
  - "Old src/app/[lang]/[deck]/ deleted in this plan; src/app/[lang]/page.tsx left intact for Plan 02 to replace with ActivityPicker"
  - "StudySession backLink updated from /${lang} to /${lang}/rephrase — returns to rephrase deck browser not root"

patterns-established:
  - "Route nesting pattern: activity sub-routes live under /[lang]/[activity-name]/ with their own layout.tsx"
  - "Test scaffold pattern: it.todo() for Wave 0, real assertions added in implementation plan"

requirements-completed:
  - ACTPICK-01
  - QAFLOW-01
  - QAFLOW-02

# Metrics
duration: 15min
completed: 2026-03-09
---

# Phase 18 Plan 01: Structural Foundation Summary

**Rephrase route moved to /[lang]/rephrase, SiteHeader back nav made depth-aware, Wave 0 test scaffolds for ActivityPicker and ScenarioGrid created with it.todo() stubs**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-09T20:45:00Z
- **Completed:** 2026-03-09T20:50:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Created rephrase route subtree (layout + page + [deck]/) under src/app/[lang]/rephrase/
- Removed old src/app/[lang]/[deck]/ directory; deck study pages now live under rephrase
- Fixed SiteHeader back nav to drop last path segment generically (works for 2-level and 3-level routes)
- Added activities.rephrase and activities.qa i18n keys to both it.json and es.json
- Created Wave 0 test scaffolds for ActivityPicker (2 todos) and ScenarioGrid (3 todos)

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 test scaffolds** - `9d276ba` (test)
2. **Task 2: Restructure routes** - `c58efac` (feat)
3. **Task 3: SiteHeader back nav + i18n keys** - `9a03aca` (feat)

## Files Created/Modified
- `src/app/[lang]/rephrase/layout.tsx` - generateStaticParams for 16 lang x deck combos; layout wrapper
- `src/app/[lang]/rephrase/page.tsx` - Rephrase deck browser (copy of [lang]/page.tsx, deck links updated to /[lang]/rephrase/[deck])
- `src/app/[lang]/rephrase/[deck]/page.tsx` - DeckPage server component (verbatim copy)
- `src/app/[lang]/rephrase/[deck]/StudySession.tsx` - Study session client component; backLink updated to /[lang]/rephrase
- `src/app/[lang]/rephrase/[deck]/StudySessionNoSSR.tsx` - Dynamic import wrapper (verbatim copy)
- `src/__tests__/components/ActivityPicker.test.tsx` - Wave 0 scaffold: 2 it.todo() tests for ACTPICK-01
- `src/__tests__/components/ScenarioGrid.test.tsx` - Wave 0 scaffold: 3 it.todo() tests for QAFLOW-01
- `src/components/SiteHeader.tsx` - backHref changed from `/${lang}` to dynamic segments.slice(0, -1)
- `messages/it.json` - Added activities.rephrase and activities.qa keys
- `messages/es.json` - Added matching activities.rephrase and activities.qa keys
- `src/__tests__/components/StudySession.test.tsx` - Import path updated to rephrase/[deck]/StudySession

## Decisions Made
- Layout-level generateStaticParams in rephrase/layout.tsx because page.tsx must be 'use client' and Next.js prohibits coexisting generateStaticParams on client pages
- Wave 0 scaffolds use it.todo() (not it.skip()) — todo tests appear as pending in vitest output, signaling work remaining
- src/app/[lang]/page.tsx intentionally left unchanged — Plan 02 replaces it with ActivityPicker
- StudySession backLink updated to /[lang]/rephrase so "Back to decks" returns to the rephrase browser, not the root picker

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated StudySession.test.tsx import path**
- **Found during:** Task 2 (route restructure)
- **Issue:** src/__tests__/components/StudySession.test.tsx imported from @/app/[lang]/[deck]/StudySession — path no longer exists after old [deck]/ directory was deleted
- **Fix:** Updated import to @/app/[lang]/rephrase/[deck]/StudySession
- **Files modified:** src/__tests__/components/StudySession.test.tsx
- **Verification:** bun run test --run passed with all 76 tests green
- **Committed in:** c58efac (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking import)
**Impact on plan:** Necessary fix — test file would fail to compile without updated path. No scope creep.

## Issues Encountered
None beyond the import path fix above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Route structure is in place: /[lang]/rephrase and /[lang]/rephrase/[deck] are live
- src/app/[lang]/page.tsx is ready to be replaced with ActivityPicker in Plan 02
- Wave 0 test scaffolds are waiting for Plan 02 (ActivityPicker) and Plan 03 (ScenarioGrid) to implement real assertions
- No blockers.

---
*Phase: 18-activity-picker-and-scenario-browser*
*Completed: 2026-03-09*
