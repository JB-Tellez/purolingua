# Italian Rephrase Decks (`src/data/it`)

## Overview
Static Italian flashcard content for Rephrase mode. Each file exports one `Card[]` array (type `Card` from `@/types`) for a single `DeckId`. The barrel `index.ts` re-exports all eight arrays, and `../deckMap.ts` wires them into `DECK_MAP.it`. Each card's `front` is an Italian phrase and its `back` is an Italian paraphrase or explanation, tagged with a CEFR `level`.

## Interface
Every export comes from `index.ts` (the barrel), which re-exports one constant per file:

| Export | File | Type | Cards (A1 / A2) |
| --- | --- | --- | --- |
| `italianDaily` | `daily.ts` | `Card[]` | 40 (20 / 20) |
| `italianRestaurant` | `restaurant.ts` | `Card[]` | 40 (20 / 20) |
| `italianTravel` | `travel.ts` | `Card[]` | 40 (20 / 20) |
| `italianShopping` | `shopping.ts` | `Card[]` | 40 (20 / 20) |
| `italianHotel` | `hotel.ts` | `Card[]` | 40 (20 / 20) |
| `italianEmergencies` | `emergencies.ts` | `Card[]` | 40 (20 / 20) |
| `italianSocial` | `social.ts` | `Card[]` | 40 (20 / 20) |
| `italianWeather` | `weather.ts` | `Card[]` | 40 (20 / 20) |

Consumers import through `@/data/it` (used only by `../deckMap.ts`).

## Invariants
- Each element must satisfy `Card` (`front: string`, `back: string`, `level: 'A1' | 'A2'`) from `@/types`.
- Each array has 40 cards, 20 per level; `src/__tests__/data/decks.test.ts` fails otherwise.
- Do not reorder, insert, or remove cards in the middle of an array. Stored progress is keyed by `"{deckId}_{cardIndex}"` (see the `Progress` comment in `src/types/index.ts`), so array position is the card's identity.
- Each export name must stay in sync with `index.ts` and the imports in `../deckMap.ts`.

## Side Effects
- None. These are pure constant module exports with no runtime I/O.

## Verification
- Run: `npx vitest run` (the `npm test` script runs `vitest` in watch mode). `src/__tests__/data/decks.test.ts` reads these arrays through the real `DECK_MAP` to check their length and levels. Component tests (`DeckGrid.test.tsx`, `StudySession.test.tsx`) mock `@/data/deckMap` instead.
