# Technology Stack

**Project:** PuroLingua v2.0 — Nuxt 4 Vue Port
**Researched:** 2026-03-12
**Overall confidence:** HIGH (all recommendations verified against official docs and npm)

---

## Context

This is a port of an existing Next.js 15 + TypeScript + Tailwind v4 + next-intl application. The card
data, SRS logic (Leitner 3-box), localStorage key contract, and Web Speech API usage are all
**preserved unchanged**. Only the framework layer changes. Research scope: what's new or different
in the Nuxt 4 ecosystem vs the existing Next.js 15 setup.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| nuxt | ^4.4.2 | App framework + routing + SSG | v4 is current stable (released 2025, 4.4.0 out 2026-03-12); v3 EOL July 2026; v4 is an incremental upgrade with same module ecosystem and minimal migration cost |
| vue | ^3.5.x | Component model | Bundled with Nuxt 4; no separate install needed |
| typescript | ~5.x | Type safety | Zero-config in Nuxt 4 — `nuxt.config.ts` + auto-generated `.nuxt/tsconfig.json`; no separate `tsconfig` bootstrapping required |

**Why Nuxt 4 over Nuxt 3:** Nuxt 3 reaches EOL 2026-07-31. Starting a new port on v3 would require
migration within months. Nuxt 4 is a soft upgrade — same module ecosystem, same composable API,
same `nuxi generate` static output. The primary structural change is an `app/` directory convention,
which is a clean starting point for a new codebase, not a migration burden.

### i18n

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @nuxtjs/i18n | ^10.2.3 | Locale routing, UI string translation | Official Nuxt module; wraps vue-i18n v11; provides auto-generated locale routes (`/it/*`, `/es/*`), lazy-loaded translation files, typed `useI18n()` composable. Direct equivalent of `next-intl` in the Next.js stack. |

**Why @nuxtjs/i18n over raw vue-i18n:** Raw vue-i18n requires manual route generation for each
locale. @nuxtjs/i18n generates `/[lang]/...` routes automatically and integrates with `nuxi generate`
to prerender all locale variants — exactly what static export to Hostinger needs. This is the
same relationship as next-intl to Next.js.

**Why not vue-i18n directly:** The Nuxt docs explicitly describe direct vue-i18n integration as
"intended for demonstration purposes" and lacking routing/SEO features. For a multi-locale static
site, the module is the correct choice.

**vue-i18n v11 note:** @nuxtjs/i18n v10 uses vue-i18n v11 internally. v11 removes `tc()` / `$tc()`.
Use `t()` with plural count parameter instead. The existing Next.js translation strings use standard
`t()` calls and are fully compatible.

### CSS

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| tailwindcss | ^4.1.x | Utility CSS | Matches existing Next.js v1.3 stack exactly; v4 uses CSS-native `@import "tailwindcss"` rather than PostCSS config |
| @tailwindcss/vite | ^4.1.x | Vite plugin integration | Nuxt 4 uses Vite internally; the Vite plugin is the official Tailwind v4 integration path for Vite-based frameworks. No `@nuxtjs/tailwindcss` module needed. |

**Integration:** Add `@tailwindcss/vite` as a Vite plugin in `nuxt.config.ts`. Create
`app/assets/css/main.css` with `@import "tailwindcss"`. Register in `nuxt.config.ts` `css` array.
No `tailwind.config.js` file — Tailwind v4 is configured entirely in CSS using `@theme`.

**Why not @nuxtjs/tailwindcss module:** The official Tailwind v4 guide for Nuxt recommends the Vite
plugin path, not the Nuxt module. The module has a tracked GitHub issue for v4 support (#820) with
conflicting reports on stability. The Vite plugin is the canonical v4 path.

### Static Export

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| nitro (built-in) | Bundled with Nuxt 4 | Static site generation | `nuxi generate` prerenders all routes to `.output/public/` — equivalent to Next.js `output: 'export'` + `next build`. Nitro handles the static preset automatically. |

**Configuration pattern:**
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/', '/it', '/es', '/it/rephrase', '/es/rephrase', '/it/qa', '/es/qa'],
      crawlLinks: true,
    },
  },
  routeRules: {
    '/**': { prerender: true },
  },
})
```

**Dynamic route prerendering:** Unlike Next.js `generateStaticParams`, Nuxt 4 uses `nitro.prerender.routes`
or the crawler to discover routes. For deck and scenario routes (`/it/rephrase/[deck]`), add entries
to `nitro.prerender.routes` or use the `<NuxtLink>` crawler via `crawlLinks: true`.

**Output:** `.output/public/` — upload this directory to Hostinger. Same deploy target as the
Next.js `out/` directory.

**trailingSlash:** Set `trailingSlash: true` in the router config if Hostinger requires
`/it/rephrase/index.html` format (same constraint that existed in Next.js config).

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitest | ^3.x | Unit test runner | Existing test infrastructure; Nuxt 4 uses Vite so Vitest integrates natively |
| @nuxt/test-utils | ^4.0.0 | Nuxt-aware test environment | Official Nuxt testing package; wraps `@vue/test-utils`; provides `mountSuspended()` for components using Nuxt composables (useI18n, useRoute, etc.); `mockNuxtImport()` for mocking auto-imports |
| @vue/test-utils | ^2.x | Component mounting | Peer dependency of @nuxt/test-utils; provides `mount()`, `shallowMount()` |

**Why @nuxt/test-utils over Vue Testing Library:** The existing Next.js tests use React Testing
Library. Vue Testing Library exists but @nuxt/test-utils is the officially maintained Nuxt-specific
solution and handles auto-imports, composables, and Nuxt plugins correctly during test runs. The
`mountSuspended()` API is the direct equivalent of RTL's `render()` for Nuxt components.

**@nuxt/test-utils v4 breaking change:** Nuxt environment setup moved to `beforeAll` hook. Composables
called at the top of `describe()` blocks will throw `[nuxt] instance unavailable`. Move composable
calls inside `beforeAll()`. Pure logic (SRS functions, data transforms) does not need `@nuxt/test-utils`
— test with plain `vitest` directly.

**Strategy:** SRS lib, card data, progress functions → plain Vitest (no DOM, no Nuxt runtime needed,
exactly as in v1.3). Vue components and composables using Nuxt context → `mountSuspended` from
`@nuxt/test-utils`.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-tsc | ^2.x | TypeScript type-check for Vue SFCs | Run in CI; `nuxt typecheck` wraps it |

**No additional libraries needed.** Web Speech API, localStorage, and all browser APIs are used
directly. No adapter libraries required.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework version | Nuxt 4 | Nuxt 3 | Nuxt 3 EOL 2026-07-31; starting on EOL version for a new port is wasteful |
| i18n | @nuxtjs/i18n v10 | vue-i18n direct | No locale routing, no static route generation; requires manual plumbing that the module provides |
| i18n | @nuxtjs/i18n v10 | intlify/nuxt3 | Unmaintained; the official module supersedes it |
| CSS integration | @tailwindcss/vite plugin | @nuxtjs/tailwindcss module | Module has open v4 compatibility issue; Vite plugin is the official Tailwind v4 path |
| Testing | @nuxt/test-utils | Vue Testing Library | @nuxt/test-utils handles Nuxt auto-imports and composable context; VTL works but requires more manual setup for Nuxt-specific features |
| Testing | @nuxt/test-utils | Playwright E2E only | Unit tests for SRS/composable logic are faster and more precise; both layers are useful |

---

## Installation

```bash
# Create new Nuxt 4 project
bunx nuxi@latest init purolingua-vue --template v4

# i18n
bun add @nuxtjs/i18n

# Tailwind v4 (Vite plugin path)
bun add tailwindcss @tailwindcss/vite

# Testing
bun add -D vitest @nuxt/test-utils @vue/test-utils vue-tsc
```

---

## nuxt.config.ts Skeleton

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // TypeScript — zero config; Nuxt generates .nuxt/tsconfig.json
  typescript: {
    strict: true,
    typeCheck: false, // run separately via 'nuxt typecheck'
  },

  // Tailwind v4 via Vite plugin
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },

  // i18n
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: ['it', 'es'],
    defaultLocale: 'it',
    strategy: 'prefix',              // routes: /it/..., /es/...
    lazy: true,                      // load translation files on demand
    langDir: 'i18n/',
  },

  // Static export
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/it', '/es'],
    },
  },
  routeRules: {
    '/**': { prerender: true },
  },
})
```

---

## TypeScript Notes

Nuxt 4 generates `.nuxt/tsconfig.json` automatically on `nuxi dev` or `nuxi build`. The project
`tsconfig.json` should extend it:

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

Auto-imports are fully typed — `useI18n()`, `useRoute()`, `useState()`, and all composables are
available without explicit imports in `.vue` files. Custom composables in `composables/` are
auto-imported and typed the same way.

---

## Preserved from Next.js Stack (No Change Needed)

These capabilities exist unchanged in the new stack. No additional packages required.

| Capability | How It Works in Nuxt 4 |
|------------|----------------------|
| Card data TypeScript types | Same `.ts` modules; no framework coupling |
| SRS logic (Leitner 3-box) | Same pure TypeScript functions; import directly into composables |
| localStorage persistence | Browser-native; same `useSRS`/`useLevelFilter` composable contract |
| Web Speech API (TTS + voice recognition) | Browser-native; wrap in `onMounted` or `<ClientOnly>` to avoid SSR |
| `qa_`-prefixed SRS keys | Same key format; composable carries over directly |
| Append-only card index contract | Data format unchanged; no migration needed |

**SSR caveat for Web Speech API:** `speechSynthesis` and `SpeechRecognition` are browser-only.
Wrap any component that accesses these in `<ClientOnly>` or guard with `if (process.client)`.
This replaces the `next/dynamic ssr:false` pattern used in the Next.js stack.

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Pinia | State surface is per-session and scoped to composables; no cross-component global store needed | Vue composables with `useState()` for SSR-safe reactive state if needed |
| @nuxtjs/tailwindcss module | Has open v4 compatibility issue; adds unnecessary abstraction layer | `@tailwindcss/vite` plugin directly in `nuxt.config.ts` |
| nuxt-content | No markdown content; all card data is TypeScript modules | Plain TS imports |
| Separate vue-i18n install | @nuxtjs/i18n bundles and configures vue-i18n v11 automatically | @nuxtjs/i18n only |
| Playwright (new setup) | Out of scope for this port milestone; unit tests sufficient for logic verification | Add E2E layer after feature parity confirmed |
| Axios / ofetch for data fetching | No API calls; all data is static TypeScript imports | Native imports |

---

## Sources

- [Nuxt 4.0 Announcement](https://nuxt.com/blog/v4) — MEDIUM confidence (official blog)
- [Nuxt 4.3 Blog](https://nuxt.com/blog/v4-3) — MEDIUM confidence (official blog)
- [@nuxtjs/i18n Installation Docs](https://i18n.nuxtjs.org/docs/getting-started) — HIGH confidence (official docs)
- [Tailwind CSS with Nuxt — Official Guide](https://tailwindcss.com/docs/installation/framework-guides/nuxt) — HIGH confidence (official Tailwind docs)
- [Nuxt Testing Docs v4](https://nuxt.com/docs/4.x/getting-started/testing) — HIGH confidence (official Nuxt docs)
- [Nuxt TypeScript Concepts v4](https://nuxt.com/docs/4.x/guide/concepts/typescript) — HIGH confidence (official Nuxt docs)
- [Nuxt Prerendering v4](https://nuxt.com/docs/4.x/getting-started/prerendering) — HIGH confidence (official Nuxt docs)
- [Nuxt EOL Timeline](https://endoflife.date/nuxt) — MEDIUM confidence (endoflife.date)
- [@nuxt/test-utils npm](https://www.npmjs.com/package/@nuxt/test-utils) — MEDIUM confidence (npm registry)
- WebSearch: @nuxtjs/i18n v10.2.3 current version — MEDIUM confidence (multiple search results agree)

---

*Stack research for: PuroLingua v2.0 Nuxt 4 Vue Port*
*Researched: 2026-03-12*
