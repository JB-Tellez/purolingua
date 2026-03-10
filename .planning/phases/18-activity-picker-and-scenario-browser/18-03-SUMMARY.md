---
phase: 18-activity-picker-and-scenario-browser
plan: "03"
subsystem: qa-scenario-browser
tags: [scenario-grid, qa-browser, level-filter, static-routes, tdd]
dependency_graph:
  requires:
    - 18-01  # useQASRS hook, route scaffold, test stubs
    - 17-03  # useQASRS hook implementation
    - 16-03  # useLevelFilter, LevelFilterChips
  provides:
    - QAFLOW-01  # Scenario grid with live due badges
    - QAFLOW-02  # Level filter chips on scenario browser
  affects:
    - src/app/[lang]/qa/
    - src/components/ScenarioGrid.tsx
tech_stack:
  added: []
  patterns:
    - TDD (RED → GREEN for ScenarioGrid)
    - Per-tile hook call pattern (useQASRS called in ScenarioTile)
    - Layout-level generateStaticParams for client page
    - useSRS hasProgress signal for level filter initialization
key_files:
  created:
    - src/components/ScenarioGrid.tsx
    - src/__tests__/components/ScenarioGrid.test.tsx
    - src/app/[lang]/qa/layout.tsx
    - src/app/[lang]/qa/page.tsx
    - src/app/[lang]/qa/[scenario]/page.tsx
  modified: []
decisions:
  - "ScenarioTile calls useQASRS per tile — each tile is independently reactive to level changes"
  - "qa/layout.tsx owns generateStaticParams — qa/page.tsx is 'use client' so cannot export it directly"
  - "useSRS(lang).hasProgress used in QABrowserPage — correct returning-user signal for level filter guard"
  - "QA placeholder route returns minimal 'Coming soon.' — Phase 19 will implement full session UI"
metrics:
  duration_minutes: 2
  completed_date: "2026-03-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 1
---

# Phase 18 Plan 03: QA Scenario Browser Summary

**One-liner:** Scenario browser at /[lang]/qa with 7 live-badge tiles via ScenarioGrid + useQASRS per tile, LevelFilterChips integration, and Phase 19 placeholder route.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build ScenarioGrid component + real tests (TDD) | eb98bcd | src/components/ScenarioGrid.tsx, src/__tests__/components/ScenarioGrid.test.tsx |
| 2 | Build QA browser page + layout + placeholder route | 185eeaa | src/app/[lang]/qa/layout.tsx, src/app/[lang]/qa/page.tsx, src/app/[lang]/qa/[scenario]/page.tsx |

## What Was Built

**ScenarioGrid component** (`src/components/ScenarioGrid.tsx`): Renders 7 ScenarioTile components from the `scenarios` array. Each ScenarioTile calls `useQASRS(lang, scenario.id, scenario.cards, activeLevels)` to get live due count. Badge shows the numeric due count when >0, or a checkmark (✓) when 0. Theme applied by index position (teal, blue, red, yellow, green, purple, orange). Links to `/${lang}/qa/${scenario.id}`.

**ScenarioGrid tests** (`src/__tests__/components/ScenarioGrid.test.tsx`): Replaced Wave 0 todo stubs with 5 real assertions covering: 7 links rendered, 7 h3 headings, due count badge display, checkmark badge display, and link href pattern. All 5 pass green.

**QA browser page** (`src/app/[lang]/qa/page.tsx`): Client component following the Phase 16 pattern — lifts `useSRS` and `useLevelFilter` to page level, passes `activeLevels` and `setActiveLevels` as props to `LevelFilterChips` and `ScenarioGrid`. Level chip changes trigger page re-render → all ScenarioTile due counts recompute in one React cycle.

**QA layout** (`src/app/[lang]/qa/layout.tsx`): Exports `generateStaticParams` returning 14 paths (2 locales × 7 scenarios). Required because the qa page is `'use client'` and cannot export `generateStaticParams` directly.

**Placeholder session route** (`src/app/[lang]/qa/[scenario]/page.tsx`): Minimal server component returning "Coming soon." Ensures navigation from scenario tiles doesn't 404. Full study session UI deferred to Phase 19.

## Verification Results

- ScenarioGrid tests: 5/5 green
- Full Vitest suite: 86/86 tests pass
- File structure: qa/layout.tsx, qa/page.tsx, qa/[scenario]/page.tsx all present
- `useQASRS` import confirmed in ScenarioGrid.tsx
- `useSRS` import confirmed in qa/page.tsx (correct hasProgress signal)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- src/components/ScenarioGrid.tsx — FOUND
- src/__tests__/components/ScenarioGrid.test.tsx — FOUND
- src/app/[lang]/qa/layout.tsx — FOUND
- src/app/[lang]/qa/page.tsx — FOUND
- src/app/[lang]/qa/[scenario]/page.tsx — FOUND
- Commit eb98bcd — FOUND
- Commit 185eeaa — FOUND
