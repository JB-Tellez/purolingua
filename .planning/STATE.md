---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Q&A Mode
status: planning
stopped_at: defining requirements
last_updated: "2026-03-08"
last_activity: 2026-03-08 — Milestone v1.3 started
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.3 milestone start)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Defining requirements for v1.3 Q&A Mode

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements

Last activity: 2026-03-08 — Milestone v1.3 started

## Accumulated Context

### Open Items (Carried from v1.2)

- **ROUTE-02**: Live due-count badges — `src/app/[lang]/page.tsx` needs `useSRS` wired; deck tiles show static count
- **UX-05**: `allDecksEmpty` defect — check uses current deck's filtered index range for all decks; premature all-done in A1-only mode
- **Tech debt**: `speak()` helper duplicated in AudioButton.tsx and StudySession.tsx — could be `src/lib/speak.ts`
- **Tech debt**: `src/i18n/navigation.ts` locale-aware helpers are unused — all nav uses `next/link` directly
- **Content**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish)

### Design Docs

- `docs/plans/2026-03-08-qa-scenarios-design.md` — Q&A mode design (Approved)
- `docs/plans/2026-03-08-qa-scenarios.md` — Q&A implementation plan

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08
Stopped at: Defining v1.3 requirements
Resume file: None
