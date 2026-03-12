# Phase 20: Scaffold - Research

**Researched:** 2026-03-12
**Domain:** Nuxt 4 project initialization, Tailwind v4 Vite integration, @nuxtjs/i18n routing, @nuxt/test-utils v4
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Keep `src/` intact as the migration reference for phases 21–25 to port from
- Scaffold Nuxt 4 structure alongside it: new `app.vue`, `pages/`, `composables/`, `assets/` directories in repo root
- Replace Next.js root config files (`next.config.ts`, `postcss.config.mjs`) with `nuxt.config.ts`
- `messages/`, `data/`, `public/` stay in place — Nuxt resolves them from root by convention
- Generate routes programmatically in `nuxt.config.ts` by importing deck IDs and scenario IDs from `src/data/`
- Do not hardcode the ~46 strings — keeps config in sync if deck data changes
- `mountSuspended` the home/index page component and assert it renders without throwing
- Test proves both `@nuxt/test-utils` wiring and that a real Vue page mounts successfully
- The five pitfalls documented in STATE.md are all locked patterns to enforce

### Claude's Discretion
- Exact Vitest config shape for @nuxt/test-utils integration
- Whether to use `nuxi init` or manually write nuxt.config.ts + minimal boilerplate
- Placeholder page templates for routes (content comes in later phases)
- tsconfig.json exact contents (must only extend `.nuxt/tsconfig.json` per SCAF-01)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCAF-01 | Nuxt 4 project initialized with TypeScript zero-config (`tsconfig.json` extends `.nuxt/tsconfig.json` only; no `compilerOptions.paths` override) | Nuxt 4 generates `.nuxt/tsconfig.*.json` files; root tsconfig uses `references` only |
| SCAF-02 | Tailwind v4 integrated via `@tailwindcss/vite` Vite plugin (`@nuxtjs/tailwindcss` module never added; `@import "tailwindcss"` in global CSS) | Official Tailwind+Nuxt guide confirms `vite.plugins: [tailwindcss()]` pattern |
| SCAF-03 | @nuxtjs/i18n configured with `strategy: 'prefix'`, Italian and Spanish locales, no `[lang]` page segments in `pages/` directory | @nuxtjs/i18n v10 confirmed working with Nuxt 4; `strategy: 'prefix'` is a first-class option |
| SCAF-04 | `nuxi generate` produces `.output/public/` with `nitro.prerender.routes` explicitly covering all locale × deck + locale × scenario route combinations (~46 routes) | Nuxt 4 prerender docs confirm `nitro.prerender.routes` array; programmatic generation from `src/data/` is the pattern |
| SCAF-05 | Vitest + @nuxt/test-utils configured; `mountSuspended` available for Vue composable testing; existing pure-logic tests passing unchanged | @nuxt/test-utils v4 + Vitest v4 confirmed; `defineVitestProject` dual-project config separates node from nuxt environment |
</phase_requirements>

## Summary

Phase 20 scaffolds a Nuxt 4 project alongside the existing `src/` Next.js source tree. The scaffold installs Nuxt 4 + Tailwind v4 + @nuxtjs/i18n + @nuxt/test-utils without touching any existing code, replacing only the Next.js config files (`next.config.ts`, `postcss.config.mjs`). All five known migration pitfalls are enforced at the configuration layer — not in application code — which is the correct scope for this phase.

The critical configuration insight for this project: Nuxt 4 defaults `srcDir` to `app/`, so `app.vue`, `pages/`, `composables/`, and `assets/` live under `app/` at the repo root. The `messages/` and `public/` directories stay at the root and are picked up automatically. The `src/data/` modules are imported directly in `nuxt.config.ts` to generate `nitro.prerender.routes` — this is the key integration point between the legacy source and the new scaffold.

The test configuration uses a dual-project Vitest setup: existing pure-logic tests run in a `node` environment unchanged; a new `nuxt` environment project provides `mountSuspended` for the SCAF-05 smoke test. This lets both test types share one `vitest.config.ts` without conflicts.

**Primary recommendation:** Manually write `nuxt.config.ts` + minimal boilerplate (not `nuxi init`) — this gives precise control over the five pitfall patterns from day one and avoids generated boilerplate that would need immediate modification.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nuxt | ^4.2.2 | Framework + SSG | Nuxt 4 is the migration target; v4.2.2 is current stable |
| @nuxtjs/i18n | ^10.2.3 | Locale routing + translations | Direct Nuxt 4 module; replaces next-intl with strategy:'prefix' |
| @tailwindcss/vite | ^4.x | Tailwind v4 Vite integration | The only correct Tailwind v4 integration for Nuxt; PostCSS approach is incompatible |
| tailwindcss | ^4.x | CSS utility framework | Already in devDependencies; no version change needed |
| @nuxt/test-utils | ^4.0.0 | Nuxt testing environment + mountSuspended | v4 pairs with Vitest v4; provides nuxt environment for Vitest |
| vitest | ^4.x | Test runner | Already present; @nuxt/test-utils v4 requires Vitest v4+ |
| @vue/test-utils | ^2.x | Component mount utilities | Peer dep of @nuxt/test-utils; mountSuspended wraps it |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-tsc | ^2.x | Vue TypeScript compilation | nuxi generate type checking; installed by nuxt automatically |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tailwindcss/vite (vite.plugins) | @nuxtjs/tailwindcss module | @nuxtjs/tailwindcss is incompatible with Tailwind v4 — never use it |
| @nuxtjs/i18n strategy:'prefix' | Manual [lang] param pages | [lang] page segments cause double-prefix with i18n module — never use |

**Installation:**
```bash
bun add nuxt @nuxtjs/i18n
bun add -D @tailwindcss/vite @nuxt/test-utils @vue/test-utils
# Remove Next.js packages
bun remove next next-intl react react-dom @testing-library/react @vitejs/plugin-react @testing-library/jest-dom @testing-library/user-event @types/react @types/react-dom @tailwindcss/postcss
```

## Architecture Patterns

### Recommended Project Structure
```
(repo root)
├── app/                        # Nuxt srcDir (Nuxt 4 default)
│   ├── app.vue                 # Root layout shell with <NuxtLayout> + <NuxtPage>
│   ├── assets/
│   │   └── css/
│   │       └── main.css        # @import "tailwindcss" only
│   ├── pages/
│   │   ├── index.vue           # / → redirects or activity picker placeholder
│   │   ├── rephrase/
│   │   │   ├── index.vue       # /rephrase → deck grid placeholder
│   │   │   └── [deck].vue      # /rephrase/:deck → study session placeholder
│   │   └── qa/
│   │       ├── index.vue       # /qa → scenario grid placeholder
│   │       └── [scenario].vue  # /qa/:scenario → qa session placeholder
│   └── composables/            # Empty now; populated in Phase 22
├── src/                        # PRESERVED — Next.js source reference (do not modify)
├── messages/                   # Already at root — Nuxt i18n reads here
│   ├── it.json
│   └── es.json
├── public/                     # Already at root — Nuxt serves from here
├── data/                       # Already at root
├── nuxt.config.ts              # NEW — replaces next.config.ts
├── tsconfig.json               # REPLACED — references only .nuxt/tsconfig.*.json
├── vitest.config.ts            # REPLACED — dual-project node + nuxt environments
└── tests/
    ├── nuxt/
    │   └── smoke.test.ts       # SCAF-05 mountSuspended smoke test (new)
    └── (existing src/__tests__/ tests move here in Phase 21)
```

### Pattern 1: nuxt.config.ts with Programmatic Prerender Routes
**What:** Import deck IDs and scenario IDs from `src/data/` at config time to generate the full `nitro.prerender.routes` array
**When to use:** Any time routes are data-driven and the Nitro crawler won't discover them (programmatic navigation, no static links)
**Example:**
```typescript
// nuxt.config.ts
// Source: https://nuxt.com/docs/4.x/getting-started/prerendering
import tailwindcss from '@tailwindcss/vite'
import { DECK_IDS } from './src/data/decks'
import { scenarios } from './src/data/qa'

const LOCALES = ['it', 'es']
const deckRoutes = LOCALES.flatMap(lang =>
  DECK_IDS.map(id => `/${lang}/rephrase/${id}`)
)
const scenarioRoutes = LOCALES.flatMap(lang =>
  scenarios.map(s => `/${lang}/qa/${s.id}`)
)
const indexRoutes = LOCALES.flatMap(lang => [
  `/${lang}`,
  `/${lang}/rephrase`,
  `/${lang}/qa`,
])

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // SCAF-01: TypeScript zero-config (tsconfig.json references .nuxt/* only)
  // No typescript.tsConfig.compilerOptions.paths — Nuxt generates @/ alias automatically

  // SCAF-02: Tailwind v4 via Vite plugin only — never @nuxtjs/tailwindcss
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },

  // SCAF-03: i18n with prefix strategy — no [lang] in pages/
  modules: ['@nuxtjs/i18n'],
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'it',
    locales: [
      { code: 'it', language: 'it-IT', file: 'it.json' },
      { code: 'es', language: 'es-ES', file: 'es.json' },
    ],
    langDir: 'messages',
  },

  // SCAF-04: Explicit prerender enumeration
  nitro: {
    prerender: {
      routes: ['/', ...indexRoutes, ...deckRoutes, ...scenarioRoutes],
    },
  },
})
```

### Pattern 2: tsconfig.json Zero-Config (SCAF-01)
**What:** Root tsconfig.json that only uses project references — no `compilerOptions`, no `paths` override
**When to use:** Always for Nuxt 4; Nuxt generates `.nuxt/tsconfig.*.json` with all needed settings including the `#imports` and `@/` aliases
**Example:**
```json
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```
Note: `.nuxt/` directory is generated on first `bun run dev` — tsconfig is a stub until then.

### Pattern 3: Global CSS with Tailwind v4 (SCAF-02)
**What:** Single CSS entry point with `@import "tailwindcss"` as the only directive
**When to use:** Always with Tailwind v4 + Vite plugin; replaces `@tailwind base/components/utilities` directives
**Example:**
```css
/* app/assets/css/main.css */
/* Source: https://tailwindcss.com/docs/guides/nuxtjs */
@import "tailwindcss";
```

### Pattern 4: Dual-Project Vitest Config (SCAF-05)
**What:** `vitest.config.ts` with two test projects — `node` for pure logic, `nuxt` for mountSuspended tests
**When to use:** When you have both framework-independent tests (srs.ts, generateChoices.ts) and Vue component tests requiring Nuxt runtime
**Example:**
```typescript
// vitest.config.ts
// Source: https://nuxt.com/docs/4.x/getting-started/testing
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/__tests__/lib/**/*.{test,spec}.ts'],
          environment: 'node',
          globals: true,
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
```

Note: `@nuxt/test-utils/config` is ESM-only. If `package.json` lacks `"type": "module"`, rename vitest config to `vitest.config.mts`.

### Pattern 5: mountSuspended Smoke Test (SCAF-05)
**What:** Mount the index page component and assert it doesn't throw
**When to use:** Validates Nuxt test-utils wiring + Vue SFC rendering in one lightweight test
**Example:**
```typescript
// tests/nuxt/smoke.test.ts
// Source: https://nuxt.com/docs/4.x/getting-started/testing
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('index page mounts without error', async () => {
    const { default: IndexPage } = await import('../../app/pages/index.vue')
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.exists()).toBe(true)
  })
})
```

### Anti-Patterns to Avoid
- **@nuxtjs/tailwindcss in modules:** Incompatible with Tailwind v4; causes PostCSS/module conflict errors. Use `vite.plugins: [tailwindcss()]` exclusively.
- **[lang] in page file paths:** `pages/[lang]/rephrase/[deck].vue` causes double-prefix with @nuxtjs/i18n. Page files must NOT include a locale segment at all.
- **Relying on Nitro crawler for dynamic routes:** The crawler only discovers routes linked in static HTML. Deck and scenario routes are programmatically navigated — they must be in `nitro.prerender.routes` explicitly.
- **Adding `compilerOptions.paths` to tsconfig.json:** Nuxt 4 generates the `@/` alias in `.nuxt/tsconfig.*.json`. Overriding it in root tsconfig breaks Nuxt's generated type resolution.
- **process.client guard:** Deprecated. Use `import.meta.client` instead (Nuxt 4 convention).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale routing | Custom middleware with [lang] page segments | @nuxtjs/i18n strategy:'prefix' | Double-prefix pitfall, redirect edge cases, link generation complexity |
| Tailwind v4 PostCSS config | postcss.config.mjs with tailwindcss plugin | `@tailwindcss/vite` in vite.plugins | @tailwindcss/postcss conflicts with Nuxt's module pipeline for Tailwind v4 |
| Route prerender list | Hardcoded array of 46 strings | Programmatic generation from `src/data/` | Stale routes if deck data changes; import errors surface early |
| TypeScript path aliases | `compilerOptions.paths` in tsconfig.json | Nuxt auto-generated `.nuxt/tsconfig.*.json` | Nuxt generates `@/` and `#imports` aliases; overriding causes type conflicts |
| Vue component test environment | Custom jsdom + vue-router wiring | @nuxt/test-utils + `defineVitestProject` | Nuxt plugins, auto-imports, and i18n injections available out of the box |

**Key insight:** Every pitfall in this phase results from mixing old integration patterns with new ones. The entire scaffold phase is about wiring the correct patterns at initialization time.

## Common Pitfalls

### Pitfall 1: @nuxtjs/tailwindcss Installed Alongside Tailwind v4
**What goes wrong:** Vite build fails with PostCSS/module conflict errors; Tailwind classes don't apply.
**Why it happens:** @nuxtjs/tailwindcss uses PostCSS internally; Tailwind v4 moved to a Vite-native approach. The two conflict.
**How to avoid:** Never add `@nuxtjs/tailwindcss` to `modules`. Use only `@tailwindcss/vite` in `vite.plugins`.
**Warning signs:** Any error mentioning `postcss-import` or `@tailwindcss/postcss` during dev or build.

### Pitfall 2: [lang] Segment in pages/ Causes Double-Prefix
**What goes wrong:** Routes render as `/it/it/rephrase/daily` instead of `/it/rephrase/daily`.
**Why it happens:** @nuxtjs/i18n adds locale prefix automatically. If pages also include `[lang]`, the prefix appears twice.
**How to avoid:** Page files use `pages/rephrase/[deck].vue`, never `pages/[lang]/rephrase/[deck].vue`.
**Warning signs:** After `nuxi generate`, inspect `.output/public/` directory structure — look for double-lang folders.

### Pitfall 3: Dynamic Routes Not Prerendered
**What goes wrong:** `nuxi generate` completes, but deck/scenario HTML files are absent from `.output/public/`.
**Why it happens:** Nitro's crawler finds routes by following links in HTML. If no page links to `/it/rephrase/daily`, that route is never discovered.
**How to avoid:** Enumerate all routes in `nitro.prerender.routes` in `nuxt.config.ts`.
**Warning signs:** `.output/public/` exists but only contains `index.html` and locale root dirs; no `rephrase/` or `qa/` subdirectories.

### Pitfall 4: tsconfig.json with compilerOptions.paths Override
**What goes wrong:** TypeScript errors on `@/` imports; Nuxt auto-imports break; `.nuxt/` generated types not found.
**Why it happens:** Nuxt 4 generates `@/` alias in `.nuxt/tsconfig.*.json`. A root-level `paths` override shadows it.
**How to avoid:** Root `tsconfig.json` must only have `files: []` and `references`. No `compilerOptions` at root level.
**Warning signs:** `Cannot find module '@/...'` errors after `nuxi dev` starts.

### Pitfall 5: package.json Missing "type": "module" for @nuxt/test-utils/config
**What goes wrong:** Vitest config import of `@nuxt/test-utils/config` fails with `[ERROR] resolved to an ESM file` error.
**Why it happens:** `@nuxt/test-utils/config` is ESM-only; without `"type": "module"` in package.json, Node treats `.ts` as CJS.
**How to avoid:** Add `"type": "module"` to `package.json`, OR rename `vitest.config.ts` to `vitest.config.mts`.
**Warning signs:** Error message: `"@nuxt/test-utils/config" resolved to an ESM file. ESM file cannot be loaded by require()`.

### Pitfall 6: i18n `langDir` Resolves from `srcDir`, Not `rootDir`
**What goes wrong:** @nuxtjs/i18n can't find locale files; build error about missing translation files.
**Why it happens:** In Nuxt 4, `langDir` is resolved relative to `srcDir` (which is `app/` by default). But `messages/` is at repo root.
**How to avoid:** Use an absolute path or configure `langDir` relative to `rootDir` explicitly. Alternatively, set `langDir` to `'../messages'` since srcDir is `app/`, or move messages to `app/` directory.
**Warning signs:** Build error: `Cannot find locale file 'it.json' in '...langDir...'`.
**Resolution:** Set `langDir: '../messages'` in i18n config (relative from `app/` srcDir), or use `path.resolve(__dirname, 'messages')`.

## Code Examples

Verified patterns from official sources:

### Complete nuxt.config.ts
```typescript
// Source: https://nuxt.com/docs/4.x/getting-started/configuration
//         https://tailwindcss.com/docs/guides/nuxtjs
//         https://i18n.nuxtjs.org/docs/api/options
import tailwindcss from '@tailwindcss/vite'
import { DECK_IDS } from './src/data/decks'
import { scenarios } from './src/data/qa'
import { resolve } from 'path'

const LOCALES = ['it', 'es'] as const

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'it',
    locales: [
      { code: 'it', language: 'it-IT', file: 'it.json' },
      { code: 'es', language: 'es-ES', file: 'es.json' },
    ],
    langDir: resolve(__dirname, 'messages'),
  },

  nitro: {
    prerender: {
      routes: [
        '/',
        ...LOCALES.map(lang => `/${lang}`),
        ...LOCALES.map(lang => `/${lang}/rephrase`),
        ...LOCALES.map(lang => `/${lang}/qa`),
        ...LOCALES.flatMap(lang => DECK_IDS.map(id => `/${lang}/rephrase/${id}`)),
        ...LOCALES.flatMap(lang => scenarios.map(s => `/${lang}/qa/${s.id}`)),
      ],
    },
  },
})
```

### tsconfig.json (SCAF-01)
```json
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

### app/assets/css/main.css (SCAF-02)
```css
@import "tailwindcss";
```

### Minimal app/app.vue
```vue
<!-- app/app.vue — shell only; no components in Phase 20 -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

### Minimal placeholder page (e.g., app/pages/index.vue)
```vue
<!-- Placeholder — content arrives in Phase 24 -->
<template>
  <div>
    <p>PuroLingua — Scaffold placeholder</p>
    <NuxtLink :to="localePath('/rephrase')">Rephrase</NuxtLink>
    <NuxtLink :to="localePath('/qa')">Q&A</NuxtLink>
  </div>
</template>
```

### vitest.config.ts (dual-project, SCAF-05)
```typescript
// Source: https://nuxt.com/docs/4.x/getting-started/testing
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/__tests__/lib/**/*.{test,spec}.ts'],
          environment: 'node',
          globals: true,
          setupFiles: ['./src/__tests__/setup.ts'],
          alias: {
            '@': resolve(__dirname, './src'),
          },
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, './src'),
          },
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@tailwindcss/postcss` + postcss.config | `@tailwindcss/vite` plugin only | Tailwind v4 (2025) | PostCSS config file is deleted; single import in CSS |
| `process.client` SSR guard | `import.meta.client` | Nuxt 4 (2025) | process.client still works but is deprecated |
| Single `tsconfig.json` extends Nuxt | `references` to 4 `.nuxt/tsconfig.*.json` files | Nuxt 4 (2025) | Each TS context has separate config; root is a stub |
| `compilerOptions.paths` for `@/` alias | Nuxt auto-generates `@/` in `.nuxt/tsconfig.*.json` | Nuxt 4 (2025) | Remove paths override from root tsconfig |
| `nuxt-vitest` package | `@nuxt/test-utils` (official) | 2024 | `nuxt-vitest` is deprecated; `@nuxt/test-utils` is the maintained package |
| `defineVitestConfig` | `defineVitestProject` + `defineConfig` | @nuxt/test-utils v4 (2025) | Multi-project approach; `defineVitestConfig` still works but projects pattern is preferred |

**Deprecated/outdated:**
- `@tailwindcss/postcss` + `postcss.config.mjs`: Still in current devDependencies — must be removed
- `@vitejs/plugin-react`: Current devDependency — must be removed with React packages
- `nuxt-vitest`: Deprecated package; `@nuxt/test-utils` is the successor

## Open Questions

1. **langDir absolute vs relative resolution in i18n v10 + Nuxt 4**
   - What we know: `langDir` is documented as "relative to project restructureDir at the root" — this changed between i18n versions
   - What's unclear: Whether v10.2.3 resolves from `rootDir` or `srcDir` when srcDir is `app/`; a GitHub issue (nuxt-modules/i18n#2983) suggests it scans srcDir
   - Recommendation: Use `path.resolve(__dirname, 'messages')` as an absolute path to avoid ambiguity; verify on first `bun run dev`

2. **src/data/ imports in nuxt.config.ts with `@/` alias**
   - What we know: The `@/` alias is generated by Nuxt in `.nuxt/tsconfig.*.json`, not available at nuxt.config.ts evaluation time
   - What's unclear: Whether `import { DECK_IDS } from './src/data/decks'` works at config time (before `.nuxt/` is generated)
   - Recommendation: Use relative paths (`./src/data/decks`) in nuxt.config.ts imports, not `@/` alias

3. **package.json "type": "module" interaction with bun**
   - What we know: `@nuxt/test-utils/config` requires ESM; bun handles ESM well
   - What's unclear: Whether existing `bun.lock` and scripts need any adjustment after adding `"type": "module"`
   - Recommendation: Add `"type": "module"` as first step; run `bun run dev` to surface any CJS/ESM conflicts before proceeding

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 (already installed) + @nuxt/test-utils ^4.0.0 (new) |
| Config file | `vitest.config.ts` (full replacement of current file) |
| Quick run command | `bun run test --project unit` |
| Full suite command | `bun run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCAF-01 | tsconfig.json has no compilerOptions | manual/build | `bun run nuxi prepare` (no TS errors) | ❌ Wave 0 — file replacement |
| SCAF-02 | Tailwind utility classes apply in browser | smoke | `bun run nuxi generate` (no build errors) | ❌ Wave 0 — build check |
| SCAF-03 | /it/ and /es/ routes exist in output | build check | `bun run nuxi generate && ls .output/public/it .output/public/es` | ❌ Wave 0 |
| SCAF-04 | ~46 routes present in .output/public/ | build check | `bun run nuxi generate` + route count assertion | ❌ Wave 0 |
| SCAF-05 | mountSuspended smoke test passes | unit/nuxt | `bun run test --project nuxt` | ❌ Wave 0 — tests/nuxt/smoke.test.ts |

### Sampling Rate
- **Per task commit:** `bun run test --project unit` (pure logic tests, <5 seconds)
- **Per wave merge:** `bun run test` (all projects including nuxt environment)
- **Phase gate:** `bun run test` full suite green + `nuxi generate` produces `.output/public/` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/nuxt/smoke.test.ts` — covers SCAF-05 (mountSuspended smoke test)
- [ ] `vitest.config.ts` replacement — dual-project config for node + nuxt environments
- [ ] `tsconfig.json` replacement — references-only zero-config (SCAF-01)
- [ ] `package.json "type": "module"` — required for @nuxt/test-utils/config ESM import
- [ ] Framework install: `bun add nuxt @nuxtjs/i18n && bun add -D @tailwindcss/vite @nuxt/test-utils @vue/test-utils`

## Sources

### Primary (HIGH confidence)
- [Nuxt 4 Getting Started: Testing](https://nuxt.com/docs/4.x/getting-started/testing) — mountSuspended usage, defineVitestProject config shape, dual-project pattern
- [Tailwind CSS: Install with Nuxt](https://tailwindcss.com/docs/guides/nuxtjs) — @tailwindcss/vite plugin, nuxt.config.ts setup, CSS entry point
- [Nuxt 4 Directory Structure: tsconfig](https://nuxt.com/docs/4.x/directory-structure/tsconfig) — references-only tsconfig.json, .nuxt/tsconfig.*.json files
- [Nuxt 4 Getting Started: Prerendering](https://nuxt.com/docs/4.x/getting-started/prerendering) — nitro.prerender.routes array, nuxi generate output
- [@nuxtjs/i18n API Options](https://i18n.nuxtjs.org/docs/api/options) — langDir, locales array, strategy configuration
- [Nuxt v4 Blog Post](https://nuxt.com/blog/v4) — app/ directory as default srcDir, TypeScript project references

### Secondary (MEDIUM confidence)
- [@nuxt/test-utils releases](https://github.com/nuxt/test-utils/releases) — v4.0.0 release confirms Vitest v4 requirement
- [Nuxt 4 discussion: srcDir](https://github.com/nuxt/nuxt/discussions/29377) — confirms srcDir defaults to `app/` in Nuxt 4
- [nuxt-modules/i18n issue #2983](https://github.com/nuxt-modules/i18n/issues/2983) — langDir scans srcDir, not rootDir (affects messages/ path)

### Tertiary (LOW confidence)
- WebSearch results on @nuxt/test-utils v4 + package.json "type":"module" requirement — needs validation on first run

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official docs confirm all package versions and integration patterns
- Architecture: HIGH — Nuxt 4 directory structure is documented; app/ srcDir default confirmed
- Pitfalls: HIGH — five pitfalls are confirmed via official docs, GitHub issues, and project STATE.md research
- langDir resolution: LOW — behavior with absolute path is safe bet; relative path with new srcDir needs empirical verification

**Research date:** 2026-03-12
**Valid until:** 2026-06-12 (90 days — Nuxt 4 modules are stabilizing; @nuxtjs/i18n and @nuxt/test-utils actively maintained)
