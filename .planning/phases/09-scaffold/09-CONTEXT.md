# Phase 9: Scaffold - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize a Next.js 15 project on `feat/nextjs-port` with TypeScript, Tailwind, and next-intl configured — plus core domain types (Card, Deck, Progress, Lang, DeckId, Level) that all subsequent phases depend on. Does not include card data, SRS logic, routing pages, or UI components.

</domain>

<decisions>
## Implementation Decisions

### Project location in repo
- Next.js project replaces the repo root on `feat/nextjs-port` — clean break, no subdirectory
- Branch from `main` (not orphan) so vanilla JS files are accessible for reference while porting
- Existing vanilla JS lives on `main`; the feature branch starts from main and the scaffold replaces existing files

### Source directory structure
- `src/app/` — Next.js App Router pages
- `src/lib/` — SRS logic, pure functions
- `src/hooks/` — useSRS, useLevelFilter
- `src/types/` — domain types
- `src/data/` — card arrays (Phase 10, stubbed or empty in Phase 9)

### next-intl locale routing
- `/` is always a language picker page — no redirect, no locale detection
- `always` prefix strategy: locale routes are `/it/*` and `/es/*`; `/` sits outside localized routes
- next-intl message files at top-level `messages/it.json` and `messages/es.json`
- Middleware handles `/it` and `/es` route groups; `/` is a regular Next.js page

### TypeScript types
- All domain types in a single `src/types/index.ts` — import as `import type { Card } from '@/types'`
- `strict: true` in tsconfig (Next.js 15 default — portfolio piece, shows TypeScript discipline)
- String literal unions, not enums: `type Lang = 'it' | 'es'`, `type Level = 'A1' | 'A2'`, `type DeckId = 'restaurant' | 'travel' | ...`

### Claude's Discretion
- Tailwind version (v3 vs v4) — choose whichever integrates cleanly with Next.js 15
- Exact `next.config.ts` shape beyond `output: 'export'`
- tsconfig path alias configuration (`@/` convention expected)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/js/core/app.js`, `state.js`, `i18n.js`, `views.js` — vanilla JS modules to reference while building Next.js equivalents
- `src/js/features/progress.js` — SRS state logic; key format `{deckId}_{cardIndex}` must be preserved exactly in Phase 11
- `src/js/utils/deck-utils.js` — distractor generation logic to port in Phase 11
- `src/locales/it/`, `src/locales/es/` — existing translation strings to migrate to next-intl message files

### Established Patterns
- localStorage keys follow `{deckId}_{cardIndex}` format — must be preserved in useSRS hook (Phase 11)
- Coordinator pattern: `setActiveLevels` doesn't auto-save; `initActiveLevels`/`updateActiveLevels` coordinate — carry forward to useLevelFilter
- CEFR codes (A1/A2) are language-neutral — not in i18n message files
- Static export only (`output: 'export'`) — no SSR, no API routes

### Integration Points
- Phase 10 drops card arrays into `src/data/` — scaffold should stub or create empty `src/data/` dir
- Phase 11 implements `src/lib/srs.ts` and `src/hooks/` — scaffold creates empty dirs with placeholder or no files
- Phase 12 adds pages under `src/app/[lang]/` and `src/app/[lang]/[deck]/`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard `create-next-app` or manual scaffold approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-scaffold*
*Context gathered: 2026-03-04*
