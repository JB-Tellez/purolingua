---
phase: 09-scaffold
plan: "01"
subsystem: infra
tags: [nextjs, typescript, tailwind, next-intl, static-export]

# Dependency graph
requires: []
provides:
  - Next.js 16 project scaffold on feat/nextjs-port branch
  - Static export configured (output: 'export') with out/ directory produced
  - All seven core domain types exported from src/types/index.ts
  - next-intl plugin wired with stub request config
  - Tailwind v4 configured via @import "tailwindcss"
  - Stub directories for future phases: src/data, src/hooks, src/lib, src/i18n, messages
affects:
  - 09-02 (i18n routing and messages)
  - 10-data (deck data migration)
  - 11-logic (SRS hooks, types consumed)
  - 12-ui (components, Tailwind classes)
  - 13-deploy (static export from out/)

# Tech tracking
tech-stack:
  added:
    - "next@16.1.6"
    - "react@19.2.3"
    - "react-dom@19.2.3"
    - "next-intl@4.8.3"
    - "tailwindcss@4.2.1"
    - "@tailwindcss/postcss@4.2.1"
    - "typescript@5.9.3"
  patterns:
    - "Static export: output: 'export' in next.config.ts, produces out/ on build"
    - "next-intl plugin: createNextIntlPlugin wraps NextConfig, reads src/i18n/request.ts"
    - "Domain types: string literal unions (not enums) — Lang, Level, DeckId"
    - "Import alias: @/* maps to src/* via tsconfig paths"

key-files:
  created:
    - "src/types/index.ts — all seven domain types"
    - "src/i18n/request.ts — stub request config (Plan 02 replaces)"
    - "next.config.ts — static export + next-intl plugin"
    - "src/app/layout.tsx — minimal root layout"
    - "src/app/page.tsx — language picker (Italian/Spanish)"
    - "src/app/globals.css — Tailwind v4 import only"
    - "src/data/.gitkeep, src/hooks/.gitkeep, src/lib/.gitkeep, messages/.gitkeep — stubs"
  modified:
    - "package.json — Next.js 16 + React 19 + next-intl + Tailwind v4 deps"

key-decisions:
  - "Scaffolded create-next-app to /tmp then copied files — avoids conflict with existing .planning/, .claude/, tests/ dirs"
  - "Removed old node_modules and copied scaffold node_modules back — ensures clean dependency tree"
  - "i18n/request.ts stub created with hardcoded locale: 'it' — satisfies next-intl build plugin, replaced in Plan 02"
  - "DeckId uses eight confirmed literals from main-branch vanilla JS source (not guessed values)"

patterns-established:
  - "All domain types imported from '@/types' (not individual files)"
  - "Static export enforced at build — no SSR, no API routes"
  - "Stub directories (.gitkeep) for future-phase file drops"

requirements-completed: [INFRA-01, INFRA-02, DATA-01]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 9 Plan 01: Scaffold Next.js 16 Project Summary

**Next.js 16 static-export project on feat/nextjs-port with Tailwind v4, next-intl plugin, and seven domain types — bun run build exits 0, out/ produced**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-05T08:30:14Z
- **Completed:** 2026-03-05T08:35:35Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Cleared vanilla JS files (index.html, vite.config.js, src/) and scaffolded Next.js 16 with App Router and Tailwind v4
- Configured static export (`output: 'export'`) wrapped with next-intl plugin — `bun run build` exits 0 and produces `out/`
- Defined all seven domain types (Lang, Level, DeckId, Card, Deck, Progress, ProgressRecord) with DeckId confirmed against existing vanilla JS source

## Task Commits

Each task was committed atomically:

1. **Task 1: Switch to feature branch and scaffold Next.js project** - `2700aa6` (feat)
2. **Task 2: Configure static export and next-intl plugin** - `b91a319` (feat)
3. **Task 3: Define core domain types and verify build** - `5506dbe` (feat)

## Files Created/Modified
- `package.json` — Next.js 16, React 19, next-intl, Tailwind v4 dependencies
- `next.config.ts` — static export with `output: 'export'`, wrapped by `createNextIntlPlugin`
- `tsconfig.json` — TypeScript strict mode, `@/*` path alias
- `postcss.config.mjs` — @tailwindcss/postcss plugin
- `src/app/layout.tsx` — minimal root layout, metadata title "PuroLingua"
- `src/app/page.tsx` — language picker with /it and /es links
- `src/app/globals.css` — single line: `@import "tailwindcss"`
- `src/types/index.ts` — Lang, Level, DeckId, Card, Deck, Progress, ProgressRecord
- `src/i18n/request.ts` — stub request config (Plan 02 replaces with routing-aware version)
- `src/data/.gitkeep`, `src/hooks/.gitkeep`, `src/lib/.gitkeep`, `messages/.gitkeep` — stub dirs

## Decisions Made
- Scaffolded create-next-app to /tmp then copied files — the tool refuses to run in directories with existing content
- Created i18n/request.ts stub with hardcoded `locale: 'it'` and empty messages — satisfies next-intl plugin build requirement; Plan 02 replaces with full locale routing
- DeckId uses eight confirmed literals from the main-branch vanilla JS source: `daily | restaurant | travel | shopping | hotel | emergencies | social | weather`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scaffolded to /tmp then copied — create-next-app blocked by existing files**
- **Found during:** Task 1 (scaffold step)
- **Issue:** `bunx create-next-app .` refuses to run in directories with existing content (.planning/, .claude/, tests/, data/ etc.)
- **Fix:** Ran `bunx create-next-app /tmp/nextjs-scaffold` then copied all generated files (package.json, next.config.ts, tsconfig.json, postcss.config.mjs, src/, public/, bun.lock) to project root
- **Files modified:** All scaffold files (same as planned)
- **Verification:** All expected files present at project root, `bun install` succeeded
- **Committed in:** `2700aa6` (Task 1 commit)

**2. [Rule 3 - Blocking] Created i18n/request.ts stub — next-intl plugin requires file at build time**
- **Found during:** Task 3 (build verification)
- **Issue:** `bun run build` failed with "Could not find i18n config at ./src/i18n/request.ts" — next-intl plugin reads this file at build time even before locale routing is configured
- **Fix:** Created minimal stub with hardcoded locale 'it' and empty messages as specified in plan's contingency
- **Files modified:** `src/i18n/request.ts`
- **Verification:** `bun run build` exits 0, `out/` directory produced
- **Committed in:** `5506dbe` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were anticipated in the plan's contingency notes. No scope creep.

## Issues Encountered
None beyond the two blocking issues handled above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- feat/nextjs-port branch is ready for Plan 02 (i18n routing, next-intl messages, locale middleware)
- src/types/index.ts is the contract for all downstream phases (10-data, 11-logic, 12-ui)
- i18n/request.ts stub must be replaced in Plan 02 before any locale-aware pages are added

## Self-Check: PASSED

- src/types/index.ts: FOUND
- next.config.ts: FOUND
- out/ directory: FOUND
- Commit 2700aa6 (Task 1): FOUND
- Commit b91a319 (Task 2): FOUND
- Commit 5506dbe (Task 3): FOUND

---
*Phase: 09-scaffold*
*Completed: 2026-03-05*
