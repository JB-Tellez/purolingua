# components

## Overview

Shared client-side React UI components (`'use client'`) for the PuroLingua
Next.js app. Every component is a default export. Most are presentational and
take a `lang: Lang` prop (`'it' | 'es'`). Translated strings come from
`next-intl` `useTranslations` namespaces. Two grid components (`DeckGrid`,
`ScenarioGrid`) read SRS progress through the hooks in
[`../hooks/README.md`](../hooks/README.md) to show due-card badges.

Consumers are the route files under `src/app/[lang]/` (layout, home, `qa`,
`rephrase`, and the study session components).

## Interface

| Component | Props | Notes |
| --- | --- | --- |
| `ActivityPicker` (`ActivityPicker.tsx`) | `{ lang }` | Links to `/{lang}/rephrase` and `/{lang}/qa`; i18n namespace `activities`. |
| `AudioButton` (`AudioButton.tsx`) | `{ phrase: string; lang }` | Speaks `phrase` with `speechSynthesis`; i18n namespace `study` (`audio`). |
| `ClientOnly` (`ClientOnly.tsx`) | `{ children }` | Renders `children` only in the browser after hydration (`useSyncExternalStore`: `false` on the server and during hydration). Nothing in prerendered HTML. Used by the two list pages around UI built from `localStorage`. |
| `ChoiceButton` (`ChoiceButton.tsx`) | `{ text; state: 'idle' \| 'correct' \| 'incorrect'; onClick; disabled?; onSpeak? }` | A `.quiz-option` wrapper holding the answer button and, beside it, a speak button (`.quiz-audio-icon`, labelled `study.audio`); i18n namespace `study`. |
| `DeckGrid` (`DeckGrid.tsx`) | `{ lang; activeLevels: Level[] }` | One card per `@/data/decks:deckMetadata` entry for `lang`, linking to `/{lang}/rephrase/{deck.id}`; due badge from `useSRS`; i18n namespaces `decks`, `deckDescriptions`, `badge`. Used by `src/app/[lang]/rephrase/page.tsx`. |
| `FeedbackMessage` (`FeedbackMessage.tsx`) | `{ state: 'correct' \| 'incorrect' \| 'heard' \| 'notRecognized' \| null }` | `role="status"`, `aria-live="polite"`; i18n namespace `study`. |
| `LevelFilterChips` (`LevelFilterChips.tsx`) | `{ lang; activeLevels: Level[]; setActiveLevels(levels: Level[] \| null) }` | A `role="group"` labelled `filter.label`, with one toggle chip per level in `@/lib/levels:LEVELS` (`A1`, `A2`); i18n namespace `filter`. `lang` is unused. |
| `MicButton` (`MicButton.tsx`) | `{ state: 'idle' \| 'listening' \| 'error'; onPress }` | Class `mic-btn` plus `mic-btn--{state}` when not idle. Label `study.micListening` while listening, otherwise `study.micStart`. A toggle (`aria-pressed`): both sessions cancel listening when it is pressed again. |
| `ScenarioGrid` (`ScenarioGrid.tsx`) | `{ lang; activeLevels: Level[] }` | One tile per `@/data/qa:scenarios`, linking to `/{lang}/qa/{scenario.id}`; due badge from `useQASRS`; i18n namespace `badge`. |
| `SiteHeader` (`SiteHeader.tsx`) | `{ lang }` | Logo, back link, progress reset (a `<button>` styled like the links; asks `nav.resetConfirm` first), language dropdown (button labelled `nav.changeLanguage`, with `aria-expanded`); i18n namespace `nav`. |

## Invariants

- **Due badges**: `DeckGrid` and `ScenarioGrid` render `badge.due` with the
  count (`"{count, plural, one {# carta} other {# carte}}"` in Italian, v1.1's
  wording with plurals) or, when nothing is due, `badge.done` ("Completato" /
  "Completado") with class `deck-card-badge--done` (dark green, a `✓` before
  the word via CSS).
  Both take `activeLevels` as a prop (the page's `useLevelFilter` state, shared
  with `LevelFilterChips`), so badges follow the chips. `DeckGrid` counts cards
  whose `level` is in `activeLevels` and `isCardDueForDeck` is true;
  `ScenarioGrid` uses `useQASRS(...).dueCards.length`.
- **Deck lookup**: `DeckGrid` gets cards from `@/data/deckMap:DECK_MAP[lang][deck.id]`
  and falls back to `[]` when missing. Indices are positional and passed to
  `isCardDueForDeck(deckId, index)`.
- **Scenario theming**: `ScenarioGrid` assigns themes cyclically from
  `SCENARIO_THEMES` by array index, and titles from `titleIt` / `titleEs` by `lang`.
- **ChoiceButton is locked after answering**: the answer button is disabled
  when `disabled` is true or `state !== 'idle'`. The speak button is a sibling,
  never nested, so it stays enabled and clickable after answering; it calls
  `onSpeak` without triggering `onClick`. The answer button's accessible name
  is just `text`.
- **Click propagation**: `AudioButton` and `MicButton` call
  `e.stopPropagation()` before acting, so they can sit inside clickable cards.
- **LevelFilterChips relies on the FLTR-06 guard**: deselecting the last
  active level passes `[]` to `setActiveLevels`, and the component expects the
  setter (`useLevelFilter`) to ignore it.
- **FeedbackMessage** renders nothing when `state === null`.
- **AudioButton** speaks with `@/lib/speak` (locale, rate, and voice choice
  are documented in [`../lib/README.md`](../lib/README.md)). It does nothing if
  `window.speechSynthesis` is absent.
- **SiteHeader back link**: shown when the pathname has 2 or more segments
  (`segments.length >= 2`), pointing to the path with its last segment removed
  (e.g. `/it/rephrase` → `/it`).
- **SiteHeader language dropdown**: one option per `LANG_META` entry, in
  `LANG_META` order, each linking to its own `/{code}` and marked `active` for
  the current language. Adding a locale to `LANG_META` adds its option. While
  open, it closes on a click outside it (as in v1.1), on Escape, or when an
  option is chosen; the button's `aria-expanded` follows it.
- **SiteHeader reset asks first**: it deletes all progress for the language
  with no undo, so it calls `window.confirm(t('resetConfirm'))` (v1.1's
  wording) and does nothing if the user cancels.

## Side Effects

- `SiteHeader` reset: a `window.confirm` dialog; if accepted, `clearProgress(lang)` (`@/lib/progressStorage`), then a full
  page reload via `reloadPage()` (`@/lib/reloadPage`), so mounted grids and
  study sessions drop their in-memory progress. This key holds both Rephrase
  and Q&A progress (see `../hooks/README.md`), so both are cleared.
  The level filters and the other language's progress are not touched.
- `AudioButton`: `window.speechSynthesis.cancel()` then `speak(utterance)`
  (audio output).
- `DeckGrid` and `ScenarioGrid` read `localStorage` indirectly via `useSRS` and
  `useQASRS` (their `activeLevels` comes from the page as a prop). `ScenarioGrid` mounts one `useQASRS`
  instance per scenario tile.
- All other components are pure render plus callback props.

## Verification

- Run: `npm test` (Vitest; `npm test` runs `vitest`, which starts watch mode
  in an interactive terminal).
- Targeted, single run: `npx vitest run src/__tests__/components`
  (tests live in the mirror tree `src/__tests__/components/`. That directory
  also holds tests for `QAStudySession` and `StudySession`, which live under
  `src/app/[lang]/`).
- Coverage gaps: `node scripts/analyze-test-coverage.ts src/components/`
