# QA Scenario Browser (`/[lang]/qa`)

## Overview

Lists the Q&A conversation scenarios for a language, with a CEFR level filter.
The layout generates the static params for the nested `[scenario]` route.

## Interface

- `layout.tsx`
  - `generateStaticParams()`: returns `{ lang, scenario }` for every pair in
    `routing.locales` x `scenarios[].id` (`@/data/qa`).
  - `generateMetadata({ params })`: `title: { default: page.scenarioTitle, template: TITLE_TEMPLATE }`
    (e.g. "Elige un Escenario · PuroLingua"); the page is a client component, so its title is declared
    here, and the template is passed on so the session pages below keep the suffix.
  - `default QALayout({ children })`: renders `children` with no wrapper.
- `page.tsx`
  - `default QABrowserPage()` (`'use client'`): reads `lang` from
    `useParams`, gets `hasProgress` from `useSRS(lang)`, and gets
    `{ activeLevels, setActiveLevels }` from `useLevelFilter(lang, hasProgress, 'qa')`.
    Renders the `page.scenarioTitle` and `page.scenarioSubtitle` messages,
    then `<LevelFilterChips>` and `<ScenarioGrid lang activeLevels>` inside
    `<ClientOnly>`.
- Subdirectories
  - `[scenario]`: [./[scenario]/README.md](./[scenario]/README.md). Per-scenario
    multiple-choice study session.

## Invariants

- This layout's `generateStaticParams` and the one in
  `./[scenario]/page.tsx` produce the same `{ lang, scenario }` set. Update
  both together.
- The chips and badges come from `localStorage`, which the prerendered HTML
  cannot know, so they render only after hydration (`ClientOnly`). The static
  HTML holds the heading; rendering them during hydration made React report a
  hydration mismatch for returning visitors
  (`src/__tests__/app/listPageHydration.test.tsx`).
- `page.tsx` is a client component, so it cannot export
  `generateStaticParams`. The params live in `layout.tsx`.

## Side Effects

- Indirect only. `useSRS` and `useLevelFilter` read and write `localStorage`
  (the Q&A level-filter key is `{lang}-qa-level-filter`).

## Verification

- Run: `npx vitest run src/__tests__/components/ScenarioGrid.test.tsx src/__tests__/hooks/useLevelFilter.test.tsx src/__tests__/app/levelFilterPerActivity.test.tsx src/__tests__/app/listPageHeadings.test.tsx src/__tests__/app/listPageHydration.test.tsx`
- Full suite: `npm test`
