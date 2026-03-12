# Phase 22: Composables - Research

**Researched:** 2026-03-12
**Domain:** Vue 3 composables, Nuxt 4 SSR guards, @nuxt/test-utils composable testing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Test strategy:**
- Tests live in `tests/nuxt/` — matches the existing Vitest `nuxt` project config (`include: ['tests/nuxt/**/*.{test,spec}.ts']`)
- Use `mountSuspended` from `@nuxt/test-utils` — runs in full Nuxt environment, handles `onMounted` correctly
- Keep React hook tests in `src/__tests__/hooks/` intact alongside Vue tests — they document the behavioral contract to match during the port
- Vue composable tests mirror the React test cases exactly (same assertions, translated to Vue) — coverage gaps are obvious this way

**useLevelFilter dependency wiring:**
- Accept `hasProgress` as a `Ref<boolean>` parameter — same contract as the React hook; caller (the page) computes `hasProgress` from `useSRS` and passes it in
  ```ts
  // Page:
  const { hasProgress } = useSRS(lang)
  const { activeLevels } = useLevelFilter(lang, hasProgress)
  ```
- `activeLevels` initializes as `null` and is set in `onMounted`:
  ```ts
  const activeLevels = ref<Level[] | null>(null)
  onMounted(() => {
    const saved = loadFilter(lang)
    activeLevels.value = saved ?? (hasProgress.value ? ['A1', 'A2'] : ['A1'])
  })
  ```
- `lang` is a plain `Lang` string parameter (not `Ref<Lang>`) — lang doesn't change mid-session
- FLTR-06 guard lives in the composable: `setActiveLevels([])` or `setActiveLevels(null)` is a silent no-op — guard is enforced regardless of which component calls it

**Shared storage utilities:**
- `loadFromStorage` / `saveToStorage` kept inline per-composable — matches the React source structure; `useSRS` and `useQASRS` each have their own copy
- `useLevelFilter` has its own separate inline `loadFilter` / `saveFilter` (different key format and data shape: `Level[]` not `ProgressRecord`)
- Silent fail on storage errors: `catch {}` swallows quota exceeded / private browsing failures — consistent with v1.1 and v1.3 behavior
- `app/lib/` copies files from `src/lib/` (composables import from `~/lib/`); the Nuxt app does not import from `src/` directly

**useVoiceRecognition hydration:**
- Accept the `isSupported: false → true` flash — matches React v1.3 behavior, no user complaint in production:
  ```ts
  const isSupported = ref(false)
  onMounted(() => {
    isSupported.value = !!getSpeechRecognition()
  })
  ```
- `SpeechRecognition` instantiated inside `startListening` (not in `onMounted`) — only creates the object when the user taps the mic; matches the React hook
- `LANG_LOCALE` map (`it → it-IT`, `es → es-ES`) stays inline in the composable — single consumer, no shared file needed
- Include a test with `mountSuspended`: verify `isSupported` is false SSR-side and true client-side when `SpeechRecognition` is mocked on `window`

### Claude's Discretion
- Exact shape of the `mountSuspended` wrapper in tests (component vs. composable helper pattern)
- Whether tests/nuxt/ uses subdirectories (e.g., `tests/nuxt/composables/`) or flat files
- Cleanup of the `recognitionRef` on composable unmount (if needed to prevent memory leaks)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | `useSRS` composable ported to Vue — all localStorage reads inside `onMounted`, `import.meta.client` guards, existing test contract and `${lang}-progress` key format preserved | React source fully read; React→Vue translation map documented below; key format `${lang}-progress` confirmed |
| COMP-02 | `useLevelFilter` composable ported to Vue — A1/A2 filter state, new/returning user defaults, FLTR-06 guard, localStorage persistence | React source and all test cases read; `hasProgress` as `Ref<boolean>` pattern documented; `${lang}-level-filter` key confirmed |
| COMP-03 | `useQASRS` composable ported to Vue — `qa_`-prefixed SRS keys, level filtering, Leitner intervals, `onMounted` guards | React source read; `useMemo` → `computed` mapping documented; `qa_${scenarioId}_${cardId}` key format confirmed |
| COMP-04 | `useVoiceRecognition` composable ported to Vue — `SpeechRecognition` instantiation inside `onMounted`; used inside `<ClientOnly>` contexts only | React source read; `useEffect` → `onMounted` mapping; `useRef` → `ref` mapping; SpeechRecognition mock pattern from existing setup.ts documented |
</phase_requirements>

---

## Summary

Phase 22 is a mechanical port of four React hooks to Vue 3 composables. All source files are fully read and the translation map is well-understood: `useState` → `ref`, `useCallback` → plain function, `useMemo` → `computed`, `useEffect([])` → `onMounted`. The primary SSR concern — localStorage and SpeechRecognition must never be accessed at module evaluation time — is resolved by `onMounted` guards, matching the locked pattern from Phase 20.

The one structural difference from the React hooks is that `useSRS` cannot initialize `progress` from localStorage in the `ref()` initializer (as React's `useState(() => ...)` lazy initializer does). Instead, `progress` starts as `ref<ProgressRecord>({})` and is populated in `onMounted`. This means `hasProgress` and `isCardDueForDeck` will return their "empty" values during SSR and the first render cycle before `onMounted` fires — this is acceptable because study pages are wrapped in `<ClientOnly>`.

The test pattern is resolved: create a minimal dummy `.vue` component (`defineComponent` + `<script setup>` + empty `<template>`) that calls the composable and exposes return values through the component's exposed interface. Mount with `await mountSuspended(TestWrapper)` and access state via `wrapper.vm`. The `tests/nuxt/` project uses `happy-dom`, which provides a real `localStorage` implementation — no mock needed there (unlike the `unit` project which uses a custom mock in `setup.ts`).

The `app/lib/` directory must be created as a copy of `src/lib/` so composables can import from `~/lib/srs` (which resolves to `app/lib/srs` in Nuxt 4's `srcDir = app/` convention). The `~~` alias resolves to the repo root, so `~~/*` can reach `src/` if needed, but the locked decision is to copy into `app/lib/` instead.

**Primary recommendation:** Port all four composables in `app/composables/`, create `app/lib/` copies of `srs.ts` and `generateChoices.ts`, write `tests/nuxt/` tests using the dummy-component wrapper pattern with `mountSuspended`, and run `bun run vitest run --project nuxt` to verify.

---

## Standard Stack

### Core (all already installed — no new packages)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vue | (via nuxt 4.2.2) | `ref`, `computed`, `onMounted`, `onUnmounted` | Built-in Vue 3 composition API |
| nuxt | ^4.2.2 | `import.meta.client` SSR guard idiom | Nuxt-recommended pattern (Phase 20 locked) |
| @nuxt/test-utils | ^4.0.0 | `mountSuspended` for composable tests in Nuxt env | Only way to run `onMounted` in Vitest Nuxt project |
| @vue/test-utils | ^2 | Underlying mount utilities used by mountSuspended | Auto-installed with @nuxt/test-utils |
| happy-dom | ^20.8.4 | DOM environment for `nuxt` Vitest project | Provides real localStorage, required by @nuxt/test-utils |
| vitest | ^4.0.18 | Test runner | Already configured |

**No new packages required for Phase 22.**

### Installation
```bash
# Nothing to install — all dependencies present
bun run vitest run --project nuxt   # verify test infra works
```

---

## Architecture Patterns

### Recommended File Structure
```
app/
├── composables/
│   ├── useSRS.ts              # COMP-01
│   ├── useLevelFilter.ts      # COMP-02
│   ├── useQASRS.ts            # COMP-03
│   └── useVoiceRecognition.ts # COMP-04
└── lib/
    ├── srs.ts                 # copy of src/lib/srs.ts
    └── generateChoices.ts     # copy of src/lib/generateChoices.ts

tests/nuxt/
├── smoke.test.ts              # existing
├── useSRS.test.ts             # COMP-01 tests
├── useLevelFilter.test.ts     # COMP-02 tests
├── useQASRS.test.ts           # COMP-03 tests
└── useVoiceRecognition.test.ts # COMP-04 tests
```

(Flat files in `tests/nuxt/` rather than a composables/ subdirectory — matches the existing smoke.test.ts convention and keeps the `nuxt` project include pattern `tests/nuxt/**/*.{test,spec}.ts` unchanged.)

### Pattern 1: React → Vue Translation Map

| React | Vue | Notes |
|-------|-----|-------|
| `useState<T>(initializer)` | `ref<T>(initialValue)` | Lazy initializer becomes `onMounted` body |
| `useState<T>(() => loadFromStorage())` | `ref<T>({})` + `onMounted(() => { state.value = load() })` | CRITICAL: no lazy init from localStorage in Vue |
| `useCallback(fn, [deps])` | Plain function (closure over refs) | No memoization needed — Vue tracks deps via reactivity |
| `useMemo(() => compute(), [deps])` | `computed(() => compute())` | Reactive equivalence; deps tracked automatically |
| `useEffect(() => { ... }, [])` | `onMounted(() => { ... })` | Runs once after first render, client-side only |
| `useRef(null)` | `ref<T \| null>(null)` | Same semantics; access via `.value` |
| `setX(prev => ...)` | `x.value = ...` | No functional updater needed in Vue |

### Pattern 2: SSR-Safe Composable Structure

The standard shape for all four composables:

```typescript
// Source: Phase 20 locked pattern + CONTEXT.md decisions
export function useComposableName(lang: Lang) {
  // 1. All state initialized to safe SSR defaults
  const progress = ref<ProgressRecord>({})

  // 2. Browser access ONLY inside onMounted
  onMounted(() => {
    progress.value = loadFromStorage(lang)
  })

  // 3. Functions are plain closures — access .value inside
  function updateCard(deckId: DeckId, cardIndex: number, isCorrect: boolean) {
    const key = getCardKey(deckId, cardIndex)
    progress.value = { ...progress.value, [key]: advanceBox(progress.value[key], isCorrect) }
    saveToStorage(lang, progress.value)
  }

  // 4. Derived state as computed
  const hasProgress = computed(() => Object.keys(progress.value).length > 0)

  return { progress, updateCard, hasProgress }
}
```

### Pattern 3: Dummy Component Wrapper for mountSuspended Tests

`mountSuspended` mounts a Vue component — it cannot directly invoke a bare function. The standard pattern is a minimal wrapper component:

```typescript
// Source: @nuxt/test-utils docs + community convention
import { defineComponent, ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useSRS } from '~/composables/useSRS'

// Wrapper that exposes composable return values via defineExpose
const TestWrapper = defineComponent({
  setup() {
    const result = useSRS('it')
    return result   // all keys of the return value become accessible on wrapper.vm
  },
  template: '<div />',
})

it('starts with empty progress', async () => {
  const wrapper = await mountSuspended(TestWrapper)
  // onMounted has fired by the time mountSuspended resolves
  expect(wrapper.vm.hasProgress).toBe(false)
})
```

**Key insight:** `mountSuspended` resolves after `onMounted` has fired. The returned `wrapper.vm` exposes the composable's return value. No `nextTick()` calls needed for `onMounted` effects — they are already applied when `await mountSuspended(...)` resolves.

### Pattern 4: useLevelFilter Initialization in Vue (null guard)

The locked decision initializes `activeLevels` as `null` until `onMounted` fires. Tests must account for the initial `null` state before mounting resolves:

```typescript
// app/composables/useLevelFilter.ts
export function useLevelFilter(lang: Lang, hasProgress: Ref<boolean>) {
  const activeLevels = ref<Level[] | null>(null)

  onMounted(() => {
    const saved = loadFilter(lang)
    activeLevels.value = saved ?? (hasProgress.value ? ['A1', 'A2'] : ['A1'])
  })

  function setActiveLevels(levels: Level[] | null) {
    // FLTR-06: silent no-op if result would be empty
    if (!levels || levels.length === 0) return
    activeLevels.value = levels
    try {
      localStorage.setItem(getFilterKey(lang), JSON.stringify(levels))
    } catch { /* silent fail */ }
  }

  return { activeLevels, setActiveLevels }
}
```

Test assertions after `mountSuspended` resolves — `activeLevels` will be non-null at that point.

### Pattern 5: useQASRS — computed dueCards

`useMemo` in React maps directly to `computed` in Vue. The `dueCards` computed ref re-evaluates whenever `progress`, `activeLevels`, or `cards` change:

```typescript
// app/composables/useQASRS.ts
const dueCards = computed(() =>
  cards.filter(
    card =>
      activeLevels.includes(card.level) &&
      isCardDue(progress.value[getQACardKey(scenarioId, card.id)])
  )
)
```

Note: `activeLevels` is passed as `Level[]` (plain array, not a ref) — caller passes `activeLevels.value` from `useLevelFilter`. This matches the React hook signature exactly.

### Pattern 6: Library Imports in app/composables/

Composables use `~/lib/srs` (resolves to `app/lib/srs.ts` via Nuxt's `~` alias for `app/`):

```typescript
// app/composables/useSRS.ts
import { getCardKey, advanceBox, isCardDue } from '~/lib/srs'
import type { DeckId, Lang, ProgressRecord } from '~/types'   // app/types — if types are moved
// OR: use src/types via ~~ alias
import type { DeckId, Lang, ProgressRecord } from '@@/src/types'
```

The `~~` alias resolves to the repo root. `@@/src/types` would reach `src/types/index.ts` without copying. However, the locked decision is to copy lib files into `app/lib/`. For types, the simplest approach is also to copy `src/types/index.ts` into `app/types/index.ts`, avoiding `@@` paths entirely.

### Anti-Patterns to Avoid

- **Accessing localStorage in ref() initializer:** `ref(() => localStorage.getItem('x'))` — this runs at module eval time during SSR, causing `ReferenceError: localStorage is not defined`. Always use `onMounted`.
- **`import.meta.server` as branch condition inside composables:** Prefer `onMounted` over `if (import.meta.client)` for storage reads — `onMounted` never runs on server, making the guard implicit and cleaner.
- **Returning `progress` directly from composable without `.value` access inside functions:** Functions must read `progress.value` (not `progress`) since it's a ref.
- **`computed` for dueCards inside a study session (Phase 25 concern):** `useQASRS` correctly returns `computed` — callers snapshot it in `onMounted`. This composable does the right thing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSR detection | Custom `typeof window !== 'undefined'` branches throughout composables | `onMounted` guard (all localStorage access inside onMounted) | Nuxt-idiomatic; `onMounted` never runs on server; simpler than branching |
| Reactive memoization | Manual caching of filtered card list | `computed(() => cards.filter(...))` | Vue reactivity handles invalidation; exact React `useMemo` equivalent |
| Composable test harness | Custom helper that calls composable outside component context | Dummy `defineComponent` wrapper + `mountSuspended` | Nuxt test env correctly handles onMounted; composables outside component context miss lifecycle hooks |
| localStorage mock in nuxt project | Custom mock object (like the unit project's setup.ts mock) | `happy-dom` real localStorage | happy-dom implements localStorage natively; no setup.ts needed for nuxt project |

---

## Common Pitfalls

### Pitfall 1: localStorage Read at ref() Initialization Time
**What goes wrong:** `nuxi generate` throws `ReferenceError: localStorage is not defined` and exits non-zero.
**Why it happens:** `ref(() => loadFromStorage(lang))` — the lazy initializer runs synchronously at module evaluation time on the server. `localStorage` is not defined in the Node.js environment used by Nitro.
**How to avoid:** Initialize all refs to empty defaults (`ref({})`, `ref(false)`, `ref<Level[] | null>(null)`). Populate from localStorage only inside `onMounted`.
**Warning signs:** `nuxi generate` error log containing "localStorage is not defined" or "window is not defined".

### Pitfall 2: Forgetting that mountSuspended Returns After onMounted
**What goes wrong:** Test asserts `activeLevels` is `null` expecting SSR state, but it's already `['A1']` because `mountSuspended` waits for the component to fully mount.
**Why it happens:** `mountSuspended` resolves after `Suspense` boundaries settle and `onMounted` hooks fire. The component is client-side by the time assertions run.
**How to avoid:** Write assertions for the post-mount state. If you need to test the SSR initial state (e.g., `isSupported: false`), test the composable's initial `ref` values directly in a separate unit test, not via `mountSuspended`.
**Warning signs:** Tests that `expect(wrapper.vm.activeLevels).toBeNull()` after `await mountSuspended(...)` — these will fail.

### Pitfall 3: Types and lib imports from src/ in app/ context
**What goes wrong:** TypeScript errors "Cannot find module '~/lib/srs'" or "Cannot find module '@/types'" in composable files.
**Why it happens:** In Nuxt 4, `~` resolves to `app/` (srcDir). `@` is NOT auto-configured by Nuxt to point to `src/`. Composables in `app/composables/` cannot use `@/lib/srs` — that alias only exists in the Vitest `unit` project config.
**How to avoid:**
  - Copy `src/lib/srs.ts` and `src/lib/generateChoices.ts` into `app/lib/` — then import with `~/lib/srs`.
  - Copy `src/types/index.ts` into `app/types/index.ts` — then import types with `~/types`.
  - Alternatively, use `@@/src/lib/srs` (`@@` = repo root) but the locked decision is the copy approach.
**Warning signs:** Red squiggles in `app/composables/*.ts` on any `@/...` import path.

### Pitfall 4: Calling Composable Outside Component Context in Tests
**What goes wrong:** Error "getCurrentInstance() was called outside of a component context" when calling a composable directly in a test's top-level `it()` body.
**Why it happens:** Vue 3 composables that use `onMounted`, `computed`, or other composition API functions require an active component instance. Calling them outside `setup()` throws.
**How to avoid:** Always wrap composable under test in a `defineComponent({ setup() { return useXxx() }, template: '<div />' })` and mount with `mountSuspended`.
**Warning signs:** Error about "getCurrentInstance" or "inject() can only be used inside setup()".

### Pitfall 5: hasProgress as computed vs plain boolean in useSRS
**What goes wrong:** Downstream consumers (useLevelFilter) receive `hasProgress` as a plain boolean snapshot instead of a reactive ref, and don't update when progress changes.
**Why it happens:** `return { hasProgress: Object.keys(progress.value).length > 0 }` — evaluated once at call time, not reactive.
**How to avoid:** Return `hasProgress` as a `computed(() => Object.keys(progress.value).length > 0)`. Callers receive a `ComputedRef<boolean>` — pass as `hasProgress` ref into `useLevelFilter(lang, hasProgress)`.
**Warning signs:** `useLevelFilter` defaults don't update after `useSRS.updateCard` is called for the first time.

### Pitfall 6: useQASRS activeLevels as Ref vs plain array
**What goes wrong:** `dueCards` computed never updates when `activeLevels` changes because the plain array reference doesn't change.
**Why it happens:** If `activeLevels` from `useLevelFilter` is passed as `.value` (a snapshot), changing the filter doesn't trigger `dueCards` recomputation.
**How to avoid:** Pages pass `activeLevels` ref (not `.value`) into `useQASRS`, and the computed reads `activeLevels.value` inside. OR: pass as plain `Level[]` if the session snapshots both at load time. Match the React hook signature — React's `activeLevels` was `Level[]`, so pass `activeLevels.value` at session start; OR make `useQASRS` accept `Ref<Level[]>` and read `.value` inside the computed.
**Warning signs:** Changing the level filter in the UI doesn't update the due card count on the scenario page.

---

## Code Examples

### useSRS — Complete Vue Port

```typescript
// app/composables/useSRS.ts
// Source: direct port of src/hooks/useSRS.ts
import { ref, computed, onMounted } from 'vue'
import type { DeckId, Lang, ProgressRecord } from '~/types'
import { getCardKey, advanceBox, isCardDue } from '~/lib/srs'

function getStorageKey(lang: Lang): string {
  return `${lang}-progress`
}

function loadFromStorage(lang: Lang): ProgressRecord {
  try {
    const saved = localStorage.getItem(getStorageKey(lang))
    return saved ? (JSON.parse(saved) as ProgressRecord) : {}
  } catch {
    return {}
  }
}

function saveToStorage(lang: Lang, record: ProgressRecord): void {
  try {
    localStorage.setItem(getStorageKey(lang), JSON.stringify(record))
  } catch { /* silent fail */ }
}

export function useSRS(lang: Lang) {
  const progress = ref<ProgressRecord>({})

  onMounted(() => {
    progress.value = loadFromStorage(lang)
  })

  function updateCard(deckId: DeckId, cardIndex: number, isCorrect: boolean) {
    const key = getCardKey(deckId, cardIndex)
    progress.value = { ...progress.value, [key]: advanceBox(progress.value[key], isCorrect) }
    saveToStorage(lang, progress.value)
  }

  function isCardDueForDeck(deckId: DeckId, cardIndex: number): boolean {
    const key = getCardKey(deckId, cardIndex)
    return isCardDue(progress.value[key])
  }

  const hasProgress = computed(() => Object.keys(progress.value).length > 0)

  return { progress, updateCard, isCardDueForDeck, hasProgress }
}
```

### useSRS Test Pattern

```typescript
// tests/nuxt/useSRS.test.ts
import { defineComponent } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'
import { useSRS } from '~/composables/useSRS'

function makeWrapper(lang: 'it' | 'es') {
  return defineComponent({
    setup() { return useSRS(lang) },
    template: '<div />',
  })
}

beforeEach(() => localStorage.clear())

describe('useSRS initial state', () => {
  it('starts with empty progress for new user', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    expect(wrapper.vm.hasProgress).toBe(false)
  })

  it('isCardDueForDeck returns true for a new card', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    expect(wrapper.vm.isCardDueForDeck('daily', 0)).toBe(true)
  })
})

describe('useSRS updateCard', () => {
  it('persists to localStorage under {lang}-progress key', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    wrapper.vm.updateCard('daily', 0, true)
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}')
    expect(stored['daily_0'].box).toBe(2)
    expect(stored['daily_0'].nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

### useVoiceRecognition — SpeechRecognition mock for nuxt project

The `unit` project has a SpeechRecognition mock in `src/__tests__/setup.ts`. The `nuxt` project has no shared setup file by default. Tests in `tests/nuxt/` that need SpeechRecognition mocked must set it up inline or use a shared `tests/nuxt/setup.ts` (added to the nuxt project's `setupFiles`).

```typescript
// tests/nuxt/useVoiceRecognition.test.ts
import { defineComponent } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVoiceRecognition } from '~/composables/useVoiceRecognition'

// Inline mock — mirrors the React test's MockSpeechRecognition
const mockInstance = {
  start: vi.fn(), stop: vi.fn(),
  lang: '', continuous: false, interimResults: false,
  onstart: null as (() => void) | null,
  onend: null as (() => void) | null,
  onresult: null as ((e: { results: [[{ transcript: string }]] }) => void) | null,
  onerror: null as ((e: { error: string }) => void) | null,
}
const MockSpeechRecognition = vi.fn(() => mockInstance)

beforeEach(() => {
  Object.defineProperty(window, 'SpeechRecognition', {
    value: MockSpeechRecognition,
    writable: true,
    configurable: true,
  })
  MockSpeechRecognition.mockClear()
  mockInstance.onstart = null
  mockInstance.onend = null
})

it('isSupported is true when SpeechRecognition is on window', async () => {
  const wrapper = await mountSuspended(
    defineComponent({ setup() { return useVoiceRecognition('it') }, template: '<div />' })
  )
  expect(wrapper.vm.isSupported).toBe(true)
})

it('isSupported is false when SpeechRecognition is absent', async () => {
  Object.defineProperty(window, 'SpeechRecognition', { value: undefined, writable: true, configurable: true })
  const wrapper = await mountSuspended(
    defineComponent({ setup() { return useVoiceRecognition('it') }, template: '<div />' })
  )
  expect(wrapper.vm.isSupported).toBe(false)
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `typeof window !== 'undefined'` guard | `onMounted` guard | Nuxt 4 convention (Phase 20) | Cleaner; no branching in main code paths |
| `process.client` check | `import.meta.client` | Nuxt 4 (Nitro uses ESM) | `process.client` is Nuxt 3 — use `import.meta.client` if an explicit guard is needed outside `onMounted` |
| `@nuxt/test-utils` v3 `setup` helper | `mountSuspended` + dummy component | @nuxt/test-utils v4 | v4 removed some lower-level helpers; `mountSuspended` is the canonical entry point |

**Deprecated/outdated:**
- `process.client`: Nuxt 3 pattern. In Nuxt 4, `import.meta.client` is the correct idiom.
- `renderHook` from `@testing-library/react`: React-only. Vue equivalent is `mountSuspended` with a dummy component.
- Lazy `useState` initializer for browser reads: React pattern, not applicable in Vue — use `onMounted`.

---

## Open Questions

1. **useQASRS activeLevels parameter type: `Level[]` or `Ref<Level[]>`**
   - What we know: React hook accepts `Level[]` (plain array). Vue's `computed` for `dueCards` needs to react to filter changes. Pages pass `activeLevels.value` from `useLevelFilter` at mount time, OR pass the ref and read `.value` inside.
   - What's unclear: Whether the session page will pass `activeLevels.value` (snapshot at load) or the live ref. Phase 25 context (snapshotting `dueCards`) suggests the session loads once and doesn't respond to filter changes mid-session — so `Level[]` snapshot is fine.
   - Recommendation: Accept `Level[]` (matching React hook) for consistency. Document that the caller should pass `activeLevels.value` (unwrapped). This keeps the composable signature simple. If reactivity to live filter changes is needed in grid views, the caller can wrap in a `watchEffect`.

2. **app/types/ copy vs @@/src/types import**
   - What we know: `~~` resolves to repo root; `@@/src/types` would import from `src/types/index.ts` without copying.
   - What's unclear: Whether TypeScript in `app/` context correctly resolves `@@/src/types` through `.nuxt/tsconfig.app.json` paths.
   - Recommendation: Copy `src/types/index.ts` to `app/types/index.ts` and import from `~/types`. This is explicit, avoids alias path fragility, and matches the locked `app/lib/` copy decision.

3. **onUnmount cleanup for useVoiceRecognition**
   - What we know: `recognitionRef` holds a SpeechRecognition instance. React had no explicit cleanup. CONTEXT.md marks this as Claude's Discretion.
   - What's unclear: Whether not stopping recognition on unmount causes memory leaks or browser warnings.
   - Recommendation: Add `onUnmounted(() => { recognitionRef.value?.stop() })` — one line, prevents dangling recognition sessions, costs nothing. This is a safe improvement over the React hook.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `bun run vitest run --project nuxt` |
| Full suite command | `bun run vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | useSRS: empty progress for new user, localStorage key `it-progress`, `daily_0` key format, box advances, language isolation | unit (nuxt env) | `bun run vitest run --project nuxt tests/nuxt/useSRS.test.ts` | NO — Wave 0 gap |
| COMP-01 | useSRS: `nuxi generate` completes without localStorage error | smoke | `bun run generate` (stdout check) | YES (generate script exists) |
| COMP-02 | useLevelFilter: new user defaults A1, returning user defaults A1+A2, saved value wins, FLTR-06 guard, `it-level-filter` key | unit (nuxt env) | `bun run vitest run --project nuxt tests/nuxt/useLevelFilter.test.ts` | NO — Wave 0 gap |
| COMP-03 | useQASRS: `qa_` prefix keys, level filtering, Leitner intervals, key isolation from Rephrase keys | unit (nuxt env) | `bun run vitest run --project nuxt tests/nuxt/useQASRS.test.ts` | NO — Wave 0 gap |
| COMP-04 | useVoiceRecognition: isSupported false→true on mount, startListening/stopListening, onResult/onError callbacks | unit (nuxt env) | `bun run vitest run --project nuxt tests/nuxt/useVoiceRecognition.test.ts` | NO — Wave 0 gap |

### Sampling Rate
- **Per task commit:** `bun run vitest run --project nuxt`
- **Per wave merge:** `bun run vitest run`
- **Phase gate:** `bun run generate` (no localStorage errors) + `bun run vitest run` (all green) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `app/lib/srs.ts` — copy of `src/lib/srs.ts`; imported by all composables
- [ ] `app/lib/generateChoices.ts` — copy of `src/lib/generateChoices.ts`
- [ ] `app/types/index.ts` — copy of `src/types/index.ts`; imported by all composables
- [ ] `tests/nuxt/useSRS.test.ts` — covers COMP-01
- [ ] `tests/nuxt/useLevelFilter.test.ts` — covers COMP-02
- [ ] `tests/nuxt/useQASRS.test.ts` — covers COMP-03
- [ ] `tests/nuxt/useVoiceRecognition.test.ts` — covers COMP-04

Note: No Vitest config changes needed. The `nuxt` project already includes `tests/nuxt/**/*.{test,spec}.ts`.

---

## Sources

### Primary (HIGH confidence)
- Direct file read: `src/hooks/useSRS.ts`, `useLevelFilter.ts`, `useQASRS.ts`, `useVoiceRecognition.ts` — full source inspected
- Direct file read: `src/__tests__/hooks/useSRS.test.tsx`, `useLevelFilter.test.tsx`, `useQASRS.test.tsx`, `useVoiceRecognition.test.ts` — all test cases read
- Direct file read: `vitest.config.ts` — confirmed `nuxt` project includes `tests/nuxt/**`
- Direct file read: `tests/nuxt/smoke.test.ts` — confirmed `mountSuspended` pattern working
- Direct file read: `.nuxt/tsconfig.app.json` — confirmed `~` → `app/`, `~~` → repo root, `@@` → repo root
- `.planning/phases/22-composables/22-CONTEXT.md` — all locked decisions, code patterns, established idioms
- `.planning/phases/21-pure-logic-and-routing-skeleton/21-RESEARCH.md` — alias concern flagged in Pitfall 3
- `.planning/phases/21-pure-logic-and-routing-skeleton/21-01-SUMMARY.md` — confirmed alias strategy note for Phase 22

### Secondary (MEDIUM confidence)
- [Nuxt 4 Testing docs](https://nuxt.com/docs/4.x/getting-started/testing) — mountSuspended API confirmed, wraps `@vue/test-utils` mount
- [Jérôme Abel — Unit Testing the Composable](https://dev.jeromeabel.net/blog/testing-a-simple-nuxt-feature/07-unit-testing-the-composable/) — dummy component wrapper pattern corroborated

### Tertiary (LOW confidence)
- Community patterns for `defineComponent` test wrapper — consistent across multiple sources, corroborated by Vue Test Utils v2 docs

---

## Metadata

**Confidence breakdown:**
- Standard stack (installed packages, no new deps): HIGH — verified via package.json and direct inspection
- React→Vue translation map: HIGH — all four React hooks read in full; translation is mechanical
- `mountSuspended` dummy component pattern: MEDIUM — confirmed from official docs + community; no official example shows exact composable-under-test pattern
- `~` alias resolving to `app/`: HIGH — verified in `.nuxt/tsconfig.app.json`
- `happy-dom` providing real localStorage in nuxt project: HIGH — happy-dom is a full DOM implementation

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain; @nuxt/test-utils is pinned)
