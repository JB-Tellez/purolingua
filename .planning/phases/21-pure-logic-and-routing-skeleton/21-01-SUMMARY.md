---
phase: 21-pure-logic-and-routing-skeleton
plan: 01
subsystem: testing
tags: [nuxt, vitest, static-generation, route-verification, srs, typescript]

requires:
  - phase: 20-scaffold
    provides: "36 prerendered locale x deck/scenario routes, placeholder Vue pages, unit tests for srs.ts and generateChoices.ts"

provides:
  - "specs/verify-routes.ts — reusable script confirming all 36 routes exist in .output/public/"
  - "DATA-01 confirmed: srs.ts and generateChoices.ts unit tests 21/21 passing"
  - "DATA-02 confirmed: all 36 locale x deck/scenario routes prerendered by nuxi generate"

affects:
  - "22-composables — alias verification for app/composables/ importing from src/ (see Pitfall 3 in RESEARCH.md)"
  - "Any future phase that changes DECK_IDS or SCENARIO_IDS in nuxt.config.ts (must sync specs/verify-routes.ts)"

tech-stack:
  added: []
  patterns:
    - "Route verification script pattern: inline constants matching nuxt.config.ts, check index.html + __nuxt marker, exit 0/1"

key-files:
  created:
    - "specs/verify-routes.ts"
  modified: []

key-decisions:
  - "Constants inlined in specs/verify-routes.ts (not imported from nuxt.config.ts) — nuxt.config.ts uses as const TypeScript syntax not eval-safe in plain Bun scripts"
  - "Content check (presence of <div id='__nuxt'>) applied to all 36 routes, not just spot-check 3, to catch silent SSR error pages"

patterns-established:
  - "Route verifier pattern: bun specs/verify-routes.ts — run after any nuxi generate to confirm completeness"

requirements-completed: [DATA-01, DATA-02]

duration: 5min
completed: 2026-03-12
---

# Phase 21 Plan 01: Pure Logic and Routing Skeleton Summary

**Route verifier script (specs/verify-routes.ts) created; DATA-01 (21/21 unit tests green) and DATA-02 (all 36 prerendered routes confirmed) both verified with zero failures**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-12T23:34:57Z
- **Completed:** 2026-03-12T23:40:00Z
- **Tasks:** 2
- **Files modified:** 1 (created)

## Accomplishments

- Created `specs/verify-routes.ts` — a plain Bun/Node script that checks all 36 locale x deck/scenario routes exist as `index.html` in `.output/public/` and contain `<div id="__nuxt">` (guards against silent SSR error pages)
- Confirmed DATA-01: `bun run vitest run --project unit` passes 2 files, 21 tests with zero failures
- Confirmed DATA-02: `bun run generate` exits 0, `bun specs/verify-routes.ts` prints "All 36 routes verified in .output/public/"
- Full test suite: `bun run vitest run` passes 3 files, 22 tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Create specs/verify-routes.ts** - `c1ba83c` (feat)
2. **Task 2: Confirm DATA-01 and DATA-02** — verification-only, no source file changes (no separate commit)

**Plan metadata:** (see docs commit below)

## Files Created/Modified

- `specs/verify-routes.ts` — Route verification script; inlines DECK_IDS/SCENARIO_IDS/LOCALES, checks 36 routes for index.html + `<div id="__nuxt">`, exits 0 on pass / 1 on failure

## Decisions Made

- Constants inlined (not imported from nuxt.config.ts) because nuxt.config.ts uses TypeScript `as const` syntax which requires a TypeScript compiler context, not plain Bun eval
- Content check applied to all 36 routes (not just first 3) — spot-checking only 3 would not catch a failing deck or scenario route

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Both DATA-01 and DATA-02 were already satisfied by Phase 20's work, as the research predicted.

## Reusable Verification Command

```bash
# After any nuxi generate, confirm all 36 routes are healthy:
bun specs/verify-routes.ts
```

## Note for Phase 22

`app/composables/` will import from `src/lib/srs.ts` and `src/data/`. The `@/` alias in Nuxt 4 resolves to `app/` (srcDir), not the repo root. Imports like `import { computeNextReview } from '@/../../src/lib/srs'` will be ugly — Phase 22 should configure a `~/src` alias or use relative imports. See RESEARCH.md Pitfall 3.

## Next Phase Readiness

- Phase 21 requirements DATA-01 and DATA-02 are both complete
- specs/verify-routes.ts is ready to use as a permanent regression check
- Phase 22 (composables) can proceed; alias strategy for src/ imports needs a decision at start of Phase 22

---
*Phase: 21-pure-logic-and-routing-skeleton*
*Completed: 2026-03-12*
