# Roadmap: PuroLingua

## Milestones

- ✅ **v1.0 Initial Release** — Phases 1–5 (shipped 2025)
- ✅ **v1.1 Difficulty Levels** — Phases 6–8 (shipped 2026-02-23)
- ✅ **v1.2 Next.js Port** — Phases 9–15 (shipped 2026-03-09)
- ✅ **v1.3 Q&A Mode** — Phases 16–19 (shipped 2026-03-10)
- 🔄 **v2.0 Vue Port** — Phases 20–26 (in progress)

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

<details>
<summary>✅ v1.3 Q&A Mode (Phases 16–19) — SHIPPED 2026-03-10</summary>

- [x] Phase 16: Bug Fixes (3/3 plans) — completed 2026-03-09
- [x] Phase 17: Q&A Data (3/3 plans) — completed 2026-03-09
- [x] Phase 18: Activity Picker and Scenario Browser (3/3 plans) — completed 2026-03-10
- [x] Phase 19: Q&A Study Session (4/4 plans) — completed 2026-03-10

Full archive: `.planning/milestones/v1.3-ROADMAP.md`

</details>

### v2.0 Vue Port (Phases 20–26)

- [ ] **Phase 20: Scaffold** — Nuxt 4 project with TypeScript, Tailwind v4, @nuxtjs/i18n, and static export verified working
- [ ] **Phase 21: Pure Logic and Routing Skeleton** — All TypeScript libs copied verbatim with tests passing; all 6 page routes defined as placeholder templates
- [ ] **Phase 22: Composables** — All four Vue composables ported with onMounted guards and existing test contracts preserved
- [ ] **Phase 23: i18n Messages and Leaf Components** — i18n key paths adjusted for @nuxtjs/i18n; all atomic Vue SFCs built and locale switcher verified in static output
- [ ] **Phase 24: Browser Screens** — ActivityPicker, DeckGrid, and ScenarioGrid assembled with reactive due-count badges and level filter chips
- [ ] **Phase 25: Study Sessions** — Rephrase and Q&A study sessions built with ClientOnly wrapping, dueCards snapshot pattern, and full interaction model
- [ ] **Phase 26: Deployment** — Static export validated over HTTP and live site verified on Hostinger

## Phase Details

### Phase 20: Scaffold
**Goal**: The Nuxt 4 project runs in dev, generates a complete `.output/public/` tree, and enforces all configuration patterns that prevent the five known migration pitfalls
**Depends on**: Nothing (first phase of this milestone)
**Requirements**: SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05
**Success Criteria** (what must be TRUE):
  1. `bun run dev` starts without errors and the app is visible at localhost
  2. `nuxi generate` produces `.output/public/` with all locale × deck and locale × scenario routes present (~46 routes)
  3. Tailwind v4 utility classes apply correctly in the browser (no PostCSS/module conflict errors)
  4. `@nuxtjs/i18n` with `strategy: 'prefix'` serves `/it/` and `/es/` locale prefixes; no `[lang]` page segments exist in `pages/`
  5. Vitest runs with `@nuxt/test-utils` and `mountSuspended` available; a smoke-test passes
**Plans**: 2 plans
Plans:
- [ ] 20-01-PLAN.md — Install Nuxt 4, swap configs, create app shell + smoke test
- [ ] 20-02-PLAN.md — Create placeholder pages and verify full static output

### Phase 21: Pure Logic and Routing Skeleton
**Goal**: All TypeScript logic from the Next.js port is available in the Nuxt project with zero modifications, and all page routes return a response (even if placeholder) so prerender gaps surface early
**Depends on**: Phase 20
**Requirements**: DATA-01, DATA-02
**Success Criteria** (what must be TRUE):
  1. All existing Vitest tests for `srs.ts`, `generateChoices.ts`, and data modules pass without modification
  2. Navigating to `/it/rephrase/restaurant`, `/es/qa/caffe`, and all other locale × deck/scenario URLs in the generated static output returns a 200 (not 404)
  3. `nitro.prerender.routes` covers every locale × deck and locale × scenario combination; `.output/public/` tree is verifiable against an expected route list
**Plans**: TBD

### Phase 22: Composables
**Goal**: All four composables — useSRS, useLevelFilter, useQASRS, useVoiceRecognition — are ported to Vue with correct onMounted guards so no SSR hydration crash occurs and the existing localStorage key contracts are preserved
**Depends on**: Phase 21
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. `nuxi generate` completes with no `ReferenceError: localStorage is not defined` errors
  2. `useSRS` reads and writes the `${lang}-progress` localStorage key in the same format as the Next.js port
  3. `useQASRS` reads and writes `qa_`-prefixed SRS keys; level filtering and Leitner intervals behave identically to the hook in v1.3
  4. `useLevelFilter` enforces the FLTR-06 guard (cannot deselect all chips) and persists level preference across page reloads
  5. Unit tests for all four composables pass using `mountSuspended`
**Plans**: TBD

### Phase 23: i18n Messages and Leaf Components
**Goal**: Italian and Spanish UI strings load correctly in the static output and all atomic UI components are available as Vue SFCs for screen assembly in the next phase
**Depends on**: Phase 22
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. Locale switching from `/it/` to `/es/` in the static output changes all visible UI strings without a 404 on the locale JSON
  2. SiteHeader renders the correct locale and the switcher navigates to the corresponding `/es/` or `/it/` path
  3. ChoiceButton, AudioButton, MicButton, FeedbackMessage, and LevelFilterChips render and emit events correctly (callback props replaced with `defineEmits`)
**Plans**: TBD

### Phase 24: Browser Screens
**Goal**: Users can navigate between the activity picker, rephrase deck grid, and Q&A scenario grid, see live due-count badges that react to level filter changes, and toggle A1/A2 chips
**Depends on**: Phase 23
**Requirements**: UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. The activity picker at `/it` and `/es` shows Rephrase and Q&A tiles that navigate to the correct routes
  2. The rephrase deck grid shows a due-count badge per deck that updates in the same render cycle when a level chip is toggled
  3. The Q&A scenario grid shows a due-count badge per scenario tile and level filter chips that work the same as the rephrase grid
  4. A1/A2 chip toggle on either grid prevents deselecting all chips (FLTR-06 guard active in the UI)
**Plans**: TBD

### Phase 25: Study Sessions
**Goal**: Users can complete a full Rephrase study session and a full Q&A study session — including TTS audio, voice recognition, card grading, and end screens — with no mid-session card skipping or SSR crashes
**Depends on**: Phase 24
**Requirements**: UI-06, UI-07
**Success Criteria** (what must be TRUE):
  1. A Rephrase session starts with the correct due cards for the selected level filter, advances through all cards without skipping, and shows the deck-done or all-done screen at the end
  2. A Q&A session presents 4-choice questions in the target language, plays TTS audio on request, accepts voice recognition input, and shows correct/incorrect feedback before advancing
  3. SRS progress (box assignment and next-due date) is written to localStorage after each card grade and persists across a page reload
  4. Both session pages are wrapped in `<ClientOnly>`; `nuxi generate` produces no hydration mismatch warnings for these routes
**Plans**: TBD

### Phase 26: Deployment
**Goal**: The generated static output is verified as fully functional over HTTP — matching the v1.3 feature set exactly — and the live Hostinger site is confirmed working end-to-end
**Depends on**: Phase 25
**Requirements**: DEPLOY-01, DEPLOY-02
**Success Criteria** (what must be TRUE):
  1. All ~46 routes in `.output/public/` are present and return 200 when served over HTTP (not just in `nuxi dev`)
  2. No hydration warnings appear in the browser console when loading any route from the static output
  3. SRS progress persists across browser reloads on the live Hostinger domain
  4. Locale switching, voice recognition, and TTS audio all function on the live Hostinger domain
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
| 16. Bug Fixes | v1.3 | 3/3 | Complete | 2026-03-09 |
| 17. Q&A Data | v1.3 | 3/3 | Complete | 2026-03-09 |
| 18. Activity Picker and Scenario Browser | v1.3 | 3/3 | Complete | 2026-03-10 |
| 19. Q&A Study Session | v1.3 | 4/4 | Complete | 2026-03-10 |
| 20. Scaffold | v2.0 | 0/2 | In planning | — |
| 21. Pure Logic and Routing Skeleton | v2.0 | 0/? | Not started | — |
| 22. Composables | v2.0 | 0/? | Not started | — |
| 23. i18n Messages and Leaf Components | v2.0 | 0/? | Not started | — |
| 24. Browser Screens | v2.0 | 0/? | Not started | — |
| 25. Study Sessions | v2.0 | 0/? | Not started | — |
| 26. Deployment | v2.0 | 0/? | Not started | — |
