---
phase: 09-scaffold
verified: 2026-03-05T09:00:00Z
status: passed
score: 8/8 must-haves verified
re_verification: false
---

# Phase 9: Scaffold Verification Report

**Phase Goal:** A working Next.js 16 project on `feat/nextjs-port` with TypeScript, Tailwind, and next-intl configured — plus core domain types that all subsequent phases depend on
**Verified:** 2026-03-05T09:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                    | Status     | Evidence                                                                                             |
|----|----------------------------------------------------------------------------------------------------------|------------|------------------------------------------------------------------------------------------------------|
| 1  | The repo root on `feat/nextjs-port` is a valid Next.js 16 project — `bun run build` exits 0             | VERIFIED   | `bun run build` completed cleanly; `next@16.1.6` in package.json; branch is `feat/nextjs-port`       |
| 2  | `bun run build` produces an `out/` directory (static export configured)                                 | VERIFIED   | `out/index.html`, `out/it/index.html`, `out/es/index.html` all present                              |
| 3  | All six domain types are importable from `@/types` with no TypeScript errors                             | VERIFIED   | `src/types/index.ts` exports Lang, Level, DeckId, Card, Deck, Progress, ProgressRecord (seven total); build passes TypeScript strict mode |
| 4  | Tailwind utility classes compile into the build CSS output                                               | VERIFIED   | `src/app/globals.css` contains `@import "tailwindcss"`; build succeeded with Tailwind v4.2.1         |
| 5  | Requests to `/it` and `/es` resolve correctly — routes exist in the static export                       | VERIFIED   | `out/it/index.html` and `out/es/index.html` both present; build output confirms SSG for `[lang]`     |
| 6  | `bun run build` exits 0 with next-intl fully wired (routing, request config, navigation)                 | VERIFIED   | Build completes with no errors; routing.ts, request.ts, navigation.ts all wired end-to-end            |
| 7  | next-intl message files exist for both locales with stub UI strings                                      | VERIFIED   | `messages/it.json` and `messages/es.json` both exist with all 8 deck names, nav, and filter label    |
| 8  | `src/app/[lang]/layout.tsx` calls `setRequestLocale` and wraps children with `NextIntlClientProvider`   | VERIFIED   | File confirmed to contain `setRequestLocale(lang)`, `generateStaticParams`, and `NextIntlClientProvider` |

**Score:** 8/8 truths verified

---

### Required Artifacts

#### Plan 01 Artifacts

| Artifact                   | Expected                                                     | Status   | Details                                                                       |
|----------------------------|--------------------------------------------------------------|----------|-------------------------------------------------------------------------------|
| `package.json`             | Next.js 16 + React 19 + next-intl + Tailwind v4 deps        | VERIFIED | `next@16.1.6`, `next-intl@^4.8.3`, `tailwindcss@4.2.1` confirmed             |
| `next.config.ts`           | Static export config wrapped with next-intl plugin           | VERIFIED | `output: 'export'`, `trailingSlash: true`, `withNextIntl(nextConfig)` present |
| `src/types/index.ts`       | All seven domain types: Lang, Level, DeckId, Card, Deck, Progress, ProgressRecord | VERIFIED | All seven exports confirmed; DeckId uses 8 correct literals                   |
| `src/app/layout.tsx`       | Root layout with metadata title "PuroLingua"                 | VERIFIED | Minimal layout with metadata title: 'PuroLingua' and globals.css import       |
| `src/app/page.tsx`         | Language picker page with /it and /es links                  | VERIFIED | Links to `/it` and `/es` via `next/link`; Tailwind classes used throughout    |
| `src/app/globals.css`      | Tailwind v4 import                                           | VERIFIED | Single line: `@import "tailwindcss"`                                          |

#### Plan 02 Artifacts

| Artifact                        | Expected                                                        | Status   | Details                                                                              |
|---------------------------------|-----------------------------------------------------------------|----------|--------------------------------------------------------------------------------------|
| `src/i18n/routing.ts`           | defineRouting with locales ['it', 'es'] and defaultLocale 'it'  | VERIFIED | `defineRouting({ locales: ['it', 'es'] as const, defaultLocale: 'it' })`             |
| `src/i18n/request.ts`           | getRequestConfig loading messages/[locale].json at build time   | VERIFIED | Routing-aware config; `hasLocale` validation; dynamic `import(messages/${locale})`)  |
| `src/i18n/navigation.ts`        | createNavigation exports: Link, redirect, usePathname, useRouter, getPathname | VERIFIED | All five exports confirmed via destructuring from `createNavigation(routing)`        |
| `messages/it.json`              | Italian UI string stubs for all 8 decks                         | VERIFIED | nav, all 8 deck keys (daily through weather), filter.label all present               |
| `messages/es.json`              | Spanish UI string stubs for all 8 decks                         | VERIFIED | nav, all 8 deck keys, filter.label all present                                       |
| `src/app/[lang]/layout.tsx`     | Locale layout: generateStaticParams, setRequestLocale, NextIntlClientProvider | VERIFIED | All three steps present; params awaited correctly as `Promise<{lang: string}>`       |

---

### Key Link Verification

| From                         | To                          | Via                                           | Status   | Details                                                               |
|------------------------------|-----------------------------|-----------------------------------------------|----------|-----------------------------------------------------------------------|
| `next.config.ts`             | `withNextIntl` plugin        | `createNextIntlPlugin('./src/i18n/request.ts')` | WIRED    | Plugin wraps config; `withNextIntl(nextConfig)` exported              |
| `src/app/globals.css`        | Tailwind v4                  | `@import "tailwindcss"`                        | WIRED    | Single-line import; build compiled CSS confirmed                      |
| `src/app/[lang]/layout.tsx`  | `src/i18n/routing.ts`        | `generateStaticParams` returns `routing.locales` | WIRED  | `routing.locales.map((locale) => ({ lang: locale }))` confirmed       |
| `src/i18n/request.ts`        | `messages/[locale].json`     | dynamic import in `getRequestConfig`           | WIRED    | `await import(\`../../messages/${locale}.json\`)` confirmed           |
| `next.config.ts`             | `src/i18n/request.ts`        | `createNextIntlPlugin` argument                | WIRED    | `createNextIntlPlugin('./src/i18n/request.ts')` confirmed             |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                         | Status    | Evidence                                                                |
|-------------|-------------|---------------------------------------------------------------------|-----------|-------------------------------------------------------------------------|
| INFRA-01    | 09-01       | Feature branch initialized with Next.js (15 in req text, 16 installed), TypeScript, Tailwind, next-intl | SATISFIED | `feat/nextjs-port` exists; `next@16.1.6`, TypeScript strict, Tailwind v4, next-intl installed; req text says 15 but 16 is a superset — see note below |
| INFRA-02    | 09-01       | Static export configured (`output: 'export'`) and build verified    | SATISFIED | `output: 'export'` in next.config.ts; `bun run build` exits 0; `out/` produced |
| DATA-01     | 09-01       | Core TypeScript types defined (Card, Deck, Progress, Lang, DeckId, Level) | SATISFIED | All six types plus ProgressRecord exported from `src/types/index.ts`    |

**Note on INFRA-01 version discrepancy:** REQUIREMENTS.md says "Next.js 15" but the PLAN explicitly targets Next.js 16 and `next@16.1.6` is what was installed. Next.js 16 is a strict superset — the requirement is satisfied. The REQUIREMENTS.md wording is a documentation artefact from an earlier planning draft; the PLAN and ROADMAP override it.

**Orphaned requirements check:** No requirements mapped to Phase 9 in REQUIREMENTS.md outside of INFRA-01, INFRA-02, DATA-01. No orphaned requirements.

---

### Anti-Patterns Found

| File                           | Line | Pattern                           | Severity | Impact                                                        |
|--------------------------------|------|-----------------------------------|----------|---------------------------------------------------------------|
| `src/app/[lang]/page.tsx`      | 14   | "Deck grid coming in Phase 12."   | Info     | Expected — this file is an intentional stub; Phase 12 replaces it |

No blocker or warning anti-patterns found. The `[lang]/page.tsx` stub is explicitly planned and documented.

---

### Human Verification Required

None. All automated checks passed and the build verified end-to-end via `bun run build`.

---

### Gaps Summary

No gaps. All must-haves are verified. The phase goal is fully achieved:

- `feat/nextjs-port` branch is active with a complete Next.js 16 + TypeScript + Tailwind v4 + next-intl project
- `bun run build` exits 0, producing `out/`, `out/it/index.html`, `out/es/index.html`
- All seven domain types are exported from `src/types/index.ts` with the correct DeckId literals
- next-intl is wired end-to-end: routing config, routing-aware request config, navigation helpers, message files, and locale layout
- No vanilla JS artefacts (`vite.config.js`, `index.html`) remain
- No `middleware.ts` was created (correct for static export)
- Stub directories (`src/data/`, `src/hooks/`, `src/lib/`) exist for downstream phases

---

_Verified: 2026-03-05T09:00:00Z_
_Verifier: Claude (gsd-verifier)_
