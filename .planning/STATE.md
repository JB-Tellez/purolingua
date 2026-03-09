---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: TBD
status: planning
stopped_at: v1.2 milestone complete
last_updated: "2026-03-09"
last_activity: 2026-03-09 — v1.2 milestone archived
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09 after v1.2 milestone)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Planning next milestone

## Current Position

Phase: — (next milestone not yet defined)
Plan: —
Status: Ready to plan next milestone

Last activity: 2026-03-09 — v1.2 Next.js Port milestone archived

## Accumulated Context

### Open Items (Deferred from v1.2)

- **ROUTE-02**: Live due-count badges — `src/app/[lang]/page.tsx` needs `useSRS` wired; deck tiles show static count
- **UX-05**: `allDecksEmpty` defect — check uses current deck's filtered index range for all decks; premature all-done in A1-only mode
- **Tech debt**: `speak()` helper duplicated in AudioButton.tsx and StudySession.tsx — could be `src/lib/speak.ts`
- **Tech debt**: `src/i18n/navigation.ts` locale-aware helpers are unused — all nav uses `next/link` directly
- **Content**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish)

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-09
Stopped at: v1.2 milestone complete — ready for `/gsd:new-milestone`
Resume file: None
