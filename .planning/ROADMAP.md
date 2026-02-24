# Roadmap: PuroLingua

## Milestones

- ✅ **v1.0 Initial Release** - Phases 1–5 (shipped 2025)
- ✅ **v1.1 Difficulty Levels** - Phases 6–8 (complete 2026-02-23)

## Phases

<details>
<summary>✅ v1.0 Initial Release (Phases 1–5) - SHIPPED 2025</summary>

Shipped pre-GSD. Phases 1–5 estimated; no phase-level tracking exists.

Features shipped: Leitner SRS, Italian + Spanish vocabulary decks (8 topics each), audio playback (Web Speech API), voice recognition quiz, multiple-choice quiz, localStorage persistence, language picker UI, extensible i18n system, Vite build, Vitest + Playwright test suite, GitHub Pages staging deployment.

</details>

### ✅ v1.1 Difficulty Levels (Complete — 2026-02-23)

**Milestone Goal:** Learners can filter vocabulary by CEFR level (A1/A2) so beginners start with simpler content before advancing. Existing 160 cards tagged A2; ~320 new A1 cards added; level filter chips on the deck screen persist across sessions.

## Phase Details

### Phase 6: Content and Data
**Goal**: All cards carry a `level` property and A1 phrase content exists for every deck in both languages
**Depends on**: Nothing (first phase of v1.1)
**Requirements**: CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Every existing Italian and Spanish card object has `level: "A2"` — no card is missing the property
  2. All 8 Italian topic decks contain A1 phrase cards (minimum 4 per deck) appended after the existing cards
  3. All 8 Spanish topic decks contain A1 phrase cards (minimum 4 per deck) appended after the existing cards
  4. A Vitest data-integrity test passes confirming every card in every deck has a valid `level` field of "A1" or "A2"
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Tag + append A1 cards: Italian decks (CONT-01, CONT-02)
- [ ] 06-02-PLAN.md — Tag + append A1 cards: Spanish decks (CONT-01, CONT-03)
- [ ] 06-03-PLAN.md — Data-integrity Vitest test (CONT-01, CONT-02, CONT-03)

### Phase 7: Filter Logic
**Goal**: Level filter state is wired through SRS due-count, session start, and quiz distractor logic — the filter works correctly even without a UI
**Depends on**: Phase 6
**Requirements**: FLTR-02, FLTR-03, FLTR-04, FLTR-05, FLTR-06, FLTR-07, FLTR-08
**Success Criteria** (what must be TRUE):
  1. The due-count badge on each deck matches the number of cards the study session will actually show (no count mismatch)
  2. A new user (no prior localStorage progress) defaults to A1 only; a returning user (prior progress detected) defaults to A1+A2
  3. The level filter selection survives a browser close and reopen — it is read back from localStorage on next load
  4. Attempting to deselect the last active chip is silently ignored — the user cannot reach a state with zero active levels
  5. Quiz answer choices (distractors) are drawn only from cards matching the active level filter — no cross-level foil contamination
**Plans**: 4 plans

Plans:
- [x] 07-01-PLAN.md — Add activeLevels to state.js and level-filter persistence helpers to progress.js
- [x] 07-02-PLAN.md — TDD: filter state + persistence tests (FLTR-02, FLTR-03, FLTR-04, FLTR-05, FLTR-06)
- [x] 07-03-PLAN.md — Wire app.js initActiveLevels, getDueCount, startDeck, generateChoices (FLTR-03–08)
- [x] 07-04-PLAN.md — TDD: count parity + foil contamination tests (FLTR-07, FLTR-08)

### Phase 8: Filter UI
**Goal**: Users can see and toggle level filter chips above the deck grid, with labels rendered from the i18n system
**Depends on**: Phase 7
**Requirements**: FLTR-01, FLTR-09
**Success Criteria** (what must be TRUE):
  1. Level filter chips (A1 and A2) are visible above the deck grid on the deck selection screen
  2. Clicking a chip toggles its active state and immediately updates which decks (and their due-count badges) are visible
  3. Chip labels change language when the user switches the app language — they are i18n strings, not hardcoded
**Plans**: 2 plans

Plans:
- [x] 08-01-PLAN.md — TDD: failing filter-ui.test.js (RED phase — FLTR-01, FLTR-09)
- [x] 08-02-PLAN.md — Implement chip UI: HTML, CSS, i18n keys, app.js wiring (GREEN phase — FLTR-01, FLTR-09)

## Progress

**Execution Order:** 6 → 7 → 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 6. Content and Data | 3/3 | Complete    | 2026-02-23 | - |
| 7. Filter Logic | 4/4 | Complete | 2026-02-23 | - |
| 8. Filter UI | v1.1 | 2/2 | Complete | 2026-02-23 |
