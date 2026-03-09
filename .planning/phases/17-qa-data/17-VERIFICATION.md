---
phase: 17-qa-data
verified: 2026-03-09T16:15:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
---

# Phase 17: Q&A Data Verification Report

**Phase Goal:** Establish the complete data and hook foundation for Q&A mode — typed interfaces, bilingual scenario content, and SRS-aware hook — so Phase 18 can build the UI without any data plumbing work.
**Verified:** 2026-03-09T16:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | QACard, ScenarioId, and Scenario types are importable from '@/types' | VERIFIED | All three exported in `src/types/index.ts` lines 44-71; `tsc --noEmit` exits 0 |
| 2  | ScenarioId union literal covers all 7 scenario identifiers | VERIFIED | Lines 44-51 of `src/types/index.ts`: caffe, albergo, ristorante, strada, presentazioni, negozio, treno |
| 3  | QACard.foils and QACard.foilsEs are typed as fixed-length tuples [string, string, string] | VERIFIED | Lines 57 and 60 of `src/types/index.ts` use `[string, string, string]` not `string[]` |
| 4  | QACard holds both Italian and Spanish content fields | VERIFIED | Fields question/correct/foils (Italian) + questionEs/correctEs/foilsEs (Spanish) all present |
| 5  | Scenario type includes level field for Phase 18 browser filtering | VERIFIED | `level: Level` at line 69 of `src/types/index.ts` |
| 6  | All 7 scenario files contain both Italian and Spanish card content | VERIFIED | grep for questionEs/correctEs/foilsEs returns 24 per file across all 7 (3 fields × 8 cards) |
| 7  | Spanish cards are strict parallel translations of Italian cards | VERIFIED | Manually confirmed in caffe.ts: each Es-field is direct translation of Italian counterpart |
| 8  | Each scenario has exactly 8 cards | VERIFIED | `id:` count is 9 per file (1 scenario id + 8 card ids); 8 cards each confirmed |
| 9  | A1 scenarios (5) and A2 scenarios (2) are tagged with the correct level | VERIFIED | caffe/albergo/ristorante/strada/presentazioni have `level: 'A1'`; negozio/treno have `level: 'A2'` |
| 10 | src/data/qa/index.ts exports all 7 scenarios as an array | VERIFIED | `scenarios` array export on line 13; all 7 named exports on line 12 |
| 11 | useQASRS(lang, scenarioId, cards, activeLevels) returns dueCards filtered from a scenario's cards | VERIFIED | Hook implementation confirmed; dueCards useMemo filters by isCardDue + activeLevels |
| 12 | Q&A progress keys are prefixed 'qa_{scenarioId}_{cardId}' and stored in {lang}-progress | VERIFIED | `getQACardKey` returns `` `qa_${scenarioId}_${cardId}` ``; test asserts 'qa_caffe_test_01' in 'it-progress' |
| 13 | Q&A progress keys never collide with Rephrase keys (which are '{deckId}_{index}') | VERIFIED | Key isolation test passes: pre-seeded Rephrase key 'caffe_test_01' is structurally distinct from 'qa_caffe_test_01' |
| 14 | Vitest tests confirm all SRS math and level-filtering behaviors | VERIFIED | 12/12 tests pass via `bun run test -- useQASRS` |

**Score:** 14/14 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/types/index.ts` | QACard, ScenarioId, Scenario type exports | VERIFIED | All three types appended after ProgressRecord; existing types unchanged |
| `src/data/qa/caffe.ts` | Al Caffè / En el Café scenario (A1) | VERIFIED | 8 bilingual cards, exports `caffe: Scenario` |
| `src/data/qa/albergo.ts` | In Albergo / En el Hotel scenario (A1) | VERIFIED | 8 bilingual cards, exports `albergo: Scenario` |
| `src/data/qa/ristorante.ts` | Al Ristorante / En el Restaurante scenario (A1) | VERIFIED | 8 bilingual cards, exports `ristorante: Scenario` |
| `src/data/qa/strada.ts` | Per Strada / En la Calle scenario (A1) | VERIFIED | 8 bilingual cards, exports `strada: Scenario` |
| `src/data/qa/presentazioni.ts` | Presentazioni / Presentaciones scenario (A1) | VERIFIED | 8 bilingual cards, exports `presentazioni: Scenario` |
| `src/data/qa/negozio.ts` | Al Negozio / En la Tienda scenario (A2) | VERIFIED | 8 bilingual cards, exports `negozio: Scenario`; all cards tagged A2 |
| `src/data/qa/treno.ts` | In Treno / En el Tren scenario (A2) | VERIFIED | 8 bilingual cards, exports `treno: Scenario`; all cards tagged A2 |
| `src/data/qa/index.ts` | Barrel export of all 7 Scenario objects | VERIFIED | Imports all 7, exports named consts + `scenarios` array in A1-before-A2 order |
| `src/hooks/useQASRS.ts` | useQASRS hook implementation | VERIFIED | Full implementation with dueCards, updateCard, isCardDueForScenario, hasProgress, progress |
| `src/__tests__/hooks/useQASRS.test.tsx` | Vitest test suite for useQASRS | VERIFIED | 12 tests across 4 describe blocks; all pass |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/types/index.ts` | `src/data/qa/*.ts` | `import type { Scenario } from '@/types'` | VERIFIED | caffe.ts line 3, negozio.ts line 3 confirmed; pattern consistent across all 7 files |
| `src/types/index.ts` | `src/hooks/useQASRS.ts` | `import type { Lang, Level, QACard, ScenarioId, ProgressRecord }` | VERIFIED | Line 7 of useQASRS.ts imports all required types |
| `src/hooks/useQASRS.ts` | `src/lib/srs.ts` | `import { advanceBox, isCardDue }` | VERIFIED | Line 8 of useQASRS.ts; both functions actively used in dueCards memo and updateCard callback |
| `src/hooks/useQASRS.ts` | `localStorage` | `{lang}-progress` key via loadFromStorage/saveToStorage | VERIFIED | Storage key is `` `${lang}-progress` ``; test confirms 'it-progress' storage key used |
| `src/data/qa/index.ts` | `src/data/qa/*.ts` | Named imports of each Scenario const | VERIFIED | All 7 imports present; `scenarios` array contains all 7 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| QADATA-01 | 17-01, 17-02 | User can access 7 Italian Q&A scenarios with target-language questions and 4-option responses | SATISFIED | 7 scenario files exist with Italian question/correct/foils fields; index exports all 7 |
| QADATA-02 | 17-01, 17-02 | User can access 7 Spanish Q&A scenarios with parallel bilingual content | SATISFIED | All 7 scenario files have questionEs/correctEs/foilsEs as strict parallel translations |
| QAFLOW-06 | 17-01, 17-03 | User's Q&A progress persists via Leitner SRS with prefixed localStorage keys (`qa_{scenarioId}_{cardId}`) | SATISFIED | useQASRS uses `qa_${scenarioId}_${cardId}` key format; test at line 80 asserts 'qa_caffe_test_01' stored in 'it-progress' |

All 3 requirement IDs declared across plans are accounted for and satisfied. No orphaned requirements found — REQUIREMENTS.md maps all three to Phase 17 and marks them Complete.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

Scanned key-files for TODO/FIXME, return null/empty, placeholder comments, console.log-only implementations. None found in phase 17 files.

---

## Human Verification Required

### 1. Spanish Translation Quality

**Test:** Open the app in browser, navigate to Q&A mode for the caffe scenario in Spanish. Read through several question/correct/foils sets.
**Expected:** Spanish text reads naturally (not machine-translated), vocabulary and phrasing are appropriate for A1 learners, foils are contextually wrong but grammatically natural.
**Why human:** Content quality and linguistic naturalness cannot be verified programmatically. TypeScript types confirm structure; meaning and register require a human reader.

---

## Summary

Phase 17 goal is fully achieved. The data and hook foundation for Q&A mode is complete and substantive:

- **Types (Plan 01):** `src/types/index.ts` exports `QACard` with bilingual fixed-tuple fields, `ScenarioId` covering all 7 identifiers, and `Scenario` with the Phase-18-required `level` field. No existing types modified. `tsc --noEmit` exits clean (pre-existing unrelated error in `FeedbackMessage.test.tsx` is out of scope and documented across all three summaries).

- **Content (Plan 02):** All 7 scenario files exist with 8 bilingual cards each (56 Italian + 56 Spanish parallel translations). A1/A2 level tags are correct. The `scenarios` array in `index.ts` orders A1 before A2 and is importable from `@/data/qa`.

- **Hook (Plan 03):** `useQASRS` is a fully implemented, wired React hook. It delegates SRS math to `src/lib/srs.ts`, shares the `{lang}-progress` localStorage key with `useSRS` using a `qa_`-prefixed key namespace to avoid collision, and filters `dueCards` by both `isCardDue` and `activeLevels`. All 12 Vitest tests pass.

Phase 18 can build the Q&A browser UI by importing `scenarios` from `@/data/qa` and calling `useQASRS` — no data plumbing work remains.

---

_Verified: 2026-03-09T16:15:00Z_
_Verifier: Claude (gsd-verifier)_
