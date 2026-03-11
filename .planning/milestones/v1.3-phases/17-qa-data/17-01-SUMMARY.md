---
phase: 17-qa-data
plan: 01
subsystem: types
tags: [typescript, qa-mode, types, bilingual]

# Dependency graph
requires: []
provides:
  - QACard interface with bilingual Italian/Spanish content fields
  - ScenarioId union type covering all 7 scenario identifiers
  - Scenario interface with level field for Phase 18 filter support
affects: [17-02, 17-03, 18-qa-browser]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Interface-first ordering: types defined before content files and hooks so Plans 02 and 03 can execute in parallel"
    - "Fixed-length tuple typing: foils typed as [string, string, string] not string[] for compile-time arity guarantee"

key-files:
  created: []
  modified:
    - src/types/index.ts

key-decisions:
  - "Append-only modification: new Q&A types added after existing ProgressRecord, no existing types changed"
  - "Bilingual fields inline on QACard (questionEs, correctEs, foilsEs) rather than nested object — simpler access pattern for components"
  - "Scenario.level field included now (not Phase 18) so content files authored in Phase 17-02 can tag level at creation time"

patterns-established:
  - "Bilingual content pattern: Italian base fields (question, correct, foils) + Es-suffixed Spanish parallel fields (questionEs, correctEs, foilsEs)"
  - "Fixed tuple pattern: [string, string, string] for foils guarantees exactly 3 foils at compile time"

requirements-completed:
  - QADATA-01
  - QADATA-02
  - QAFLOW-06

# Metrics
duration: 5min
completed: 2026-03-09
---

# Phase 17 Plan 01: QA Types Summary

**TypeScript interface contract for Q&A Mode — QACard with bilingual fields and fixed-tuple foils, ScenarioId union, and Scenario with Phase-18-ready level field**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-09T00:00:00Z
- **Completed:** 2026-03-09T00:05:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `ScenarioId` union type covering all 7 scenario identifiers (caffe, albergo, ristorante, strada, presentazioni, negozio, treno)
- Added `QACard` interface with Italian fields (question, correct, foils) and Spanish parallel fields (questionEs, correctEs, foilsEs) typed as fixed-length [string, string, string] tuples
- Added `Scenario` interface with `level: Level` field enabling Phase 18 browser filtering
- Confirmed pre-existing tsc error in FeedbackMessage.test.tsx (Vitest `vi` global) is unrelated to these changes and pre-dates this plan

## Task Commits

1. **Task 1: Add QACard, ScenarioId, and Scenario types** - `36f7e48` (feat)

## Files Created/Modified

- `src/types/index.ts` - Appended Q&A Mode types after existing ProgressRecord export

## Decisions Made

- Bilingual fields inline on QACard (questionEs, correctEs, foilsEs) rather than a nested object — simpler access pattern for rendering components
- Scenario.level field included in Phase 17 (not deferred to Phase 18) so content authored in 17-02 can set level at creation time
- Tuple typing [string, string, string] enforces exactly 3 foils at compile time, preventing arity bugs in QA rendering logic

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing tsc error `Cannot find name 'vi'` in `src/__tests__/components/FeedbackMessage.test.tsx` confirmed present before changes (verified via git stash + tsc run). Out of scope for this plan.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/types/index.ts` exports `QACard`, `ScenarioId`, and `Scenario` — Plans 17-02 (content) and 17-03 (hook) can now import against this contract
- No blockers

---
*Phase: 17-qa-data*
*Completed: 2026-03-09*
