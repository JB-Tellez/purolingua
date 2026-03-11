---
phase: 19-q-a-study-session
plan: "04"
subsystem: ui
tags: [react, vitest, testing-library, srs, qa-mode]

# Dependency graph
requires:
  - phase: 19-q-a-study-session
    provides: QAStudySession component wired end-to-end with choice buttons and SRS

provides:
  - handleChoiceClick gated on isCorrect — wrong answer resets state after 800ms, correct answer advances after 600ms
  - Tests covering wrong-answer no-advance and correct-answer advance paths

affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wrong-answer retry pattern: show feedback for 800ms then reset selectedChoice/feedbackState to null — user can re-attempt same card"
    - "TDD fix pattern: add failing test first, confirm RED, implement fix, confirm GREEN"

key-files:
  created: []
  modified:
    - src/app/[lang]/qa/[scenario]/QAStudySession.tsx
    - src/__tests__/components/QAStudySession.test.tsx

key-decisions:
  - "handleChoiceClick branches on isCorrect: correct path calls handleAnswer(true) after 600ms; wrong path calls setSelectedChoice(null)/setFeedbackState(null) after 800ms — no handleAnswer call, no updateCard call"
  - "Test updates: all tests that clicked choiceButtons[0] to trigger advancement were updated to explicitly find and click the correct-answer button — shuffle-safe"

patterns-established:
  - "Never use positional button index for test clicks when shuffle is involved — always find by text content"

requirements-completed:
  - QAFLOW-04

# Metrics
duration: 10min
completed: 2026-03-10
---

# Phase 19 Plan 04: Fix Wrong-Answer Auto-Advance Bug Summary

**handleChoiceClick gated on isCorrect: wrong answer stays on card and resets for retry after 800ms, SRS never called on wrong tap**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-10T22:12:00Z
- **Completed:** 2026-03-10T22:22:00Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Fixed UAT Test 3 bug: wrong-answer tap no longer auto-advances to next card
- Wrong answer shows red/green feedback then resets buttons to interactive after 800ms — user can retry
- SRS `updateCard` is only called when `isCorrect === true`
- Added new test "wrong answer does not auto-advance" covering the exact failure scenario
- Updated 4 existing tests that used `choiceButtons[0]` to explicitly find the correct-answer button — shuffle-safe

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix handleChoiceClick — block auto-advance on wrong answer** - `52dd7aa` (fix + test)

**Plan metadata:** (docs commit below)

_Note: TDD task — RED (failing test added first) then GREEN (fix implemented, all 12 tests pass)_

## Files Created/Modified
- `src/app/[lang]/qa/[scenario]/QAStudySession.tsx` - Fixed handleChoiceClick: branches on isCorrect, wrong path resets after 800ms
- `src/__tests__/components/QAStudySession.test.tsx` - New wrong-answer test + 4 tests updated to click correct button explicitly

## Decisions Made
- `handleChoiceClick` branches on `isCorrect`: correct fires `handleAnswer(true)` after 600ms; wrong resets `selectedChoice` and `feedbackState` after 800ms — identical to the voice non-match reset pattern already in `handleMicPress`
- Existing tests that used `choiceButtons[0]` were all updated to find the correct-answer by `textContent` — shuffle means index 0 is non-deterministic; explicit text lookup is canonical

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated pre-existing tests to click correct button by text, not positional index**
- **Found during:** Task 1 (GREEN phase — tests that expected advancement via `choiceButtons[0]` started failing after fix)
- **Issue:** `scenarioDone`, `allScenariosDone`, and `studyAgain` tests used `choiceButtons[0].click()` assuming it would advance the card. After the fix, if index 0 happened to be a foil, the card would not advance. This broke 2 tests.
- **Fix:** Updated all 3 affected tests to find the correct-answer button by `textContent?.includes('Un caffè, grazie.')` before clicking — deterministic regardless of shuffle order.
- **Files modified:** `src/__tests__/components/QAStudySession.test.tsx`
- **Verification:** All 12 tests pass; 98/98 total test suite passes
- **Committed in:** `52dd7aa` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test code exposed by fix)
**Impact on plan:** Necessary fix — tests were not shuffle-safe. No scope creep.

## Issues Encountered
None — TDD process proceeded cleanly (RED confirmed bug, GREEN fixed it in one iteration).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Bug fix complete; UAT Test 3 scenario now honoured
- v1.3 Q&A Mode milestone fully complete
- No blockers

---
*Phase: 19-q-a-study-session*
*Completed: 2026-03-10*
