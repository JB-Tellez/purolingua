# Phase 23: i18n Messages and Leaf Components - Research

**Researched:** 2026-03-12
**Domain:** Vue 3 SFC authoring, @nuxtjs/i18n v10 component API, Nuxt 4 component auto-import
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Locale switcher behavior:**
- Clicking the language flag/toggle always navigates to the root of the other locale (`/es/` or `/it/`) — no current-path preservation
- Dropdown style: click the flag to open, shows both locale options with flags; closes on selection
- Currently active locale is highlighted with the `active` class inside the dropdown
- Use `<NuxtLinkLocale :locale="'es'">` (from @nuxtjs/i18n) for locale-switch links — not hardcoded paths

**SiteHeader back button:**
- Shows when path depth >= 2 segments (e.g., `/it/rephrase` shows the back button; `/it/` does not)
- Back button navigates to parent path: `useRoute().path.split('/').filter(Boolean).slice(0, -1).join('/')` prefixed with `/`
- Uses `<NuxtLink>` for back navigation

**SiteHeader reset:**
- Clicking Reset: clears `${lang}-progress` from localStorage, then calls `window.location.reload()`
- No confirmation dialog — immediate reset
- The `lang` value passed as a prop to SiteHeader; component reads it to construct the localStorage key

**Emit patterns — leaf components:**
- **LevelFilterChips**: `defineEmits(['update:activeLevels'])` — enables `v-model:activeLevels` on the parent
- **ChoiceButton**: `defineEmits(['click', 'speak'])` — parent handles `@click` (grade answer) and `@speak` (TTS)
- **MicButton**: `defineEmits(['press'])` — parent handles `@press` to start voice recognition
- **FeedbackMessage**: no emits — display-only component, state passed as prop

**AudioButton SSR safety:**
- `import.meta.client` guard at the top of `speak()`: `if (!import.meta.client) return`
- Button renders on server (static HTML), speak() is never callable during SSR
- No `<ClientOnly>` wrapper required at call sites

**i18n access pattern:**
- All components use `const { t } = useI18n()` in `<script setup>` — explicit, TypeScript-friendly
- Full dotted key paths throughout: `t('study.correct')`, `t('nav.back')`, `t('filter.label')`, etc.
- No per-component namespace scoping (no `useScope: 'local'`)
- `$t()` template global NOT used — `t` from `useI18n()` only

**i18n message files:**
- `messages/it.json` and `messages/es.json` existing dotted-key structure is assumed compatible with @nuxtjs/i18n / vue-i18n v10
- `{count}` interpolation in `deckCardCount` is named interpolation — call site passes `{ count: n }` as second arg to `t()`
- Verify at build time: `nuxi generate` and confirm locale JSON loads without 404 and strings render correctly in static output

### Claude's Discretion

- Exact Tailwind classes and CSS class names for component markup (match existing patterns from the source components)
- Whether to use `@keydown` on ChoiceButton's speaker span in Vue (equivalent of the React `onKeyDown` for keyboard accessibility)
- Whether `SiteHeader` receives `lang` as a prop or reads it from `useI18n().locale` directly

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-01 | Leaf components ported as Vue SFCs: ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips (callback props become `defineEmits`) | Vue 3 SFC emit patterns, `defineEmits`, `defineProps`, TypeScript with `<script setup>` |
| UI-02 | i18n messages (`it.json`, `es.json`) adjusted for @nuxtjs/i18n dotted key path format; SiteHeader locale switcher verified working in static output | @nuxtjs/i18n v10 `useI18n()`, `NuxtLinkLocale`, `langDir`, `nuxi generate` verification |
</phase_requirements>

---

## Summary

Phase 23 ports six source components (ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips, SiteHeader) from React/next-intl to Vue 3 SFCs using @nuxtjs/i18n, and verifies that the existing `messages/it.json` and `messages/es.json` load correctly in the static output. The source components are simple and well-understood — each is under 50 lines in the React version. The primary technical work is mechanical translation of React patterns to Vue equivalents: callback props become `defineEmits`, `useState` becomes `ref`, `usePathname`/`useRouter` become `useRoute()`, and `next-intl`'s `useTranslations('namespace')` becomes `@nuxtjs/i18n`'s `useI18n()` with dotted key paths.

The most complex component is SiteHeader, which requires three distinct behaviors: path-depth-based back button visibility (`useRoute().path`), localStorage reset with `window.location.reload()`, and a locale-switcher dropdown using `NuxtLinkLocale` with the `:locale` prop. All are directly supported by the established toolchain.

The i18n message files (`messages/it.json`, `messages/es.json`) already use the dotted-key flat JSON format that @nuxtjs/i18n v10 expects — no structural changes are required. The `{count}` named interpolation in `deckCardCount` is standard vue-i18n named interpolation, compatible with the second argument of `t('deckCardCount', { count: n })`. The `langDir: '../messages'` config in `nuxt.config.ts` is already wired correctly from Phase 20.

**Primary recommendation:** Port each component as a direct mechanical translation of the React source. Use `mountSuspended` from `@nuxt/test-utils/runtime` for component tests — the `nuxt` Vitest project already initializes the full Nuxt runtime including @nuxtjs/i18n, so `useI18n()` works without any additional test setup.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 `<script setup>` | 3.x (via Nuxt 4.2.2) | SFC authoring, `defineProps`, `defineEmits`, `ref` | Project-established in Phases 20–22 |
| @nuxtjs/i18n | 10.2.3 (installed) | `useI18n()`, `NuxtLinkLocale`, locale routing | Locked in Phase 20 scaffold |
| Nuxt 4 auto-imports | 4.2.2 | `useRoute()`, `NuxtLink`, component auto-import | Project-established |
| Tailwind v4 | 4.x (via @tailwindcss/vite) | CSS utility classes | Project-established Phase 20 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nuxt/test-utils` | 4.0.0 (installed) | `mountSuspended` for Nuxt component tests | All component tests in `tests/nuxt/` |
| `@vue/test-utils` | 2.x (installed) | `DOMWrapper`, `find`, `trigger` on mounted wrappers | DOM assertions after `mountSuspended` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useI18n()` + dotted keys | per-component SFC `<i18n>` blocks | SFC blocks require `useScope: 'local'`, add complexity; global keys already defined in message files |
| `NuxtLinkLocale :locale="'es'"` | hardcoded `<NuxtLink to="/es/">` | hardcoded paths bypass i18n module's path resolution; NuxtLinkLocale is the locked decision |
| `window.location.reload()` for reset | `useRouter().go(0)` | Equivalent behavior; `window.location.reload()` is the locked decision |

**Installation:** No new packages required — all dependencies installed in Phase 20.

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── components/
│   ├── SiteHeader.vue          # Layout-level nav component
│   ├── ChoiceButton.vue        # QA study leaf
│   ├── AudioButton.vue         # TTS trigger leaf
│   ├── MicButton.vue           # Voice recognition trigger leaf
│   ├── FeedbackMessage.vue     # Display-only feedback leaf
│   └── LevelFilterChips.vue    # Filter toggle leaf
├── composables/                # (complete from Phase 22)
├── pages/                      # (placeholder pages from Phase 21)
└── app.vue                     # Root shell (NuxtLayout + NuxtPage)
tests/
└── nuxt/
    ├── SiteHeader.test.ts      # New
    ├── ChoiceButton.test.ts    # New
    ├── AudioButton.test.ts     # New
    ├── MicButton.test.ts       # New
    ├── FeedbackMessage.test.ts # New
    └── LevelFilterChips.test.ts# New
```

### Pattern 1: Standard Vue SFC Component with Emits

**What:** `defineProps` + `defineEmits` in `<script setup>` — the Vue equivalent of React callback props.
**When to use:** All five leaf components.

```vue
<!-- Source: Vue 3 official docs + @nuxtjs/i18n docs -->
<script setup lang="ts">
const props = defineProps<{
  text: string
  state: 'idle' | 'correct' | 'incorrect'
  disabled?: boolean
}>()
const emit = defineEmits<{
  click: []
  speak: []
}>()
</script>

<template>
  <button
    :class="['quiz-btn', state !== 'idle' ? state : '']"
    :disabled="disabled || state !== 'idle'"
    type="button"
    @click="emit('click')"
  >
    <span
      class="quiz-audio-icon"
      role="button"
      aria-label="audio"
      :tabindex="0"
      @click.stop="emit('speak')"
      @keydown.enter.stop="emit('speak')"
      @keydown.space.stop="emit('speak')"
    >🔊</span>
    {{ text }}
  </button>
</template>
```

### Pattern 2: useI18n() for i18n Access

**What:** Destructure `t` from `useI18n()` in `<script setup>` for all string lookups.
**When to use:** AudioButton (study.audio), FeedbackMessage (study.correct/incorrect/heard/notRecognized), LevelFilterChips (filter.label, filter.chips.A1, filter.chips.A2), SiteHeader (nav.logo, nav.back, nav.reset).

```vue
<!-- Source: @nuxtjs/i18n v10 official docs — i18n.nuxtjs.org/docs/getting-started/usage -->
<script setup lang="ts">
const { t } = useI18n()
// Usage: t('study.audio'), t('filter.label'), t('nav.back')
// Named interpolation: t('deckCardCount', { count: 5 })
</script>
```

Note: `useI18n()` is auto-imported by Nuxt — no explicit import needed.

### Pattern 3: NuxtLinkLocale for Locale Switching

**What:** Built-in @nuxtjs/i18n component for locale-aware navigation. Auto-registered as global component by the module.
**When to use:** SiteHeader locale dropdown options.

```vue
<!-- Source: i18n.nuxtjs.org/docs/components/nuxt-link-locale -->
<!-- navigates to /es/ root when locale="es" and to="/" -->
<NuxtLinkLocale to="/" :locale="'es'">
  <span class="flag">🇪🇸</span>
  <span>Español</span>
</NuxtLinkLocale>
<NuxtLinkLocale to="/" :locale="'it'">
  <span class="flag">🇮🇹</span>
  <span>Italiano</span>
</NuxtLinkLocale>
```

The `:locale` prop forces path resolution to the specified locale. When `locale="es"` and `to="/"`, the component resolves to `/es/`. This replaces the React `<Link href={`/${lang}`}>` hardcoded approach while preserving the locked "navigate to root of other locale" behavior.

### Pattern 4: SiteHeader Back Navigation

**What:** `useRoute().path` for path-depth detection; `<NuxtLink>` for back navigation.
**When to use:** SiteHeader back button logic.

```vue
<!-- Source: Nuxt 4 docs + existing project pattern ($route.params.deck in placeholder pages) -->
<script setup lang="ts">
const route = useRoute()
const segments = computed(() => route.path.split('/').filter(Boolean))
const onDeckPage = computed(() => segments.value.length >= 2)
const backHref = computed(() => '/' + segments.value.slice(0, -1).join('/'))
</script>

<template>
  <NuxtLink v-if="onDeckPage" :to="backHref" class="nav-back-btn">
    {{ t('nav.back') }}
  </NuxtLink>
</template>
```

**Path example:** `/it/rephrase` → `segments = ['it', 'rephrase']` → `length >= 2` → show back → `backHref = '/it'`

### Pattern 5: AudioButton SSR Guard

**What:** `import.meta.client` guard in `speak()` function — consistent with Phase 20/22 pattern.
**When to use:** AudioButton only (SpeechSynthesis API).

```vue
<!-- Source: Nuxt 4 docs — import.meta.client, established in Phase 20 -->
<script setup lang="ts">
const LANG_LOCALE: Record<string, string> = { it: 'it-IT', es: 'es-ES' }
const props = defineProps<{ phrase: string; lang: 'it' | 'es' }>()
const { t } = useI18n()

function speak() {
  if (!import.meta.client) return           // SSR guard (locked Phase 20 pattern)
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(props.phrase)
  utterance.lang = LANG_LOCALE[props.lang]
  utterance.rate = 0.9
  const voices = window.speechSynthesis.getVoices()
  const matching = voices.filter(v => v.lang.startsWith(props.lang))
  const exact = matching.find(v => v.lang === LANG_LOCALE[props.lang])
  const best = exact ?? matching[0] ?? null
  if (best) utterance.voice = best
  window.speechSynthesis.speak(utterance)
}
</script>
```

### Pattern 6: SiteHeader Reset

**What:** Remove `${lang}-progress` from localStorage, then `window.location.reload()`.
**When to use:** SiteHeader reset button handler.

```vue
<script setup lang="ts">
const props = defineProps<{ lang: 'it' | 'es' }>()

function handleReset() {
  localStorage.removeItem(`${props.lang}-progress`)
  window.location.reload()
}
</script>
```

Note: No `import.meta.client` guard needed here — the reset button is interactive (user-triggered), so it can only fire on the client. `window.location.reload()` is safe in click handlers.

### Pattern 7: Dropdown Toggle with ref

**What:** `ref(false)` for open/close toggle, replacing React's `useState(false)`.
**When to use:** SiteHeader language dropdown.

```vue
<script setup lang="ts">
const dropdownOpen = ref(false)
</script>

<template>
  <button @click="dropdownOpen = !dropdownOpen">...</button>
  <div v-if="dropdownOpen" @click="dropdownOpen = false">
    <!-- locale links -->
  </div>
</template>
```

### Pattern 8: LevelFilterChips v-model Emit

**What:** `emit('update:activeLevels', newValue)` enables `v-model:activeLevels` on parent.
**When to use:** LevelFilterChips only.

```vue
<script setup lang="ts">
import type { Level } from '~/types'
const props = defineProps<{ activeLevels: Level[] }>()
const emit = defineEmits<{ 'update:activeLevels': [levels: Level[]] }>()

function toggle(level: Level) {
  if (props.activeLevels.includes(level)) {
    emit('update:activeLevels', props.activeLevels.filter(l => l !== level))
  } else {
    emit('update:activeLevels', [...props.activeLevels, level])
  }
}
</script>
```

Note: The FLTR-06 guard (cannot deselect all levels) lives in `useLevelFilter.setActiveLevels()` — NOT duplicated in this component.

### Pattern 9: Component Testing with mountSuspended

**What:** `mountSuspended` from `@nuxt/test-utils/runtime` initializes the full Nuxt runtime, making `useI18n()` and `useRoute()` available in component tests without additional mocking.
**When to use:** All component tests in `tests/nuxt/`.

```typescript
// Source: existing tests/nuxt/smoke.test.ts pattern
import { mountSuspended } from '@nuxt/test-utils/runtime'

it('renders correct button text', async () => {
  const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
  const wrapper = await mountSuspended(ChoiceButton, {
    props: { text: 'Ciao', state: 'idle' }
  })
  expect(wrapper.text()).toContain('Ciao')
})
```

For components using `useRoute()` (SiteHeader), the nuxt test environment provides a default route. Specific path values can be tested by setting `route.path` via the `route` option or by testing the computed logic directly.

### Anti-Patterns to Avoid

- **`$t()` in templates:** Locked decision says use `t` from `useI18n()` only — never `$t()`.
- **`useScope: 'local'` in useI18n:** No per-component namespacing — all keys are global dotted paths.
- **Nested `<button>` elements:** ChoiceButton uses `<span role="button">` for the speaker icon — keep this to avoid invalid HTML (nested interactive elements).
- **`import.meta.server` instead of `import.meta.client`:** Always use `import.meta.client` for the positive guard (consistent with Phases 20–22).
- **Duplicating FLTR-06 guard in LevelFilterChips:** The guard lives exclusively in `useLevelFilter.setActiveLevels()`. The component emits without any validation.
- **Hardcoded locale paths in locale switcher:** Use `NuxtLinkLocale :locale=` — not `<NuxtLink to="/es/">`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale-aware navigation links | Custom `localePath()` calls + `<NuxtLink>` | `<NuxtLinkLocale :locale="...">` | Built into @nuxtjs/i18n, auto-registered globally — zero boilerplate |
| i18n string lookup | Custom translation function | `const { t } = useI18n()` | Auto-imported, handles locale switching reactively |
| Current route path | `window.location.pathname` | `useRoute().path` | SSR-safe, reactive, project pattern |
| Component auto-import | Manual imports in parent pages | Nuxt auto-imports from `app/components/` | All files in `app/components/` are globally available |

**Key insight:** Nuxt's component auto-import means no `import SiteHeader from '~/components/SiteHeader.vue'` is needed anywhere — place the file in `app/components/` and use `<SiteHeader>` directly in templates.

---

## Common Pitfalls

### Pitfall 1: `useRoute()` returns locale-prefixed path

**What goes wrong:** `useRoute().path` for `/it/rephrase/daily` returns `/it/rephrase/daily` (4 segments including the locale), not `/rephrase/daily`. The back-button segment count logic must account for this: `segments.length >= 2` is correct because the locale segment (`it`) counts as segment 0, so a deck page like `/it/rephrase/daily` has `segments = ['it', 'rephrase', 'daily']` (length 3, >= 2 = show back).

**Why it happens:** @nuxtjs/i18n with `strategy: 'prefix'` prefixes all routes with the locale code.

**How to avoid:** The locked decision's formula `segments.length >= 2` is correct for this — `/it/` has `['it']` (length 1, no back) and `/it/rephrase` has `['it', 'rephrase']` (length 2, show back).

**Warning signs:** Back button shows on the home page (e.g., `/it/`).

### Pitfall 2: SiteHeader `lang` prop vs `useI18n().locale`

**What goes wrong:** `useI18n().locale.value` is a Ref<string> not `Lang` — requires a cast to use as a `localStorage` key. The locked decision says `lang` is passed as a prop.

**Why it happens:** The SiteHeader is placed in `app.vue` or a layout, where the parent must determine the current language. The simplest solution at the layout level is to read `useI18n().locale.value as Lang` and pass it as `:lang`.

**How to avoid:** The `lang` prop approach (locked decision) keeps SiteHeader's typing clean — declare `defineProps<{ lang: Lang }>()` and use `props.lang` directly.

### Pitfall 3: FeedbackMessage `null` state requires `v-if` not conditional class

**What goes wrong:** When `state === null`, the React component returns `null` (renders nothing). In Vue, returning nothing from a component is done with `v-if` on the root element or by using `<template v-if>`.

**Why it happens:** Vue SFCs with a single root element can't return null from a function.

**How to avoid:** Wrap the `<p>` in `<template>`: `<template><p v-if="state !== null" ...>{{ t(`study.${state}`) }}</p></template>` — or add `v-if="state"` directly on the `<p>`. Both are valid in Vue 3 (multi-root templates allowed).

### Pitfall 4: `@keydown` modifier syntax difference

**What goes wrong:** React uses `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') ... }}`. Vue uses event modifiers: `@keydown.enter` and `@keydown.space`.

**Why it happens:** Vue template event modifiers eliminate the conditional key check.

**How to avoid:** Use `@keydown.enter.stop="emit('speak')"` and `@keydown.space.stop="emit('speak')"` on the speaker span in ChoiceButton. The `.stop` modifier replaces `e.stopPropagation()`.

### Pitfall 5: Class binding with conditional in Vue

**What goes wrong:** React's `['quiz-btn', state !== 'idle' ? state : ''].filter(Boolean).join(' ')` pattern doesn't translate directly.

**Why it happens:** Vue has built-in object and array class binding syntax.

**How to avoid:** Use object syntax: `:class="['quiz-btn', { [state]: state !== 'idle' }]"` — or `:class="{ 'quiz-btn': true, [state]: state !== 'idle' }"`.

### Pitfall 6: i18n in `nuxt` Vitest project requires locale messages to load

**What goes wrong:** Component tests using `useI18n()` may return key paths instead of translated strings if the message files don't load in the test environment.

**Why it happens:** The `nuxt` Vitest project uses the `nuxt` environment from `@nuxt/test-utils`, which initializes the full Nuxt app including i18n module. The `langDir: '../messages'` path in `nuxt.config.ts` must resolve correctly from the test runner's working directory.

**How to avoid:** The existing test setup (`tests/nuxt/smoke.test.ts` already passing) confirms the `nuxt` environment works. Component tests should assert on rendered text — if strings appear as keys (e.g., `"study.audio"` instead of `"Ascolta"`), it indicates a test environment i18n loading issue. For component unit tests, asserting emits/behavior is more reliable than asserting translated text values.

---

## Code Examples

Verified patterns from official sources and project codebase:

### FeedbackMessage — null state handling in Vue SFC

```vue
<!-- app/components/FeedbackMessage.vue -->
<script setup lang="ts">
type FeedbackState = 'correct' | 'incorrect' | 'heard' | 'notRecognized' | null

const props = defineProps<{ state: FeedbackState }>()
const { t } = useI18n()

const COLOR_CLASS: Record<Exclude<FeedbackState, null>, string> = {
  correct: 'text-green-600',
  incorrect: 'text-red-500',
  heard: 'text-blue-500',
  notRecognized: 'text-gray-500',
}
</script>

<template>
  <p
    v-if="state !== null"
    role="status"
    aria-live="polite"
    :class="`text-sm font-medium text-center ${COLOR_CLASS[state!]}`"
  >
    {{ t(`study.${state}`) }}
  </p>
</template>
```

### MicButton — simplest port

```vue
<!-- app/components/MicButton.vue -->
<script setup lang="ts">
const props = defineProps<{ state: 'idle' | 'listening' | 'error' }>()
const emit = defineEmits<{ press: [] }>()
</script>

<template>
  <button
    type="button"
    :class="`mic-btn${props.state !== 'idle' ? ` mic-btn--${props.state}` : ''}`"
    :aria-label="props.state === 'listening' ? 'Listening\u2026' : 'Start speaking'"
    :aria-pressed="props.state === 'listening'"
    @click.stop="emit('press')"
  >
    🎙
  </button>
</template>
```

### LevelFilterChips — full component

```vue
<!-- app/components/LevelFilterChips.vue -->
<script setup lang="ts">
import type { Level } from '~/types'

const props = defineProps<{ activeLevels: Level[] }>()
const emit = defineEmits<{ 'update:activeLevels': [levels: Level[]] }>()
const { t } = useI18n()

const LEVELS: Level[] = ['A1', 'A2']

function toggle(level: Level) {
  if (props.activeLevels.includes(level)) {
    emit('update:activeLevels', props.activeLevels.filter(l => l !== level))
  } else {
    emit('update:activeLevels', [...props.activeLevels, level])
  }
}
</script>

<template>
  <div class="level-filter" :aria-label="t('filter.label')">
    <button
      v-for="level in LEVELS"
      :key="level"
      :class="`filter-chip${props.activeLevels.includes(level) ? ' active' : ''}`"
      :aria-pressed="props.activeLevels.includes(level)"
      @click="toggle(level)"
    >
      {{ t(`filter.chips.${level}`) }}
    </button>
  </div>
</template>
```

### i18n key verification — messages already match dotted-key format

The existing `messages/it.json` and `messages/es.json` use nested JSON objects that @nuxtjs/i18n flattens to dotted keys. Confirmed key mapping from the message files:

| Call | Key in JSON | Resolved value (it) |
|------|-------------|---------------------|
| `t('nav.back')` | `nav.back` | `← Indietro` |
| `t('study.audio')` | `study.audio` | `Ascolta` |
| `t('study.correct')` | `study.correct` | `Corretto` |
| `t('study.incorrect')` | `study.incorrect` | `Sbagliato` |
| `t('study.heard')` | `study.heard` | `Sentito` |
| `t('study.notRecognized')` | `study.notRecognized` | `Non riconosciuto` |
| `t('filter.label')` | `filter.label` | `Livello` |
| `t('filter.chips.A1')` | `filter.chips.A1` | `A1` |
| `t('filter.chips.A2')` | `filter.chips.A2` | `A2` |
| `t('nav.logo')` | `nav.logo` | `Italiano` |
| `t('nav.reset')` | `nav.reset` | `Reset` |
| `t('deckCardCount', { count: n })` | `deckCardCount` | `{count} carte` → `5 carte` |

All keys exist in both `it.json` and `es.json`. No message file changes needed.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React callback props (`onClick`, `onPress`) | Vue `defineEmits` + `emit('event')` | Phase 23 (this phase) | Parent uses `@click="handler"` instead of `:onClick="handler"` |
| `useTranslations('namespace')` (next-intl) | `useI18n()` with dotted keys | Phase 23 (this phase) | No namespace scope; all keys prefixed manually |
| `useState(false)` (React) | `ref(false)` (Vue 3) | Phase 23 (this phase) | Same semantics, different API |
| `usePathname()` (Next.js) | `useRoute().path` (Nuxt 4) | Phase 23 (this phase) | Returns full locale-prefixed path |
| `router.refresh()` (Next.js) | `window.location.reload()` | Phase 23 (locked decision) | Full page reload |
| `typeof window === 'undefined'` SSR guard | `import.meta.client` | Phase 20 (locked) | More idiomatic in Nuxt 4 |

**Deprecated/outdated:**
- `process.client`: Replaced by `import.meta.client` in Nuxt 3+. Never use.
- `$t()` template global: Locked decision disallows it — use `t` from `useI18n()` only.

---

## Open Questions

1. **SiteHeader `lang` prop source in app.vue / layouts**
   - What we know: Locked decision says `lang` is passed as a prop to SiteHeader. The `langDir` and i18n module are wired in `nuxt.config.ts`.
   - What's unclear: The phase does not include adding SiteHeader to `app.vue` or a layout — it only requires the component to work correctly. The parent wiring happens in Phase 24 when pages are assembled.
   - Recommendation: The plan should create SiteHeader as a standalone component with a `lang` prop. The planner can add a task to verify it renders in the test environment without worrying about the layout integration yet.

2. **SiteHeader test for `useRoute()` path logic**
   - What we know: `mountSuspended` initializes the full Nuxt runtime. The default route in the test environment has `path = '/'`.
   - What's unclear: Whether `mountSuspended` accepts a `route` option to override the current route path for testing back-button visibility.
   - Recommendation: Test the back-button logic by inspecting `wrapper.find('.nav-back-btn')` with the default route (no back button expected on `/`). For deeper path testing, the `route` mounting option from `@nuxt/test-utils` v4 should work: `mountSuspended(SiteHeader, { props: { lang: 'it' }, route: '/it/rephrase' })`. If that fails, test the computed logic in isolation.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + @nuxt/test-utils 4.0.0 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `bun run test --project nuxt` |
| Full suite command | `bun run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | ChoiceButton renders text, emits `click` and `speak` | unit | `bun run test --project nuxt tests/nuxt/ChoiceButton.test.ts` | Wave 0 |
| UI-01 | AudioButton renders with correct aria-label (i18n), speak() fires SpeechSynthesis | unit | `bun run test --project nuxt tests/nuxt/AudioButton.test.ts` | Wave 0 |
| UI-01 | MicButton renders with correct class based on state, emits `press` | unit | `bun run test --project nuxt tests/nuxt/MicButton.test.ts` | Wave 0 |
| UI-01 | FeedbackMessage renders null when state=null, renders colored text otherwise | unit | `bun run test --project nuxt tests/nuxt/FeedbackMessage.test.ts` | Wave 0 |
| UI-01 | LevelFilterChips renders both chips, emits `update:activeLevels` on toggle | unit | `bun run test --project nuxt tests/nuxt/LevelFilterChips.test.ts` | Wave 0 |
| UI-02 | SiteHeader renders logo text from i18n, shows locale dropdown, back button visibility | unit | `bun run test --project nuxt tests/nuxt/SiteHeader.test.ts` | Wave 0 |
| UI-02 | `nuxi generate` produces locale JSON without 404 | smoke | manual `nuxi generate && npx serve .output/public` | N/A — manual |

### Sampling Rate

- **Per task commit:** `bun run test --project nuxt`
- **Per wave merge:** `bun run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/nuxt/ChoiceButton.test.ts` — covers UI-01 ChoiceButton
- [ ] `tests/nuxt/AudioButton.test.ts` — covers UI-01 AudioButton
- [ ] `tests/nuxt/MicButton.test.ts` — covers UI-01 MicButton
- [ ] `tests/nuxt/FeedbackMessage.test.ts` — covers UI-01 FeedbackMessage
- [ ] `tests/nuxt/LevelFilterChips.test.ts` — covers UI-01 LevelFilterChips
- [ ] `tests/nuxt/SiteHeader.test.ts` — covers UI-02 SiteHeader i18n and locale switcher

Framework and test infrastructure already installed — no new packages needed.

---

## Sources

### Primary (HIGH confidence)

- Installed package: `node_modules/@nuxtjs/i18n/dist/module.mjs` — confirmed `NuxtLinkLocale` registered via `addComponent`
- Installed package: `node_modules/@nuxtjs/i18n/dist/runtime/components/NuxtLinkLocale.d.ts` — confirmed `:locale` prop type
- Project source: `app/composables/useSRS.ts`, `useVoiceRecognition.ts` — established `import.meta.client`, `onMounted`, `ref`, `computed` patterns
- Project source: `messages/it.json`, `messages/es.json` — confirmed all required keys present
- Project source: `nuxt.config.ts` — confirmed `langDir: '../messages'` wiring
- Project source: `app/pages/rephrase/[deck].vue` — confirmed `$route.params` works in templates

### Secondary (MEDIUM confidence)

- Official docs: [i18n.nuxtjs.org/docs/components/nuxt-link-locale](https://i18n.nuxtjs.org/docs/components/nuxt-link-locale) — `:locale` prop, `to` prop, built on `<NuxtLink>`
- Official docs: [i18n.nuxtjs.org/docs/getting-started/usage](https://i18n.nuxtjs.org/docs/getting-started/usage) — `useI18n()` auto-imported, `const { t } = useI18n()` pattern

### Tertiary (LOW confidence)

- None required — all critical claims verified from installed packages and project source.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages installed; versions confirmed from `package.json`
- Architecture: HIGH — patterns derived from existing composables and source components; no speculative patterns
- Pitfalls: HIGH — derived from direct code inspection of React source + Vue equivalents; class binding and null-render patterns are standard Vue 3
- i18n key compatibility: HIGH — all keys verified against actual `messages/it.json` and `messages/es.json`
- NuxtLinkLocale auto-import: HIGH — confirmed via `module.mjs` inspection in `node_modules`

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable toolchain, no fast-moving dependencies)
