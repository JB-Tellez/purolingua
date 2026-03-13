---
phase: 23-i18n-messages-and-leaf-components
plan: 02
subsystem: ui
tags: [vue, nuxt, components, i18n, tdd, speechsynthesis]

# Dependency graph
requires:
  - phase: 23-i18n-messages-and-leaf-components
    provides: "RED TDD test stubs for all five leaf components"
  - phase: 22-composables
    provides: "app/types Level type, useI18n auto-import"
provides:
  - "ChoiceButton.vue: quiz choice button with embedded speaker icon, click/speak emits"
  - "AudioButton.vue: TTS trigger with import.meta.client guard and aria-label from t('study.audio')"
  - "MicButton.vue: voice recognition trigger with state-based CSS classes and press emit"
  - "FeedbackMessage.vue: colored feedback paragraph with v-if null guard and role=status"
  - "LevelFilterChips.vue: A1/A2 chip group with v-model:activeLevels via emit"
affects:
  - 23-03
  - 24-screens-and-routing
  - 25-study-session-pages

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "defineProps<{}>() with inline type — no separate interface needed for leaf components"
    - "import.meta.client guard as FIRST line of speak() — before any window access"
    - "emit('update:activeLevels', newArray) — never mutates props, always emits new array"
    - "data-speaker attribute on speaker span for semantic test targeting"

key-files:
  created:
    - app/components/ChoiceButton.vue
    - app/components/AudioButton.vue
    - app/components/MicButton.vue
    - app/components/FeedbackMessage.vue
    - app/components/LevelFilterChips.vue
  modified: []

key-decisions:
  - "LANG_LOCALE map inlined in AudioButton.vue — single consumer, no need for shared module"
  - "LevelFilterChips has no FLTR-06 guard — that guard lives in useLevelFilter.setActiveLevels() (Phase 22)"
  - "FeedbackMessage uses state! assertion safe because v-if='state !== null' guards the template"
  - "data-speaker attribute added to ChoiceButton speaker span to match test selector contract"

patterns-established:
  - "Leaf components use <script setup lang='ts'> with no external imports beyond ~/types"
  - "SSR safety via import.meta.client (not typeof window) — locked convention from Phase 20"

requirements-completed: [UI-01]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 23 Plan 02: i18n Messages and Leaf Components Summary

**Five atomic Vue leaf components (ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips) turning 28 RED TDD tests GREEN, with SSR-safe TTS and v-model:activeLevels pattern**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T01:15:24Z
- **Completed:** 2026-03-13T01:19:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Task 1 (ChoiceButton, MicButton, FeedbackMessage): 20 tests pass — click/speak emits, state-based disabled/class logic, null-guard on FeedbackMessage
- Task 2 (AudioButton, LevelFilterChips): 8 more tests pass — SSR-safe speak(), aria-label from i18n, active chip class toggling and correct emit values
- All 28 leaf component tests GREEN on first attempt, no fixes needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement ChoiceButton, MicButton, FeedbackMessage** - `37ed85c` (feat)
2. **Task 2: Implement AudioButton and LevelFilterChips** - `d726e9b` (feat)

## Files Created/Modified
- `app/components/ChoiceButton.vue` — quiz button with embedded speaker span, click/speak emits, disabled when state != idle or disabled prop
- `app/components/MicButton.vue` — mic button with state-driven CSS modifier classes, press emit, aria-label/aria-pressed
- `app/components/FeedbackMessage.vue` — v-if null guard, role=status paragraph, color class map, useI18n t('study.${state}')
- `app/components/AudioButton.vue` — import.meta.client guard, LANG_LOCALE inline, aria-label from t('study.audio')
- `app/components/LevelFilterChips.vue` — LEVELS=['A1','A2'], toggle adds/removes level, emit('update:activeLevels', newArray)

## Decisions Made
- LANG_LOCALE kept inline in AudioButton (single consumer, no shared module needed)
- LevelFilterChips omits FLTR-06 guard per plan — that guard belongs in useLevelFilter (Phase 22)
- data-speaker attribute added to ChoiceButton's speaker span to satisfy test file selector

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All five leaf components ready for consumption by study session pages (Phase 25)
- Plan 23-03 (SiteHeader) is unblocked — leaf component tests all pass
- LevelFilterChips v-model:activeLevels binding ready for useLevelFilter (Phase 24)

---
*Phase: 23-i18n-messages-and-leaf-components*
*Completed: 2026-03-13*
