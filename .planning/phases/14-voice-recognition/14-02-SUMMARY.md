---
phase: 14-voice-recognition
plan: 02
subsystem: ui
tags: [voice-recognition, SpeechRecognition, react-hook, component, vitest, tdd]

# Dependency graph
requires:
  - phase: 14-voice-recognition
    plan: 01
    provides: SpeechRecognition mock (MockSpeechRecognition + mockRecognitionInstance) in setup.ts and stub test files

provides:
  - useVoiceRecognition(lang) hook — isSupported, isListening, startListening, stopListening
  - MicButton controlled component — state: idle | listening | error, onPress callback
  - VOICE-01 through VOICE-06 real test assertions in useVoiceRecognition.test.ts
  - VOICE-08 and VOICE-09 real test assertions in MicButton.test.tsx

affects:
  - 14-03 (StudySession integration wires useVoiceRecognition + MicButton into study flow)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useVoiceRecognition captures RecognitionClass at render time via getSpeechRecognition() so isSupported is computed from snapshot of window at hook init"
    - "MicButton is purely presentational — caller owns state, passed as idle | listening | error prop"
    - "vi.fn() mocks used as SpeechRecognition constructors must use regular function (not arrow) so new() works"

key-files:
  created:
    - src/hooks/useVoiceRecognition.ts
    - src/components/MicButton.tsx
  modified:
    - src/__tests__/hooks/useVoiceRecognition.test.ts
    - src/__tests__/components/MicButton.test.tsx
    - src/__tests__/setup.ts
    - src/style-reference.css

key-decisions:
  - "RecognitionClass captured at render time (not in startListening) so isSupported reflects window state at mount"
  - "MockSpeechRecognition uses regular function not arrow function — arrow functions cannot be used as constructors with new()"
  - "MicButton renders with aria-label='Listening...' (ellipsis char U+2026) when listening, 'Start speaking' otherwise"
  - "mic-btn CSS mirrors audio-btn sizing/shape; mic-btn--listening uses mic-pulse keyframe; mic-btn--error uses color-error variable"

patterns-established:
  - "SpeechRecognition hook: getSpeechRecognition() helper for window/webkit fallback + SSR guard"
  - "Presentational button components: state prop drives className suffix (mic-btn--listening, mic-btn--error)"

requirements-completed: [VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05, VOICE-06, VOICE-08, VOICE-09]

# Metrics
duration: 5min
completed: 2026-03-06
---

# Phase 14 Plan 02: Voice Recognition Hook and MicButton Summary

**useVoiceRecognition hook with SpeechRecognition/webkitSpeechRecognition fallback and MicButton controlled component with idle/listening/error visual states — 10 tests green (VOICE-01 through VOICE-09)**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-06T06:03:26Z
- **Completed:** 2026-03-06T06:05:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Implemented `useVoiceRecognition(lang)` hook with `getSpeechRecognition()` helper, SSR guard, webkitSpeechRecognition fallback, and `startListening(onResult, onError)` / `stopListening()` API
- Replaced all 6 VOICE-01 through VOICE-06 stub tests with real `renderHook` + `act` assertions against `mockRecognitionInstance`
- Implemented `MicButton` controlled component mirroring `ChoiceButton` pattern — state-driven class names (`mic-btn--listening`, `mic-btn--error`) and aria-label
- Added mic-btn CSS to style-reference.css with `mic-pulse` keyframe animation for listening state
- Full test suite grows from 46 to 52 passing tests; zero regressions

## Task Commits

1. **Task 1: useVoiceRecognition hook and replace stubs** - `125eea1` (feat)
2. **Task 2: MicButton component and replace stubs** - `1fbc322` (feat)

## Files Created/Modified
- `src/hooks/useVoiceRecognition.ts` — Hook: isSupported, isListening, startListening, stopListening
- `src/components/MicButton.tsx` — Presentational button with three visual states
- `src/__tests__/hooks/useVoiceRecognition.test.ts` — Real assertions replacing VOICE-01–06 stubs
- `src/__tests__/components/MicButton.test.tsx` — Real assertions replacing VOICE-08–09 stubs
- `src/__tests__/setup.ts` — Fixed MockSpeechRecognition to use regular function for new() compatibility
- `src/style-reference.css` — Added mic-btn, mic-btn--listening, mic-btn--error CSS and mic-pulse keyframe

## Decisions Made
- `RecognitionClass` is captured at render time (outside `startListening`) so `isSupported` reflects the window state at mount — consistent with how the AudioButton SSR guard works
- `MockSpeechRecognition = vi.fn(function() { return mockRecognitionInstance; })` — arrow functions cannot be used as constructors with `new`, so a regular function is required; this is a bug in the Plan 01 stub that had to be fixed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MockSpeechRecognition constructor incompatibility**
- **Found during:** Task 1 (useVoiceRecognition implementation)
- **Issue:** `vi.fn(() => mockRecognitionInstance)` uses an arrow function — arrow functions cannot be called with `new`, causing "() => mockRecognitionInstance is not a constructor" runtime error
- **Fix:** Changed to `vi.fn(function() { return mockRecognitionInstance; })` in setup.ts
- **Files modified:** src/__tests__/setup.ts
- **Verification:** All 6 VOICE-01–06 tests pass after fix
- **Committed in:** 125eea1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in mock factory from Plan 01)
**Impact on plan:** Essential fix for constructor compatibility. No scope creep.

## Issues Encountered
None beyond the MockSpeechRecognition constructor bug (documented above as deviation).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `useVoiceRecognition` and `MicButton` are fully tested and ready for Plan 03 integration
- Plan 03 wires `useVoiceRecognition` into `StudySession` — mic button on card front (speak to flip) and card back (speak to match choice)
- All VOICE-01 through VOICE-09 requirements complete; VOICE-10 through VOICE-14 remain for Plan 03

---
*Phase: 14-voice-recognition*
*Completed: 2026-03-06*
