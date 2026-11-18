# Locale Segment (`/[lang]`)

## Overview

Dynamic locale segment for the Next.js App Router. The layout validates the
locale, sets up next-intl for the request, and wraps every localized page in
`NextIntlClientProvider` and `SiteHeader`. The index page shows the activity
picker. The two activities are under `qa/` and `rephrase/`.

## Interface

- `layout.tsx`
  - `generateStaticParams()`: returns `routing.locales.map(locale => ({ lang: locale }))`
    (`it`, `es`).
  - `default LocaleLayout({ children, params })` (async server component):
    awaits `params: Promise<{ lang }>`, calls `notFound()` when lang is not in
    `routing.locales`, calls `setRequestLocale(lang)`, then
    `getMessages()`. Renders `<NextIntlClientProvider messages>`,
    `<SiteHeader lang>`, and `children`.
- `page.tsx`
  - `default LangPage()` (`'use client'`): reads `lang` from `useParams` and
    renders the `page.title` and `page.subtitle` messages and
    `<ActivityPicker lang>`.
- Subdirectories
  - `qa`: [./qa/README.md](./qa/README.md). Scenario browser and the
    `[scenario]` Q&A study session.
  - `rephrase`: [./rephrase/README.md](./rephrase/README.md). Deck browser and
    the `[deck]` flashcard study session.

## Invariants

- `setRequestLocale(lang)` must run before any next-intl hook, as the comment
  in `layout.tsx` notes.
- Client page files (`'use client'`) cannot export `generateStaticParams`.
  Static params for this segment and its children are declared in the
  `layout.tsx` files or in the server `page.tsx` files.
- `params` is a `Promise` (Next.js 16) and must be awaited.

## Side Effects

- Loads next-intl messages for the request (`getMessages`). Nothing else
  happens directly here. The child routes use `localStorage` and the Web
  Speech API through hooks.

## Verification

- Run: `npx vitest run src/__tests__/components/ActivityPicker.test.tsx`
- Full suite: `npm test`
