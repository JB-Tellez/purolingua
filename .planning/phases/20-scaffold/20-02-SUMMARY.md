---
phase: 20-scaffold
plan: "02"
subsystem: infra
tags: [nuxt4, vue, pages, routing, i18n, static-generation, vitest, happy-dom]

# Dependency graph
requires:
  - phase: 20-scaffold
    plan: "01"
    provides: "Nuxt 4 scaffold with nuxt.config.ts, app.vue, Tailwind v4, @nuxtjs/i18n prefix strategy, dual-project Vitest"
provides:
  - All 5 placeholder Vue pages in app/pages/ (index, rephrase/index, rephrase/[deck], qa/index, qa/[scenario])
  - Static output in .output/public/ with 36 index.html routes across it/ and es/ locales
  - Verified no double-prefix directories in static output
  - Full test suite green: 21 unit + 1 smoke mountSuspended = 22 tests
  - crawlLinks:false in nitro.prerender (required for prefix strategy with bare links)
  - happy-dom installed for @nuxt/test-utils nuxt environment
affects: [21-data, 22-composables, 23-components, 24-pages, 25-static]

# Tech tracking
tech-stack:
  added:
    - happy-dom@20.8.4 (devDependency — required by @nuxt/test-utils nuxt environment)
  patterns:
    - Placeholder Vue pages use only <template> with no <script> or composables
    - NuxtLink bare paths (/rephrase, /qa) cause Nitro crawler 404s under prefix strategy — disable crawlLinks:false when links are placeholders
    - nitro.prerender.crawlLinks:false with explicit routes array is the correct pattern for prefix-strategy apps

key-files:
  created:
    - app/pages/index.vue
    - app/pages/rephrase/index.vue
    - app/pages/rephrase/[deck].vue
    - app/pages/qa/index.vue
    - app/pages/qa/[scenario].vue
  modified:
    - nuxt.config.ts (fixed SCENARIO_IDS, added crawlLinks:false)
    - package.json (happy-dom added)
    - bun.lock

key-decisions:
  - "crawlLinks:false in nitro.prerender — i18n prefix strategy has no un-prefixed /rephrase or /qa routes; Nitro crawler follows NuxtLink hrefs and gets 404, aborting generate. Explicit routes array is sufficient."
  - "SCENARIO_IDS corrected from English (coffee/hotel/restaurant...) to Italian (caffe/albergo/ristorante...) matching src/data/qa/ barrel — wrong IDs would produce unreachable prerendered routes"
  - "happy-dom required by @nuxt/test-utils for nuxt environment — not auto-installed with @nuxt/test-utils"

patterns-established:
  - "Pattern: nitro.prerender.crawlLinks:false + explicit routes — prevents crawler from chasing bare links under i18n prefix strategy"
  - "Pattern: Placeholder pages are template-only — no script, no composables, no i18n calls — content arrives in later phases"

requirements-completed: [SCAF-03, SCAF-04, SCAF-05]

# Metrics
duration: 8min
completed: "2026-03-12"
---

# Phase 20 Plan 02: Scaffold — Placeholder Pages and Static Generation Summary

**Five placeholder Vue pages (index, rephrase, rephrase/[deck], qa, qa/[scenario]) generating 36 prerendered routes across it/ and es/ locales with full test suite green (22/22)**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-12T23:09:13Z
- **Completed:** 2026-03-12T23:17:00Z
- **Tasks:** 3/3
- **Files modified:** 8

## Accomplishments
- Created all 5 placeholder Vue page files with correct paths — no [lang] segments, i18n prefix routing verified
- nuxi generate exits 0 producing 36 index.html routes: 18 per locale (index + rephrase + 8 deck + qa + 7 scenario)
- Full test suite passes: 21 unit tests + 1 mountSuspended smoke test = 22 tests (was 21 before — smoke test was blocked by missing index.vue)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all placeholder page files** - `6eb21c4` (feat)
2. **Task 2: Generate static output and verify all routes present** - `a5b0957` (feat)
3. **Task 3: Human verify dev server and static output** - Approved (human-verify checkpoint)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `app/pages/index.vue` - Activity picker placeholder (/ route via i18n prefix)
- `app/pages/rephrase/index.vue` - Deck grid placeholder (/rephrase route)
- `app/pages/rephrase/[deck].vue` - Study session placeholder with $route.params.deck
- `app/pages/qa/index.vue` - Scenario grid placeholder (/qa route)
- `app/pages/qa/[scenario].vue` - Q&A session placeholder with $route.params.scenario
- `nuxt.config.ts` - Fixed SCENARIO_IDS (English→Italian), added crawlLinks:false
- `package.json` - Added happy-dom devDependency
- `bun.lock` - Updated lockfile

## Route Count: 36 index.html files

Actual count: 36 index.html files (not the "~46" in ROADMAP or "39" in plan interfaces):
- 2 locale roots: /it/index.html, /es/index.html
- 2 rephrase roots: /it/rephrase/index.html, /es/rephrase/index.html
- 16 deck routes: /it/rephrase/{8 decks} + /es/rephrase/{8 decks}
- 2 qa roots: /it/qa/index.html, /es/qa/index.html
- 14 scenario routes: /it/qa/{7 scenarios} + /es/qa/{7 scenarios}
- Total: 2 + 2 + 16 + 2 + 14 = 36

Note: Root `/` does not produce an index.html in Nuxt static mode — it uses 200.html as the SPA fallback. The ROADMAP "~46" estimate was an overcount.

## Decisions Made
- **crawlLinks:false:** Under i18n prefix strategy, there are no valid un-prefixed routes for /rephrase or /qa. The placeholder index.vue uses bare NuxtLink paths that the Nitro crawler follows and hits 404, causing generate to abort. Disabling crawlLinks and relying on the explicit routes array is the correct pattern.
- **SCENARIO_IDS corrected:** nuxt.config.ts had English IDs from Plan 01 (coffee, hotel, restaurant, street, introductions, shop, train) but src/data/qa/*.ts uses Italian IDs (caffe, albergo, ristorante, strada, presentazioni, negozio, treno). Fixed to match actual data.
- **happy-dom installed:** @nuxt/test-utils nuxt environment requires happy-dom but does not auto-install it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed SCENARIO_IDS in nuxt.config.ts from English to Italian names**
- **Found during:** Task 1 (pre-generate review of nuxt.config.ts)
- **Issue:** SCENARIO_IDS used English names (coffee, hotel, restaurant, street, introductions, shop, train) but src/data/qa/ barrel exports use Italian names (caffe, albergo, ristorante, strada, presentazioni, negozio, treno). Wrong IDs would produce prerendered routes that can't match any actual data.
- **Fix:** Updated SCENARIO_IDS array in nuxt.config.ts to use Italian IDs
- **Files modified:** nuxt.config.ts
- **Verification:** nuxi generate produces /it/qa/caffe/, /it/qa/albergo/ etc. matching data
- **Committed in:** 6eb21c4 (Task 1 commit)

**2. [Rule 1 - Bug] Added crawlLinks:false to prevent generate failure from bare NuxtLinks**
- **Found during:** Task 2 (first nuxi generate attempt)
- **Issue:** nuxi generate failed with "Page not found: /rephrase" and "Page not found: /qa" — the Nitro crawler followed NuxtLink hrefs in index.vue and hit 404 under prefix strategy (no un-prefixed routes exist)
- **Fix:** Added `crawlLinks: false` to nitro.prerender — explicit routes array is sufficient, crawler not needed
- **Files modified:** nuxt.config.ts
- **Verification:** Second nuxi generate run exits 0, 36 routes produced
- **Committed in:** a5b0957 (Task 2 commit)

**3. [Rule 3 - Blocking] Installed missing happy-dom for nuxt test environment**
- **Found during:** Task 2 (bun run test)
- **Issue:** Vitest nuxt project crashed with "Cannot find package 'happy-dom'" — @nuxt/test-utils requires happy-dom but doesn't list it as a peer/automatic dependency
- **Fix:** `bun add -D happy-dom`
- **Files modified:** package.json, bun.lock
- **Verification:** bun run test passes all 22 tests (21 unit + 1 smoke)
- **Committed in:** a5b0957 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 Rule 1 bugs, 1 Rule 3 blocking)
**Impact on plan:** All fixes necessary for correctness and test suite functionality. No scope creep.

## Issues Encountered
- Nitro crawler + i18n prefix strategy incompatibility: bare NuxtLinks in placeholder pages cause generate to abort. Pattern: use crawlLinks:false when pages have bare (non-localePath) links.
- happy-dom not bundled with @nuxt/test-utils despite being required for nuxt environment.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 page routes exist with correct paths, no [lang] segments
- Static generation confirmed working (36 routes)
- No double-prefix directories
- Full test suite green (22/22)
- Human checkpoint approved: dev server loads, Tailwind applies, no 404s, no double-prefix directories confirmed
- Phase 20 complete; ready for Phase 21 (data layer)

---
*Phase: 20-scaffold*
*Completed: 2026-03-12*
