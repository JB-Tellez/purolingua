# Architecture Patterns

**Domain:** Nuxt 3 port of a Next.js 15 language learning SPA
**Researched:** 2026-03-12

---

## Recommended Architecture

This is a static-export SPA with locale-prefixed URL routing. All state lives in localStorage. No server is involved at runtime. The architecture maps 1:1 from Next.js App Router conventions to Nuxt 3 conventions with well-understood substitutions.

```
pages/
  index.vue                            <- language picker (was app/page.tsx)
  [lang]/
    index.vue                          <- activity picker (was app/[lang]/page.tsx)
    rephrase/
      index.vue                        <- deck browser (was app/[lang]/rephrase/page.tsx)
      [deck].vue                       <- study session host (was app/[lang]/rephrase/[deck]/page.tsx)
    qa/
      index.vue                        <- scenario browser (was app/[lang]/qa/page.tsx)
      [scenario].vue                   <- Q&A session host (was app/[lang]/qa/[scenario]/page.tsx)

layouts/
  default.vue                          <- SiteHeader wrap (was app/[lang]/layout.tsx)

composables/
  useSRS.ts                            <- MODIFIED from hooks/useSRS.ts
  useLevelFilter.ts                    <- MODIFIED from hooks/useLevelFilter.ts
  useQASRS.ts                          <- MODIFIED from hooks/useQASRS.ts
  useVoiceRecognition.ts               <- MODIFIED from hooks/useVoiceRecognition.ts

components/
  SiteHeader.vue                       <- MODIFIED from components/SiteHeader.tsx
  ActivityPicker.vue                   <- MODIFIED from components/ActivityPicker.tsx
  DeckGrid.vue                         <- MODIFIED (was inline in rephrase/page.tsx)
  ScenarioGrid.vue                     <- MODIFIED from components/ScenarioGrid.tsx
  StudySession.vue                     <- MODIFIED from app/[lang]/rephrase/[deck]/StudySession.tsx
  QAStudySession.vue                   <- MODIFIED from app/[lang]/qa/[scenario]/QAStudySession.tsx
  ChoiceButton.vue                     <- MODIFIED from components/ChoiceButton.tsx
  AudioButton.vue                      <- MODIFIED from components/AudioButton.tsx
  LevelFilterChips.vue                 <- MODIFIED from components/LevelFilterChips.tsx
  FeedbackMessage.vue                  <- MODIFIED from components/FeedbackMessage.tsx
  MicButton.vue                        <- MODIFIED from components/MicButton.tsx

lib/                                   <- REUSED AS-IS (pure TS, framework-agnostic)
  srs.ts
  generateChoices.ts

types/
  index.ts                             <- REUSED AS-IS

data/                                  <- REUSED AS-IS
  it/  es/  qa/  decks.ts  deckMap.ts

i18n/
  locales/
    it.json                            <- REUSED (content unchanged; path moves from messages/)
    es.json                            <- REUSED (content unchanged; path moves from messages/)

nuxt.config.ts                         <- NEW (replaces next.config.ts)
app.vue                                <- NEW (Nuxt root: <NuxtLayout><NuxtPage /></NuxtLayout>)
i18n.config.ts                         <- NEW (vue-i18n options)
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `pages/index.vue` | Language picker, links to /it and /es | NuxtLink |
| `pages/[lang]/index.vue` | Activity picker screen | ActivityPicker.vue |
| `pages/[lang]/rephrase/index.vue` | Deck browser, level filter, live due-count badges | DeckGrid.vue, LevelFilterChips.vue, useSRS, useLevelFilter |
| `pages/[lang]/rephrase/[deck].vue` | Rephrase study session host | `<ClientOnly>` + StudySession.vue |
| `pages/[lang]/qa/index.vue` | Scenario browser, level filter, live due-count badges | ScenarioGrid.vue, LevelFilterChips.vue, useSRS, useLevelFilter |
| `pages/[lang]/qa/[scenario].vue` | Q&A study session host | `<ClientOnly>` + QAStudySession.vue |
| `layouts/default.vue` | SiteHeader wrap around all pages | SiteHeader.vue, `<slot />` |
| `StudySession.vue` | Full Rephrase session logic — card flip, choices, voice, feedback | useSRS, useLevelFilter, useVoiceRecognition, AudioButton, ChoiceButton, MicButton, FeedbackMessage |
| `QAStudySession.vue` | Full Q&A session logic — 4-choice, TTS, voice, feedback | useQASRS, useVoiceRecognition, AudioButton, ChoiceButton, MicButton, FeedbackMessage |
| `SiteHeader.vue` | Logo, language switcher dropdown, back button, progress reset | useRoute, useRouter, useI18n |
| `DeckGrid.vue` | Deck tiles with live due-count badges | useSRS, useLevelFilter (via props), NuxtLink |
| `ScenarioGrid.vue` | Scenario tiles with live due-count badges | useQASRS, NuxtLink |
| `LevelFilterChips.vue` | A1/A2 toggle chips — FLTR-06 guard in parent | Props in, emit out |
| `useSRS.ts` | Leitner SRS state for Rephrase decks | localStorage, lib/srs.ts |
| `useLevelFilter.ts` | Active level array + FLTR-06 guard | localStorage |
| `useQASRS.ts` | Leitner SRS state for Q&A scenarios | localStorage, lib/srs.ts |
| `useVoiceRecognition.ts` | Web Speech API wrapper | Browser SpeechRecognition API |

---

## Next.js to Nuxt 3 Mapping

### Pages and Routing

| Next.js App Router | Nuxt 3 pages/ | Notes |
|---|---|---|
| `app/page.tsx` | `pages/index.vue` | Root language picker |
| `app/[lang]/page.tsx` | `pages/[lang]/index.vue` | Activity picker |
| `app/[lang]/rephrase/page.tsx` | `pages/[lang]/rephrase/index.vue` | Deck browser |
| `app/[lang]/rephrase/[deck]/page.tsx` | `pages/[lang]/rephrase/[deck].vue` | Study session host |
| `app/[lang]/qa/page.tsx` | `pages/[lang]/qa/index.vue` | Scenario browser |
| `app/[lang]/qa/[scenario]/page.tsx` | `pages/[lang]/qa/[scenario].vue` | Q&A session host |
| `app/layout.tsx` | `app.vue` | Root HTML shell |
| `app/[lang]/layout.tsx` | `layouts/default.vue` | SiteHeader wrapper |
| `generateStaticParams()` in each layout | `nitro.prerender.crawlLinks: true` | Nitro crawler discovers all NuxtLink hrefs automatically |

Dynamic route params: Next.js uses `useParams<{ lang: string }>()`. Nuxt 3 uses `useRoute().params.lang`. The value is identical — a string — and the cast `as Lang` is unchanged.

### Static Export

**Next.js (next.config.ts):**
```ts
output: 'export'
trailingSlash: true
```

**Nuxt 3 (nuxt.config.ts):**
```ts
nitro: {
  prerender: {
    routes: ['/'],
    crawlLinks: true,
  },
},
routeRules: {
  '/**': { prerender: true },
},
router: {
  trailingSlash: true,
},
```

Run `nuxt generate` instead of `next build`. Output lands in `.output/public/` instead of `out/`. Deploy to Hostinger identically to the current Next.js export.

**Critical constraint:** Do not set `ssr: false` globally in `nuxt.config.ts`. This disables `nuxt generate` prerendering and produces a bare SPA that requires a server to serve. Use `<ClientOnly>` per-component for browser-only content (see SSR bypass section).

### React Hooks to Vue Composables

| Next.js / React | Nuxt 3 / Vue | Notes |
|---|---|---|
| `useState<T>(init)` | `ref<T>(init)` | Replace `from 'react'` import |
| `useCallback(fn, deps)` | Plain function | No dependency array; Vue reactivity tracks automatically |
| `useMemo(fn, deps)` | `computed(() => fn())` | Reactive computed property |
| `useEffect(() => {}, [])` | `onMounted(() => {})` | One-time on-mount side effect |
| `useEffect(() => {}, [dep])` | `watch(dep, () => {})` | Reactive side effect |
| `useRef<T>(null)` | `ref<T>(null)` | Same name, same purpose in Vue |
| `useParams<{ lang: string }>()` | `useRoute().params.lang` | Nuxt auto-imports `useRoute` |
| `useRouter()` + `router.refresh()` | `useRouter()` + `reloadNuxtApp()` | Different refresh API |
| `usePathname()` | `useRoute().path` | |
| `Link href="..."` | `NuxtLink to="..."` | |

The composable function signatures stay identical — same arguments, same return shapes. Only the internals change from React primitives to Vue primitives.

There is no React Context in this codebase. The Next.js port already uses focused hooks with no Context/Provider pattern. Each composable is self-contained and reads its own localStorage slice. This maps directly to Vue composables without modification to the ownership model.

**Concrete example — useSRS internals:**
```ts
// Before (React hooks/useSRS.ts)
const [progress, setProgress] = useState<ProgressRecord>(() => loadFromStorage(lang));
const updateCard = useCallback((deckId, cardIndex, isCorrect) => {
  setProgress(prev => {
    const updated = { ...prev, [key]: advanceBox(prev[key], isCorrect) };
    saveToStorage(lang, updated);
    return updated;
  });
}, [lang]);

// After (Vue composables/useSRS.ts)
const progress = ref<ProgressRecord>({});
onMounted(() => {
  progress.value = loadFromStorage(lang);
});
function updateCard(deckId: DeckId, cardIndex: number, isCorrect: boolean) {
  const key = getCardKey(deckId, cardIndex);
  progress.value = { ...progress.value, [key]: advanceBox(progress.value[key], isCorrect) };
  saveToStorage(lang, progress.value);
}
const hasProgress = computed(() => Object.keys(progress.value).length > 0);
```

`isCardDueForDeck` becomes a plain function that reads `progress.value`. Vue components calling it inside a `computed` or template reactive expression re-evaluate automatically when `progress.value` changes.

### i18n: next-intl to @nuxtjs/i18n

| next-intl | @nuxtjs/i18n | Notes |
|---|---|---|
| `useTranslations('page')` then `t('title')` | `const { t } = useI18n()` then `t('page.title')` | Key path is dot-notation flat string in @nuxtjs/i18n |
| `NextIntlClientProvider messages={messages}` | No component needed | Module handles message injection automatically |
| `getRequestConfig()` in `src/i18n/request.ts` | `i18n.locales` + JSON files in nuxt.config | Module replaces the request config entirely |
| `setRequestLocale(lang)` | Not needed | @nuxtjs/i18n handles locale context |
| `routing.locales` array | `i18n.locales` in nuxt.config | Same `['it', 'es']` values |
| `generateStaticParams()` for locale paths | `i18n.locales` drives static generation | Module generates locale routes at build time |

**Message file format:** next-intl uses `useTranslations('nav').t('logo')` — namespace is passed to the hook. @nuxtjs/i18n uses a single `t()` with the full dotted path: `t('nav.logo')`. The existing `messages/it.json` and `messages/es.json` are structurally compatible — no content changes are needed. Only the call sites in components change.

**Recommended strategy: `prefix_except_default`** with `defaultLocale: 'it'`. This matches the current Next.js behavior where all locale paths are explicit (e.g., `/it`, `/es`).

Note: The current Next.js static export generates paths like `/it/index.html` and `/es/index.html`. If the Hostinger deployment requires all paths to be locale-prefixed, use `strategy: 'prefix'` instead to ensure `/it/` prefix is always present. Verify against actual deployed URL structure before choosing.

**nuxt.config.ts i18n block:**
```ts
i18n: {
  locales: ['it', 'es'],
  defaultLocale: 'it',
  strategy: 'prefix',
  langDir: 'i18n/locales/',
  vueI18n: './i18n.config.ts',
},
```

**useLocalePath:** @nuxtjs/i18n provides `useLocalePath()`. Use this in templates when building `href`/`to` values instead of manually interpolating the lang param. Example: `const localePath = useLocalePath(); localePath('/rephrase/daily')` resolves to the correct locale-prefixed path. This replaces the current `/${lang}/rephrase/${deck.id}` string interpolation pattern throughout components.

### SSR Bypass: next/dynamic ssr:false to Nuxt ClientOnly

**The problem:** `StudySession` and `QAStudySession` read from localStorage and use the Web Speech API. Both are unavailable during server-side rendering.

**Next.js solution (StudySessionNoSSR.tsx):**
```ts
const StudySession = dynamic(() => import('./StudySession'), { ssr: false });
export default function StudySessionNoSSR(props) {
  return <StudySession {...props} />;
}
```

**Nuxt 3 solution — `<ClientOnly>` in the page component:**
```vue
<!-- pages/[lang]/rephrase/[deck].vue -->
<template>
  <ClientOnly>
    <StudySession :lang="lang" :deck-id="deckId" :cards="cards" />
    <template #fallback>
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
```

`<ClientOnly>` is built into Nuxt. It requires no import, tree-shakes the wrapped component from the server build, and is the direct equivalent of `dynamic(..., { ssr: false })`. The `StudySessionNoSSR.tsx` and `QAStudySessionNoSSR.tsx` wrapper files have no equivalent in Nuxt — `<ClientOnly>` in the page replaces both.

The `typeof window === 'undefined'` guards already present in the composables' `loadFromStorage` functions are valid and should be kept as secondary defense, but `onMounted` is the primary pattern for localStorage initialization.

---

## Data Flow

```
localStorage (${lang}-progress, ${lang}-level-filter)
    |
    | onMounted read
    v
useSRS(lang) ---------> progress ref, updateCard fn, isCardDueForDeck fn, hasProgress computed
useLevelFilter(lang, hasProgress) -> activeLevels ref, setActiveLevels fn
    |
    | props
    v
pages/[lang]/rephrase/index.vue
    |                     |
    | props               | props + isCardDueForDeck
    v                     v
LevelFilterChips      DeckGrid -> renders due-count badges
  (emits update)
    |
    | setActiveLevels call
    v
localStorage write + activeLevels ref update
    -> DeckGrid re-renders (computed due counts react to progress ref)

pages/[lang]/rephrase/[deck].vue
    |
    | <ClientOnly>
    v
StudySession.vue
    | onMounted: snapshot dueCards into ref (frozen for session)
    | updateCard call per answer
    v
useSRS.updateCard -> progress.value update -> localStorage write
```

**Session snapshot pattern preserved:** `StudySession` must snapshot `dueCards` once on mount to prevent mid-session re-filtering. In Vue, this is `const dueCards = ref<...[]>([])` initialized in `onMounted`, not a `computed`. The value is set once and never recomputed. This is the exact equivalent of the React `useState(() => computeDueCards())` pattern.

---

## Patterns to Follow

### Pattern 1: Composable with ref + onMounted for localStorage

```ts
// composables/useSRS.ts
import { ref, computed, onMounted } from 'vue';
import type { DeckId, Lang, ProgressRecord } from '~/types';
import { getCardKey, advanceBox, isCardDue } from '~/lib/srs';

export function useSRS(lang: Lang) {
  const progress = ref<ProgressRecord>({});

  onMounted(() => {
    try {
      const saved = localStorage.getItem(`${lang}-progress`);
      if (saved) progress.value = JSON.parse(saved) as ProgressRecord;
    } catch { /* silent */ }
  });

  function updateCard(deckId: DeckId, cardIndex: number, isCorrect: boolean) {
    const key = getCardKey(deckId, cardIndex);
    progress.value = {
      ...progress.value,
      [key]: advanceBox(progress.value[key], isCorrect),
    };
    try {
      localStorage.setItem(`${lang}-progress`, JSON.stringify(progress.value));
    } catch { /* silent */ }
  }

  function isCardDueForDeck(deckId: DeckId, cardIndex: number): boolean {
    return isCardDue(progress.value[getCardKey(deckId, cardIndex)]);
  }

  const hasProgress = computed(() => Object.keys(progress.value).length > 0);

  return { progress, updateCard, isCardDueForDeck, hasProgress };
}
```

`onMounted` is the correct guard for localStorage access — cleaner than `typeof window === 'undefined'` checks and idiomatic in Vue/Nuxt.

### Pattern 2: Vue SFC with defineProps and defineEmits

```vue
<!-- components/LevelFilterChips.vue -->
<script setup lang="ts">
import type { Level } from '~/types';
const { t } = useI18n();

const props = defineProps<{ activeLevels: Level[] }>();
const emit = defineEmits<{
  'update:activeLevels': [levels: Level[] | null];
}>();

const LEVELS: Level[] = ['A1', 'A2'];

function toggle(level: Level) {
  if (props.activeLevels.includes(level)) {
    emit('update:activeLevels', props.activeLevels.filter(l => l !== level));
  } else {
    emit('update:activeLevels', [...props.activeLevels, level]);
  }
}
</script>
```

React's callback prop (`setActiveLevels`) becomes a Vue emit. The FLTR-06 guard (reject empty arrays) lives in the parent composable `useLevelFilter`, which is unchanged from the React version's placement.

### Pattern 3: Page-level route params via useRoute

```vue
<!-- pages/[lang]/rephrase/[deck].vue -->
<script setup lang="ts">
import type { Lang, DeckId } from '~/types';
import { DECK_MAP } from '~/data/deckMap';
import { DECK_IDS } from '~/data/decks';

const route = useRoute();
const lang = route.params.lang as Lang;
const deckId = route.params.deck as DeckId;
const cards = DECK_MAP[lang]?.[deckId] ?? [];
</script>
```

No `generateStaticParams` needed in page files. Nuxt's Nitro crawler discovers all routes automatically via `crawlLinks: true` when pages contain `<NuxtLink>` elements pointing to all deck paths. The locale routing is handled by @nuxtjs/i18n.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Global ssr: false

**What goes wrong:** Setting `ssr: false` in `nuxt.config.ts` at the app level.

**Why it happens:** Developers familiar with Next.js `output: 'export'` assume disabling SSR is the equivalent setting.

**Consequences:** `nuxt generate` stops producing pre-rendered HTML. The output becomes a bare SPA with a single `index.html` shell and no locale-specific pages. Breaks static hosting on Hostinger.

**Prevention:** Use `<ClientOnly>` per component for browser-only content. Leave SSR enabled globally for `nuxt generate` to work correctly.

### Anti-Pattern 2: Nuxt useState for SRS progress

**What goes wrong:** Using Nuxt's built-in `useState()` composable (not Vue's `ref`) for SRS progress state.

**Why it happens:** Nuxt's `useState` looks like the React `useState` it replaces.

**Consequences:** Nuxt's `useState` serializes state for SSR hydration and shares the keyed state across all component instances app-wide. Two simultaneously open sessions (different tabs, different languages) would corrupt each other's progress state. Also adds unnecessary overhead for state that is never server-rendered.

**Prevention:** Use `ref` + `onMounted`. SRS progress is instance-local, localStorage-only, and never server-rendered.

### Anti-Pattern 3: computed for dueCards inside StudySession

**What goes wrong:** Deriving `dueCards` as a Vue `computed` property rather than a frozen ref snapshot.

**Why it happens:** Reactive computed feels natural for a derived list.

**Consequences:** As cards are answered during a session, `progress.value` updates. If `dueCards` is a `computed`, it re-filters and the current card index points to a different card. Cards are skipped or sessions end prematurely.

**Prevention:** Snapshot `dueCards` once in `onMounted` using `ref(computeDueCards())`. Never recompute it reactively during the session. This is identical to the React `useState(() => computeDueCards())` pattern it replaces.

### Anti-Pattern 4: Hardcoded /${lang}/ href strings

**What goes wrong:** Building `href`/`to` values by interpolating the lang param: `` `/${lang}/rephrase/${deck.id}` ``.

**Why it happens:** Direct port from Next.js where `/${lang}/...` worked correctly.

**Consequences:** @nuxtjs/i18n routing inserts locale prefixes according to the configured `strategy`. With `strategy: 'prefix'`, all routes are prefixed — but manually prepending `/${lang}` may double-prefix or produce incorrect paths depending on how the router resolves them.

**Prevention:** Use `useLocalePath()` from @nuxtjs/i18n for all navigation. `const localePath = useLocalePath(); localePath('/rephrase/daily')` resolves the locale-prefixed path correctly regardless of strategy.

### Anti-Pattern 5: Importing VueUse useStorage by name

**What goes wrong:** `import { useStorage } from '@vueuse/core'` without aliasing.

**Why it happens:** VueUse's `useStorage` is a well-known reactive localStorage utility.

**Consequences:** Nuxt 3 auto-imports Nitro's server-side `useStorage()` which has the same name. The auto-import shadows the VueUse import, causing a collision or unexpected behavior.

**Prevention:** Write a thin custom composable using `ref` + `onMounted` (Pattern 1 above). Or import with explicit alias: `import { useStorage as useVueStorage } from '@vueuse/core'`. The custom composable approach is preferred — it keeps dependencies minimal and the pattern is already established by the existing hooks.

---

## New vs Modified vs Reused

### Reused As-Is (zero changes)

| File | Reason |
|------|--------|
| `src/lib/srs.ts` | Pure TypeScript functions, no framework imports |
| `src/lib/generateChoices.ts` | Pure TypeScript, no framework imports |
| `src/types/index.ts` | Type definitions only |
| `src/data/**` (all card data and deck metadata) | Data modules, no framework imports |
| `messages/it.json` | Message content unchanged; path moves to `i18n/locales/it.json` |
| `messages/es.json` | Message content unchanged; path moves to `i18n/locales/es.json` |

### Modified (framework swap, logic preserved)

| Source | Target | What Changes |
|--------|--------|-------------|
| `hooks/useSRS.ts` | `composables/useSRS.ts` | `useState`/`useCallback` → `ref`/`computed`/`onMounted`; `typeof window` guards → `onMounted` |
| `hooks/useLevelFilter.ts` | `composables/useLevelFilter.ts` | Same React → Vue primitive swap |
| `hooks/useQASRS.ts` | `composables/useQASRS.ts` | `useMemo` → `computed`; `useState` → `ref` |
| `hooks/useVoiceRecognition.ts` | `composables/useVoiceRecognition.ts` | `useRef`/`useEffect` → `ref`/`onMounted` |
| `components/SiteHeader.tsx` | `components/SiteHeader.vue` | TSX → SFC; `usePathname` → `useRoute().path`; `useTranslations('nav').t('back')` → `t('nav.back')`; `useState` dropdown → `ref` |
| `components/ActivityPicker.tsx` | `components/ActivityPicker.vue` | TSX → SFC; `Link` → `NuxtLink`; `useLocalePath()` for hrefs |
| `components/*.tsx` (all others) | `components/*.vue` | TSX → SFC; callback props → emits; `useTranslations(ns).t(key)` → `t('ns.key')` |
| `app/[lang]/rephrase/page.tsx` | `pages/[lang]/rephrase/index.vue` | Hook calls lifted to page; `useParams` → `useRoute().params` |
| `app/[lang]/qa/page.tsx` | `pages/[lang]/qa/index.vue` | Same |
| `app/[lang]/rephrase/[deck]/StudySession.tsx` | `components/StudySession.vue` | React → Vue; `useState` snapshot → `ref` in `onMounted`; all logic preserved |
| `app/[lang]/qa/[scenario]/QAStudySession.tsx` | `components/QAStudySession.vue` | Same |
| `app/[lang]/layout.tsx` | `layouts/default.vue` | `NextIntlClientProvider` removed; `{children}` → `<slot />`; `getMessages()` removed |

### New (no Next.js equivalent)

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | Framework config: i18n module, Nitro prerender, Tailwind v4, TypeScript strict |
| `app.vue` | Nuxt root: `<NuxtLayout><NuxtPage /></NuxtLayout>` |
| `i18n.config.ts` | vue-i18n runtime options passed to @nuxtjs/i18n |

### Deleted (no Nuxt equivalent needed)

| File | Why Deleted |
|------|-------------|
| `app/[lang]/rephrase/[deck]/StudySessionNoSSR.tsx` | `<ClientOnly>` in page component replaces this |
| `app/[lang]/qa/[scenario]/QAStudySessionNoSSR.tsx` | Same |
| `src/i18n/request.ts` | @nuxtjs/i18n module handles message loading |
| `src/i18n/routing.ts` | Locale config moves to `nuxt.config.ts` i18n block |
| `src/i18n/navigation.ts` | `useLocalePath()` from @nuxtjs/i18n replaces this |
| `app/[lang]/rephrase/layout.tsx` | No sub-layout needed; `layouts/default.vue` covers all pages |
| `app/[lang]/qa/layout.tsx` | Same |

---

## Suggested Build Order for Phases

Dependency chain: pure logic first, then framework scaffolding, then composables, then pages/components leaf-to-root, finally integration validation.

| Phase | Deliverable | Depends On |
|-------|-------------|-----------|
| 1 | Nuxt 3 scaffold — `nuxt.config.ts`, `app.vue`, Tailwind v4 wired, @nuxtjs/i18n configured, `nuxt generate` produces `.output/public/` | Nothing |
| 2 | Copy `src/lib/` and `src/types/` and `src/data/` verbatim; verify existing Vitest tests still pass | Phase 1 |
| 3 | Port composables: `useSRS`, `useLevelFilter`, `useQASRS`, `useVoiceRecognition` — unit tests updated for Vue | Phase 2 |
| 4 | Routing skeleton — all `pages/**/*.vue` with placeholder templates; verify all routes prerender via `nuxt generate` | Phase 1, 3 |
| 5 | Primitive UI components: `ChoiceButton`, `AudioButton`, `MicButton`, `FeedbackMessage`, `LevelFilterChips` | Phase 1 |
| 6 | `SiteHeader.vue` + `layouts/default.vue` — i18n strings, back-button logic, language switcher, progress reset | Phase 4, 5 |
| 7 | `DeckGrid.vue`, `ScenarioGrid.vue`, `ActivityPicker.vue` — composite browser components with live due-count badges | Phase 3, 5, 6 |
| 8 | `StudySession.vue` (Rephrase) — full session logic, all composables wired, `<ClientOnly>` in page | Phase 3, 5, 7 |
| 9 | `QAStudySession.vue` (Q&A) — identical structure to Phase 8 | Phase 8 |
| 10 | Static export validation — `nuxt generate`, verify `.output/public/` structure matches Hostinger requirements, deploy to staging | Phase 9 |

---

## Scalability Considerations

This is a statically-hosted client-side app. Scalability is not a runtime concern. The only scalability surface is build-time route count and bundle size.

| Concern | Current (14 decks + 7 scenarios) | Adding a language (e.g. French) | Doubling decks |
|---------|-----------------------------------|----------------------------------|-----------------|
| Static routes | ~30 prerendered pages | +~15 pages per language | Linear growth |
| Card data bundle | ~640 cards (~60KB gzipped) | Linear increase | Linear increase |
| localStorage | Two keys per language | One additional key set | No impact |
| Build time | Seconds | Seconds | Seconds |

No architectural changes are needed for moderate growth. If card count reaches thousands, lazy-loading per-deck data files would reduce initial bundle size — not a current concern.

---

## Sources

Confidence levels:
- File structure mapping: HIGH — derived from direct source inspection of all existing `.tsx` files and Nuxt 3 documentation patterns
- Composable conversion: HIGH — direct mechanical mapping from React to Vue primitives
- @nuxtjs/i18n strategy recommendation: MEDIUM — documented behavior, unverified against actual deployed URL format
- `nitro.prerender` + `crawlLinks` approach: MEDIUM — documented Nuxt 3 pattern, community-confirmed for static export

- [@nuxtjs/i18n Routing Strategies](https://i18n.nuxtjs.org/docs/guide)
- [@nuxtjs/i18n Usage](https://i18n.nuxtjs.org/docs/getting-started/usage)
- [Nuxt 3 Prerendering](https://nuxt.com/docs/3.x/getting-started/prerendering)
- [Nuxt 3 composables directory](https://nuxt.com/docs/3.x/guide/directory-structure/composables)
- [Nuxt ClientOnly component](https://nuxt.com/docs/4.x/api/components/client-only)
- [Nuxt state management — why not useState for localStorage](https://nuxt.com/docs/getting-started/state-management/)
- Direct source inspection: all files under `src/app/`, `src/hooks/`, `src/components/` on branch `vue-port`
