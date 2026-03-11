---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Q&A Mode
status: completed
stopped_at: Completed 19-q-a-study-session-04-PLAN.md
last_updated: "2026-03-11T05:53:50.009Z"
last_activity: 2026-03-10 — Phase 19 plan 04 complete (wrong-answer auto-advance bug fixed, 98/98 tests pass)
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 13
  completed_plans: 13
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-10 after v1.3 milestone)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Planning next milestone (v1.4) — run `/gsd:new-milestone`

## Current Position

Phase: 19 — Q&A Study Session (complete)
Plan: 04 of 04 complete (gap closure)
Status: Phase 19 plan 04 done — wrong-answer auto-advance bug fixed; UAT Test 3 now passes. v1.3 Q&A Mode milestone complete.

[██████████] 100% — 13/13 plans complete overall

Last activity: 2026-03-10 — Phase 19 plan 04 complete (wrong-answer auto-advance bug fixed, 98/98 tests pass)

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

- **19-04**: handleChoiceClick branches on isCorrect — correct fires handleAnswer(true) after 600ms; wrong resets selectedChoice/feedbackState after 800ms with no SRS update (mirrors voice non-match reset pattern)
- **19-04**: Tests updated to find correct-answer button by textContent, not positional index — shuffle-safe assertion pattern
- **19-03**: QAStudySessionNoSSR wrapper uses next/dynamic ssr:false to bypass hydration for localStorage and Web Speech API dependencies
- **19-03**: generateStaticParams added to qa/[scenario]/page.tsx alongside layout.tsx — Next.js static export requires it at page level too
- **19-03**: Scenario IDs renamed to English for language-neutral URLs — same slug works for /it/ and /es/ routes
- **19-02**: bootstrapHasProgress reads localStorage directly at mount to break useLevelFilter/useQASRS circular dependency
- **19-02**: isScenarioHasDue is a local helper iterating allScenarios with raw progress — avoids calling useQASRS 7 times
- **19-02**: Voice non-match resets feedbackState to null after 800ms (plus micState) — per plan spec
- **19-02**: Static import of QAStudySession in tests — bracket path chars are literal directory names in Next.js App Router
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

Last session: 2026-03-10T23:15:04.954Z
Stopped at: Completed 19-q-a-study-session-04-PLAN.md
Resume file: None
