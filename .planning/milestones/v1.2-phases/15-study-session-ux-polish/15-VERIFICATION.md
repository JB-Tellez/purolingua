---
phase: 15-study-session-ux-polish
verified: 2026-03-08T18:30:00Z
status: gaps_found
score: 6/9 must-haves verified
re_verification: false
gaps:
  - truth: "bun run test passes with no regressions"
    status: failed
    reason: "VOICE-13 and VOICE-14 tests in StudySession.test.tsx both fail — they search for role='button' named /revealAnswer/i to flip the card, but no such button exists in StudySession. The card flips on div click, not a labeled button."
    artifacts:
      - path: "src/__tests__/components/StudySession.test.tsx"
        issue: "Tests at lines 159 and 199 call screen.getByRole('button', { name: /revealAnswer/i }) which does not match any element in the rendered DOM. The card-container is a div with onClick, not an accessible button."
      - path: "src/app/[lang]/[deck]/StudySession.tsx"
        issue: "No button with accessible name 'revealAnswer' exists. Card flips on click of .card-container div only."
    missing:
      - "Either add an explicit button (e.g. revealAnswer key from i18n) to flip the card so tests can target it, OR update the tests to click the card-container div directly."
  - truth: "All UX-01 through UX-05 requirement IDs are recorded in REQUIREMENTS.md"
    status: failed
    reason: "UX-01, UX-02, UX-03, UX-04, and UX-05 are referenced in all three plan frontmatter blocks but do not appear anywhere in .planning/REQUIREMENTS.md. These requirement IDs are orphaned — the requirement definitions and traceability entries are missing."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "No UX-* section exists. The file ends at VOICE-14 with no UX requirements defined."
    missing:
      - "Add a UX Requirements section to REQUIREMENTS.md defining UX-01 through UX-05 with descriptions matching the Phase 15 features."
      - "Add traceability rows for UX-01 through UX-05 to the Traceability table mapping them to Phase 15."
      - "Update the Coverage count from 39 to 44."
human_verification:
  - test: "Speaker icon per ChoiceButton speaks text without selecting"
    expected: "Tapping the 🔊 icon on any ChoiceButton triggers speech synthesis for that choice text; the choice is not selected and no visual answer state changes."
    why_human: "Web Speech API (speechSynthesis) cannot be verified programmatically in a headless test environment."
  - test: "FeedbackMessage correct/incorrect visual styling"
    expected: "Correct answer shows green text ('Corretto'/'Correcto'); incorrect shows red text ('Sbagliato'/'Incorrecto') below the choice buttons."
    why_human: "Color rendering requires visual inspection."
  - test: "FeedbackMessage disappears on next card"
    expected: "After feedback is shown for an answer, advancing to the next card clears the feedback message."
    why_human: "Requires timing interaction with the 600ms timeout; not covered by existing tests."
  - test: "Deck-complete screen vs all-done screen differentiation"
    expected: "Finishing all due cards in one deck while others remain shows 'Mazzo completato!' / '¡Mazo completado!'; finishing when all decks are empty shows 'Hai finito per oggi!' / '¡Terminado por hoy!'."
    why_human: "Requires real SRS state manipulation across multiple decks to trigger the cross-deck check."
  - test: "Study again resets session to same due card set"
    expected: "Tapping 'Studia ancora'/'Estudiar de nuevo' restarts the session from card 1 of the same snapshot."
    why_human: "Requires human interaction with the end screen and verification that card count and order match the original session."
---

# Phase 15: Study Session UX Polish — Verification Report

**Phase Goal:** Add audio icon per ChoiceButton (speak option text on click), feedback message overlay (correct/incorrect/heard/not-recognized), and deck-complete/all-done end-of-session screens.
**Verified:** 2026-03-08T18:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All four i18n keys exist in both it.json and es.json under the study namespace | VERIFIED | Both files contain `heard`, `notRecognized`, `deckComplete`, `studyAgain` under `study` at lines 53-56 |
| 2 | ChoiceButton accepts `onSpeak` prop; speaker icon calls it with stopPropagation without selecting the choice | VERIFIED | `ChoiceButton.tsx` line 8: `onSpeak?: () => void`; span with `onClick: e.stopPropagation(); onSpeak?.()` |
| 3 | FeedbackMessage renders nothing when state is null | VERIFIED | `FeedbackMessage.tsx` line 20: `if (state === null) return null` |
| 4 | FeedbackMessage renders correct i18n key text for each of the four states | VERIFIED | 5 unit tests in `FeedbackMessage.test.tsx` pass; component maps state to `t(state)` with COLOR_CLASS record |
| 5 | FeedbackMessage is wired into StudySession (import + render) | VERIFIED | `StudySession.tsx` line 11: import; lines 272, 277: rendered in two positions |
| 6 | onSpeak wired to speak() helper in StudySession per ChoiceButton | VERIFIED | `StudySession.tsx` line 267: `onSpeak={() => speak(choice.text, lang)}` |
| 7 | feedbackState set on correct/incorrect choice click and voice results | VERIFIED | `handleChoiceClick` line 213, `handleFrontMicPress` lines 148/151/157, `handleBackMicPress` lines 174/177/183 |
| 8 | Deck-complete and all-done end screens exist with Back to decks and Study again actions | VERIFIED | Lines 91-135: two separate `if` blocks; deck-complete uses `t('deckComplete')`, all-done uses `t('allDone')`; both have `resetSession` and back link |
| 9 | bun run test passes with no regressions | FAILED | 2 of 57 tests fail: VOICE-13 and VOICE-14 in `StudySession.test.tsx` — both fail with `TestingLibraryElementError: Unable to find role="button" name /revealAnswer/i` |

**Score:** 6/9 truths verified (or 8/9 for implementation-only truths — test regression is the sole blocker)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `messages/it.json` | study.heard, study.notRecognized, study.deckComplete, study.studyAgain | VERIFIED | All 4 keys present at lines 53-56 |
| `messages/es.json` | study.heard, study.notRecognized, study.deckComplete, study.studyAgain | VERIFIED | All 4 keys present at lines 53-56 |
| `src/components/ChoiceButton.tsx` | onSpeak prop + stopPropagation on icon | VERIFIED | Lines 8, 26-29; span[role=button] pattern |
| `src/components/FeedbackMessage.tsx` | 4-state + null component | VERIFIED | 33-line component; COLOR_CLASS record; null short-circuit |
| `src/__tests__/components/FeedbackMessage.test.tsx` | 5 passing unit tests | VERIFIED | All 5 tests pass |
| `src/app/[lang]/[deck]/StudySession.tsx` | Wired with FeedbackMessage, onSpeak, end screens | VERIFIED | FeedbackMessage imported and rendered in 2 positions; speak() helper at module level; two end screen branches |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/ChoiceButton.tsx` | Web Speech API (via speak callback) | `onSpeak` prop called on icon click | WIRED | `onSpeak?.()` called in icon span onClick; stopPropagation present |
| `src/__tests__/components/FeedbackMessage.test.tsx` | `src/components/FeedbackMessage.tsx` | `import FeedbackMessage from '@/components/FeedbackMessage'` | WIRED | Line 8 |
| `src/app/[lang]/[deck]/StudySession.tsx` | `src/components/FeedbackMessage.tsx` | import + render between quiz-options and controls | WIRED | Line 11 import; lines 272 (inside card-back) and 277 (outside card-container) |
| `src/app/[lang]/[deck]/StudySession.tsx` | `src/components/ChoiceButton.tsx` | `onSpeak` prop passing a `speak()` closure for each choice | WIRED | Line 267: `onSpeak={() => speak(choice.text, lang)}` |
| `src/app/[lang]/[deck]/StudySession.tsx` | `src/data/decks.ts` (DECK_IDS) | all-done check: `DECK_IDS.every(...)` | WIRED | Line 14 import; lines 198-205: `DECK_IDS.every(id => ...)` cross-deck check |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| UX-01 | 15-01-PLAN.md | (no definition in REQUIREMENTS.md) | ORPHANED | i18n keys confirmed in message files; no requirement entry exists |
| UX-02 | 15-01-PLAN.md | (no definition in REQUIREMENTS.md) | ORPHANED | ChoiceButton onSpeak prop confirmed; no requirement entry exists |
| UX-03 | 15-02-PLAN.md | (no definition in REQUIREMENTS.md) | ORPHANED | FeedbackMessage component with 5 tests confirmed; no requirement entry exists |
| UX-04 | 15-03-PLAN.md | (no definition in REQUIREMENTS.md) | ORPHANED | FeedbackMessage wired into StudySession confirmed; no requirement entry exists |
| UX-05 | 15-03-PLAN.md | (no definition in REQUIREMENTS.md) | ORPHANED | End screens with resetSession confirmed; no requirement entry exists |

**Note:** All 5 requirement IDs (UX-01 through UX-05) referenced across the three Phase 15 plans are entirely absent from `.planning/REQUIREMENTS.md`. The implementation satisfies the intended behaviors, but the requirements themselves were never formally defined in the requirements document, and the traceability table has no rows for Phase 15.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/__tests__/components/StudySession.test.tsx` | 159, 199 | Test queries `role="button" name=/revealAnswer/i` which does not exist in component DOM | BLOCKER | VOICE-13 and VOICE-14 fail on every run; phase cannot be declared clean |

No anti-patterns found in the three implementation files (`ChoiceButton.tsx`, `FeedbackMessage.tsx`, `StudySession.tsx`).

---

## Human Verification Required

### 1. ChoiceButton Audio Preview

**Test:** Open `/it/restaurant` in a browser. On the card back (after flipping), tap the 🔊 icon on each choice button.
**Expected:** Speech synthesis speaks the choice text; no choice is selected and the button does not show correct/incorrect state.
**Why human:** Web Speech API cannot be asserted in jsdom/Vitest environment.

### 2. FeedbackMessage Visual Colors

**Test:** Select a correct answer, then an incorrect answer.
**Expected:** Correct shows green text below choices; incorrect shows red text.
**Why human:** CSS color rendering requires visual inspection; classes `text-green-600` and `text-red-500` cannot be inspected for rendered pixel values in test environment.

### 3. FeedbackMessage Clears on Next Card

**Test:** Select an answer (see feedback message appear), then advance to the next card.
**Expected:** Feedback message disappears when the next card loads.
**Why human:** The 600ms auto-advance timeout is difficult to verify reliably without fake timers in a browser context.

### 4. Deck-complete vs All-done Screen

**Test:** Complete all due cards in one deck (deck-complete), then repeat with all decks exhausted (all-done).
**Expected:** Deck-complete shows "Mazzo completato!" with Study again; all-done shows "Hai finito per oggi!" with Study again.
**Why human:** Requires real localStorage SRS state manipulation across multiple decks to trigger the `allDecksEmpty` cross-deck check path.

### 5. Study Again Action

**Test:** On either end screen, tap the "Studia ancora" button.
**Expected:** Session restarts from card 1 with the same due card snapshot; card counter shows "1 di N".
**Why human:** Requires end-to-end interaction flow to verify resetSession() correctly re-presents cards.

---

## Gaps Summary

Two gaps block a clean pass:

**Gap 1 — Test regression (blocker):** VOICE-13 and VOICE-14 fail because the test code searches for a `role="button"` named `revealAnswer` to flip the card to the back, but StudySession does not render any such button. The card flips on click of a plain `div.card-container`. The fix is either: (a) add an accessible reveal button to StudySession (the `revealAnswer` i18n key exists in both message files), or (b) update the two tests to simulate the div click instead.

**Gap 2 — Missing requirements definition (documentation):** UX-01 through UX-05 appear in plan frontmatter as requirement IDs but are completely absent from REQUIREMENTS.md. This breaks requirement traceability for the phase and leaves the coverage count at 39 rather than the expected 44. The implementation exists and was verified against the plans; only the formal requirements document is missing these entries.

---

_Verified: 2026-03-08T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
