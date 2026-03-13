---
phase: 25-study-sessions
plan: 02
subsystem: ui
tags: [vue3, nuxt4, composables, srs, leitner, tts, speech-recognition, flashcards]

# Dependency graph
requires:
  - phase: 25-01
    provides: Wave 0 test stubs with data-* selector contracts for RephraseSession
  - phase: 22-composables
    provides: useSRS, useLevelFilter, useVoiceRecognition composables
  - phase: 23-i18n-messages-and-leaf-components
    provides: AudioButton, ChoiceButton, MicButton, FeedbackMessage components
  - phase: 24-browser-screens
    provides: app/data/deckMap.ts and app/data/decks.ts mirrors
provides:
  - Full Rephrase StudySession page at app/pages/rephrase/[deck].vue
  - Complete flip-card study flow: front phrase → flip → 4 choices → grade → advance
  - SRS progress written to localStorage via updateCard on every answer
  - End screens: deck-done (other decks remain) and all-done (all decks exhausted)
affects:
  - 25-03 (QASession — can use same patterns: dueCards ref snapshot, speak helper, resetSession)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - dueCards snapshotted as ref([]) in onMounted — never computed (prevents mid-session card skipping)
    - ClientOnly wrapping for all study session pages (prevents SSR hydration mismatch)
    - speak() and normalize() as plain functions in script setup (DEBT-01: not shared module)
    - handleChoiceClick → setTimeout(600ms) → handleAnswer flow for choice grading
    - All-decks-done check: iterate deckMetadata filtered by lang, check every filtered card via isCardDueForDeck

key-files:
  created:
    - app/pages/rephrase/[deck].vue
  modified:
    - tests/nuxt/RephraseSession.test.ts

key-decisions:
  - "dueCards as ref not computed — snapshot in onMounted preserves session stability as SRS updates during study"
  - "resetSession() re-runs dueCards snapshot to respect updated SRS state for subsequent sessions"
  - "speak() helper inlined in page — DEBT-01 extraction deferred per plan"
  - "filteredCards computed (not snapshotted) — foil pool for generateChoices, not session flow"
  - "route option in mountSuspended allows real deck params in tests — /it/rephrase/daily triggers DECK_MAP lookup"

patterns-established:
  - "Pattern 1: dueCards ref snapshot pattern — set in onMounted, used by all study session pages"
  - "Pattern 2: ClientOnly wrapping pattern — all session pages must use <ClientOnly> with fallback"
  - "Pattern 3: data-* attribute contracts — data-session-done, data-session-card, data-card-counter, data-progress-bar, data-deck-done, data-choice"

requirements-completed:
  - UI-06

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 25 Plan 02: Rephrase StudySession Page Summary

**Vue 3 Rephrase StudySession SFC with ClientOnly wrapping, dueCards ref snapshot, flip-card + 4-choice grading, TTS/mic support, and SRS progress written to localStorage after every answer**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T04:51:02Z
- **Completed:** 2026-03-13T04:54:23Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Replaced placeholder with 230+ line Vue 3 SFC implementing the complete Rephrase study flow
- dueCards snapshotted as `ref([])` in `onMounted` — critical pattern that prevents mid-session card skipping
- All 5 RephraseSession.test.ts tests GREEN (previously 2 passing, 2 skipped; now 5 passing with 2 previously-skipped tests un-skipped and additional deck-done selector test added)
- SRS progress written to localStorage via `updateCard(deckId, originalIndex, correct)` in `handleAnswer`

## Task Commits

1. **Task 1: Implement Rephrase StudySession page** - `970acb3` (feat)

## Files Created/Modified
- `app/pages/rephrase/[deck].vue` - Full Rephrase StudySession SFC replacing placeholder
- `tests/nuxt/RephraseSession.test.ts` - Unskipped 2 tests, added deck-done selector test; 5 tests GREEN

## Decisions Made
- `dueCards` is a `ref([])` set in `onMounted`, never `computed` — prevents SRS progress updates from removing cards mid-session
- `filteredCards` is `computed` (ok — only used as foil pool for generateChoices, not session flow control)
- `speak()` and `normalize()` defined as plain functions in `<script setup>` — DEBT-01 extraction deferred per plan
- `resetSession()` re-runs the dueCards snapshot so a "Study Again" session reflects the current SRS state
- `mountSuspended(Page, { route: '/it/rephrase/daily' })` pattern used for tests requiring real deck data — discovered that `route` option in `@nuxt/test-utils` resolves params via the router

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- QASession.test.ts had 2 pre-existing failures (QA page still a placeholder for Plan 25-03) — confirmed pre-existing via git stash, no action taken. Logged to deferred-items.

## Next Phase Readiness
- Rephrase session page is complete and functional
- Plan 25-03 (QASession) can follow the same patterns: dueCards snapshot in onMounted, ClientOnly wrapping, data-* selectors, resetSession

## Self-Check: PASSED

All created files and commits verified present.

---
*Phase: 25-study-sessions*
*Completed: 2026-03-13*
