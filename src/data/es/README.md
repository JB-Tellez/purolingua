# Spanish Rephrase Decks (`src/data/es`)

## Overview
Static Spanish flashcard content for Rephrase mode. Each file exports one `Card[]` array (type `Card` from `@/types`) for a single `DeckId`. The barrel `index.ts` re-exports all eight arrays, and `../deckMap.ts` wires them into `DECK_MAP.es`. Each card's `front` is a Spanish phrase and its `back` is a Spanish paraphrase or explanation, tagged with a CEFR `level`.

## Interface
Every export comes from `index.ts` (the barrel), which re-exports one constant per file:

| Export | File | Type | Cards (A1 / A2) |
| --- | --- | --- | --- |
| `spanishDaily` | `daily.ts` | `Card[]` | 40 (20 / 20) |
| `spanishRestaurant` | `restaurant.ts` | `Card[]` | 40 (20 / 20) |
| `spanishTravel` | `travel.ts` | `Card[]` | 40 (20 / 20) |
| `spanishShopping` | `shopping.ts` | `Card[]` | 40 (20 / 20) |
| `spanishHotel` | `hotel.ts` | `Card[]` | 40 (20 / 20) |
| `spanishEmergencies` | `emergencies.ts` | `Card[]` | 40 (20 / 20) |
| `spanishSocial` | `social.ts` | `Card[]` | 40 (20 / 20) |
| `spanishWeather` | `weather.ts` | `Card[]` | 40 (20 / 20) |

Consumers import through `@/data/es` (used only by `../deckMap.ts`).

## Invariants
- Each element must satisfy `Card` (`front: string`, `back: string`, `level: 'A1' | 'A2'`) from `@/types`.
- Each array has 40 cards. This must match the hard-coded `cardCount: 40` for `lang: 'es'` in `../decks.ts` (`deckMetadata`). Nothing in the code enforces this.
- Do not reorder, insert, or remove cards in the middle of an array. Stored progress is keyed by `"{deckId}_{cardIndex}"` (see the `Progress` comment in `src/types/index.ts`), so array position is the card's identity.
- Each export name must stay in sync with `index.ts` and the imports in `../deckMap.ts`.

## Side Effects
- None. These are pure constant module exports with no runtime I/O.

## Verification
- Run: `npx vitest run` (the `npm test` script runs `vitest` in watch mode). No test imports these modules directly. Tests that use deck data mock `@/data/deckMap` instead (`src/__tests__/components/DeckGrid.test.tsx`, `src/__tests__/components/StudySession.test.tsx`).
