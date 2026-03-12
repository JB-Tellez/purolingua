# Phase 20: Scaffold - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize the Nuxt 4 project so `bun run dev` runs without errors, `nuxi generate` produces `.output/public/` with all ~46 static routes, and all five known migration pitfalls are prevented by enforced configuration patterns. No UI components, no composables, no card data port — scaffold only.

</domain>

<decisions>
## Implementation Decisions

### File preservation strategy
- Keep `src/` intact as the migration reference for phases 21–25 to port from
- Scaffold Nuxt 4 structure alongside it: new `app.vue`, `pages/`, `composables/`, `assets/` directories in repo root
- Replace Next.js root config files (`next.config.ts`, `postcss.config.mjs`) with `nuxt.config.ts`
- `messages/`, `data/`, `public/` stay in place — Nuxt resolves them from root by convention

### Prerender route enumeration
- Generate routes programmatically in `nuxt.config.ts` by importing deck IDs and scenario IDs from `src/data/`
- Do not hardcode the ~46 strings — keeps config in sync if deck data changes, and validates data module importability early
- Both locale prefixes (`/it/`, `/es/`) × all deck routes + scenario routes must be covered

### Smoke test scope
- `mountSuspended` the home/index page component and assert it renders without throwing
- Test proves both `@nuxt/test-utils` wiring and that a real Vue page mounts successfully
- More confidence than a trivial import check; keeps SCAF-05 requirement meaningful

### Claude's Discretion
- Exact Vitest config shape for @nuxt/test-utils integration
- Whether to use `nuxi init` or manually write nuxt.config.ts + minimal boilerplate
- Placeholder page templates for routes (content comes in later phases)
- tsconfig.json exact contents (must only extend `.nuxt/tsconfig.json` per SCAF-01)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/data/` (deckMap.ts, decks.ts, it/, es/, qa/): Card data — importable from nuxt.config.ts to generate prerender routes; all typing preserved
- `src/lib/srs.ts`, `src/lib/generateChoices.ts`: Pure logic — no framework dependency, will pass Vitest unchanged after scaffold
- `src/types/index.ts`: TypeScript types — framework-neutral, carry forward as-is
- `messages/` (it.json, es.json): Already exist at root — Nuxt i18n can reference them directly
- `public/`: Static assets at root — Nuxt serves from `public/` by default, no move needed

### Established Patterns
- `bun` is the package manager for all scripts (dev, test, generate)
- Tailwind v4 already in dependencies (`tailwindcss: ^4`) — needs `@tailwindcss/vite` plugin, not PostCSS module
- Vitest already configured — will be reconfigured for `@nuxt/test-utils`/`mountSuspended`

### Integration Points
- `nuxt.config.ts` needs to import from `src/data/` to build `nitro.prerender.routes`
- Global CSS entry (`assets/css/main.css` or similar) needs `@import "tailwindcss"` as the sole Tailwind directive
- @nuxtjs/i18n module reads from `messages/` — path must match config

</code_context>

<specifics>
## Specific Ideas

- No specific UI references — this is infrastructure only
- The five pitfalls documented in STATE.md are all locked patterns to enforce: SSR guards, no @nuxtjs/tailwindcss, explicit prerender routes, no [lang] page segments, dueCards as ref not computed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-scaffold*
*Context gathered: 2026-03-12*
