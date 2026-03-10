---
phase: 18-activity-picker-and-scenario-browser
verified: 2026-03-09T21:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 18: Activity Picker and Scenario Browser — Verification Report

**Phase Goal:** Deliver a working activity picker on the home page and a Q&A scenario browser, so users can navigate from the home page to either the Rephrase deck browser or the Q&A scenario selector.
**Verified:** 2026-03-09T21:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                              | Status     | Evidence                                                                                                  |
|----|------------------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------|
| 1  | Navigating to /it or /es shows the Activity Picker (not the deck browser)          | VERIFIED   | `src/app/[lang]/page.tsx` imports and renders `ActivityPicker`; no DeckGrid import present                |
| 2  | The Rephrase deck browser is reachable at /[lang]/rephrase with all 8 decks        | VERIFIED   | `src/app/[lang]/rephrase/page.tsx` exists; DeckGrid renders `deckMetadata.filter(d => d.lang === lang)`   |
| 3  | Each deck tile in the Rephrase browser links to /[lang]/rephrase/[deck]            | VERIFIED   | Line 44 of rephrase/page.tsx: `` href={`/${lang}/rephrase/${deck.id}`} ``                                 |
| 4  | SiteHeader back button drops the last path segment at any route depth              | VERIFIED   | SiteHeader.tsx line 29: `'/' + segments.slice(0, -1).join('/')`                                          |
| 5  | Activity picker i18n keys exist in both messages/it.json and messages/es.json      | VERIFIED   | Both files have `activities.rephrase` and `activities.qa` with title + description subkeys                |
| 6  | Test scaffolds for ActivityPicker and ScenarioGrid exist and pass                  | VERIFIED   | 5/5 ActivityPicker tests pass; 5/5 ScenarioGrid tests pass; 86/86 full suite green                       |
| 7  | Navigating to /[lang]/qa shows the scenario browser with 7 scenario tiles          | VERIFIED   | `src/app/[lang]/qa/page.tsx` renders ScenarioGrid; ScenarioGrid maps all 7 scenarios from `scenarios[]`  |
| 8  | Each tile shows icon, target-language title, and live due-count badge              | VERIFIED   | ScenarioTile renders `scenario.icon`, `scenario.titleIt/Es`, and badge via `useQASRS().dueCards.length`   |
| 9  | Badge shows number when due > 0; checkmark when due = 0                            | VERIFIED   | ScenarioTile: `{due === 0 ? '✓' : due}` with conditional class; tests 3 and 4 cover both states         |
| 10 | LevelFilterChips appear at the top of the scenario browser                         | VERIFIED   | qa/page.tsx renders `<LevelFilterChips>` before `<ScenarioGrid>` with `activeLevels` + `setActiveLevels` |
| 11 | Changing level chips updates due counts on all scenario tiles without page reload   | VERIFIED   | activeLevels from useLevelFilter passed to ScenarioGrid prop; each ScenarioTile re-calls useQASRS         |
| 12 | ScenarioGrid component tests pass green                                             | VERIFIED   | 5/5 ScenarioGrid tests pass; all assertions are real (no todos remaining)                                 |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact                                              | Provides                                               | Status     | Details                                                           |
|-------------------------------------------------------|--------------------------------------------------------|------------|-------------------------------------------------------------------|
| `src/app/[lang]/rephrase/layout.tsx`                  | generateStaticParams for deck IDs under rephrase route | VERIFIED   | Contains `generateStaticParams` using `DECK_IDS`                  |
| `src/app/[lang]/rephrase/page.tsx`                    | Rephrase deck browser (moved from /[lang]/page.tsx)    | VERIFIED   | Deck links use `/${lang}/rephrase/${deck.id}` pattern             |
| `src/app/[lang]/rephrase/[deck]/page.tsx`             | Deck study page (moved from /[lang]/[deck]/page.tsx)   | VERIFIED   | Full server component with generateStaticParams inline            |
| `src/components/SiteHeader.tsx`                       | Updated back nav — drop last path segment              | VERIFIED   | `segments.slice(0, -1).join('/')` at line 29                      |
| `messages/it.json`                                    | activities.rephrase and activities.qa i18n keys        | VERIFIED   | Both keys present with title and description subkeys              |
| `messages/es.json`                                    | activities.rephrase and activities.qa i18n keys        | VERIFIED   | Both keys present with title and description subkeys              |
| `src/__tests__/components/ActivityPicker.test.tsx`    | Tests for ACTPICK-01 — 5 real assertions               | VERIFIED   | 5/5 tests pass; todos replaced with real assertions               |
| `src/__tests__/components/ScenarioGrid.test.tsx`      | Tests for QAFLOW-01 — 5 real assertions                | VERIFIED   | 5/5 tests pass; todos replaced with real assertions               |
| `src/components/ActivityPicker.tsx`                   | Two-card activity selector component                   | VERIFIED   | Exports `ActivityPicker`; uses `useTranslations('activities')`    |
| `src/app/[lang]/page.tsx`                             | Activity Picker page                                   | VERIFIED   | Imports and renders `ActivityPicker`; no DeckGrid present         |
| `src/app/[lang]/qa/layout.tsx`                        | generateStaticParams for scenario IDs (14 paths)       | VERIFIED   | Maps 2 locales × 7 scenarios from `scenarios[]`                   |
| `src/app/[lang]/qa/page.tsx`                          | Scenario browser with LevelFilterChips + ScenarioGrid  | VERIFIED   | Wires useSRS + useLevelFilter + both components                   |
| `src/app/[lang]/qa/[scenario]/page.tsx`               | Phase 19 placeholder — route exists, no session UI     | VERIFIED   | Intentional stub; renders "Coming soon." to prevent 404           |
| `src/components/ScenarioGrid.tsx`                     | ScenarioTile grid component calling useQASRS per tile  | VERIFIED   | Exports `ScenarioGrid`; ScenarioTile calls useQASRS               |

---

### Key Link Verification

| From                               | To                                   | Via                                      | Status   | Details                                                               |
|------------------------------------|--------------------------------------|------------------------------------------|----------|-----------------------------------------------------------------------|
| `src/app/[lang]/rephrase/page.tsx` | `/[lang]/rephrase/[deck]` routes     | Link href `/${lang}/rephrase/${deck.id}` | WIRED    | Line 44 confirmed; pattern `/rephrase/` present                       |
| `src/app/[lang]/rephrase/layout.tsx` | `src/data/decks`                   | `generateStaticParams` imports DECK_IDS  | WIRED    | `import { DECK_IDS } from '@/data/decks'` at line 2                  |
| `src/components/SiteHeader.tsx`    | pathname                             | `segments.slice(0, -1).join('/')`        | WIRED    | Line 29; onDeckPage condition (`segments.length >= 2`) unchanged      |
| `src/app/[lang]/page.tsx`          | `src/components/ActivityPicker.tsx`  | import + render with lang prop           | WIRED    | `import ActivityPicker` and `<ActivityPicker lang={lang} />`          |
| `src/components/ActivityPicker.tsx` | `messages/it.json` activities keys  | `useTranslations('activities')`          | WIRED    | `useTranslations('activities')` at line 16; keys exist in both JSONs  |
| `src/components/ActivityPicker.tsx` | `/[lang]/rephrase` and `/[lang]/qa` | Link href                                | WIRED    | ACTIVITIES const with `rephrase` and `qa` path values; hrefs verified |
| `src/app/[lang]/qa/page.tsx`       | `src/components/ScenarioGrid.tsx`    | import ScenarioGrid; pass lang + activeLevels | WIRED | `<ScenarioGrid lang={lang} activeLevels={activeLevels} />`           |
| `src/components/ScenarioGrid.tsx`  | `src/hooks/useQASRS.ts`              | `useQASRS(lang, scenario.id, scenario.cards, activeLevels)` | WIRED | Each ScenarioTile calls useQASRS; dueCards.length drives badge |
| `src/app/[lang]/qa/page.tsx`       | `src/hooks/useLevelFilter.ts`        | `useLevelFilter(lang, hasProgress)`      | WIRED    | activeLevels from useLevelFilter passed to both LevelFilterChips and ScenarioGrid |

---

### Requirements Coverage

| Requirement | Source Plan  | Description                                                         | Status    | Evidence                                                              |
|-------------|-------------|----------------------------------------------------------------------|-----------|-----------------------------------------------------------------------|
| ACTPICK-01  | 18-01, 18-02 | User can choose between Rephrase and Q&A activities after selecting a language | SATISFIED | ActivityPicker component at /[lang] with two link cards |
| QAFLOW-01   | 18-01, 18-03 | User can browse Q&A scenarios in a grid with icon, title, and live due-count badge | SATISFIED | ScenarioGrid renders 7 tiles with useQASRS-backed badges |
| QAFLOW-02   | 18-01, 18-03 | User can filter Q&A scenarios by level (A1/A2 chips, same FLTR-06 guard) | SATISFIED | LevelFilterChips on qa/page.tsx; activeLevels passed to ScenarioGrid |

No orphaned requirements found: ACTPICK-01, QAFLOW-01, and QAFLOW-02 are all mapped to Phase 18 in REQUIREMENTS.md traceability table and all plans account for them.

---

### Anti-Patterns Found

| File                                         | Line | Pattern          | Severity | Impact                                                      |
|----------------------------------------------|------|------------------|----------|-------------------------------------------------------------|
| `src/app/[lang]/qa/[scenario]/page.tsx`      | 1    | "Coming soon."   | INFO     | Intentional Phase 19 placeholder — documented in plan; not blocking |

No unintentional stubs, empty handlers, or blocking anti-patterns found.

---

### Human Verification Required

#### 1. Activity Picker Visual Layout

**Test:** Open `/it` in a browser. Confirm two cards are displayed side-by-side on desktop and stacked vertically on mobile (< 600px viewport).
**Expected:** Two-column grid with Rephrase (🃏) and Dialogo (💬) cards visible; responsive collapse on narrow screens.
**Why human:** CSS `.activity-grid` layout and responsiveness cannot be verified programmatically.

#### 2. SiteHeader Back Navigation Depth at Runtime

**Test:** Navigate /it -> click Rephrase card -> click a deck (e.g., Daily) -> verify "Back" returns to /it/rephrase, not /it. Then, from /it/rephrase, verify "Back" returns to /it.
**Expected:** Multi-level back navigation works at each depth; back button visible at depth >= 2.
**Why human:** `usePathname` behavior in a real browser cannot be asserted with Vitest.

#### 3. Scenario Browser Live Badge Update

**Test:** Open `/it/qa`. Toggle the level filter chip (e.g., deselect A2). Confirm that due-count badges on scenario tiles update without a page reload.
**Expected:** Badge numbers change reactively when level chip state changes; FLTR-06 guard prevents deselecting all chips.
**Why human:** Real-time React state interaction cannot be verified without a running browser.

#### 4. QA Placeholder Route (No 404)

**Test:** Click any scenario tile on `/it/qa`. Confirm the page renders "Coming soon." without a 404.
**Expected:** Route resolves correctly; user sees placeholder text.
**Why human:** Static export and Next.js routing need a running build to confirm no 404.

---

### Gaps Summary

No gaps. All phase must-haves are verified. All three requirements (ACTPICK-01, QAFLOW-01, QAFLOW-02) are satisfied by real, tested implementations. The full Vitest suite runs green at 86/86 tests. All commits exist and reference the correct files.

The qa/[scenario]/page.tsx "Coming soon." content is the intentional Phase 19 placeholder established in the plan — it is not a gap for this phase.

---

## Commit Verification

All commits documented in summaries confirmed present in git history:

| Commit   | Task                                      | Files                                          |
|----------|-------------------------------------------|------------------------------------------------|
| 9d276ba  | Wave 0 test scaffolds                     | ActivityPicker.test.tsx, ScenarioGrid.test.tsx |
| c58efac  | Restructure routes to /[lang]/rephrase    | rephrase/ tree, StudySession, test import fix  |
| 9a03aca  | SiteHeader back nav + i18n keys           | SiteHeader.tsx, it.json, es.json               |
| e89f504  | ActivityPicker component + lang page      | ActivityPicker.tsx, DeckGrid.tsx, page.tsx     |
| eb98bcd  | ScenarioGrid component + real tests       | ScenarioGrid.tsx, ScenarioGrid.test.tsx        |
| 185eeaa  | QA browser page + layout + placeholder    | qa/layout.tsx, qa/page.tsx, qa/[scenario]/     |

---

_Verified: 2026-03-09T21:00:00Z_
_Verifier: Claude (gsd-verifier)_
