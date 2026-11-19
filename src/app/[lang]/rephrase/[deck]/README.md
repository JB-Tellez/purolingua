# Rephrase Deck Study Route (`/[lang]/rephrase/[deck]`)

## Overview

Next.js App Router dynamic route that runs a flashcard rephrase session for one
deck. The server component `page.tsx` validates the params, looks up the deck's
cards in `DECK_MAP`, and renders a client-only wrapper. That wrapper loads
`StudySession` with SSR disabled. The session shows the front of a card. The
user flips it and picks the matching rephrase from multiple choices, either by
tapping or by voice.

## Interface

- `page.tsx`
  - `generateStaticParams()`: returns every `{ lang, deck }` pair from
    `routing.locales` x `DECK_IDS`, used for static export.
  - `default DeckPage({ params })` (async server component): awaits
    `params: Promise<{ lang; deck }>`, calls `notFound()` unless
    `isLang(lang)` and deck is in `DECK_IDS`, calls
    `setRequestLocale(lang)`, and then renders
    `<StudySession lang deckId cards />` (imported from `./StudySessionNoSSR`).
  - Module-private: `getCards(lang, deckId)` returns
    `DECK_MAP[lang]?.[deckId] ?? []`.
- `StudySessionNoSSR.tsx`
  - `default StudySessionNoSSR(props: { lang: Lang; deckId: DeckId; cards: Card[] })`:
    `'use client'` wrapper around `next/dynamic(() => import('./StudySession'), { ssr: false })`.
- `StudySession.tsx`
  - `default StudySession({ lang, deckId, cards })` (`'use client'`): renders
    the session UI. It has three screens: all-done (`allDone`), deck complete
    (`deckComplete`), and the active flip card with choices, mic, and
    flip/next controls.
  - Speaks choices with `speak` from `@/lib/speak`.
  - Dependencies: `useSRS`, `useLevelFilter`, `useVoiceRecognition`
    (`@/hooks`), `generateChoices` (`@/lib/generateChoices`),
    `matchesTranscript` and `bestMatch` (`@/lib/matchTranscript`), `deckMetadata`
    (`@/data/decks`), `DECK_MAP` (`@/data/deckMap`), and `AudioButton`,
    `ChoiceButton`, `FeedbackMessage`, `MicButton` (`@/components`).

## Invariants

- Pressing the mic while listening cancels (`stopListening`) and returns the mic to idle with no feedback message. Tapping a choice while listening cancels the same way, so a voice result that arrives after the tap cannot answer the card a second time.
- Answer and mic feedback render in one `FeedbackMessage` (one `role="status"` live region), below the card rather than on its back face, so it is visible and announced once whichever side is up.
- The Next button is disabled until a choice is selected; `.btn:disabled` styles it as inert.
- The session takes one snapshot of the due cards at mount (`useState`
  initializer). Each card is filtered by `activeLevels` and
  `isCardDueForDeck(deckId, originalIndex)`. The snapshot keeps indices from
  shifting as answered cards leave the due list.
- SRS identity is `(deckId, originalIndex)`, where `originalIndex` is the
  card's position in the `cards` prop, not its position in the due list.
- The `filteredCards` choice pool is computed once (empty deps) from
  `activeLevels`. `choices` is memoized on `[currentEntry, filteredCards]`.
- A click is ignored while `selectedChoice !== null`. Each choice, correct or
  not, schedules `handleAnswer(isCorrect)` after 600 ms, which calls
  `updateCard(deckId, originalIndex, isCorrect)` and advances. The "next"
  control is disabled until a choice is selected; pressing it runs
  `handleAnswer` with that choice's correctness at once and cancels the pending
  600 ms timer, so each card is recorded once.
- "Study again" (on both end screens) replays the session's due-card snapshot
  as practice: `practice` is set, and `handleAnswer` skips `updateCard`, so
  boxes and review dates stay as the real session left them. It is hidden on
  the all-done screen when the session started with no due cards.
- Mic on the front of the card: a transcript that matches `card.front` flips
  the card and shows `heard`. Mic on the back: the choice the transcript
  matches best (`bestMatch`) is selected; when two choices match equally
  well, it counts as no match. A transcript that matches nothing, or a
  recognition error, shows `notRecognized` and sets the mic to `error` for
  800 ms.
- After the last card, the session shows the all-done screen if no deck for
  this `lang` in `deckMetadata` has due cards at the active levels. Otherwise
  it shows the deck-complete screen. `handleAnswer` only sets `finished`; the
  screen is chosen at render time (`allDecksEmpty()`), after `updateCard` has
  applied, so the just-answered card is counted. Covered with real SRS state by
  `src/__tests__/components/StudySession.endScreens.test.tsx`.

## Side Effects

- SRS progress is written through `useSRS().updateCard`, and the level filter
  is read through `useLevelFilter`. Both hooks use `localStorage`.
- `window.speechSynthesis` through `speak()` when the speak control on a
  choice is used.
- Speech recognition through `useVoiceRecognition().startListening`.
- `setTimeout` timers (600 ms and 800 ms).

## Verification

- Run: `npx vitest run src/__tests__/components/StudySession`
- Full suite: `npm test`
