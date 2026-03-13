# Requirements: PuroLingua v2.0 — Vue Port

**Defined:** 2026-03-12
**Core Value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.

## v2.0 Requirements

Full feature parity with v1.3 in Nuxt 4 + Vue 3. No new features — the migration scope is strictly the framework layer.

### Scaffold

- [x] **SCAF-01**: Nuxt 4 project initialized with TypeScript zero-config (`tsconfig.json` extends `.nuxt/tsconfig.json` only; no `compilerOptions.paths` override)
- [x] **SCAF-02**: Tailwind v4 integrated via `@tailwindcss/vite` Vite plugin (`@nuxtjs/tailwindcss` module never added; `@import "tailwindcss"` in global CSS)
- [x] **SCAF-03**: @nuxtjs/i18n configured with `strategy: 'prefix'`, Italian and Spanish locales, no `[lang]` page segments in `pages/` directory
- [x] **SCAF-04**: `nuxi generate` produces `.output/public/` with `nitro.prerender.routes` explicitly covering all locale × deck + locale × scenario route combinations (~46 routes)
- [x] **SCAF-05**: Vitest + @nuxt/test-utils configured; `mountSuspended` available for Vue composable testing; existing pure-logic tests passing unchanged

### Data and Routing

- [x] **DATA-01**: `srs.ts`, `generateChoices.ts`, all `data/` card modules, and `types/` copied verbatim from `feat/nextjs-port` with existing Vitest tests passing unchanged
- [x] **DATA-02**: All 6 page routes (`/`, `/rephrase`, `/rephrase/[deck]`, `/qa`, `/qa/[scenario]`, plus locale-prefixed equivalents) defined with placeholder templates before any component work begins

### Composables

- [x] **COMP-01**: `useSRS` composable ported to Vue — all localStorage reads inside `onMounted`, `import.meta.client` guards, existing test contract and `${lang}-progress` key format preserved
- [x] **COMP-02**: `useLevelFilter` composable ported to Vue — A1/A2 filter state, new/returning user defaults, FLTR-06 guard (cannot deselect all chips), localStorage persistence
- [x] **COMP-03**: `useQASRS` composable ported to Vue — `qa_`-prefixed SRS keys, level filtering, Leitner intervals, `onMounted` guards
- [x] **COMP-04**: `useVoiceRecognition` composable ported to Vue — `SpeechRecognition` instantiation inside `onMounted`; used inside `<ClientOnly>` contexts only

### UI Components

- [x] **UI-01**: Leaf components ported as Vue SFCs: ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips (callback props become `defineEmits`)
- [x] **UI-02**: i18n messages (`it.json`, `es.json`) adjusted for @nuxtjs/i18n dotted key path format; SiteHeader locale switcher verified working in static output
- [x] **UI-03**: ActivityPicker screen with Rephrase/Q&A navigation tiles using `<NuxtLinkLocale>`
- [x] **UI-04**: DeckGrid screen with reactive live due-count badges (computed from `useSRS`) and level filter chips; A1/A2 toggle updates badge counts in one render cycle
- [x] **UI-05**: ScenarioGrid (Q&A browser) with reactive live due-count badges per scenario tile and level filter chips
- [x] **UI-06**: Rephrase StudySession — full Leitner flip/grade/advance, `dueCards` snapshotted as `ref` in `onMounted` (not `computed`), voice recognition, TTS audio, deck-done and all-done end screens; wrapped in `<ClientOnly>`
- [x] **UI-07**: Q&A StudySession — 4-choice interaction, `useQASRS`, TTS audio, voice recognition, correct/incorrect feedback, scenario-done and all-done screens; wrapped in `<ClientOnly>`

### Deployment

- [ ] **DEPLOY-01**: `nuxi generate` output verified against full checklist served over HTTP: all ~46 routes present, locale messages loading (no 404s), localStorage persisting across reloads, no hydration warnings in browser console
- [ ] **DEPLOY-02**: Static export deployed to Hostinger; live site verified: locale routing, locale switching, SRS progress persistence, voice recognition, TTS audio

## Future Requirements

### Content Quality

- **CONTENT-01**: A1 phrase linguistic quality reviewed by native Italian and Spanish speakers before recommending to learners (carried from v1.3)

### Tech Debt

- **DEBT-01**: `speak()` helper extracted to `src/lib/speak.ts` (currently duplicated in AudioButton and StudySession in v1.3)
- **DEBT-02**: `src/i18n/navigation.ts` locale helpers removed (unused in v1.3)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New content (B1/B2 levels) | v2.0 is a port, not a content expansion |
| New study activity types | Full parity target; new activities are v2.1+ |
| User accounts / backend | Core value is zero-friction, localStorage-first |
| Mobile app | Web-first; browser works on mobile |
| SSR / API routes | Static export only for Hostinger hosting |
| Pinia / VueUse adoption | State surface small enough for focused composables |
| VueUse useLocalStorage | Only adopt if onMounted pattern proves insufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCAF-01 | Phase 20 | Complete |
| SCAF-02 | Phase 20 | Complete |
| SCAF-03 | Phase 20 | Complete |
| SCAF-04 | Phase 20 | Complete |
| SCAF-05 | Phase 20 | Complete |
| DATA-01 | Phase 21 | Complete |
| DATA-02 | Phase 21 | Complete |
| COMP-01 | Phase 22 | Complete |
| COMP-02 | Phase 22 | Complete |
| COMP-03 | Phase 22 | Complete |
| COMP-04 | Phase 22 | Complete |
| UI-01 | Phase 23 | Complete |
| UI-02 | Phase 23 | Complete |
| UI-03 | Phase 24 | Complete |
| UI-04 | Phase 24 | Complete |
| UI-05 | Phase 24 | Complete |
| UI-06 | Phase 25 | Complete |
| UI-07 | Phase 25 | Complete |
| DEPLOY-01 | Phase 26 | Pending |
| DEPLOY-02 | Phase 26 | Pending |

**Coverage:**
- v2.0 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after roadmap creation*
