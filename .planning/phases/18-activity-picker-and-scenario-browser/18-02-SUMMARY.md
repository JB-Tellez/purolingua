---
phase: 18-activity-picker-and-scenario-browser
plan: 02
subsystem: ui
tags: [next-intl, react, next.js, tailwind, vitest, testing-library]

# Dependency graph
requires:
  - phase: 18-01
    provides: Wave 0 test scaffolds (it.todo stubs), activities i18n keys in messages/it.json and messages/es.json, /[lang]/rephrase route restructure
provides:
  - ActivityPicker component — two-card grid linking to /[lang]/rephrase and /[lang]/qa with i18n titles and descriptions
  - Updated src/app/[lang]/page.tsx — now renders ActivityPicker instead of DeckGrid
  - DeckGrid extracted to src/components/DeckGrid.tsx — standalone component with internal useSRS + useLevelFilter
  - .activity-grid CSS class added to src/style-reference.css
  - 5 passing ActivityPicker unit tests
affects: [18-03, 19-qa-session]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Activity route constant array: ACTIVITIES const with key/icon/path tuples drives both links and i18n calls"
    - "useTranslations('activities') with template key (${key}.title) enables single t() call per activity"
    - "DeckGrid extracted from page.tsx into own component — reduces page to pure layout shell"

key-files:
  created:
    - src/components/ActivityPicker.tsx
    - src/components/DeckGrid.tsx
  modified:
    - src/app/[lang]/page.tsx
    - src/__tests__/components/ActivityPicker.test.tsx
    - src/__tests__/components/DeckGrid.test.tsx
    - src/style-reference.css

key-decisions:
  - "DeckGrid extracted to src/components/DeckGrid.tsx because DeckGrid.test.tsx imported LangPage to reach DeckGrid — after LangPage was replaced with ActivityPicker, tests broke; extraction lets tests import DeckGrid directly"
  - "DeckGrid wrapper component takes lang prop and owns useSRS + useLevelFilter — matches prior LangPage hook ownership pattern"
  - "ActivityPicker uses deck-card CSS class (no badge span) — activity cards reuse existing tile styling without the due-count badge"

patterns-established:
  - "Route constant array pattern: ACTIVITIES const with key/icon/path drives all rendering — add new activity by adding one tuple"

requirements-completed: [ACTPICK-01]

# Metrics
duration: 12min
completed: 2026-03-09
---

# Phase 18 Plan 02: Activity Picker Summary

**ActivityPicker component with two-card grid (Rephrase + Q&A) replacing deck browser on /[lang] — i18n via useTranslations('activities'), 5/5 tests green**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-09T20:51:00Z
- **Completed:** 2026-03-09T21:03:00Z
- **Tasks:** 1 (TDD — RED/GREEN/fix)
- **Files modified:** 6

## Accomplishments
- Built ActivityPicker — two-card grid with emoji icons, i18n titles/descriptions, and Link hrefs to /[lang]/rephrase and /[lang]/qa
- Replaced LangPage deck browser with ActivityPicker (DeckGrid, LevelFilterChips, useSRS, useLevelFilter removed from page)
- Extracted DeckGrid into standalone src/components/DeckGrid.tsx with internal hook ownership
- Added .activity-grid CSS (2-col desktop, 1-col mobile) to style-reference.css
- 81/81 tests pass across full suite; 3 todo remain (Wave 0 for Plan 03)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build ActivityPicker + update lang page + pass tests** - `e89f504` (feat)

**Plan metadata:** (docs commit follows)

_Note: This task used TDD — tests written first, then component implemented to pass._

## Files Created/Modified
- `src/components/ActivityPicker.tsx` - Two-card activity selector; useTranslations('activities'); Links to /[lang]/rephrase and /[lang]/qa
- `src/components/DeckGrid.tsx` - DeckGrid extracted from page.tsx; standalone component with useSRS + useLevelFilter
- `src/app/[lang]/page.tsx` - Now renders ActivityPicker; DeckGrid and level filter hooks removed
- `src/__tests__/components/ActivityPicker.test.tsx` - 5 real tests replacing Wave 0 it.todo stubs; mocks next-intl and next/link
- `src/__tests__/components/DeckGrid.test.tsx` - Updated import from LangPage to DeckGrid component; removed next/navigation mock
- `src/style-reference.css` - Added .activity-grid and responsive @media rule

## Decisions Made
- DeckGrid extracted to own component because DeckGrid.test.tsx imported LangPage to test DeckGrid behavior. After LangPage was replaced with ActivityPicker, those 5 DeckGrid tests broke. Extracting DeckGrid to its own component restores clean import and test isolation.
- DeckGrid wrapper takes `lang` prop and internally calls `useSRS` + `useLevelFilter`, maintaining the same hook ownership pattern established in Phase 16-03.
- ActivityPicker reuses `.deck-card` styling without the `.deck-card-badge` span — activity tiles don't need due counts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DeckGrid.test.tsx broken after LangPage replaced with ActivityPicker**
- **Found during:** Task 1 (post-implementation full suite run)
- **Issue:** DeckGrid.test.tsx imported LangPage and expected it to render DeckGrid with due-count badges. After LangPage was replaced, 5 tests failed (element not found).
- **Fix:** Extracted DeckGrid into src/components/DeckGrid.tsx; updated DeckGrid.test.tsx to import DeckGrid directly and render `<DeckGrid lang="it" />` instead of `<LangPage />`; removed no-longer-needed `next/navigation` mock.
- **Files modified:** src/components/DeckGrid.tsx (created), src/__tests__/components/DeckGrid.test.tsx
- **Verification:** `bun run test --run` — 81 tests pass, 0 failures
- **Committed in:** e89f504 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — broken test from intentional page replacement)
**Impact on plan:** Necessary fix. DeckGrid extraction improves component architecture (was inline in page.tsx). No scope creep.

## Issues Encountered
- None beyond the DeckGrid test fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ActivityPicker live at /it and /es — users see Rephrase and Q&A cards
- Plan 03 (Scenario Browser) can import DeckGrid pattern for ScenarioGrid
- Wave 0 ScenarioGrid.test.tsx (3 it.skips) ready to be promoted to real tests in Plan 03

---
*Phase: 18-activity-picker-and-scenario-browser*
*Completed: 2026-03-09*

## Self-Check: PASSED
- src/components/ActivityPicker.tsx: FOUND
- src/components/DeckGrid.tsx: FOUND
- src/app/[lang]/page.tsx: FOUND (modified)
- src/__tests__/components/ActivityPicker.test.tsx: FOUND (5 tests pass)
- src/__tests__/components/DeckGrid.test.tsx: FOUND (5 tests pass)
- src/style-reference.css: FOUND (.activity-grid added)
- Commit e89f504: FOUND
