# Phase 21: Pure Logic and Routing Skeleton - Research

**Researched:** 2026-03-12
**Domain:** TypeScript module migration, Vitest project configuration, Nuxt static routing verification
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | `srs.ts`, `generateChoices.ts`, all `data/` card modules, and `types/` copied verbatim from `feat/nextjs-port` with existing Vitest tests passing unchanged | Files already on `vue-port` and identical to source; unit tests already pass (21/21) |
| DATA-02 | All 6 page routes (`/`, `/rephrase`, `/rephrase/[deck]`, `/qa`, `/qa/[scenario]`, plus locale-prefixed equivalents) defined with placeholder templates before any component work begins | All 5 page templates already created in Phase 20; static generation produces 36 routes in `.output/public/` |
</phase_requirements>

---

## Summary

Phase 21 has a deceptively small delta from what Phase 20 already delivered. All pure-logic TypeScript files (`src/lib/srs.ts`, `src/lib/generateChoices.ts`, `src/data/**`, `src/types/index.ts`) are already present on `vue-port` and are byte-for-byte identical to `feat/nextjs-port`. The unit Vitest project covering `src/__tests__/lib/**` runs 21 tests green with zero failures. The placeholder page files for all 5 routes exist in `app/pages/`, and `nuxi generate` already produces 36 static HTML files in `.output/public/` — all locale × deck and locale × scenario paths present.

The remaining work is narrow: (1) confirm that the `unit` Vitest project include pattern covers any data-module tests if required by the success criterion; (2) verify the exact route list in `.output/public/` against the expected 36 routes programmatically (success criterion 3); (3) confirm `nuxi generate` continues to succeed after any changes. No new library installs are needed. No file copying is needed. The phase is primarily about verification, documentation, and possibly widening the unit test include pattern.

**Primary recommendation:** Write a route-list verification script (or Nuxt test) that asserts `.output/public/` contains exactly the 36 expected paths, satisfying success criterion 3. Everything else for DATA-01 and DATA-02 is already done.

---

## Actual State of the Codebase (HIGH confidence)

Direct inspection of the `vue-port` branch confirms all files already match `feat/nextjs-port`:

| File | Status |
|------|--------|
| `src/lib/srs.ts` | IDENTICAL to `feat/nextjs-port` |
| `src/lib/generateChoices.ts` | IDENTICAL to `feat/nextjs-port` |
| `src/types/index.ts` | IDENTICAL to `feat/nextjs-port` |
| `src/data/decks.ts` | IDENTICAL to `feat/nextjs-port` |
| `src/data/deckMap.ts` | IDENTICAL to `feat/nextjs-port` |
| `src/data/it/*.ts` (8 files) | IDENTICAL to `feat/nextjs-port` |
| `src/data/es/*.ts` (8 files) | IDENTICAL to `feat/nextjs-port` |
| `src/data/qa/*.ts` (8 files) | IDENTICAL to `feat/nextjs-port` |
| `src/__tests__/lib/srs.test.ts` | IDENTICAL to `feat/nextjs-port` |
| `src/__tests__/lib/generateChoices.test.ts` | IDENTICAL to `feat/nextjs-port` |
| `src/__tests__/setup.ts` | Present; one-line diff (removed `@testing-library/jest-dom` import already handled in Phase 20) |
| `app/pages/index.vue` | Placeholder created in Phase 20 |
| `app/pages/rephrase/index.vue` | Placeholder created in Phase 20 |
| `app/pages/rephrase/[deck].vue` | Placeholder created in Phase 20 |
| `app/pages/qa/index.vue` | Placeholder created in Phase 20 |
| `app/pages/qa/[scenario].vue` | Placeholder created in Phase 20 |

Unit test run result (as of 2026-03-12):
- `unit` project: 2 test files, 21 tests, all passing
- `nuxt` project: 1 test file, 1 test, passing
- Total: 22 passing, 0 failing

Static output (`.output/public/`): 36 `index.html` files generated — the exact list required by `nitro.prerender.routes`:
- `/` root: 1 (200.html redirect)
- `/it`, `/es`: 2
- `/it/rephrase`, `/es/rephrase`: 2
- `/it/qa`, `/es/qa`: 2
- `/it/rephrase/{8 decks}`, `/es/rephrase/{8 decks}`: 16
- `/it/qa/{7 scenarios}`, `/es/qa/{7 scenarios}`: 14
- **Total: 36 routes** (plus root redirect = 37 HTML files total)

---

## Standard Stack

### Core (already installed — no changes needed)
| Library | Version | Purpose |
|---------|---------|---------|
| vitest | ^4.0.18 | Unit test runner |
| @nuxt/test-utils | ^4.0.0 | Nuxt environment + `mountSuspended` |
| jsdom | ^28.1.0 | DOM environment for `unit` project |
| happy-dom | ^20.8.4 | DOM environment for `nuxt` project |
| nuxt | ^4.2.2 | Framework + `nuxi generate` |
| @nuxtjs/i18n | ^10.2.3 | Locale prefix routing |

**No new packages required for Phase 21.**

---

## Architecture Patterns

### Vitest Project Split (established in Phase 20)

The vitest config splits tests into two named projects:

```typescript
// vitest.config.ts (current state)
{
  test: {
    name: 'unit',
    include: ['src/__tests__/lib/**/*.{test,spec}.ts'],  // covers srs and generateChoices only
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: { alias: { '@': resolve(__dirname, './src') } },
},
{
  test: {
    name: 'nuxt',
    include: ['tests/nuxt/**/*.{test,spec}.ts'],         // covers mountSuspended smoke test
    environment: 'nuxt',
  },
}
```

**Key constraint:** The `unit` project include pattern is `src/__tests__/lib/**` — it deliberately excludes `src/__tests__/hooks/**` and `src/__tests__/components/**`. Those test files are React/TSX-based from `feat/nextjs-port` and must NOT be run until they are ported to Vue in Phase 22+.

### Route Verification Pattern

The success criterion requires that `.output/public/` is "verifiable against an expected route list." The most direct approach is a script that:

1. Generates the same expected routes array used in `nuxt.config.ts` `nitro.prerender.routes`
2. Checks each expected path has a corresponding `index.html` in `.output/public/`
3. Fails loudly if any path is missing or if the counts diverge

This can be a plain Node/Bun script (not a Vitest test) placed in `specs/` or `.planning/`, run as a one-off verification step.

### `@/types` Alias Resolution

The `src/lib/` and `src/data/` files use `import type { ... } from '@/types'`. The `unit` Vitest project resolves `@` to `./src` via:

```typescript
resolve: { alias: { '@': resolve(__dirname, './src') } }
```

This is already configured and working. No changes needed.

### Static Route Enumeration (established pattern)

`nuxt.config.ts` inlines DECK_IDS and SCENARIO_IDS because `src/data/*.ts` use the `@/types` alias that is not available at config evaluation time. This pattern is stable and must not be changed in Phase 21.

```typescript
// nuxt.config.ts — do NOT import from src/data here
const DECK_IDS = ['daily', 'restaurant', 'travel', 'shopping', 'hotel', 'emergencies', 'social', 'weather'] as const
const SCENARIO_IDS = ['caffe', 'albergo', 'ristorante', 'strada', 'presentazioni', 'negozio', 'treno'] as const
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Route existence check | Custom filesystem crawler | Simple `fs.existsSync` check against expected route list derived from the same DECK_IDS/SCENARIO_IDS arrays |
| Test DOM environment | Custom jsdom setup | `setupFiles: ['./src/__tests__/setup.ts']` already provides localStorage mock and SpeechRecognition mock |
| Alias resolution | Manual path mapping in test files | Vitest `resolve.alias` already maps `@` to `src/` |

---

## Common Pitfalls

### Pitfall 1: Running React-Based Hook/Component Tests
**What goes wrong:** `src/__tests__/hooks/*.test.tsx` and `src/__tests__/components/*.test.tsx` import React hooks and JSX — running them under the `unit` Vitest project will produce import errors or JSX transform failures.
**Why it happens:** These test files are from `feat/nextjs-port` and exist in the repo but are intentionally excluded from the current `unit` include pattern (`src/__tests__/lib/**` only).
**How to avoid:** Do not widen the `unit` project include pattern to `src/__tests__/**` in Phase 21. Those tests belong to Phase 22+ (composable porting).
**Warning signs:** Any vitest run that suddenly includes 7 hook/component test files is wrong.

### Pitfall 2: Treating `nuxi generate` as Equivalent to HTTP 200
**What goes wrong:** A route file in `.output/public/it/rephrase/restaurant/index.html` exists but contains an error page or empty body.
**Why it happens:** `nuxi generate` creates the file even if the page threw a server-side render error — it records the error in the HTML rather than failing the build.
**How to avoid:** Success criterion 2 requires HTTP 200 responses. The route verification script should serve `.output/public/` over HTTP using `npx serve` or similar, not just check file existence. Alternatively, check that generated HTML files contain a non-error `<div id="__nuxt">` payload.

### Pitfall 3: Confusing `@/data` Alias With Next.js App Dir Context
**What goes wrong:** Importing `src/data/decks.ts` or `src/data/deckMap.ts` in a Nuxt page or composable might fail if the auto-import or alias configuration is wrong.
**Why it happens:** Nuxt 4 uses `app/` as `srcDir`. Auto-imports resolve from `app/composables/`, `app/utils/`, etc. — but `src/` is outside `srcDir`. The `@` alias in Vitest covers `src/` but Nuxt's built-in TypeScript paths may not.
**How to avoid:** In Phase 21, `src/` modules are only imported in unit tests (which have the explicit Vitest alias). Pages remain as stubs. The alias collision only becomes real in Phase 22 when composables need to import from `src/data/`. Note this for Phase 22 planning: composables in `app/composables/` will need a verified `@` path or the data files will need to move/re-export through a location Nuxt can resolve.
**Warning signs:** TypeScript errors like "Cannot find module '@/types'" in `app/` files.

### Pitfall 4: Missing Route in Prerender List
**What goes wrong:** A new deck or scenario added in the future silently drops from the static output because it's in `src/data/` but not in the inlined arrays in `nuxt.config.ts`.
**Why it happens:** The inlined DECK_IDS/SCENARIO_IDS in `nuxt.config.ts` must be kept in sync manually with `src/data/` files.
**How to avoid:** The route verification script (success criterion 3) should derive its expected list from the same inlined constants, making drift immediately visible.

---

## Code Examples

### Running Unit Tests Only
```bash
bun run vitest run --project unit
```
Expected: 2 files, 21 tests, all passing.

### Running All Tests
```bash
bun run vitest run
```
Expected: 3 files, 22 tests, all passing.

### Generating Static Output
```bash
bun run generate
# or: bunx nuxi generate
```
Expected: `.output/public/` with 36 `index.html` files (36 routes).

### Route Verification Script Pattern
```typescript
// specs/verify-routes.ts (example — not yet created)
import { existsSync } from 'fs'
import { resolve } from 'path'

const DECK_IDS = ['daily', 'restaurant', 'travel', 'shopping', 'hotel', 'emergencies', 'social', 'weather']
const SCENARIO_IDS = ['caffe', 'albergo', 'ristorante', 'strada', 'presentazioni', 'negozio', 'treno']
const LOCALES = ['it', 'es']
const OUTPUT = resolve(process.cwd(), '.output/public')

const expectedRoutes = [
  ...LOCALES.map(l => `/${l}`),
  ...LOCALES.map(l => `/${l}/rephrase`),
  ...LOCALES.map(l => `/${l}/qa`),
  ...LOCALES.flatMap(l => DECK_IDS.map(d => `/${l}/rephrase/${d}`)),
  ...LOCALES.flatMap(l => SCENARIO_IDS.map(s => `/${l}/qa/${s}`)),
]

let failed = 0
for (const route of expectedRoutes) {
  const htmlFile = resolve(OUTPUT, route.slice(1), 'index.html')
  if (!existsSync(htmlFile)) {
    console.error(`MISSING: ${route} -> ${htmlFile}`)
    failed++
  }
}

if (failed === 0) {
  console.log(`All ${expectedRoutes.length} routes verified in .output/public/`)
} else {
  process.exit(1)
}
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `bun run vitest run --project unit` |
| Full suite command | `bun run vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | `srs.ts` pure functions correct | unit | `bun run vitest run --project unit src/__tests__/lib/srs.test.ts` | YES |
| DATA-01 | `generateChoices.ts` pure functions correct | unit | `bun run vitest run --project unit src/__tests__/lib/generateChoices.test.ts` | YES |
| DATA-01 | Data modules (`src/data/**`) load without error | smoke (manual or script) | `bun run vitest run --project unit` (setup.ts imports would catch parse errors) | YES (implicit via imports in tests) |
| DATA-02 | All 36 routes exist in `.output/public/` | verification script | `bun run generate && bun specs/verify-routes.ts` | NO — Wave 0 gap |

### Sampling Rate
- **Per task commit:** `bun run vitest run --project unit`
- **Per wave merge:** `bun run vitest run`
- **Phase gate:** `bun run generate` + route verification script green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `specs/verify-routes.ts` — covers DATA-02 success criterion 3 (route list verification)

---

## Open Questions

1. **Data module test coverage in `unit` project**
   - What we know: The `unit` project runs `src/__tests__/lib/**` only. There are no explicit tests for `src/data/*.ts` modules (that they load, export the right shape, etc.).
   - What's unclear: Does the success criterion "data modules pass" require explicit data module tests, or is it satisfied by the fact that `srs.test.ts` and `generateChoices.test.ts` import from `@/types` (which exercises type resolution)?
   - Recommendation: DATA-01 says "all existing Vitest tests ... pass unchanged." There are no existing Vitest tests specifically for data modules in `feat/nextjs-port` either (only in the old `tests/data-integrity.test.js` which uses old import paths). Treat DATA-01 as satisfied by the 21 lib tests passing. Do not add data-module tests in Phase 21 — that would be scope creep.

2. **`@/types` alias in Nuxt page context**
   - What we know: `src/data/deckMap.ts` uses `import type { ... } from '@/types'`. This works in the `unit` Vitest project. Pages in `app/` are stubs in Phase 21 and don't import from `src/`.
   - What's unclear: When Phase 22 composables in `app/composables/` need to import `DECK_MAP` from `src/data/deckMap.ts`, will Nuxt resolve `@/types` correctly? Nuxt's `tsconfig.json` auto-generated paths may conflict.
   - Recommendation: Flag for Phase 22 research. Phase 21 is unaffected since no `app/` file imports from `src/`.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection of `vue-port` branch — compared all data/lib/types/test files against `feat/nextjs-port` using `diff`
- Live test run: `bun run vitest run` — 22 tests passing as of 2026-03-12
- `nuxt.config.ts` — current prerender configuration confirmed
- `.output/public/` — 36 generated index.html files enumerated
- `vitest.config.ts` — confirmed `unit` project include scope

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — critical pitfalls and decisions from Phase 20 research

---

## Metadata

**Confidence breakdown:**
- DATA-01 status (files identical, tests passing): HIGH — verified by direct diff and live test run
- DATA-02 status (routes generated): HIGH — verified by enumerating `.output/public/`
- Route verification script pattern: HIGH — derived from existing `nuxt.config.ts` constants
- Phase 22 alias concern: MEDIUM — extrapolated from Nuxt 4 srcDir behavior, not yet exercised

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable — no library churn expected)
