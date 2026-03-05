# Design: Next.js + TypeScript Port

**Date:** 2026-03-04
**Milestone:** v2.0 — Next.js / TypeScript Port
**Branch:** feature branch (off main)

## Goal

Port PuroLingua from vanilla JS to Next.js + TypeScript as a portfolio piece. Feature parity with v1.1. No new features.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (static export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| i18n | next-intl |
| State | React hooks (no external state library) |
| Tests | Vitest + React Testing Library |
| Deployment | Static files to Hostinger VPS (same as today) |

## URL Routing

```
/                   → language picker (home)
/[lang]             → deck grid  (e.g. /it, /es)
/[lang]/[deck]      → study session  (e.g. /it/restaurant)
```

All routes are statically generated via `generateStaticParams` — no server required.

`[lang]` serves as both the next-intl locale and the content language. One param, two jobs.

## Component Tree

```
app/
  page.tsx                     → LanguagePicker
  [lang]/
    page.tsx                   → DeckGrid
    [deck]/
      page.tsx                 → StudySession

components/
  LanguagePicker.tsx
  DeckGrid.tsx
  DeckCard.tsx                 → deck tile with due-count badge
  LevelFilterChips.tsx         → A1/A2 multi-select (hidden during study)
  StudySession.tsx             → orchestrates flashcard flow
  FlashCard.tsx                → front/back with audio button
  ChoiceButton.tsx             → multiple-choice option
  AudioButton.tsx              → TTS via Web Speech API
```

Pages are server components that pass URL params down. All components touching `localStorage` or Web Speech API are `"use client"`.

## State & Hooks

**`useSRS(lang: Lang)`**
- Loads/saves `progress[lang]` from localStorage
- Same key format as today: `{deckId}_{cardIndex}` — no migration needed
- Exposes: `getDueCount`, `getFilteredCards`, `recordAnswer`, `resetProgress`
- Pure port of `progress.js` + `srs.js` to TypeScript

**`useLevelFilter()`**
- Loads/saves `activeLevels` from localStorage
- New user default: `['A1']`; returning user default: `['A1', 'A2']`
- Enforces FLTR-06 guard (cannot deselect all)
- Exposes: `activeLevels`, `toggleLevel(level)`

**Study session state** — local to `StudySession.tsx` via `useState`/`useReducer`. No global state needed.

**No React Context** — URL carries navigation state; two focused hooks handle persistence.

## Data Layer & Types

```typescript
// types/index.ts
type Lang = 'it' | 'es'
type Level = 'A1' | 'A2'
type DeckId = 'restaurant' | 'travel' | 'daily-life' | 'shopping' | 'hotel' | 'emergencies' | 'social' | 'weather'

interface Card {
  front: string
  back: string
  level: Level
}

interface Deck {
  id: DeckId
  cards: Card[]
}

interface Progress {
  [cardKey: string]: { box: number; nextDue: number }
}
```

Card arrays stay as typed TypeScript modules. Append-only index contract preserved — no re-indexing.

`data/decks.ts` holds deck metadata (id, i18n name key) for the deck grid without importing all card arrays upfront.

## i18n with next-intl

```
messages/
  it.json    → deck names, UI labels in Italian context
  es.json    → deck names, UI labels in Spanish context
```

- `useTranslations` replaces the current custom `t()` helper
- Card front/back text stays in data files — content, not translations
- Level chip labels (A1/A2) remain language-neutral but move into message files

## Testing

- Vitest + React Testing Library (no Playwright — already removed)
- Unit tests: `lib/srs.ts`, `lib/generateChoices.ts`
- Hook tests: `useSRS`, `useLevelFilter` via `renderHook`

## Out of Scope

- No new features — strict feature parity with v1.1
- No FLTR-10 (hide chips during study) — remains an open todo
- No A1 native speaker review — remains a pending todo
- No SSR, API routes, or server-side data fetching
- No React Context, Zustand, or other state libraries
