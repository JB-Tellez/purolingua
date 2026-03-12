# Phase 22: Composables - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Port all four composables — `useSRS`, `useLevelFilter`, `useQASRS`, and `useVoiceRecognition` — from React hooks (`src/hooks/`) to Vue composables (`app/composables/`) with `onMounted` guards so no SSR hydration crash occurs and the existing localStorage key contracts are preserved. No UI components in this phase.

</domain>

<decisions>
## Implementation Decisions

### Test strategy
- Tests live in `tests/nuxt/` — matches the existing Vitest `nuxt` project config (`include: ['tests/nuxt/**/*.{test,spec}.ts']`)
- Use `mountSuspended` from `@nuxt/test-utils` — runs in full Nuxt environment, handles `onMounted` correctly
- Keep React hook tests in `src/__tests__/hooks/` intact alongside Vue tests — they document the behavioral contract to match during the port
- Vue composable tests mirror the React test cases exactly (same assertions, translated to Vue) — coverage gaps are obvious this way

### useLevelFilter dependency wiring
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

### Shared storage utilities
- `loadFromStorage` / `saveToStorage` kept inline per-composable — matches the React source structure; `useSRS` and `useQASRS` each have their own copy
- `useLevelFilter` has its own separate inline `loadFilter` / `saveFilter` (different key format and data shape: `Level[]` not `ProgressRecord`)
- Silent fail on storage errors: `catch {}` swallows quota exceeded / private browsing failures — consistent with v1.1 and v1.3 behavior
- `app/lib/` copies files from `src/lib/` (composables import from `~/lib/`); the Nuxt app does not import from `src/` directly

### useVoiceRecognition hydration
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/hooks/useSRS.ts`: Direct React→Vue port target; all logic moves verbatim except `useState`→`ref`, `useCallback`→plain function, and `typeof window` guard→`onMounted`
- `src/hooks/useLevelFilter.ts`: Same pattern; `useState` initializer that reads localStorage moves into `onMounted`
- `src/hooks/useQASRS.ts`: `useMemo` for `dueCards` → `computed`; `useState`→`ref`; `useCallback`→plain function
- `src/hooks/useVoiceRecognition.ts`: `useEffect` for `isSupported` check → `onMounted`; `useRef` for `recognitionRef` → `ref`
- `src/__tests__/hooks/useSRS.test.tsx`, `useLevelFilter.test.tsx`, `useQASRS.test.tsx`, `useVoiceRecognition.test.ts`: Behavioral contracts to match 1-to-1 in Vue tests
- `src/lib/srs.ts`, `src/lib/generateChoices.ts`: Pure logic — already confirmed framework-neutral (DATA-01 done); composables import from `~/lib/srs`
- `src/types/index.ts`: TypeScript types (`Lang`, `Level`, `DeckId`, `ScenarioId`, `ProgressRecord`, `QACard`) — carry forward unchanged

### Established Patterns
- `onMounted` for all localStorage reads and browser API access (locked from Phase 20 research)
- `import.meta.client` as the SSR guard idiom (locked from Phase 20)
- `bun run test` to run the Vitest suite; `bun run dev` for dev server
- Vitest config already has two projects: `unit` (jsdom, `src/__tests__/lib/**`) and `nuxt` (nuxt env, `tests/nuxt/**`) — composable tests go in the `nuxt` project, no config change needed

### Integration Points
- `app/composables/` — Nuxt auto-imports all composables from this directory; no explicit import statements needed in pages
- `useSRS` → `useLevelFilter` — page calls both and passes `hasProgress` ref from `useSRS` into `useLevelFilter`
- `useQASRS` takes `activeLevels` from `useLevelFilter` — same wiring as React (page coordinates all three)
- `dueCards` in `useQASRS` returns a `computed` ref — study session pages (Phase 25) will snapshot it as `ref` in `onMounted` per the locked pitfall pattern

</code_context>

<specifics>
## Specific Ideas

- No specific UI references — this phase is pure composable logic
- The dueCards-as-computed pitfall is a study session concern (Phase 25, UI-06), not a composable concern — `useQASRS` correctly returns `computed` dueCards; the session snapshots it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-composables*
*Context gathered: 2026-03-12*
