# Phase 19: Q&A Study Session - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full Q&A study session UI at `/[lang]/qa/[scenario]`. Users see a target-language question, select from 4 target-language responses, get feedback, and SRS progress is saved via `useQASRS`. No native language text appears anywhere in the session.

</domain>

<decisions>
## Implementation Decisions

### Card interaction pattern
- No flip — Q&A is not a flip-card interaction
- Question sits inside a `.card-face`-styled container (reuses existing card chrome: rounded corners, background, shadow)
- Question text centered in the card; audio button (🔊) centered below the question text
- MicButton (🎤) sits inside the card container alongside the audio button — same row as AudioButton
- 4 choice buttons rendered as a grid below the card container (same `.quiz-options` layout as Rephrase back-of-card)
- After choice selected: correct/incorrect highlights + FeedbackMessage fires → 600ms delay → auto-advance to next card
- No manual "Next" button — same auto-advance pattern as Rephrase mode

### Voice recognition behavior
- MicButton is shown (when `isSupported`) inside the question card area — not below the choices
- Spoken input is matched (case-insensitive, trimmed, normalized) against `correctIt` or `correctEs` depending on lang
- Match → correct feedback + SRS advance, same as tapping the correct choice button
- No match (wrong word, gibberish, a foil phrase) → `notRecognized` feedback, mic resets to idle, no SRS update, choices remain available
- Foil phrases spoken aloud are treated the same as any non-matching input — `notRecognized`, not `incorrect`

### All-done scope
- After the last due card in a scenario, check all 7 scenarios for the current language
- All scenarios have 0 due Q&A cards → show all-done screen
- At least one scenario still has due cards → show scenario-done screen
- If `dueCards.length === 0` at session mount (user opens a scenario with nothing due), immediately show the appropriate done screen — no special empty state
- Scenario-done screen: heading + "Back to scenarios" (→ `/[lang]/qa`) + "Study again" button (re-snaps due cards, restarts session)
- All-done screen: heading + "Back to scenarios" + "Study again"

### Session copy and i18n
- Add Q&A-specific keys to the existing `study` namespace (no new namespace)
- New keys needed:
  - `study.backToScenarios` — back button label (Rephrase keeps `study.backToDecks`)
  - `study.scenarioDone` — scenario-done heading: "Scenario complete!"
  - `study.allScenariosDone` — all-done heading: "All scenarios done!"
- Reused keys (no change):
  - `study.studyAgain` — reused as-is for both done screens
  - `study.cardCounter` — reused as-is for progress counter
- Apply to both `src/locales/it/` and `src/locales/es/` (or wherever next-intl messages live)

### Claude's Discretion
- Exact CSS class reuse strategy for the no-flip card container (whether to use `.card-face` directly or a new wrapper with the same styles)
- Exact normalization logic for voice-match (punctuation stripping, accent handling)
- Progress bar and card counter placement (same pattern as Rephrase)
- Specific `theme-*` class for the QA session page if any styling differs from Rephrase

</decisions>

<specifics>
## Specific Ideas

- Layout visual confirmed:
  ```
  ┌───────────────────────────────┐
  │      Che cosa prendi?         │
  │       [  🔊  ]  [  🎤  ]      │
  └───────────────────────────────┘

  [ Un caffè, grazie. ]  [ Vorrei dell'acqua. ]
  [ No, grazie.       ]  [ Il conto, per fav. ]
  ```
- Auto-advance pattern: choice tap → highlight → FeedbackMessage → 600ms → next card (exact same timing as Rephrase)
- End screens:
  ```
  🏆 Scenario complete!
  [ Back to scenarios ]  [ Study again ]

  All scenarios done!
  [ Back to scenarios ]  [ Study again ]
  ```

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StudySession.tsx` — reference implementation for session state machine (index, done, allDone, selectedChoice, micState, feedbackState, resetSession, handleAnswer)
- `AudioButton` — drop-in reuse; props: `phrase` (question text), `lang`
- `ChoiceButton` — drop-in reuse; props: `text`, `state`, `onClick`, `disabled`, `onSpeak`
- `FeedbackMessage` — drop-in reuse; prop: `state` ('correct' | 'incorrect' | 'heard' | 'notRecognized' | null)
- `MicButton` — drop-in reuse; props: `state`, `onPress`
- `useVoiceRecognition(lang)` — returns `{ isSupported, isListening, startListening }`; same hook, same usage pattern
- `useQASRS(lang, scenarioId)` — returns `{ dueCards, updateCard, hasProgress }`; Phase 17 hook, replaces `useSRS` for Q&A
- `scenarios` array from `src/data/qa/index.ts` — used to check all 7 scenarios for all-done logic

### Established Patterns
- Session state snapshotted at mount with `useState(() => ...)` — prevents SRS updates mid-session from re-filtering due cards
- `handleAnswer(isCorrect)` calls `updateCard(...)`, advances index, checks all-done condition
- MicButton press: call `startListening(onMatch, onNoMatch)` pattern — same as Rephrase `handleFrontMicPress` / `handleBackMicPress`
- `LANG_LOCALE` map (`{ it: 'it-IT', es: 'es-ES' }`) used by `speak()` helper — duplicate needed in QAStudySession or extract to `src/lib/speak.ts` (DEBT-01, not required this phase)
- `generateStaticParams` lives in layout.tsx (not page.tsx) because page.tsx is `'use client'`

### Integration Points
- `src/app/[lang]/qa/[scenario]/page.tsx` — replace placeholder with server component that loads scenario data and renders `QAStudySession`
- `src/app/[lang]/qa/[scenario]/QAStudySession.tsx` (new) — `'use client'` component; parallel to `StudySession.tsx`
- `src/locales/it/*.json` + `src/locales/es/*.json` — add `backToScenarios`, `scenarioDone`, `allScenariosDone` to `study` namespace
- `src/data/qa/index.ts` — `scenarios` array imported for all-done check (all 7 scenarios × `useQASRS` per scenario)

</code_context>

<deferred>
## Deferred Ideas

- Extract `speak()` helper to `src/lib/speak.ts` — DEBT-01, already tracked in STATE.md, out of scope for Phase 19
- English context hints or translations shown after incorrect answer — explicitly out of scope (REQUIREMENTS.md: no native language once activity begins)

</deferred>

---

*Phase: 19-q-a-study-session*
*Context gathered: 2026-03-09*
