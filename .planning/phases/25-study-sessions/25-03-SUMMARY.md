---
phase: 25-study-sessions
plan: 03
subsystem: ui
tags: [vue, nuxt, study-session, srs, qa, speech-synthesis, voice-recognition]

# Dependency graph
requires:
  - phase: 25-01
    provides: QASession selector contracts and test stubs (data-session-done, data-choice, etc.)
  - phase: 22-composables
    provides: useQASRS, useSRS, useLevelFilter, useVoiceRecognition composables
  - phase: 23-i18n-messages-and-leaf-components
    provides: AudioButton, ChoiceButton, MicButton, FeedbackMessage components
provides:
  - Full Q&A StudySession page at app/pages/qa/[scenario].vue
  - 4-choice multiple-choice session with Fisher-Yates shuffled choices
  - Correct/incorrect feedback with retry-on-wrong behavior (no card advance on wrong)
  - SessionDueCards snapshot pattern preventing mid-session card skipping
  - All-scenarios-done check using isScenarioHasDue across all scenarios
  - UI-07 requirement satisfied
affects: [phase-26, qa-routes, study-sessions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - sessionDueCards ref snapshotted in onMounted from qaComputedDue.value
    - handleAnswer called only on correct answers (updateCard with true only)
    - Fisher-Yates shuffle for 4 choices (1 correct + 3 foils)
    - isScenarioHasDue helper checks all scenarios using raw progress ref + isCardDue

key-files:
  created: []
  modified:
    - app/pages/qa/[scenario].vue
    - tests/nuxt/QASession.test.ts

key-decisions:
  - "ScenarioId 'coffee' not 'caffe' — caffe.ts exports id:'coffee'; tests use /it/qa/coffee route"
  - "updateCard called only with true (correct answers only) — wrong answers retry without SRS update"
  - "isScenarioHasDue uses raw progress ref for all-scenarios-done check — consistent with plan interface"
  - "speak() helper inlined — DEBT-01 extraction still deferred"

patterns-established:
  - "QASession: choices computed from currentCard (acceptable — card-scoped, not session-scoped)"
  - "QASession: wrong answer resets selectedChoice + feedbackState after 800ms (no advance)"
  - "QASession: correct answer advances after 600ms via handleAnswer()"

requirements-completed: [UI-07]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 25 Plan 03: Q&A StudySession Summary

**Q&A session page with 4-choice multiple-choice, Fisher-Yates shuffled answers, retry-on-wrong SRS, and all-scenarios-done end screen**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T04:56:38Z
- **Completed:** 2026-03-13T04:59:11Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Replaced Q&A placeholder with full 310-line StudySession SFC
- 5 QASession tests GREEN (including 3 previously skipped); full 88-test nuxt suite passes
- ClientOnly wrapping prevents SSR hydration mismatches on Q&A routes
- SessionDueCards snapshotted as ref in onMounted — no mid-session card skipping as SRS updates
- Wrong answer shows feedback and resets for retry without calling updateCard or advancing index
- Correct answer calls updateCard(id, true) then advances to next card

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement Q&A StudySession page** - `fbb9de6` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/pages/qa/[scenario].vue` - Full Q&A session SFC replacing placeholder (228 lines)
- `tests/nuxt/QASession.test.ts` - 5 GREEN tests; 3 previously-skipped tests enabled with /it/qa/coffee route

## Decisions Made
- ScenarioId for `caffe.ts` is `'coffee'` (not `'caffe'`) — tests use `/it/qa/coffee` route
- `updateCard` called only with `true` — wrong answers never write SRS progress
- `speak()` helper inlined again (DEBT-01 extraction still deferred per plan)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ScenarioId 'caffe' → 'coffee' in tests**
- **Found during:** Task 1 (test run)
- **Issue:** Test used route `/it/qa/caffe` but caffe.ts exports `id: 'coffee'`; scenario lookup returned undefined, causing 0 due cards
- **Fix:** Updated test routes to `/it/qa/coffee`
- **Files modified:** tests/nuxt/QASession.test.ts
- **Verification:** 5/5 tests pass
- **Committed in:** fbb9de6 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary correctness fix; no scope creep.

## Issues Encountered
- grep false-positive on sessionDueCards check: `computed()` uses `sessionDueCards` inside its body, but `sessionDueCards` itself is declared as `ref<QACard[]>([])` — verified by direct grep

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Q&A StudySession complete; UI-07 satisfied
- Phase 25 fully complete (all 3 plans done)
- Ready for phase 26 or final integration/deploy phase

---
*Phase: 25-study-sessions*
*Completed: 2026-03-13*
