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
- Each array has 40 cards. This must match the hard-coded `cardCount: 40` for `lang: 'es'` in `../decks.ts` (`deckMetadata`); `src/__tests__/data/decks.test.ts` fails if they differ.
- Do not reorder, insert, or remove cards in the middle of an array. Stored progress is keyed by `"{deckId}_{cardIndex}"` (see the `Progress` comment in `src/types/index.ts`), so array position is the card's identity.
- Each export name must stay in sync with `index.ts` and the imports in `../deckMap.ts`.

## Side Effects
- None. These are pure constant module exports with no runtime I/O.

## Verification
- Run: `npx vitest run` (the `npm test` script runs `vitest` in watch mode). `src/__tests__/data/decks.test.ts` reads these arrays through the real `DECK_MAP` to check their length. Component tests (`DeckGrid.test.tsx`, `StudySession.test.tsx`) mock `@/data/deckMap` instead.
