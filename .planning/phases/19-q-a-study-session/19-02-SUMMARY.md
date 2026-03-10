---
phase: 19-q-a-study-session
plan: 02
subsystem: ui
tags: [react, next-intl, vitest, qa-mode, voice-recognition, srs]

# Dependency graph
requires:
  - phase: 19-q-a-study-session
    provides: Q&A i18n keys (backToScenarios, scenarioDone, allScenariosDone), test scaffold with 11 it.todo() stubs
  - phase: 17-qa-data-and-hooks
    provides: useQASRS hook, QACard/Scenario types, scenario data barrel
  - phase: 18-qa-browser
    provides: ScenarioId types, scenario data, qa/[scenario]/page.tsx placeholder
provides:
  - QAStudySession client component with full Q&A study session UX
  - 11 implemented tests covering all QAFLOW requirements
affects: [19-03, qa-page-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Q&A session component parallel to StudySession.tsx — same state machine, Q&A semantics instead of flip-card"
    - "isScenarioHasDue helper: checks raw progress against isCardDue for all-done check across scenarios"
    - "bootstrapHasProgress pattern: read localStorage once at mount to seed useLevelFilter without calling useQASRS twice"
    - "vi.mock('@/lib/srs') with configurable isCardDueImpl for per-test all-done logic"

key-files:
  created:
    - src/app/[lang]/qa/[scenario]/QAStudySession.tsx
  modified:
    - src/__tests__/components/QAStudySession.test.tsx

key-decisions:
  - "19-02: bootstrapHasProgress reads localStorage directly at mount to break useLevelFilter/useQASRS circular dependency"
  - "19-02: isScenarioHasDue is a local helper (not hook) iterating allScenarios with raw progress — avoids calling useQASRS 7 times"
  - "19-02: Voice non-match resets feedbackState to null after 800ms (plus micState) — matches plan spec"
  - "19-02: Static import of QAStudySession in tests (not require()) — bracket path characters are literal directory names"

patterns-established:
  - "bootstrapHasProgress: single localStorage read at mount for hook bootstrapping when hooks have circular hasProgress dependency"
  - "isScenarioHasDue local helper: all-done check without calling 7 useQASRS instances"

requirements-completed:
  - QAFLOW-03
  - QAFLOW-04
  - QAFLOW-05
  - QAFLOW-07
  - QAFLOW-08

# Metrics
duration: 5min
completed: 2026-03-10
---

# Phase 19 Plan 02: QAStudySession Component and Tests Summary

**QAStudySession client component with 4-choice Q&A interaction, voice recognition, SRS advance, and all-done logic — 11 tests pass, 97 total**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-10T06:34:54Z
- **Completed:** 2026-03-10T06:39:54Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `QAStudySession.tsx` (388 lines) — 'use client' component with no-flip Q&A card interaction
- Renders question text (lang-resolved it/es) + AudioButton + MicButton (when supported) in card face
- 4 shuffled ChoiceButton elements from [correct, ...foils] via useMemo stable per card
- 600ms auto-advance, voice match/non-match, scenarioDone/allScenariosDone screens, study-again reset
- Implemented all 11 it.todo() stubs in QAStudySession.test.tsx — full test suite now passes

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement QAStudySession component** - `f7a247f` (feat)
2. **Task 2: Implement QAStudySession test suite** - `ff4f28c` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/[lang]/qa/[scenario]/QAStudySession.tsx` - New Q&A session client component (388 lines)
- `src/__tests__/components/QAStudySession.test.tsx` - Full test suite replacing 11 it.todo() stubs

## Decisions Made

- `bootstrapHasProgress` reads localStorage `{lang}-progress` directly at component mount to seed `useLevelFilter` without calling `useQASRS` twice — avoids React hook ordering violation
- `isScenarioHasDue` is a pure local function (not hook) that checks raw progress state for all 7 scenarios after the last card — avoids needing 7 concurrent `useQASRS` hook instances
- Voice non-match resets both `micState` and `feedbackState` after 800ms per plan spec
- Test file uses static import of QAStudySession (not `require()`) — bracket characters `[lang]` and `[scenario]` are literal directory names in Next.js App Router, not glob patterns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- First test run: `getByRole('button', { name: /audio/i })` matched multiple elements because ChoiceButton also has `aria-label="audio"` spans. Fixed test to query `.audio-btn` class directly (AudioButton's CSS class).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `QAStudySession.tsx` is fully implemented; `qa/[scenario]/page.tsx` still has the placeholder ("Coming soon.") from Phase 18
- Plan 03 needs to replace the placeholder page with a server component that loads the scenario and renders `<QAStudySession>`
- All 97 tests pass with no regressions

---
*Phase: 19-q-a-study-session*
*Completed: 2026-03-10*
