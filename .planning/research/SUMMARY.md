# Project Research Summary

**Project:** PuroLingua v2.0 — Nuxt 4 Vue Port
**Domain:** Framework port — Next.js 15 + React to Nuxt 4 + Vue 3 (static-export language learning SPA)
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

PuroLingua v2.0 is a mechanical port of an existing, fully-featured Next.js 15 application to Nuxt 4 + Vue 3. This is not a greenfield build — every feature already works in the current codebase. The migration scope is strictly the framework layer: React hooks become Vue composables, Next.js App Router becomes Nuxt pages, next-intl becomes @nuxtjs/i18n, and `next/dynamic ssr:false` becomes `<ClientOnly>`. The core logic — Leitner SRS, choice generation, all card data, localStorage key contracts, and Web Speech API usage — is preserved unchanged and transfers with zero code modifications.

The recommended approach is Nuxt 4 (not v3) because Nuxt 3 reaches EOL in July 2026. The stack is minimal: Nuxt 4 + TypeScript (zero-config), @nuxtjs/i18n v10 for locale routing, Tailwind v4 via the @tailwindcss/vite Vite plugin (never the @nuxtjs/tailwindcss module, which is incompatible with v4), and @nuxt/test-utils for component testing. No Pinia, no VueUse, no additional dependencies. The existing Vitest tests for pure SRS/data logic carry over without modification.

The primary risks are concentrated in two areas: SSR/hydration (localStorage and Web Speech API must be guarded with `onMounted` or `<ClientOnly>` — not `process.client`) and i18n routing (page files must NOT include a `[lang]` dynamic segment when @nuxtjs/i18n is handling locale prefixes, or URLs double-prefix to `/it/it/...`). Both risks are well-documented and have clear prevention strategies. The migration can be executed in 10 sequential phases with low-to-medium complexity throughout, producing a fully parity-compliant static export for Hostinger deployment.

## Key Findings

### Recommended Stack

Nuxt 4 is the correct starting point — v3 EOL is July 2026. The framework swap is a soft upgrade with the same module ecosystem. Nuxt 4 generates `.output/public/` via `nuxi generate` as the direct equivalent of Next.js `out/` via `next build` with `output: 'export'`. TypeScript is zero-config: Nuxt generates `.nuxt/tsconfig.json` on first build and the root `tsconfig.json` should only extend it.

The Tailwind v4 integration via `@tailwindcss/vite` is identical to the current Next.js stack. The @nuxtjs/tailwindcss module has a confirmed open incompatibility issue with Tailwind v4 and must be avoided entirely. The testing strategy splits cleanly: pure logic (SRS, data, types) uses plain Vitest with no Nuxt runtime; Vue components and composables use `mountSuspended` from @nuxt/test-utils.

**Core technologies:**
- **Nuxt 4 (^4.4.2):** App framework + SSG via `nuxi generate` — Nuxt 3 EOL July 2026; v4 is a drop-in upgrade with same module ecosystem and `app/` directory convention
- **@nuxtjs/i18n (^10.2.3):** Locale routing + UI string translation — direct equivalent of next-intl; auto-generates `/it/` and `/es/` prefixed routes for static export
- **tailwindcss (^4.1.x) + @tailwindcss/vite:** Utility CSS — matches existing stack exactly; Vite plugin is the only supported path for Tailwind v4 in Nuxt
- **Vitest (^3.x) + @nuxt/test-utils (^4.0.0):** Unit + component testing — existing Vitest tests for pure logic carry over; `mountSuspended` added for Vue/Nuxt composable testing

### Expected Features

This port has no new features — full parity with v1.3 is the only target. Every feature below already works in Next.js; migration complexity (not build effort) is the only variable.

**Must have (table stakes — full parity required before ship):**
- Leitner SRS composable (useSRS) with localStorage persistence — LOW migration complexity
- Level filter composable (useLevelFilter) with FLTR-06 guard — LOW complexity
- Q&A SRS composable (useQASRS) — LOW complexity
- Voice recognition composable (useVoiceRecognition) — LOW complexity; `<ClientOnly>` required
- i18n routing: Italian + Spanish, locale-prefixed URLs — MEDIUM complexity; key path format changes between next-intl and @nuxtjs/i18n
- File routing: all 6 page routes (root, activity picker, rephrase browser, rephrase session, QA browser, QA session) — LOW-MEDIUM complexity
- Static prerender: all locale x deck + locale x scenario route combinations — MEDIUM complexity
- Static export for Hostinger deployment (`nuxi generate` to `.output/public/`) — LOW complexity

**Differentiators (Nuxt improvements over Next.js):**
- Auto-imported composables — no import statements needed for `useSRS`, `useLevelFilter`, etc. in `.vue` files
- `<ClientOnly>` collapses the two-file `*NoSSR.tsx` wrapper pattern into one `.vue` file
- `useI18n().locale` replaces `useParams()` — no prop drilling of `lang` through component tree
- Nuxt DevTools for composable state inspection during development

**Defer:**
- VueUse `useLocalStorage` adoption (optional; only if hydration issues arise)
- B1/B2 content (explicitly out of scope per PROJECT.md)

### Architecture Approach

The architecture is a direct structural translation from Next.js App Router conventions to Nuxt pages. All state lives in localStorage; no server is involved at runtime. The composable layer is self-contained — each composable reads its own localStorage slice with no shared Context/Provider pattern, which maps cleanly to Vue composables. The key structural changes are: `[lang]` dynamic segment removed from page paths (handled by @nuxtjs/i18n prefix strategy), `*NoSSR.tsx` wrapper files replaced by `<ClientOnly>` inline, and `generateStaticParams()` per-file replaced by `nitro.prerender.routes` centralized in `nuxt.config.ts`.

**Major components:**
1. **Pure TS libs (srs.ts, generateChoices.ts, types, data)** — copied verbatim; zero framework dependency; existing Vitest tests pass unchanged
2. **Composables (useSRS, useLevelFilter, useQASRS, useVoiceRecognition)** — React hook primitives swapped for Vue equivalents; `onMounted` guards all localStorage and Speech API access
3. **Page components (6 pages)** — Nuxt file-based routing with @nuxtjs/i18n locale prefix injection; `<ClientOnly>` wraps study session pages
4. **Leaf UI components (ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips)** — TSX to Vue SFC; callback props become emits
5. **Screen components (StudySession, QAStudySession, DeckGrid, ScenarioGrid, ActivityPicker)** — `useMemo` becomes `computed`; `useState` snapshot becomes `ref` in `onMounted`
6. **Layout + SiteHeader** — `NextIntlClientProvider` removed; `useLocalePath()` replaces manual `/${lang}/` href construction throughout

### Critical Pitfalls

1. **SSR hydration crash from localStorage/Web Speech API at setup time** — Move ALL localStorage reads and SpeechRecognition instantiation inside `onMounted`. Wrap study session pages in `<ClientOnly>`. Use `import.meta.client` (not `process.client`) for any module-level guards. Detection signals: `ReferenceError: localStorage is not defined` in `nuxi generate` build log, or `[Vue warn]: Hydration node mismatch` in browser console after serving static output.

2. **@nuxtjs/tailwindcss module incompatible with Tailwind v4** — Never add `@nuxtjs/tailwindcss` to the modules array. Register `@tailwindcss/vite` in `vite.plugins` and `@import "tailwindcss"` in global CSS. Confirmed broken in two upstream issue trackers (nuxt-modules/tailwindcss #978, tailwindlabs/tailwindcss discussion #16236).

3. **Dynamic deck/scenario routes not prerendered — 404 on Hostinger** — Explicitly enumerate all `/it/rephrase/{deck}` and `/es/qa/{scenario}` paths in `nitro.prerender.routes`. The Nitro crawler alone will not discover programmatically-navigated routes. Verify `.output/public/` tree completeness after every `nuxi generate`.

4. **i18n routing double-prefix when [lang] page segment used alongside @nuxtjs/i18n** — Page files must live at `pages/rephrase/[deck].vue`, not `pages/[lang]/rephrase/[deck].vue`. The i18n module injects locale prefixes automatically with `strategy: 'prefix'`. Using both mechanisms together produces `/it/it/rephrase/daily`.

5. **computed for dueCards inside StudySession causes mid-session card skipping** — Snapshot `dueCards` once in `onMounted` using `ref(computeDueCards())`. Never derive it as a Vue `computed` — reactive recomputation as `progress.value` updates during a session will skip cards or end sessions prematurely.

## Implications for Roadmap

Based on combined research, the 10-phase dependency chain from ARCHITECTURE.md is the correct build order. Pure logic first, framework scaffolding second, composables third, pages and components leaf-to-root, integration validation last.

### Phase 1: Nuxt 4 Project Scaffold
**Rationale:** Nothing can be built until the framework, Tailwind, i18n, and static export are configured and verified. The five pitfalls related to scaffold configuration must all be preempted before any feature code is written. Establishes the patterns every subsequent phase will follow.
**Delivers:** Running dev server; `nuxi generate` producing `.output/public/`; TypeScript working (`tsconfig.json` extending `.nuxt/tsconfig.json` only); Tailwind v4 styles applied via Vite plugin; @nuxtjs/i18n configured with `strategy: 'prefix'`; no `[lang]` page segments; trailing slash config matching Hostinger requirements.
**Avoids:** Tailwind v4 module conflict (Pitfall 2), tsconfig paths override (Pitfall 5), composable name collisions (Pitfall 6), i18n routing double-prefix (Pitfall 4).

### Phase 2: Pure Logic Copy + Routing Skeleton
**Rationale:** Pure TS files copy verbatim and existing Vitest tests verify correctness immediately. Routing skeleton verifies prerender coverage early — before study session logic is added — so 404s surface in development rather than in production.
**Delivers:** All pure TS libs (srs.ts, generateChoices.ts, types, all data modules) in place with existing tests passing. All 6 page routes with placeholder templates. `nitro.prerender.routes` covering all locale x deck and locale x scenario combinations. `.output/public/` tree verified complete against expected route list.
**Avoids:** Dynamic route prerender gaps (Pitfall 3); routes working in dev but 404-ing on deploy.

### Phase 3: Composables Port
**Rationale:** Components cannot be built until the composables they depend on are migrated and unit-tested. All four composables share the same React-to-Vue primitive mapping; porting them together establishes consistent patterns across the codebase before any component work begins.
**Delivers:** useSRS, useLevelFilter, useQASRS, useVoiceRecognition ported to Vue. Unit tests updated for `mountSuspended`. All localStorage reads in `onMounted`. `import.meta.client` guards established. `qa_`-prefixed SRS key contract preserved exactly.
**Avoids:** SSR hydration crash (Pitfall 1), module-level ref singleton bleed (Pitfall 7), `process.client` not tree-shaken (Pitfall 10), top-level await without Suspense (Pitfall 9).

### Phase 4: i18n Messages + SiteHeader
**Rationale:** i18n key paths differ between next-intl (scoped namespace `t('title')`) and @nuxtjs/i18n (dotted full path `t('ns.title')`). Messages must be verified in browser before building any component that calls `t()`. SiteHeader locale switcher is the most i18n-complex component and serves as integration proof.
**Delivers:** `i18n/locales/it.json` and `es.json` adjusted for dotted key path format. SiteHeader.vue with working locale switcher using `useI18n().setLocale()` or `useLocalePath()`. Locale switching verified in static output (not just dev server).
**Avoids:** Locale message 404s in static output (Pitfall 4, Failure 4); locale switcher navigation bypassing i18n prefix (Pitfall 4, Failure 3).

### Phase 5: Primitive UI Components
**Rationale:** Leaf components (ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips) have no composable dependencies and can be built independently. They unblock screen assembly in later phases.
**Delivers:** All leaf Vue SFCs with `defineProps`/`defineEmits`. TSX-to-SFC conversion complete for all atomic components. Callback props replaced with emits. FLTR-06 guard confirmed in useLevelFilter (parent composable), not in LevelFilterChips.

### Phase 6: Browser Screen Components
**Rationale:** DeckGrid, ScenarioGrid, and ActivityPicker can be assembled once composables and leaf components are available. These are the browsing layer — no `<ClientOnly>` needed — and verify that composable reactive state flows correctly to the UI.
**Delivers:** DeckGrid.vue and ScenarioGrid.vue with reactive `computed` due-count badges. ActivityPicker.vue with `<NuxtLinkLocale>` navigation. `layouts/default.vue` wrapping all pages via `<slot />`.

### Phase 7: Rephrase Study Session
**Rationale:** StudySession is the highest-complexity component, requiring useSRS, useVoiceRecognition, and all leaf components. Must implement the `dueCards` snapshot pattern correctly — this is the most consequential architectural decision in the entire port.
**Delivers:** StudySession.vue with full Leitner flip/grade/advance logic. `<ClientOnly>` wrapping in `pages/rephrase/[deck].vue`. dueCards frozen as `ref` initialized in `onMounted`, not as `computed`.
**Avoids:** Mid-session card skipping from reactive recomputation (Architecture Anti-Pattern 3).

### Phase 8: Q&A Study Session
**Rationale:** QAStudySession follows the same structure as StudySession but uses useQASRS and has TTS + 4-choice interaction. Building it second allows direct reuse of patterns established in Phase 7.
**Delivers:** QAStudySession.vue with `useQASRS`, `useVoiceRecognition`, 4-choice interaction, and TTS. `<ClientOnly>` in `pages/qa/[scenario].vue`. `qa_`-prefixed SRS key contract confirmed preserved in localStorage.

### Phase 9: Static Export Validation + Deployment
**Rationale:** Nothing is shippable until the Hostinger deploy is verified against the full checklist from PITFALLS.md. Dev server (`nuxi dev`) runs SSR and masks every static export failure mode — this phase must use the generated output served over HTTP.
**Delivers:** `nuxi generate` output verified: all routes present, locale messages loading, trailing slash structure correct, no hydration warnings in console, SRS progress persisting across reloads, locale switching producing correct URLs, TypeScript compiling clean.
**Avoids:** All Pitfall 3 and Pitfall 4 failure modes discovered only after Hostinger deploy.

### Phase Ordering Rationale

- Pure TS logic copies before framework code because it establishes the stable foundation and keeps existing tests green throughout the entire migration.
- Composables before components because every screen component depends on at least one composable; building against stubs creates rework.
- i18n messages before screen components because message key path format must be verified before any component calls `t()`.
- Leaf components before screen components because screen assembly requires all leaf components to be present.
- Rephrase study session before Q&A because they share the same session architecture; solving Rephrase correctly makes Q&A a pattern application.
- Static export validation as a dedicated final phase because dev server masks every static-specific failure mode documented in PITFALLS.md.

### Research Flags

Phases that may benefit from targeted research during planning:

- **Phase 1 (Scaffold):** @nuxtjs/i18n v10 + Nuxt 4 compatibility. FEATURES.md research was conducted against Nuxt 3 docs; STACK.md targets Nuxt 4.4.x. Verify @nuxtjs/i18n ^10.2.3 is explicitly tested against Nuxt 4 before scaffold is finalized.
- **Phase 4 (i18n Messages):** Lazy-loaded locale JSON 404 issue (nuxt-modules/i18n #3645). Test locale switching in the Phase 1 smoke test's static output. If locale JSON 404s occur, switch to bundled (non-lazy) locale loading before Phase 4.
- **Phase 9 (Static Export):** Hostinger trailing slash behavior with `nitro.prerender.autoSubfolderIndex`. Verify actual Hostinger file serving behavior against the generated `.output/public/` structure before calling the milestone complete.

Phases with well-documented patterns (research unnecessary):

- **Phase 2 (Pure Logic):** Zero framework dependency; existing Vitest tests are the complete spec.
- **Phase 3 (Composables):** React-to-Vue primitive mapping is 1:1 and fully documented in FEATURES.md and ARCHITECTURE.md with concrete code examples.
- **Phases 5-8 (Components):** Vue SFC patterns are established; the existing Next.js components are the spec.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against official docs and npm; complete nuxt.config.ts skeleton provided with exact version ranges |
| Features | HIGH | All features read directly from v1.3 source code; migration patterns confirmed via Nuxt/Vue official docs and direct source inspection |
| Architecture | HIGH | File-by-file mapping derived from direct source inspection of all `.tsx` files; composable conversion is mechanical and fully documented |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls (SSR hydration, Tailwind, i18n routing) confirmed via upstream GitHub issues and official docs; Hostinger trailing slash behavior is MEDIUM confidence |

**Overall confidence:** HIGH

### Gaps to Address

- **@nuxtjs/i18n v10 + Nuxt 4 compatibility:** The module should work (same ecosystem) but explicit Nuxt 4 compatibility for ^10.2.3 was not verified from an official compatibility matrix. Confirm during Phase 1 scaffold before any i18n work proceeds.
- **Hostinger trailing slash behavior:** Whether `nitro.prerender.autoSubfolderIndex: true` (default) matches the `index.html` subdirectory structure Hostinger expects is MEDIUM confidence, inferred from Next.js behavior. Validate during Phase 9 against a real deploy.
- **nuxt-i18n lazy loading in static export:** Issue #3645 may or may not be resolved in @nuxtjs/i18n v10. Test locale switching in the Phase 1 static output smoke test and switch to bundled loading if 404s occur.
- **crawlLinks coverage for deck/scenario routes:** If deck/scenario pages are only navigated to programmatically (not via `<NuxtLinkLocale>` links visible in the initial HTML), the Nitro crawler will not discover them. Explicit `nitro.prerender.routes` enumeration is the reliable strategy — not reliance on the crawler alone.

## Sources

### Primary (HIGH confidence)
- PuroLingua v1.3 source (`vue-port` branch) — `src/hooks/`, `src/app/`, `src/components/`, `src/data/` — read directly
- [Nuxt 4 Official Docs — TypeScript](https://nuxt.com/docs/4.x/guide/concepts/typescript)
- [Nuxt 4 Official Docs — Prerendering](https://nuxt.com/docs/4.x/getting-started/prerendering)
- [Nuxt 4 Official Docs — Testing](https://nuxt.com/docs/4.x/getting-started/testing)
- [@nuxtjs/i18n Installation Docs](https://i18n.nuxtjs.org/docs/getting-started)
- [Tailwind CSS + Nuxt Official Guide](https://tailwindcss.com/docs/installation/framework-guides/nuxt)
- [Nuxt ClientOnly component](https://nuxt.com/docs/4.x/api/components/client-only)
- [Nuxt State Management](https://nuxt.com/docs/getting-started/state-management/)

### Secondary (MEDIUM confidence)
- [Nuxt 4.0 Announcement Blog](https://nuxt.com/blog/v4) — version history and breaking changes
- [Nuxt EOL Timeline — endoflife.date](https://endoflife.date/nuxt) — Nuxt 3 EOL July 2026 confirmed
- [Tailwind v4 PostCSS plugin error — nuxt-modules/tailwindcss Issue #978](https://github.com/nuxt-modules/tailwindcss/issues/978) — confirmed Tailwind v4 module conflict
- [Cannot start Nuxt with Tailwind v4 — tailwindlabs/tailwindcss Discussion #16236](https://github.com/tailwindlabs/tailwindcss/discussions/16236)
- [Failed to load messages 404 — nuxt-modules/i18n Issue #3645](https://github.com/nuxt-modules/i18n/issues/3645) — lazy locale JSON in static export
- [i18n breaks Nuxt Auto-Import — nuxt-modules/i18n Issue #2483](https://github.com/nuxt-modules/i18n/issues/2483) — composable auto-import collision
- [Hydration mismatch with localStorage — nuxt/nuxt Discussion #25500](https://github.com/nuxt/nuxt/discussions/25500)
- [Nuxt state management with useState — LogRocket Blog](https://blog.logrocket.com/nuxt-state-management-hydration-usestate/) — useState vs ref for SSR

### Tertiary (MEDIUM confidence — unverifiable during research)
- @nuxtjs/i18n ^10.2.3 as current version — confirmed from multiple concordant search results
- Hostinger trailing slash behavior with `nitro.prerender.autoSubfolderIndex` — inferred from Next.js behavior; needs live validation

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
