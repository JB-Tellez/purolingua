---
phase: 15-study-session-ux-polish
plan: "03"
subsystem: ui
tags: [react, speech-synthesis, next-intl, accessibility, aria, web-speech-api]

# Dependency graph
requires:
  - phase: 15-study-session-ux-polish-01
    provides: ChoiceButton onSpeak prop and i18n keys (heard, notRecognized, deckComplete, studyAgain)
  - phase: 15-study-session-ux-polish-02
    provides: FeedbackMessage component with 4 states + null

provides:
  - "Fully wired StudySession with speak helper for ChoiceButton audio, FeedbackMessage for choice/voice feedback, and two distinct end screens (deck-complete + all-done)"

affects:
  - End of Phase 15 — no further phase depends on this

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Module-level speak() helper with LANG_LOCALE map replicating AudioButton pattern for use in StudySession parent"
    - "feedbackState drives FeedbackMessage rendered both inside card-back (for quiz answers) and above controls (when flipped, for voice feedback)"
    - "allDecksEmpty: DECK_IDS.every() cross-deck check after last card to determine all-done vs deck-complete"
    - "resetSession() resets all local useState fields — simpler than using key prop to remount"

key-files:
  created: []
  modified:
    - src/app/[lang]/[deck]/StudySession.tsx

key-decisions:
  - "FeedbackMessage rendered in two positions: inside card-back div (quiz feedback) and outside card-container above controls (voice feedback when flipped)"
  - "resetSession() approach used over sessionKey remount — resets all state fields cleanly without unmounting/remounting component"
  - "allDecksEmpty check uses isCardDueForDeck per card per deck — same hook call used throughout session, no new API needed"
  - "allDone state checked before done state in render to ensure all-done screen takes priority when both could be true"

patterns-established:
  - "Two-position FeedbackMessage: inside card-back for immediate selection feedback, outside card-container for voice result feedback visible above controls"

requirements-completed: [UX-04, UX-05]

# Metrics
duration: 5min
completed: "2026-03-08"
---

# Phase 15 Plan 03: Wire Audio, FeedbackMessage, and End Screens into StudySession Summary

**StudySession fully wired: per-choice Web Speech audio via speak() helper, FeedbackMessage for correct/incorrect/heard/notRecognized states, and two distinct end-of-session screens (deck-complete vs all-done) with Study Again action**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-08T07:40:18Z
- **Completed:** 2026-03-08T07:45:00Z
- **Tasks:** 1 (+ 1 human-verify checkpoint)
- **Files modified:** 1

## Accomplishments
- Added module-level `speak(phrase, lang)` helper using Web Speech API and LANG_LOCALE map; passed as `onSpeak` closure to each ChoiceButton
- Added `feedbackState` useState and wired it to `handleChoiceClick` (correct/incorrect), `handleFrontMicPress` (heard/notRecognized), and `handleBackMicPress` (heard/notRecognized)
- Rendered FeedbackMessage inside the card-back quiz options area and outside the card-container above controls
- Replaced the single unified done screen with two distinct screens: deck-complete (`done && !allDone`) and all-done (`allDone || dueCards.length === 0`)
- Added DECK_IDS cross-deck check after last card to set allDone vs done
- Added resetSession() for Study Again; both end screens offer "Back to decks" (secondary) and "Study again" (primary) buttons
- Build: zero TypeScript errors; tests: 57/57 passed (no regressions)

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire audio, FeedbackMessage, and end-of-session screens into StudySession** - `4c7a842` (feat)

**Plan metadata:** (docs commit — pending checkpoint resolution)

## Files Created/Modified
- `src/app/[lang]/[deck]/StudySession.tsx` - speak helper, feedbackState, FeedbackMessage, deck-complete/all-done screens, resetSession

## Decisions Made
- FeedbackMessage is rendered in two positions in the JSX: inside the `.quiz-options` closing/card-back area for quiz choice feedback, and above the `.controls` divs for voice recognition feedback when the card is flipped. This gives feedback visual proximity to its trigger in both interaction modes.
- `resetSession()` resets all local state fields rather than using a `key` prop to remount the component. This avoids an unmount/remount and keeps the due cards snapshot frozen (study same due cards from start), which is the desired behavior.
- `allDone` state guard is checked before `done` in the render path to ensure that when a user finishes the last card and all decks are empty, the all-done screen takes precedence.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — build and tests passed on first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 15 implementation complete — all UX polish tasks wired into StudySession
- Human visual checkpoint remains open pending user verification of all 7 behavioral checks
- No further code changes expected after checkpoint approval

---
*Phase: 15-study-session-ux-polish*
*Completed: 2026-03-08*
