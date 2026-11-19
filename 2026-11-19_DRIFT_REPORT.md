# EGM Drift Report — 2026-11-19

Scope: the 18 EGM contracts (`README.md` plus 17 child `README.md` files), each compared against the current source after PR #5 closed every finding in `2026-11-18_DRIFT_REPORT.md`. Only divergences are listed: doc ↔ code mismatches, code ↔ code inconsistencies the contracts surface, and code paths no contract covers.

How findings were checked: every contract and source file was read in full. Two throwaway Vitest scans (deleted afterwards) ran `matchesTranscript` and content checks over the real `DECK_MAP` and `scenarios`. One finding was confirmed in Chrome against a fresh `npm run build` served from `out/`. Findings marked "not reproduced" come from reading the code.

## src/types/README.md

- The Overview and the header comment of `src/types/index.ts:2` say "PuroLingua v1.2". `package.json` is version `0.1.2`, and that is what the footer shows (`RootDocument.tsx`: `v${pkg.version}`). v1.1 is the `vanilla` branch. So the app has two version numbers, and neither doc says which is current.

## src/lib/README.md

- **[FIXED 2026-11-19: the score now counts extra words (overlap ≥ 0.85), and the sessions pick the unique best match with `bestMatch`; the pairs drop from 41 to 4 near-synonyms ("Scusa, non ho compreso." / "Non ho compreso." and the Spanish pair).]** **`matchesTranscript` accepts answers that mean the opposite of the target.** Its fallback passes when 80% of the target's words appear in the transcript, and extra words never lower the score (documented). Run over the real decks, saying one answer counts as a *different* answer for 41 ordered pairs. Examples: "Non ho compreso." matches "Ho compreso." (`it/social`); "In Italia è il 113." matches "In Italia è il 115." (`it/emergencies`, 4 of 5 words); "Busco la puerta de salida." matches "…de entrada." (`es/travel`). See `rephrase/[deck]` below for how this picks a wrong choice. The Q&A data has no such pair (a foil never matches its card's correct answer).
- **[FIXED 2026-11-19: anything but a JSON object loads as `{}`; tests in `progressStorage.test.ts`.]** `loadProgress` returns whatever `JSON.parse` produces. A stored value that is valid JSON but not an object (`null`, `[]`, `42`) is returned as-is, though the contract promises `{}` for anything missing or unparsable. `JSON.parse('null')` gives `null`, and every caller then indexes into it (`current[key]` in both SRS hooks), which throws. Only the app writes this key, so this is a robustness gap, not a live bug.

## src/hooks/README.md

- **[FIXED 2026-11-19: the start guard uses a per-session ref, a cancelled session's `onend`/`onerror` leave `isListening` alone, and the sessions toggle on `micState`; tests in `useVoiceRecognition.test.ts` and both session tests.]** **Single active recognition is not guaranteed** (reproduced by the tests). `startListening` guards on `isListening`, but that only turns true in `onstart`, which fires asynchronously. A second press before then creates a second recognizer. The sessions set `micState` to `'listening'` (and `aria-pressed` to true) right away, so the button looks pressed while a press still starts another session instead of cancelling. Also, a cancelled session's `onend` is not ignored (`rec.onend = () => setIsListening(false)`, no `session.cancelled` check), and `onerror` sets `isListening` to false *before* its check. If you cancel and quickly start again, the old recognizer's late `onend` or `"aborted"` error can set `isListening` to false while the new one is running. The contract says late `onresult` and `onerror` are ignored, which holds only for the callbacks, not for `isListening`.
- **[FIXED 2026-11-19: unmount cancels and aborts; test in `useVoiceRecognition.test.ts`.]** Nothing stops recognition on unmount: there is no cleanup effect calling `abort()`. Leaving a session page while listening leaves the recognizer running until the browser ends it, and its callbacks call into the unmounted session. The contract does not mention unmount.
- **[FIXED 2026-11-19: the default is built from `LEVELS`; test in `useLevelFilter.levels.test.tsx`.]** `useLevelFilter`'s default with progress is the literal `['A1', 'A2']` (`useLevelFilter.ts:45`), not `LEVELS`. `lib/levels.ts` makes `tsc` fail if `Level` gains a member `LEVELS` lacks, but this default would quietly keep leaving the new level out.

## src/components/README.md

- `SiteHeader` names its back-link flag `onDeckPage` (`SiteHeader.tsx:27`). It is true on every page with 2+ segments, including `/it/rephrase` and `/it/qa`, as the comment above it and the contract both say. The name describes the old rule.

## src/i18n/README.md

- The invariant on per-language tables lists only the `Record<Lang, …>` tables that `tsc` checks. It does not mention the code that picks Q&A text by `lang === 'it' ? … : …Es` (`ScenarioGrid.tsx:24`, three places in `QAStudySession.tsx`). Adding a locale gives no compile error there: the new locale silently gets the Spanish text. The root README notes this under "Not compiler-checked"; this contract, which owns "adding a locale", does not.

## src/data/README.md

- **[FIXED 2026-11-19: removed; `decks.test.ts` now checks 40 cards, 20 per level, against `DECK_MAP`.]** `DeckMeta.cardCount` is read only by `src/__tests__/data/decks.test.ts`, which checks that it equals the array length. No app code uses it (`DeckGrid` shows live due counts). It is a hard-coded copy of `DECK_MAP[lang][id].length` that exists only so a test can keep it in sync. The contract and the root README's "Deck size is hard-coded" invariant both describe it as meaningful.
- **[FIXED 2026-11-19: removed; `DeckGrid` uses `id`.]** `DeckMeta.i18nKey` equals `id` in all 16 entries, and its comment says it keys the `decks` namespace only, but `DeckGrid` also uses it for `deckDescriptions`.
- **[FIXED 2026-11-19: `decks.test.ts` compares `DECK_IDS` with the keys of `DECK_MAP` (checked by temporarily removing a deck).]** The invariant "`DECK_IDS` must list every `DeckId` literal exactly once" is not enforced. `DECK_IDS` is typed `DeckId[]`, which allows a missing ID, and `decks.test.ts` compares `deckMetadata` with `DECK_IDS`, not with `DeckId` or the keys of `DECK_MAP`. A new deck added to `DeckId` and `DECK_MAP` but not `DECK_IDS` would get no route, and no test would fail.

## src/data/it/README.md

- **[FIXED 2026-11-19: `generateChoices` never takes a foil from a card with the same front; test in `generateChoices.test.ts`.]** Two cards share a `front` with *different* `back`s: "Quanto costa questo?" (`shopping.ts:4`, A2, and `:24`, A1) and "C'è il sole." (`weather.ts:13`, A2, and `:27`, A1). With both levels active, one card's correct paraphrase can appear as a wrong choice for the other. `generateChoices` draws foils from every active card's `back`. The contract describes each card as a phrase plus its paraphrase and says nothing about repeated fronts.
- **[WON'T FIX 2026-11-19: being asked twice is harmless; replacing a card would hand its saved progress to a new phrase.]** "È nuvoloso." → "Il cielo è coperto." appears twice, identically, as A2 (`weather.ts:9`) and A1 (`:28`). With both levels active it is studied twice per session, under two progress keys.

## src/data/es/README.md

- **[Repeated fronts FIXED 2026-11-19 by the same `generateChoices` change. The exact duplicate card: WON'T FIX, as for Italian.]** Same issue as Italian. Repeated fronts with different backs: "¿Cuánto cuesta esto?" (`shopping.ts:4` and `:24`) and "¿De dónde eres?" (`social.ts:6` and `:28`). Exact duplicate card: "Está nublado." → "El cielo está cubierto." (`weather.ts:9` and `:28`).

## src/data/qa/README.md

No drift detected. (Checked: 7 scenarios × 8 cards, ids `{scenarioId}_01`..`_08`, levels as tabled, 4 distinct choices per card in both languages.)

## src/app/[lang]/README.md

- `src/app/[lang]/page.tsx` and `src/app/[lang]/rephrase/page.tsx` both name their default export `LangPage`, and the rephrase contract documents it as `LangPage`. The rephrase one is the deck browser. Its sibling is `QABrowserPage`.

## src/app/[lang]/rephrase/README.md

- **[FIXED 2026-11-19: both list pages render the chips and grid inside `ClientOnly`; test in `listPageHydration.test.tsx`; checked in Chrome on a production build (no error #418, correct badges and chips).]** **The list pages throw a React hydration error for returning users** (confirmed in Chrome, production build). Both list pages are `'use client'` but still prerendered to static HTML. On the server, `useSRS` loads `{}` and `useLevelFilter` loads no saved filter, so `out/it/rephrase/index.html` has `A1` chips and badges of `20`. In the browser both hooks read `localStorage` in their `useState` initializers, so the first client render differs. With saved progress and an `A1`+`A2` filter, loading `/it/rephrase/` logged `Minified React error #418` (text mismatch). React then re-rendered on the client, ending at the correct `39, 40, …` badges and two active chips. `/[lang]/qa/` has the same pattern. No contract mentions it: the session routes avoid it with `ssr: false`, and these pages do not.

## src/app/[lang]/rephrase/[deck]/README.md

- **[FIXED 2026-11-19: tapping a choice while listening cancels the voice attempt; test in `StudySession.test.tsx`.]** **A voice answer can record a card twice and skip the next one** (reproduced by the test). `handleBackMicPress` checks `selectedChoice` when the mic is pressed, but the result callback calls the `handleChoiceClick` from that render, where `selectedChoice` is still `null`. If the user taps a choice while listening and the transcript then matches, a second 600 ms timer is scheduled. It overwrites `advanceTimer.current`. Left alone, the first timer's `handleAnswer` clears the second, so the card is recorded once. But pressing Next clears only the second, and the first fires afterwards: `updateCard` runs twice and `setIndex(i => i + 1)` twice, skipping a card. This contradicts "each card is recorded once".
- **[FIXED 2026-11-19: `bestMatch` picks the best-scoring choice and rejects ties, in both sessions; tests in `StudySession.test.tsx` and `QAStudySession.test.tsx`.]** "A transcript that matches a choice's text selects that choice" is ambiguous when several choices match, and with the loose matcher (see `src/lib`) they can. `choices.findIndex` takes the first match in the shuffled order. So saying "Non ho compreso." can select "Ho compreso." if it is listed first, even though an exact match exists.
- **[FIXED 2026-11-19: the answer is recorded at the tap and the timer only advances, in both sessions; tests in both session test files. The remaining timers only update state, which React ignores after unmount.]** The 600 ms and 800 ms timers are never cleared on unmount, and leaving within 600 ms of a tap still runs `handleAnswer` (and `updateCard`) afterwards. The contract lists the timers but not this.

## src/app/[lang]/qa/README.md

No drift detected.

## src/app/[lang]/qa/[scenario]/README.md

- **[FIXED 2026-11-19: tapping a choice while listening cancels the voice attempt, and `useVoiceRecognition` ignores a cancelled session's result; tests in `QAStudySession.test.tsx`.]** **A tap plus a matching voice result advances the card two boxes** (not reproduced). The mic result callback has no `selectedChoice` guard, and it uses the `missedCurrent` from the render where the mic was pressed. Tap the correct choice while listening, then let a matching transcript arrive: two `handleAnswer(true)` timers run. `updateCard` re-reads storage each time, so the card goes up two boxes, and `index` jumps by 2. Tap a *wrong* choice while listening, then speak the correct answer: the stale `missedCurrent` is `false`, so the card is recorded as correct. This contradicts "a card missed before the correct retry is recorded as wrong" and "recorded once".
- `shuffle` here is a second copy of the Fisher-Yates `shuffleArray` in `lib/generateChoices.ts`, which the lib contract calls module-private. The two are identical.

## src/app/README.md

- Navigating between the two root layouts (`/` ↔ `/it`, or the 404 page → `/`) is a full page load in Next.js, not a client transition. The contract explains why there are two root layouts but not this cost.

## src/README.md

No drift detected.

## scripts/README.md

- **[FIXED 2026-11-19 in the docs: a regex scan cannot tell whether a branch is tested, so the contract now calls these reminders and the Overview no longer claims they are matched against tests.]** **Logic-branch gaps ignore the tests.** `analyzeGaps` reports every `catch` and `switch` as a medium gap without looking at `testedNames`, so a fully tested `catch` is always flagged. The Overview says the script finds "logic branches with no matching test file or test reference". Branches are never matched against tests.
- **[FIXED 2026-11-19: `isEntryPoint` uses `fileURLToPath`; tests in `analyze-test-coverage.test.ts`; checked by running a copy from a folder with a space (the old version printed nothing).]** The CLI never runs from a path that contains a space or other URL-escaped characters. It compares `path.resolve(process.argv[1])` with `new URL(import.meta.url).pathname`, which stays percent-encoded (`%20`), so the comparison fails and the script exits silently with no report. `fileURLToPath` would decode it.
- **[FIXED 2026-11-19: it suggests the `src/__tests__` mirror (keeping `.tsx`) for sources under `src/`; tests in `analyze-test-coverage.test.ts`.]** With no test file, single-file mode suggests a sibling `<name>.test.ts` (`generateMarkdownReport`). This repository keeps tests in the `src/__tests__/` mirror, uses `.tsx` for components, and `findTestFile` looks in the mirror first.

- **[Found and FIXED 2026-11-19 while fixing the items above.]** The main suite never ran the script's tests. `vitest.config.ts` included `scripts/__tests__/**/*.{test,spec}.{ts}`, and the one-item brace `{ts}` is not expanded, so `npx vitest run` and `npm test` ran only the 35 files under `src/` (`npx vitest run scripts/__tests__` reported "No test files found"). Both the root README and this contract said they ran. The pattern is now `*.{test,spec}.ts`, and the main suite runs 36 files (the 53 script tests included).

## README.md

- Getting Started requires "Node.js 20+", but `AGENTS.md` requires `node scripts/analyze-test-coverage.ts`, and running a `.ts` file directly needs Node's built-in type stripping (Node 22.18+, or 23.6+, without a flag). The Docker build uses `node:22-alpine`, and `@types/node` is `^20`. No `engines` field states the real minimum.
- **[FIXED 2026-11-19: rewritten around the 40-card, 20-per-level test.]** The "Deck size is hard-coded" global invariant presents `cardCount` as a checked contract; see `src/data/README.md` above: nothing but the test reads it.

## Files no contract covers

- `messages/.gitkeep` is a scaffolding placeholder in a directory that holds `it.json` and `es.json` (the same kind of leftover removed from `src/data`, `src/hooks`, and `src/lib` in PR #5).
