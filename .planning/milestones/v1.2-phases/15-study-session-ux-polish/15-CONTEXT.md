# Phase 15: Study Session UX Polish - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Three targeted UX improvements to the active study session:
1. Audio playback per ChoiceButton (speak choice text on icon tap, without selecting the choice)
2. Feedback message overlay (correct/incorrect after choice selection, heard/not-recognized after voice)
3. Two distinct end-of-session screens: deck-complete (finished due cards for this deck) and all-done (no due cards remain across all decks)

Does NOT include new features, new game modes, stats tracking, or anything outside the study session view.

</domain>

<decisions>
## Implementation Decisions

### ChoiceButton audio behavior
- Tapping the 🔊 icon speaks the choice text only — does NOT select the choice as the answer
- `stopPropagation` required on the icon's click handler to prevent button's `onClick` from firing
- Audio works both BEFORE selection (preview) and AFTER selection (replay the pronunciation)
- Speaks choice text only (not front text + back text combined)
- Applies to card back only — choices only exist there, no card front change needed

### Feedback message design
- Position: inline, below the quiz options and above the controls row — no overlay, no z-index
- One unified `FeedbackMessage` component handles all four states (same visual style for voice and choice)
- Four messages (all localized via i18n):
  - `correct` → "Correct!" (existing `study.correct` key)
  - `incorrect` → "Incorrect" (existing `study.incorrect` key)
  - `heard` → "Heard" (new i18n key: `study.heard`)
  - `notRecognized` → "Not recognized" (new i18n key: `study.notRecognized`)
- Duration: visible until next card loads (aligns with existing 600ms `handleAnswer` flow — no extra timer needed)
- `FeedbackMessage` is shown when `selectedChoice !== null` (choice feedback) or after voice result

### End-of-session screens (styled inline, not modal overlays)
- **Two distinct states:**
  - `deck-complete`: user finished all due cards for this deck in this session (current `done === true` branch)
  - `all-done`: no due cards remain across all decks for this language (current `dueCards.length === 0` branch at session start, plus post-session check)
- **Styled inline screens** — improved version of existing done state, not modal dialogs with backdrops
- **Both screens offer two actions:**
  - Back to decks (existing link)
  - Study again (restart session with same deck — navigate to same URL or reset session state)
- **No stats or summary** — just a completion message per state
- New i18n keys needed:
  - `study.deckComplete` — "Deck complete!" or similar
  - `study.allDone` — already exists ("Hai finito per oggi! Torna domani.") — reuse or update wording
  - `study.studyAgain` — "Study again" button label

### Claude's Discretion
- Exact CSS/Tailwind styling for FeedbackMessage (colors for correct/incorrect/heard/notRecognized)
- Exact CSS/Tailwind for improved done screens
- Whether FeedbackMessage uses a colored background pill, border, or plain text
- Study again behavior: reset session state in place (re-snapshot dueCards) vs navigate to same URL

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ChoiceButton.tsx`: already renders `<span className="quiz-audio-icon" aria-hidden="true">🔊</span>` (line 20) — needs `onClick` wired with `stopPropagation`; accepts `lang` prop addition or audio called from parent
- `AudioButton.tsx`: `use client` + Web Speech API TTS pattern — replicate for choice audio (or pass `onSpeak` callback into ChoiceButton)
- `StudySession.tsx`: `handleChoiceClick(index)` drives the 600ms answer flow — `FeedbackMessage` shows when `selectedChoice !== null`; done state at lines 47–66 needs replacing with new styled screens
- `useVoiceRecognition.ts`: `startListening(onResult, onError)` — voice feedback (`heard` / `notRecognized`) fires in those callbacks before `setMicState`

### Established Patterns
- `use client` component + browser API guard (`if (typeof window === 'undefined') return`)
- Manual tap to trigger (no auto-speak) — matches AudioButton and MicButton
- i18n via `useTranslations('study')` in StudySession — all new strings go in `messages/it.json` and `messages/es.json` under `study`
- `stopPropagation` precedent: not yet used, but standard React pattern — safe to introduce in icon handler

### Integration Points
- `ChoiceButton.tsx`: add `onSpeak?: () => void` prop (or inline AudioButton logic); icon span becomes `<button>` or gains `onClick` with `stopPropagation`
- `StudySession.tsx`: add `FeedbackMessage` component between `.quiz-options` and `.controls`; replace done state JSX with two new screen components; check all-decks due status for `all-done` determination
- `messages/it.json` + `messages/es.json`: add `study.heard`, `study.notRecognized`, `study.deckComplete`, `study.studyAgain` keys

</code_context>

<specifics>
## Specific Ideas

- The 🔊 icon in ChoiceButton already exists as a non-functional span — this phase wires it to actually speak
- "Heard" and "Not recognized" are the voice feedback labels — consistent with the phase goal wording
- The all-done determination for the cross-deck check: check `isCardDueForDeck` across all `DECK_IDS` for the current `lang`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 15-study-session-ux-polish*
*Context gathered: 2026-03-07*
