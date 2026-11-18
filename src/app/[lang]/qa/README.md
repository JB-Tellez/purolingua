# QA Scenario Browser (`/[lang]/qa`)

## Overview

Lists the Q&A conversation scenarios for a language, with a CEFR level filter.
The layout generates the static params for the nested `[scenario]` route.

## Interface

- `layout.tsx`
  - `generateStaticParams()`: returns `{ lang, scenario }` for every pair in
    `routing.locales` x `scenarios[].id` (`@/data/qa`).
  - `default QALayout({ children })`: renders `children` with no wrapper.
- `page.tsx`
  - `default QABrowserPage()` (`'use client'`): reads `lang` from
    `useParams`, gets `hasProgress` from `useSRS(lang)`, and gets
    `{ activeLevels, setActiveLevels }` from `useLevelFilter(lang, hasProgress, 'qa')`.
    Renders the `page.scenarioTitle` and `page.scenarioSubtitle` messages,
    `<LevelFilterChips>`, and `<ScenarioGrid lang activeLevels>`.
- Subdirectories
  - `[scenario]`: [./[scenario]/README.md](./[scenario]/README.md). Per-scenario
    multiple-choice study session.

## Invariants

- This layout's `generateStaticParams` and the one in
  `./[scenario]/page.tsx` produce the same `{ lang, scenario }` set. Update
  both together.
- `page.tsx` is a client component, so it cannot export
  `generateStaticParams`. The params live in `layout.tsx`.

## Side Effects

- Indirect only. `useSRS` and `useLevelFilter` read and write `localStorage`
  (the Q&A level-filter key is `{lang}-qa-level-filter`).

## Verification

- Run: `npx vitest run src/__tests__/components/ScenarioGrid.test.tsx src/__tests__/hooks/useLevelFilter.test.tsx`
- Full suite: `npm test`
