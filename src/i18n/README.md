# i18n

## Overview
This directory holds the [next-intl](https://next-intl.dev) configuration. It defines the supported locales, and the per-request locale and message loading.

`next.config.ts` registers `request.ts` with `createNextIntlPlugin('./src/i18n/request.ts')`. Several files under `src/app/[lang]/` import `routing` from `@/i18n/routing`.

## Interface
- `routing.ts`
  - `routing`: the result of `defineRouting({ locales: ['it', 'es'] as const, defaultLocale: 'it' })`.
- `request.ts`
  - The default export is `getRequestConfig(async ({ requestLocale }) => ({ locale, messages }))`. next-intl uses it to resolve the locale and messages for each request.

## Invariants
- The supported locales are exactly `'it'` and `'es'`, and the default is `'it'`. These match the `Lang` type in [`src/types`](../types/README.md) and the files `messages/it.json` and `messages/es.json`.
- `request.ts` checks the requested locale with `hasLocale(routing.locales, requested)`. Any unsupported or missing locale falls back to `routing.defaultLocale`.
- Every locale in `routing.locales` needs a matching `messages/<locale>.json` file at the repository root. `request.ts` loads it with a dynamic `import(\`../../messages/${locale}.json\`)`.
- `routing.ts` is the next-intl source of truth, but the locale set is also hard-coded elsewhere (`Lang` in `src/types`, `LANGUAGES` in `src/app/page.tsx`, the `['it', 'es']` check in `src/app/[lang]/qa/[scenario]/page.tsx`, `SiteHeader`, and `LANG_LOCALE` in `src/lib/locale.ts`). See "Adding a New Language" in the [root README](../../README.md).

## Side Effects
- `request.ts` dynamically imports a locale message JSON file each time it resolves request config. That file is loaded through the module system.
- `routing.ts` only creates a configuration object when imported. It has no other side effects.

## Verification
- There are no unit tests for this directory.
- Type-check: `npx tsc --noEmit`. It reports no errors.
- Full suite: `npx vitest run` (or `npm test`, which runs `vitest` in watch mode in an interactive terminal).
