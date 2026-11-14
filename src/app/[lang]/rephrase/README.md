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
    `{ isCardDueForDeck, hasProgress }` from `useSRS(lang)`, and gets
    `{ activeLevels, setActiveLevels }` from `useLevelFilter`. Renders the page
    title, `<LevelFilterChips>`, and the local `DeckGrid`.
  - Module-private `DeckGrid({ lang, activeLevels, isCardDueForDeck })`: for
    each entry in `deckMetadata` whose `lang` matches, links to
    `/${lang}/rephrase/${deck.id}`. Each card shows a badge with the number of
    due cards, or a check mark when none are due. Messages come from the
    `decks` and `deckDescriptions` namespaces.
- Subdirectories
  - `[deck]`: [./[deck]/README.md](./[deck]/README.md). Per-deck flashcard
    study session.

## Invariants

- The due count only counts cards whose `level` is in `activeLevels` and for
  which `isCardDueForDeck(deckId, index)` is true. Cards come from
  `DECK_MAP[lang]?.[deck.id] ?? []`.
- This layout's `generateStaticParams` and the one in `./[deck]/page.tsx`
  produce the same `{ lang, deck }` set. Update both together.
- `page.tsx` defines its own `DeckGrid`, which is separate from
  `@/components/DeckGrid`. Tests in `src/__tests__/components/DeckGrid.test.tsx`
  target the component under `@/components`, not this local one.

## Side Effects

- Indirect only. `useSRS` and `useLevelFilter` read and write `localStorage`.

## Verification

- Run: `npx vitest run src/__tests__/hooks/useSRS.test.tsx src/__tests__/hooks/useLevelFilter.test.tsx`
- Full suite: `npm test`
