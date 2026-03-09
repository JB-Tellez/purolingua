# Roadmap: PuroLingua

## Milestones

- ✅ **v1.0 Initial Release** — Phases 1–5 (shipped 2025)
- ✅ **v1.1 Difficulty Levels** — Phases 6–8 (shipped 2026-02-23)
- ✅ **v1.2 Next.js Port** — Phases 9–15 (shipped 2026-03-09)
- 🔄 **v1.3 Q&A Mode** — Phases 16–19 (in progress)

## Phases

<details>
<summary>✅ v1.0 Initial Release (Phases 1–5) — SHIPPED 2025</summary>

Shipped pre-GSD. Phases 1–5 estimated; no phase-level tracking exists.

Features shipped: Leitner SRS, Italian + Spanish vocabulary decks (8 topics each), audio playback (Web Speech API), voice recognition quiz, multiple-choice quiz, localStorage persistence, language picker UI, extensible i18n system, Vite build, Vitest + Playwright test suite, GitHub Pages staging deployment.

</details>

<details>
<summary>✅ v1.1 Difficulty Levels (Phases 6–8) — SHIPPED 2026-02-23</summary>

- [x] Phase 6: Content and Data (3/3 plans) — completed 2026-02-23
- [x] Phase 7: Filter Logic (4/4 plans) — completed 2026-02-23
- [x] Phase 8: Filter UI (2/2 plans) — completed 2026-02-23

Full archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Next.js Port (Phases 9–15) — SHIPPED 2026-03-09</summary>

- [x] Phase 9: Scaffold (2/2 plans) — completed 2026-03-05
- [x] Phase 10: Data Migration (3/3 plans) — completed 2026-03-05
- [x] Phase 11: Logic and Tests (3/3 plans) — completed 2026-03-05
- [x] Phase 12: Routing (2/2 plans) — completed 2026-03-05
- [x] Phase 13: UI, i18n, and Styling (3/3 plans) — completed 2026-03-06
- [x] Phase 14: Voice Recognition (3/3 plans) — completed 2026-03-07
- [x] Phase 15: Study Session UX Polish (3/3 plans) — completed 2026-03-08

Known gaps deferred to v1.3: ROUTE-02 (live due-count badges), UX-05 (allDecksEmpty A1-only defect)

Full archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

### v1.3 Q&A Mode

- [x] **Phase 16: Bug Fixes** — Fix the two deferred v1.2 regressions before adding new features (completed 2026-03-09)
- [ ] **Phase 17: Q&A Data** — Author all typed QACard/Scenario data and the useQASRS hook
- [ ] **Phase 18: Activity Picker and Scenario Browser** — Wire the navigation shell between language, activity, and scenarios
- [ ] **Phase 19: Q&A Study Session** — Build the full target-language Q&A session with audio, voice, and end screens

## Phase Details

### Phase 16: Bug Fixes
**Goal**: The Rephrase mode works correctly — deck tiles show live due counts and the all-done screen never fires prematurely in A1-only mode
**Depends on**: Nothing (independent fixes; unblocks accurate SRS state display throughout the app)
**Requirements**: BUGFIX-01, BUGFIX-02
**Success Criteria** (what must be TRUE):
  1. Deck grid tiles show a due-count badge that reflects actual SRS state for the active level filter — not a static card count
  2. Selecting A1-only filter and finishing one deck does not trigger the all-done screen when other decks still have due cards
  3. Due-count badge updates immediately when the user changes the level filter chips without a page reload
**Plans**: 2 plans
Plans:
- [ ] 16-01-PLAN.md — Wire useSRS + useLevelFilter into DeckGrid; live badge with zero-state checkmark (BUGFIX-01)
- [ ] 16-02-PLAN.md — Extract shared DECK_MAP; fix allDecksEmpty lang-scope and per-deck index bug (BUGFIX-02)

### Phase 17: Q&A Data
**Goal**: All Q&A content is authored and the SRS hook is ready — no UI yet, but the full data + logic layer can be exercised in tests
**Depends on**: Phase 16 (live SRS state display correct before adding new SRS track)
**Requirements**: QADATA-01, QADATA-02, QAFLOW-06
**Success Criteria** (what must be TRUE):
  1. All 7 Italian scenarios are importable TypeScript modules with typed QACard and Scenario shapes
  2. All 7 Spanish scenarios are importable TypeScript modules with parallel content to Italian
  3. useQASRS hook returns due cards for a scenario using prefixed keys (`qa_{scenarioId}_{cardId}`) that do not collide with Rephrase progress keys
  4. Vitest tests confirm Leitner SRS math (advance/retreat box) works correctly for Q&A cards
  5. Level filter (A1/A2) applied by useQASRS correctly narrows scenario card pools
**Plans**: TBD

### Phase 18: Activity Picker and Scenario Browser
**Goal**: Users can navigate from language selection to either Rephrase or Q&A, and can browse and enter Q&A scenarios
**Depends on**: Phase 17 (scenario data and useQASRS hook must exist before the browser can render live counts)
**Requirements**: ACTPICK-01, QAFLOW-01, QAFLOW-02
**Success Criteria** (what must be TRUE):
  1. After selecting a language, user sees an Activity Picker screen with two choices: Rephrase and Q&A
  2. Selecting Rephrase from the picker navigates to the existing deck browser — all existing Rephrase behavior unchanged
  3. Selecting Q&A from the picker navigates to the scenario browser at `/[lang]/qa`
  4. Each scenario tile on the browser shows an icon, a title, and a live due-count badge
  5. A1/A2 level filter chips appear on the scenario browser and obey the FLTR-06 guard (cannot deselect all)
**Plans**: TBD

### Phase 19: Q&A Study Session
**Goal**: Users can complete a full Q&A session — question displayed, answer chosen from 4 target-language options, feedback shown, progress saved
**Depends on**: Phase 18 (scenario browser must exist to enter a session)
**Requirements**: QAFLOW-03, QAFLOW-04, QAFLOW-05, QAFLOW-07, QAFLOW-08
**Success Criteria** (what must be TRUE):
  1. Card front shows a target-language question with an audio button; tapping audio reads the question aloud via TTS
  2. Card flip reveals exactly 4 target-language response options — no native-language text appears anywhere in the session
  3. Selecting the correct response shows a correct feedback overlay; selecting a foil shows an incorrect overlay — consistent with Rephrase mode
  4. User can tap the mic button and speak an answer; recognized speech is matched against the correct response and triggers appropriate feedback
  5. After all due cards in a scenario are exhausted, the scenario-complete screen appears; after all scenarios are done, the all-done screen appears
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1–5. Foundation | v1.0 | — | Complete | 2025 |
| 6. Content and Data | v1.1 | 3/3 | Complete | 2026-02-23 |
| 7. Filter Logic | v1.1 | 4/4 | Complete | 2026-02-23 |
| 8. Filter UI | v1.1 | 2/2 | Complete | 2026-02-23 |
| 9. Scaffold | v1.2 | 2/2 | Complete | 2026-03-05 |
| 10. Data Migration | v1.2 | 3/3 | Complete | 2026-03-05 |
| 11. Logic and Tests | v1.2 | 3/3 | Complete | 2026-03-05 |
| 12. Routing | v1.2 | 2/2 | Complete | 2026-03-05 |
| 13. UI, i18n, and Styling | v1.2 | 3/3 | Complete | 2026-03-06 |
| 14. Voice Recognition | v1.2 | 3/3 | Complete | 2026-03-07 |
| 15. Study Session UX Polish | v1.2 | 3/3 | Complete | 2026-03-08 |
| 16. Bug Fixes | 2/2 | Complete   | 2026-03-09 | — |
| 17. Q&A Data | v1.3 | 0/? | Not started | — |
| 18. Activity Picker and Scenario Browser | v1.3 | 0/? | Not started | — |
| 19. Q&A Study Session | v1.3 | 0/? | Not started | — |
