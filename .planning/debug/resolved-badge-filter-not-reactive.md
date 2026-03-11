---
status: resolved
trigger: "badge doesn't update when level filter toggles on DeckGrid"
created: 2026-03-09T00:00:00Z
updated: 2026-03-09T00:00:00Z
---

## Current Focus

hypothesis: LevelFilterChips and DeckGrid each call useLevelFilter independently, creating two separate hook instances with independent state. Toggling in LevelFilterChips updates one instance; DeckGrid reads from its own separate instance which never changes.
test: confirmed by reading both component files
expecting: n/a — root cause confirmed
next_action: return diagnosis

## Symptoms

expected: toggling A1/A2 chips on the home page updates the due-count badge on each deck card
actual: badge count stays the same regardless of which filter chips are active
errors: none (no crash)
reproduction: load home page, toggle a level chip, observe badge is unchanged
started: introduced during 16-01 implementation

## Eliminated

- hypothesis: getDueCount not calling activeLevels at all
  evidence: line 32 in page.tsx clearly filters by (activeLevels as Level[]).includes(card.level)
  timestamp: 2026-03-09T00:00:00Z

- hypothesis: useLevelFilter not persisting to localStorage
  evidence: setActiveLevels correctly writes to localStorage and calls setActiveLevelsState
  timestamp: 2026-03-09T00:00:00Z

## Evidence

- timestamp: 2026-03-09T00:00:00Z
  checked: src/app/[lang]/page.tsx lines 20-35
  found: DeckGrid calls useLevelFilter(lang, hasProgress) at line 25 and reads activeLevels from it
  implication: DeckGrid has its own hook instance

- timestamp: 2026-03-09T00:00:00Z
  checked: src/components/LevelFilterChips.tsx lines 13-15
  found: LevelFilterChips calls useLevelFilter(lang, hasProgress) independently — a separate hook instance
  implication: toggling a chip updates LevelFilterChips's useState, but DeckGrid's useState is a different object in a different component

- timestamp: 2026-03-09T00:00:00Z
  checked: src/hooks/useLevelFilter.ts line 29
  found: useState is local to each call site — React does not share useState between hook invocations even with identical arguments
  implication: the two instances are completely independent; setActiveLevels in LevelFilterChips never triggers a re-render in DeckGrid

## Resolution

root_cause: >
  useLevelFilter is instantiated twice: once inside LevelFilterChips and once inside DeckGrid.
  React's useState is per-component-instance, so they hold independent copies of activeLevels.
  When the user toggles a chip, LevelFilterChips's copy updates and it re-renders correctly (chip highlight changes),
  but DeckGrid's copy is never touched, so getDueCount always runs against the stale initial activeLevels
  and the badge never changes.

fix: >
  Lift the useLevelFilter (and useSRS, since hasProgress feeds it) call up to the shared parent LangPage,
  then pass activeLevels (and setActiveLevels) as props to both LevelFilterChips and DeckGrid.
  Both components will then read from — and write to — the same React state, so a chip toggle
  causes a single state update that immediately flows down to getDueCount.

  Concrete change:
    1. In src/app/[lang]/page.tsx, move `useSRS` + `useLevelFilter` calls from DeckGrid up into LangPage.
    2. Pass `activeLevels` as a prop to DeckGrid (remove internal hook call).
    3. Pass `activeLevels` + `setActiveLevels` as props to LevelFilterChips (remove internal hook calls).
    4. Update LevelFilterChips prop interface to accept these instead of calling the hooks internally.

files_changed: []
