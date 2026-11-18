# Rephrase Deck Browser (`/[lang]/rephrase`)

## Overview

Lists the rephrase flashcard decks for a language, with a CEFR level filter
and a count of due cards on each deck. The layout generates the static params
for the nested `[deck]` route.

## Interface

- `layout.tsx`
  - `generateStaticParams()`: returns `{ lang, deck }` for every pair in
    `routing.locales` x `DECK_IDS` (`@/data/decks`).
  - `default RephraseLayout({ children })`: renders `children` with no wrapper.
- `page.tsx`
  - `default LangPage()` (`'use client'`): reads `lang` from `useParams`, gets
    `hasProgress` from `useSRS(lang)`, and gets `{ activeLevels, setActiveLevels }`
    from `useLevelFilter`. Renders the page title, `<LevelFilterChips>`, and
    `<DeckGrid lang activeLevels>` from
    [`@/components`](../../../components/README.md), which links each deck to
    `/${lang}/rephrase/${deck.id}` with a due-count badge.
- Subdirectories
  - `[deck]`: [./[deck]/README.md](./[deck]/README.md). Per-deck flashcard
    study session.

## Invariants

- `LevelFilterChips` and `DeckGrid` receive the same `activeLevels` from this
  page's single `useLevelFilter` call, so the badges follow the chips.
- This layout's `generateStaticParams` and the one in `./[deck]/page.tsx`
  produce the same `{ lang, deck }` set. Update both together.

## Side Effects

- Indirect only. `useSRS` and `useLevelFilter` read and write `localStorage`.

## Verification

- Run: `npx vitest run src/__tests__/hooks/useSRS.test.tsx src/__tests__/hooks/useLevelFilter.test.tsx`
- Full suite: `npm test`
