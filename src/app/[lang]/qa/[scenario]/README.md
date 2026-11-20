# QA Scenario Study Route (`/[lang]/qa/[scenario]`)

## Overview

Next.js App Router dynamic route that runs a multiple-choice Q&A study session
for one conversation scenario. The server component `page.tsx` validates the
route params, finds the scenario in `@/data/qa`, and renders a client-only
wrapper. That wrapper loads `QAStudySession` with SSR disabled, because the
session depends on browser-only APIs (`localStorage` for progress, speech
synthesis, speech recognition).

## Interface

- `page.tsx`
  - `generateStaticParams()`: returns every `{ lang, scenario }` pair from
    `routing.locales` x `scenarios[].id`, used for static export.
  - `default QAStudyPage({ params })` (async server component): awaits
    `params: Promise<{ lang; scenario }>`, calls `notFound()` unless
    `isLang(lang)` and the scenario id exists, calls `setRequestLocale(lang)`, and then
    renders `<QAStudySessionNoSSR lang scenario={matchedScenario} />`.
- `QAStudySessionNoSSR.tsx`
  - `default QAStudySessionNoSSR(props: { lang: Lang; scenario: Scenario })`:
    `'use client'` wrapper around `next/dynamic(() => import('./QAStudySession'), { ssr: false })`.
- `QAStudySession.tsx`
  - `default QAStudySession({ lang, scenario })` (`'use client'`): renders the
    session UI. It has three screens: all-done (`allScenariosDone`), scenario
    done (`scenarioDone`), and the active question with choices, mic, and
    feedback.
  - Module-private helper: `isScenarioHasDue(progress, scenarioId, cards, activeLevels)`.
  - Dependencies: `useQASRS`, `useLevelFilter`, `useVoiceRecognition`
    (`@/hooks`), `isCardDue` and `getQACardKey` (`@/lib/srs`), `loadProgress`
    (`@/lib/progressStorage`), `shuffle` (`@/lib/shuffle`), `speak` and `stopSpeaking` (`@/lib/speak`), `bestMatch`
    (`@/lib/matchTranscript`), `scenarios` (`@/data/qa`), and
    `AudioButton`, `ChoiceButton`, `FeedbackMessage`, `MicButton`
    (`@/components`).

## Invariants

- Pressing the mic while listening cancels (`stopListening`) and returns the mic to idle with no feedback message. "Listening" is the session's `micState`, set at the first press only when `startListening` reports that it started (a refused start leaves the mic idle), so a second press cancels even before the browser has started (`onstart`). Leaving the page cancels too (the hook aborts on unmount). Tapping a choice while listening cancels the same way, so a voice result that arrives after the tap cannot answer the card a second time or record a missed card as correct.
- The session takes one snapshot of the due cards at mount
  (`useState(() => dueCards)` as `sessionDueCards`). Changes to SRS state during
  the session do not re-filter or re-index the cards.
- `bootstrapHasProgress` is computed once with `loadProgress(lang)`. It is
  true when there is any progress (Rephrase or Q&A), matching every other
  `useLevelFilter` caller; a missing or unreadable record yields `false`. This flag only sets the default
  levels in `useLevelFilter`. A saved filter takes precedence.
- `isScenarioHasDue` looks progress up with `getQACardKey`, the same key
  format `useQASRS` writes.
- Text fields depend on the language. `it` uses `question`, `correct`, and
  `foils`. Other languages use `questionEs`, `correctEs`, and `foilsEs`.
- `choices` is memoized on `currentCard`, so the shuffle order stays the same
  while a card is shown.
- A click is ignored while `selectedChoice !== null`. A wrong answer sets
  `missedCurrent` and resets the selection after 800 ms so the user can retry.
  A correct answer (tapped or spoken) calls
  `updateCard(card.id, !missedCurrent)` at once, then advances after 600 ms:
  a card missed before the correct retry is recorded as wrong (box 1).
  Recording at the answer means leaving the page during the delay still saves
  it, and no timer writes progress after the page is gone. The card is
  recorded once. Covered by `QAStudySession.endScreens.test.tsx`.
- "Study again" (on both end screens) replays `sessionDueCards` as practice:
  `practice` is set and a correct answer skips `updateCard`. It is hidden on
  either end screen when the session started with no due cards.
- Mic input: the transcript is matched against every choice (`bestMatch`). If
  the best match is the correct choice, it is selected and the card advances.
  A best match on a foil, no match, a tie, or a recognition error (including recognition that ends with no result) shows
  `notRecognized` for 800 ms and does not update SRS. The reset
  (`resetMicError`) clears only the error and the `notRecognized` feedback
  still showing, so a new attempt started within the 800 ms is not cut off.
- After the last card, or at once when the scenario opens with no due cards
  (a "done" scenario is still a link), the session shows the scenario-done screen if any
  scenario in `@/data/qa` still has due cards at the active levels. Otherwise
  it shows the all-done screen. `advance()` only sets `finished`; the
  screen is chosen at render time from the post-`updateCard` `progress`, so the
  just-answered card is counted. Covered with real SRS state by
  `src/__tests__/components/QAStudySession.endScreens.test.tsx`.

## Side Effects

- Reads `localStorage` (`${lang}-progress`) at mount. Progress is written
  through `useQASRS().updateCard`, and the level filter through
  `useLevelFilter`.
- `window.speechSynthesis`: `speak()` cancels pending speech and speaks the
  phrase at rate 0.9 with a voice for the matching locale. It reads the
  question automatically whenever a card is shown (each `index` change, and
  the first card again after "Study again", even in a one-card session, since
  `finished` returning to `false` also triggers it; never on an end screen), and
  runs when the speak control on a choice is used. Leaving the session calls
  `stopSpeaking()`, so a question still being read stops.
- Speech recognition through `useVoiceRecognition().startListening`.
- `setTimeout` timers (600 ms and 800 ms) for feedback and advancing.

## Verification

- Run: `npx vitest run src/__tests__/components/QAStudySession`
- Full suite: `npm test`
