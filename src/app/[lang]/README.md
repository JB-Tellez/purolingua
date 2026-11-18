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
    awaits `params: Promise<{ lang }>`, calls `notFound()` unless
    `isLang(lang)`, calls `setRequestLocale(lang)`, then
    `getMessages()`. It is a root layout: renders `<RootDocument lang={lang}>`
    (so the static HTML declares the locale) around
    `<NextIntlClientProvider messages>`, `<SiteHeader lang>`, and `children`.
  - `metadata`: same as `(home)/layout.tsx`.
- `page.tsx`
  - `default LangPage()` (`'use client'`): reads `lang` from `useParams` and
    renders the `page.activityTitle` and `page.activitySubtitle` messages and
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

- Run: `npx vitest run src/__tests__/components/ActivityPicker.test.tsx src/__tests__/app` (`localeValidation`: the layout 404s unknown locales; `htmlLang`: `<html lang>`; `listPageHeadings`: the picker heading).
- Full suite: `npm test`
