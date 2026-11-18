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
    `params: Promise<{ lang; scenario }>`, calls `notFound()` for an invalid
    lang or an unknown scenario id, calls `setRequestLocale(lang)`, and then
    renders `<QAStudySessionNoSSR lang scenario={matchedScenario} />`.
- `QAStudySessionNoSSR.tsx`
  - `default QAStudySessionNoSSR(props: { lang: Lang; scenario: Scenario })`:
    `'use client'` wrapper around `next/dynamic(() => import('./QAStudySession'), { ssr: false })`.
- `QAStudySession.tsx`
  - `default QAStudySession({ lang, scenario })` (`'use client'`): renders the
    session UI. It has three screens: all-done (`allScenariosDone`), scenario
    done (`scenarioDone`), and the active question with choices, mic, and
    feedback.
  - Module-private helpers: `speak(phrase, lang)`, `shuffle<T>(arr)` (Fisher-Yates, returns a new array),
    `isScenarioHasDue(progress, scenarioId, cards, activeLevels)`, and the
    `LANG_LOCALE` map (`it -> it-IT`, `es -> es-ES`).
  - Dependencies: `useQASRS`, `useLevelFilter`, `useVoiceRecognition`
    (`@/hooks`), `isCardDue` (`@/lib/srs`), `matchesTranscript`
    (`@/lib/matchTranscript`), `scenarios` (`@/data/qa`), and
    `AudioButton`, `ChoiceButton`, `FeedbackMessage`, `MicButton`
    (`@/components`).

## Invariants

- `page.tsx` checks lang against the literal `['it', 'es']`, not
  `routing.locales`. Keep the two lists in sync.
- The session takes one snapshot of the due cards at mount
  (`useState(() => dueCards)` as `sessionDueCards`). Changes to SRS state during
  the session do not re-filter or re-index the cards.
- `bootstrapHasProgress` is computed once from localStorage key
  `${lang}-progress`. It is true when any key starts with `qa_`, and any
  read or parse error yields `false`. This flag only sets the default
  levels in `useLevelFilter`. A saved filter takes precedence.
- Progress keys are formatted as `qa_${scenarioId}_${card.id}`
  (`isScenarioHasDue`).
- Text fields depend on the language. `it` uses `question`, `correct`, and
  `foils`. Other languages use `questionEs`, `correctEs`, and `foilsEs`.
- `choices` is memoized on `currentCard`, so the shuffle order stays the same
  while a card is shown.
- A click is ignored while `selectedChoice !== null`. A correct answer calls
  `updateCard(card.id, true)` after 600 ms. A wrong answer only resets the
  selection after 800 ms so the user can retry. Wrong answers are not recorded
  in SRS.
- Mic input: a transcript that matches `correctText` selects the correct choice
  and advances. A transcript that does not match, or a recognition error, shows
  `notRecognized` for 800 ms and does not update SRS.
- After the last card, the session shows the scenario-done screen if any
  scenario in `@/data/qa` still has due cards at the active levels. Otherwise
  it shows the all-done screen. `handleAnswer` only sets `finished`; the
  screen is chosen at render time from the post-`updateCard` `progress`, so the
  just-answered card is counted. Covered with real SRS state by
  `src/__tests__/components/QAStudySession.endScreens.test.tsx`.

## Side Effects

- Reads `localStorage` (`${lang}-progress`) at mount. Progress is written
  through `useQASRS().updateCard`, and the level filter through
  `useLevelFilter`.
- `window.speechSynthesis`: `speak()` cancels pending speech and speaks the
  phrase at rate 0.9 with a voice for the matching locale. It runs
  automatically on each `index` change and when the speak control on a
  choice is used.
- Speech recognition through `useVoiceRecognition().startListening`.
- `setTimeout` timers (600 ms and 800 ms) for feedback and advancing.

## Verification

- Run: `npx vitest run src/__tests__/components/QAStudySession`
- Full suite: `npm test`
