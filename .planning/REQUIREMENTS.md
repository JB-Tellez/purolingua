# Requirements: PuroLingua

**Defined:** 2026-03-04
**Core Value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.

## v1.2 Requirements

Port all v1.1 functionality to Next.js + TypeScript + Tailwind. Feature parity only. Delivers proper URL routing as new user-facing API surface.

### Infrastructure

- [x] **INFRA-01**: Feature branch `feat/nextjs-port` initialized with Next.js 15, TypeScript, Tailwind, and next-intl
- [x] **INFRA-02**: Static export configured (`output: 'export'`) and build verified

### Data & Types

- [x] **DATA-01**: Core TypeScript types defined (Card, Deck, Progress, Lang, DeckId, Level)
- [x] **DATA-02**: Italian card arrays (all 8 decks) ported to typed TypeScript modules
- [x] **DATA-03**: Spanish card arrays (all 8 decks) ported to typed TypeScript modules
- [x] **DATA-04**: Deck metadata module created (id, i18n key per deck)

### SRS Logic

- [ ] **SRS-01**: Leitner box math in `lib/srs.ts` as pure TypeScript functions
- [ ] **SRS-02**: Distractor generation in `lib/generateChoices.ts`
- [ ] **SRS-03**: `useSRS(lang)` hook with localStorage persistence, same key format as v1.1
- [ ] **SRS-04**: `useLevelFilter()` hook with localStorage persistence and FLTR-06 guard (cannot deselect all)

### Routing

- [ ] **ROUTE-01**: Home page (`/`) with language picker
- [ ] **ROUTE-02**: Deck grid page (`/[lang]`) with deck tiles and due-count badges
- [ ] **ROUTE-03**: Study session page (`/[lang]/[deck]`) with full quiz flow
- [ ] **ROUTE-04**: `generateStaticParams` covers all lang + deck combinations

### Components

- [ ] **UI-01**: LevelFilterChips on deck grid, hidden during active study session
- [ ] **UI-02**: FlashCard with front/back reveal
- [ ] **UI-03**: ChoiceButton for multiple-choice quiz
- [ ] **UI-04**: AudioButton using Web Speech API TTS

### i18n

- [ ] **I18N-01**: next-intl message files for Italian and Spanish UI strings
- [ ] **I18N-02**: All UI strings (deck names, button labels, chip labels) in message files

### Styling

- [ ] **STYLE-01**: Tailwind CSS applied throughout with visual parity to v1.1

### Tests

- [x] **TEST-01**: Vitest + React Testing Library configured
- [ ] **TEST-02**: `lib/srs.ts` unit tested
- [ ] **TEST-03**: `lib/generateChoices.ts` unit tested
- [ ] **TEST-04**: `useSRS` and `useLevelFilter` tested via `renderHook`

## Deferred (v2.0+)

- A1 phrase linguistic quality verified by native speaker (Italian and Spanish)
- Level filter chips hidden during active study session (FLTR-10) — post-port
- B1/B2 content tiers

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features | Strict feature parity — v1.2 is a tech migration only |
| SSR / API routes | Static export only for now |
| React Context / Zustand | State surface small enough for focused hooks |
| Playwright E2E tests | Already removed in quick task 1 |
| User accounts / backend | Core value is zero-friction, localStorage-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 9 | Complete |
| INFRA-02 | Phase 9 | Complete |
| DATA-01 | Phase 9 | Complete |
| DATA-02 | Phase 10 | Complete |
| DATA-03 | Phase 10 | Complete |
| DATA-04 | Phase 10 | Complete |
| SRS-01 | Phase 11 | Pending |
| SRS-02 | Phase 11 | Pending |
| SRS-03 | Phase 11 | Pending |
| SRS-04 | Phase 11 | Pending |
| ROUTE-01 | Phase 12 | Pending |
| ROUTE-02 | Phase 12 | Pending |
| ROUTE-03 | Phase 12 | Pending |
| ROUTE-04 | Phase 12 | Pending |
| UI-01 | Phase 13 | Pending |
| UI-02 | Phase 13 | Pending |
| UI-03 | Phase 13 | Pending |
| UI-04 | Phase 13 | Pending |
| I18N-01 | Phase 13 | Pending |
| I18N-02 | Phase 13 | Pending |
| STYLE-01 | Phase 13 | Pending |
| TEST-01 | Phase 11 | Complete |
| TEST-02 | Phase 11 | Pending |
| TEST-03 | Phase 11 | Pending |
| TEST-04 | Phase 11 | Pending |

**Coverage:**
- v1.2 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 — traceability confirmed against v1.2 roadmap (phases 9–13)*
