# lib

## Overview
This directory holds the domain logic for PuroLingua study sessions. None of these functions use React. Most are pure; the browser-facing exceptions are `progressStorage.ts` (`localStorage`), `speak.ts` (`speechSynthesis`), and `reloadPage.ts`, a one-line helper isolated here so tests can mock it.

- `generateChoices.ts`: builds multiple-choice answers (one correct answer plus distractors).
- `matchTranscript.ts`: checks a speech-recognition transcript against a target phrase, ignoring accents and punctuation.
- `srs.ts`: Leitner spaced-repetition scheduling (box changes and next-review dates) and progress key formats.
- `progressStorage.ts`: reads, writes, and clears the `{lang}-progress` record.
- `locale.ts` / `speak.ts`: the speech locale per language, and text-to-speech.
- `levels.ts`: the CEFR levels the app has content for.

These modules are used by the hooks (`useSRS`, `useQASRS`, `useVoiceRecognition`), `AudioButton`, `SiteHeader`, and both study sessions. Domain types come from `@/types` ([`src/types`](../types/README.md)).

## Interface
- `generateChoices.ts`
  - `interface Choice { text: string; isCorrect: boolean }`
  - `generateChoices(correctCard: Card, filteredCards: Card[]): Choice[]`: returns the correct answer (`correctCard.back`) plus up to 3 foils drawn from `filteredCards`, in shuffled order.
  - `shuffleArray<T>` is a module-private Fisher-Yates helper. It is not exported.
- `matchTranscript.ts`
  - `normalize(s: string): string`: lowercases the string, applies NFD, strips combining diacritics (U+0300 to U+036F), turns every non-`\w`/non-whitespace character into a space, collapses repeated whitespace, and trims.
  - `matchesTranscript(transcript: string, target: string): boolean`: returns `true` if the two strings are equal after `normalize`. Otherwise it returns `true` when at least 80% of the target's words appear in the transcript.
- `srs.ts`
  - `getCardKey(deckId: DeckId, cardIndex: number): string`: returns `"{deckId}_{cardIndex}"`.
  - `getQACardKey(scenarioId: ScenarioId, cardId: string): string`: returns `"qa_{scenarioId}_{cardId}"`.
  - `getTodayString(): string`: returns today's date as an ISO date (`YYYY-MM-DD`, UTC).
  - `getNextReviewDate(box: number): string`: box 1 adds 1 day, box 2 adds 3 days, box 3 adds 7 days. Any other box value returns today.
  - `isCardDue(progress: Progress | undefined): boolean`
  - `advanceBox(current: Progress | undefined, isCorrect: boolean): Progress`
  - `addDays` is module-private. It is not exported.
- `progressStorage.ts`
  - `loadProgress(lang): ProgressRecord`: parses `{lang}-progress`; `{}` when missing, unparsable, or on the server.
  - `saveProgress(lang, record): void`: writes it as JSON; storage errors (quota, private browsing) are swallowed.
  - `clearProgress(lang): void`: removes it. Used by `SiteHeader`'s reset.
- `levels.ts`
  - `LEVELS: Level[]`: `['A1', 'A2']`, in order. Backed by a `Record<Level, …>`, so `tsc` fails if `Level` gains a member this list lacks. Used by `LevelFilterChips`.
  - `isLevel(value: unknown): value is Level`. Used by `useLevelFilter` to validate the saved filter.
- `locale.ts`
  - `LANG_LOCALE: Record<Lang, string>`: `it -> it-IT`, `es -> es-ES`. The one copy, used by `speak` and `useVoiceRecognition`.
- `speak.ts`
  - `speak(phrase, lang): void`: cancels current speech, then speaks `phrase` at rate `0.9`, preferring an exact-locale voice, then any voice for the language, then the browser default. No-op without `window.speechSynthesis`.
- `reloadPage.ts`
  - `reloadPage(location: Pick<Location, 'reload'> = window.location): void`: calls `location.reload()`. Used by `SiteHeader`'s reset. It exists as a module because jsdom does not allow stubbing `window.location.reload`.

## Invariants
- `generateChoices`: foils are drawn from the distinct `back` texts other than `correctCard.back`, so every choice text appears exactly once. You get at most 4 choices, and fewer if `filteredCards` has fewer than 3 distinct-`back` foils. The caller must pre-filter `filteredCards` to the active level(s) (doc comment in `generateChoices.ts`).
- `shuffleArray` copies its input before shuffling. Caller arrays are never mutated.
- `matchesTranscript`: if the target normalizes to an empty string, it returns `false` unless the transcript also normalizes to an empty string (the exact-match check runs first). The word-overlap threshold is `>= 0.8` of the target words. Extra words in the transcript do not lower the score.
- `normalize` uses `\w`, which is ASCII-only. Accented letters that decompose under NFD (`è`, `ñ`) reduce to their base letter. Non-ASCII letters that do not decompose (for example `ß`) become spaces (`"straße"` → `"stra e"`).
- `getCardKey` / `getQACardKey` / `progressStorage`: the formats `"{deckId}_{cardIndex}"`, `"qa_{scenarioId}_{cardId}"`, and `{lang}-progress` must stay identical to v1.1, because existing `localStorage` progress uses it (see comments in `srs.ts` and `src/types/index.ts`).
- `advanceBox`: a correct answer moves the card up one box, capped at 3. An incorrect answer resets it to box 1. A missing `current` counts as box 1. So a new card answered correctly goes to box 2.
- `isCardDue`: returns `true` for `undefined` progress (a new card) or when `progress.nextReview <= getTodayString()`. This relies on lexicographic comparison of ISO `YYYY-MM-DD` strings.
- Dates are calculated in UTC (`toISOString`, `setUTCDate`), not the user's local time zone.

## Side Effects
- `progressStorage` reads and writes `localStorage`, `speak` uses `window.speechSynthesis`, and `reloadPage` reloads the page. The other functions do no I/O and mutate no shared state.
- Some results are non-deterministic. `generateChoices` and `shuffleArray` use `Math.random()`. `getTodayString`, `getNextReviewDate`, `isCardDue`, and `advanceBox` read the system clock through `new Date()`.

## Verification
- Run: `npx vitest run src/__tests__/lib` (`generateChoices`, `srs`, `progressStorage`, `levels`, `locale`, `speak`, and `reloadPage` tests).
- Full suite: `npm test`. This runs `vitest`, which starts in watch mode in an interactive terminal. Use `npx vitest run` for a single pass.
- `matchTranscript.ts` has no dedicated unit test under `src/__tests__/lib/`.
