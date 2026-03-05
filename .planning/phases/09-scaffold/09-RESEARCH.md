# Phase 9: Scaffold - Research

**Researched:** 2026-03-04
**Domain:** Next.js 16 / TypeScript / Tailwind CSS v4 / next-intl v4 / Static Export
**Confidence:** HIGH (core stack), MEDIUM (next-intl static export pattern)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Next.js project replaces the repo root on `feat/nextjs-port` — clean break, no subdirectory
- Branch from `main` (not orphan) so vanilla JS files are accessible for reference while porting
- Source directory structure:
  - `src/app/` — Next.js App Router pages
  - `src/lib/` — SRS logic, pure functions
  - `src/hooks/` — useSRS, useLevelFilter
  - `src/types/` — domain types
  - `src/data/` — card arrays (Phase 10, stubbed or empty in Phase 9)
- `/` is always a language picker page — no redirect, no locale detection
- `always` prefix strategy: locale routes are `/it/*` and `/es/*`; `/` sits outside localized routes
- next-intl message files at top-level `messages/it.json` and `messages/es.json`
- Middleware handles `/it` and `/es` route groups; `/` is a regular Next.js page
- All domain types in a single `src/types/index.ts` — import as `import type { Card } from '@/types'`
- `strict: true` in tsconfig (Next.js 15 default — portfolio piece, shows TypeScript discipline)
- String literal unions, not enums: `type Lang = 'it' | 'es'`, `type Level = 'A1' | 'A2'`, `type DeckId = 'restaurant' | 'travel' | ...`
- `output: 'export'` static export — no SSR, no API routes

### Claude's Discretion
- Tailwind version (v3 vs v4) — choose whichever integrates cleanly with Next.js 15
- Exact `next.config.ts` shape beyond `output: 'export'`
- tsconfig path alias configuration (`@/` convention expected)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 9 scaffolds the Next.js project that will host the PuroLingua v1.2 port. The stack is Next.js (App Router) + TypeScript + Tailwind CSS v4 + next-intl v4, configured for `output: 'export'` static generation. All routing is purely file-system driven — no server runtime is involved.

**Critical versioning note:** The REQUIREMENTS.md and CONTEXT.md reference "Next.js 15," but as of March 2026, `create-next-app@latest` installs **Next.js 16**. Next.js 16 has relevant breaking changes for this project (middleware renamed to `proxy`, async params, Turbopack by default). The planner must decide: pin to `next@15` explicitly, or adopt Next.js 16 now. Given this is a fresh scaffold on a feature branch, adopting Next.js 16 immediately avoids a future forced upgrade; the most significant impact for this project is the `middleware.ts` → `proxy.ts` rename.

**Static export + next-intl routing constraint:** Next.js static export (`output: 'export'`) does NOT run middleware/proxy at all. The CONTEXT.md decision that "middleware handles `/it` and `/es` route groups" cannot be implemented via `middleware.ts`/`proxy.ts` in a static export. The correct pattern is: `src/app/[lang]/` dynamic segment + `generateStaticParams()` + `setRequestLocale(lang)`. The `/` root page sits outside the `[lang]` directory as `src/app/page.tsx` — this works cleanly without middleware.

**Primary recommendation:** Use `bun create next-app . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-bun --no-eslint` on the `feat/nextjs-port` branch, then install `next-intl` and wire up the static-export-compatible i18n pattern.

---

## Version Pinning Decision

| Library | Version in REQUIREMENTS.md | Actual Latest | Recommendation |
|---------|---------------------------|---------------|----------------|
| Next.js | "15" | 16.1.6 | Use Next.js 16 (fresh project; avoid immediate debt) |
| next-intl | not specified | 4.8.3 | Use 4.x latest |
| Tailwind CSS | not specified | 4.x | Use v4 (v4 is recommended for new Next.js projects) |
| React | (peer of Next.js) | 19.2 (bundled with Next 16) | Accept peer dependency |

**Rationale for Next.js 16:** Since `feat/nextjs-port` is a brand-new scaffold, starting on Next.js 16 is strictly better than starting on 15 and immediately planning a v16 upgrade. The breaking changes that affect this project are minimal: use `proxy.ts` instead of `middleware.ts` (but actually moot since static export doesn't run either), and `params` must be `await`-ed (already required in Next.js 15.x in strict mode).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.1.6 | App framework, routing, static export | Required — project target |
| react | ^19.2.0 | UI rendering (peer of next) | Required — peer dep |
| react-dom | ^19.2.0 | DOM rendering | Required — peer dep |
| typescript | ^5.1.0 | Type safety (Next 16 minimum is 5.1) | Project requirement; strict mode |
| next-intl | ^4.8.3 | i18n messages, locale-scoped API | Prescribed in CONTEXT.md |
| tailwindcss | ^4.x | Utility CSS | Prescribed; v4 is current recommendation for new Next.js projects |
| @tailwindcss/postcss | ^4.x | PostCSS plugin for Tailwind v4 | Required by Tailwind v4 setup |
| postcss | ^8.x | CSS transform pipeline | Required by Tailwind v4 |

### Supporting (Phase 9 setup only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/react | ^19.x | TS types for React | Installed automatically by create-next-app |
| @types/react-dom | ^19.x | TS types for ReactDOM | Installed automatically by create-next-app |
| @types/node | ^20.x | TS types for Node.js | Installed automatically by create-next-app |

### Phase 9 does NOT install (future phases)

| Library | Phase | Purpose |
|---------|-------|---------|
| vitest | Phase 11 | Unit testing (TEST-01) |
| @testing-library/react | Phase 11 | Hook + component testing |
| @testing-library/user-event | Phase 11 | Interaction simulation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3 | v3 uses `tailwind.config.js`; v4 is zero-config but `@tailwindcss/postcss` needed. v4 recommended for new projects. |
| next-intl | next-i18next | next-i18next is Pages Router era; next-intl is the App Router standard |
| Next.js 16 | Next.js 15 | v15 still maintained but v16 is current; see version discussion above |

**Installation (after scaffold):**
```bash
bun add next-intl
bun add -D tailwindcss @tailwindcss/postcss postcss
```

Note: `create-next-app --tailwind` already installs Tailwind. Manual install only if skipped during scaffold.

---

## Architecture Patterns

### Recommended Project Structure

```
/ (repo root, feat/nextjs-port branch)
├── messages/
│   ├── it.json              # next-intl Italian UI strings
│   └── es.json              # next-intl Spanish UI strings
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout (no locale — wraps / only)
│   │   ├── page.tsx         # Language picker (the "/" page, not localized)
│   │   ├── globals.css      # Tailwind @import
│   │   └── [lang]/          # Localized route segment (Phase 12+)
│   │       ├── layout.tsx   # Locale layout with NextIntlClientProvider
│   │       └── page.tsx     # Deck grid (Phase 12)
│   ├── data/                # Stub: empty dir (card arrays added Phase 10)
│   ├── hooks/               # Stub: empty dir (useSRS, useLevelFilter added Phase 11)
│   ├── lib/                 # Stub: empty dir (srs.ts, generateChoices.ts added Phase 11)
│   ├── types/
│   │   └── index.ts         # ALL domain types: Card, Deck, Progress, Lang, DeckId, Level
│   └── i18n/
│       ├── routing.ts       # defineRouting({ locales: ['it', 'es'], defaultLocale: 'it' })
│       ├── request.ts       # getRequestConfig — loads messages/[locale].json
│       └── navigation.ts    # createNavigation(routing) — Link, useRouter, etc.
├── next.config.ts           # output: 'export', withNextIntl plugin
├── postcss.config.mjs       # Tailwind v4 PostCSS plugin
├── tsconfig.json            # strict: true, paths: { "@/*": ["./src/*"] }
└── package.json
```

### Pattern 1: Static Export with next-intl (No Middleware)

**What:** Because `output: 'export'` disables middleware/proxy entirely, locale routing must be achieved via file-system dynamic segments. The `[lang]` segment replaces what middleware would have done.

**Key constraint:** `middleware.ts` / `proxy.ts` does NOT run in static export mode. This is a hard Next.js limitation. The CONTEXT.md mention of "middleware handles `/it` and `/es`" is architecturally correct in intent (always-prefix routing) but the mechanism is `[lang]` dynamic segment, not a middleware file.

**When to use:** Always — this is the only valid approach for static export + i18n.

**The three required steps for static rendering:**
```typescript
// Source: next-intl.dev/docs/getting-started/app-router/with-i18n-routing
// Step 1: generateStaticParams in every [lang] layout/page
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }));
}

// Step 2: setRequestLocale BEFORE any next-intl hooks
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params; // Next 16: params is a Promise
  setRequestLocale(lang);
  // ...
}

// Step 3: In i18n/request.ts, load messages from the locale param
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

### Pattern 2: Root Page Sits Outside `[lang]`

**What:** `src/app/page.tsx` is a plain Next.js page (no locale). It renders the language picker. This page does NOT use next-intl translation hooks — it is the pre-i18n entry point.

**When to use:** This is the architectural pattern decided in CONTEXT.md.

```typescript
// src/app/page.tsx — no next-intl here
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <Link href="/it">Italiano</Link>
      <Link href="/es">Español</Link>
    </main>
  );
}
```

### Pattern 3: next-intl Plugin in next.config.ts

```typescript
// Source: next-intl.dev docs
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  output: 'export',
};

export default withNextIntl(nextConfig);
```

### Pattern 4: Domain Types — String Literal Unions

```typescript
// Source: CONTEXT.md decision
// src/types/index.ts
export type Lang = 'it' | 'es';
export type Level = 'A1' | 'A2';
export type DeckId =
  | 'restaurant'
  | 'travel'
  | 'shopping'
  | 'greetings'
  | 'numbers'
  | 'colors'
  | 'family'
  | 'weather';

export interface Card {
  front: string;
  back: string;
  level: Level;
}

export interface Deck {
  id: DeckId;
  lang: Lang;
  cards: Card[];
}

export interface Progress {
  box: number;
  nextReview: number; // timestamp
}

// Progress record keyed by "{deckId}_{cardIndex}" — preserved from v1.1
export type ProgressRecord = Record<string, Progress>;
```

**Note on DeckId:** The exact deck IDs must be verified against `src/locales/it/decks.js` in the existing codebase during implementation. Phase 9 only needs the type shape — the literal values can be a stub.

### Pattern 5: Tailwind v4 Setup

```css
/* src/app/globals.css */
@import "tailwindcss";
```

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

No `tailwind.config.js` needed for v4 — auto-scans project files.

### Anti-Patterns to Avoid

- **Using `middleware.ts` for locale routing with static export:** Middleware does not run in `output: 'export'` builds. The build will silently ignore it or fail. Use `[lang]` segment + `generateStaticParams` instead.
- **Synchronous `params` access in Next.js 16:** `params` is now `Promise<{lang: string}>`. Always `await params` before destructuring.
- **Calling `useTranslations` before `setRequestLocale`:** next-intl requires `setRequestLocale` to be called first in every page/layout for static rendering to work.
- **Enum types instead of string literal unions:** Decision is locked — use `type Level = 'A1' | 'A2'` not `enum Level`.
- **Putting CEFR codes (A1/A2) in next-intl message files:** These are language-neutral; keep them as literal values only.
- **Installing React Testing Library in Phase 9:** Tests are a Phase 11 concern; Phase 9 just scaffolds the project structure.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale-scoped translation | Custom context/hook | `next-intl` `useTranslations()` | Type-safe, SSR/static aware, namespace support |
| i18n message loading | Custom JSON import logic | `getRequestConfig` in `src/i18n/request.ts` | next-intl handles request scoping and caching |
| Locale-aware navigation | Custom `<a href>` with prefix | `createNavigation(routing)` → `Link` | Type-safe locale prefixing |
| Path aliasing | Relative `../../` imports | `@/` tsconfig paths + `--import-alias "@/*"` | Already configured by create-next-app |
| CSS utility classes | Custom CSS modules | Tailwind v4 utility classes | Reduces CSS surface, matches v1.1 intent |

**Key insight:** next-intl's `setRequestLocale` / `getRequestConfig` / `createNavigation` trio is the correct static-export pattern. Anything that fights this pattern (especially middleware-based routing) will break the static build.

---

## Common Pitfalls

### Pitfall 1: `middleware.ts` Does Not Run in Static Export

**What goes wrong:** Developer creates `middleware.ts` (or `proxy.ts` in Next.js 16) for locale routing, it works in `next dev`, but `next build` + `output: 'export'` silently ignores it. The built `out/` folder has no locale routing — all `/it/*` URLs get 404 at deploy.

**Why it happens:** Static export generates plain HTML files. There is no Node.js server to run middleware.

**How to avoid:** Do not create a middleware/proxy file. Use `src/app/[lang]/` dynamic segment with `generateStaticParams` returning `['it', 'es']`.

**Warning signs:** If you find yourself writing `export const config = { matcher: ['/(it|es)/(.*)'] }` — stop, this won't work.

### Pitfall 2: Forgetting `setRequestLocale` in Static Pages

**What goes wrong:** `useTranslations()` throws `DYNAMIC_SERVER_USAGE` error during `next build` because next-intl tries to read from request headers (which don't exist during static generation).

**Why it happens:** next-intl defaults to dynamic rendering. `setRequestLocale` switches it to static mode by caching the locale value.

**How to avoid:** Call `setRequestLocale(lang)` at the top of every `[lang]` layout and page before any next-intl hooks.

### Pitfall 3: Async `params` in Next.js 16

**What goes wrong:** Code written as `const { lang } = params` instead of `const { lang } = await params` causes a TypeScript error and runtime breakage.

**Why it happens:** Next.js 16 made `params` fully async (removed backward compatibility shim from v15).

**How to avoid:** Always `await params` in async components. Use `Promise<{lang: string}>` as the type.

### Pitfall 4: `create-next-app` Overwrites Existing Files

**What goes wrong:** Running `bun create next-app .` in the repo root (which already has `package.json`, `src/`, etc.) may prompt to overwrite or merge files unexpectedly.

**Why it happens:** The tool is designed for fresh directories. Running it in an existing repo requires care.

**How to avoid:** On the `feat/nextjs-port` branch, first clear root-level files that will conflict (`package.json`, `vite.config.js`, `index.html`, `src/`), then run create-next-app. Or scaffold to a temp directory and move files manually. The `--disable-git` flag prevents re-initializing git.

### Pitfall 5: `messages/` Location

**What goes wrong:** next-intl message files placed at `src/messages/` instead of root-level `messages/` cause import resolution errors in `getRequestConfig`.

**Why it happens:** The `import(`../../messages/${locale}.json`)` path in `src/i18n/request.ts` expects root-level `messages/`.

**How to avoid:** Lock the location to root-level `messages/it.json` and `messages/es.json` as decided in CONTEXT.md.

### Pitfall 6: Tailwind v4 PostCSS Config Extension

**What goes wrong:** Using `postcss.config.js` (CommonJS) instead of `postcss.config.mjs` (ES Module) with Tailwind v4 causes plugin resolution errors.

**Why it happens:** Tailwind v4's `@tailwindcss/postcss` expects ES module config format with Next.js 16's module system.

**How to avoid:** Use `.mjs` extension for the PostCSS config file.

---

## Code Examples

### Scaffold Command

```bash
# Source: nextjs.org/docs/app/api-reference/cli/create-next-app (verified 2026-02-27)
# Run on feat/nextjs-port branch in repo root (after clearing conflicting files)
bun create next-app . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-bun \
  --no-eslint \
  --disable-git
```

Note: `--no-eslint` skips ESLint config (not in project requirements). `--disable-git` prevents re-init since repo already exists.

### i18n Routing Config

```typescript
// Source: next-intl.dev/docs/getting-started/app-router/with-i18n-routing
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['it', 'es'] as const,
  defaultLocale: 'it',
});
```

### Request Config

```typescript
// Source: next-intl.dev docs
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

### Navigation Helpers

```typescript
// Source: next-intl.dev docs
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### next.config.ts

```typescript
// Source: next-intl.dev docs + nextjs.org/docs/app/guides/static-exports
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'export',
};

export default withNextIntl(nextConfig);
```

### Domain Types (Phase 9 stub — exact DeckId values confirmed in Phase 10)

```typescript
// src/types/index.ts
export type Lang = 'it' | 'es';
export type Level = 'A1' | 'A2';

// Verify exact IDs against src/locales/it/decks.js before Phase 10
export type DeckId =
  | 'restaurant'
  | 'travel'
  | 'shopping'
  | 'greetings'
  | 'numbers'
  | 'colors'
  | 'family'
  | 'weather';

export interface Card {
  front: string;      // target language word/phrase
  back: string;       // translation/answer
  level: Level;       // CEFR level
}

export interface Deck {
  id: DeckId;
  lang: Lang;
  cards: Card[];
}

// Progress stored in localStorage keyed by "{deckId}_{cardIndex}"
// This key format MUST match v1.1 exactly — see src/js/features/progress.js
export interface Progress {
  box: number;
  nextReview: number; // Unix timestamp (ms)
}

export type ProgressRecord = Record<string, Progress>;
```

### tsconfig.json Path Aliases

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

create-next-app configures this automatically with `--import-alias "@/*"`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 | Rename only — moot for static export |
| Tailwind `tailwind.config.js` | CSS `@import "tailwindcss"` | Tailwind v4 (2024) | No config file needed; auto-scan |
| Tailwind `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 | Single import replaces three directives |
| next-intl `unstable_setRequestLocale` | `setRequestLocale` | next-intl v4 | Stable API, no `unstable_` prefix |
| Synchronous `params` | `await params` | Next.js 15.x / enforced Next.js 16 | All page/layout props must await params |
| `output: 'export'` + middleware | `[lang]` segment + `generateStaticParams` | Always true — but commonly misunderstood | Middleware never ran in static export |

**Deprecated/outdated patterns to avoid:**
- `unstable_setRequestLocale`: Use `setRequestLocale` (next-intl v4 stable)
- `tailwind.config.js`: Not needed for v4 basic setup
- `experimental.turbopack` in next.config.ts: Moved to top-level `turbopack` in Next.js 16

---

## Open Questions

1. **Next.js 15 vs 16 decision**
   - What we know: Requirements say "Next.js 15"; latest is 16.1.6; breaking changes are minimal for this project
   - What's unclear: Whether user has a preference to explicitly pin to 15
   - Recommendation: Planner should default to Next.js 16 (no pin) since it's a fresh project, but can add `bun add next@15` as a variant task if user wants 15 pinned

2. **Exact `DeckId` literal values**
   - What we know: There are 8 decks in Italian and Spanish; exact IDs are in `src/locales/it/decks.js`
   - What's unclear: Whether deck IDs in `src/js/` are the exact strings to use as TypeScript literals
   - Recommendation: Phase 9 types stub with best-guess IDs; Phase 10 confirms and corrects

3. **Scaffolding strategy for repo root replacement**
   - What we know: create-next-app can scaffold to existing directories but may conflict
   - What's unclear: Whether to (a) scaffold to temp dir + merge, or (b) delete conflicting files first + run in-place
   - Recommendation: Delete root-level files that will conflict (`index.html`, `vite.config.js`, `package.json`, `src/`, `vitest.config.js`) before running create-next-app in-place. Keep `tests/`, `.planning/`, `.claude/`, `data/`, `docs/`, `node_modules/` untouched.

---

## Validation Architecture

Config `workflow.nyquist_validation` is not set — treating as enabled.

### Test Framework

Phase 9 does not install test infrastructure (that is Phase 11). However, the existing `tests/` directory on `main` has Vitest tests that must not be broken by the scaffold.

| Property | Value |
|----------|-------|
| Framework | None in Phase 9 (Vitest + React Testing Library added in Phase 11) |
| Config file | None — see Phase 11 |
| Quick run command | N/A for Phase 9 |
| Full suite command | N/A for Phase 9 |

### Phase 9 Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Next.js 16 project initializes and `bun run dev` starts | smoke (manual) | `bun run build` exits 0 | Wave 0 |
| INFRA-02 | `output: 'export'` produces `out/` folder | build verification | `bun run build && test -d out` | Wave 0 |
| DATA-01 | Core TypeScript types compile without error | type check | `bun run build` (tsc included) | Wave 0 |

### Sampling Rate

- **Per task commit:** `bun run build` (verifies types + static export compiles)
- **Per wave merge:** `bun run build && test -d out` (confirms export output exists)
- **Phase gate:** Build green + `out/` directory present before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `bun run build` script must be runnable — requires `package.json` from scaffold
- [ ] `next.config.ts` with `output: 'export'` must be present before build test
- [ ] `src/types/index.ts` must satisfy TypeScript strict mode — verified by build

---

## Sources

### Primary (HIGH confidence)
- [nextjs.org/docs/app/api-reference/cli/create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app) — scaffold command flags (verified 2026-02-27, version 16.1.6)
- [nextjs.org/docs/app/guides/static-exports](https://nextjs.org/docs/app/guides/static-exports) — static export features and unsupported list (verified 2026-02-27)
- [nextjs.org/docs/app/guides/upgrading/version-16](https://nextjs.org/docs/app/guides/upgrading/version-16) — Next.js 16 breaking changes (verified 2026-02-27)
- [tailwindcss.com/docs/guides/nextjs](https://tailwindcss.com/docs/guides/nextjs) — Tailwind v4 + Next.js installation
- [next-intl.dev/docs/getting-started/app-router/with-i18n-routing](https://next-intl.dev/docs/getting-started/app-router) — next-intl v4 App Router setup

### Secondary (MEDIUM confidence)
- [next-intl.dev/docs/routing/middleware](https://next-intl.dev/docs/routing/middleware) — confirmed middleware does not run in static export
- [github.com/azu/next-intl-example](https://github.com/azu/next-intl-example) — static export + next-intl reference project

### Tertiary (LOW confidence)
- WebSearch results on next-intl 4.8.3 version (npm listing, not directly fetched)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official Next.js 16 docs and Tailwind v4 docs
- Architecture: HIGH — static export + `[lang]` segment pattern verified against Next.js static export unsupported features list
- next-intl routing constraint: HIGH — "middleware does not run in static export" is documented in Next.js official unsupported features list
- Pitfalls: HIGH — all pitfalls derive from confirmed official documentation
- DeckId literals: LOW — best-guess from project context; must be confirmed in Phase 10

**Research date:** 2026-03-04
**Valid until:** 2026-06-01 (Next.js and next-intl move fast; re-verify if planning takes longer than 90 days)
