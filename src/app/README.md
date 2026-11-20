# App Router Root (`src/app`)

## Overview

Root of the Next.js App Router for PuroLingua, a language-learning flashcard
app. `next.config` sets `output: 'export'`, so every dynamic segment must
provide `generateStaticParams`.

There is no `app/layout.tsx`. The app has two root layouts so that each page's
`<html lang>` is correct in the static HTML: `(home)/layout.tsx` for the
language picker (`en`) and `[lang]/layout.tsx` for everything under `/it` and
`/es` (the locale). Both render the shared `RootDocument` shell. All learning
content is under the `[lang]` segment.

## Interface

- `RootDocument.tsx`
  - `default RootDocument({ lang, children })`: renders `<html lang={lang}>`,
    Google Fonts links (Inter and Crimson Text), `children`, and a `<footer>`
    that shows `v${pkg.version}` from `package.json`. Imports `globals.css`.
- `(home)/layout.tsx` (route group, no URL segment)
  - `metadata: Metadata`: `{ title: 'PuroLingua', description: 'Language learning flashcards' }`.
  - `default HomeLayout({ children })`: `<RootDocument lang="en">`.
- `(home)/page.tsx` (`/`)
  - `default HomePage()`: renders one card per locale in `routing.locales`,
    using the module-private `LANGUAGES: Record<Lang, …>` table (`it` Italiano,
    `es` Español) for its flag, name, description, and theme. Each card links
    to `/${code}` and carries `lang={code}`; the Italian and Spanish subtitle
    parts carry `lang="it"` / `lang="es"`.
- `titleTemplate.ts`
  - `TITLE_TEMPLATE`: `'%s · PuroLingua'`, the page-title template set by
    `[lang]/layout.tsx` and passed on by `rephrase/layout.tsx` and `qa/layout.tsx`.
- `global-not-found.tsx`
  - `metadata`: `{ title: 'Page not found · PuroLingua' }`.
  - `default GlobalNotFound()`: a full `<RootDocument lang="en">` 404 page with
    a link home. Needed because no `app/layout.tsx` wraps a 404; enabled by
    `experimental.globalNotFound` in `next.config.ts`.
- `globals.css`: imports `tailwindcss` and `../style-reference.css`.
- `favicon.ico`: the site icon; Next serves it as a metadata file (`out/favicon.ico`).
- Subdirectories
  - `[lang]`: [./[lang]/README.md](./[lang]/README.md). Locale validation,
    the next-intl provider, the site header, the activity picker, and the `qa`
    and `rephrase` activities.

## Invariants

- `LANGUAGES` is typed `Record<Lang, …>`, so `tsc` fails if a locale in
  `routing.locales` has no entry.
- `<html lang>` is `en` on `/` and the 404 page, and the route locale on every
  `[lang]` page. Do not add an `app/layout.tsx`: it would become the single
  root layout and nest a second `<html>`.
- Every page has its own title, `<page> · PuroLingua`, in the page's language:
  `PuroLingua` on `/`, `Page not found · PuroLingua` on the 404, and under
  `[lang]` the activity, list, deck, or scenario name (see the `[lang]`
  contracts). Only `(home)/layout.tsx` keeps the English description; `[lang]`
  pages use `meta.description` from their messages.
- A layout that sets a title must give it as `{ default, template: TITLE_TEMPLATE }`:
  a plain title string in a layout resets the template for the pages below it,
  so they would lose the `· PuroLingua` suffix. Only the static build shows this
  (`out/*/index.html`); `src/__tests__/app/pageTitles.test.ts` checks that each
  layout passes the template on.
- Navigating between the two root layouts (`/` ↔ `/it`, or from the 404 page to `/`) is a full page load, not a client transition: Next.js cannot swap root layouts in place. Links within `[lang]` (including the language switcher, `/it` → `/es`) stay client-side.

## Side Effects

- The browser loads fonts from `fonts.googleapis.com` and `fonts.gstatic.com`
  (preconnect and stylesheet links).
- `package.json` is imported at build time to show the version.

## Verification

- Run: `npm test`. `src/__tests__/app/htmlLang.test.tsx` renders both root
  layouts and the 404 page to static HTML and checks `<html lang>`.
- `src/__tests__/app/pageTitles.test.ts` checks every route's title and
  description against the real messages.
- `npx next build`, then check `out/index.html`, `out/it/index.html`, and
  `out/404.html` (`<html lang>`), and the `<title>` of a session page such as
  `out/it/rephrase/restaurant/index.html` ("Ristorante · PuroLingua").
