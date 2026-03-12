# Feature Landscape: Nuxt 3 Port (v2.0)

**Domain:** Nuxt 3 port of a Next.js 15 language learning SPA — full feature parity migration
**Researched:** 2026-03-12
**Confidence:** HIGH (codebase read directly; Nuxt 3 patterns confirmed via official docs + community sources)

---

## Context: This Is a Port, Not a Greenfield Build

Every feature below already exists in the v1.3 Next.js codebase (`vue-port` branch baseline from `feat/nextjs-port`). The question is not "what to build" but "how each feature translates to Nuxt 3 patterns." Complexity ratings reflect migration effort, not initial build effort.

**Existing modules that carry over unchanged (pure TypeScript, no React/Next imports):**
- `src/lib/srs.ts` — `advanceBox`, `isCardDue`, `getCardKey` (pure functions, zero framework dependency)
- `src/lib/generateChoices.ts` — Fisher-Yates distractor generation (pure function)
- `src/data/**` — all card/scenario TypeScript data modules (zero framework dependency)
- `src/types/index.ts` — `Card`, `Deck`, `QACard`, `Scenario`, `ProgressRecord`, `Lang`, `Level` types

These files can be copied into the Nuxt project with no modifications. All migration effort is in hooks → composables, routing, i18n wiring, and SSR-bypass patterns.

---

## Table Stakes

Features that must reach full parity for the port to be shippable. Each is already working in Next.js; migration complexity is the only variable.

| Feature | Next.js Pattern | Nuxt 3 Equivalent | Migration Complexity | Notes |
|---------|----------------|-------------------|---------------------|-------|
| Leitner SRS composable (`useSRS`) | `useState` + `useCallback` React hook, `'use client'` guard | `ref` + plain function inside `composables/useSRS.ts`; `onMounted` for localStorage init | LOW | `useState` → `ref`, `useCallback` → plain function (Vue reactivity tracks dependencies automatically), `typeof window === 'undefined'` guard → `onMounted` or `import.meta.client` |
| Level filter composable (`useLevelFilter`) | `useState` + `useCallback` React hook, `'use client'` guard | `ref` + plain functions inside `composables/useLevelFilter.ts` | LOW | Same hook-to-composable pattern as `useSRS`; FLTR-06 guard logic is framework-agnostic and carries over verbatim |
| Q&A SRS composable (`useQASRS`) | `useState` + `useCallback` + `useMemo` React hook | `ref` + `computed` inside `composables/useQASRS.ts` | LOW | `useMemo` → `computed()`; all other patterns same as `useSRS` migration |
| Voice recognition composable (`useVoiceRecognition`) | `useState` + `useRef` + `useCallback` + `useEffect` | `ref` + `readonly ref` + plain functions + `onMounted` inside `composables/useVoiceRecognition.ts` | LOW | `useRef` → `ref` (Vue refs work for both DOM and mutable values); `useEffect(fn, [])` → `onMounted(fn)`; Web Speech API check on `onMounted` |
| localStorage persistence (SRS + level filter) | `typeof window === 'undefined'` guard in hook init; `'use client'` prevents SSR | `onMounted` or `import.meta.client` guard; no `'use client'` needed in Nuxt composables | LOW | Vue composables do not have a `'use client'` concept; instead guard localStorage calls with `import.meta.client` or defer to `onMounted` |
| i18n: Italian + Spanish UI strings | `next-intl`: `useTranslations('page')` → `t('title')`; `NextIntlClientProvider` in layout; `getMessages()` + `setRequestLocale()` server-side | `@nuxtjs/i18n`: `const { t } = useI18n()` → `t('page.title')`; module auto-provides locale in all components; no provider wrapper needed | MEDIUM | Key path syntax differs: next-intl uses scoped `useTranslations('namespace')` per component; @nuxtjs/i18n uses flat `t('namespace.key')` from a single `useI18n()` call. Message JSON files need key path adjustments. |
| i18n: locale routing | `next-intl` `defineRouting({ locales, defaultLocale })`; `generateStaticParams` for `[lang]` in `layout.tsx` | `@nuxtjs/i18n` `strategy: 'prefix'` in `nuxt.config.ts`; module auto-generates locale-prefixed routes | MEDIUM | The `[lang]` dynamic segment in `pages/` is replaced by i18n module's built-in prefix routing. Route files become `pages/index.vue`, `pages/rephrase/index.vue`, etc. — the module injects `/it/` and `/es/` prefixes automatically. |
| File routing: Activity Picker at `/[lang]` | `src/app/[lang]/page.tsx` — client component with `useParams()` | `pages/index.vue` — `useI18n().locale` provides current lang; no route param needed | LOW | With `strategy: 'prefix'`, the locale is available via `useI18n().locale` rather than a route param. |
| File routing: Rephrase deck browser at `/[lang]/rephrase` | `src/app/[lang]/rephrase/page.tsx` | `pages/rephrase/index.vue` | LOW | Direct mapping; i18n module prefixes the URL automatically |
| File routing: Rephrase study session at `/[lang]/rephrase/[deck]` | `src/app/[lang]/rephrase/[deck]/page.tsx` server component + `StudySessionNoSSR` client wrapper | `pages/rephrase/[deck].vue` with `<ClientOnly>` wrapper for localStorage/audio content | MEDIUM | The server-component + NoSSR-wrapper two-file pattern in Next.js collapses to one `.vue` file with `<ClientOnly>` in Nuxt |
| File routing: Q&A scenario browser at `/[lang]/qa` | `src/app/[lang]/qa/page.tsx` | `pages/qa/index.vue` | LOW | Direct mapping |
| File routing: Q&A study session at `/[lang]/qa/[scenario]` | `src/app/[lang]/qa/[scenario]/page.tsx` server component + `QAStudySessionNoSSR` client wrapper | `pages/qa/[scenario].vue` with `<ClientOnly>` | MEDIUM | Same two-file collapse as rephrase session |
| SSR bypass for Web Speech API + localStorage components | `next/dynamic(() => import('./Component'), { ssr: false })` wrapping study sessions | `<ClientOnly>` component wrapping session content in `.vue` page file | LOW | `<ClientOnly>` is Nuxt's built-in equivalent; no dynamic import boilerplate needed |
| Static prerender: all lang × deck routes | `generateStaticParams()` exported from `[deck]/page.tsx` returning all lang×deck combos | `nitro.prerender.routes` array in `nuxt.config.ts` listing all `/it/rephrase/daily`, `/es/rephrase/daily`, etc. | MEDIUM | Next.js uses per-file `generateStaticParams()`; Nuxt centralizes prerender routes in config. With `@nuxtjs/i18n` + `strategy: 'prefix'`, the i18n module can auto-generate locale-prefixed routes — verify with current module docs before relying on this. |
| Static prerender: all lang × scenario routes | `generateStaticParams()` from `[scenario]/page.tsx` | Same `nitro.prerender.routes` approach, listing all `/it/qa/caffe`, `/es/qa/caffe`, etc. | MEDIUM | Same as deck route prerendering |
| Static export for Hostinger deployment | `output: 'export'` + `trailingSlash: true` in `next.config.ts` | `nuxt generate` command; `nitro.prerender.autoSubfolderIndex: true` (default) for `index.html` subfolder format | LOW | `nuxt generate` produces `.output/public/` as a fully static directory; Hostinger serves it the same way as Next.js static export |
| Due-count badges reactive to level filter | `getDueCount()` computed inline in `DeckGrid` component using `isCardDueForDeck` + `activeLevels` props | `computed(() => getDueCount(...))` in `<script setup>` of `DeckGrid.vue` using composable-returned values | LOW | Vue `computed` is the direct equivalent of React's inline memoized calculations; reactivity is automatic |
| Rephrase flashcard SRS interaction (flip, grade, advance) | `StudySession.tsx` client component | `StudySession.vue` with `<script setup>` + `useSRS` composable | LOW | Component logic is nearly 1:1; event handlers become Vue `@click` handlers |
| Q&A 4-choice interaction with TTS + voice | `QAStudySession.tsx` client component using `useQASRS`, `useVoiceRecognition`, Web Speech API | `QAStudySession.vue` with `<script setup>` + `useQASRS` + `useVoiceRecognition` composables | LOW | Same interaction model; Vue template replaces JSX |
| Language switcher / SiteHeader | `SiteHeader.tsx` using next-intl `useRouter` + `usePathname` for locale switching | `SiteHeader.vue` using `useI18n().setLocale()` or `useLocalePath()` from `@nuxtjs/i18n` | MEDIUM | Locale switching API differs significantly: next-intl uses `router.replace(pathname, { locale })` while @nuxtjs/i18n uses `setLocale(code)` or locale-aware `<NuxtLink>` |
| Level filter chips (A1/A2, FLTR-06 guard) | `LevelFilterChips.tsx` receiving `activeLevels` + `setActiveLevels` as props | `LevelFilterChips.vue` with same prop interface via `defineProps` + `defineEmits` | LOW | Component logic is framework-agnostic; replace JSX with Vue template, React props with `defineProps` |
| Activity Picker screen | `ActivityPicker.tsx` with navigation links | `ActivityPicker.vue` with `<NuxtLink>` replacing `<Link>` from next/link | LOW | Structural 1:1 replacement |
| Scenario browser with due-count badges | `ScenarioGrid.tsx` computing due counts per scenario | `ScenarioGrid.vue` with `computed` due counts | LOW | Same pattern as DeckGrid migration |

---

## Differentiators

Nuxt 3 patterns that improve on or simplify the Next.js implementation.

| Feature | Next.js Limitation | Nuxt 3 Improvement | Complexity | Notes |
|---------|-------------------|--------------------|------------|-------|
| Auto-import composables | Hooks must be explicitly imported in every component | Composables in `composables/` directory are auto-imported by Nuxt | LOW (benefit) | No import statements needed for `useSRS`, `useLevelFilter`, etc. in `.vue` files |
| Single-file components | JSX mixes template + logic; server/client split requires separate files (e.g., `StudySessionNoSSR.tsx`) | `.vue` SFC collapses server/client split into one file using `<ClientOnly>` | LOW (benefit) | Eliminates the `*NoSSR.tsx` wrapper file pattern entirely |
| `useI18n().locale` replaces `useParams()` | Locale must be read from route params and threaded as prop through component tree | `useI18n().locale` is globally available in any component; no prop drilling | LOW (benefit) | Simplifies `lang` prop passing throughout the component tree |
| VueUse `useLocalStorage` composable (optional) | localStorage guards (`typeof window`, `'use client'`) must be hand-rolled | VueUse's `useLocalStorage` with `initOnMounted: true` handles SSR hydration automatically | LOW (optional) | MEDIUM confidence — VueUse is a well-known library but verify hydration behavior matches project requirements before adopting |
| Nuxt DevTools | No built-in DevTools in Next.js for composable state inspection | Nuxt DevTools provides composable state visualization in browser | LOW (benefit) | Debugging `useSRS` progress state and `useLevelFilter` becomes easier |

---

## Anti-Features

Patterns from Next.js that do NOT have a direct equivalent in Nuxt 3 and should not be replicated.

| Anti-Feature | Why It Exists in Next.js | Why Not in Nuxt 3 | What to Do Instead |
|--------------|--------------------------|-------------------|-------------------|
| `'use client'` directive on composable files | React Server Components require explicit opt-in to client execution | Vue composables run on client by default; no directive exists or is needed | Simply omit the directive; composable files in `composables/` are always client-capable |
| `*NoSSR.tsx` wrapper files (`StudySessionNoSSR.tsx`, `QAStudySessionNoSSR.tsx`) | Next.js dynamic import with `ssr: false` requires a separate wrapper component to avoid circular imports | Nuxt `<ClientOnly>` wraps content inline in the same `.vue` file | Use `<ClientOnly>` tag in `pages/rephrase/[deck].vue` directly; delete the wrapper file pattern |
| `generateStaticParams()` export per page file | Next.js App Router requires per-file static param declarations | Nuxt centralizes route prerendering in `nuxt.config.ts` `nitro.prerender.routes` | List all prerender paths in `nuxt.config.ts` once; do not recreate per-file param exports |
| `NextIntlClientProvider` in layout | next-intl requires explicit message hydration via a provider component | `@nuxtjs/i18n` injects i18n globally via the Nuxt module system | Do not add a provider component; the module handles everything |
| `setRequestLocale(lang)` in every server component | next-intl requires manual locale context injection in RSC | `@nuxtjs/i18n` with `strategy: 'prefix'` sets locale context automatically from the URL | Do not replicate `setRequestLocale` calls; the module handles it |
| `getMessages()` server-side message loading | next-intl's server/client message hydration bridge | @nuxtjs/i18n loads messages automatically per locale | Do not replicate; messages are available in all components automatically |
| React `useParams()` for locale extraction | Next.js App Router exposes params via hook | Locale is available via `useI18n().locale.value` | Use `useI18n().locale.value` cast to `Lang` type; never read `[lang]` as a dynamic route param |
| `'use client'` at top of page files | Required for any React hook usage in Next.js App Router pages | Vue pages always run in browser context; `<script setup>` composables are browser-safe | No equivalent needed in Nuxt pages |

---

## Feature Dependencies

```
[Pure TS libs: srs.ts, generateChoices.ts, types]
    └──required by──> [useSRS composable]
    └──required by──> [useQASRS composable]
    └──required by──> [useLevelFilter composable]
                           └──required by──> [LevelFilterChips.vue]
                           └──required by──> [DeckGrid.vue due-count badges]
                           └──required by──> [ScenarioGrid.vue due-count badges]

[Web Speech API (browser-native)]
    └──required by──> [useVoiceRecognition composable]
    └──required by──> [AudioButton.vue TTS]
    Both require: <ClientOnly> wrapper or import.meta.client guard

[@nuxtjs/i18n module setup]
    └──required by──> [locale routing (/it/, /es/ prefixes)]
    └──required by──> [useI18n() in all components]
    └──required by──> [SiteHeader locale switcher]

[nitro.prerender.routes in nuxt.config.ts]
    └──required by──> [static export of /it/rephrase/daily, /es/qa/caffe, etc.]
    └──depends on──> [DECK_IDS list from src/data/decks.ts]
    └──depends on──> [scenario IDs list from src/data/qa/index.ts]

[useSRS composable]
    └──required by──> [StudySession.vue (rephrase)]
    └──required by──> [DeckGrid.vue due-count computation]

[useQASRS composable]
    └──required by──> [QAStudySession.vue]
    └──required by──> [ScenarioGrid.vue due-count computation]

[useVoiceRecognition composable]
    └──required by──> [MicButton.vue]
    └──used by──> [StudySession.vue, QAStudySession.vue]
```

### Dependency Notes

- **Pure TS libs first:** `srs.ts`, `generateChoices.ts`, and `types/index.ts` can be copied verbatim and tested before any Vue component work begins.
- **Composables before components:** All four composables (`useSRS`, `useLevelFilter`, `useQASRS`, `useVoiceRecognition`) should be migrated and unit-tested before building components that depend on them.
- **i18n module before routing:** `@nuxtjs/i18n` must be configured before page routes are built, because locale-aware `<NuxtLink>` hrefs and `useI18n().locale` depend on it.
- **`<ClientOnly>` required for study sessions:** Both `StudySession.vue` and `QAStudySession.vue` access localStorage (via `useSRS`/`useQASRS`) and Web Speech API (via `useVoiceRecognition`). These must be wrapped in `<ClientOnly>` or the page component must guard with `import.meta.client`.
- **Prerender routes depend on data:** The `nitro.prerender.routes` list must be generated from `DECK_IDS` and scenario IDs — ideally as a computed array in `nuxt.config.ts` rather than a hand-typed list, to stay in sync with data changes.
- **`qa_` prefix SRS key contract:** `useQASRS` uses `qa_{scenarioId}_{cardId}` keys in the same `{lang}-progress` localStorage entry as `useSRS`. This must be preserved exactly to avoid progress collisions between Rephrase and Q&A.

---

## Next.js → Nuxt 3 Pattern Mapping Reference

### React Hooks → Vue Composables

| React Pattern | Vue/Nuxt Equivalent | Notes |
|--------------|---------------------|-------|
| `useState<T>(initialValue)` | `ref<T>(initialValue)` | Access value with `.value` in `<script setup>` |
| `useState<T>(() => expensiveInit())` | `const x = ref<T>(expensiveInit())` (called once at composable creation) | Vue composables are called once; no lazy init function needed |
| `useCallback(fn, [deps])` | Plain function; Vue tracks reactive deps automatically | No memoization needed for simple state mutators |
| `useMemo(() => compute(), [deps])` | `computed(() => compute())` | Deps are inferred automatically from reactive refs accessed inside |
| `useEffect(fn, [])` (run once on mount) | `onMounted(fn)` | Exact equivalent |
| `useEffect(fn, [dep])` (watch a dep) | `watch(dep, fn)` or `watchEffect(fn)` | `watchEffect` auto-tracks; `watch` for explicit source |
| `useRef<T>(null)` (mutable container) | `ref<T>(null)` | Same; access via `.value` |
| `useParams<{ lang: string }>()` | `useI18n().locale.value` (for locale) or `useRoute().params.deck` (for other params) | Locale param specifically should use i18n composable |

### next-intl → @nuxtjs/i18n

| next-intl Pattern | @nuxtjs/i18n Equivalent | Notes |
|-------------------|------------------------|-------|
| `import { useTranslations } from 'next-intl'` | Auto-imported; no import needed | `useI18n` is globally available |
| `const t = useTranslations('page')` | `const { t } = useI18n()` | Namespace is part of the key path |
| `t('title')` (scoped to 'page') | `t('page.title')` | Full dotted key path in @nuxtjs/i18n |
| `NextIntlClientProvider messages={messages}` in layout | Not needed — module handles hydration | Delete the provider component entirely |
| `setRequestLocale(lang)` in server component | Not needed — module sets locale from URL automatically | Delete these calls |
| `getMessages()` in server layout | Not needed | Module loads messages automatically |
| `defineRouting({ locales, defaultLocale })` | `i18n: { locales: ['it','es'], defaultLocale: 'it', strategy: 'prefix' }` in `nuxt.config.ts` | Centralized in config, not a separate routing file |
| `hasLocale(locales, requested)` locale validation | Module validates locale and redirects automatically | No manual validation needed in pages |
| `messages/it.json`, `messages/es.json` | Same file structure — @nuxtjs/i18n reads from same paths | KEY PATH FORMAT may need adjustment: verify flat vs nested structure |

### Next.js App Router → Nuxt pages/

| Next.js Path | Nuxt Path | Notes |
|-------------|-----------|-------|
| `src/app/page.tsx` (root redirect) | `pages/index.vue` | Redirect to default locale |
| `src/app/[lang]/layout.tsx` | Not needed — i18n module handles locale layout | Delete; use `layouts/default.vue` for shared layout |
| `src/app/[lang]/page.tsx` | `pages/index.vue` | Locale prefix added by i18n module |
| `src/app/[lang]/rephrase/page.tsx` | `pages/rephrase/index.vue` | |
| `src/app/[lang]/rephrase/[deck]/page.tsx` | `pages/rephrase/[deck].vue` | |
| `src/app/[lang]/qa/page.tsx` | `pages/qa/index.vue` | |
| `src/app/[lang]/qa/[scenario]/page.tsx` | `pages/qa/[scenario].vue` | |
| `src/app/[lang]/*/layout.tsx` | `layouts/default.vue` or named layouts | Nuxt layouts are separate from pages |

### SSR Bypass Equivalents

| Next.js Pattern | Nuxt 3 Equivalent | Confidence |
|----------------|-------------------|------------|
| `dynamic(() => import('./Component'), { ssr: false })` | `<ClientOnly>` component wrapping the content | HIGH |
| `if (typeof window === 'undefined') return {}` | `if (!import.meta.client) return {}` or defer to `onMounted` | HIGH |
| `'use client'` directive | Not needed in Nuxt; Vue composables run on client | HIGH |

### Static Route Generation

| Next.js Pattern | Nuxt 3 Equivalent | Confidence |
|----------------|-------------------|------------|
| `export function generateStaticParams()` in page file | `nitro: { prerender: { routes: [...] } }` in `nuxt.config.ts` | HIGH |
| Called per-file, returning array of param objects | Called once globally, listing full URL strings | HIGH |
| `routing.locales.flatMap(lang => DECK_IDS.map(deck => ({ lang, deck })))` | `['it','es'].flatMap(lang => DECK_IDS.map(deck => \`/${lang}/rephrase/${deck}\`))` | HIGH |
| `output: 'export'` in `next.config.ts` | `nuxt generate` command (no config equivalent needed) | HIGH |
| `trailingSlash: true` in `next.config.ts` | `nitro.prerender.autoSubfolderIndex: true` (this is the default) | MEDIUM |

---

## MVP Definition

### Required for Feature Parity (all phases)

All features in the Table Stakes table are required. The port is not shippable until every existing v1.3 feature works. Priority order for implementation:

1. **Project scaffold** — Nuxt 3 + TypeScript + Tailwind v4 + @nuxtjs/i18n configured, static export working, dev server running
2. **Pure TS lib copies** — `srs.ts`, `generateChoices.ts`, `types/index.ts`, all data modules copied verbatim; unit tests pass
3. **Composables** — `useSRS`, `useLevelFilter`, `useQASRS`, `useVoiceRecognition` migrated to Vue; unit tests pass
4. **i18n messages** — `messages/it.json`, `messages/es.json` adjusted for @nuxtjs/i18n key path format; verified in browser
5. **Routing + pages** — All six page routes created; navigation works; locale prefix applied
6. **Leaf components** — `FlashCard`, `ChoiceButton`, `AudioButton`, `LevelFilterChips`, `MicButton`, `FeedbackMessage`
7. **Screen components** — `DeckGrid`, `ScenarioGrid`, `ActivityPicker`, `StudySession`, `QAStudySession`
8. **Static prerender** — `nitro.prerender.routes` covering all 16 rephrase paths + 14 QA paths + locale roots
9. **Deployment** — `nuxt generate`, verify `.output/public/` structure, deploy to Hostinger

### Defer

- VueUse `useLocalStorage` adoption (optional DX improvement; only if hydration issues arise)
- Nuxt Content or CMS integration (out of scope per PROJECT.md)
- B1/B2 content (out of scope per PROJECT.md)

---

## Open Questions / Confidence Gaps

| Question | Confidence | Why It Matters |
|----------|------------|----------------|
| Does `@nuxtjs/i18n` with `strategy: 'prefix'` auto-generate prerender routes for dynamic `[deck]` and `[scenario]` segments, or must they be listed in `nitro.prerender.routes` manually? | MEDIUM | If auto-generation works, the prerender config is minimal; if not, all 30 paths must be listed explicitly |
| Does `@nuxtjs/i18n` v9 use flat key paths (`t('page.title')`) or scoped namespaces compatible with existing `messages/it.json` structure? | MEDIUM | Message JSON may need restructuring before i18n works |
| Does `nuxt generate` + `nitro.prerender.autoSubfolderIndex: true` produce `/{lang}/rephrase/{deck}/index.html` format that Hostinger serves correctly? | MEDIUM | Trailing slash behavior on Hostinger determined `trailingSlash: true` in Next.js; Nuxt equivalent must be verified |
| Can `useVoiceRecognition` work inside `<ClientOnly>` without hydration mismatch on `isSupported` state? | MEDIUM | `isSupported` starts `false` on server (no window), becomes `true` on client — ensure UI doesn't flash wrong state |

---

## Sources

- PuroLingua v1.3 source (`vue-port` branch baseline): `src/hooks/`, `src/app/`, `src/i18n/`, `src/components/` — read directly (HIGH confidence)
- `PROJECT.md` — v2.0 active requirements read directly (HIGH confidence)
- Nuxt 3 official docs — `useRoute`, prerendering, `<ClientOnly>` via WebSearch (MEDIUM confidence — WebFetch unavailable, verified from multiple concordant sources)
- `@nuxtjs/i18n` docs — `useI18n`, routing strategies, composables via WebSearch (MEDIUM confidence — multiple concordant sources)
- Vue 3 Composition API — `ref`, `computed`, `onMounted`, `watch` patterns via WebSearch (HIGH confidence — stable, well-documented)
- "Vue Composition API and React Hooks comparison" — DEV Community article (MEDIUM confidence — corroborates training knowledge)

---
*Feature research for: Nuxt 3 port of PuroLingua v1.3 Next.js app*
*Researched: 2026-03-12*
