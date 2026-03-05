---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Next.js Port
status: planning
stopped_at: Phase 9 context gathered
last_updated: "2026-03-05T07:51:48.323Z"
last_activity: 2026-03-04 — v1.2 roadmap created, phases 9–13 defined
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** v1.2 — Phase 9: Scaffold

## Current Position

Phase: 9 of 13 (Scaffold)
Plan: —
Status: Ready to plan
Last activity: 2026-03-04 — v1.2 roadmap created, phases 9–13 defined

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v1.2)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

- v1.2 is a strict feature parity port — no new features, no SSR, no external state library
- Static export only (`output: 'export'`); deployed to Hostinger VPS from `feat/nextjs-port`
- localStorage key format from v1.1 must be preserved exactly in useSRS hook
- FLTR-06 guard must be enforced in useLevelFilter — cannot deselect all levels
- Tests live alongside logic in Phase 11 (not a separate phase) — test-alongside-build pattern
- CEFR codes A1/A2 are language-neutral; next-intl message files cover deck names and UI strings only

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-05T07:51:48.316Z
Stopped at: Phase 9 context gathered
Resume file: .planning/phases/09-scaffold/09-CONTEXT.md
