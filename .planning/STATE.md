---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Q&A Mode
status: completed
stopped_at: "Completed 19-q-a-study-session-01-PLAN.md"
last_updated: "2026-03-10T06:37:00Z"
last_activity: 2026-03-10 — Phase 19 plan 01 complete (Q&A i18n keys in it.json/es.json, QAStudySession test scaffold with 11 todo stubs)
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 12
  completed_plans: 10
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.3 milestone start)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** v1.3 Q&A Mode — 4 phases (16–19), 13 requirements

## Current Position

Phase: 19 — Q&A Study Session (in progress)
Plan: 01 of 03 complete
Status: Phase 19 plan 01 done — Q&A i18n keys added to both language files, QAStudySession test scaffold with 11 todo stubs, 86 tests pass

[████████░░] 83% — 10/12 plans complete overall

Last activity: 2026-03-10 — Phase 19 plan 01 complete (Q&A i18n keys in it.json/es.json, QAStudySession test scaffold with 11 todo stubs)

## Accumulated Context

### Open Items (Carried from v1.2)

- **ROUTE-02**: Live due-count badges — FIXED in 16-01. DeckGrid now calls useSRS + useLevelFilter; badge shows live due count or checkmark.
- **UX-05**: `allDecksEmpty` defect — FIXED in 16-02. Now uses lang-scoped deckMetadata and per-deck DECK_MAP with index-preserving filter.
- **Tech debt**: `speak()` helper duplicated in AudioButton.tsx and StudySession.tsx — could be `src/lib/speak.ts` (DEBT-01, future)
- **Tech debt**: `src/i18n/navigation.ts` locale-aware helpers are unused — all nav uses `next/link` directly (DEBT-02, future)
- **Content**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish) (CONTENT-01, future)

### Design Docs

- `docs/plans/2026-03-08-qa-scenarios-design.md` — Q&A mode design (Approved)
- `docs/plans/2026-03-08-qa-scenarios.md` — Q&A implementation plan

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Decisions (Phase 19)

- **19-01**: Q&A keys appended after studyAgain in study namespace — no reordering of existing keys
- **19-01**: Test scaffold uses it.todo() (not it.skip()) — pending tests surface clearly in vitest output, signaling work remaining for Plan 02
- **19-01**: vi.fn() stubs for useQASRS and useVoiceRecognition left unconfigured — Plan 02 configures return values per test

### Decisions (Phase 18)

- **18-03**: ScenarioTile calls useQASRS per tile — each tile is independently reactive to level changes
- **18-03**: qa/layout.tsx owns generateStaticParams — qa/page.tsx is 'use client' so cannot export it directly
- **18-03**: useSRS(lang).hasProgress used in QABrowserPage — correct returning-user signal for level filter guard (not useQASRS)
- **18-03**: QA placeholder route returns minimal "Coming soon." — Phase 19 implements full study session UI
- **18-02**: DeckGrid extracted to src/components/DeckGrid.tsx because DeckGrid.test.tsx imported LangPage — after LangPage was replaced with ActivityPicker, 5 tests broke; extraction restores clean import
- **18-02**: DeckGrid wrapper takes lang prop and owns useSRS + useLevelFilter — maintains Phase 16-03 hook ownership pattern
- **18-02**: ActivityPicker reuses .deck-card CSS without .deck-card-badge span — activity tiles don't need due counts
- **18-01**: Layout-level generateStaticParams in rephrase/layout.tsx because rephrase/page.tsx is 'use client' (cannot coexist with generateStaticParams on client pages)
- **18-01**: Wave 0 test scaffolds use it.todo() not it.skip() — todo shows as pending in vitest output, signaling work remaining for Plans 02/03
- **18-01**: StudySession backLink updated from /${lang} to /${lang}/rephrase — back button now returns to rephrase deck browser, not root picker
- **18-01**: src/app/[lang]/page.tsx intentionally left unchanged — Plan 02 replaces it with ActivityPicker

### Decisions (Phase 17)

- **17-01**: Bilingual fields inline on QACard (questionEs, correctEs, foilsEs) not nested object — simpler access pattern for rendering components
- **17-01**: Scenario.level field added in Phase 17 so content authors can tag level at creation time (not deferred to Phase 18)
- **17-01**: Fixed tuple [string, string, string] for QACard.foils and QACard.foilsEs enforces exactly 3 foils at compile time
- **17-02**: Foil authoring strategy: foils are responses from other scenario contexts (wrong setting, not wrong grammar) — natural A1/A2 distractors
- **17-02**: A1-before-A2 canonical order in scenarios[] array in index.ts — Phase 18 browser inherits display order
- **17-02**: index.ts exports both named const exports and scenarios array — named exports enable selective scenario import in Phase 18/19
- **17-03**: Hook signature includes scenarioId at hook call (not just updateCard) — useMemo for dueCards needs it to build Q&A keys at filter time
- **17-03**: Q&A key format `qa_{scenarioId}_{cardId}` coexists in shared {lang}-progress record — 'qa_' prefix is the namespace separator
- **17-03**: updateCard(cardId, isCorrect) — scenarioId captured from hook closure, not passed per-call, for clean ergonomics at Phase 18 call sites

### Decisions (Phase 16)

- **16-01**: Compute due count inline in DeckGrid render (no useState) — reactive hooks propagate badge changes automatically
- **16-01**: Removed deckCardCount i18n key from DeckGrid badge — now shows raw number or checkmark (✓)
- **16-01**: Added deck-card-badge--done CSS modifier class when due === 0 for styling hook
- **16-02**: Extracted DECK_MAP to `src/data/deckMap.ts` as shared module for DeckPage and StudySession
- **16-02**: Use `deckMetadata.filter(d => d.lang === lang)` instead of `DECK_IDS` for language-scoped allDecksEmpty check
- **16-02**: Index-preserving filter pattern established: `.map((card,i)=>({card,i})).filter(...).every(({i})=>...)`
- **16-03**: Lift useSRS + useLevelFilter into LangPage — single hook ownership eliminates isolated useState divergence between LevelFilterChips and DeckGrid
- **16-03**: LevelFilterChips and DeckGrid both receive activeLevels as props; chip toggle -> LangPage re-render -> badge recompute in single React cycle

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-10T06:37:00Z
Stopped at: Completed 19-q-a-study-session-01-PLAN.md
Resume file: .planning/phases/19-q-a-study-session/19-02-PLAN.md
