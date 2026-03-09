---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Q&A Mode
status: completed
stopped_at: Completed 17-01-PLAN.md
last_updated: "2026-03-09T23:03:19.005Z"
last_activity: 2026-03-09 — Phase 16 plan 03 complete (filter reactivity gap closure, UAT approved)
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 6
  completed_plans: 4
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.3 milestone start)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** v1.3 Q&A Mode — 4 phases (16–19), 13 requirements

## Current Position

Phase: 17 — Q&A Data (in progress)
Plan: 01 of 03 complete
Status: Phase 17 plan 01 complete (QACard, ScenarioId, Scenario types added to src/types/index.ts); Plans 02 and 03 ready

[███████░░░] 67% — 4/6 plans complete overall

Last activity: 2026-03-09 — Phase 17 plan 01 complete (QA Mode type contract established)

## Accumulated Context

### Open Items (Carried from v1.2)

- **ROUTE-02**: Live due-count badges — FIXED in 16-01. DeckGrid now calls useSRS + useLevelFilter; badge shows live due count or checkmark.
- **UX-05**: `allDecksEmpty` defect — FIXED in 16-02. Now uses lang-scoped deckMetadata and per-deck DECK_MAP with index-preserving filter.
- **Tech debt**: `speak()` helper duplicated in AudioButton.tsx and StudySession.tsx — could be `src/lib/speak.ts` (DEBT-01, future)
- **Tech debt**: `src/i18n/navigation.ts` locale-aware helpers are unused — all nav uses `next/link` directly (DEBT-02, future)
- **Content**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish) (CONTENT-01, future)

### Design Docs

- `docs/plans/2026-03-08-qa-scenarios-design.md` — Q&A mode design (Approved)
- `docs/plans/2026-03-08-qa-scenarios.md` — Q&A implementation plan

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Decisions (Phase 17)

- **17-01**: Bilingual fields inline on QACard (questionEs, correctEs, foilsEs) not nested object — simpler access pattern for rendering components
- **17-01**: Scenario.level field added in Phase 17 so content authors can tag level at creation time (not deferred to Phase 18)
- **17-01**: Fixed tuple [string, string, string] for QACard.foils and QACard.foilsEs enforces exactly 3 foils at compile time

### Decisions (Phase 16)

- **16-01**: Compute due count inline in DeckGrid render (no useState) — reactive hooks propagate badge changes automatically
- **16-01**: Removed deckCardCount i18n key from DeckGrid badge — now shows raw number or checkmark (✓)
- **16-01**: Added deck-card-badge--done CSS modifier class when due === 0 for styling hook
- **16-02**: Extracted DECK_MAP to `src/data/deckMap.ts` as shared module for DeckPage and StudySession
- **16-02**: Use `deckMetadata.filter(d => d.lang === lang)` instead of `DECK_IDS` for language-scoped allDecksEmpty check
- **16-02**: Index-preserving filter pattern established: `.map((card,i)=>({card,i})).filter(...).every(({i})=>...)`
- **16-03**: Lift useSRS + useLevelFilter into LangPage — single hook ownership eliminates isolated useState divergence between LevelFilterChips and DeckGrid
- **16-03**: LevelFilterChips and DeckGrid both receive activeLevels as props; chip toggle -> LangPage re-render -> badge recompute in single React cycle

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-09T23:03:19.000Z
Stopped at: Completed 17-01-PLAN.md
Resume file: None
