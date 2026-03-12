# Domain Pitfalls

**Domain:** Porting Next.js 15 + TypeScript + Tailwind v4 + next-intl to Nuxt 3 (v2.0 Vue Port)
**Researched:** 2026-03-12
**Confidence:** MEDIUM-HIGH (SSR/hydration and Tailwind verified via official issues and community reports; i18n routing and static export verified via nuxt-i18n docs and GitHub issues; TypeScript differences verified via Nuxt docs)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken deploys, or silent data corruption.

---

### Pitfall 1: localStorage and Web Speech API Accessed During SSR Cause Hydration Crashes

**What goes wrong:**
`localStorage`, `window.SpeechRecognition`, and `window.speechSynthesis` do not exist in the Nuxt SSR Node.js environment. Any composable or component that reads from localStorage or instantiates a SpeechRecognition object at module load time (outside `onMounted`) will throw `ReferenceError: localStorage is not defined` on the server, or silently render `undefined`, causing the server-rendered HTML to differ from the client-rendered DOM. Vue then throws a hydration mismatch warning and may discard the server output, forcing a full client re-render — or worse, leaving the app in a broken state with mismatched DOM nodes.

The Next.js port avoided this via `next/dynamic` with `ssr: false` (explicitly documented in PROJECT.md: "QAStudySession SSR bypassed via `next/dynamic ssr:false`"). Nuxt 3 has no direct `ssr: false` import equivalent — the mechanism is different.

**Why it happens:**
Developers familiar with Next.js reach for `if (typeof window !== 'undefined')` guards or `process.client`. While `process.client` works in Nuxt, it is evaluated during component setup, not in the module scope. Composables that do `const stored = localStorage.getItem(key)` at the top of a `setup()` function still run on the server before `process.client` is checked. The Vue 3 composition API does not guard against this automatically.

**Consequences:**
- Build succeeds, dev mode may work (Nuxt defaults to SSR in dev), but `nuxi generate` output contains pages with broken hydration.
- `useSRS`, `useLevelFilter`, `useQASRS`, and `useVoiceRecognition` composables are all at risk if they read localStorage or check for SpeechRecognition at setup time.
- Hydration mismatch can corrupt the initial reactive state, causing infinite re-renders or blank screens.

**Prevention:**
Use one of these three patterns depending on context:

1. **`onMounted` for composable initialization** — Move all localStorage reads and Web Speech API checks inside `onMounted`. The reactive ref is initialized to a safe default (`null`, `false`, `[]`) and then updated after hydration. This is the primary pattern for `useSRS`, `useLevelFilter`, and `useQASRS`.

2. **`<ClientOnly>` wrapper for entire study session components** — Wrap `RephraseStudySession`, `QAStudySession`, and any component that calls `useVoiceRecognition` in Nuxt's `<ClientOnly>` component. This is the direct Nuxt equivalent of `next/dynamic ssr:false`. The component is not rendered server-side at all, eliminating hydration mismatch risk.

3. **`import.meta.client` guard (Nuxt 3.x)** — For module-level guards in composables, use `if (import.meta.client)` rather than `process.client`. `import.meta.client` is tree-shaken at build time; `process.client` is not.

Do NOT use `process.server` / `process.client` conditionals around reactive state initialization — the state still initializes to different values on server vs client.

**Detection warning signs:**
- `[Vue warn]: Hydration node mismatch` in the browser console after `nuxi generate` output is served
- `ReferenceError: localStorage is not defined` in the `nuxi generate` build log
- SpeechRecognition composable returns `null` on first render even in a browser

**Phase to address:** Phase 1 (Nuxt project scaffold) — establish the `onMounted`/`<ClientOnly>` patterns in the composable templates before porting any SRS or voice logic. Verify with a static generate smoke test before building study sessions.

---

### Pitfall 2: `@nuxtjs/tailwindcss` Module Conflicts with Tailwind v4

**What goes wrong:**
The `@nuxtjs/tailwindcss` Nuxt module was designed for Tailwind CSS v3. It injects Tailwind as a PostCSS plugin. Tailwind v4 ships its PostCSS plugin in a separate package (`@tailwindcss/postcss`) and its primary integration path for Vite projects is the `@tailwindcss/vite` Vite plugin — not a Nuxt module. Installing `@nuxtjs/tailwindcss` with `tailwindcss@4.x` produces the error:

```
It looks like you're trying to use tailwindcss directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package.
```

This has been confirmed in nuxt-modules/tailwindcss GitHub issues (issue #978) and tailwindlabs/tailwindcss discussions (discussion #16236).

**Why it happens:**
The `@nuxtjs/tailwindcss` module's most recent stable version auto-detects `tailwindcss` and injects it via PostCSS. Tailwind v4 changed the PostCSS entrypoint. The module has not yet fully stabilized its v4 support as of early 2026, and v4 alpha/beta versions have breaking config semantics.

**Consequences:**
- Nuxt dev server fails to start.
- Even if `@nuxtjs/tailwindcss` is updated to support v4 in the future, its configuration model (a `tailwind.config.js` or `tailwind.config.ts`) is incompatible with Tailwind v4's CSS-first configuration (`@theme` directive in CSS files — no JS config file needed or supported).

**Prevention:**
Do NOT add `@nuxtjs/tailwindcss` to `modules` in `nuxt.config.ts`. Instead:

1. Install `@tailwindcss/vite` (the Vite plugin).
2. Add it to `vite.plugins` in `nuxt.config.ts`:
   ```typescript
   export default defineNuxtConfig({
     vite: {
       plugins: [tailwindcss()]
     }
   })
   ```
3. Import Tailwind in a global CSS file: `@import "tailwindcss";`
4. Add theme customizations via `@theme` directives in that same CSS file — no `tailwind.config.js` needed or used.

The existing Next.js port uses `@tailwindcss/vite` via the Next.js plugin config. The migration pattern is essentially identical — replace the Next.js plugin registration with Nuxt's Vite plugin registration.

**Detection warning signs:**
- `nuxi dev` fails with the PostCSS plugin error immediately after adding `@nuxtjs/tailwindcss`
- Tailwind utility classes not applied despite no build error (silent integration failure if both module and vite plugin are registered simultaneously)

**Phase to address:** Phase 1 (Nuxt project scaffold) — configure Tailwind v4 via Vite plugin from the start. Never add `@nuxtjs/tailwindcss` to the modules array.

---

### Pitfall 3: Dynamic Routes Not Prerendered — `nuxi generate` Produces 404s

**What goes wrong:**
Nuxt's static generator (`nuxi generate`) crawls pages starting from `/` and follows links it discovers in the rendered HTML. Routes like `/it/rephrase/daily`, `/es/qa/caffe`, `/it/qa/airport` are **not linked from any navigable page by default** — they are accessed programmatically (e.g., via router.push after a button click). The crawler never visits them. The `.output/public` directory will be missing `it/rephrase/daily/index.html`, causing a 404 when the static site is served from Hostinger.

The Next.js port used `generateStaticParams` to explicitly enumerate all dynamic routes. Nuxt has no direct equivalent — the mechanism is the `nitro.prerender.routes` config array or the `prerender:routes` Nuxt hook.

**Why it happens:**
nuxt-i18n further complicates this. With the `prefix` strategy, every route is locale-prefixed. The prerender list must include ALL locale variants explicitly: `/it/rephrase/daily`, `/es/rephrase/daily`, `/it/rephrase/restaurant`, etc. Forgetting to enumerate all combinations is the most common failure mode.

Additionally, if nuxt-i18n's `strategy: 'prefix'` is used and `defaultLocale` is set, the module may generate redirects for the default locale's unprefixed paths — these redirects must also be included in the prerender routes or they 404.

**Consequences:**
- The app appears to work in dev (`nuxi dev` uses SSR, not static), passes local tests, then breaks on the Hostinger deploy.
- Missing routes are hard to detect without a full crawl of the `.output/public` directory after `nuxi generate`.

**Prevention:**
1. Explicitly enumerate all routes that must be prerendered in `nuxt.config.ts`:
   ```typescript
   nitro: {
     prerender: {
       routes: [
         '/',
         '/it', '/es',
         '/it/rephrase', '/es/rephrase',
         '/it/qa', '/es/qa',
         // All deck routes:
         '/it/rephrase/daily', '/es/rephrase/daily',
         '/it/rephrase/restaurant', '/es/rephrase/restaurant',
         // ... all 8 decks × 2 languages
         // All scenario routes:
         '/it/qa/caffe', '/es/qa/caffe',
         // ... all 7 scenarios × 2 languages
       ]
     }
   }
   ```
2. After every `nuxi generate`, run a route completeness check: assert that every expected path has a corresponding `index.html` in `.output/public`.
3. Add a Vitest or build-time test that imports the deck and scenario data and programmatically generates the expected route list, then verifies the output directory.

**Detection warning signs:**
- Pages accessible in `nuxi dev` but 404 after deploy
- `.output/public/it/rephrase/` directory exists but contains no subdirectories for individual decks
- `nuxi generate` output log shows only the root routes being crawled

**Phase to address:** Phase 2 (routing scaffold) — define prerender routes alongside the page file structure. Verify the `.output/public` tree against the expected route list before any deployment.

---

### Pitfall 4: nuxt-i18n Routing Strategy Mismatch with Static Export

**What goes wrong:**
The Next.js port uses `next-intl` with explicit `[lang]` dynamic segments in the file system (`/pages/[lang]/rephrase/[deck].tsx`). Locale routing is fully under the developer's control. nuxt-i18n abstracts this — it intercepts Nuxt's router and adds locale prefixes automatically based on the configured `strategy`. This abstraction creates several failure modes for static export:

**Failure 1 — Wrong strategy for the app's URL structure:**
PuroLingua's URLs are all locale-prefixed (`/it/...`, `/es/...`) with no unprefixed default. Using `strategy: 'prefix_except_default'` with, say, `defaultLocale: 'it'` would make Italian routes unprefixed (`/rephrase/daily`) while Spanish routes are prefixed (`/es/rephrase/daily`). This breaks the URL symmetry the app requires and is inconsistent with the Next.js port's route structure. Use `strategy: 'prefix'` so all locales are always prefixed.

**Failure 2 — Page file structure conflicts with nuxt-i18n prefix injection:**
If a developer mirrors the Next.js file structure by creating `pages/[lang]/rephrase/[deck].vue`, nuxt-i18n will inject its own locale prefix ON TOP of the `[lang]` segment, producing URLs like `/it/it/rephrase/daily`. The two locale mechanisms collide. When using nuxt-i18n, pages should NOT have a `[lang]` dynamic segment — the module handles the locale prefix. Pages live at `pages/rephrase/[deck].vue` and nuxt-i18n creates `/it/rephrase/daily` automatically.

**Failure 3 — `useLocalePath` not used for navigation:**
next-intl's navigation uses typed route functions. nuxt-i18n requires using `useLocalePath()` (or `<NuxtLinkLocale>`) for all internal navigation. Using `<NuxtLink to="/rephrase/daily">` bypasses locale-awareness and navigates to the unprefixed path, breaking locale routing.

**Failure 4 — Lazy-loaded locale JSON 404s in static output:**
nuxt-i18n v9+ with `lazy: true` loads locale messages at runtime from `/_i18n/{locale}/messages.json`. With `nuxi generate`, these JSON files must be present in `.output/public/_i18n/`. A known issue (nuxt-modules/i18n GitHub issue #3645) causes these files to 404 in some static generation configurations. Mitigation: test locale switching in the generated static output, not just in `nuxi dev`. If 404s occur, switch from lazy-loaded to bundled locale messages.

**Consequences:**
- Locale routing works in dev and breaks silently after deploy
- Double-prefixed URLs (`/it/it/...`) that produce 404s
- Locale message 404s causing the UI to show translation keys instead of translated strings

**Prevention:**
1. Use `strategy: 'prefix'` in nuxt-i18n config (not `prefix_except_default`).
2. Structure page files WITHOUT a `[lang]` segment. Let nuxt-i18n handle the prefix.
3. Use `useLocalePath()` for all programmatic navigation and `<NuxtLinkLocale>` for template links.
4. Verify locale message file presence in `.output/public/_i18n/` after `nuxi generate`. If missing, use bundled (non-lazy) locale loading.
5. Test locale switching in the generated static output served over HTTP (not the file:// protocol) before deploying.

**Detection warning signs:**
- URLs showing `/it/it/rephrase/daily` in the browser
- UI displays translation keys (e.g., `nav.rephrase`) instead of translated text after deploy
- `nuxi dev` works but locale switching produces 404 after `nuxi generate`

**Phase to address:** Phase 2 (routing scaffold) — configure nuxt-i18n strategy before creating any page files. Verify locale routing in a static output smoke test before proceeding to content pages.

---

## Moderate Pitfalls

Mistakes that require significant debugging but don't cause data loss or forced rewrites.

---

### Pitfall 5: TypeScript tsconfig.json Direct Modification Conflicts with Nuxt's Generated Config

**What goes wrong:**
Nuxt 3 generates a `.nuxt/tsconfig.json` that includes Nuxt-specific path aliases (`#imports`, `#app`, component auto-import types, etc.). The project's root `tsconfig.json` must extend `.nuxt/tsconfig.json` — this is Nuxt's required pattern. If the root `tsconfig.json` defines `compilerOptions.paths` directly, those definitions OVERRIDE the paths in `.nuxt/tsconfig.json` rather than merging with them. Auto-imported composable types, component types, and Nuxt's virtual modules (`#imports`, `#app`, `#i18n`) become unresolvable.

Next.js projects typically configure `paths` aliases directly in `tsconfig.json` (e.g., `@/*` mapping). Migrating this pattern verbatim to Nuxt breaks type resolution.

**Why it happens:**
TypeScript's `extends` merging for `compilerOptions` is not deep-merge — child config keys overwrite parent config keys of the same name entirely. Developers expect `paths` to merge; it does not.

**Prevention:**
1. Do NOT define `compilerOptions.paths` in the root `tsconfig.json`.
2. Configure all custom path aliases through `nuxt.config.ts` using the `alias` option:
   ```typescript
   export default defineNuxtConfig({
     alias: { '@': '/<rootDir>/src' }
   })
   ```
   Nuxt writes these into `.nuxt/tsconfig.json` so they merge correctly.
3. The root `tsconfig.json` should contain only `{ "extends": "./.nuxt/tsconfig.json" }` plus any non-conflicting settings.
4. The `.nuxt/` directory does not exist before the first `nuxi dev` or `nuxi build` run. Do not reference `.nuxt/tsconfig.json` in CI before running a build step.

**Detection warning signs:**
- `Cannot find module '#imports'` errors in IDE
- Auto-imported composables show `any` type or "used before declaration" errors
- TypeScript errors disappear after deleting `tsconfig.json` customizations

**Phase to address:** Phase 1 (project scaffold) — establish the correct `tsconfig.json` structure from the start.

---

### Pitfall 6: Nuxt Auto-Import Collisions with Custom Composable Names

**What goes wrong:**
Nuxt 3 auto-imports all files from `composables/` and `utils/` directories globally. It also auto-imports all Nuxt built-ins (`useRoute`, `useRouter`, `useState`, `useFetch`, etc.) and vue-i18n composables (`useI18n`). If a custom composable is named to match a Nuxt built-in or a nuxt-i18n composable, the auto-import is silently shadowed or a runtime collision occurs.

Specific risk for this project:
- `useSRS` — safe (no Nuxt built-in with this name)
- `useVoiceRecognition` — safe
- `useLevelFilter` — safe
- `useI18n` — COLLISION: nuxt-i18n exports its own `useI18n`. Do not create a custom composable with this name.
- `useState` — COLLISION: Nuxt built-in. Do not shadow it with a custom state composable.

Additionally, nuxt-i18n is known to break Nuxt's auto-import functionality in some versions (nuxt-modules/i18n issue #2483). If composables stop being auto-imported after adding nuxt-i18n, this is the likely cause. The mitigation is to explicitly import from `#imports` in affected files.

**Prevention:**
1. Audit all composable file names against Nuxt built-ins and nuxt-i18n exports before the port begins.
2. Never name custom composables `useI18n`, `useState`, `useRoute`, `useRouter`, `useFetch`, `useAsyncData`, `useLazyFetch`, `useLocalePath`, `useSwitchLocalePath`, `useLocaleRoute`.
3. If auto-imports break after installing nuxt-i18n, fall back to explicit `import { useSRS } from '#imports'` in affected files.

**Detection warning signs:**
- Composable is called but behaves like the Nuxt built-in (wrong return type, wrong behavior)
- TypeScript reports no error but runtime behavior is wrong
- Auto-import stops working for all composables after adding nuxt-i18n

**Phase to address:** Phase 1 (project scaffold) — name composable files and verify no collision with Nuxt/nuxt-i18n namespace before porting SRS composables.

---

### Pitfall 7: `useState` vs `ref` for SSR-Shared State

**What goes wrong:**
In the Next.js port, React's `useState` hook and context are the standard state primitives. In Nuxt 3, `ref()` and `reactive()` are the Vue primitives — but they are NOT SSR-safe for shared state. If a composable uses `ref()` at the module level (outside a component), that ref is shared across ALL server requests (singleton on the server). One user's data leaks into another user's response.

For this project's static export use case, there is NO SSR data serving — `nuxi generate` produces static HTML. However, during `nuxi dev` (which runs SSR by default), using module-level `ref()` for localStorage-derived state causes confusing cross-request state bleed in development.

`useState()` (Nuxt's built-in) is keyed and SSR-safe: it serializes state from server to client for hydration and is scoped per request on the server.

**Prevention:**
- Use `useState('key', () => defaultValue)` for any state that is read during SSR rendering and must match between server and client.
- For localStorage-derived state (SRS progress, level filter preference), use `ref()` inside `onMounted` — the ref initializes to a safe default server-side and is populated from localStorage client-side after hydration. This is acceptable for static export because the server never serves personalized HTML.
- Never use module-level (singleton) `ref()` for user-specific state.

**Detection warning signs:**
- In `nuxi dev`, navigating between pages in one browser tab affects another tab's displayed state
- SRS progress from one "user" appears in a new incognito window during development

**Phase to address:** Phase 3 (SRS composable port) — adopt the correct state primitive for each composable before writing any localStorage integration.

---

## Minor Pitfalls

---

### Pitfall 8: `trailingSlash` Configuration Mismatch with Hostinger

**What goes wrong:**
The Next.js port uses `trailingSlash: true` in `next.config.ts`, which causes `nuxi export` to produce `it/index.html` as `it/rephrase/index.html` rather than `it/rephrase.html`. Hostinger's static file serving maps `/it/rephrase/` to `it/rephrase/index.html`. Without trailing slashes, Hostinger serves `/it/rephrase` as a download or 404.

Nuxt 3's Nitro static output also supports trailing slash configuration. The default behavior depends on the Nitro preset used.

**Prevention:**
Set `trailingSlash: true` in `nuxt.config.ts` under `nitro.prerender` or via the router options. Verify the `.output/public` directory structure produces `index.html` files in subdirectories (not `.html` files at the parent level) before deploying to Hostinger.

**Phase to address:** Phase 1 (project scaffold) — add trailing slash config alongside the Hostinger deployment notes.

---

### Pitfall 9: Vue SFC `<script setup>` Async Without Suspense Boundary

**What goes wrong:**
In Vue 3, if a component's `<script setup>` uses `await` at the top level, the component requires a `<Suspense>` boundary in its parent. Nuxt 3 provides a built-in `<NuxtPage>` which handles top-level `await` in page components, but child components (e.g., a study session component with an awaited composable initialization) do NOT get this automatically. The component either renders nothing or throws a Vue warning about missing Suspense.

This is distinct from the Next.js pattern where `async` components are a first-class feature in the App Router.

**Prevention:**
Avoid top-level `await` in non-page components. Move async initialization into `onMounted` or use `useAsyncData` / `useLazyFetch` which handle Suspense internally. Only page-level Vue files (in `pages/`) support top-level `await` natively via Nuxt's Suspense wrapping.

**Phase to address:** Phase 3 and 4 (SRS composable and UI component port) — review any async initialization patterns from the React hooks and convert to `onMounted` patterns.

---

### Pitfall 10: `process.client` Not Tree-Shaken in Production

**What goes wrong:**
`process.client` is a Nuxt convention but is NOT removed from the production bundle by Vite's tree-shaker. Code inside `if (process.client) { ... }` blocks is still included in the server bundle — it just evaluates to `false`. `import.meta.client` (available in Nuxt 3.x) IS tree-shaken at build time, producing smaller server bundles.

For this project, the difference in bundle size is minor. However, using `process.client` inside composable logic can cause unexpected behavior if the composable is imported in a server plugin or middleware context where the Node.js environment resolves `process.client` differently than expected.

**Prevention:**
Prefer `import.meta.client` for all client-side guards in composables and utilities. Reserve `process.client` only if targeting an older Nuxt 3.x version that doesn't support `import.meta.client`.

**Phase to address:** Phase 3 (SRS composable port) — establish the `import.meta.client` pattern in composable templates.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Nuxt scaffold + Tailwind | `@nuxtjs/tailwindcss` module conflict with v4 | Use `@tailwindcss/vite` Vite plugin only; never add the Nuxt module |
| Phase 1: Nuxt scaffold + TypeScript | `tsconfig.json` paths override Nuxt generated config | Extend `.nuxt/tsconfig.json` only; use `alias` in nuxt.config.ts |
| Phase 2: Routing + nuxt-i18n | Double-prefixed URLs if `[lang]` page segments used alongside nuxt-i18n | Remove `[lang]` from page file paths; let nuxt-i18n inject the prefix |
| Phase 2: Routing + nuxt-i18n | `prefix_except_default` asymmetric URL structure | Use `strategy: 'prefix'` for consistent `/it/...` and `/es/...` URLs |
| Phase 2: Static export | Dynamic deck/scenario routes missing from generated output | Enumerate all `/it/rephrase/[deck]` and `/es/qa/[scenario]` routes in `nitro.prerender.routes` |
| Phase 3: SRS composable port | `localStorage` access at setup time crashes SSR | Initialize all localStorage reads inside `onMounted` |
| Phase 3: SRS composable port | Module-level `ref()` causing cross-request state bleed in dev | Use `useState` for SSR-shared state; `ref` only inside component/composable scope |
| Phase 4: Voice recognition | `SpeechRecognition` instantiation at setup time crashes SSR | Wrap `useVoiceRecognition` consumers in `<ClientOnly>` or guard with `import.meta.client` |
| Phase 4: UI components + i18n | Navigation links bypass locale prefix | Use `<NuxtLinkLocale>` and `useLocalePath()` for all routing |
| Phase 5: Static export validation | Pages accessible in dev but 404 in static output | After every `nuxi generate`, verify `.output/public` contains all expected `index.html` files |
| Phase 5: Static export validation | Locale message JSON 404s in static output | Serve `.output/public` locally over HTTP and test locale switching before deploying |

---

## "Looks Done But Isn't" Checklist

Things that appear complete in `nuxi dev` but are broken in the `nuxi generate` static output.

- [ ] **All deck routes prerendered:** `.output/public/it/rephrase/daily/index.html` and all other deck/scenario combos exist — not just the index pages.
- [ ] **Locale messages loaded:** Open the app in the static output with a non-default locale active; UI shows translated strings, not raw i18n keys.
- [ ] **Trailing slash structure correct:** All URL paths resolve to `index.html` in a subdirectory, not `.html` files — verify Hostinger serves them without a 404.
- [ ] **No hydration warnings in production:** Serve the static output and open Chrome DevTools; no `[Vue warn]: Hydration` messages in the console.
- [ ] **SRS progress persists across page reloads:** Load a deck page, answer a card, reload — the card's box state is preserved in localStorage (confirms `onMounted` localStorage reads work correctly in static context).
- [ ] **Voice recognition composable does not crash on server:** Run `nuxi build` (not `nuxi generate`) and check the build log — no `ReferenceError: SpeechRecognition is not defined`.
- [ ] **Locale switching works in static output:** Switch from Italian to Spanish and back; routes resolve correctly, no double-prefix URLs appear.
- [ ] **TypeScript compiles clean:** `nuxi typecheck` returns zero errors before any phase is considered complete.

---

## Sources

- Nuxt 3 hydration best practices: [Nuxt and hydration — Best Practices v3](https://nuxt.com/docs/3.x/guide/best-practices/hydration)
- localStorage hydration mismatch discussion: [Hydration Mismatch Using localStorage · nuxt/nuxt · Discussion #25500](https://github.com/nuxt/nuxt/discussions/25500)
- Tailwind v4 + Nuxt conflict (confirmed issue): [Tailwind v4.1 | PostCSS plugin error · nuxt-modules/tailwindcss · Issue #978](https://github.com/nuxt-modules/tailwindcss/issues/978)
- Tailwind v4 + Nuxt discussion: [Cannot start Nuxt with new Tailwind version · tailwindlabs/tailwindcss · Discussion #16236](https://github.com/tailwindlabs/tailwindcss/discussions/16236)
- Tailwind v4 on Nuxt 3 guide: [Installing Tailwind CSS v4 on Nuxt 3 — MasteringNuxt](https://masteringnuxt.com/blog/installing-tailwind-css-v4-on-nuxt-3)
- nuxt-i18n routing strategies: [Routing Strategies — Nuxt I18n](https://i18n.nuxtjs.org/docs/guide)
- nuxt-i18n lazy loading 404 in static export: [Failed to load messages for locale — 404 on /_i18n/ · nuxt-modules/i18n · Issue #3645](https://github.com/nuxt-modules/i18n/issues/3645)
- nuxt-i18n auto-import breakage: [i18n breaks Nuxt Auto-Import functionality · Issue #2483 · nuxt-modules/i18n](https://github.com/nuxt-modules/i18n/issues/2483)
- Nuxt 3 TypeScript config docs: [TypeScript · Nuxt Concepts v3](https://nuxt.com/docs/3.x/guide/concepts/typescript)
- TypeScript strict mode in Nuxt: [Enable TypeScript strict mode by default · nuxt/nuxt · Discussion #17286](https://github.com/nuxt/nuxt/discussions/17286)
- Dynamic route prerendering: [Master Pre-rendering Dynamic Routes in Nuxt 3 with Nitro](https://dylanbritz.dev/writing/pre-rendering-nuxt-3-routes/)
- useState vs ref hydration: [Nuxt state management and hydration with useState — LogRocket Blog](https://blog.logrocket.com/nuxt-state-management-hydration-usestate/)
- Next.js → Nuxt 3 migration framework comparison: [Nuxt vs Next.js 2025: Framework Choice Guide — Strapi](https://strapi.io/blog/nuxt-vs-nextjs-framework-comparison-guide)
- PROJECT.md decision log: `QAStudySession SSR bypassed via next/dynamic ssr:false` — direct precedent for `<ClientOnly>` usage in Nuxt port

---

*Pitfalls research for: PuroLingua v2.0 Vue Port — Next.js → Nuxt 3 migration*
*Researched: 2026-03-12*
