# Phase 24: Browser Screens - Research

**Researched:** 2026-03-12
**Domain:** Vue 3 SFC screen assembly, Nuxt 4 page components, reactive computed badges, @nuxtjs/i18n NuxtLinkLocale
**Confidence:** HIGH

## Summary

Phase 24 ports three screen-level components from the Next.js `feat/nextjs-port` branch into Nuxt 4 Vue SFCs: ActivityPicker (index page), DeckGrid (rephrase index page), and ScenarioGrid (qa index page). All three source components exist in `src/components/` and are straightforward React-to-Vue translations with no novel logic.

The core technical challenge is the reactive due-count badge: `useSRS` exposes `isCardDueForDeck` which depends on `progress` (a ref), and `useLevelFilter` exposes `activeLevels` (a ref). The badge count for each deck must be a `computed` that reacts when either `progress` or `activeLevels` changes. Because both are refs, a `computed` wrapping the count logic achieves the requirement that badge updates happen in the same render cycle as a chip toggle.

The data import path is the key risk: the deck and QA data live in `src/data/` (not `app/data/`) and the `@` alias in `app/` maps to `app/` not `src/`. Vue page files under `app/pages/` must import data using the relative path `../../src/data/...` or the files must use an alias that bridges both locations. The precedent from Phase 22 is that `app/lib/` holds copies of `src/lib/` files. For data (which is larger and has cross-file imports), relative imports from `src/data/` are the correct approach since Vite resolves them correctly.

**Primary recommendation:** Implement all three screens as Vue page files (not separate component files) using `<script setup>`, composables called at the page level, and computed badge counts. Use relative imports `../../src/data/...` for deck/scenario data. Follow the Wave 0 test-first pattern established by Phase 23.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-03 | ActivityPicker screen with Rephrase/Q&A navigation tiles using `<NuxtLinkLocale>` | ActivityPicker.tsx source available; NuxtLinkLocale pattern confirmed from SiteHeader.vue Phase 23 |
| UI-04 | DeckGrid screen with reactive live due-count badges (computed from `useSRS`) and level filter chips; A1/A2 toggle updates badge counts in one render cycle | `useSRS.isCardDueForDeck` and `useLevelFilter.activeLevels` both exposed as refs; computed wrapping count logic achieves single-cycle reactivity |
| UI-05 | ScenarioGrid (Q&A browser) with reactive live due-count badges per scenario tile and level filter chips | `useQASRS.dueCards` is already a computed; ScenarioGrid can call `useQASRS` per scenario, but each call requires `onMounted` — tile-level composable call pattern needs careful handling (see Pitfall 2) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 `<script setup>` | Nuxt 4 bundled | SFC authoring with Composition API | Established in Phases 22–23; all composables use this pattern |
| `computed` (Vue) | Vue 3 | Reactive badge count derivation | Single-cycle badge update on chip toggle without extra watcher |
| `useSRS` | app/composables | SRS progress + `isCardDueForDeck` | Phase 22 deliverable; `progress` is a ref so computeds based on it are reactive |
| `useLevelFilter` | app/composables | A1/A2 chip state + FLTR-06 guard | Phase 22 deliverable; returns `activeLevels` ref and `setActiveLevels` |
| `useQASRS` | app/composables | Q&A SRS per scenario | Phase 22 deliverable; `dueCards` is already a computed |
| `NuxtLinkLocale` | @nuxtjs/i18n | Locale-prefixed navigation links | Confirmed working in SiteHeader (Phase 23); handles `/it/rephrase` etc. |
| `useI18n` | @nuxtjs/i18n | Translation access in `<script setup>` | Established pattern; `const { t } = useI18n()` everywhere |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useRoute` | Nuxt/Vue Router auto-import | Current route params (lang detection) | Not needed — lang comes from `useI18n().locale` |
| `mountSuspended` | @nuxt/test-utils | Component mounting in Nuxt test environment | All nuxt project tests; established by Phase 22 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Relative imports `../../src/data/` | Copy data to `app/data/` | Copying avoids relative paths but duplicates ~800 lines of data; relative imports are simpler |
| Per-tile `useQASRS` in ScenarioGrid | Pre-compute all due counts at page level | Per-tile allows reactive computed per scenario; page-level would require iterating scenarios manually |

**Installation:** No new packages — all dependencies satisfied by Phases 20–23.

## Architecture Patterns

### Recommended Project Structure
```
app/pages/
├── index.vue          # ActivityPicker — replace placeholder (UI-03)
├── rephrase/
│   └── index.vue      # DeckGrid — replace placeholder (UI-04)
└── qa/
    └── index.vue      # ScenarioGrid — replace placeholder (UI-05)

tests/nuxt/
├── ActivityPicker.test.ts   # Wave 0 stubs (new)
├── DeckGrid.test.ts         # Wave 0 stubs (new)
└── ScenarioGrid.test.ts     # Wave 0 stubs (new)
```

No new component files are needed — the screens are implemented directly in page files, same as the Next.js version's page.tsx files.

### Pattern 1: ActivityPicker Page (UI-03)

**What:** Static navigation grid; no composables needed. Two tiles using `NuxtLinkLocale` pointing to `/rephrase` and `/qa`.
**When to use:** Any screen that only requires locale-aware navigation, no SRS state.

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { t } = useI18n()

const ACTIVITIES = [
  { key: 'rephrase', icon: '🃏', path: '/rephrase' },
  { key: 'qa',       icon: '💬', path: '/qa' },
] as const
</script>

<template>
  <main>
    <div class="section-header">
      <h1>{{ t('page.title') }}</h1>
      <p class="subtitle">{{ t('page.subtitle') }}</p>
    </div>
    <div class="activity-grid">
      <NuxtLinkLocale
        v-for="activity in ACTIVITIES"
        :key="activity.key"
        :to="activity.path"
      >
        <div class="deck-card">
          <div class="deck-icon-circle">{{ activity.icon }}</div>
          <h3>{{ t(`activities.${activity.key}.title`) }}</h3>
          <p>{{ t(`activities.${activity.key}.description`) }}</p>
        </div>
      </NuxtLinkLocale>
    </div>
  </main>
</template>
```

Source: `src/components/ActivityPicker.tsx` + `src/app/[lang]/page.tsx` — direct Vue translation.

### Pattern 2: DeckGrid Page with Reactive Badges (UI-04)

**What:** Rephrase index page. Calls `useSRS` and `useLevelFilter` at page level. Badge count per deck is a `computed` that reads both `progress` (via `isCardDueForDeck`) and `activeLevels`.
**When to use:** Any grid where badge counts depend on filter state.

Key insight: `isCardDueForDeck` is a plain function that internally reads `progress.value`. When called inside a `computed`, Vue tracks the `progress` ref as a dependency. So a `computed(() => getDueCount(deck.id, deckCards))` will re-evaluate whenever `progress` changes OR when `activeLevels` changes.

```vue
<!-- app/pages/rephrase/index.vue -->
<script setup lang="ts">
import { deckMetadata } from '../../src/data/decks'
import { DECK_MAP } from '../../src/data/deckMap'
import type { Card, DeckId } from '~/types'

const { t } = useI18n()
const { locale } = useI18n()
const lang = computed(() => locale.value as 'it' | 'es')

const { isCardDueForDeck, hasProgress } = useSRS(lang.value)
const { activeLevels, setActiveLevels } = useLevelFilter(lang.value, hasProgress)

const decks = computed(() => deckMetadata.filter(d => d.lang === lang.value))

function getDueCount(deckId: DeckId, cards: Card[]): number {
  if (!activeLevels.value) return 0
  return cards
    .filter((card, i) =>
      activeLevels.value!.includes(card.level) && isCardDueForDeck(deckId, i)
    ).length
}
</script>
```

Source: `src/app/[lang]/rephrase/page.tsx` — Vue translation, `computed` replaces React re-render.

### Pattern 3: ScenarioGrid Page (UI-05)

**What:** Q&A index page. Same level-filter pattern as DeckGrid. Due count per scenario uses `useQASRS` — but calling it per-tile inside `v-for` is not valid Vue (composables must be called in `<script setup>`, not inside template directives).

**Solution:** Compute due count at the page level using the `progress` ref from `useQASRS` directly, or pre-compute all due counts as a single `computed` that maps scenario IDs to counts.

```vue
<!-- app/pages/qa/index.vue -->
<script setup lang="ts">
import { scenarios } from '../../src/data/qa'

const { t } = useI18n()
const { locale } = useI18n()
const lang = computed(() => locale.value as 'it' | 'es')

const { hasProgress } = useSRS(lang.value)
const { activeLevels, setActiveLevels } = useLevelFilter(lang.value, hasProgress)

// useQASRS is called once per scenario at setup time — valid because
// composables can be called multiple times in the same script setup.
// Each call returns its own reactive dueCards computed.
const scenarioSRS = scenarios.map(scenario =>
  useQASRS(lang.value, scenario.id, scenario.cards, activeLevels.value ?? ['A1'])
)
</script>
```

**Important caveat on `useQASRS` for ScenarioGrid:** `useQASRS` accepts `activeLevels: Level[]` (plain array, not ref) — see composable signature. But in `<script setup>`, `activeLevels.value` is `null` until `onMounted`. The `dueCards` computed inside `useQASRS` uses the `activeLevels` value passed at call time — so it won't be reactive to chip toggles unless the approach is adjusted.

**Recommended ScenarioGrid approach:** Compute due counts directly at page level rather than delegating to `useQASRS`. Call `useSRS` to get `progress` and use `isCardDue` directly, filtering by `activeLevels`. This mirrors the DeckGrid approach and avoids the mutable-capture problem.

```vue
<script setup lang="ts">
import { scenarios } from '../../src/data/qa'
import { isCardDue } from '~/lib/srs'

// Single useSRS call for progress tracking
const { progress, hasProgress } = useSRS(lang.value)
const { activeLevels, setActiveLevels } = useLevelFilter(lang.value, hasProgress)

function getQADueCount(scenario: Scenario): number {
  if (!activeLevels.value) return 0
  return scenario.cards.filter(card =>
    activeLevels.value!.includes(card.level) &&
    isCardDue(progress.value[`qa_${scenario.id}_${card.id}`])
  ).length
}

const scenarioDueCounts = computed(() =>
  Object.fromEntries(scenarios.map(s => [s.id, getQADueCount(s)]))
)
</script>
```

This approach is reactive: both `progress.value` and `activeLevels.value` are tracked by the `computed`.

### Pattern 4: LevelFilterChips Integration (FLTR-06 UI)

`LevelFilterChips` emits `update:activeLevels`. The page handles this by calling `setActiveLevels` which enforces the FLTR-06 guard. Use `v-model:activeLevels` if the parent passes a reactive ref, or handle `@update:activeLevels="setActiveLevels"` directly.

```vue
<LevelFilterChips
  :active-levels="activeLevels ?? []"
  @update:active-levels="setActiveLevels"
/>
```

Note: `activeLevels` is `null` until `onMounted` (SSR safe default). Pass `activeLevels ?? []` to avoid type errors on the prop.

### Anti-Patterns to Avoid

- **Calling composables inside `v-for` or template expressions:** Vue composables must be called at the top level of `<script setup>`. Never call `useQASRS()` inside a `v-for` loop or computed.
- **Using `dueCards.value.length` from per-tile `useQASRS` call in a loop:** Because `useQASRS` takes `activeLevels` as a plain `Level[]` at call time, calling it from a loop at setup time captures the initial value and loses reactivity to later chip toggles.
- **`activeLevels` null check omission:** `activeLevels.value` is `null` server-side and until `onMounted` fires. All count functions must guard with `if (!activeLevels.value) return 0`.
- **Using `computed` for dueCards in session pages (already documented pitfall):** For browser screens (grid pages), `computed` IS correct for badge counts. The snapshot-as-ref pattern only applies to study sessions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FLTR-06 guard (can't deselect all chips) | Custom chip validation in page | `setActiveLevels` from `useLevelFilter` | Guard is already implemented and tested in Phase 22 |
| Locale-aware navigation | Hardcoded `/it/rephrase` href | `<NuxtLinkLocale to="/rephrase">` | Auto-prefixes current locale; switching locale updates all links |
| SRS progress tracking | Direct localStorage reads in page | `useSRS(lang)` composable | Already handles onMounted guard, parsing, error handling |
| Due count per deck | Manual localStorage parse in template | `isCardDueForDeck` from `useSRS` | Composable tracks reactivity; direct localStorage is not reactive |

## Common Pitfalls

### Pitfall 1: `activeLevels` null until onMounted
**What goes wrong:** Template renders server-side with `activeLevels.value === null`. If template code does `activeLevels.value.includes(...)` without a null check, it throws during SSR.
**Why it happens:** `useLevelFilter` initializes `activeLevels = ref<Level[] | null>(null)` and only sets it in `onMounted` — SSR-safe by design.
**How to avoid:** Always use `activeLevels.value ?? []` at call sites. Badge functions guard with `if (!activeLevels.value) return 0`.
**Warning signs:** SSR error `Cannot read properties of null (reading 'includes')`.

### Pitfall 2: useQASRS activated-levels reactivity capture
**What goes wrong:** `useQASRS(lang, scenario.id, scenario.cards, activeLevels.value ?? ['A1'])` called once at setup time. When `activeLevels` changes, the `dueCards` computed inside `useQASRS` still uses the captured initial value.
**Why it happens:** `useQASRS` takes `activeLevels: Level[]` as a plain array, not a `Ref<Level[]>`. The composable was designed for study sessions (single call, fixed activeLevels).
**How to avoid:** For ScenarioGrid, bypass `useQASRS.dueCards` and compute counts directly at page level using `useSRS.progress` ref and `isCardDue` function — both are reactive.
**Warning signs:** Chip toggle changes A1/A2 state but badge counts don't update.

### Pitfall 3: Data import alias mismatch
**What goes wrong:** Importing `from '@/data/decks'` in `app/pages/` resolves to `app/data/decks` (which doesn't exist), not `src/data/decks`.
**Why it happens:** In Nuxt 4, `@` and `~` both alias to `app/`. The data files in `src/data/` use `@/types` which was the Next.js `src/` alias.
**How to avoid:** Use relative imports in page files: `import { deckMetadata } from '../../src/data/decks'`. Alternatively, add a custom Vite alias `'@data': path.resolve(__dirname, 'src/data')` in `nuxt.config.ts` (simpler for the planner to decide).
**Warning signs:** `Cannot find module '@/data/decks'` at build time or module resolution errors in TypeScript.

### Pitfall 4: NuxtLinkLocale vs NuxtLink for activity tiles
**What goes wrong:** Using `<NuxtLink to="/it/rephrase">` hardcodes the locale. When user is on `/es/`, the link still goes to `/it/rephrase`.
**Why it happens:** `NuxtLink` does not auto-prefix locale; `NuxtLinkLocale` does.
**How to avoid:** Always use `<NuxtLinkLocale to="/rephrase">` for internal navigation within locale-prefixed pages.
**Warning signs:** Activity tile click from `/es/` routes to `/it/rephrase` instead of `/es/rephrase`.

### Pitfall 5: lang derived from locale for composable calls
**What goes wrong:** Calling `useSRS(locale.value as Lang)` where `locale.value` is the locale code string. If locale changes (e.g., locale switcher), the composable was initialized with the old lang and localStorage key reads the wrong namespace.
**Why it happens:** Composables are called once at setup time; the lang arg is not reactive.
**How to avoid:** In browser screen pages (not session pages), the locale is fixed per page (each page route has a fixed locale from @nuxtjs/i18n). Use `const lang = locale.value as Lang` at setup time — it will be the correct locale for that page render.
**Warning signs:** Progress badge shows wrong counts after locale switch (won't happen in practice because switching locale navigates to a new page instance).

## Code Examples

### Verified: NuxtLinkLocale pattern from SiteHeader.vue (Phase 23)
```vue
<!-- Source: app/components/SiteHeader.vue (Phase 23 deliverable) -->
<NuxtLinkLocale to="/" :locale="'it'" :class="{ active: locale === 'it' }">
  Italiano
</NuxtLinkLocale>
```
For activity tiles and grid tiles, omit the `:locale` prop — NuxtLinkLocale uses the current locale automatically:
```vue
<NuxtLinkLocale to="/rephrase">Rephrase</NuxtLinkLocale>
<!-- Renders as /it/rephrase when locale is 'it', /es/rephrase when 'es' -->
```

### Verified: isCardDueForDeck usage pattern from useSRS.ts
```typescript
// Source: app/composables/useSRS.ts (Phase 22 deliverable)
function isCardDueForDeck(deckId: DeckId, cardIndex: number): boolean {
  return isCardDue(progress.value[getCardKey(deckId, cardIndex)])
}
// progress is a ref — calling isCardDueForDeck inside a computed tracks progress.value
```

### Verified: LevelFilterChips emit pattern from LevelFilterChips.vue
```vue
<!-- Source: app/components/LevelFilterChips.vue (Phase 23 deliverable) -->
<!-- Emits: 'update:activeLevels' with Level[] -->
<!-- Parent usage: -->
<LevelFilterChips
  :active-levels="activeLevels ?? []"
  @update:active-levels="setActiveLevels"
/>
```

### Verified: isCardDue for direct use in ScenarioGrid
```typescript
// Source: app/lib/srs.ts (Phase 22 deliverable)
export function isCardDue(progress: Progress | undefined): boolean {
  if (!progress) return true  // never seen = due
  return progress.nextReview <= getTodayString()
}
// QA card key format: `qa_${scenarioId}_${cardId}`
// e.g., `qa_coffee_coffee_01`
```

### Test pattern from Phase 23 (for Phase 24 Wave 0 stubs)
```typescript
// Source: tests/nuxt/LevelFilterChips.test.ts (Phase 23 deliverable)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('ActivityPicker', () => {
  it('renders Rephrase and Q&A tiles', async () => {
    const { default: IndexPage } = await import('../../app/pages/index.vue')
    const wrapper = await mountSuspended(IndexPage)
    // assertions against wrapper
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React hooks called per tile (`useQASRS` per ScenarioTile) | Vue computed at page level using `useSRS.progress` ref directly | Phase 24 (new) | Avoids composable-in-loop anti-pattern in Vue; achieves same reactivity |
| `Link` (Next.js) for locale navigation | `NuxtLinkLocale` (@nuxtjs/i18n) | Phase 23 | Auto-locale-prefix; no hardcoded lang in href |
| `useParams()` for lang detection | `useI18n().locale` | Phase 22+ | i18n plugin owns locale routing; no manual param parsing |

## Open Questions

1. **Data import path strategy**
   - What we know: `src/data/` files use `@/types` (Next.js alias mapping to `src/`); Nuxt `@` maps to `app/`
   - What's unclear: Whether to use relative imports (`../../src/data/`) or add a Vite alias in `nuxt.config.ts`
   - Recommendation: Use relative imports for the three or four files needed (decks.ts, deckMap.ts, qa/index.ts). Adding an alias would also work but requires touching `nuxt.config.ts`. Planner should pick one approach and be consistent.

2. **ScenarioGrid due-count approach**
   - What we know: `useQASRS` takes plain `Level[]`, not a `Ref`. Calling it per-scenario with captured initial value loses reactivity.
   - What's unclear: Whether the planner prefers to (a) compute counts at page level using `useSRS.progress` directly, or (b) modify `useQASRS` to accept `Ref<Level[]>` (out of scope — changes Phase 22 contract), or (c) use a `watchEffect` to recompute when `activeLevels` changes.
   - Recommendation: Option (a) — compute counts at page level. Matches DeckGrid pattern. No Phase 22 changes. Single `computed` gives correct reactivity.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @nuxt/test-utils |
| Config file | `vitest.config.ts` — `nuxt` project, `tests/nuxt/**/*.{test,spec}.ts` |
| Quick run command | `bun run vitest --project nuxt run tests/nuxt/ActivityPicker.test.ts` |
| Full suite command | `bun run vitest --project nuxt run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-03 | ActivityPicker renders two tiles with correct text | unit | `bun run vitest --project nuxt run tests/nuxt/ActivityPicker.test.ts` | ❌ Wave 0 |
| UI-03 | NuxtLinkLocale tiles navigate to /rephrase and /qa | unit | same file | ❌ Wave 0 |
| UI-04 | DeckGrid renders deck cards with badge elements | unit | `bun run vitest --project nuxt run tests/nuxt/DeckGrid.test.ts` | ❌ Wave 0 |
| UI-04 | Badge count updates when activeLevels changes | unit | same file | ❌ Wave 0 |
| UI-04 | LevelFilterChips chip toggle calls setActiveLevels | unit | same file | ❌ Wave 0 |
| UI-05 | ScenarioGrid renders scenario tiles with badge elements | unit | `bun run vitest --project nuxt run tests/nuxt/ScenarioGrid.test.ts` | ❌ Wave 0 |
| UI-05 | ScenarioGrid badge count updates when activeLevels changes | unit | same file | ❌ Wave 0 |
| FLTR-06 | Deselecting all chips is prevented (guard active in UI) | unit | tests/nuxt/DeckGrid.test.ts + ScenarioGrid.test.ts | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run vitest --project nuxt run tests/nuxt/ActivityPicker.test.ts` (or the relevant file)
- **Per wave merge:** `bun run vitest --project nuxt run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/nuxt/ActivityPicker.test.ts` — covers UI-03
- [ ] `tests/nuxt/DeckGrid.test.ts` — covers UI-04, FLTR-06 (DeckGrid)
- [ ] `tests/nuxt/ScenarioGrid.test.ts` — covers UI-05, FLTR-06 (ScenarioGrid)

## Sources

### Primary (HIGH confidence)
- `src/components/ActivityPicker.tsx` — source component being ported; read directly
- `src/components/DeckGrid.tsx` — source component being ported; read directly
- `src/components/ScenarioGrid.tsx` — source component being ported; read directly
- `src/app/[lang]/page.tsx`, `rephrase/page.tsx`, `qa/page.tsx` — Next.js pages showing composable call sites
- `app/composables/useSRS.ts` — current Vue composable API; confirmed reactive pattern
- `app/composables/useLevelFilter.ts` — FLTR-06 guard confirmed; `activeLevels: Ref<Level[] | null>`
- `app/composables/useQASRS.ts` — confirmed takes plain `Level[]`, not `Ref`; known limitation for ScenarioGrid
- `app/components/SiteHeader.vue` — NuxtLinkLocale usage pattern confirmed
- `app/components/LevelFilterChips.vue` — emit pattern confirmed
- `.nuxt/tsconfig.app.json` — alias resolution confirmed: `~` and `@` both map to `../app`

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — accumulated context; `app/lib/` holds copies of `src/lib/` files (establishes data import precedent)
- `tests/nuxt/LevelFilterChips.test.ts` — test pattern for `mountSuspended` with page components

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies confirmed from existing codebase; no new packages
- Architecture: HIGH — source components read directly; Vue translation patterns are deterministic
- Pitfalls: HIGH — data alias issue confirmed from `.nuxt/tsconfig.app.json`; activeLevels null issue from composable source; useQASRS plain-array limitation confirmed from source
- ScenarioGrid approach: MEDIUM — recommended approach (page-level computed) is sound but not yet validated; open question documented

**Research date:** 2026-03-12
**Valid until:** Phase 24 completion (stable codebase, no external dependencies changing)
