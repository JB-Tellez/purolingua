# i18n

## Overview
This directory holds the [next-intl](https://next-intl.dev) configuration. It defines the supported locales, and the per-request locale and message loading.

`next.config.ts` registers `request.ts` with `createNextIntlPlugin('./src/i18n/request.ts')`. Several files under `src/app/[lang]/` import `routing` from `@/i18n/routing`.

## Interface
- `routing.ts`
  - `routing`: the result of `defineRouting({ locales: ['it', 'es'] as const, defaultLocale: 'it' })`. The single source of the supported locales.
  - `isLang(value: string): value is Lang`: `hasLocale(routing.locales, value)`. Used by the `[lang]` layout and the deck and scenario pages to 404 unknown locales.
- `request.ts`
  - The default export is `getRequestConfig(async ({ requestLocale }) => ({ locale, messages }))`. next-intl uses it to resolve the locale and messages for each request.

## Invariants
- The supported locales are exactly `'it'` and `'es'`, and the default is `'it'`. `Lang` in [`src/types`](../types/README.md) is derived from them; they must also match the files `messages/it.json` and `messages/es.json`.
- `request.ts` checks the requested locale with `hasLocale(routing.locales, requested)`. Any unsupported or missing locale falls back to `routing.defaultLocale`. It calls `hasLocale` directly, not `isLang`, because `requestLocale` can be `undefined` and `isLang` takes a `string`.
- Every locale in `routing.locales` needs a matching `messages/<locale>.json` file at the repository root. `request.ts` loads it with a dynamic `import(\`../../messages/${locale}.json\`)`.
- Per-language tables elsewhere (`LANGUAGES`, `LANG_META`, `DECK_MAP`, `LANG_LOCALE`) are typed `Record<Lang, …>`, so adding a locale here makes `tsc` list each one to fill in. Not checked by `tsc`: Q&A text is chosen with `lang === 'it' ? … : …Es` (`ScenarioGrid.tsx`, `QAStudySession.tsx`), so a new locale silently shows the Spanish fields, and `messages/<locale>.json` must exist. See "Adding a New Language" in the [root README](../../README.md).

## Side Effects
- `request.ts` dynamically imports a locale message JSON file each time it resolves request config. That file is loaded through the module system.
- `routing.ts` only creates a configuration object when imported. It has no other side effects.

## Verification
- Run: `npx vitest run src/__tests__/i18n` (`isLang`). Route-level locale validation is covered by `src/__tests__/app/localeValidation.test.tsx`.
- Type-check: `npx tsc --noEmit`. It reports no errors.
- Full suite: `npx vitest run` (or `npm test`, which runs `vitest` in watch mode in an interactive terminal).
