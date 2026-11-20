# Q&A Scenarios (`src/data/qa`)

## Overview
Static content for Q&A mode. Each scenario file exports one `Scenario` (from `@/types`): a themed conversation of eight multiple-choice `QACard`s. Every card holds an Italian question, the correct answer, and three foils, plus parallel Spanish translations (`questionEs`, `correctEs`, `foilsEs`). The barrel `index.ts` re-exports every scenario and the ordered `scenarios` array.

## Interface
`index.ts` (barrel) exports:
- `caffe`, `albergo`, `ristorante`, `strada`, `presentazioni`, `negozio`, `treno`: one `Scenario` each.
- `scenarios`: an array of those seven scenarios in canonical display order: `[caffe, albergo, ristorante, strada, presentazioni, negozio, treno]`. Per the comment in `index.ts`, A1 scenarios come first and A2 scenarios last.

| Export | File | `id` (`ScenarioId`) | `titleIt` / `titleEs` | Card level | Cards |
| --- | --- | --- | --- | --- | --- |
| `caffe` | `caffe.ts` | `'coffee'` | Al Caffè / En el Café | `A1` | 8 (`coffee_01`..`coffee_08`) |
| `albergo` | `albergo.ts` | `'hotel'` | In Albergo / En el Hotel | `A1` | 8 (`hotel_01`..`hotel_08`) |
| `ristorante` | `ristorante.ts` | `'restaurant'` | Al Ristorante / En el Restaurante | `A1` | 8 (`restaurant_01`..`restaurant_08`) |
| `strada` | `strada.ts` | `'street'` | Per Strada / En la Calle | `A1` | 8 (`street_01`..`street_08`) |
| `presentazioni` | `presentazioni.ts` | `'introductions'` | Presentazioni / Presentaciones | `A1` | 8 (`introductions_01`..`introductions_08`) |
| `negozio` | `negozio.ts` | `'shop'` | Al Negozio / En la Tienda | `A2` | 8 (`shop_01`..`shop_08`) |
| `treno` | `treno.ts` | `'train'` | In Treno / En el Tren | `A2` | 8 (`train_01`..`train_08`) |

Consumers: `src/app/[lang]/qa/layout.tsx` and `src/app/[lang]/qa/[scenario]/page.tsx` (static params, plus `scenarios.find` by `id`), `src/app/[lang]/qa/[scenario]/QAStudySession.tsx`, and `src/components/ScenarioGrid.tsx`.

## Invariants
- Each scenario must satisfy `Scenario` from `@/types`. `id` must be a `ScenarioId` literal. `foils` and `foilsEs` are fixed 3-tuples (`[string, string, string]`).
- Scenario `id` values are route segments: pages are generated from `scenarios.map((s) => ({ lang, scenario: s.id }))` and resolved with `scenarios.find`. They must be unique and stable.
- Card `id`s use the form `"{scenarioId}_NN"`. Progress is looked up by `getQACardKey(scenarioId, card.id)` (`src/lib/srs.ts`, used by `useQASRS` and `QAStudySession`). Renaming a card `id` orphans any stored progress for that card.
- The choices must not give the answer away by length: in each language the correct answer may be strictly the longest of the four on at most a third of the cards (about a quarter is what chance gives; after the 2026-11-20 rewrite it is 15/56 in Italian, 14/56 in Spanish). Every card's four choices must also differ after `normalize` (`src/lib/matchTranscript.ts`), or a spoken answer could not pick one. `src/__tests__/data/qaChoices.test.ts` checks both. When editing foils, change the Italian and Spanish foil together so they stay parallel translations.
- Levels are per card. In the current data all 8 cards of a scenario share one level, which is what the `A1`-before-`A2` display order follows.
- The `scenarios` array order is the display order (A1 before A2). A new scenario must be added both to the `export { ... }` list and to the `scenarios` array.

## Side Effects
- None. These are pure constant module exports with no runtime I/O.

## Verification
- Run: `npx vitest run` (the `npm test` script runs `vitest` in watch mode). `src/__tests__/app/localeValidation.test.tsx` imports the real `scenarios` to build a valid route, and `src/__tests__/data/qaChoices.test.ts` checks the real choices (length cue, normalized duplicates). `src/__tests__/components/QAStudySession.test.tsx` mocks `@/data/qa`, and `src/__tests__/hooks/useQASRS.test.tsx` uses an inline fixture.
