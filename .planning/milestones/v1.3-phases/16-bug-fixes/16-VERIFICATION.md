---
phase: 16-bug-fixes
verified: 2026-03-09T05:20:00Z
status: passed
score: 5/5 must-haves verified
re_verification:
  previous_status: passed
  previous_score: 5/5
  note: "Previous VERIFICATION.md was written before UAT found the badge-reactivity gap and before plan 16-03 was executed. This re-verification covers the completed 16-03 gap closure."
  gaps_closed:
    - "Badge count updates immediately when LevelFilterChips change (filter reactivity) — hooks lifted into LangPage, props threaded to DeckGrid and LevelFilterChips"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Toggle A1/A2 chips on the home page — verify badge counts change immediately without a page reload"
    expected: "Badge counts reflect active level filter on every chip toggle; no reload required"
    why_human: "End-to-end reactivity (LevelFilterChips setActiveLevels re-renders LangPage, props flow to DeckGrid) requires a browser to confirm; unit tests mock the hook so they cannot exercise the real hook-driven re-render path"
  - test: "Badge checkmark visual styling — complete a deck, return to home page"
    expected: "Finished deck tile shows a checkmark (checkmark character) with deck-card-badge--done CSS modifier applied for distinct visual styling"
    why_human: "CSS modifier effect on badge color and background cannot be verified by unit tests"
  - test: "A1-only mode — no premature all-done across real decks"
    expected: "Finishing one deck in A1-only mode shows deck-complete screen, not the all-done screen, when other decks still have A1-due cards; all-done only appears when all A1 cards across all decks in the current language are exhausted"
    why_human: "Requires real localStorage SRS state, real card data, and real React re-render timing — exercised by unit tests E and F but confirmed end-to-end only in a browser"
---

# Phase 16: Bug Fixes Verification Report

**Phase Goal:** The Rephrase mode works correctly — deck tiles show live due counts and the all-done screen never fires prematurely in A1-only mode
**Verified:** 2026-03-09T05:20:00Z
**Status:** passed
**Re-verification:** Yes — supersedes premature VERIFICATION.md written before UAT gap and 16-03 gap closure

## Verification Scope

This verification covers all three plans: 16-01 (live badge), 16-02 (allDecksEmpty fix), and 16-03 (badge-filter reactivity gap closure). The previous VERIFICATION.md was written before UAT Test 3 revealed that badge counts did not update when filter chips were toggled (root cause: independent useLevelFilter calls in LevelFilterChips and DeckGrid created isolated React state). Plan 16-03 fixed this by lifting the hooks into LangPage and threading activeLevels as props.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Deck grid tiles show a live SRS due-count badge, not the static cardCount integer | VERIFIED | `src/app/[lang]/page.tsx` DeckGrid receives `isCardDueForDeck` prop and `activeLevels` prop from LangPage; `getDueCount()` at line 28 computes live count using index-preserving `.map((card, i) => ({card, i})).filter(...).filter(...)` pattern; static `deck.cardCount` and `tc('deckCardCount', ...)` fully removed |
| 2 | Finishing one deck in A1-only mode does NOT show all-done when other decks still have due A1 cards | VERIFIED | `StudySession.tsx` lines 199-206: `deckMetadata.filter(d => d.lang === lang)` scopes to current language; `DECK_MAP[lang]?.[id]` supplies per-deck card array; index-preserving filter pattern preserves original SRS indices; BUGFIX-02 test E confirms cross-deck correctness |
| 3 | Badge count updates immediately when the user changes the level filter chips — no page reload | VERIFIED | `useSRS(lang)` and `useLevelFilter(lang, hasProgress)` called once in LangPage (lines 66-67); `activeLevels` and `setActiveLevels` passed as props to LevelFilterChips (line 75) and `activeLevels` + `isCardDueForDeck` passed as props to DeckGrid (line 76); chip toggle calls LangPage's `setActiveLevels`, triggering single re-render that flows updated `activeLevels` into `getDueCount`; LevelFilterChips has NO internal hook calls |
| 4 | allDecksEmpty is scoped to the current language only (not both Italian and Spanish) | VERIFIED | `deckMetadata.filter(d => d.lang === lang)` at StudySession line 199; BUGFIX-02 test F confirms Spanish deck IDs are not checked when lang='it' |
| 5 | Each deck's due-check uses that deck's own card indices, not the current session deck's indices | VERIFIED | `DECK_MAP[lang]?.[id]` (not the `cards` prop) supplies per-deck card array at line 201; `.map((card, i) => ({card, i})).filter(...).every(({i}) => !isCardDueForDeck(id, i))` preserves original indices; BUGFIX-02 test E exercises the index-sensitivity directly |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/deckMap.ts` | Shared `DECK_MAP: Record<Lang, Record<DeckId, Card[]>>` importable by DeckPage and StudySession | VERIFIED | File exists; exports `DECK_MAP` with 8 Italian + 8 Spanish decks at line 26; imports from `@/data/it` and `@/data/es`; typed correctly as `Record<Lang, Record<DeckId, Card[]>>` |
| `src/app/[lang]/page.tsx` | LangPage owns useSRS + useLevelFilter; DeckGrid accepts activeLevels + isCardDueForDeck as props | VERIFIED | LangPage calls `useSRS(lang)` at line 66 and `useLevelFilter(lang, hasProgress)` at line 67; DeckGrid function signature: `{ lang, activeLevels, isCardDueForDeck }` — no internal hook calls; hooks removed from DeckGrid body |
| `src/components/LevelFilterChips.tsx` | Accepts activeLevels + setActiveLevels as props; no internal hook calls | VERIFIED | Props interface at lines 5-9: `{ lang: Lang; activeLevels: Level[]; setActiveLevels: (levels: Level[] | null) => void }`; no `useSRS` or `useLevelFilter` imports or calls anywhere in the file |
| `src/app/[lang]/[deck]/StudySession.tsx` | Fixed allDecksEmpty using lang-scoped deckMetadata.filter and per-deck DECK_MAP lookup with index-preserving pattern | VERIFIED | Lines 199-206: `deckMetadata.filter(d => d.lang === lang)`, `DECK_MAP[lang]?.[id]`, `.map((card, i) => ({card, i})).filter(...).every(({i}) => !isCardDueForDeck(id, i))`; DECK_IDS no longer imported or used |
| `src/__tests__/components/DeckGrid.test.tsx` | 5 badge behavior tests: live count, new-user count, zero checkmark, filter reactivity (Tests A-E) | VERIFIED | File exists; `describe('DeckGrid badge')` block with 5 tests (A through E); all 5 pass in test run |
| `src/__tests__/components/StudySession.test.tsx` | BUGFIX-02 tests E and F covering cross-deck index correctness and language-scope isolation | VERIFIED | `describe('StudySession allDecksEmpty fix (BUGFIX-02)')` block present; test E checks cross-deck index sensitivity; test F checks language scope isolation; both pass |
| `src/app/[lang]/[deck]/page.tsx` | Imports DECK_MAP from `@/data/deckMap`; no local duplicate | VERIFIED | Line 10: `import { DECK_MAP } from '@/data/deckMap'`; `getCards` helper at line 12-14 uses imported DECK_MAP; no local DECK_MAP declaration present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/[lang]/page.tsx` LangPage | `useSRS(lang)` | direct hook call in LangPage | WIRED | `import { useSRS } from '@/hooks/useSRS'` at line 8; `useSRS(lang)` called at line 66 |
| `src/app/[lang]/page.tsx` LangPage | `useLevelFilter(lang, hasProgress)` | direct hook call in LangPage | WIRED | `import { useLevelFilter } from '@/hooks/useLevelFilter'` at line 9; called at line 67 with `hasProgress` from `useSRS` |
| `src/app/[lang]/page.tsx` LangPage | LevelFilterChips | activeLevels + setActiveLevels props | WIRED | Line 75: `<LevelFilterChips lang={lang} activeLevels={activeLevels} setActiveLevels={setActiveLevels} />`; LevelFilterChips Props interface accepts these |
| `src/app/[lang]/page.tsx` LangPage | DeckGrid (internal function) | activeLevels + isCardDueForDeck props | WIRED | Line 76: `<DeckGrid lang={lang} activeLevels={activeLevels} isCardDueForDeck={isCardDueForDeck} />`; DeckGridProps interface at lines 16-20 accepts these |
| `src/app/[lang]/page.tsx` DeckGrid | DECK_MAP | import and array lookup | WIRED | `import { DECK_MAP } from '@/data/deckMap'` at line 10; `DECK_MAP[lang]?.[deck.id]` at line 39 in `decks.map()` |
| `src/app/[lang]/[deck]/StudySession.tsx` handleAnswer | `deckMetadata.filter(d => d.lang === lang)` | lang-scoped deck list | WIRED | `import { deckMetadata } from '@/data/decks'` at line 14; `deckMetadata.filter(d => d.lang === lang)` at line 199 in `handleAnswer` else-branch |
| `src/app/[lang]/[deck]/StudySession.tsx` handleAnswer | `DECK_MAP[lang][id]` | import and per-deck array lookup | WIRED | `import { DECK_MAP } from '@/data/deckMap'` at line 15; `DECK_MAP[lang]?.[id]` at line 201 |
| `src/app/[lang]/[deck]/page.tsx` | `DECK_MAP` from `@/data/deckMap` | import (no local duplicate) | WIRED | `import { DECK_MAP } from '@/data/deckMap'` at line 10; `getCards` helper at line 12-14 uses it |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| BUGFIX-01 | 16-01-PLAN.md, 16-03-PLAN.md | User sees live due-count badges on Rephrase deck tiles (not static card count), updating immediately on filter chip toggle | SATISFIED | DeckGrid badge replaced with getDueCount() using props from LangPage-owned hooks; 5 passing DeckGrid tests (A-E); LevelFilterChips chip toggle updates shared LangPage state flowing to DeckGrid; marked `[x]` in REQUIREMENTS.md |
| BUGFIX-02 | 16-02-PLAN.md | User is not shown all-done screen prematurely in A1-only mode | SATISFIED | allDecksEmpty in StudySession fixed with lang-scoping and index-preserving per-deck lookup; BUGFIX-02 tests E and F pass; DECK_IDS removed from StudySession; marked `[x]` in REQUIREMENTS.md |

No orphaned requirements: BUGFIX-01 and BUGFIX-02 are the only Phase 16 entries in the REQUIREMENTS.md traceability table, both are claimed by their plans, and both show `[x]` (complete) in REQUIREMENTS.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

Scanned all modified files (`src/app/[lang]/page.tsx`, `src/components/LevelFilterChips.tsx`, `src/app/[lang]/[deck]/StudySession.tsx`, `src/data/deckMap.ts`, `src/__tests__/components/DeckGrid.test.tsx`, `src/__tests__/components/StudySession.test.tsx`, `src/app/[lang]/[deck]/page.tsx`) for TODO/FIXME, placeholder returns (`return null`, `return {}`), empty handlers, and console.log-only implementations. None detected.

### Human Verification Required

#### 1. Badge updates without page reload when filter chips toggled

**Test:** Run `bun run dev`, open http://localhost:3000/it. Toggle the A2 chip OFF so only A1 is active. Observe badge counts on deck cards. Toggle A2 back ON.
**Expected:** Badge counts decrease immediately when switching to A1-only, increase back when A2 is re-enabled. No page reload occurs — changes are instant React re-renders.
**Why human:** The props-threading fix (LangPage state to DeckGrid via props) is verified structurally by code inspection and unit tests, but the end-to-end reactive behavior across the real hook + real React render cycle can only be confirmed in a live browser.

#### 2. Badge checkmark visual styling

**Test:** Complete all due cards in one deck. Navigate back to the home page.
**Expected:** The finished deck tile displays the checkmark character (Unicode checkmark) with the `deck-card-badge--done` CSS modifier class applied, giving it visually distinct styling (color, background).
**Why human:** CSS modifier visual effect cannot be verified by unit tests.

#### 3. A1-only mode — no premature all-done across real decks

**Test:** In the browser, set level filter to A1 only. Study all A1 cards in one deck to completion. Observe what screen appears.
**Expected:** The deck-complete screen appears (not all-done) if other decks still have due A1 cards. The all-done screen only appears after all A1 cards across all decks in the current language are exhausted.
**Why human:** Requires real localStorage SRS state, real card data across all 8 decks, and real React re-render timing.

### Test Suite Results

```
Test Files  9 passed (9)
      Tests 64 passed (64)
   Duration  4.23s
```

64 tests pass: 5 DeckGrid badge tests (A-E) + 2 BUGFIX-02 StudySession tests (E, F) + 57 pre-existing tests. Zero regressions.

### Gaps Summary

No gaps found. All automated checks passed:

- `src/data/deckMap.ts` — exists, exports `DECK_MAP` with 8 Italian + 8 Spanish decks, shared module
- `src/app/[lang]/page.tsx` — LangPage owns `useSRS(lang)` and `useLevelFilter(lang, hasProgress)`; threads `activeLevels`, `setActiveLevels`, and `isCardDueForDeck` as props; DeckGrid has no internal hook calls; static `deck.cardCount` badge fully replaced with `getDueCount()` computing live count
- `src/components/LevelFilterChips.tsx` — accepts `activeLevels` and `setActiveLevels` as props; no `useSRS` or `useLevelFilter` calls internally; chip toggle updates shared LangPage state
- `src/app/[lang]/[deck]/StudySession.tsx` — `allDecksEmpty` uses `deckMetadata.filter(d => d.lang === lang)` and `DECK_MAP[lang]?.[id]` per deck with index-preserving filter pattern; `DECK_IDS` no longer imported or used
- `src/app/[lang]/[deck]/page.tsx` — imports `DECK_MAP` from `@/data/deckMap`; no local duplicate
- All 64 tests pass across 9 test files; zero regressions

---
_Verified: 2026-03-09T05:20:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: supersedes 2026-03-09T04:29:00Z VERIFICATION.md (written before 16-03 gap closure)_
