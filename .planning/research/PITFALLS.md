# Pitfalls Research

**Domain:** Adding CEFR difficulty level filtering (A1/A2) to an existing vanilla JS language learning app
**Researched:** 2026-02-22
**Confidence:** HIGH (derived from direct codebase analysis and known patterns in content filtering systems)

---

## Critical Pitfalls

### Pitfall 1: Card Index Shift Corrupts All Existing SRS Progress

**What goes wrong:**
Progress is stored in localStorage as `{ "daily_0": { box: 2, nextReview: "2026-03-01" } }` — keyed by `deckId + "_" + cardIndex`. If A1 cards are prepended to the front of a deck's `cards` array, every existing card shifts to a new index. The card that was `daily_0` becomes `daily_5`. localStorage still holds `daily_0`, which now points to a completely different card. Every returning user silently has wrong SRS state for every card they have studied.

**Why it happens:**
Developers think of "adding content" as inserting new cards at the beginning or middle of arrays. The data file looks fine. The UI looks fine. The bug is invisible until a user notices that a card they mastered keeps reappearing, or that a card they've never seen claims to be in box 3.

**How to avoid:**
Append all new A1 cards to the END of each deck's `cards` array in the locale deck files (`src/locales/it/decks.js`, `src/locales/es/decks.js`). This preserves the index of every existing card. Alternatively — and more robustly — migrate the card key from positional index to a stable content-derived ID (e.g., a hash of `front` text) before adding any new cards. The migration path: read existing progress, re-key each entry to the new ID scheme, write back.

**Warning signs:**
- "I added the A1 cards and now my box 3 cards are showing up as due again"
- Cards in the deck picker showing higher-than-expected due counts after the update
- A user who had completed a deck now sees it as having due cards

**Phase to address:**
Content authoring phase (when A1 cards are added to deck files). Must be decided and enforced before the first card is written.

---

### Pitfall 2: Default Level Change Is a Breaking Change for Returning Users

**What goes wrong:**
The plan calls for the default level filter to be A1 only. Currently, the app shows all cards with no filter. A returning user who has been studying the 20 existing Italian "Daily Life" cards — all of which will be tagged A2 — loads the app after the update and sees zero cards across all decks. The deck grid shows every deck as "Completed" or shows 0 due cards. The user thinks the app is broken or their progress was wiped.

**Why it happens:**
The developer tests with a fresh browser (no localStorage). The fresh experience shows A1 cards correctly. The returning-user experience — where the level filter hides ALL known content — is never tested. This is the most common category of regression in content filtering features: new default hides more than before.

**How to avoid:**
Treat the level preference as needing an explicit first-run migration for existing users. On first load after the update, check whether the user has any existing SRS progress (the `it-progress` or `es-progress` key exists and is non-empty). If yes, default the level filter to "A1 + A2" (both selected) rather than "A1 only." Only fresh users (no prior progress) see A1 as the default. Show a one-time notice: "We added beginner content. Your existing vocabulary is now labeled A2. [Choose your level]."

**Warning signs:**
- E2E test with pre-seeded localStorage shows all decks as "Completed" after deploy
- QA that only tests fresh-start flows gives a green result but the returning-user flow is broken
- Any feature description that says "default to A1" without a "except for existing users" clause

**Phase to address:**
Level filter UI phase — specifically the localStorage initialization logic for the filter preference.

---

### Pitfall 3: Quiz Foil Pool Bleeds Across Level Boundaries

**What goes wrong:**
`generateChoices` in `deck-utils.js` (line 14–32) generates quiz distractors by filtering `deck.cards` — the full array — for cards whose `back` text differs from the correct card. If a user is studying an A1 card and the level filter is active, the correct card is A1 but the three foils may be drawn from A2 cards in the same deck. For a beginner, the "wrong" answer options are vocabulary they haven't encountered yet, which is confusing. Worse, if the user switches to quiz mode on an A2-filtered deck while level = A1, the foil pool may be empty or near-empty, causing fewer than 4 choices to appear (the current code takes `shuffledFoils.slice(0, 3)` — with only 2 other A1 cards in a deck, only 2 foils exist, resulting in 3-choice quizzes inconsistently).

**Why it happens:**
`generateChoices` receives the full `deck` object. Filtering happens at the deck-picker level (which cards to study) but the foil-generation function has no knowledge of the active level filter. The two concerns are decoupled without a shared contract.

**How to avoid:**
Pass the level-filtered card list (not the raw `deck.cards` array) as the foil pool to `generateChoices`, or add a `levelFilter` parameter. Signature change: `generateChoices(correctCard, deck, allowedCards)` where `allowedCards` defaults to `deck.cards` but can be overridden with the filtered subset. Ensure each deck has at least 4 cards per level before shipping content so the foil pool is never too small.

**Warning signs:**
- Quiz shows only 2 or 3 answer options for certain cards
- Beginner users see unfamiliar (A2) vocabulary in the "wrong answer" options
- Unit test for `generateChoices` passes but integration test with level filter fails

**Phase to address:**
Level filter UI phase, when `startDeck` is modified to use filtered card indices. The foil pool must be updated at the same time.

---

### Pitfall 4: Deck Badge Due Count Does Not Respect Level Filter

**What goes wrong:**
`getDueCount(deck)` in `progress.js` (line 79–87) iterates `deck.cards` — the complete array — and counts all due cards regardless of level. The deck picker will show a badge like "12 due" for a deck where 10 of those 12 cards are A2 and the user's level filter is A1 only. The user clicks the deck expecting 12 cards and gets 2. This feels like a bug, not a feature. The reverse is equally problematic: a user studying A1+A2 sees a badge count that, if calculated pre-filter, may undercount when only some levels are due.

**Why it happens:**
`getDueCount` was written before levels existed. It has no filter parameter. The deck-picker rendering loop in `app.js` (line 216–237) calls `getDueCount(deck)` directly on the raw deck. Adding a filter to `renderDecks` is easy to forget because `getDueCount` is a separate module — the call site and the function definition are in different files.

**How to avoid:**
`getDueCount` must accept a card subset (or level filter) parameter. Update the call in `renderDecks` to pass the current level filter. Alternatively, compute the filtered card list once and pass it to both `startDeck` and `getDueCount`. The badge must reflect only the cards that will actually appear when the deck is opened.

**Warning signs:**
- Clicking a deck that shows "8 due" but only 3 cards appear in the session
- Badge shows "0 due" but the deck opens and shows cards (due count was filtered but session was not, or vice versa)
- Any test that asserts badge count matches session card count fails

**Phase to address:**
Level filter UI phase. The due count and the session card list must use the same filter logic — they should share a single filter function rather than each implementing it independently.

---

### Pitfall 5: Level Preference LocalStorage Key Collision or Absence Defaults to Wrong State

**What goes wrong:**
The app uses `language-learning-locale` and `it-progress` / `es-progress` as localStorage keys. When the level filter preference is added (e.g., as `purolingua-level-filter`), two edge cases break silently. First: if the key is absent (fresh user, or user who cleared storage), the code must reliably default to A1 for new users and A1+A2 for returning users — but getting this conditional right requires checking both the level key AND the progress key, and developers often only check the level key. Second: if the initial value written is the JavaScript default (`undefined`, `null`, or `""` stringified to localStorage), `JSON.parse(null)` returns `null`, and code that does `if (savedFilter)` will incorrectly fall through to the default, potentially overwriting a deliberate "no filter" selection.

**Why it happens:**
localStorage stores strings. `JSON.stringify(undefined)` returns `undefined` (not the string "undefined"), so `localStorage.setItem(key, JSON.stringify(undefined))` stores nothing, and `localStorage.getItem(key)` returns `null`. Developers write `const filter = JSON.parse(localStorage.getItem(key)) || DEFAULT` and do not realize that an empty array `[]` is falsy in the `||` expression — meaning a user who explicitly selected zero levels would have their selection overridden by the default on every page load.

**How to avoid:**
Use a sentinel-based approach: distinguish between "key not set" (`null` from `getItem`) and "key set to empty array" (`"[]"`). Specifically: `const raw = localStorage.getItem(key); const filter = raw !== null ? JSON.parse(raw) : deriveDefault();`. Never use `|| DEFAULT` with array values. Write an explicit `initLevelFilter()` function that encodes this logic in one place.

**Warning signs:**
- Level filter resets to A1 every time the page is reloaded, even after the user selected A2
- User selects both A1 and A2, reloads, and the filter shows only A1
- Console shows "Cannot read properties of null" when the filter is read on first load

**Phase to address:**
Level filter UI phase, in the filter persistence initialization function.

---

### Pitfall 6: Level Tag Missing from Cards Silently Includes or Excludes Content

**What goes wrong:**
When the `level` property is added to card objects, some cards may be missing it — either because they were added before the property was defined, or because content was written inconsistently. A filter for `level === "A1"` will silently exclude any card where `card.level` is `undefined`. A filter for `level !== "A2"` will silently include those same cards. Either way, the content set is wrong in a way that has no error message.

**Why it happens:**
There is no schema validation on the card data files. The locale deck files (`src/locales/it/decks.js`, `src/locales/es/decks.js`) are plain JS arrays of objects with no required-field enforcement. A content author can omit `level` and the app loads without complaint.

**How to avoid:**
Add a Vitest unit test that imports both locale deck files and asserts every card object has a `level` property equal to `"A1"` or `"A2"`. Run this as part of CI. If the property is missing, the test fails before the code ever reaches production. Additionally, write the filter function defensively: if `card.level` is undefined, log a warning and treat it as A2 (the existing content level) to preserve behavior for under-tagged cards.

**Warning signs:**
- Some decks show fewer cards than expected (undefined cards excluded by strict filter)
- Some decks show more cards than expected (undefined cards included by loose filter)
- Switching language mid-session shows different card counts than expected

**Phase to address:**
Content authoring phase (when card data schema is defined) and level filter UI phase (the filter function itself must handle missing values defensively).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store level filter as a flat string (`"A1"`) instead of an array | Simpler read/write code | Cannot represent multi-select (A1+A2) without special-casing; need to refactor when multi-select ships | Never — multi-select is in scope from day one |
| Add level filter to the existing progress blob (`it-progress`) | One less localStorage key | Progress reset wipes level preference; level preference read requires progress to be loaded first; tight coupling | Never — keep concerns separate |
| Compute filtered cards independently in each call site (renderDecks, startDeck, getDueCount) | No shared-state complexity | Three implementations of the same filter; any bug requires fixes in three places; badge count and session count can drift | Acceptable for a prototype, never for production |
| Tag only new A1 cards; leave existing cards untagged and treat "no tag" as A2 | No migration needed for card data | Filter logic has a hidden branch; test coverage is harder; a future A3 level requires a second migration | Acceptable if documented explicitly and the defensive fallback is tested |
| Generate foils from full `deck.cards` ignoring level | No change to `generateChoices` API | Beginners see advanced vocabulary in wrong-answer options; near-empty foil pool on small level-filtered decks | Never when fewer than 6 cards per level exist in a deck |

---

## Integration Gotchas

Common mistakes when connecting the level filter to the existing system.

| Integration Point | Common Mistake | Correct Approach |
|-------------------|----------------|------------------|
| `getDueCount` + level filter | Call `getDueCount(deck)` unchanged; add separate filtering in `renderDecks` | Pass the level-filtered card array to `getDueCount` so badge and session use identical logic |
| `generateChoices` + level filter | Pass full `deck` object unchanged | Pass `allowedCards` as the foil pool, equal to the same filtered set used for the session |
| `startDeck` + level filter | Filter card indices inside `startDeck` only | Filter in one shared function called by both `renderDecks` (for badge) and `startDeck` (for session) |
| localStorage level preference + existing progress keys | Read level preference without checking for existing progress | Check progress key first to determine whether the user is new (default A1) or returning (default A1+A2) |
| Language switch + level preference | Level preference stored globally; switching language keeps the same level | Level preference should be per-language or at minimum survive a language switch unchanged; verify the language switch path in `switchLanguage` does not reset level state |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-filtering card array on every card render instead of once per session | Noticeable lag on decks with many cards (future state) | Compute filtered indices once in `startDeck`, store in session state | At 500+ cards per deck; not a concern at current deck sizes (20 cards) |
| Reading localStorage on every due-count calculation during `renderDecks` | Slow deck grid render on low-end mobile | Already exists as a pattern; filtering adds no new reads — level filter is in memory | Not a concern at current scale |

---

## UX Pitfalls

Common user experience mistakes when adding difficulty level selection.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Defaulting to A1 without informing returning users | Users think their progress is gone; trust in the app collapses | Show a one-time notice explaining the new level system and offering to switch to A2 or "All levels" |
| Level filter chips with no visible "active" vs "inactive" state | Users do not know which levels are currently showing; they click a chip and cannot tell if it toggled | Use distinct filled vs outline chip styles; show a summary like "Showing: A1" below the chips |
| Hiding the filter UI when inside a deck session | User cannot see why the card count differs from what the badge showed | The filter is only relevant at the deck-selection screen; no change needed mid-session, but make the deck badge count match exactly |
| "All" chip that deselects both levels (shows nothing) | Empty deck screen with no explanation | If both chips are deselected, either auto-reselect the last active chip, or show a "No cards match this filter" message with a "Show all" CTA |
| Level chips placed too far from deck cards | Users do not associate the filter with the content below it | Place chips directly above the deck grid with a clear label ("Difficulty:") and no visual separation that implies they are for a different feature |
| No empty-state explanation when a filtered deck has 0 due cards | Clicking a deck shows "No cards to study" with no mention of the level filter | In the zero-due-cards alert, add: "All A1 cards in this deck are complete. Switch to A2 to continue." |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Level filter badge counts:** Deck picker badges update correctly when the level filter changes — verify due count uses the same filtered set as the session.
- [ ] **Returning user default:** A user with existing `it-progress` or `es-progress` data defaults to A1+A2 (not A1 only) on first load after the update — verify with a Playwright test that pre-seeds localStorage.
- [ ] **Foil pool respects level:** Quiz distractors are drawn only from cards at the active level(s) — verify no A2 card appears as a foil when the filter is A1 only.
- [ ] **Card key stability:** No existing card's positional index changed after A1 cards were added — verify by checking that `daily_0` in localStorage still maps to the same card `front` text as before.
- [ ] **Level preference persists across sessions:** Close and reopen the browser; the same chips are selected — verify with localStorage read after reload.
- [ ] **Level preference persists across language switch:** Switch from Italian to Spanish and back; the level selection is preserved — verify that `switchLanguage` in `app.js` does not reset the filter.
- [ ] **Missing `level` tag coverage:** Every card in both locale deck files has a `level` property of `"A1"` or `"A2"` — verify with a Vitest data-integrity test.
- [ ] **Empty foil pool graceful handling:** A deck with only 1 or 2 A1 cards does not break the quiz — verify `generateChoices` handles fewer than 3 available foils.
- [ ] **`startDeck` zero-card path is informative:** When all deck cards are filtered out (e.g., A1 filter but deck has only A2 cards), the alert message explains the level filter, not just "No cards due."

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Card index shift corrupts SRS progress | HIGH | Write a one-time migration script that reads old `deckId_index` keys, maps them to new content-hash keys using the new deck array, and rewrites localStorage. Ship as a migration run on first load after deploy. |
| Returning users see empty app (wrong default) | MEDIUM | Deploy a hotfix that checks for existing progress and sets level filter to A1+A2 if progress exists. Add a banner: "We updated your level settings. [Review]" |
| Foil pool bleeds across levels | LOW | Patch `generateChoices` call sites to pass filtered card arrays. No data migration needed. |
| Level preference resets on reload (localStorage bug) | LOW | Fix the sentinel check in the level preference reader. No data migration needed. |
| Missing `level` tags on cards | LOW | Add the missing tags in the deck data files and redeploy. No localStorage migration needed. |
| Due count badge mismatch with session | LOW | Unify the filter call site into a shared helper. No data migration needed. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Card index shift corrupts SRS progress | Content authoring (adding A1 cards) — must append not prepend | Vitest test: import deck file, verify existing card `front` text still maps to original indices; run before and after content addition |
| Returning user default is wrong | Level filter UI — initialization logic | Playwright E2E: seed `it-progress` with data, load page, assert both A1 and A2 chips are active |
| Quiz foils bleed across levels | Level filter UI — `generateChoices` call site update | Vitest unit test: call `generateChoices` with level-filtered allowedCards, assert no foil has a level outside the filter |
| Badge due count mismatches session | Level filter UI — `getDueCount` parameter update | Playwright E2E: activate A1 filter, observe badge count, click deck, assert session card count equals badge count |
| LocalStorage key collision or absent default | Level filter UI — `initLevelFilter` function | Vitest unit test: call `initLevelFilter` with no localStorage data, assert default is A1; call with existing progress data, assert default is A1+A2 |
| Missing `level` tag on cards | Content authoring — schema validation test | Vitest data test: iterate all cards in all locale files, assert `level` is `"A1"` or `"A2"` |
| Empty foil pool on small decks | Level filter UI — `generateChoices` defensive handling | Vitest unit test: call `generateChoices` with a 2-card allowedCards pool, assert it returns fewer than 4 choices without throwing |

---

## Sources

- Direct codebase analysis: `/Users/jbtellez/genies/purolingua/src/js/features/progress.js` — card key scheme is `deckId_cardIndex`, confirmed positional dependency
- Direct codebase analysis: `/Users/jbtellez/genies/purolingua/src/js/utils/deck-utils.js` — `generateChoices` uses full `deck.cards` as foil pool, no level awareness
- Direct codebase analysis: `/Users/jbtellez/genies/purolingua/src/js/core/app.js` — `renderDecks` calls `getDueCount(deck)` with no filter; `startDeck` iterates `deck.cards` directly
- Direct codebase analysis: `/Users/jbtellez/genies/purolingua/src/js/core/i18n.js` — localStorage key `language-learning-locale`; progress keys are `${locale}-progress`
- Pattern: localStorage sentinel bug — documented in MDN Web Docs (JSON.stringify behavior with undefined values); common in vanilla JS apps
- Pattern: content filter default-change regression — known issue in Duolingo, Anki, and other SRS apps when new difficulty tiers are introduced to existing content sets (community discussions on r/languagelearning and Anki forums)
- Pattern: positional card key fragility — common in flashcard apps that use array index as identity before migrating to content-hash or UUID schemes

---

*Pitfalls research for: Adding CEFR A1/A2 level filtering to PuroLingua*
*Researched: 2026-02-22*
