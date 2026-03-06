# Phase 14: Voice Recognition - Research

**Researched:** 2026-03-05
**Domain:** Web Speech API (SpeechRecognition), React hook patterns, browser API guards in Next.js static export
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Speak-to-flip (card front)**
- Speech must match the card's front text — any speech does NOT flip the card
- Match is normalized: lowercase both sides, trim whitespace before comparing
- On match: flip immediately (no delay)
- On no-match: brief, discreet error indicator on the mic button, then reset to ready

**Speak-to-match (card back)**
- Same normalization logic: lowercase + trim transcript, compare against each choice's `.text` field (from `Choice` interface in `generateChoices.ts`)
- On match: behave exactly as if the user clicked that ChoiceButton — call `handleChoiceClick(matchedIndex)` which runs the 600 ms delay and shows correct/incorrect state
- On no-match: brief, discreet error indicator on the mic button, then reset to ready

**Mic button UX**
- Placed alongside the existing AudioButton — same card-face position, small button cluster
- Manual tap only to start listening — no auto-start on flip
- Listening state: pulsing CSS animation on the mic button
- Error state: brief flash (discreet) on the mic button, same behavior on both front and back
- Mic button appears on both card front and card back

**Browser support**
- Check `window.SpeechRecognition` first (standards API), then `window.webkitSpeechRecognition` (legacy prefix)
- If neither is available, hide the mic button entirely — no disabled state shown
- Hook exposes an `isSupported` boolean so the component can conditionally render

**Hook design**
- New `useVoiceRecognition(lang: Lang)` hook in `src/hooks/`
- `continuous: false`, `interimResults: false`
- Locale from existing `LANG_LOCALE` pattern (`it-IT`, `es-ES`)
- Hook returns: `isSupported`, `isListening`, `startListening(onResult, onError)`, `stopListening`
- `use client` — browser API, no SSR

### Claude's Discretion
- Exact CSS animation for pulsing state
- Exact CSS for the brief error flash (color, duration)
- Mic button icon choice (emoji or SVG)
- Whether to extract a shared `MicButton` component or keep logic inline in StudySession

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 14 ports the vanilla JS `VoiceRecognitionService` class (from `main:src/js/features/voice.js`) to a `useVoiceRecognition(lang: Lang)` React hook and integrates a mic button into `StudySession.tsx`. The hook wraps `SpeechRecognition` / `webkitSpeechRecognition` with the exact same configuration as v1.1 (`continuous: false`, `interimResults: false`) and exposes a clean surface: `isSupported`, `isListening`, `startListening(onResult, onError)`, and `stopListening`.

The integration has two distinct behaviors. On the card front, a successful transcript (normalized: lowercase + trim) that matches `currentCard.front` flips the card. On the card back, the same normalization is applied against each `Choice.text` value from `generateChoices`; a match calls the existing `handleChoiceClick(matchedIndex)`. Both failure paths show a brief error state on the mic button, then reset. The existing `handleChoiceClick` already handles debouncing (the 600 ms delay) and the correct/incorrect visual state — the hook does not duplicate that logic.

Browser support is gated at render time: if neither `window.SpeechRecognition` nor `window.webkitSpeechRecognition` exists, `isSupported` is `false` and the mic button is not rendered. This matches the existing project pattern of silent feature degradation (`AudioButton` does the same with `window.speechSynthesis`).

**Primary recommendation:** Implement `useVoiceRecognition` as a thin, stable wrapper around the browser API. Keep all matching logic in `StudySession` where it can access `currentCard.front` and `choices` without prop drilling. Extract a `MicButton` component for reuse across card front and back.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Speech API (SpeechRecognition) | Browser native | Speech-to-text input | Already used in v1.1; no dependency needed |
| React (useState, useCallback, useRef) | 19 (project) | Hook state and lifecycle | Project standard |
| TypeScript | 5 (project) | Type-safe hook interface | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 3 (project) | Mic button and animation styles | All component styling |
| @testing-library/react (renderHook) | Project (already installed) | Unit test hook in jsdom | For testing hook state transitions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw SpeechRecognition in hook | `react-speech-recognition` npm package | Package adds ~15 KB, wraps same API — not worth it for this scope |
| Inline mic logic in StudySession | Shared `MicButton` component | Component is cleaner and reusable across card front + back |

**Installation:**
```bash
# No new dependencies needed — Web Speech API is browser-native
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   └── useVoiceRecognition.ts   # NEW — browser Speech API wrapper
├── components/
│   ├── AudioButton.tsx          # EXISTING — no changes
│   └── MicButton.tsx            # NEW — mic trigger + state display
└── app/[lang]/[deck]/
    └── StudySession.tsx         # MODIFY — integrate hook + MicButton
```

### Pattern 1: Browser API Hook with SSR Guard
**What:** `use client` hook that checks `typeof window === 'undefined'` before accessing `SpeechRecognition`. Sets `isSupported = false` on the server or when the API is absent.
**When to use:** Any browser-only API in a Next.js static export project.
**Example:**
```typescript
// Source: AudioButton.tsx pattern + vanilla voice.js
'use client';
import { useState, useRef, useCallback } from 'react';
import type { Lang } from '@/types';

const LANG_LOCALE: Record<Lang, string> = {
  it: 'it-IT',
  es: 'es-ES',
};

function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ?? null;
}

export function useVoiceRecognition(lang: Lang) {
  const RecognitionClass = getSpeechRecognition();
  const isSupported = !!RecognitionClass;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(
    (onResult: (transcript: string) => void, onError: () => void) => {
      if (!RecognitionClass) return;
      const rec = new RecognitionClass();
      rec.lang = LANG_LOCALE[lang];
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      };
      rec.onerror = () => {
        setIsListening(false);
        onError();
      };

      recognitionRef.current = rec;
      try { rec.start(); } catch { /* already started guard */ }
    },
    [lang, RecognitionClass]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
```

### Pattern 2: Transcript Normalization (shared utility)
**What:** Shared one-liner normalization used for both card-front and card-back matching.
**When to use:** Anywhere transcript is compared to display text.
**Example:**
```typescript
// Inline in StudySession or extractable to lib/normalizeText.ts
const normalize = (s: string) => s.toLowerCase().trim();

// Card front match:
if (normalize(transcript) === normalize(currentCard.front)) {
  setFlipped(true);
} else {
  triggerMicError();
}

// Card back match (choices is Choice[]):
const matchedIndex = choices.findIndex(
  (c) => normalize(c.text) === normalize(transcript)
);
if (matchedIndex !== -1) {
  handleChoiceClick(matchedIndex);
} else {
  triggerMicError();
}
```

### Pattern 3: Error Flash with setTimeout Reset
**What:** `useState<'idle' | 'listening' | 'error'>` on the `MicButton`. On error, set to `'error'` then schedule a `setTimeout` back to `'idle'`.
**When to use:** Brief, self-resetting visual feedback without a full state machine.
**Example:**
```typescript
// In MicButton or StudySession
function triggerMicError(setMicState: (s: 'idle' | 'listening' | 'error') => void) {
  setMicState('error');
  setTimeout(() => setMicState('idle'), 800); // 800 ms is discrete
}
```

### Pattern 4: MicButton as Controlled Component
**What:** `MicButton` receives `state: 'idle' | 'listening' | 'error'` and `onPress` callback — mirrors `ChoiceButton`'s design exactly.
**When to use:** Same pattern already established in the codebase.
**Example:**
```typescript
// MicButton.tsx
interface Props {
  state: 'idle' | 'listening' | 'error';
  onPress: () => void;
}
// Renders different classes/animations per state; never owns state itself
```

### Anti-Patterns to Avoid
- **Creating a new `SpeechRecognition` instance on every render:** The instance should be created inside `startListening` (per invocation) or stored in a `useRef`. Do not instantiate at hook init time — the API has strict lifecycle rules and Chrome in particular will throw if `start()` is called on an already-started instance.
- **Storing `RecognitionClass` in state:** It is a class constructor, not state. Capture it once outside the hook render or inside a `useRef`. Storing it in `useState` causes unnecessary re-renders.
- **Auto-starting on card flip:** CONTEXT.md is explicit — manual tap only. The vanilla JS version had a `startListening` that required explicit user gesture anyway (browser mic permission requires a user gesture in all modern browsers).
- **Calling `handleChoiceClick` before choices are rendered:** The mic button on the card back must not be tappable unless `flipped === true`. Conditionally render or disable accordingly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Speech-to-text | Custom audio capture + processing | `SpeechRecognition` browser API | Already available; v1.1 used it successfully |
| Locale selection | Custom language detection | Reuse `LANG_LOCALE` from `AudioButton.tsx` | Already exists; same `it-IT`/`es-ES` values |
| Error timeout state | Redux/complex state machine | `useState` + `setTimeout` | Two-step transition: error → idle; no library needed |

**Key insight:** The browser's SpeechRecognition API handles all audio capture, locale routing, and transcript production. The hook is purely a lifecycle adapter.

---

## Common Pitfalls

### Pitfall 1: webkitSpeechRecognition Prefix Missing
**What goes wrong:** Chrome (and Chrome-based browsers) still requires `webkitSpeechRecognition` in most versions despite having `SpeechRecognition` on the standards track. Checking only `window.SpeechRecognition` will return `undefined` on Chrome and the mic button will not appear.
**Why it happens:** The unprefixed `SpeechRecognition` is only available in Chromium 33+ behind a flag or in Firefox 85+; Chrome ships both but the `webkit` prefix is still the reliable path.
**How to avoid:** Always check `window.SpeechRecognition ?? window.webkitSpeechRecognition` in that order. This matches the CONTEXT.md decision and the vanilla JS source exactly.
**Warning signs:** `isSupported === false` on Chrome during manual testing.

### Pitfall 2: `rec.start()` Called While Already Active
**What goes wrong:** If the user taps the mic button again while recognition is running, calling `start()` throws `InvalidStateError`.
**Why it happens:** `SpeechRecognition` maintains its own internal state; calling `start()` twice is an error.
**How to avoid:** Guard with `if (isListening) return;` at the top of the `onPress` handler, or `stopListening()` before restarting. The vanilla JS source uses a `if (this.isListening) this.recognition.stop()` clean-restart pattern — the hook's `isListening` boolean makes the guard straightforward.
**Warning signs:** Console `DOMException: Failed to execute 'start' on 'SpeechRecognition'`.

### Pitfall 3: SSR / Hydration Mismatch
**What goes wrong:** `isSupported` is computed during server render as `false` (window not available), but on the client it may be `true`. If the mic button is rendered server-side and then conditionally shown client-side, React hydration can mismatch.
**Why it happens:** `typeof window === 'undefined'` is always true on the server.
**How to avoid:** Because this is a `use client` component inside `StudySession.tsx` (which is already `use client`), there is no server render for `StudySession`. The guard is still correct to include for correctness, but hydration mismatch will not occur in this codebase.
**Warning signs:** React console warning about hydration mismatch on initial load.

### Pitfall 4: Choice Text vs Card Back Text
**What goes wrong:** Matching the voice transcript against `choice.text` vs `currentCard.back` — these are the same for the correct answer but the voice matching must iterate over all choices (including distractors) so the user can voice-select any option including wrong answers.
**Why it happens:** The `Choice` interface has a `text` field (which equals `card.back` for the correct choice, or a foil's `back` for distractors). The card-back matching logic must use `choices[i].text`, not `currentCard.back`.
**How to avoid:** Match against `choices.findIndex(c => normalize(c.text) === normalize(transcript))`. This is documented in the CONTEXT.md normalization spec.
**Warning signs:** Voice only works for the correct answer; wrong-answer voice selection silently fails.

### Pitfall 5: Mic Permission Denied — Silent Error
**What goes wrong:** If the user denies microphone permission, `onerror` fires with `error: 'not-allowed'`. If the hook only checks `isSupported`, it will believe recognition works and the mic button will appear but never produce results.
**Why it happens:** `isSupported` tests for API presence, not permission state.
**How to avoid:** The `onError` callback passed to `startListening` handles this. The brief mic error flash covers the permission-denied case too — no special path needed. Just ensure `onerror` always calls the passed `onError` callback so the UI resets. Do not attempt to show a detailed permission error — the discreet flash is intentional.
**Warning signs:** Mic button never pulses after tap; no visible feedback.

---

## Code Examples

### Vanilla JS Source (Direct Port Reference)
```javascript
// Source: git show main:src/js/features/voice.js
// Key config that MUST be preserved:
this.recognition.continuous = false;      // stop after one utterance
this.recognition.interimResults = false;  // no partial results
this.recognition.lang = meta.locale;      // 'it-IT' or 'es-ES'

// Event handler pattern to port:
this.recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  if (this.onResultCallback) this.onResultCallback(transcript);
};
this.recognition.onerror = (event) => {
  if (this.onErrorCallback) this.onErrorCallback(event.error);
};
this.recognition.onend = () => {
  this.isListening = false;
};
```

### AudioButton Pattern (SSR Guard to Replicate)
```typescript
// Source: src/components/AudioButton.tsx
'use client';
// Guard at call site, not at module level:
function speak() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  // ...
}
```

### Existing Test Pattern (renderHook with jsdom)
```typescript
// Source: src/__tests__/hooks/useSRS.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => localStorage.clear());

it('hook updates state on action', () => {
  const { result } = renderHook(() => useMyHook('it'));
  act(() => { result.current.doSomething(); });
  expect(result.current.someState).toBe(expectedValue);
});
```

### handleChoiceClick Integration Point
```typescript
// Source: src/app/[lang]/[deck]/StudySession.tsx
function handleChoiceClick(choiceIndex: number) {
  if (selectedChoice !== null) return; // already answered — voice must check this too
  const isCorrect = choices[choiceIndex].isCorrect;
  setSelectedChoice(choiceIndex);
  setTimeout(() => handleAnswer(isCorrect), 600);
}
// Voice back-matching: call handleChoiceClick(matchedIndex) directly
// The 600 ms delay and correct/incorrect state are already handled here
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `webkitSpeechRecognition` only | Check `SpeechRecognition` first, then `webkit` fallback | 2023 (Chrome 33+) | Standards API is now present; webkit still needed for broad compat |
| Class-based service (`VoiceRecognitionService`) | Functional React hook | This phase | Enables React state integration without external subscription |

**Deprecated/outdated:**
- `webkitSpeechRecognition` as sole check: Chrome now exposes both; Firefox uses unprefixed only. Always check both.

---

## Open Questions

1. **`lang` prop reactivity in the hook**
   - What we know: The hook takes `lang: Lang` at init. `StudySession` is mounted for a single deck/lang route and never changes lang mid-session.
   - What's unclear: Whether `lang` needs to be a reactive dependency in the recognition instance.
   - Recommendation: Accept `lang` as a parameter and use it when constructing the recognition instance inside `startListening`. No reactivity needed since StudySession is unmounted on route change.

2. **Multiple rapid taps on mic button**
   - What we know: `isListening` state prevents duplicate `start()` calls if the guard is in place.
   - What's unclear: Whether `stopListening` should be called before the button becomes tappable again (i.e., should the mic button be disabled while `isListening === true`?).
   - Recommendation: Disable the mic button while `isListening === true`. This is consistent with AudioButton not being retriggerable during speech.

---

## Validation Architecture

> `nyquist_validation` key is absent from `.planning/config.json` — treated as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `bun run test --run` |
| Full suite command | `bun run test` |

### What CAN be tested (automated)

The Web Speech API itself is a browser native API that jsdom does not implement. However, the hook's **logic layer** and **component rendering** are fully testable by mocking the API.

**Strategy:** In `setup.ts`, add a `window.SpeechRecognition` mock that records calls and exposes a trigger function to simulate `onresult` and `onerror` events. This is the same pattern already used for `localStorage`.

```typescript
// Example mock shape to add to src/__tests__/setup.ts
const mockRecognitionInstance = {
  start: vi.fn(),
  stop: vi.fn(),
  onstart: null as (() => void) | null,
  onend: null as (() => void) | null,
  onresult: null as ((e: SpeechRecognitionEvent) => void) | null,
  onerror: null as ((e: SpeechRecognitionErrorEvent) => void) | null,
  lang: '',
  continuous: false,
  interimResults: false,
};
const MockSpeechRecognition = vi.fn(() => mockRecognitionInstance);
Object.defineProperty(window, 'SpeechRecognition', { value: MockSpeechRecognition, writable: true });
```

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VOICE-01 | `useVoiceRecognition` returns `isSupported: true` when SpeechRecognition present | unit | `bun run test --run src/__tests__/hooks/useVoiceRecognition.test.ts` | Wave 0 |
| VOICE-02 | `useVoiceRecognition` returns `isSupported: false` when API absent | unit | same file | Wave 0 |
| VOICE-03 | `isListening` becomes `true` after `startListening` | unit | same file | Wave 0 |
| VOICE-04 | `isListening` resets to `false` on `onend` | unit | same file | Wave 0 |
| VOICE-05 | `onResult` callback fires with transcript value | unit | same file | Wave 0 |
| VOICE-06 | `onError` callback fires on recognition error | unit | same file | Wave 0 |
| VOICE-07 | Normalize function: lowercase + trim matches correctly | unit | `bun run test --run src/__tests__/lib/normalizeText.test.ts` (if extracted) OR inline in VOICE test | Wave 0 |
| VOICE-08 | MicButton renders with `listening` class when `state='listening'` | component | `bun run test --run src/__tests__/components/MicButton.test.tsx` | Wave 0 |
| VOICE-09 | MicButton renders with `error` class when `state='error'` | component | same file | Wave 0 |
| VOICE-10 | MicButton is not rendered when `isSupported: false` (StudySession integration) | component | `bun run test --run src/__tests__/components/StudySession.test.tsx` | Wave 0 |
| VOICE-11 | Transcript match on card front calls `setFlipped(true)` | integration | same StudySession test | Wave 0 |
| VOICE-12 | Transcript no-match on card front triggers error state | integration | same StudySession test | Wave 0 |
| VOICE-13 | Transcript match on card back calls `handleChoiceClick(matchedIndex)` | integration | same StudySession test | Wave 0 |
| VOICE-14 | Transcript no-match on card back triggers error state | integration | same StudySession test | Wave 0 |
| VOICE-15 | Actual mic input, cross-browser accent variation | manual QA | — | Manual only |
| VOICE-16 | Mic permission denied shows error flash (not crash) | manual QA | — | Manual only |
| VOICE-17 | Mic button hidden on browsers without SpeechRecognition | manual QA | — | Manual only (requires non-Chrome/Firefox browser) |

### Sampling Rate
- **Per task commit:** `bun run test --run`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/hooks/useVoiceRecognition.test.ts` — covers VOICE-01 through VOICE-06
- [ ] `src/__tests__/components/MicButton.test.tsx` — covers VOICE-08, VOICE-09
- [ ] `src/__tests__/components/StudySession.test.tsx` — covers VOICE-10 through VOICE-14
- [ ] `SpeechRecognition` mock in `src/__tests__/setup.ts` — required by all above

**What requires manual QA only (not automatable in jsdom):**
- Actual microphone input and transcript accuracy (VOICE-15)
- Browser permission dialog behavior (VOICE-16)
- Testing `isSupported: false` path on Safari/IE without SpeechRecognition (VOICE-17) — can be simulated by temporarily deleting the mock in a targeted test, but real browser verification needed

---

## Sources

### Primary (HIGH confidence)
- Vanilla JS source read directly: `git show main:src/js/features/voice.js` — authoritative port target
- `src/components/AudioButton.tsx` — SSR guard pattern, LANG_LOCALE map
- `src/hooks/useSRS.ts` — hook structure, `use client`, `useCallback` pattern
- `src/app/[lang]/[deck]/StudySession.tsx` — `handleChoiceClick` signature, `flipped` state, `choices` structure
- `src/lib/generateChoices.ts` — `Choice.text` field confirmed (not `choice.back`)
- `vitest.config.ts` + `src/__tests__/setup.ts` — test infrastructure confirmed working
- `src/__tests__/hooks/useSRS.test.tsx` — `renderHook` + `act` test pattern confirmed

### Secondary (MEDIUM confidence)
- MDN Web Speech API documentation (well-established; SpeechRecognition interface stable since 2012)
- Webkit prefix requirement: multiple sources confirm `webkitSpeechRecognition` still needed for Chrome

### Tertiary (LOW confidence)
- None — all critical claims verified against codebase or stable browser API documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; Web Speech API used in v1.1 already
- Architecture: HIGH — direct port of vanilla JS source with established hook patterns in codebase
- Pitfalls: HIGH — verified against both vanilla JS source and existing browser API behavior
- Test strategy: HIGH — existing test infrastructure (Vitest + renderHook + jsdom mock pattern) directly applicable

**Research date:** 2026-03-05
**Valid until:** Stable — Web Speech API has not changed significantly; hook patterns are React 19 standard
