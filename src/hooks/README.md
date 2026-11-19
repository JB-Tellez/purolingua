# hooks

## Overview

Client-side React hooks (`'use client'`) that hold PuroLingua's per-language
learner state and wrap browser speech APIs. Two hooks persist spaced-repetition
(SRS) progress in `localStorage` (`useSRS` for Rephrase decks, `useQASRS` for
Q&A scenarios), one persists the CEFR level filter (`useLevelFilter`), and one
wraps the Web Speech recognition API (`useVoiceRecognition`). Box-advancement,
due-date logic, and key formats come from `@/lib/srs` (`advanceBox`,
`isCardDue`, `getCardKey`, `getQACardKey`); the progress record is read and
written through `@/lib/progressStorage`; `useLevelFilter` validates with
`@/lib/levels:isLevel`. These hooks only manage React state.

Consumers: `src/components/DeckGrid.tsx`, `src/components/ScenarioGrid.tsx`,
and pages/sessions under `src/app/[lang]/` (including
`src/app/[lang]/rephrase/[deck]/StudySession.tsx` and
`src/app/[lang]/qa/[scenario]/QAStudySession.tsx`).

## Interface

- `useSRS(lang: Lang)` (`useSRS.ts`) returns
  `{ updateCard, isCardDueForDeck, hasProgress }`.
  - `updateCard(deckId: DeckId, cardIndex: number, isCorrect: boolean)`: advances
    the card's box via `advanceBox` and persists.
  - `isCardDueForDeck(deckId: DeckId, cardIndex: number): boolean`: `isCardDue`
    on the record stored under `getCardKey(deckId, cardIndex)`.
  - `hasProgress`: `true` when the progress record has at least one key.
- `useQASRS(lang: Lang, scenarioId: ScenarioId, cards: QACard[], activeLevels: Level[])`
  (`useQASRS.ts`) returns
  `{ dueCards, updateCard, progress }`. (`QAStudySession` reads `progress` for its
  cross-scenario end-screen check.)
  - `dueCards`: memoized subset of `cards` whose `level` is in `activeLevels`
    and that are due per `isCardDue`.
  - `updateCard(cardId: string, isCorrect: boolean)`.
- `useLevelFilter(lang: Lang, hasProgress: boolean, activity: Activity)` (`useLevelFilter.ts`;
  `type Activity = 'rephrase' | 'qa'`) returns
  `{ activeLevels: Level[], setActiveLevels(levels: Level[] | null) }`.
  `activity` is required so no caller shares a filter by accident.
- `useVoiceRecognition(lang: Lang)` (`useVoiceRecognition.ts`) returns
  `{ isSupported, isListening, startListening(onResult: (transcript: string) => void, onError: () => void), stopListening() }`.
  `stopListening` cancels: it calls `abort()` (discarding any pending result), sets `isListening` to `false` at once, and the cancelled session's late `onresult` / `onerror` / `onend` (Chrome fires `"aborted"`) are ignored, so callers get neither callback and a newer session's `isListening` is untouched. Unmounting cancels the same way.

## Invariants

- **Shared progress key**: `useSRS` and `useQASRS` both read and write the same
  `localStorage` key `"{lang}-progress"` through `@/lib/progressStorage`. Q&A
  entries are namespaced as `qa_{scenarioId}_{cardId}` (`@/lib/srs:getQACardKey`)
  so they do not collide with Rephrase keys from `@/lib/srs:getCardKey`. Changing
  either key format breaks existing user data.
- **Storage key formats are compatibility contracts**: comments in `useSRS.ts`
  and `useLevelFilter.ts` state the `"{lang}-progress"` and
  `"{lang}-level-filter"` keys match v1.1 for user data continuity.
- **One level filter per activity**: Rephrase reads and writes
  `"{lang}-level-filter"` (the v1.1 key); Q&A writes `"{lang}-qa-level-filter"`
  and, until that exists, reads the Rephrase value as its starting point
  (both activities shared one filter before the split). Changing one never
  changes the other.
- **Writes start from current storage**: `updateCard` re-reads
  `"{lang}-progress"`, changes one key, writes it back, then sets state. It
  never writes the in-memory snapshot, so a reset or another writer (a second
  instance, the other SRS hook, another tab) is not overwritten. The
  read-modify-write runs outside the `setState` updater so StrictMode's
  double-invoke cannot advance a box twice.
- **Reads are a per-mount snapshot**: `progress`, `dueCards`, and
  `isCardDueForDeck` reflect storage as loaded at mount plus this instance's own writes.
  Changes made elsewhere appear after this instance's next `updateCard` or a
  remount.
- **Level filter never empty (FLTR-06)**: `setActiveLevels(null)` and
  `setActiveLevels([])` are silent no-ops (`useLevelFilter.ts:setActiveLevels`).
- **Level filter default**: when no valid saved filter exists, the initial
  value is every level in `@/lib/levels:LEVELS` (`['A1', 'A2']`) if `hasProgress` is true, otherwise the lowest (`['A1']`). A saved
  value keeps only known levels (`@/lib/levels:isLevel`), without duplicates;
  if nothing valid is left (e.g. `["B1"]`, `[42]`, a non-array), the default
  applies (`useLevelFilter.ts:loadFilter`).
- **Corrupt or missing storage is non-fatal**: JSON parse failures and missing
  keys yield `{}` (SRS hooks) or `null` (level filter); `localStorage.setItem`
  failures (quota, private browsing) are swallowed.
- **SSR safety**: loaders return the empty default when `window` is undefined.
  `useVoiceRecognition` resolves `isSupported` in a `useEffect`, so it is
  `false` on the first render and during SSR.
- **Single active recognition**: `startListening` returns without action if no
  `SpeechRecognition` / `webkitSpeechRecognition` constructor exists or if the
  current session is neither cancelled nor ended (tracked in a ref, so a start
  still waiting for `onstart` counts; `isListening` turns true only at
  `onstart`). Each start creates a new recognizer with
  `continuous = false`, `interimResults = false`, and locale `it-IT` / `es-ES`
  (`LANG_LOCALE`).
- **Recognition results**: `onResult` receives only `results[0][0].transcript`;
  an empty `results` list logs an error and does not call `onResult`.

## Side Effects

- `localStorage.getItem` / `setItem` on `"{lang}-progress"` (`useSRS`,
  `useQASRS`; every `updateCard` reads, then writes, the full record) and on
  `"{lang}-level-filter"` / `"{lang}-qa-level-filter"` (`useLevelFilter`; every
  accepted `setActiveLevels` writes its activity's key).
- `useVoiceRecognition` constructs `window.SpeechRecognition` (or
  `webkitSpeechRecognition`), calls `start()` / `abort()`, and therefore triggers
  the browser microphone permission flow. Exceptions from `start()` are
  swallowed.
- `console.error('[SpeechRecognition] no results returned')` when a result
  event has no results.

## Verification

- Run: `npm test` (Vitest; `npm test` runs `vitest`, which starts watch mode
  in an interactive terminal).
- Targeted, single run: `npx vitest run src/__tests__/hooks`
  (tests live in the mirror tree `src/__tests__/hooks/`).
- Coverage gaps: `node scripts/analyze-test-coverage.ts src/hooks/`
- `useLevelFilter` has no "window is undefined" (SSR) tests on purpose: React
  19 cannot render under jsdom without `window`. See the comment at the top of
  `src/__tests__/hooks/useLevelFilter.test.tsx`.
