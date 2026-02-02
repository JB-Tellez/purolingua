# XP Workshop: Italiano Brownfield Project

A 5-day intensive workshop where you'll learn Extreme Programming practices by working with a real brownfield codebase — a vanilla JavaScript flashcard app that your team will port to React, strengthen with tests, and extend with new features.

---

## The Project

**Italiano** is a language learning flashcard app using spaced repetition (Leitner box system). It currently supports Italian and Spanish, uses vanilla JS with ES6 modules, and persists progress to localStorage.

### The Codebase

| Layer | Files | Lines | Notes |
|-------|-------|-------|-------|
| Orchestration | `src/js/core/app.js` | 539 | Main entry — event wiring, DOM rendering, quiz logic |
| State | `src/js/core/state.js` | 71 | Module-level getters/setters for current deck, card index, quiz state |
| Views | `src/js/core/views.js` | 34 | DOM class toggling to switch between deck selection and flashcard views |
| i18n | `src/js/core/i18n.js` | 182 | Translation system with dot-notation keys, interpolation, runtime locale registration |
| Spaced Repetition | `src/js/features/progress.js` | 102 | Leitner box algorithm — pure functions, localStorage persistence |
| Audio | `src/js/features/audio.js` | 80 | Text-to-speech via Web Speech API |
| Voice | `src/js/features/voice.js` | 78 | Speech recognition (webkit only) |
| UI Utilities | `src/js/features/ui.js` | 99 | Promise-based modals and toast feedback |
| Deck Utilities | `src/js/utils/deck-utils.js` | 37 | Shuffle and multiple-choice generation |
| Locale Data | `src/locales/{it,es}/` | ~800 | UI strings + vocabulary decks per language |
| Styling | `src/css/style.css` | 1,108 | Responsive layout, 3D card flip animations, theme colors |
| Tests | `tests/` | ~440 | Vitest: progress logic, deck utilities, audio. **No tests for app.js.** |

### Tech Stack

- **Runtime:** Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Build:** Vite 6
- **Test:** Vitest 4 with jsdom, @vitest/coverage-v8
- **Browser APIs:** Web Speech (TTS + recognition), localStorage
- **Linting:** None — you'll set this up

---

## Workshop Structure

Iterations are sequential — each builds on the previous — but your team moves through them at your own pace. There are no day assignments. The one fixed point is **Day 5**, which is reserved for wrapping up, showcase, and retrospective.

### Iteration 0 — Tooling & Standards (whole team)

Walk through the codebase as a group. Key things to understand:

- `app.js` is the monolith: it handles initialization, rendering, event binding, quiz logic, language switching, and voice recognition all in one file
- `progress.js` contains the Leitner box algorithm — pure functions that don't touch the DOM
- `state.js` is a module-level store with getters/setters (no framework)
- `i18n.js` supports dot-notation keys (`t('feedback.correct')`), interpolation (`t('streak.daysInARow', { count: 3 })`), and runtime locale registration
- The streak counter is hardcoded to 3 (`app.js:118`)

First exercise as a team:
- Set up ESLint + Prettier with a pre-commit hook
- Run `npm test` and `npm run test:coverage` — examine what's covered and what isn't
- Identify the untested code (hint: `app.js`, `state.js`, `views.js`, `i18n.js`)

**XP practice:** Collective code ownership — everyone reads the same code together before anyone changes it.

### Iteration 1 — Characterization Tests (pairs)

Write tests that capture existing behavior *before* changing anything. The point is not to improve the code — it's to build a safety net.

Some possible starting points:
- `state.js` — straightforward: call setters, assert getters return the right values
- `i18n.js` — test `t()` with valid keys, missing keys, interpolation params
- `views.js` — requires jsdom setup to test class toggling
- `app.js` — the most complex. Functions like `renderDecks`, `startDeck`, and `handleAnswer` are worth considering since they cover the core behaviors that will carry over to React.

Reference patterns: `tests/progress.test.js` (183 lines) and `tests/deck-utils.test.js` (56 lines) show how existing tests are structured.

**XP practices:** Pair programming (one drives, one navigates), TDD mindset (test-first to understand, not to implement).

### Iteration 2 — React Bootstrap & Deck Selection

Questions your team needs to answer:
- How do you add React to an existing Vite project?
- How do you handle the transition — does the React app coexist with the vanilla app, or replace it?
- What does the deck selection view look like as React components?

Architecture is open. Your team decides:
- Component structure (one big component? small composable ones?)
- Where state lives (useState, useReducer, context, something else?)
- How to reuse `progress.js` and `deck-utils.js` (they're pure functions — just import them)

**User stories:**

**S1 — Deck selection view**
> As a learner, I see a grid of themed deck cards showing my review status for each deck.

Acceptance criteria:
- Each deck displays its title, description, icon, and theme color
- Badge shows the number of due cards (from Leitner box logic)
- When due count is 0, badge shows the locale's "completed" string with visual distinction
- Decks are loaded from the current locale's deck data

**S2 — Start studying**
> As a learner, I can click a deck to start studying.

Acceptance criteria:
- Clicking a deck with due cards transitions to the flashcard view
- Clicking a completed deck shows an alert (all cards reviewed)
- Due cards are shuffled into a random order for the session

**XP practices:** Simple design, small releases (each story is independently demoable), CI (all tests pass before merging).

### Iteration 3 — Flashcard & Quiz Components

Questions your team will encounter:
- The card flip is currently a CSS class toggle on a DOM element. How does that translate to React?
- Quiz options are dynamically generated buttons with inline event handlers. Where are the component boundaries?
- `handleAnswer` updates the Leitner box, shows feedback, and highlights the correct answer. How do you want to organize those responsibilities?
- The progress bar tracks position within due cards, not total cards. How does that affect your state design?

What to reuse directly (no React needed):
- `progress.js` — `isCardDue()`, `updateCardProgress()`, `getDueCount()`
- `deck-utils.js` — `shuffleArray()`, `generateChoices()`

**User stories:**

**S3 — Flashcard with flip**
> As a learner, I see a flashcard that I can flip between a phrase and multiple-choice quiz options.

Acceptance criteria:
- Front shows the `card.front` text
- Back shows 4 quiz options (1 correct + 3 foils from the same deck) in randomized order
- Clicking the card or the flip button toggles between front and back with a 3D animation (existing CSS can be reused)
- Clicking quiz buttons or audio icons does not trigger a flip

**S4 — Answer feedback with spaced repetition**
> As a learner, I select an answer, see immediate feedback, and my progress is tracked through the spaced repetition system.

Acceptance criteria:
- Correct answer: button turns green, success feedback message appears
- Incorrect answer: button turns red, correct answer is highlighted in green
- Only one guess allowed per card
- Feedback message auto-dismisses after 1.5 seconds
- Correct/incorrect answers update the card's Leitner box via the existing `progress.js` logic
- Progress is saved to localStorage immediately and is per-locale

**S5 — Session progress bar**
> As a learner, I see a progress bar showing my position in the current study session.

Acceptance criteria:
- Shows percentage based on current card index / total due cards
- Updates after each card advance
- Resets when starting a new deck

**S6 — Audio pronunciation**
> As a learner, I hear pronunciation when I tap the audio icon on a quiz option.

Acceptance criteria:
- Each quiz option has an audio icon that speaks the option text
- Front card has an audio button that speaks the prompt phrase
- Uses Web Speech API with locale-appropriate voice selection
- Tapping audio does not select the answer or flip the card

**XP practices:** Refactoring, TDD (write component tests before or alongside implementation), pair rotation.

### Iteration 4 — i18n & New Language

The existing i18n system (`i18n.js`) has these capabilities:
- `t(key, params)` — dot-notation translation with interpolation
- `getAvailableLocales()` — returns `[{ code, name, flag }]`
- `registerLocale(code, data, decks)` — runtime locale registration
- `setLocale(code)` — changes language, updates URL and localStorage
- `hasLanguagePreference()` — checks if user has previously chosen

Your team decides how to port this:
- React Context + custom hook (`useTranslation`)
- Existing `t()` function wrapped in a hook
- Third-party library (react-i18next, react-intl, etc.)
- Something else entirely

A complete language needs:
- [ ] UI strings file (`src/locales/{code}/ui.js`) matching the structure of existing locales
- [ ] Vocabulary decks file (`src/locales/{code}/decks.js`)
- [ ] Registration in the i18n system
- [ ] Voice preferences configured for TTS
- [ ] Appears in language selection, switching works, progress is independent

**User stories:**

**S7 — Language selection and switching**
> As a learner, I can choose and switch my study language, and my preference persists across sessions.

Acceptance criteria:
- Shows all registered languages with flag and name
- Current language is visually indicated
- Switching reloads deck data and UI strings for the new language
- Language choice saved to localStorage and URL (`?lang=` parameter)
- On reload, app starts in the previously selected language
- Disabled during an active study session (prevents mid-quiz switching)

**S8 — New language**
> As a learner, I can study [team chooses: Portuguese, French, German, etc.] vocabulary.

Acceptance criteria:
- At least 2 decks with 10+ cards each
- All UI strings translated
- Voice preferences configured for TTS
- Language appears in picker and switcher
- Progress tracked independently from other languages

**XP practices:** Planning game (teams estimate and commit to which stories they'll complete), continuous integration (i18n changes affect the whole app — tests must pass).

---

### Optional Stories

Available for teams that move through the core iterations and want to go deeper. Your team can also pull these in earlier if you see fit.

**S9 — Real study streak**
> As a learner, I see my actual consecutive study days (not a hardcoded number).

Acceptance criteria:
- Track dates of study activity in localStorage
- Calculate consecutive days from today backwards
- Display actual count in the streak banner
- Streak resets to 0 if a day is missed

**S10 — Wrong-answer review**
> As a learner, I see which cards I got wrong at the end of a study session.

Acceptance criteria:
- After completing all due cards, show a summary screen
- List cards answered incorrectly with both front and back text
- Option to dismiss and return to deck selection

**S11 — Dark mode**
> As a learner, I can toggle dark mode.

Acceptance criteria:
- Toggle in the header
- Preference persists in localStorage
- Respects system preference as default (`prefers-color-scheme`)
- All existing themes (teal, red, yellow, etc.) remain distinguishable

**S12 — Reset progress confirmation**
> As a learner, I can reset my progress with a confirmation dialog.

Acceptance criteria:
- Reset button triggers a confirmation modal
- Confirming clears progress for the current language only
- Deck due counts update immediately after reset
- If in a study session, returns to deck selection

**S13 — Offline support**
> As a learner, the app works offline after my first visit.

Acceptance criteria:
- Service worker caches app shell and deck data
- App loads without network after initial visit
- Progress continues to save to localStorage while offline

**S14 — Server-side progress persistence** (back-end track)
> As a learner, my progress syncs to a server so I can use the app on multiple devices.

This story is for developers with back-end experience. It can run in parallel with front-end work.

**API contract** (derived from the existing localStorage data shape):

```
GET  /api/progress/:userId/:locale
Response: { "daily_0": { "box": 2, "nextReview": "2026-02-03" }, ... }

PUT  /api/progress/:userId/:locale
Body: { "daily_0": { "box": 2, "nextReview": "2026-02-03" }, ... }
Response: 200 OK

GET  /api/decks/:locale  (stretch goal)
Response: [ { "id": "daily", "title": "...", "cards": [...] }, ... ]
```

**Constraints:**
- Tech stack is fully open — Express, Fastify, Hono, Koa, or anything else
- Storage is fully open — in-memory, JSON file, SQLite, Postgres, etc.
- Must be test-first: write failing API/integration tests, then implement
- Front-end teams build against the contract using an adapter/service layer. When the real API is ready, swap the adapter. If the contract was honored, it works. If not — that's the teaching moment.

---

### Day 5: Wrap-up, Showcase & Retro

Day 5 is the one fixed point on the calendar. No new feature work — use the morning to finish in-progress stories, clean up, and prepare to present.

**Team demos**
- Show your working app
- Focus on: what architectural decisions did you make and why?
- Show test coverage — what did TDD give you confidence in?

**Cross-team code review**
- Review each other's code
- Compare: component structures, state management approaches, i18n strategies
- No "right answer" — the point is seeing how different teams solved the same problems

**Retrospective**
- What XP practices helped the most?
- What created friction?
- What would you do differently in a second iteration?
- How did pair rotation affect code quality and knowledge sharing?

---

## Story Backlog Summary

| # | Story | Iteration | Track |
|---|-------|-----------|-------|
| S1 | Deck selection view | 2 | FE |
| S2 | Start studying | 2 | FE |
| S3 | Flashcard with flip | 3 | FE |
| S4 | Answer feedback with spaced repetition | 3 | FE |
| S5 | Session progress bar | 3 | FE |
| S6 | Audio pronunciation | 3 | FE |
| S7 | Language selection and switching | 4 | FE |
| S8 | New language (vertical slice) | 4 | FE |
| S9 | Real study streak | Optional | FE |
| S10 | Wrong-answer review | Optional | FE |
| S11 | Dark mode | Optional | FE |
| S12 | Reset progress confirmation | Optional | FE |
| S13 | Offline support | Optional | FE |
| S14 | Server-side progress persistence | Optional | BE |

---

## XP Practices

| Practice | Where It Shows Up |
|----------|-------------------|
| **Pair Programming** | Every iteration. Rotate pairs regularly. |
| **Test-Driven Development** | Iteration 1 (characterization tests), all subsequent iterations (test-first for new components) |
| **Small Releases** | Each iteration produces a working, demoable increment |
| **Continuous Integration** | All tests must pass before merging — enforce from the start |
| **Simple Design** | Architecture is open-ended. Teams justify their choices by what's simplest for the current stories. |
| **Refactoring** | Iteration 3 — porting `app.js` to React components |
| **Collective Code Ownership** | Pair rotation means everyone works on all parts of the codebase |
| **Planning Game** | Teams estimate stories and commit to what they'll deliver |
| **Customer Tests** | Acceptance criteria on each story serve as the customer's definition of done |
| **Spike** | Back-end track — research before committing to a tech stack |
