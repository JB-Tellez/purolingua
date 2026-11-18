# Content Data (`src/data`)

## Overview
Static, build-time content for PuroLingua. This directory holds the Rephrase-mode flashcard decks (Italian and Spanish) and the Q&A-mode scenarios, plus two top-level modules. `decks.ts` holds deck metadata and the canonical deck ID list. `deckMap.ts` is a lookup table from language and deck ID to that deck's card array. Every module here is a plain constant export typed against `@/types`.

## Interface
- `decks.ts`
  - `interface DeckMeta { id: DeckId; lang: Lang; i18nKey: DeckId; icon: string; theme: string; cardCount: number }`. `i18nKey` indexes the `decks` namespace in `messages/{lang}.json`.
  - `deckMetadata: DeckMeta[]`: 16 entries, one for each of the 8 deck IDs for both `it` and `es`. Every entry has `cardCount: 40`.
  - `DECK_IDS: DeckId[]`: the 8 language-neutral deck IDs in display order: `daily`, `restaurant`, `travel`, `shopping`, `hotel`, `emergencies`, `social`, `weather`.
- `deckMap.ts`
  - `DECK_MAP: Record<Lang, Record<DeckId, Card[]>>`: maps `it` and `es` to the arrays exported by `./it` and `./es`. Used for route-parameter lookup and for cross-deck checks (per the file header).
- Subdirectories:
  - [`it`](./it/README.md): Italian Rephrase decks (`italianDaily` ... `italianWeather`, each a `Card[]`).
  - [`es`](./es/README.md): Spanish Rephrase decks (`spanishDaily` ... `spanishWeather`, each a `Card[]`).
  - [`qa`](./qa/README.md): Q&A scenarios (`scenarios` plus 7 named `Scenario` exports).

Consumers: `src/components/DeckGrid.tsx`, `src/app/[lang]/rephrase/layout.tsx`, `src/app/[lang]/rephrase/[deck]/page.tsx`, and `src/app/[lang]/rephrase/[deck]/StudySession.tsx` import `deckMetadata`, `DECK_IDS`, and/or `DECK_MAP`.

## Invariants
- `DECK_MAP` must have an entry for every `Lang` × `DeckId` combination. The `Record<Lang, Record<DeckId, Card[]>>` type enforces this at compile time.
- `deckMetadata[*].cardCount` is hard-coded (40) and must match the length of the corresponding `DECK_MAP[lang][id]` array. Nothing in the code enforces this.
- `DECK_IDS` must list every `DeckId` literal from `@/types` exactly once. It is used to generate routes (`src/app/[lang]/rephrase/[deck]/page.tsx`, `src/app/[lang]/rephrase/layout.tsx`).
- Card array order is part of the persisted identity. Rephrase progress is keyed by `"{deckId}_{cardIndex}"` (see `Progress` in `src/types/index.ts`).

## Side Effects
- None. These are pure constant module exports with no runtime I/O.

## Verification
- Run: `npx vitest run` (the `npm test` script runs `vitest` in watch mode). No test imports `src/data` modules directly. `src/__tests__/components/DeckGrid.test.tsx` and `src/__tests__/components/StudySession.test.tsx` mock `@/data/decks` and `@/data/deckMap`.
