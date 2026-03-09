# Phase 14: Voice Recognition - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Port VoiceRecognitionService from vanilla JS class to a `useVoiceRecognition` React hook. Add a mic button to the card front (speak the correct word to flip) and the card back (speak a choice text to auto-select it and trigger correct/incorrect result). Voice input must be meaningful — it only succeeds when the transcript matches.

</domain>

<decisions>
## Implementation Decisions

### Speak-to-flip (card front)
- Speech must match the card's front text — any speech does NOT flip the card
- Match is normalized: lowercase both sides, trim whitespace before comparing
- On match: flip immediately (no delay)
- On no-match: brief, discreet error indicator on the mic button, then reset to ready

### Speak-to-match (card back)
- Same normalization logic as front: lowercase + trim transcript, compare against each choice's `.back` text
- On match: behave exactly as if the user clicked that ChoiceButton — call `handleChoiceClick(matchedIndex)` which runs the 600ms delay and shows correct/incorrect state
- On no-match: brief, discreet error indicator on the mic button, then reset to ready

### Mic button UX
- Placed alongside the existing AudioButton (🔊) — same card-face position, small button cluster
- Manual tap only to start listening — no auto-start on flip
- Listening state: pulsing CSS animation on the mic button
- Error state: brief flash (discreet) on the mic button, same behavior on both front and back
- Mic button appears on both card front and card back

### Browser support
- Check `window.SpeechRecognition` first (standards API), then `window.webkitSpeechRecognition` (legacy prefix)
- If neither is available, hide the mic button entirely — no disabled state shown
- Hook exposes an `isSupported` boolean so the component can conditionally render

### Hook design
- New `useVoiceRecognition(lang: Lang)` hook in `src/hooks/`
- `continuous: false`, `interimResults: false` (same as vanilla JS)
- Locale from existing `LANG_LOCALE` pattern (`it-IT`, `es-ES`)
- Hook returns: `isSupported`, `isListening`, `startListening(onResult, onError)`, `stopListening`
- `use client` — browser API, no SSR

### Claude's Discretion
- Exact CSS animation for pulsing state
- Exact CSS for the brief error flash (color, duration)
- Mic button icon choice (emoji or SVG)
- Whether to extract a shared `MicButton` component or keep logic inline in StudySession

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AudioButton.tsx`: `use client` pattern, `LANG_LOCALE` map for `it-IT`/`es-ES` — reuse locale mapping in hook
- `ChoiceButton.tsx`: accepts `state: 'idle' | 'correct' | 'incorrect'` — voice drives same state, no changes needed to ChoiceButton
- `StudySession.tsx`: `handleChoiceClick(index)` already handles the full answer flow — voice just calls this with matched index
- `vanilla JS voice.js`: direct port target — `continuous: false`, `interimResults: false`, `onresult`/`onerror`/`onend` callbacks

### Established Patterns
- `use client` hook + component pattern (AudioButton, useSRS, useLevelFilter)
- Manual interaction (tap to trigger) — AudioButton does not auto-speak
- Browser API availability guard: `if (typeof window === 'undefined') return`

### Integration Points
- `StudySession.tsx` owns flip state and `handleChoiceClick` — mic button integrates here
- Card front: mic button added to `.card-front` alongside AudioButton
- Card back: mic button added to `.card-back` (or quiz-options area), passes matched index to `handleChoiceClick`
- `src/hooks/useVoiceRecognition.ts` — new file

</code_context>

<specifics>
## Specific Ideas

- Voice input must be meaningful — users should speak correctly, not just speak to advance. Incorrect speech shows a discreet error, not silence.
- Same error behavior on front and back: brief mic button flash, then reset.
- Match the existing AudioButton interaction model: tap to activate, no auto-trigger.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-voice-recognition*
*Context gathered: 2026-03-05*
