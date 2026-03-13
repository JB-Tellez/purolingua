---
phase: 24-browser-screens
plan: 02
subsystem: ui
tags: [vue, nuxt, i18n, NuxtLinkLocale, activity-picker, tdd]

requires:
  - phase: 24-browser-screens/24-01
    provides: ActivityPicker.test.ts — RED contract tests for app/pages/index.vue
  - phase: 23-i18n-messages-and-leaf-components
    provides: NuxtLinkLocale pattern and activities i18n namespace in messages/it.json + messages/es.json

provides:
  - ActivityPicker page (app/pages/index.vue) — full Vue SFC with NuxtLinkLocale tiles for /rephrase and /qa
  - i18n keys: page.title, page.subtitle, activities.rephrase.title/description, activities.qa.title/description

affects:
  - 24-03 (DeckGrid — same page-level pattern; no dependency on ActivityPicker)
  - 24-04 (ScenarioGrid — same pattern)

tech-stack:
  added: []
  patterns:
    - "NuxtLinkLocale without :locale prop for internal navigation — auto-prefixes current locale"
    - "ACTIVITIES const array with key/icon/path — v-for in template, t('activities.' + key + '.title') interpolation"
    - "useI18n() t() only in script setup — no composable state needed for static nav page"

key-files:
  created: []
  modified:
    - app/pages/index.vue

key-decisions:
  - "NuxtLinkLocale used (not NuxtLink) — auto-prefixes locale; no hardcoded /it/ or /es/ prefix"
  - "No <style> block — rely on existing activity-grid, deck-card, deck-icon-circle global CSS classes from v1.3"
  - "ACTIVITIES as const satisfies plan spec exactly — key, icon, path for v-for rendering"

patterns-established:
  - "Static nav page pattern: useI18n() + ACTIVITIES const + v-for NuxtLinkLocale + deck-card structure"

requirements-completed:
  - UI-03

duration: 3min
completed: 2026-03-12
---

# Phase 24 Plan 02: ActivityPicker Implementation Summary

**ActivityPicker Vue SFC using NuxtLinkLocale tiles for locale-aware /rephrase and /qa navigation with i18n activity keys**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-13T02:40:11Z
- **Completed:** 2026-03-13T02:43:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced placeholder `app/pages/index.vue` with full `<script setup>` + `<template>` SFC
- Two `NuxtLinkLocale` tiles wrapping `.deck-card` elements with icon, title, description
- i18n keys via `useI18n()` — `t('activities.rephrase.title')` etc.
- All 3 ActivityPicker unit tests GREEN; no regressions in full nuxt suite

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement ActivityPicker in app/pages/index.vue** - `c0d195d` (feat)

## Files Created/Modified
- `app/pages/index.vue` - ActivityPicker page with ACTIVITIES const, NuxtLinkLocale tiles, i18n translations

## Decisions Made
- Used `NuxtLinkLocale` (not `NuxtLink`) so locale auto-prefixes — `/rephrase` renders as `/it/rephrase` or `/es/rephrase`
- No `<style>` block needed — `activity-grid`, `deck-card`, `deck-icon-circle` classes exist in global CSS from v1.3
- String concatenation `'activities.' + activity.key + '.title'` used (template literal syntax also valid; plan spec used concatenation)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - implementation was a direct translation of the plan spec and research pattern.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ActivityPicker complete; UI-03 satisfied
- Plans 03 and 04 (DeckGrid, ScenarioGrid) are next — RED tests already exist from Plan 01
- DeckGrid and ScenarioGrid tests (8 failing) remain RED as expected — not caused by this plan

---
*Phase: 24-browser-screens*
*Completed: 2026-03-13*
