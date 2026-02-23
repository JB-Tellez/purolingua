# Project Research Summary

**Project:** PuroLingua — CEFR Level Filtering (v1.1)
**Domain:** Content difficulty filtering for a vanilla JS browser-based flashcard / SRS language learning app
**Researched:** 2026-02-22
**Confidence:** HIGH

## Executive Summary

PuroLingua v1.1 adds CEFR A1/A2 difficulty level filtering to an existing, fully-shipped vanilla JS flashcard app. The feature is scoped to a single milestone: tag all existing 160 cards as A2, author ~320 new A1 cards across 8 decks for both Spanish and Italian, add level filter chips to the deck-selection screen, and wire filter state through the rendering and SRS due-count logic. No new libraries or frameworks are needed — every required capability already exists in the codebase (localStorage, DOM manipulation, array iteration, Vitest, Playwright).

The recommended approach is a three-phase delivery: content and data first (tag cards, author A1 content), then filter logic (state, filtering utilities, due-count integration), then filter UI (chip rendering, toggle events, persistence initialization). This order is critical because the SRS system uses positional card indices as storage keys — A1 cards must be appended to the end of deck arrays, never inserted before existing cards, or all returning users' progress is silently corrupted. The content phase must be completed and verified before the logic phase begins to ensure correct SRS key stability.

The dominant risk across all research is the interaction between the new default level (A1 only) and existing returning users who have only A2 content in their progress. A fresh-start default of A1 will show zero cards to any returning user on first load after the update. The mitigation is an explicit first-run check: if prior SRS progress exists in localStorage, default the level filter to A1+A2 rather than A1 only. A secondary risk is foil pool contamination in quiz mode — `generateChoices` uses the full deck card array for distractors, and must be updated to use only level-filtered cards to prevent beginners from seeing A2 vocabulary as wrong-answer options.

## Key Findings

### Recommended Stack

No additions to the existing stack are required for v1.1. Every capability — data tagging, filter state, UI rendering, persistence — is already present in the codebase. The existing stack is Vanilla JS (ES Modules, ES2022), Vite 6, Vitest 4 (jsdom), and Playwright 1.58. The localStorage pattern from `progress.js` and the DOM manipulation pattern from the language dropdown are the exact templates to follow for level filter state and chip rendering respectively.

**Core technologies:**
- Vanilla JS (ES Modules): all application logic — explicitly constrained; no framework additions permitted
- localStorage (browser-native): level preference persistence — follow `${locale}-progress` key pattern; use a new global key `purolingua-level-pref`
- Vitest (jsdom): unit tests for filter utility and data-integrity assertion on card schema
- Playwright: E2E tests for the returning-user default behavior and badge-count accuracy using `addInitScript` localStorage seeding

### Expected Features

The v1.1 feature set is tightly defined. All items below are required for a coherent release; omitting any one of them produces a broken or misleading user experience.

**Must have (table stakes):**
- `level` property (`"A1"` or `"A2"`) on all card objects — prerequisite for all filtering; pure data edit
- A1 phrase content for all 8 decks in both languages (~320 cards total) — without this, the filter has nothing to show
- Level filter chips (A1 / A2, multi-select) above the deck grid, defaulting to A1 for new users — user-facing access to the feature
- `renderDecks()` and `getDueCount()` updated to use level-filtered card sets — accurate deck badge counts
- `startDeck()` updated to iterate only level-matching cards using original indices — accurate study sessions
- Level preference persisted to and loaded from localStorage — returning users retain their selection
- Guard preventing all chips from being deselected — prevents the empty-deck dead end

**Should have (competitive):**
- One shared SRS track across levels (no separate progress per level) — users advancing from A1 to A2 keep all existing progress; no other consumer app does this without accounts
- Zero-friction chip placement inline above the deck grid — no settings screen required; matches the app's open-and-learn philosophy
- Returning-user first-run migration: default to A1+A2 if prior progress exists, A1 only for fresh users

**Defer (v2+):**
- B1/B2/C1/C2 content — requires domain expansion beyond traveler vocabulary; architecture supports it but content effort is out of scope
- Level-based onboarding placement quiz — only warranted if data shows users selecting wrong level
- Level progress bar / mastery percentage — scope creep; due-count badge already conveys remaining work
- Cross-device sync — blocked by no-backend constraint

### Architecture Approach

The v1.1 architecture is purely additive: no new files, no new modules, no new framework patterns. All changes extend existing files by following the patterns already established in those files. `state.js` gains `activeLevels` state and a `loadActiveLevels()` initializer (mirrors how `i18n.js` handles locale preference). `deck-utils.js` gains a `filterDeckByLevels()` utility. `app.js` gains `renderLevelChips()`, `toggleLevel()`, and `getDueCountForLevels()`, and modifies `renderDecks()` and `startDeck()`. The critical architectural constraint is SRS index stability: level filtering must happen by iterating the original card array with an index-aware level check, never by slicing the array and re-indexing it.

**Major components:**
1. `core/state.js` — holds `activeLevels` session state; initializes from localStorage; exposes `getActiveLevels()` / `setActiveLevels()`
2. `core/app.js` — orchestrates chip rendering, toggle events, and passes level filter into all deck rendering and session-start code paths
3. `utils/deck-utils.js` — provides `filterDeckByLevels()` for display-context filtering; filter function used in badge count calculation
4. `locales/*/decks.js` — card data arrays; gains `level: 'A1'` or `level: 'A2'` on every card object; A1 cards appended to end of each array
5. `localStorage` — `purolingua-level-pref` key (global, not per-language) stores the active level array as JSON

### Critical Pitfalls

1. **Card index shift corrupts SRS progress** — append A1 cards to the END of each deck array; never insert before or between existing cards. Verify with a Vitest test that existing card `front` text still maps to the same positional index after content addition.

2. **Returning-user default shows empty app** — on first load after the update, check if `it-progress` or `es-progress` exists; if it does, default level filter to A1+A2 rather than A1 only. Test this path with a Playwright test that pre-seeds localStorage.

3. **Quiz foil pool bleeds across levels** — update `generateChoices` call sites to pass the level-filtered card array as the foil pool, not the full `deck.cards`. Each deck must have at least 4 cards per level to ensure a valid 4-choice quiz.

4. **Badge due count mismatches session card count** — `getDueCount()` and `startDeck()` must use identical filter logic. Implement `getDueCountForLevels()` as a shared helper callable from both sites to ensure the badge always matches what the deck will actually show.

5. **localStorage sentinel bug resets level preference** — use `raw !== null ? JSON.parse(raw) : deriveDefault()` pattern; never use `JSON.parse(raw) || DEFAULT` because an empty array `[]` is falsy and will silently override a valid stored preference.

## Implications for Roadmap

Based on combined research findings, this milestone maps cleanly to three sequential phases with a hard dependency order driven by the SRS index-stability constraint.

### Phase 1: Content and Data Layer

**Rationale:** Card data must be tagged before any filter logic can be written or tested. The append-only constraint for new A1 cards is a one-time decision that, if made wrong, requires a localStorage migration to recover — it must be enforced before any content is authored. This phase can be done without code changes.

**Delivers:** All 160 existing cards tagged `level: "A2"`, approximately 320 new A1 cards added to the end of all 8 deck arrays for both Spanish and Italian, and a Vitest data-integrity test confirming every card has a valid `level` property.

**Addresses:** `level` property on all cards (table stakes P1), A1 content for all decks (table stakes P1)

**Avoids:** Card index shift pitfall (append-only constraint); missing level tag silent exclusion pitfall (data-integrity test in CI)

### Phase 2: Filter Logic

**Rationale:** Filter state and SRS integration must be built before the UI so that logic can be unit-tested in isolation. The index-stability problem in `startDeck()` is the highest-risk code change in the milestone — it should be built and verified with tests before any UI wiring is added.

**Delivers:** `activeLevels` state in `state.js` with localStorage persistence, `getDueCountForLevels()` helper, updated `startDeck()` with level-aware card iteration, and updated `renderDecks()` passing level filter into due-count calculation. Unit tests covering single-level filter, multi-level filter, and graceful handling of cards with no `level` field.

**Uses:** Existing `localStorage.getItem` / `setItem` pattern from `progress.js`; existing `Array.prototype.forEach` iteration in `startDeck()` and `getDueCount()`

**Implements:** `core/state.js` additions, `app.js` logic modifications, `utils/deck-utils.js` `filterDeckByLevels()` export

**Avoids:** Badge-session mismatch pitfall (shared filter helper); localStorage sentinel bug (explicit `raw !== null` check); returning-user default bug (first-run detection logic lives here)

### Phase 3: Filter UI and Polish

**Rationale:** UI is built last because it depends on the logic layer being complete and tested. Chip rendering, toggle events, and localStorage initialization for level preference are all straightforward once the state API (`getActiveLevels`, `setActiveLevels`) is in place.

**Delivers:** Level filter chip container in `index.html`, `.level-chip` and `.level-chip.active` CSS styles, `renderLevelChips()` and `toggleLevel()` in `app.js`, UI label strings in `it/ui.js` and `es/ui.js`, and Playwright E2E tests for returning-user default, badge accuracy, chip toggle persistence, and language-switch level preservation.

**Avoids:** Event listener leak pitfall (chips built once in `initializeApp()`, not inside `renderDecks()`); quiz foil pool bleed (update `generateChoices` call sites to pass filtered card array in this phase); all-chips-deselected dead end (toggle guard in `toggleLevel()`)

### Phase Ordering Rationale

- Content before logic because the filter functions cannot be meaningfully tested against empty or untagged card data.
- Logic before UI because `startDeck()` and `getDueCount()` changes carry the highest risk of silent regression and need isolated unit testing before event wiring is layered on top.
- The append-only content constraint must be communicated and enforced before Phase 1 begins — it is the only irreversible decision in the milestone.
- The returning-user default detection belongs in Phase 2 (filter logic) because it is a conditional in the localStorage initialization function, not a UI concern.

### Research Flags

Phases with standard, well-documented patterns (no additional research needed):
- **Phase 1 (Content):** Straightforward data authoring and schema extension. CEFR A1 characteristics are a stable international standard. The append-only array constraint is confirmed from codebase analysis.
- **Phase 2 (Logic):** All patterns are direct extensions of existing code in `state.js`, `progress.js`, and `app.js`. No novel integration surfaces.
- **Phase 3 (UI):** Chip rendering follows the exact pattern of the existing language dropdown. No framework, no new tooling.

No phases require `/gsd:research-phase` during planning. All patterns are either established in the existing codebase or grounded in a stable international standard (CEFR).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on direct codebase inspection; no new dependencies needed; all tools confirmed in use |
| Features | HIGH | CEFR is a stable international standard; existing card content analyzed directly; PROJECT.md spec reviewed |
| Architecture | HIGH | All integration points confirmed by direct source inspection of every modified file |
| Pitfalls | HIGH | Derived from direct codebase analysis of the actual key schemes, function signatures, and call sites |

**Overall confidence:** HIGH

### Gaps to Address

- **A1 content linguistic quality:** The CEFR A1 definition and example phrases in FEATURES.md are HIGH confidence by standard, but specific phrase selections are synthesized from training knowledge rather than validated by a native speaker or certified CEFR assessor. Recommend linguistic review of authored A1 cards before shipping, particularly for Italian (Spanish examples are more extensively documented in training data). This is a content quality concern, not an architectural one — it does not block Phase 2 or 3.

- **Foil pool minimum per deck:** FEATURES.md and PITFALLS.md both flag that `generateChoices` requires at least 4 cards in the foil pool for a standard 4-option quiz. Exactly 20 A1 cards per deck per language is the stated target. If any deck ends up with fewer than 4 A1 cards after authoring, the quiz will degrade to fewer answer options. Track card counts per deck during Phase 1 content authoring; add a Vitest assertion that each deck has at least 4 cards per level.

- **Language switch and level state interaction:** PITFALLS.md flags that `switchLanguage()` in `app.js` should be audited to confirm it does not inadvertently reset `activeLevels` during a language switch. This is a low-effort verification (read the function) that should happen at the start of Phase 3.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `src/js/core/app.js`, `src/js/core/state.js`, `src/js/features/progress.js`, `src/js/utils/deck-utils.js`, `src/js/core/i18n.js` — confirmed all integration points, key schemes, and call sites
- Direct codebase inspection: `src/locales/it/decks.js`, `src/locales/es/decks.js` — confirmed existing card schema (no `level` field), existing A2 characteristic content
- Direct codebase inspection: `index.html`, `e2e/deck-selection.spec.js` — confirmed DOM structure and E2E localStorage seeding pattern
- `.planning/PROJECT.md` — confirmed "vanilla JS only" constraint and v1.1 feature scope
- CEFR (Common European Framework of Reference for Languages) — Council of Europe international standard; A1/A2 level descriptors are stable and well-documented

### Secondary (MEDIUM confidence)
- Competitor patterns (Duolingo, Babbel level selection UX) — based on training knowledge; sufficient for feature positioning decisions, not for implementation guidance

### Tertiary (LOW confidence)
- Specific A1 phrase selections for Italian — synthesized from training knowledge of CEFR word lists; recommend native speaker review before content ships

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
