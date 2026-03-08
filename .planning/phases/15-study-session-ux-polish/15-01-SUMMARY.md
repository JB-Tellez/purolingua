---
phase: 15-study-session-ux-polish
plan: 01
subsystem: ui
tags: [next-intl, i18n, react, speech-synthesis, accessibility]

# Dependency graph
requires:
  - phase: 14-voice-recognition
    provides: AudioButton speak pattern and LANG_LOCALE map (reference for speak approach)
provides:
  - "Four new study i18n keys in messages/it.json and messages/es.json (heard, notRecognized, deckComplete, studyAgain)"
  - "ChoiceButton onSpeak prop for per-choice audio preview via Web Speech API"
affects:
  - FeedbackMessage component (uses heard/notRecognized keys)
  - End-of-session screens (uses deckComplete/studyAgain keys)
  - StudySession (wires onSpeak callback to ChoiceButton)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "onSpeak callback prop pattern — speak logic lives in parent, ChoiceButton only calls onSpeak?.() on icon click"
    - "stopPropagation on nested interactive element to prevent outer button from firing"
    - "role=button + tabIndex on span to avoid invalid nested <button> HTML"

key-files:
  created: []
  modified:
    - messages/it.json
    - messages/es.json
    - src/components/ChoiceButton.tsx

key-decisions:
  - "Used span[role=button] instead of nested <button> for speaker icon — nesting <button> inside <button> is invalid HTML per spec, even though build passes"
  - "onKeyDown on icon span handles Enter/Space for keyboard accessibility (matching ARIA button keyboard contract)"
  - "onSpeak prop is optional (onSpeak?: () => void) so existing call sites without speech are unaffected"

patterns-established:
  - "Icon-as-button pattern: span[role=button][tabIndex=0][aria-label] with stopPropagation for nested interactivity inside buttons"

requirements-completed: [UX-01, UX-02]

# Metrics
duration: 8min
completed: 2026-03-07
---

# Phase 15 Plan 01: i18n Keys and ChoiceButton Audio Icon Summary

**Four study namespace i18n keys added to both locale files, and ChoiceButton wired with onSpeak prop so the speaker icon speaks any choice text independent of selection state.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-07T00:00:00Z
- **Completed:** 2026-03-07T00:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added heard, notRecognized, deckComplete, studyAgain keys to both messages/it.json and messages/es.json under the study namespace
- Wired ChoiceButton's existing non-functional speaker icon to an onSpeak?: () => void prop with stopPropagation
- Icon works before and after a choice is selected (outer button disabled state does not affect icon)
- Keyboard accessible — Enter/Space triggers onSpeak on the icon span

## Task Commits

Each task was committed atomically:

1. **Task 1: Add new i18n keys to both message files** - `ace5d97` (feat)
2. **Task 2: Wire speaker icon in ChoiceButton to speak choice text** - `81e6d46` (feat)

## Files Created/Modified
- `messages/it.json` - Added heard, notRecognized, deckComplete, studyAgain under study namespace
- `messages/es.json` - Added heard, notRecognized, deckComplete, studyAgain under study namespace
- `src/components/ChoiceButton.tsx` - Added onSpeak prop, made speaker icon interactive with stopPropagation

## Decisions Made
- Used `span[role=button]` instead of nested `<button>` for the speaker icon. HTML spec forbids interactive content (buttons) inside `<button>` elements; using a span with ARIA roles achieves the same accessibility contract without invalid HTML.
- Added onKeyDown for Enter/Space to fulfill the ARIA button keyboard contract on the span.
- onSpeak is optional so existing ChoiceButton call sites (that haven't been updated to pass onSpeak yet) compile and render without errors.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used span[role=button] instead of nested button element**
- **Found during:** Task 2 (Wire speaker icon in ChoiceButton)
- **Issue:** Plan specified `<button>` inside `<button>` which is invalid HTML per spec — browsers reparse the DOM unpredictably
- **Fix:** Used `<span role="button" tabIndex={0} aria-label="audio">` with onKeyDown for keyboard access — identical functional behavior, valid HTML
- **Files modified:** src/components/ChoiceButton.tsx
- **Verification:** Build passes, stopPropagation works, icon is not disabled by outer button state
- **Committed in:** 81e6d46 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - invalid HTML structure corrected)
**Impact on plan:** Corrects an HTML validity issue with no functional change. All plan requirements met.

## Issues Encountered
None — tasks executed cleanly. Build passed first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- i18n keys for FeedbackMessage (heard/notRecognized) and end-of-session screens (deckComplete/studyAgain) are in place
- ChoiceButton onSpeak prop ready for StudySession to wire up Web Speech API calls (passing speak closure from parent)
- Plans 02 and 03 can now consume these building blocks

---
*Phase: 15-study-session-ux-polish*
*Completed: 2026-03-07*
