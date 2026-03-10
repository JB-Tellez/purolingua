---
phase: 19-q-a-study-session
plan: 01
subsystem: ui
tags: [i18n, next-intl, vitest, testing, qa-mode]

# Dependency graph
requires:
  - phase: 19-q-a-study-session
    provides: context decisions for Q&A session i18n keys and test behaviors
provides:
  - Italian and Spanish i18n keys for Q&A session UI (backToScenarios, scenarioDone, allScenariosDone)
  - Test scaffold with 11 it.todo() stubs for QAStudySession — ready for Plan 02 to implement
affects: [19-02, QAStudySession.tsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "it.todo() scaffold pattern: create pending stubs in Plan N, implement bodies in Plan N+1"
    - "Add Q&A-specific keys to existing study namespace — no new namespace created"

key-files:
  created:
    - src/__tests__/components/QAStudySession.test.tsx
  modified:
    - messages/it.json
    - messages/es.json

key-decisions:
  - "19-01: Q&A keys appended after studyAgain in study namespace — no reordering of existing keys"
  - "19-01: Test scaffold uses it.todo() (not it.skip()) so stubs appear as pending in vitest output, signaling work remaining for Plan 02"
  - "19-01: vi.fn() stubs for useQASRS and useVoiceRecognition left unconfigured — Plan 02 sets return values per test"

patterns-established:
  - "it.todo() scaffold: Wave 0 plan creates stubs; wave 1 plan fills bodies — established in Phase 18, continued here"

requirements-completed:
  - QAFLOW-03
  - QAFLOW-04
  - QAFLOW-07
  - QAFLOW-08

# Metrics
duration: 6min
completed: 2026-03-10
---

# Phase 19 Plan 01: Q&A i18n Keys and Test Scaffold Summary

**Three Q&A i18n keys added to both language files and an 11-stub test scaffold created for QAStudySession**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-10T06:31:03Z
- **Completed:** 2026-03-10T06:37:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `study.backToScenarios`, `study.scenarioDone`, and `study.allScenariosDone` to `messages/it.json` and `messages/es.json`
- Created `src/__tests__/components/QAStudySession.test.tsx` with 11 `it.todo()` stubs covering all QAStudySession behaviors
- Full test suite remains green: 86 tests pass, 11 todo stubs pending, 0 failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Q&A i18n keys to both message files** - `46d04cb` (feat)
2. **Task 2: Create QAStudySession test scaffold with it.todo() stubs** - `b969224` (test)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `messages/it.json` - Added backToScenarios, scenarioDone, allScenariosDone to study namespace
- `messages/es.json` - Added backToScenarios, scenarioDone, allScenariosDone to study namespace
- `src/__tests__/components/QAStudySession.test.tsx` - New test scaffold with 11 it.todo() stubs and module mocks

## Decisions Made

- Q&A keys appended after `studyAgain` — existing key order preserved, no reordering
- Test scaffold uses `it.todo()` not `it.skip()` — pending tests surface clearly in vitest output, signaling work remaining for Plan 02
- Module mocks for `useQASRS` and `useVoiceRecognition` use bare `vi.fn()` — Plan 02 configures return values per individual test

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 can immediately begin implementing test bodies in `QAStudySession.test.tsx` — all 11 stubs are in place
- Plan 02 can use `study.backToScenarios`, `study.scenarioDone`, and `study.allScenariosDone` from `useTranslations('study')`
- All 86 existing tests continue to pass — no regressions introduced

---
*Phase: 19-q-a-study-session*
*Completed: 2026-03-10*
