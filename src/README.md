# src

## Overview

All application source for PuroLingua, a statically exported Next.js 16 App Router app (`next.config.ts`: `output: 'export'`). There is no backend: content is compiled in from `data/`, learner state lives in browser `localStorage`, and speech uses the Web Speech API. Imports use the `@/` alias for this directory (`tsconfig.json`, `vitest.config.ts`).

`style-reference.css` (global CSS custom properties and component classes) is imported by `app/globals.css`. Tests for this tree live in the mirror directory `__tests__/` (excluded from contracts).

Dependency direction (from `@/` imports): `app` → `components` → `hooks` → `lib` → `types` → `i18n`. `app` also imports `hooks`, `lib`, `data`, and `i18n` directly; `components` imports `lib` (`speak`, `progressStorage`, `reloadPage`, `levels`) and `data`; `data` depends only on `types`. `types` imports `@/i18n/routing` type-only (to derive `Lang`), and `i18n` imports no `@/` module (it loads `../../messages/<locale>.json`).

## Subdirectories & Boundaries

- app: [./app/README.md](./app/README.md) - App Router routes: root shell, `[lang]` locale segment, `rephrase/[deck]` flashcard sessions and `qa/[scenario]` Q&A sessions (client-only via `next/dynamic` `ssr: false`), with `generateStaticParams` for every dynamic segment.
- components: [./components/README.md](./components/README.md) - Shared client UI: activity/deck/scenario grids with SRS due badges, choice/audio/mic buttons, feedback message, level filter chips, `SiteHeader` (progress reset, language switcher).
- data: [./data/README.md](./data/README.md) - Static content: `deckMetadata`/`DECK_IDS`/`DECK_MAP` plus `it/`, `es/` Rephrase decks (8 × 40 cards each) and `qa/` scenarios (7 × 8 cards).
- hooks: [./hooks/README.md](./hooks/README.md) - `useSRS`, `useQASRS` (shared `{lang}-progress` key), `useLevelFilter` (one filter per activity: `{lang}-level-filter` for Rephrase, `{lang}-qa-level-filter` for Q&A; never empty), `useVoiceRecognition` (Web Speech recognition).
- i18n: [./i18n/README.md](./i18n/README.md) - next-intl config: `routing` (locales `it`, `es`; default `it`) and `isLang`, plus per-request message loading from `messages/<locale>.json`.
- lib: [./lib/README.md](./lib/README.md) - Domain logic: Leitner SRS scheduling and key formats (`srs.ts`), distractor generation (`generateChoices.ts`), fuzzy transcript matching (`matchTranscript.ts`), CEFR levels (`levels.ts`), speech locale (`locale.ts`); plus thin browser helpers: progress storage (`progressStorage.ts`), text-to-speech (`speak.ts`), page reload (`reloadPage.ts`).
- types: [./types/README.md](./types/README.md) - Domain types (`Lang`, `Level`, `DeckId`, `Card`, `Progress`, `ProgressRecord`, `ScenarioId`, `QACard`, `Scenario`); no runtime code.
