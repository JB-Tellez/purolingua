---
phase: 25-study-sessions
plan: "01"
subsystem: tests
tags: [tdd, wave-0, study-sessions, contract-tests]
dependency_graph:
  requires: []
  provides:
    - tests/nuxt/RephraseSession.test.ts
    - tests/nuxt/QASession.test.ts
  affects:
    - app/pages/rephrase/[deck].vue
    - app/pages/qa/[scenario].vue
tech_stack:
  added: []
  patterns:
    - Per-test dynamic import inside each it() block (established in DeckGrid.test.ts)
    - beforeEach localStorage.clear() to ensure 0 due cards state
    - it.skip guards for SRS-seeded tests requiring Plan 02/03 key format knowledge
key_files:
  created:
    - tests/nuxt/RephraseSession.test.ts
    - tests/nuxt/QASession.test.ts
  modified: []
decisions:
  - "it.skip used for SRS-seeded tests (Tests 2 and 3) — pre-seeding SRS state requires the key format established in Plans 02/03; full interaction tests written during implementation"
  - "data-* selector contracts established as authoritative — Plans 02 and 03 must implement these exact attribute names"
metrics:
  duration: "74s"
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_modified: 2
requirements:
  - UI-06
  - UI-07
---

# Phase 25 Plan 01: Wave 0 Test Stubs for Study Session Pages Summary

**One-liner:** Failing Wave 0 contract stubs for RephraseSession and QASession pages using data-* selector contracts against placeholder pages.

## What Was Built

Two test files establish the selector contracts that Plans 02 and 03 must satisfy. Both suites run RED (4 failing, 4 skipped across both files) against the existing placeholder pages. No syntax or TypeScript errors.

### Tests Created

**RephraseSession.test.ts** (UI-06):
- Test 1 FAIL: `[data-session-done]` not found in placeholder (placeholder shows `<p>Rephrase — session placeholder...</p>`)
- Test 2 SKIP: `[data-session-card]`, `[data-card-counter]` — SRS seeding requires Plan 02 key format
- Test 3 SKIP: `[data-progress-bar]` — same reason
- Test 4 FAIL: placeholder HTML contains "session placeholder" text (regression guard)

**QASession.test.ts** (UI-07):
- Test 1 FAIL: `[data-session-done]` not found in placeholder
- Test 2 SKIP: `[data-session-card]`, `[data-choice]` (4) — SRS seeding requires Plan 03 key format
- Test 3 SKIP: `[data-card-counter]` — same reason
- Test 4 FAIL: placeholder HTML contains "session placeholder" text (regression guard)

### Selector Contracts Established

| Selector | Component | Plan to Satisfy |
|----------|-----------|----------------|
| `[data-session-done]` | All-done end screen | Plans 02 and 03 |
| `[data-deck-done]` | Deck-complete end screen (Rephrase only) | Plan 02 |
| `[data-session-card]` | Active card display | Plans 02 and 03 |
| `[data-card-counter]` | Card progress counter | Plans 02 and 03 |
| `[data-progress-bar]` | Visual progress bar (Rephrase only) | Plan 02 |
| `[data-choice]` | Answer choice button (QA, 4 per card) | Plan 03 |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `tests/nuxt/RephraseSession.test.ts` exists with failing assertions
- [x] `tests/nuxt/QASession.test.ts` exists with failing assertions
- [x] No syntax or TypeScript errors in either file
- [x] Both suites run via `bun run vitest --project nuxt run`
- [x] Commits: e244816 (RephraseSession), 6f28e9b (QASession)

## Self-Check: PASSED
