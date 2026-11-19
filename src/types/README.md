# types

## Overview
This directory holds the core domain types for PuroLingua 0.1.2 (the `package.json` version, shown in the footer; v1.1 is the pre-Next.js app on the `vanilla` branch), all in `index.ts`. Other code imports them as `@/types`. They cover flashcard decks (the rephrase mode), Leitner progress records, and Q&A scenarios. The file contains types only and produces no runtime code.

## Interface
- `type Lang = (typeof routing.locales)[number]` (currently `'it' | 'es'`), via a type-only import of `@/i18n/routing`
- `type Level = 'A1' | 'A2'`
- `type DeckId = 'daily' | 'restaurant' | 'travel' | 'shopping' | 'hotel' | 'emergencies' | 'social' | 'weather'`
- `interface Card { front: string; back: string; level: Level }`. `back` is the answer: in Rephrase decks, a same-language paraphrase of `front`, not a translation.
- `interface Progress { box: number; nextReview: string }`
- `type ProgressRecord = Record<string, Progress>`
- `type ScenarioId = 'coffee' | 'hotel' | 'restaurant' | 'street' | 'introductions' | 'shop' | 'train'`
- `interface QACard { id; question; correct; foils: [string, string, string]; questionEs; correctEs; foilsEs: [string, string, string]; level: Level }`
- `interface Scenario { id: ScenarioId; icon: string; titleIt: string; titleEs: string; cards: QACard[] }`. Levels are per card (`QACard.level`); level filtering never looks at the scenario.

## Invariants
- `ProgressRecord` holds two key formats in one record: Rephrase `"{deckId}_{cardIndex}"` (for example `"daily_0"`, `getCardKey`), which must stay identical to v1.1 because existing `localStorage` data uses it, and Q&A `"qa_{scenarioId}_{cardId}"` (`getQACardKey`, added after v1.1). Both come from [`src/lib/srs.ts`](../lib/README.md).
- `Progress.nextReview` is a `YYYY-MM-DD` date string, matching the v1.1 `localStorage` format.
- `QACard.foils` and `QACard.foilsEs` are fixed 3-tuples, so each Q&A card always has exactly 3 distractors per language. The `*Es` fields are parallel Spanish translations of the Italian fields.
- `Lang` is derived from `routing.locales` in [`src/i18n/routing.ts`](../i18n/README.md), so the two cannot drift. The import is type-only and adds no runtime dependency.

## Side Effects
- None. The file contains only types.

## Verification
- There are no unit tests for this directory. Type correctness is enforced by the compiler.
- Type-check: `npx tsc --noEmit`. It reports no errors.
- Full suite: `npx vitest run` (or `npm test`).
