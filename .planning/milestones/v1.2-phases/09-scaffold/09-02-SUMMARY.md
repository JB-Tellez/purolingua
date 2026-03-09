---
phase: 09-scaffold
plan: "02"
subsystem: infra
tags: [nextjs, next-intl, typescript, i18n, static-export, routing]

# Dependency graph
requires:
  - phase: 09-scaffold-01
    provides: "Next.js 16 scaffold, next-intl plugin wired, stub src/i18n/request.ts"
provides:
  - next-intl routing config with locales ['it', 'es'] and defaultLocale 'it'
  - Routing-aware getRequestConfig loading messages dynamically by locale
  - createNavigation helpers (Link, redirect, usePathname, useRouter, getPathname)
  - Stub message files for both locales with all 8 deck names and filter label
  - [lang] locale layout with generateStaticParams, setRequestLocale, NextIntlClientProvider
  - Static export producing out/it/index.html and out/es/index.html
affects:
  - 12-ui (uses Link and usePathname from src/i18n/navigation.ts)
  - 13-deploy (static export locales in out/)
  - 13-i18n (message files populated fully in this phase)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next-intl static export: no middleware.ts — defineRouting + generateStaticParams + setRequestLocale pattern"
    - "params as Promise: Next.js 16 requires await params in Server Components"
    - "trailingSlash: true in next.config.ts produces out/{locale}/index.html for clean URL deployment"
    - "message files at root messages/{locale}.json — dynamically imported in getRequestConfig"

key-files:
  created:
    - "src/i18n/routing.ts — defineRouting with locales ['it', 'es'] and defaultLocale 'it'"
    - "src/i18n/navigation.ts — createNavigation exports: Link, redirect, usePathname, useRouter, getPathname"
    - "messages/it.json — Italian UI stubs: nav, 8 deck names, filter label"
    - "messages/es.json — Spanish UI stubs: nav, 8 deck names, filter label"
    - "src/app/[lang]/layout.tsx — locale layout with generateStaticParams, setRequestLocale, NextIntlClientProvider"
    - "src/app/[lang]/page.tsx — stub deck grid page (Phase 12 replaces)"
  modified:
    - "src/i18n/request.ts — replaced hardcoded stub with routing-aware getRequestConfig"
    - "next.config.ts — added trailingSlash: true for out/{locale}/index.html output"

key-decisions:
  - "Added trailingSlash: true to next.config.ts — without it Next.js produces out/it.html not out/it/index.html; trailing slash is required for clean URL deployment on Hostinger"
  - "CEFR codes A1/A2 not in message files — language-neutral string literals per CONTEXT.md locked decision"
  - "No middleware.ts created — static export is incompatible with Next.js middleware"

patterns-established:
  - "Locale validation in layout: routing.locales.includes(lang) → notFound() for invalid segments"
  - "Three-step static locale pattern: generateStaticParams → await params → setRequestLocale before hooks"

requirements-completed: [INFRA-01, INFRA-02]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 9 Plan 02: Wire next-intl i18n Routing Summary

**next-intl fully wired for static export — defineRouting, routing-aware getRequestConfig, createNavigation, message stubs, and [lang] layout producing out/it/index.html and out/es/index.html**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-05T08:14:49Z
- **Completed:** 2026-03-05T08:20:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created next-intl routing infrastructure: routing.ts, request.ts (routing-aware), navigation.ts
- Created stub message files for Italian and Spanish covering all 8 deck names, nav, and filter label
- Created `src/app/[lang]/layout.tsx` with all three required static rendering steps and `src/app/[lang]/page.tsx` stub
- `bun run build` exits 0 — `out/it/index.html` and `out/es/index.html` confirmed present in static export

## Task Commits

Each task was committed atomically:

1. **Task 1: Create next-intl routing, request, and navigation config** - `6c23b99` (feat)
2. **Task 2: Create [lang] layout and verify full build** - `c0a1692` (feat)

## Files Created/Modified
- `src/i18n/routing.ts` — defineRouting with locales ['it', 'es'], defaultLocale 'it'
- `src/i18n/request.ts` — routing-aware getRequestConfig, loads messages/{locale}.json dynamically
- `src/i18n/navigation.ts` — createNavigation exports: Link, redirect, usePathname, useRouter, getPathname
- `messages/it.json` — Italian stubs: Home, 8 deck names (Vita Quotidiana etc.), Livello
- `messages/es.json` — Spanish stubs: Inicio, 8 deck names (Vida Diaria etc.), Nivel
- `src/app/[lang]/layout.tsx` — generateStaticParams, setRequestLocale, NextIntlClientProvider
- `src/app/[lang]/page.tsx` — stub page "Deck grid coming in Phase 12"
- `next.config.ts` — added trailingSlash: true

## Decisions Made
- Added `trailingSlash: true` to `next.config.ts` — the plan's success criteria required `out/it/index.html`; without trailing slash Next.js produces `out/it.html` (file-based). Trailing slash is also the correct format for Hostinger static hosting.
- CEFR codes A1/A2 are language-neutral and intentionally absent from message files (locked decision from CONTEXT.md).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added trailingSlash: true to next.config.ts**
- **Found during:** Task 2 (build verification)
- **Issue:** Without `trailingSlash: true`, Next.js static export produces `out/it.html` and `out/es.html` instead of `out/it/index.html` and `out/es/index.html`. Plan success criteria explicitly requires the latter format.
- **Fix:** Added `trailingSlash: true` to `nextConfig` in `next.config.ts`
- **Files modified:** `next.config.ts`
- **Verification:** `bun run build` exits 0; `out/it/index.html` and `out/es/index.html` confirmed present
- **Committed in:** `c0a1692` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix required to satisfy plan's success criteria. Trailing slash is also correct for Hostinger static hosting. No scope creep.

## Issues Encountered
None beyond the single auto-fixed issue above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 10 (Data) can proceed: src/types/index.ts and deck data migration target paths are ready
- Phase 12 (UI) can proceed: next-intl Link and usePathname from src/i18n/navigation.ts are available
- src/app/[lang]/page.tsx is a stub — Phase 12 replaces with the real deck grid component
- messages/it.json and messages/es.json are stubs — Phase 13 populates fully with all UI strings

## Self-Check: PASSED

- src/i18n/routing.ts: FOUND
- src/i18n/request.ts: FOUND
- src/i18n/navigation.ts: FOUND
- messages/it.json: FOUND
- messages/es.json: FOUND
- src/app/[lang]/layout.tsx: FOUND
- src/app/[lang]/page.tsx: FOUND
- out/it/index.html: FOUND
- out/es/index.html: FOUND
- Commit 6c23b99 (Task 1): FOUND
- Commit c0a1692 (Task 2): FOUND

---
*Phase: 09-scaffold*
*Completed: 2026-03-05*
