---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Q&A Mode
status: planning
stopped_at: Phase 16 context gathered
last_updated: "2026-03-09T07:14:56.149Z"
last_activity: 2026-03-08 — Roadmap for v1.3 created (phases 16–19)
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.3 milestone start)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** v1.3 Q&A Mode — 4 phases (16–19), 13 requirements

## Current Position

Phase: 16 — Bug Fixes (not started)
Plan: —
Status: Ready for phase 16 planning

[░░░░░░░░░░] 0% — 0/4 phases complete

Last activity: 2026-03-08 — Roadmap for v1.3 created (phases 16–19)

## Accumulated Context

### Open Items (Carried from v1.2)

- **ROUTE-02**: Live due-count badges — `src/app/[lang]/page.tsx` needs `useSRS` wired; deck tiles show static count → Phase 16 (BUGFIX-01)
- **UX-05**: `allDecksEmpty` defect — check uses current deck's filtered index range for all decks; premature all-done in A1-only mode → Phase 16 (BUGFIX-02)
- **Tech debt**: `speak()` helper duplicated in AudioButton.tsx and StudySession.tsx — could be `src/lib/speak.ts` (DEBT-01, future)
- **Tech debt**: `src/i18n/navigation.ts` locale-aware helpers are unused — all nav uses `next/link` directly (DEBT-02, future)
- **Content**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish) (CONTENT-01, future)

### Design Docs

- `docs/plans/2026-03-08-qa-scenarios-design.md` — Q&A mode design (Approved)
- `docs/plans/2026-03-08-qa-scenarios.md` — Q&A implementation plan

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-09T07:14:56.146Z
Stopped at: Phase 16 context gathered
Resume file: .planning/phases/16-bug-fixes/16-CONTEXT.md
