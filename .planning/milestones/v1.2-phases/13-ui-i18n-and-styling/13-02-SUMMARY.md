---
phase: 13-ui-i18n-and-styling
plan: "02"
subsystem: ui
tags: [next-intl, web-speech-api, react, typescript, multiple-choice, i18n]

# Dependency graph
requires:
  - phase: 13-ui-i18n-and-styling-01
    provides: messages/{lang}.json study namespace with all label keys
  - phase: 11-logic-and-tests
    provides: generateChoices lib and useSRS/useLevelFilter hooks

provides:
  - AudioButton client component using Web Speech API with it-IT/es-ES locale codes
  - ChoiceButton client component with idle/correct/incorrect CSS state
  - StudySession fully i18n'd — no hardcoded English strings remain
  - Multiple-choice quiz mode wired inside StudySession using generateChoices

affects: [12-routing, phase-14-if-any]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Client components that need browser APIs (speechSynthesis) use 'use client' directive"
    - "stopPropagation pattern: audio button inside clickable card-container div prevents accidental flip"
    - "generateChoices(correctCard, filteredCards) returns Choice[] — caller passes current card + full pool"

key-files:
  created:
    - src/components/AudioButton.tsx
    - src/components/ChoiceButton.tsx
  modified:
    - src/app/[lang]/[deck]/StudySession.tsx

key-decisions:
  - "generateChoices actual signature is (correctCard: Card, filteredCards: Card[]) returning Choice[] — plan interface was wrong (specified Card[] return); fixed to match real implementation"
  - "ChoiceButton disabled prop passed as selectedChoice !== null so all buttons lock after selection, correct one shows green, selected-wrong shows red"
  - "Both multiple-choice (ChoiceButton) and self-grade (Correct/Incorrect) controls shown simultaneously when flipped — user can use either"

patterns-established:
  - "i18n pattern: useTranslations('study') at top of component, all labels from t('key')"
  - "TTS voice selection: filter by lang prefix, prefer exact locale match, fallback to first match"

requirements-completed: [UI-02, UI-03, UI-04, I18N-02, STYLE-01]

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 13 Plan 02: UI Components and i18n Summary

**AudioButton (Web Speech API TTS) and ChoiceButton (multiple-choice UI) built; StudySession fully internationalized with next-intl replacing all hardcoded English strings**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-06T04:53:00Z
- **Completed:** 2026-03-06T04:55:11Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- AudioButton component speaks card front text via Web Speech API, selecting best voice for it-IT/es-ES locale
- ChoiceButton renders multiple-choice options with idle/correct/incorrect CSS state transitions
- StudySession replaces all 7 hardcoded English strings (Back to decks, Tap to reveal, Reveal Answer, Incorrect, Correct, All done, Card N of M) with t() calls
- Multiple-choice quiz mode wired using actual generateChoices API (Choice[] with isCorrect flag)
- Build passes, 37 unit tests green — no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Build AudioButton component** - `210b152` (feat)
2. **Task 2: Build ChoiceButton + update StudySession** - `2652531` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/components/AudioButton.tsx` - Client component, Web Speech API TTS with locale voice selection and stopPropagation
- `src/components/ChoiceButton.tsx` - Client component, quiz pill button with correct/incorrect CSS state
- `src/app/[lang]/[deck]/StudySession.tsx` - Updated: useTranslations for all strings, AudioButton on card front, ChoiceButton quiz-options on flip

## Decisions Made

- generateChoices actual API: `(correctCard: Card, filteredCards: Card[]) => Choice[]` — plan spec had wrong signature (Card[] return, index-based); adapted to use `choice.isCorrect` flag instead of front-text comparison
- Both multiple-choice and self-grade controls shown simultaneously after flip — preserves existing tested flip flow while adding quiz mode

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed generateChoices call to match actual function signature**
- **Found during:** Task 2 (Update StudySession)
- **Issue:** Plan specified `generateChoices(cards, originalIndex, 4)` returning `Card[]`, but actual implementation is `generateChoices(correctCard, filteredCards)` returning `Choice[] = { text: string; isCorrect: boolean }[]`
- **Fix:** Changed call to `generateChoices(currentCard, cards)`, updated choice rendering to use `choice.text` and `choice.isCorrect` instead of `choice.front` comparison
- **Files modified:** src/app/[lang]/[deck]/StudySession.tsx
- **Verification:** `bun run build` exits 0 with no TypeScript errors; 37 tests green
- **Committed in:** `2652531` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug/interface mismatch)
**Impact on plan:** Auto-fix essential for correctness — plan interface was inconsistent with implemented library. No scope creep.

## Issues Encountered

None beyond the auto-fixed generateChoices signature mismatch.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- AudioButton, ChoiceButton, and i18n'd StudySession are complete
- Phase 13 Plan 03 (if any) or phase wrap-up can proceed
- No blockers

---
*Phase: 13-ui-i18n-and-styling*
*Completed: 2026-03-06*
