# Phase 17: Q&A Data - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Author all Q&A scenario content (7 Italian + 7 Spanish) and build the `useQASRS` hook with Leitner SRS. No UI components in this phase — the deliverable is the full data + logic layer that can be exercised in Vitest tests.

</domain>

<decisions>
## Implementation Decisions

### Data file structure
- One file per scenario: `src/data/qa/caffe.ts`, `src/data/qa/albergo.ts`, etc.
- Each file exports a `Scenario` object containing `titleIt`, `titleEs`, `level`, and `cards`
- Scenarios index at `src/data/qa/index.ts` — imports all 7 and exports as array
- Pattern mirrors existing `src/data/it/index.ts` and `src/data/es/index.ts` entry points

### Type definitions
- `QACard`, `ScenarioId`, `Scenario` types added to `src/types/index.ts` alongside existing `Card`/`Deck`
- No separate qa-types file — all domain types stay in one place

### useQASRS architecture
- New standalone hook at `src/hooks/useQASRS.ts` — not a wrapper around `useSRS`
- Reuses pure lib functions from `src/lib/srs.ts`: `advanceBox`, `isCardDue`, `getTodayString`
- Shares the `{lang}-progress` localStorage record (same key format as Rephrase)
- Q&A progress key format: `qa_{scenarioId}_{cardId}` (e.g., `qa_caffe_caffe_01`)
- API mirrors `useSRS`: `updateCard(scenarioId, cardId, isCorrect)`, `isCardDue(scenarioId, cardId)`, `hasProgress`, `progress`
- No `resetProgress` in this phase — that's a UI concern deferred to a later phase

### Content quantity
- **8 cards per scenario** at launch (56 cards per language, 112 total)
- Quality over quantity — 8 well-crafted cards beat 12 mediocre ones

### Foil strategy
- **Hand-authored unique foils per card** — 3 specifically chosen plausible-but-wrong responses per card
- Foils are contextually appropriate distractors (follow design doc sample style), not random
- No cross-card reuse within scenarios — each card's foils are unique

### Spanish content
- **Strict parallel to Italian** — Spanish cards are direct translations of Italian cards
- Same question meaning, same correct meaning, parallel foils
- Scenarios share the same theme and structure (e.g., "Al Caffè" → "En el Café")

### CEFR tagging
- **Card level = scenario level** — no mixed levels within a scenario at launch
- All cards in an A1 scenario are tagged A1; all cards in an A2 scenario are tagged A2
- `Scenario` type includes an explicit `level: Level` field for Phase 18 browser filtering
- 7 scenarios: 5 × A1 (caffe, albergo, ristorante, strada, presentazioni), 2 × A2 (negozio, treno)

</decisions>

<specifics>
## Specific Ideas

- Design doc at `docs/plans/2026-03-08-qa-scenarios-design.md` (Approved) has sample content for all 7 Italian scenarios — use as source for tone, difficulty calibration, and foil style
- Sample foil style: contextually plausible responses from a *different* conversational context (e.g., answering a coffee order question with a hotel-style answer)
- Q&A key format example: scenario `caffe`, card `caffe_01` → key `qa_caffe_caffe_01`

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/srs.ts` — `advanceBox`, `isCardDue`, `getTodayString`, `getNextReviewDate` all reusable by `useQASRS` without modification
- `src/hooks/useSRS.ts` — reference implementation for localStorage load/save pattern; `useQASRS` should mirror its structure
- `src/types/index.ts` — append new types here; existing `Level`, `Lang` types reused directly

### Established Patterns
- localStorage key: `${lang}-progress` (shared record; `useSRS` already uses this)
- Card key format: `${deckId}_${cardIndex}` for Rephrase → `qa_${scenarioId}_${cardId}` for Q&A (prefixed to avoid collision)
- A1 cards appended to end of arrays (append-only, positional index preservation) — same principle applies to scenario cards
- Pure lib functions in `src/lib/` → React hook in `src/hooks/` → component in `src/app/` or `src/components/`

### Integration Points
- `src/types/index.ts` — add `QACard`, `ScenarioId`, `Scenario` types
- `src/data/qa/` (new directory) — scenario data files + index
- `src/hooks/useQASRS.ts` (new file) — hook implementation
- `src/__tests__/hooks/useQASRS.test.tsx` (new file) — Vitest tests for SRS math and level filtering

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-qa-data*
*Context gathered: 2026-03-09*
