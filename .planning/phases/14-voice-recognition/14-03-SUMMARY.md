---
phase: 14-voice-recognition
plan: 03
subsystem: ui
tags: [voice-recognition, StudySession, integration, bug-fix, session-progression]

# Dependency graph
requires:
  - phase: 14-voice-recognition
    plan: 02
    provides: useVoiceRecognition hook + MicButton component

provides:
  - StudySession.tsx with speak-to-flip (card front) and speak-to-match (card back)
  - VOICE-10 through VOICE-14 real test assertions in StudySession.test.tsx
  - Session-progression bug fix: dueCards snapshot prevents card skipping
  - generateChoices pool bug fix: distractors drawn from level-filtered pool only
  - Choices memoized per card to prevent mid-answer reshuffling

affects:
  - Phase 14 completion: all VOICE-01–14 tests green

---

# Plan 03 Summary — StudySession Voice Integration

## Objective

Wire `useVoiceRecognition` and `MicButton` into `StudySession.tsx`. Speak-to-flip on card front; speak-to-match on card back. Replace VOICE-10–14 stubs with real assertions.

## What Was Built

### Task 1 — Integration (committed cbe6dc7, 3e31761, ae06e2b)

- `useVoiceRecognition` + `MicButton` wired into `StudySession.tsx`
- Card front: mic button alongside AudioButton; transcript normalized + compared to `currentCard.front`; match → `setFlipped(true)`
- Card back: mic button visible only when `flipped === true`; transcript matched against `choices[i].text`; match → `handleChoiceClick(i)`
- Non-match: `micState → 'error'` for 800ms then resets to idle
- VOICE-10–14 stubs replaced with real assertions; 52/52 green
- Post-checkpoint hydration fixes: `isSupported` via `useState(false)` + `useEffect`; `ssr: false` dynamic import for `StudySessionNoSSR.tsx`; punctuation stripping in `normalize`; layout fixes

### Task 2 — Bug Fixes (committed 0880ea7)

Two session-progression bugs discovered and fixed:

1. **dueCards recalculation bug** — `dueCards` was derived directly from SRS state on every render. After `updateCard`, `setProgress` triggered a re-render, `isCardDueForDeck` returned false for the answered card, `dueCards` shrank by 1, and the `index` state pointed to the wrong card (skipping one per answer). Fixed by snapshotting `dueCards` once in a `useState` initializer.

2. **generateChoices pool bug** — `generateChoices(currentCard, cards)` passed all cards as the distractor pool. The function's docstring requires the caller to pre-filter by active level. Fixed by filtering to `activeLevels` first. Matches v1.1 behavior ("distractors drawn only from level-filtered card pool").

3. **Choices reshuffle** — `generateChoices` (Fisher-Yates) ran on every render, reshuffling answer buttons whenever `micState` updated. Fixed by memoizing `filteredCards` and `choices` with `useMemo`, keyed on `currentCard`.

## Commits

1. `cbe6dc7` feat(14-03): integrate useVoiceRecognition and MicButton into StudySession
2. `3e31761` test(14-03): add failing VOICE-10 through VOICE-14 test assertions
3. `ae06e2b` fix(14-03): post-checkpoint fixes — hydration, layout, types, i18n
4. `0880ea7` fix(14-03): snapshot dueCards, fix generateChoices pool, memoize choices

## Decisions Made

- `StudySessionNoSSR.tsx` wrapper created so Server Component page can use `ssr: false` dynamic import (Next.js constraint: `ssr: false` only allowed in Client Components)
- `SpeechRecognition` global type is NOT in TypeScript 5.9 DOM lib — replaced with local `SpeechRecognitionInstance` interface
- `normalize()` strips trailing punctuation (`.,!?;:'"¿¡`) — card fronts end with `.` or `?` but speech API returns text without trailing punctuation
- Choices moved INSIDE `card-back` div to match original vanilla JS layout (card-back is the back face, contains the quiz options)
- `isSupported` must be `useState(false)` + `useEffect` to avoid SSR/CSR hydration mismatch
- `flipButton` = `handleAnswer(false)` / `nextButton` = `handleAnswer(true)` for SRS grading semantics
- `dueCards` snapshotted at session start — prevents index drift as SRS state updates
- `filteredCards` for `generateChoices` filtered to `activeLevels` — matches v1.1 behavior

## Files Created/Modified

- `src/app/[lang]/[deck]/StudySession.tsx` — voice integration + 3 bug fixes
- `src/app/[lang]/[deck]/StudySessionNoSSR.tsx` — SSR wrapper (created)
- `src/app/[lang]/[deck]/page.tsx` — uses `ssr: false` dynamic import
- `src/components/ChoiceButton.tsx` — 🔊 audio icon added
- `src/hooks/useVoiceRecognition.ts` — hydration + TypeScript fixes
- `src/messages/it.json` — flipButton/nextButton i18n keys
- `src/messages/es.json` — flipButton/nextButton i18n keys
- `src/__tests__/components/StudySession.test.tsx` — VOICE-10–14 real assertions

## Verification

- bun run test: 52/52 passing (all VOICE-01–14 green, no stubs remaining)
- bun run build: static export succeeds, 22 pages generated
- Human checkpoint: voice recognition works, layout matches reference screenshot

## Requirements Satisfied

- VOICE-07: MicButton appears on card front alongside AudioButton ✓
- VOICE-10: MicButton absent when isSupported is false ✓
- VOICE-11: Speak front phrase → card flips ✓
- VOICE-12: Non-match on front → error flash, no flip ✓
- VOICE-13: Speak choice text on back → handleChoiceClick called ✓
- VOICE-14: Non-match on back → error flash, no selection ✓

---
*Phase: 14-voice-recognition*
*Completed: 2026-03-07*
