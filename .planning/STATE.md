---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Next.js Port
status: planning
stopped_at: Completed 11-logic-and-tests-01-PLAN.md
last_updated: "2026-03-05T09:38:55.290Z"
last_activity: 2026-03-04 — v1.2 roadmap created, phases 9–13 defined
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 8
  completed_plans: 6
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
| Phase 09-scaffold P01 | 5 | 3 tasks | 10 files |
| Phase 09-scaffold P02 | 5 | 2 tasks | 8 files |
| Phase 10-data-migration P02 | 3 | 2 tasks | 8 files |
| Phase 10-data-migration P01 | 15 | 2 tasks | 8 files |
| Phase 10-data-migration P03 | 5 | 2 tasks | 3 files |
| Phase 11-logic-and-tests P01 | 5 | 2 tasks | 8 files |

## Accumulated Context

### Decisions

- v1.2 is a strict feature parity port — no new features, no SSR, no external state library
- Static export only (`output: 'export'`); deployed to Hostinger VPS from `feat/nextjs-port`
- localStorage key format from v1.1 must be preserved exactly in useSRS hook
- FLTR-06 guard must be enforced in useLevelFilter — cannot deselect all levels
- Tests live alongside logic in Phase 11 (not a separate phase) — test-alongside-build pattern
- CEFR codes A1/A2 are language-neutral; next-intl message files cover deck names and UI strings only
- [Phase 09-scaffold]: Scaffolded create-next-app to /tmp then copied files — tool refuses to run in directories with existing content (.planning/, tests/)
- [Phase 09-scaffold]: i18n/request.ts stub with hardcoded locale 'it' satisfies next-intl plugin at build time; Plan 02 replaces with routing-aware config
- [Phase 09-scaffold]: DeckId uses eight confirmed literals from main-branch vanilla JS source: daily, restaurant, travel, shopping, hotel, emergencies, social, weather
- [Phase 09-scaffold]: trailingSlash: true required in next.config.ts for out/{locale}/index.html output (Hostinger static hosting format)
- [Phase 09-scaffold]: No middleware.ts created — static export is incompatible with Next.js middleware; locale routing uses generateStaticParams + setRequestLocale pattern only
- [Phase 10-data-migration]: Card order preserved exactly from main-branch vanilla JS source — positional indices are SRS localStorage keys
- [Phase 10-data-migration]: Card order preserved exactly from main-branch source — A2 first, A1 appended — to maintain SRS key integrity
- [Phase 10-data-migration]: Italian deck modules omit id/title/description/icon/theme — those go in Plan 03 metadata module; only front/back/level copied
- [Phase 10-data-migration]: i18nKey equals DeckId string — deck IDs match message file namespace keys exactly
- [Phase 10-data-migration]: DECK_IDS exported as flat DeckId[] without lang for Phase 12 generateStaticParams
- [Phase 11-logic-and-tests]: Test stubs avoid importing unimplemented modules — stubs use expect(true).toBe(true) placeholder until Plans 02/03 replace them
- [Phase 11-logic-and-tests]: Progress.nextReview changed from number (Unix ms) to string (YYYY-MM-DD) to match v1.1 localStorage format

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-05T09:38:55.287Z
Stopped at: Completed 11-logic-and-tests-01-PLAN.md
Resume file: None
