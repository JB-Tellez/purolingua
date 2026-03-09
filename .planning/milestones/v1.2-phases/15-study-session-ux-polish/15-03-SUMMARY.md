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
duration: 35min
completed: "2026-03-08"
---

# Phase 15 Plan 03: Wire Audio, FeedbackMessage, and End Screens into StudySession Summary

**StudySession fully wired: per-choice Web Speech audio via speak() helper, FeedbackMessage for correct/incorrect/heard/notRecognized states, and two distinct end-of-session screens (deck-complete vs all-done) with Study Again action**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-07T23:41:32-08:00
- **Completed:** 2026-03-08T10:15:14-07:00
- **Tasks:** 1 (+ 2 auto-fixed deviations, 1 human-verify checkpoint approved)
- **Files modified:** 1

## Accomplishments
- Added module-level `speak(phrase, lang)` helper using Web Speech API and LANG_LOCALE map; passed as `onSpeak` closure to each ChoiceButton
- Added `feedbackState` useState and wired it to `handleChoiceClick` (correct/incorrect), `handleFrontMicPress` (heard/notRecognized), and `handleBackMicPress` (heard/notRecognized)
- Rendered FeedbackMessage inside the card-back quiz options area and outside the card-container above controls
- Replaced the single unified done screen with two distinct screens: deck-complete (`done && !allDone`) and all-done (`allDone || dueCards.length === 0`)
- Added DECK_IDS cross-deck check after last card to set allDone vs done
- Added resetSession() for Study Again; both end screens offer "Back to decks" (secondary) and "Study again" (primary) buttons
- Build: zero TypeScript errors; tests: 57/57 passed (no regressions)
- Human visual verification of all 7 behavioral checks passed

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire audio, FeedbackMessage, and end-of-session screens into StudySession** - `4c7a842` (feat)
2. **Fix: Move choices useMemo above early returns (hooks violation)** - `ccdffab` (fix)
3. **Fix: Gira button flips back to card front without advancing** - `753aeee` (fix)

**Plan metadata:** docs commit follows this summary

## Files Created/Modified
- `src/app/[lang]/[deck]/StudySession.tsx` - speak helper, feedbackState, FeedbackMessage, deck-complete/all-done screens, resetSession, bugfixes for hooks order and Gira button

## Decisions Made
- FeedbackMessage is rendered in two positions in the JSX: inside the `.quiz-options` closing/card-back area for quiz choice feedback, and above the `.controls` divs for voice recognition feedback when the card is flipped. This gives feedback visual proximity to its trigger in both interaction modes.
- `resetSession()` resets all local state fields rather than using a `key` prop to remount the component. This avoids an unmount/remount and keeps the due cards snapshot frozen (study same due cards from start), which is the desired behavior.
- `allDone` state guard is checked before `done` in the render path to ensure that when a user finishes the last card and all decks are empty, the all-done screen takes precedence.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed React hooks violation — choices useMemo called after early returns**
- **Found during:** Task 1 (Wire FeedbackMessage, ChoiceButton audio, and end screens)
- **Issue:** The `choices` useMemo hook was placed after the `allDone`/`done`/`dueCards.length === 0` early returns. React's Rules of Hooks require all hooks to be called unconditionally before any early return. This caused a "Rendered fewer hooks than expected" crash when an end screen was shown.
- **Fix:** Moved the `choices` useMemo call above all early returns so hook call order is stable on every render.
- **Files modified:** `src/app/[lang]/[deck]/StudySession.tsx`
- **Verification:** Build passes, no runtime crash on end screen, all tests pass
- **Committed in:** `ccdffab`

**2. [Rule 1 - Bug] Fixed Gira button advancing the card instead of flipping back**
- **Found during:** Human visual verification checkpoint
- **Issue:** The Gira (flip back) button on the card back was calling `handleAnswer(false)`, which marked the card as incorrect, consumed it from the queue, and advanced to the next card. The intended UX is to let the user flip back to the card front to re-read before deciding.
- **Fix:** Changed Gira button's `onClick` from `handleAnswer(false)` to `setFlipped(false)` so it simply un-flips the card without advancing.
- **Files modified:** `src/app/[lang]/[deck]/StudySession.tsx`
- **Verification:** Human visual check confirmed — Gira flips back to card front, same card shown, no queue advancement
- **Committed in:** `753aeee`

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs)
**Impact on plan:** Both fixes were required for correct runtime behavior and correct UX intent. No scope creep.

## Issues Encountered
None beyond the two auto-fixed bugs above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 15 (Study Session UX Polish) is fully complete — all 3 UX features shipped and verified by human review
- StudySession is production-ready: audio per choice, immediate feedback after each answer, appropriate end screens
- No further code changes expected for this plan

---
*Phase: 15-study-session-ux-polish*
*Completed: 2026-03-08*
