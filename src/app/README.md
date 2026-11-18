# App Router Root (`src/app`)

## Overview

Root of the Next.js App Router for PuroLingua, a language-learning flashcard
app. `next.config` sets `output: 'export'`, so every dynamic segment must
provide `generateStaticParams`. The root layout sets up the HTML shell, fonts,
and a version footer. The root page links to each supported language. All
learning content is under the `[lang]` segment.

## Interface

- `layout.tsx`
  - `metadata: Metadata`: `{ title: 'PuroLingua', description: 'Language learning flashcards' }`.
  - `default RootLayout({ children })`: renders `<html lang="en">`, Google
    Fonts links (Inter and Crimson Text), `children`, and a
    `<footer>` that shows `v${pkg.version}` from `package.json`.
- `page.tsx`
  - `default HomePage()`: renders one card per locale in `routing.locales`,
    using the module-private `LANGUAGES: Record<Lang, …>` table (`it` Italiano,
    `es` Español) for its flag, name, description, and theme. Each card links
    to `/${code}`.
- `globals.css`: imports `tailwindcss` and `../style-reference.css`.
- Subdirectories
  - `[lang]`: [./[lang]/README.md](./[lang]/README.md). Locale validation,
    the next-intl provider, the site header, the activity picker, and the `qa`
    and `rephrase` activities.

## Invariants

- `LANGUAGES` is typed `Record<Lang, …>`, so `tsc` fails if a locale in
  `routing.locales` has no entry.
- The root layout hardcodes `<html lang="en">`. It does not change with the
  active locale.

## Side Effects

- The browser loads fonts from `fonts.googleapis.com` and `fonts.gstatic.com`
  (preconnect and stylesheet links).
- `package.json` is imported at build time to show the version.

## Verification

- Run: `npm test`
