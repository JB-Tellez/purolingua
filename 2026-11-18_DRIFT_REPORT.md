# EGM Drift Report — 2026-11-18

Scope: the 18 EGM contracts (`README.md` plus 17 child `README.md` files), each compared against the current source after PRs #2–#4 closed every finding in `2026-11-13_DRIFT_REPORT.md`. Only divergences are listed: doc ↔ code mismatches, code ↔ code inconsistencies the contracts surface, and code paths no contract covers.

## src/types/README.md

- The `ProgressRecord` invariant says keys use the format `"{deckId}_{cardIndex}"`, and the source comment above `Progress` says the same (`src/types/index.ts:28-30`). The same record also stores Q&A keys `qa_{scenarioId}_{cardId}` (`src/lib/srs.ts:getQACardKey`, written by `useQASRS`). Neither the contract nor the comment mentions the second format.
- `Scenario.level` is documented as a field and commented "scenario-level tag for Phase 18 filter" (`index.ts:65`), but nothing reads it. Level filtering is per card (`QACard.level`) in `useQASRS` and `QAStudySession`. The field is dead, and the comment describes a filter that does not use it.

## src/lib/README.md

- The key-format invariant says `"qa_{scenarioId}_{cardId}"` "must stay identical to v1.1". Q&A did not exist in v1.1: the `vanilla` branch has no `qa_` keys. Only `"{deckId}_{cardIndex}"` and `{lang}-progress` are v1.1 formats. The Q&A format is this app's own persisted contract.
- The header comment of `reloadPage.ts` says it is "the only browser side effect in src/lib" (`reloadPage.ts:2`). `progressStorage.ts` (`localStorage`) and `speak.ts` (`speechSynthesis`) are now in `src/lib` too, as the contract's Overview states.
- **[FIXED 2026-11-18: `clearProgress` swallows storage errors; test in `progressStorage.test.ts`.]** `clearProgress` calls `localStorage.removeItem` without a `try`, while `loadProgress` and `saveProgress` swallow storage errors (`progressStorage.ts:28-30`). When storage access throws (blocked site data), reset throws. The contract documents the swallowing for save only and says nothing about clear.
- The consumer list ("the hooks (`useSRS`, `useQASRS`, `useVoiceRecognition`), `AudioButton`, `SiteHeader`, and both study sessions") omits `useLevelFilter` (`isLevel`) and `LevelFilterChips` (`LEVELS`).

## src/hooks/README.md

- Three documented return values have no consumer. `useSRS(...).progress` is never read: `DeckGrid`, both list pages, and `StudySession` use only `isCardDueForDeck`, `updateCard`, and `hasProgress`. `useQASRS(...).hasProgress` and `useQASRS(...).isCardDueForScenario` are never read: `ScenarioGrid` uses `dueCards`, and `QAStudySession` uses `dueCards`, `updateCard`, and `progress`. `QAStudySession` computes its own `bootstrapHasProgress` because it needs the flag before calling `useQASRS`, so the hook's `hasProgress` cannot serve that caller.
- The Overview says box and due-date logic is delegated to `@/lib/srs` "(`advanceBox`, `isCardDue`, `getCardKey`)". `useQASRS` also uses `getQACardKey`, both SRS hooks delegate storage to `@/lib/progressStorage`, and `useLevelFilter` validates with `@/lib/levels:isLevel`. The list predates those modules.

## src/components/README.md

- **The "SiteHeader language dropdown" invariant still describes the bug fixed in PR #2.** It says the first option is always Italiano, refers to `OTHER_LANG`, and says `/es` shows no Español option. The code renders one option per `LANG_META` entry, each linking to its own `/{code}` and marked `active` for the current language (`SiteHeader.tsx`). `OTHER_LANG` no longer exists.
- The "SiteHeader back link" invariant says "The inline comment says '3+ segments', but the code checks `>= 2`". The comment was corrected and now describes the 2+ rule (`SiteHeader.tsx:25`).
- Side Effects says `DeckGrid` and `ScenarioGrid` read `localStorage` "via `useSRS`, `useLevelFilter`, and `useQASRS`". Neither grid calls `useLevelFilter`; both receive `activeLevels` as a prop, as the Due-badges invariant states.
- Side Effects describes the reset as `localStorage.removeItem('{lang}-progress')`. `SiteHeader` calls `clearProgress(lang)` from `@/lib/progressStorage`, which owns the key name.

## src/i18n/README.md

- Two message keys in both `messages/it.json` and `messages/es.json` are not referenced anywhere in `src/`: `study.revealAnswer` and `nav.backToDecks`. `SiteHeader` (the only `nav` consumer) uses `logo`, `back`, `reset`, and `changeLanguage`, and the sessions use `study.backToDecks`. (The two files have identical key sets, 53 keys each.)
- `request.ts` validates with `hasLocale(routing.locales, requested)` directly instead of the new `isLang` helper, so there are two ways to check a locale. Both behave the same; the contract lists `isLang`'s users as the three route files only, which is accurate, but does not say why `request.ts` differs.

## src/data/README.md

No drift detected. (Checked against the real data: 16 decks of 40 cards, 20 A1 / 20 A2 each.)

## src/data/it/README.md

- Verification says "Tests that use deck data mock `@/data/deckMap` instead". `src/__tests__/data/decks.test.ts` uses the real `DECK_MAP` (and so these arrays) to check `cardCount`.

## src/data/es/README.md

- Same as `src/data/it`: Verification says deck-data tests mock `@/data/deckMap`, but `src/__tests__/data/decks.test.ts` reads the real arrays.

## src/data/qa/README.md

- The card-id invariant says progress is looked up by `getQACardKey(scenarioId, card.id)` in `src/hooks/useQASRS.ts`. `getQACardKey` moved to `src/lib/srs.ts` and is also used by `QAStudySession`.
- Verification says "No test imports these modules directly". `src/__tests__/app/localeValidation.test.tsx` imports the real `scenarios` (to build a valid scenario route). (Data checked: 7 scenarios × 8 cards, ids `{scenarioId}_01..08`, every card's level matches its scenario.)

## src/app/[lang]/README.md

- `page.tsx` is documented as rendering "the `page.title` and `page.subtitle` messages". It renders `page.activityTitle` and `page.activitySubtitle` (`page.tsx:19-20`), changed in PR #2.
- Verification lists only `ActivityPicker.test.tsx`. This segment is also covered by `src/__tests__/app/localeValidation.test.tsx` (layout 404s on unknown locales), `htmlLang.test.tsx` (`<html lang>`), and `listPageHeadings.test.tsx` (the picker's heading).

## src/app/[lang]/rephrase/README.md

- Verification runs only the `useSRS` and `useLevelFilter` hook tests. The page itself is now exercised by `src/__tests__/app/levelFilterPerActivity.test.tsx` (it shows the Rephrase filter) and `listPageHeadings.test.tsx`, and its grid by `DeckGrid.test.tsx`.

## src/app/[lang]/rephrase/[deck]/README.md

- **The "next" invariant still describes the bug fixed in PR #2**: "The 'next' control calls `handleAnswer(true)` directly." The Next button is disabled until a choice is selected, records that choice's correctness, and cancels the pending 600 ms auto-advance (`StudySession.tsx:205-207, 223, 296`). The contract's own Invariants list (third bullet) now contradicts this one.
- "Study again" is not documented. It replays the session's cards as practice without saving answers (`practice` state, `StudySession.tsx:49-50, 207`), and it is hidden on the all-done screen when the session started with no due cards. The Interface lists the end screens but not this behavior.

## src/app/[lang]/qa/README.md

- Verification runs `ScenarioGrid.test.tsx` and the `useLevelFilter` tests. The page is now also covered by `src/__tests__/app/levelFilterPerActivity.test.tsx` (it shows the Q&A filter, not the Rephrase one) and `listPageHeadings.test.tsx`.

## src/app/[lang]/qa/[scenario]/README.md

- **The answer-recording invariant still describes the bug fixed in PR #2**: "Wrong answers are not recorded in SRS." A card missed before the correct retry is recorded as wrong: `updateCard(currentCard.id, isCorrect && !missedCurrent)` (`QAStudySession.tsx:88, 145`). The retry flow itself is as documented.
- "Study again" is not documented. It replays the session as practice without saving answers (`practice`, `QAStudySession.tsx:84-85, 144`) and is hidden on the all-done screen when the session started with no due cards.
- The block comment above `bootstrapHasProgress` (`QAStudySession.tsx:51-60`) describes logic the code does not have. It says the session bootstraps with `hasProgress=false` and "let[s] useQASRS's returned hasProgress update on rerender", but the flag is read once from storage in a `useState` initializer and never updated, and `useQASRS`'s `hasProgress` is unused. Its last line says "the level filter is shared", which stopped being true when Q&A got `{lang}-qa-level-filter`. (The contract's own description of `bootstrapHasProgress` is correct.)

## src/app/README.md

- `src/app/favicon.ico` (a Next metadata file, emitted as `out/favicon.ico`) is not mentioned in the contract. Everything else matches.

## src/README.md

- The `i18n` line still lists "navigation helpers"; `src/i18n/navigation.ts` was removed in PR #3. The module now provides `routing` and `isLang`.
- The `lib` line says "Pure logic: Leitner SRS scheduling (`srs.ts`), distractor generation (`generateChoices.ts`), fuzzy transcript matching (`matchTranscript.ts`)". `lib` also holds `progressStorage.ts`, `speak.ts`, `locale.ts`, `levels.ts`, and `reloadPage.ts`, and three of those are not pure (see `src/lib/README.md`).
- The dependency direction (`app` → `components` → `hooks` → `lib` → `types`, with `i18n` importing nothing) no longer matches the imports. `types` imports `@/i18n/routing` (type-only, to derive `Lang`), so `types` is not a leaf. `components` imports `lib` directly (`AudioButton` → `speak`, `SiteHeader` → `progressStorage` and `reloadPage`, `LevelFilterChips` → `levels`), which the map does not show.

## scripts/README.md

- Directory mode analyzes non-test files inside test directories as source. Running it on `src/` reports `src/__tests__/setup.ts` (its exported mocks `mockRecognitionInstance` and `MockSpeechRecognition` show as untested high-severity gaps). The contract's directory-mode invariant lists what is skipped (dot-directories, `node_modules`, `*.test.*`, `*.spec.*`) and so implies this, but it does not call out that `__tests__/` helpers are reported.

## README.md

- **`npm start` does not work.** The Scripts table says it serves the production build, but `next start` exits with `Error: "next start" does not work with "output: export" configuration. Use "npx serve@latest out" instead.` (checked by running it). The `start` script in `package.json` is dead under static export.
- The Live Site link is `https://purolingua.com/?lang=it`. The `?lang=` query parameter is v1.1's scheme; the Next app routes by path (`/it/`), and `/` ignores the parameter and shows the language picker.
- The Global Invariant on storage keys ends "They match v1.1", after listing the Q&A key `qa_{scenarioId}_{cardId}`. Only `{lang}-progress`, `{deckId}_{cardIndex}`, and `{lang}-level-filter` exist in v1.1; Q&A keys (like `{lang}-qa-level-filter`, which the sentence does flag) were added later.
- Project Structure: the `lib/` line lists only `srs.ts`, `generateChoices.ts`, `matchTranscript.ts` (five more modules exist), and the `__tests__/` line says "(components, hooks, lib)" though tests now also live in `app/`, `data/`, and `i18n/`.
- Subdirectories & System Boundaries: `src/lib` is described as "Pure SRS scheduling, distractor generation, transcript matching" (see `src/README.md` above), `src/i18n` still lists "navigation helpers" (removed in PR #3), and `src/app` is "Root shell and home page" though there are now two root layouts and a global 404.
- Features does not mention the CEFR level filter (separate for Rephrase and Q&A) or the practice replay ("Study again"), both user-visible.

## Files no contract covers

- `public/` holds only `create-next-app` leftovers that nothing references: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and `window.svg` (no `src/` file uses any of them). They are copied into `out/` and served.
- `src/data/.gitkeep`, `src/hooks/.gitkeep`, and `src/lib/.gitkeep` are scaffolding placeholders in directories that now contain files.
- `src/app/favicon.ico` (noted under `src/app/README.md`).
