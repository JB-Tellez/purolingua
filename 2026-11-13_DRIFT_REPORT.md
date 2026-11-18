# EGM Drift Report — 2026-11-13

Scope: the 18 EGM contracts created or corrected by `egm-bootstrap` on 2026-11-13 (`README.md` plus 17 child `README.md` files). Each contract was compared against the current source. Only divergences are listed: doc ↔ code mismatches, code ↔ code inconsistencies the contracts surface, and code paths no contract covers.

## src/types/README.md

- **[FIXED 2026-11-18: removed.]** `Deck` (`src/types/index.ts:26`) is documented as part of the interface but is never imported anywhere in `src/` (dead type).
- `Card.back` is commented "translation/answer" (`src/types/index.ts:22`), but every Rephrase deck stores a same-language paraphrase in `back` (e.g. `src/data/it/daily.ts`: `'Ho perso il treno.'` → `'Non sono arrivato in tempo alla stazione.'`). The source comment is stale, and the contract does not state the field's meaning.
- Source comments reference v1.1 files that do not exist in this repo (`src/locales/it/decks.js` at `index.ts:9`, `src/js/features/progress.js` at `index.ts:34`). The v1.1 compatibility claim cannot be verified from this repository.

## src/lib/README.md

- **[FIXED 2026-11-17: `generateChoices` now draws foils from distinct back texts.]** `generateChoices` excludes only foils whose `back` equals the correct answer; it does not de-duplicate foils against each other. `src/data/it/weather.ts` and `src/data/es/weather.ts` each contain 3 repeated `back` values (e.g. `'Cade la pioggia.'`, `'Il cielo è coperto.'`, `'La temperatura è alta.'`; `'Cae la lluvia.'`, `'El cielo está cubierto.'`, `'La temperatura es alta.'`), so a question can show two identical choices. The contract says nothing about this.
- The header comment in `srs.ts` says "no side effects", but `getTodayString`, `getNextReviewDate`, `isCardDue`, and `advanceBox` read the system clock. The contract documents this correctly; the source comment is the drift.
- `matchTranscript.ts` has no unit test (`src/__tests__/lib/` covers only `generateChoices` and `srs`), even though it decides every voice answer in both study sessions.

## src/i18n/README.md

- **[FIXED 2026-11-18: `navigation.ts` removed; the app uses `next/link` / `next/navigation` throughout.]** `navigation.ts` exports `Link`, `redirect`, `usePathname`, `useRouter`, and `getPathname`, but nothing imports `@/i18n/navigation`. `SiteHeader` uses `next/link` and `next/navigation` instead (see below), so its links bypass the locale-aware helpers. This is dead code or an unfinished migration.
- **[FIXED 2026-11-18: `Lang` is derived from `routing.locales`; per-language tables are `Record<Lang, …>`, so `tsc` flags each one.]** `routing.ts` is declared the next-intl source of truth, but at least 8 other places hard-code the locale set (listed under Global Invariants in `README.md`). There is no shared derivation from `routing.locales`.

## src/hooks/README.md

- **[FIXED 2026-11-13: `updateCard` re-reads storage before writing.]** **Concurrent writers can overwrite each other.** `useSRS` and `useQASRS` each hold a private in-memory snapshot of `{lang}-progress`, and every `updateCard` writes the whole snapshot back (`{ ...prev, [key]: ... }`, `useSRS.ts:38`, `useQASRS.ts:67`). Two writers mounted at the same time would erase each other's keys. The contract says instances "do not observe each other's writes"; it does not mention that they overwrite each other.
- **[FIXED 2026-11-18: moved to `src/lib/progressStorage.ts`.]** `loadFromStorage`, `saveToStorage`, and `getStorageKey` are copied verbatim in `useSRS.ts` and `useQASRS.ts`. The shared key is a convention between two copies, not a shared module.
- `useVoiceRecognition` returns `stopListening`, but no consumer calls it (`StudySession.tsx:55` and `QAStudySession.tsx:98` take only `isSupported`, `isListening`, `startListening`). A user cannot cancel listening.
- **[FIXED 2026-11-18: the saved filter keeps only known levels (`@/lib/levels:isLevel`) and falls back to the default when none remain.]** `useLevelFilter` accepts any non-empty saved array without checking its elements (`useLevelFilter.ts:20`). A stored `["B1"]` would hide every card. The contract notes the missing validation; nothing guards against it.
- Rephrase and Q&A share one `{lang}-level-filter` value, because `rephrase/page.tsx`, `qa/page.tsx`, and both sessions call `useLevelFilter(lang, …)` with the same key. No contract states that the filter is shared between activities.

## src/components/README.md

- **[FIXED 2026-11-13: reproduced by hook tests; fixed in the hooks, and reset now reloads the page.]** **Reset probably does not survive the next answer (not confirmed by running).** `SiteHeader.handleReset` only calls `localStorage.removeItem('{lang}-progress')` and `router.refresh()` (`SiteHeader.tsx:31-36`). It is rendered in the persistent `[lang]` layout, and `router.refresh()` keeps client `useState`. A study session mounted at that moment keeps its old progress snapshot, and its next `updateCard` writes the full pre-reset record back to storage (see the hooks finding above). Badges on a browser page also stay stale until remount.
- **[FIXED 2026-11-17: one option per `LANG_META` entry; dropdown tests for both languages.]** **The language dropdown is wrong for `es`.** The first option always renders `LANG_META.it` but links to `/${lang}`; the second renders `LANG_META[OTHER_LANG[lang]]`. On `/es` both options read "Italiano" and Español never appears (`SiteHeader.tsx:77-90`).
- The comment for the `SiteHeader` back link says "3+ segments: /lang/deck", but the code checks `segments.length >= 2` (`SiteHeader.tsx:26-28`). On `/it/rephrase/daily` the back link goes to `/it/rephrase`.
- **[RESOLVED 2026-11-18: the unused helpers were removed instead.]** `SiteHeader` uses `next/link` and `next/navigation` rather than the locale-aware `@/i18n/navigation` helpers.
- **[FIXED 2026-11-18: `@/components/DeckGrid` is now the shipped grid (`{ lang, activeLevels }`, correct links), imported by `rephrase/page.tsx`.]** `DeckGrid` is dead and its links are wrong. No route imports it (only `DeckGrid.test.tsx`), and it links to `/${lang}/${deck.id}` (`DeckGrid.tsx:43`), which is not a generated route (the real route is `/${lang}/rephrase/${deck}`). `src/app/[lang]/rephrase/page.tsx` re-implements it privately with the correct link, so the tested component and the shipped one differ.
- **[FIXED 2026-11-18: labels come from `study.micStart` / `study.micListening` / `study.audio` / `nav.changeLanguage`; tested with real messages in `a11yLabels.test.tsx`.]** Accessibility labels are hard-coded in English despite next-intl: `MicButton` (`'Listening…'`, `'Start speaking'`), `ChoiceButton` (`aria-label="audio"`), and `SiteHeader` (`aria-label="Change language"`).
- **[FIXED 2026-11-18: the speak icon is a sibling `<button>`, positioned over the answer button with CSS; tests in `ChoiceButton.test.tsx`.]** `ChoiceButton` nests an interactive `<span role="button" tabIndex={0}>` inside a `<button>` (`ChoiceButton.tsx:15-38`). This nesting is invalid. Once the button is disabled after an answer, browsers usually stop delivering clicks to its children, so the 🔊 control stops working at that point. The contract describes the propagation guard but not this limitation.
- [PARTLY FIXED 2026-11-13: `SiteHeader` now has reset and back-link tests.] `AudioButton`, `ChoiceButton`, `LevelFilterChips`, and `SiteHeader` have no tests in `src/__tests__/components/`. `SiteHeader` is where the reset, dropdown, and back-link defects above live.

## src/data/README.md

- The header comment of `deckMap.ts` lists its users as "DeckPage … and StudySession", but `src/app/[lang]/rephrase/page.tsx` and `src/components/DeckGrid.tsx` also import `DECK_MAP`. Minor stale comment; the contract's consumer list is correct.
- No test checks that `deckMetadata[*].cardCount` (hard-coded `40` × 16) matches the `DECK_MAP` array lengths. It holds today (every deck has 40 cards: 20 A1 / 20 A2), but only by convention.

## src/data/it/README.md

- **[FIXED 2026-11-17: `generateChoices` now draws foils from distinct back texts.]** `weather.ts` repeats 3 `back` strings (`'Cade la pioggia.'`, `'Il cielo è coperto.'`, `'La temperatura è alta.'`). Paired with `generateChoices`, this can show duplicate answer options (see `src/lib`).

## src/data/es/README.md

- **[FIXED 2026-11-17: `generateChoices` now draws foils from distinct back texts.]** `weather.ts` repeats 3 `back` strings (`'Cae la lluvia.'`, `'El cielo está cubierto.'`, `'La temperatura es alta.'`). Same consequence as the Italian deck.

## src/data/qa/README.md

No drift detected.

## src/app/README.md

- The home page is not localized. `<html lang="en">` is hard-coded (`layout.tsx:16`) and `"Choose Your Language"` is an English literal (`page.tsx:33`), while all content under `[lang]` is Italian or Spanish via next-intl. Screen readers will use English pronunciation for Italian/Spanish text.

## src/app/[lang]/README.md

- **[FIXED 2026-11-17: activity picker and scenario list have their own `page.*` strings; tests in `src/__tests__/app/listPageHeadings.test.tsx`.]** **All three browser pages share one heading.** `[lang]/page.tsx`, `rephrase/page.tsx`, and `qa/page.tsx` each render `t('page.title')` / `t('page.subtitle')`, which are deck-specific strings ("Scegli un Mazzo" / "Seleziona una categoria per iniziare"; "Elige un Mazo"). The activity picker and the Q&A scenario list are therefore headed "Choose a Deck".
- **[FIXED 2026-11-18: uses `isLang`.]** The layout's locale check casts to the literal `'it' | 'es'` (`layout.tsx:23`), adding another hard-coded copy of the locale set.
- **[FIXED 2026-11-18: removed.]** The message keys `page.chooseLanguage`, `page.chooseDeck`, and the `deckCardCount` namespace in `messages/*.json` are not referenced anywhere in `src/` (dead strings).

## src/app/[lang]/rephrase/README.md

- **[FIXED 2026-11-18: the page imports `@/components/DeckGrid`.]** This page duplicates `@/components/DeckGrid` almost line for line (only the `href` differs), so the shipped grid is untested and the tested one is unused (see `src/components`).

## src/app/[lang]/rephrase/[deck]/README.md

- **[FIXED 2026-11-13: end screen now derived at render time; real-state tests in `StudySession.endScreens.test.tsx`.]** **The "all done" screen cannot be reached by finishing a session.** `handleAnswer` calls `updateCard(...)` (an async state update) and then evaluates `isCardDueForDeck` from the same render (`StudySession.tsx:190-205`). When called from the 600 ms `setTimeout` in `handleChoiceClick`, that is the render at click time. The card just answered is still due in that snapshot, so `allDecksEmpty` is always `false` and the session always shows `deckComplete`. The contract describes the intended behavior, not the actual one.
- **[FIXED 2026-11-17: Next is disabled until a choice is made, records that choice, and cancels the pending auto-advance; tests in `StudySession.endScreens.test.tsx`.]** **"Next" records a correct answer without a quiz answer.** The `nextButton` control calls `handleAnswer(true)` directly (`StudySession.tsx:289`). A user can flip and press Next to promote every card. Pressing Next inside the 600 ms window after choosing also runs `handleAnswer` twice: two `updateCard` calls and a skipped card.
- **[FIXED 2026-11-17: "Study again" is now a practice replay that saves nothing, hidden when the session had no cards.]** **"Study again" replays the same snapshot.** `resetSession` resets `index` but not the `dueCards` snapshot (`StudySession.tsx:83-91`). A second pass re-answers cards already reviewed and advances their boxes again on the same day. When the session mounted with zero due cards, the button does nothing.
- **[FIXED 2026-11-18: one `FeedbackMessage`, below the card.]** `FeedbackMessage` is rendered twice, once inside the card back and once below the card (`StudySession.tsx:277, 282`). This gives two `role="status"` live regions with the same text.
- **[FIXED 2026-11-18: `.btn:disabled` fades it and shows a not-allowed cursor.]** (Found 2026-11-18 while checking the `ChoiceButton` fix in Chrome.) The Next button is `disabled` until a choice is made, but `.btn` has no disabled style: it keeps full opacity and a pointer cursor, so it looks clickable when it is not.

## src/app/[lang]/qa/README.md

- **[FIXED 2026-11-17: `QAStudySession` now counts any progress, like every other caller.]** `qa/page.tsx` passes `useSRS(lang).hasProgress` (true for any Rephrase *or* Q&A key) to `useLevelFilter`. `QAStudySession` uses `bootstrapHasProgress`, which counts only `qa_` keys. With no saved filter, the browser page and the session can therefore default to different levels (`['A1','A2']` vs `['A1']`).

## src/app/[lang]/qa/[scenario]/README.md

- **[FIXED 2026-11-13: end screen now derived at render time; real-state tests in `QAStudySession.endScreens.test.tsx`.]** **The "all scenarios done" screen cannot be reached by finishing a session.** This is the same stale-closure defect as Rephrase: `handleAnswer` checks `isScenarioHasDue(progress, …)` with the `progress` captured before `updateCard` applies (`QAStudySession.tsx:157-176`). The last card counts as due, so `done` is always chosen.
- **[FIXED 2026-11-17: a card missed before the correct retry is recorded as wrong; tests in `QAStudySession.endScreens.test.tsx`.]** **Wrong answers are never recorded.** `updateCard` is only ever called with `true` (`QAStudySession.tsx:185, 207`). Q&A cards never return to box 1, which contradicts the Leitner rule in the root README ("Incorrect (any box) → 1"). The contract states the behavior; the root README does not scope its rule to Rephrase.
- **[FIXED 2026-11-17: "Study again" is now a practice replay that saves nothing, hidden when the session had no cards.]** "Study again" replays the same `sessionDueCards` snapshot. Same issue as Rephrase.
- **[FIXED 2026-11-18: `getQACardKey` moved to `@/lib/srs` and shared.]** `isScenarioHasDue` re-implements the `qa_{scenarioId}_{cardId}` key format inline (`QAStudySession.tsx:59`) instead of sharing `getQACardKey` (which is private to `useQASRS.ts`). That makes a third copy of a persisted-key contract.
- **[FIXED 2026-11-18: one `speak` in `src/lib/speak.ts`, one `LANG_LOCALE` in `src/lib/locale.ts`.]** `speak()` and `LANG_LOCALE` are copied in `QAStudySession.tsx`, `StudySession.tsx`, and `AudioButton.tsx`.
- **[FIXED 2026-11-18: uses `isLang`, like every `[lang]` route.]** `page.tsx` validates `lang` with the literal `['it', 'es']` (line 24), while the sibling `rephrase/[deck]/page.tsx` uses `routing.locales`.

## src/README.md

- **[FIXED 2026-11-18: the private `DeckGrid` and the `speak`/`LANG_LOCALE` copies are gone.]** The stated layering (`app` → `components` → `hooks` → `lib` → `types`) holds for imports, but `app` duplicates logic that belongs lower down: a private `DeckGrid` and three copies of `speak`/`LANG_LOCALE`. The dependency map does not show this.

## scripts/README.md

- **[FIXED 2026-11-13: mirror lookup now tries all four test suffixes; the `src/app/**` limitation remains.]** **The analyzer that AGENTS.md requires misreports coverage.** Its mirror lookup rewrites every `.ts`/`.tsx` to `.test.tsx` (`analyze-test-coverage.ts:170-171`). Real runs today:
  - `node scripts/analyze-test-coverage.ts src/lib/` reports "Test file: _Not found_" for all 3 files, although `srs.test.ts` and `generateChoices.test.ts` exist.
  - `src/hooks/` misses `useVoiceRecognition.test.ts`.
  - It cannot find tests for `src/app/**` sessions, because `StudySession.test.tsx` and `QAStudySession.test.tsx` live in `src/__tests__/components/`, not in a mirror of `src/app/`.
- `generateMarkdownReport` prints a "Low severity" count (`analyze-test-coverage.ts:309, 317`), but `analyzeGaps` never produces `low`, so that row is always 0.
- `parseExports` matches non-exported `function` declarations (`analyze-test-coverage.ts:34`), so private helpers (e.g. `shuffleArray`, `addDays`) show up as untested "exports" with high severity.

## README.md

- [FIXED 2026-11-17: Q&A now records misses, so the rule holds for both modes.] "How the Spaced Repetition Works" states that a wrong answer resets a card to box 1. That is true for Rephrase only; Q&A never records wrong answers (see `qa/[scenario]`).
- The "Q&A Study Mode" feature line says "open-ended question-and-answer mode", but `QAStudySession` is strictly multiple choice (1 correct + 3 fixed foils) with optional voice selection.
- [FIXED 2026-11-13] Global Side Effects describes the `SiteHeader` reset as clearing progress. In practice an active study session can write the old progress back (see `src/components`).
