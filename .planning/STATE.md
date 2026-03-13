---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Vue Port
status: executing
last_updated: "2026-03-13T01:17:15.852Z"
last_activity: 2026-03-13 — Completed 23-02 (5 leaf Vue components GREEN: ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips)
progress:
  total_phases: 7
  completed_phases: 3
  total_plans: 11
  completed_plans: 10
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v2.0 milestone started)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Phase 20 — Nuxt 4 project scaffold

## Current Position

Phase: 23 — i18n Messages and Leaf Components (in progress)
Plan: 02 done; next: 23-03 (SiteHeader component)
Status: In Progress

```
v2.0 Progress: [█████████░] 91% (plans 23-01 and 23-02 complete, 23-03 pending)
```

Last activity: 2026-03-13 — Completed 23-02 (5 leaf Vue components GREEN: ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips)

## Performance Metrics

- Phases complete: 0/7
- Plans complete: 2/TBD (phase 20: 2/2 — COMPLETE)
- Requirements mapped: 20/20
- Requirements completed: SCAF-01, SCAF-02, SCAF-03, SCAF-05

## Accumulated Context

### Tech Debt Carried Forward (from v1.3)

- **DEBT-01**: `speak()` helper duplicated in `AudioButton.tsx` and `StudySession.tsx` — candidate for `src/lib/speak.ts`
- **DEBT-02**: `src/i18n/navigation.ts` locale helpers unused — all nav uses `next/link` directly
- **CONTENT-01**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish)

### Key Context

- Source: `feat/nextjs-port` branch — Next.js 15 + TypeScript + Tailwind v4 + next-intl, v1.3 full features
- Target: Nuxt 4 + TypeScript + Tailwind v4 + @nuxtjs/i18n (vue-i18n), static export to `.output/public/`
- localStorage key format must be preserved (`${lang}-progress`, `qa_` prefix) for existing user data continuity
- Card indices are positional SRS keys — append-only insertion constraint still applies
- Static export to Hostinger (same constraint as Next.js port, `output: 'static'` in Nuxt)

### Critical Pitfalls to Avoid (from research)

1. **SSR hydration crash** — All localStorage reads and SpeechRecognition instantiation must be inside `onMounted`. Use `import.meta.client` (not `process.client`). Wrap study session pages in `<ClientOnly>`.
2. **@nuxtjs/tailwindcss incompatible with Tailwind v4** — Never add `@nuxtjs/tailwindcss` to modules. Use `@tailwindcss/vite` in `vite.plugins` only.
3. **Dynamic routes not prerendered** — Enumerate all `/it/rephrase/{deck}` and `/es/qa/{scenario}` paths in `nitro.prerender.routes`. Do not rely on the Nitro crawler alone.
4. **i18n double-prefix** — Page files must NOT include a `[lang]` segment. Use `pages/rephrase/[deck].vue`, not `pages/[lang]/rephrase/[deck].vue`.
5. **dueCards as computed causes mid-session card skipping** — Snapshot dueCards once as `ref(computeDueCards())` in `onMounted`. Never use `computed` for dueCards inside a study session.

### Decisions Made

| Decision | Rationale |
|----------|-----------|
| Nuxt 4 over Nuxt 3 | Nuxt 3 EOL July 2026; same module ecosystem |
| @tailwindcss/vite plugin (no @nuxtjs/tailwindcss) | Confirmed module incompatibility with Tailwind v4 |
| @nuxtjs/i18n strategy: 'prefix' | Direct equivalent of next-intl locale prefix routing |
| No Pinia, no VueUse | State surface covered by focused composables |
| onMounted guards for all localStorage access | Prevents SSR hydration crash |
| nitro.prerender.routes explicit enumeration | Crawler does not discover programmatically-navigated deck/scenario routes |
| Inlined DECK_IDS/SCENARIO_IDs in nuxt.config.ts | src/data/*.ts use @/types alias unavailable at config eval time |
| langDir set to '../messages' (relative from srcDir app/) | absolute path breaks @nuxtjs/i18n v10 in production |
| Unit Vitest project uses jsdom environment | setup.ts sets window globals, incompatible with node environment |
- [Phase 20]: crawlLinks:false in nitro.prerender prevents Nitro crawler from following bare NuxtLinks that 404 under i18n prefix strategy
- [Phase 20]: SCENARIO_IDS must use Italian IDs (caffe/albergo/...) matching src/data/qa/ barrel — English names from Plan 01 were incorrect
- [Phase 20]: happy-dom must be installed separately — @nuxt/test-utils nuxt environment requires it but does not auto-install
- [Phase 20]: Human verify approved: dev server loads, Tailwind applies, no 404s, no double-prefix in static output
| Phase 21-pure-logic-and-routing-skeleton P01 | 5 | 2 tasks | 1 files |
- [Phase 21-pure-logic-and-routing-skeleton]: Constants inlined in specs/verify-routes.ts — nuxt.config.ts uses TypeScript as const syntax not eval-safe in plain Bun scripts
- [Phase 21-pure-logic-and-routing-skeleton]: Content check applied to all 36 routes (not just 3) in verify-routes.ts to catch silent SSR error pages
| Phase 22-composables P01 | 12 | 2 tasks | 7 files |
- [Phase 22-composables]: app/lib/ holds copies of src/lib/ files — composables import from ~/lib/ only, never from src/
- [Phase 22-composables]: Test wrapper uses defineComponent + setup() returning composable, mounted with mountSuspended from @nuxt/test-utils
| Phase 22-composables P02 | 2 | 2 tasks | 1 files |
- [Phase 22-composables]: progress initialized as ref({}) not ref(loadFromStorage()) — SSR safety, no ReferenceError on server
- [Phase 22-composables]: hasProgress is computed ref — useLevelFilter receives reactive value without explicit watching
| Phase 22-composables P03 | 3 | 2 tasks | 1 files |
- [Phase 22-composables]: useLevelFilter activeLevels null until onMounted — SSR-safe initial state
- [Phase 22-composables]: FLTR-06 guard blocks empty/null setActiveLevels before state mutation and localStorage write
| Phase 22-composables P04 | 1 | 2 tasks | 1 files |
- [Phase 22-composables]: activeLevels plain Level[] (not Ref) — session pages pass .value and snapshot at onMounted
- [Phase 22-composables]: qa_ prefix key format isolates Q&A progress from rephrase keys in shared lang-progress storage
| Phase 22-composables P05 | 5 | 2 tasks | 2 files |
- [Phase 22-composables]: getSpeechRecognition() accesses window without import.meta.client — safe because all call sites are client-only (onMounted or user-triggered)
- [Phase 22-composables]: vi.fn mock constructor requires regular function (not arrow) to support new operator
- [Phase 23-i18n-messages-and-leaf-components]: data-* attribute selectors (data-speaker, data-back, data-locale-switcher, data-reset) used in test stubs — Plan 02 implementations must add these attributes
- [Phase 23-i18n-messages-and-leaf-components]: Per-test dynamic import inside each it() block follows smoke.test.ts established pattern
| Phase 23-i18n-messages-and-leaf-components P02 | 4 | 2 tasks | 5 files |
- [Phase 23-i18n-messages-and-leaf-components]: LANG_LOCALE inlined in AudioButton.vue — single consumer, no shared module needed
- [Phase 23-i18n-messages-and-leaf-components]: LevelFilterChips omits FLTR-06 guard — guard belongs in useLevelFilter (Phase 22)

## Session Continuity

Last stopped: Completed 23-02 (5 leaf Vue components GREEN)
Next action: Phase 23-03 — implement SiteHeader component
