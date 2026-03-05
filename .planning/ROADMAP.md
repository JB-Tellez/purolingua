# Roadmap: PuroLingua

## Milestones

- ✅ **v1.0 Initial Release** — Phases 1–5 (shipped 2025)
- ✅ **v1.1 Difficulty Levels** — Phases 6–8 (shipped 2026-02-23)
- 🚧 **v1.2 Next.js Port** — Phases 9–13 (in progress)

## Phases

<details>
<summary>✅ v1.0 Initial Release (Phases 1–5) — SHIPPED 2025</summary>

Shipped pre-GSD. Phases 1–5 estimated; no phase-level tracking exists.

Features shipped: Leitner SRS, Italian + Spanish vocabulary decks (8 topics each), audio playback (Web Speech API), voice recognition quiz, multiple-choice quiz, localStorage persistence, language picker UI, extensible i18n system, Vite build, Vitest + Playwright test suite, GitHub Pages staging deployment.

</details>

<details>
<summary>✅ v1.1 Difficulty Levels (Phases 6–8) — SHIPPED 2026-02-23</summary>

- [x] Phase 6: Content and Data (3/3 plans) — completed 2026-02-23
- [x] Phase 7: Filter Logic (4/4 plans) — completed 2026-02-23
- [x] Phase 8: Filter UI (2/2 plans) — completed 2026-02-23

Full archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

### 🚧 v1.2 Next.js Port (In Progress)

**Milestone Goal:** Port all v1.1 functionality to Next.js 15 + TypeScript + Tailwind + next-intl on a feature branch, with proper URL routing and full feature parity. Delivers a deployable static export as a portfolio piece.

**Branch:** `feat/nextjs-port`

#### Phase 9: Scaffold

- [x] **Phase 9: Scaffold** — Initialize Next.js 15 project with TypeScript, Tailwind, next-intl, and core types (completed 2026-03-05)

#### Phase 10: Data Migration

- [x] **Phase 10: Data Migration** — Port all card arrays and deck metadata to typed TypeScript modules (completed 2026-03-05)

#### Phase 11: Logic and Tests

- [ ] **Phase 11: Logic and Tests** — Port SRS lib, hooks, and Vitest test suite

#### Phase 12: Routing

- [ ] **Phase 12: Routing** — Implement all URL routes and static param generation

#### Phase 13: UI, i18n, and Styling

- [ ] **Phase 13: UI, i18n, and Styling** — Build all components, wire next-intl, apply Tailwind

## Phase Details

### Phase 9: Scaffold
**Goal**: A working Next.js 16 project on `feat/nextjs-port` with TypeScript, Tailwind, and next-intl configured — plus core domain types that all subsequent phases depend on
**Depends on**: Nothing (first phase of milestone)
**Requirements**: INFRA-01, INFRA-02, DATA-01
**Success Criteria** (what must be TRUE):
  1. `bun run build` completes without errors and produces a static export directory
  2. TypeScript types Card, Deck, Progress, Lang, DeckId, and Level are importable and enforce shape at compile time
  3. next-intl middleware is wired — requests to `/` resolve without 404
  4. Tailwind utility classes compile into the build output
**Plans**: 2 plans

Plans:
- [ ] 09-01-PLAN.md — Scaffold Next.js project, configure static export, define domain types
- [ ] 09-02-PLAN.md — Wire next-intl i18n routing, create [lang] layout, verify full build

### Phase 10: Data Migration
**Goal**: All 320 A2 + ~320 A1 card records from both languages exist as typed TypeScript modules, with deck metadata describing each deck's id and i18n key
**Depends on**: Phase 9
**Requirements**: DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. All 8 Italian topic decks are importable as typed arrays with Card shape (front, back, level)
  2. All 8 Spanish topic decks are importable as typed arrays with Card shape (front, back, level)
  3. Deck metadata module exports an array of all 16 deck descriptors with id and i18n key fields
  4. TypeScript compiler accepts all data files with no type errors
**Plans**: 3 plans

Plans:
- [ ] 10-01-PLAN.md — Port all 8 Italian card decks to typed TypeScript modules in src/data/it/
- [ ] 10-02-PLAN.md — Port all 8 Spanish card decks to typed TypeScript modules in src/data/es/
- [ ] 10-03-PLAN.md — Create barrel index files and deck metadata module (src/data/decks.ts)

### Phase 11: Logic and Tests
**Goal**: SRS Leitner math and distractor generation exist as pure TypeScript functions, useSRS and useLevelFilter hooks manage state and localStorage, and Vitest tests confirm correctness
**Depends on**: Phase 9
**Requirements**: SRS-01, SRS-02, SRS-03, SRS-04, TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `lib/srs.ts` exports pure functions for box advancement and due-date calculation that pass Vitest unit tests
  2. `lib/generateChoices.ts` exports a distractor generator that passes Vitest unit tests
  3. `useSRS(lang)` hook reads and writes localStorage using the same key format as v1.1
  4. `useLevelFilter()` hook enforces the FLTR-06 guard — at least one level always remains selected
  5. `bun run test` passes all SRS and hook test cases with zero failures
**Plans**: 3 plans

Plans:
- [ ] 11-01-PLAN.md — Install Vitest + RTL, create vitest.config.ts, write test stubs, fix Progress type
- [ ] 11-02-PLAN.md — Implement lib/srs.ts and lib/generateChoices.ts with full unit tests
- [ ] 11-03-PLAN.md — Implement hooks/useSRS.ts and hooks/useLevelFilter.ts with renderHook tests

### Phase 12: Routing
**Goal**: Users can navigate to `/`, `/[lang]`, and `/[lang]/[deck]` — all routes resolve, render, and are included in the static export
**Depends on**: Phase 10, Phase 11
**Requirements**: ROUTE-01, ROUTE-02, ROUTE-03, ROUTE-04
**Success Criteria** (what must be TRUE):
  1. Visiting `/` renders a language picker page that links to `/it` and `/es`
  2. Visiting `/it` (or `/es`) renders a deck grid with due-count badges for each of the 8 topic decks
  3. Visiting `/it/restaurant` (or any valid lang/deck path) renders a study session with quiz flow
  4. `generateStaticParams` covers all 2 lang × 8 deck combinations — no dynamic server routes needed at build time
**Plans**: TBD

### Phase 13: UI, i18n, and Styling
**Goal**: All UI components are built with Tailwind, next-intl delivers Italian and Spanish UI strings, and the rendered app is visually equivalent to v1.1
**Depends on**: Phase 12
**Requirements**: UI-01, UI-02, UI-03, UI-04, I18N-01, I18N-02, STYLE-01
**Success Criteria** (what must be TRUE):
  1. LevelFilterChips appear on the deck grid page and allow multi-select of A1 and/or A2 with FLTR-06 guard enforced
  2. FlashCard shows the front phrase and reveals the back on interaction
  3. ChoiceButton renders multiple-choice options and indicates correct/incorrect selection
  4. AudioButton triggers Web Speech API TTS playback for the current card's phrase
  5. Switching locale between Italian and Spanish updates all UI labels from next-intl message files — no hardcoded strings visible
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 6. Content and Data | v1.1 | 3/3 | Complete | 2026-02-23 |
| 7. Filter Logic | v1.1 | 4/4 | Complete | 2026-02-23 |
| 8. Filter UI | v1.1 | 2/2 | Complete | 2026-02-23 |
| 9. Scaffold | 2/2 | Complete   | 2026-03-05 | - |
| 10. Data Migration | 3/3 | Complete    | 2026-03-05 | - |
| 11. Logic and Tests | v1.2 | 0/3 | Not started | - |
| 12. Routing | v1.2 | 0/? | Not started | - |
| 13. UI, i18n, and Styling | v1.2 | 0/? | Not started | - |
