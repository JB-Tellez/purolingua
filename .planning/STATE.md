---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Vue Port
status: planning
last_updated: "2026-03-12T23:07:27.693Z"
last_activity: 2026-03-12 — Roadmap created for v2.0 Vue Port
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v2.0 milestone started)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Phase 20 — Nuxt 4 project scaffold

## Current Position

Phase: 20 — Scaffold (in progress, plan 01 complete)
Plan: 01 done; Plan 02 next
Status: In Progress

```
v2.0 Progress: [█████░░░░░] 50% (plan 01/02 in phase 20)
```

Last activity: 2026-03-12 — Completed 20-01 (Nuxt 4 scaffold: toolchain installed, configs written, 21 unit tests passing)

## Performance Metrics

- Phases complete: 0/7
- Plans complete: 1/TBD (phase 20: 1/2)
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

## Session Continuity

Last stopped: Completed 20-01 (Nuxt 4 scaffold toolchain)
Next action: Run plan 02 — create app/pages/ placeholder routes (index, rephrase/index, rephrase/[deck], qa/index, qa/[scenario]) and verify smoke test passes with --project nuxt.
