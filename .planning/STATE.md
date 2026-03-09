---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Q&A Mode
status: planning
stopped_at: Completed 16-bug-fixes/16-02-PLAN.md
last_updated: "2026-03-09T11:23:14.691Z"
last_activity: 2026-03-08 — Roadmap for v1.3 created (phases 16–19)
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.3 milestone start)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** v1.3 Q&A Mode — 4 phases (16–19), 13 requirements

## Current Position

Phase: 16 — Bug Fixes (in progress)
Plan: 02 of 02 complete
Status: Phase 16 plan 02 complete; ready for phase 17

[█████░░░░░] 50% — 0/4 phases complete (2/2 plans in phase 16 done — awaiting BUGFIX-01)

Last activity: 2026-03-09 — Phase 16 plan 02 complete (BUGFIX-02 allDecksEmpty fix)

## Accumulated Context

### Open Items (Carried from v1.2)

- **ROUTE-02**: Live due-count badges — `src/app/[lang]/page.tsx` needs `useSRS` wired; deck tiles show static count → Phase 16 (BUGFIX-01)
- **UX-05**: `allDecksEmpty` defect — FIXED in 16-02. Now uses lang-scoped deckMetadata and per-deck DECK_MAP with index-preserving filter.
- **Tech debt**: `speak()` helper duplicated in AudioButton.tsx and StudySession.tsx — could be `src/lib/speak.ts` (DEBT-01, future)
- **Tech debt**: `src/i18n/navigation.ts` locale-aware helpers are unused — all nav uses `next/link` directly (DEBT-02, future)
- **Content**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish) (CONTENT-01, future)

### Design Docs

- `docs/plans/2026-03-08-qa-scenarios-design.md` — Q&A mode design (Approved)
- `docs/plans/2026-03-08-qa-scenarios.md` — Q&A implementation plan

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Decisions (Phase 16)

- **16-02**: Extracted DECK_MAP to `src/data/deckMap.ts` as shared module for DeckPage and StudySession
- **16-02**: Use `deckMetadata.filter(d => d.lang === lang)` instead of `DECK_IDS` for language-scoped allDecksEmpty check
- **16-02**: Index-preserving filter pattern established: `.map((card,i)=>({card,i})).filter(...).every(({i})=>...)`

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-09T11:23:14.687Z
Stopped at: Completed 16-bug-fixes/16-02-PLAN.md
Resume file: None
