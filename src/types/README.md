# types

## Overview
This directory holds the core domain types for PuroLingua v1.2, all in `index.ts`. Other code imports them as `@/types`. They cover flashcard decks (the rephrase mode), Leitner progress records, and Q&A scenarios. The file contains types only and produces no runtime code.

## Interface
- `type Lang = 'it' | 'es'`
- `type Level = 'A1' | 'A2'`
- `type DeckId = 'daily' | 'restaurant' | 'travel' | 'shopping' | 'hotel' | 'emergencies' | 'social' | 'weather'`
- `interface Card { front: string; back: string; level: Level }`
- `interface Deck { id: DeckId; lang: Lang; cards: Card[] }`
- `interface Progress { box: number; nextReview: string }`
- `type ProgressRecord = Record<string, Progress>`
- `type ScenarioId = 'coffee' | 'hotel' | 'restaurant' | 'street' | 'introductions' | 'shop' | 'train'`
- `interface QACard { id; question; correct; foils: [string, string, string]; questionEs; correctEs; foilsEs: [string, string, string]; level: Level }`
- `interface Scenario { id: ScenarioId; icon: string; titleIt: string; titleEs: string; level: Level; cards: QACard[] }`

## Invariants
- `ProgressRecord` keys use the format `"{deckId}_{cardIndex}"` (for example `"daily_0"`). The key format must stay identical to v1.1, because existing `localStorage` data uses it. [`src/lib/srs.ts`](../lib/README.md) `getCardKey` produces these keys.
- `Progress.nextReview` is a `YYYY-MM-DD` date string, matching the v1.1 `localStorage` format.
- `QACard.foils` and `QACard.foilsEs` are fixed 3-tuples, so each Q&A card always has exactly 3 distractors per language. The `*Es` fields are parallel Spanish translations of the Italian fields.
- The `Lang` literals must stay in sync with `routing.locales` in [`src/i18n/routing.ts`](../i18n/README.md).

## Side Effects
- None. The file contains only types.

## Verification
- There are no unit tests for this directory. Type correctness is enforced by the compiler.
- Type-check: `npx tsc --noEmit`. This reports no errors in `src/types/`, but the repository currently has 3 existing type errors in files under `src/__tests__/`.
- Full suite: `npx vitest run` (or `npm test`).
