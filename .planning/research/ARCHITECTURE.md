# Architecture Research

**Domain:** CEFR level filtering integration into vanilla JS language learning app
**Researched:** 2026-02-22
**Confidence:** HIGH — based on direct source inspection of all existing modules

## Standard Architecture

### System Overview (Existing + CEFR Changes)

```
┌─────────────────────────────────────────────────────────────────┐
│                          index.html                              │
│   deck-selection view          flashcard-view                   │
│   ┌──────────────────────┐                                      │
│   │  [NEW] Level Chips   │  A1  A2                              │
│   │  deck-grid           │  <-- rendered by renderDecks()       │
│   └──────────────────────┘                                      │
├─────────────────────────────────────────────────────────────────┤
│                       src/js/core/app.js                         │
│   renderDecks()    startDeck()    renderCard()                  │
│   [MOD]            [no change]    [no change]                   │
├──────────────┬──────────────────────────────────────────────────┤
│  core/       │  features/              utils/                   │
│  state.js    │  progress.js            deck-utils.js            │
│  [MOD]       │  [no change]            [MOD] filterByLevel()   │
│              │                                                   │
│  i18n.js     │  ui.js  audio.js                                 │
│  [no change] │  [no change]                                     │
├──────────────┴──────────────────────────────────────────────────┤
│                     localStorage                                 │
│   it-progress   es-progress   [NEW] purolingua-level-pref      │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Change for v1.1 |
|-----------|----------------|-----------------|
| `core/state.js` | In-session card/deck state | Add `activeLevels` set (`['A1']` default) + getter/setter |
| `core/app.js` | Orchestration, render, events | Render level chips, pass level filter into renderDecks/startDeck |
| `utils/deck-utils.js` | Shuffle, choice generation | Add `filterDeckByLevels(deck, levels)` function |
| `features/progress.js` | Leitner SRS, localStorage | No change — card keys are stable index-based |
| `locales/*/decks.js` | Card data arrays | Add `level: 'A1'` or `level: 'A2'` to every card object |
| `locales/*/ui.js` | UI strings | Add level chip label strings |
| `index.html` | DOM structure | Add level filter chip container in deck-selection section |

## Recommended Project Structure

No new files are required. All changes are additive modifications to existing files.

```
src/
├── js/
│   ├── core/
│   │   ├── app.js          # MOD: level chip render + event handler + pass filter to renderDecks
│   │   ├── state.js        # MOD: add activeLevels state + getActiveLevels/setActiveLevels
│   │   ├── i18n.js         # no change
│   │   └── views.js        # no change
│   ├── features/
│   │   ├── progress.js     # no change — SRS tracks all cards regardless of level
│   │   ├── audio.js        # no change
│   │   ├── ui.js           # no change
│   │   └── voice.js        # no change
│   └── utils/
│       └── deck-utils.js   # MOD: add filterDeckByLevels() export
├── locales/
│   ├── it/
│   │   ├── decks.js        # MOD: add level: 'A1'|'A2' to every card object
│   │   └── ui.js           # MOD: add deckSelection.levelFilter strings
│   └── es/
│       ├── decks.js        # MOD: add level: 'A1'|'A2' to every card object
│       └── ui.js           # MOD: add deckSelection.levelFilter strings
├── css/
│   └── style.css           # MOD: add .level-filter, .level-chip, .level-chip.active styles
└── index.html              # MOD: add level chip container in #deck-selection
```

### Structure Rationale

- **No new files:** The existing module boundaries cleanly absorb all new concerns. Creating a new `levels.js` module would be over-engineering for a two-value filter.
- **`deck-utils.js` for filtering:** Deck manipulation already lives here (shuffle, choices). Level filtering is deck manipulation.
- **`state.js` for activeLevels:** Session-level filter state belongs alongside `currentDeck`, `dueCardIndices`. It is not progress (doesn't belong in `progress.js`) and not locale (doesn't belong in `i18n.js`).
- **`localStorage` with separate key:** Level preference is global (not per-language), so a single key `purolingua-level-pref` avoids duplicating the preference for each locale. This is separate from `it-progress` and `es-progress` which are language-scoped SRS data.

## Architectural Patterns

### Pattern 1: Filtered Deck View — Derive, Don't Mutate

**What:** When a user changes the level filter, do NOT modify the source deck data. Re-derive a filtered view of the deck at render time.

**When to use:** Every time `renderDecks()` is called and every time `startDeck()` runs.

**Trade-offs:** Slightly more computation on each render; zero data integrity risk. Source decks stay authoritative. Worth it.

**Example:**

```javascript
// In deck-utils.js — NEW function
function filterDeckByLevels(deck, activeLevels) {
    // activeLevels is an array like ['A1'] or ['A1', 'A2']
    if (!activeLevels || activeLevels.length === 0) return deck;
    return {
        ...deck,
        cards: deck.cards.filter(card => activeLevels.includes(card.level))
    };
}

// In app.js — renderDecks() modification
function renderDecks() {
    deckGrid.innerHTML = '';
    const levels = getActiveLevels(); // from state.js
    getDecks().forEach(deck => {
        if (!deck.theme) return;
        const filteredDeck = filterDeckByLevels(deck, levels); // new
        const dueCount = getDueCount(filteredDeck);             // pass filtered deck
        // ... render card using filteredDeck ...
        card.addEventListener('click', () => startDeck(filteredDeck)); // pass filtered deck
    });
}
```

### Pattern 2: Level State in `state.js` with localStorage Initialization

**What:** `activeLevels` is a module-level variable in `state.js`, initialized from localStorage on module load. A `setActiveLevels()` setter writes back to localStorage immediately.

**When to use:** This matches how `i18n.js` handles locale preference — module-level variable, localStorage-backed, initialized at import time.

**Trade-offs:** Initialization happens at module load, not `DOMContentLoaded`. Acceptable because localStorage is synchronous.

**Example:**

```javascript
// In state.js — additions

const LEVEL_PREF_KEY = 'purolingua-level-pref';

function loadActiveLevels() {
    try {
        const saved = localStorage.getItem(LEVEL_PREF_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Validate: must be array containing 'A1' and/or 'A2'
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        // ignore
    }
    return ['A1']; // default: A1 only
}

let activeLevels = loadActiveLevels();

function getActiveLevels() {
    return activeLevels;
}

function setActiveLevels(levels) {
    activeLevels = levels;
    try {
        localStorage.setItem(LEVEL_PREF_KEY, JSON.stringify(levels));
    } catch (e) {
        console.warn('Failed to save level preference:', e);
    }
}
```

### Pattern 3: Level Chip UI — Inline DOM, No Framework

**What:** Level filter chips are rendered once in `initializeApp()` (not in `renderDecks()`, which runs repeatedly). Chip click handlers call `setActiveLevels()` then `renderDecks()`.

**When to use:** This matches how the language selector is wired — built once during init, triggers re-render.

**Trade-offs:** Chip DOM must be built before `renderDecks()` first runs. Ordering in `initializeApp()` matters.

**Example:**

```javascript
// In app.js

function renderLevelChips() {
    const container = document.getElementById('level-filter');
    if (!container) return;
    container.innerHTML = '';
    const levels = ['A1', 'A2'];
    levels.forEach(level => {
        const chip = document.createElement('button');
        chip.className = 'level-chip' + (getActiveLevels().includes(level) ? ' active' : '');
        chip.textContent = level;
        chip.addEventListener('click', () => toggleLevel(level));
        container.appendChild(chip);
    });
}

function toggleLevel(level) {
    const current = getActiveLevels();
    let next;
    if (current.includes(level)) {
        // Don't allow deselecting both — always keep at least one
        if (current.length === 1) return;
        next = current.filter(l => l !== level);
    } else {
        next = [...current, level];
    }
    setActiveLevels(next);
    renderLevelChips(); // update active class
    renderDecks();      // re-render deck list with new filter
}
```

## Data Flow

### Level Filter Change Flow

```
User clicks level chip (A1 or A2)
    ↓
toggleLevel(level) in app.js
    ↓
setActiveLevels(next) in state.js
    → writes 'purolingua-level-pref' to localStorage
    ↓
renderLevelChips() — updates .active class on chips
    ↓
renderDecks()
    ↓
  for each deck:
    filterDeckByLevels(deck, activeLevels) in deck-utils.js
        → returns { ...deck, cards: [only matching level cards] }
    getDueCount(filteredDeck) in progress.js
        → unchanged: still iterates card indices, checks SRS dates
    startDeck(filteredDeck) on click
        → unchanged: iterates filteredDeck.cards for due indices
```

### SRS Index Stability Problem and Solution

This is the critical architectural constraint. Card indices in `progress.js` are stored as `{deckId}_{cardIndex}` where `cardIndex` is position in the original `deck.cards` array. Filtering before passing to `startDeck()` would break this — index 0 of the filtered deck is NOT the same card as index 0 of the source deck.

**Solution:** `filterDeckByLevels()` must preserve original indices. Do not use `Array.filter()` directly to produce `filteredDeck.cards`. Instead, produce a "filtered indices" list and use that within `startDeck()`.

The actual fix: `startDeck()` already computes due indices by iterating `deck.cards` and calling `isCardDue(deck.id, index)`. To apply level filtering here, add a level check:

```javascript
// In app.js — startDeck() modification
function startDeck(deck) {
    setCurrentDeck(deck);
    const levels = getActiveLevels();
    const tempDueIndices = [];
    deck.cards.forEach((card, index) => {
        // Level filter applied here, on original indices
        const levelMatch = !card.level || levels.includes(card.level);
        if (levelMatch && isCardDue(deck.id, index)) {
            tempDueIndices.push(index);
        }
    });
    // ... rest unchanged
}
```

This way `getDueCount()` and `renderDecks()` also need the same pattern — pass the full original deck but filter on `card.level` during iteration. The `filteredDeck` spread approach in `renderDecks()` is fine for display purposes (badge count), but `startDeck()` must operate on original card indices.

**Revised data flow for `getDueCount()`:**

```javascript
// Wrapper in app.js (or a new deck-utils function)
function getDueCountForLevels(deck, levels) {
    let count = 0;
    deck.cards.forEach((card, index) => {
        const levelMatch = !card.level || levels.includes(card.level);
        if (levelMatch && isCardDue(deck.id, index)) count++;
    });
    return count;
}
```

This avoids touching `progress.js` at all — SRS keys remain `{deckId}_{originalIndex}` throughout the lifetime of the app.

### Key Data Flows

1. **App init:** `loadActiveLevels()` runs when `state.js` is imported → `activeLevels` set from localStorage before `renderDecks()` is called.
2. **Language switch:** `switchLanguage()` calls `renderDecks()` which already reads `getActiveLevels()` — level filter persists across language switches with zero extra code.
3. **Progress reset:** `resetAllProgress()` clears `{locale}-progress` keys — it does NOT touch `purolingua-level-pref`. Level preference survives a progress reset. This is the correct behavior.

## Scaling Considerations

This is a client-only app — traditional backend scaling does not apply.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 2 levels (A1/A2) | Current approach: chip array, array filter — trivially adequate |
| 4+ levels (B1, B2...) | Same approach still works up to ~6 levels with no changes |
| Level-specific SRS tracks | Would require changing progress key scheme from `{deckId}_{index}` to `{deckId}_{level}_{index}` — migration logic needed; out of scope for v1.1 |

### Scaling Priorities

1. **First concern (now):** Index stability — solved by filtering at iteration time, not by slicing the array.
2. **Future concern:** If levels proliferate and users want separate SRS tracks per level, the progress key scheme would need versioned migration. Not needed for v1.1.

## Anti-Patterns

### Anti-Pattern 1: Filtering the Cards Array Before SRS Operations

**What people do:** `deck.cards = deck.cards.filter(c => levels.includes(c.level))` then pass the mutated deck to `isCardDue()` and `updateCardProgress()`.

**Why it's wrong:** `progress.js` uses `cardIndex` (array position) as part of the storage key (`daily_0`, `daily_4`, etc.). After filtering, card at index 0 is no longer the same card. SRS data is now attributed to the wrong card permanently.

**Do this instead:** Filter at the iteration level inside `startDeck()` and `getDueCountForLevels()`. Keep `deck.cards` arrays immutable and in original order.

### Anti-Pattern 2: Storing Level Preference Inside the Language Progress Key

**What people do:** Add `activeLevels` to the `it-progress` or `es-progress` localStorage objects alongside SRS card data.

**Why it's wrong:** Level preference is language-agnostic (the user wants A1 regardless of whether they are studying Italian or Spanish). Storing it per-language means switching languages resets or fragments the level preference.

**Do this instead:** Single `purolingua-level-pref` key — language-independent, app-global.

### Anti-Pattern 3: Re-rendering Level Chips Inside `renderDecks()`

**What people do:** Build level chip DOM elements inside the `renderDecks()` loop or call it on every deck render.

**Why it's wrong:** `renderDecks()` is called on every language switch, progress reset, and navigation home. This would re-attach event listeners on every call, leaking listeners and degrading performance.

**Do this instead:** Build chips once in `renderLevelChips()`, called from `initializeApp()`. Chips only need to be re-rendered when `activeLevels` changes (inside `toggleLevel()`).

## Integration Points

### Modified Files Summary

| File | Type | Change |
|------|------|--------|
| `src/js/core/state.js` | Modify | Add `activeLevels`, `loadActiveLevels()`, `getActiveLevels()`, `setActiveLevels()` + export |
| `src/js/core/app.js` | Modify | Add `renderLevelChips()`, `toggleLevel()`, `getDueCountForLevels()`, modify `renderDecks()` and `startDeck()` |
| `src/js/utils/deck-utils.js` | Modify | Add `filterDeckByLevels()` export (used only for display counts if needed) |
| `src/locales/it/decks.js` | Modify | Add `level: 'A1'` or `level: 'A2'` to every card; add new A1 cards |
| `src/locales/es/decks.js` | Modify | Same as Italian decks |
| `src/locales/it/ui.js` | Modify | Add `deckSelection.levelFilterLabel`, `deckSelection.levelA1`, `deckSelection.levelA2` |
| `src/locales/es/ui.js` | Modify | Same UI strings in Spanish |
| `src/css/style.css` | Modify | Add `.level-filter`, `.level-chip`, `.level-chip.active` styles |
| `index.html` | Modify | Add `<div id="level-filter" class="level-filter"></div>` inside `#deck-selection` |

### Internal Module Boundaries After v1.1

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `app.js` → `state.js` | Direct import call | `getActiveLevels()` / `setActiveLevels()` added to existing import list |
| `app.js` → `deck-utils.js` | Direct import call | `filterDeckByLevels()` added to existing import |
| `state.js` → `localStorage` | Synchronous read/write | `purolingua-level-pref` key — separate from all `{locale}-progress` keys |
| `progress.js` | Unchanged | No new dependencies; SRS key scheme unchanged |
| `i18n.js` | Unchanged | Level chip labels come from `t()` using new ui.js keys |

## Suggested Build Order

1. **Card data first:** Add `level` property to all existing cards in `it/decks.js` and `es/decks.js`. Tag all current cards as `A2`. Verify no existing tests break — `generateChoices()` tests use mock decks without `level` fields and will still pass because level is opt-in.

2. **State layer:** Add `activeLevels` variable, `loadActiveLevels()`, `getActiveLevels()`, `setActiveLevels()` to `state.js`. No UI impact yet — verifiable in isolation.

3. **Utility layer:** Add `filterDeckByLevels()` to `deck-utils.js`. Write unit tests for it (filter by single level, filter by multiple levels, handle cards without `level` field gracefully).

4. **Progress counting:** Add `getDueCountForLevels()` in `app.js` (or `deck-utils.js`). This gates the correct deck badge counts.

5. **startDeck() filter:** Modify `startDeck()` to skip cards not matching `activeLevels`. This is the core SRS-safe integration point — existing E2E tests should still pass since existing cards are now tagged A2 and the default filter is A1 (which would show 0 cards). **Test this carefully** — temporarily set default to `['A1', 'A2']` for smoke testing existing flows, then restore to `['A1']`.

6. **HTML + CSS:** Add level chip container to `index.html`, add styles to `style.css`.

7. **Chip rendering + toggle:** Add `renderLevelChips()` and `toggleLevel()` to `app.js`, wire into `initializeApp()`. Call `renderLevelChips()` before first `renderDecks()` call.

8. **A1 content:** Add A1 phrase cards to all 8 decks for both languages. These are tagged `level: 'A1'` and immediately appear for new users (default filter).

9. **UI strings:** Add level label strings to `it/ui.js` and `es/ui.js`.

## Sources

- Direct source inspection: `/Users/jbtellez/genies/purolingua/src/js/core/state.js` — confirmed module-level variable pattern
- Direct source inspection: `/Users/jbtellez/genies/purolingua/src/js/features/progress.js` — confirmed `{deckId}_{cardIndex}` key scheme; identified index-stability constraint
- Direct source inspection: `/Users/jbtellez/genies/purolingua/src/js/core/app.js` — confirmed `renderDecks()`, `startDeck()` call sites and data flow
- Direct source inspection: `/Users/jbtellez/genies/purolingua/src/js/core/i18n.js` — confirmed localStorage preference pattern used as template for level pref
- Direct source inspection: `/Users/jbtellez/genies/purolingua/src/locales/it/decks.js` — confirmed current card schema (no `level` field yet)
- Direct source inspection: `/Users/jbtellez/genies/purolingua/tests/deck-utils.test.js` — confirmed test mock decks don't use `level`, so adding opt-in `level` field won't break existing tests

---
*Architecture research for: CEFR level filtering in PuroLingua v1.1*
*Researched: 2026-02-22*
