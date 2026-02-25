# Phase 7: Filter Logic - Research

**Researched:** 2026-02-23
**Domain:** Application state management, localStorage persistence, SRS integration (vanilla JS)
**Confidence:** HIGH

---

## Summary

Phase 7 is a logic phase with no UI. The goal is to wire a level filter state (`activeLevels`) through three existing code paths: (1) the due-count badge in `renderDecks()`, (2) the session-start index-building in `startDeck()`, and (3) the foil pool in `generateChoices()`. There are no new libraries to install and no framework to introduce. All work happens inside the existing vanilla JS modules.

The two most consequential decisions are: where `activeLevels` lives (the answer is `state.js`), and how "new user vs. returning user" is detected to set the default. Detection is straightforward — `progress.js` already loads the SRS object from localStorage; a non-empty object means a returning user. The filter default logic runs once at app init before `renderDecks()` is called for the first time.

A separate localStorage key (`{locale}-level-filter`) is needed for persistence, following the exact naming convention already used by `language-learning-locale` and `{locale}-progress`. The `generateChoices()` function in `deck-utils.js` must accept a filtered card array rather than the full `deck` object, or accept an explicit filter parameter — see Architecture Patterns for the preferred approach.

**Primary recommendation:** Add `activeLevels` as a new state variable in `state.js` with its own getter/setter. Add a `loadLevelFilter()` / `saveLevelFilter()` pair in `progress.js` (or a new `filter.js`). Modify `getDueCount()`, `startDeck()`, and `generateChoices()` to accept/respect the active level set.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FLTR-02 | Level filter is multi-select — user can have A1 only, A2 only, or both active simultaneously | `activeLevels` must be a Set or Array, not a single string. All filtering code must support any non-empty subset of `['A1', 'A2']`. |
| FLTR-03 | New users (no prior SRS progress in localStorage) default to A1 only | New user = `progress` object is empty (`{}`) after `loadProgress()`. Default: `activeLevels = ['A1']`. Detection happens once at init. |
| FLTR-04 | Returning users (existing SRS progress detected in localStorage) default to A1+A2 | Returning user = `progress` object has at least one key. Default: `activeLevels = ['A1', 'A2']`. |
| FLTR-05 | Level filter selection persists across browser sessions via localStorage | New storage key: `{locale}-level-filter` (e.g. `it-level-filter`). Read on `loadLevelFilter()`, write on every `setActiveLevels()` call. |
| FLTR-06 | At least one level chip must remain selected — deselecting all is prevented | `setActiveLevels(newLevels)` must reject (silently no-op) if `newLevels.length === 0`. Validation lives in the setter, not the UI layer. |
| FLTR-07 | Due-count badge and study session use the same level filter logic (no count mismatch) | `getDueCount(deck)` and the `tempDueIndices` loop in `startDeck()` must call the same card-filter predicate. Extract a shared `isCardInFilter(card, activeLevels)` helper. |
| FLTR-08 | Quiz answer choices (distractors) are drawn from the level-filtered card pool only | `generateChoices()` currently receives `deck` and uses `deck.cards`. Must be changed to accept a filtered card array, or accept `activeLevels` and filter internally. Preferred: pass a pre-filtered array. |
</phase_requirements>

---

## Existing Code State (Verified by Inspection)

### What exists now — relevant to Phase 7

**`src/js/core/state.js`**
- Manages: `currentDeck`, `currentCardIndex`, `dueCardIndices`, `isQuizAnswered`
- Missing: `activeLevels` — no level filter state exists

**`src/js/features/progress.js`**
- `loadProgress()` — reads `{locale}-progress` from localStorage; sets module-level `progress = {}`
- `getDueCount(deck)` — iterates `deck.cards.forEach((card, index) => ...)` with NO level filter
- `isCardDue(deckId, cardIndex)` — checks SRS date only, no level awareness
- "Returning user" detection: `Object.keys(progress).length > 0` after `loadProgress()` returns non-empty object

**`src/js/utils/deck-utils.js`**
- `generateChoices(correctCard, deck)` — foil pool is `deck.cards.filter(c => c.back !== correctCard.back)` (ALL cards, no level filter)

**`src/js/core/app.js`**
- `initializeApp()` calls `loadProgress()` then `renderDecks()` — this is where `loadLevelFilter()` + `initActiveLevels()` must be inserted
- `renderDecks()` calls `getDueCount(deck)` per deck — must pass active levels for count to match session
- `startDeck(deck)` builds `tempDueIndices` by checking `isCardDue` for every card — must also filter by `card.level`
- `renderCard()` calls `generateChoices(card, getCurrentDeck())` — must become `generateChoices(card, getFilteredCards(getCurrentDeck()))`

### localStorage keys currently in use
| Key | Purpose |
|-----|---------|
| `language-learning-locale` | User's selected language (it/es) |
| `it-progress` | Italian SRS progress object |
| `es-progress` | Spanish SRS progress object |

New key to add: `{locale}-level-filter` (e.g., `it-level-filter`, `es-level-filter`)

---

## Architecture Patterns

### Recommended Project Structure (changes only)

```
src/js/
├── core/
│   └── state.js          ← add activeLevels getter/setter/reset
├── features/
│   └── progress.js       ← add loadLevelFilter() / saveLevelFilter()
├── utils/
│   └── deck-utils.js     ← modify generateChoices() signature
└── (no new files needed)
```

No new files are required. All changes are additive modifications to existing modules.

### Pattern 1: `activeLevels` in `state.js`

**What:** Add `activeLevels` as a module-level variable alongside existing state variables. Expose getter and setter. The setter enforces the FLTR-06 constraint (no-op on empty set).

**When to use:** Consistent with how `dueCardIndices`, `currentDeck`, etc. are managed in this codebase.

```js
// src/js/core/state.js — additions
let activeLevels = ['A1']; // default; overwritten by loadLevelFilter() at init

function getActiveLevels() {
    return activeLevels;
}

function setActiveLevels(levels) {
    if (!levels || levels.length === 0) return; // FLTR-06: silently ignore
    activeLevels = levels;
}
```

Export `getActiveLevels` and `setActiveLevels` alongside existing exports.

### Pattern 2: `loadLevelFilter()` / `saveLevelFilter()` in `progress.js`

**What:** Mirrors the `loadProgress()` / `saveProgress()` pattern already in `progress.js`. Uses a locale-scoped key.

**When to use:** Filters are per-language (a user studying Italian may have different level preferences than when they switch to Spanish — though REQUIREMENTS.md notes "per-language level preference" is out of scope; the locale-scoped key is still correct because the locale-scoped storage keys keep things isolated when the user switches languages).

```js
// src/js/features/progress.js — additions
function getLevelFilterKey() {
    return `${getLocale()}-level-filter`;
}

function loadLevelFilter() {
    try {
        const saved = localStorage.getItem(getLevelFilterKey());
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed; // e.g. ['A1'] or ['A1', 'A2']
            }
        }
    } catch (e) {
        console.warn('Failed to load level filter from localStorage:', e);
    }
    return null; // null = not set yet (caller decides default)
}

function saveLevelFilter(levels) {
    try {
        localStorage.setItem(getLevelFilterKey(), JSON.stringify(levels));
    } catch (e) {
        console.warn('Failed to save level filter to localStorage:', e);
    }
}
```

### Pattern 3: New/Returning User Default Detection

**What:** After `loadProgress()`, inspect whether `progress` has any keys. If empty = new user → default A1. If non-empty = returning user → default A1+A2. Only apply this logic if `loadLevelFilter()` returns `null` (i.e., user has no saved preference yet).

**When to use:** Called once in `initializeApp()`, between `loadProgress()` and `renderDecks()`.

```js
// src/js/core/app.js — in initializeApp(), after loadProgress()
function initActiveLevels() {
    const saved = loadLevelFilter();
    if (saved !== null) {
        // Returning session: restore persisted preference (FLTR-05)
        setActiveLevels(saved);
        return;
    }
    // First session: detect new vs. returning user (FLTR-03, FLTR-04)
    const isReturningUser = hasProgressData(); // see below
    const defaultLevels = isReturningUser ? ['A1', 'A2'] : ['A1'];
    setActiveLevels(defaultLevels);
    saveLevelFilter(defaultLevels);
}
```

`hasProgressData()` needs to be exported from `progress.js`:
```js
// src/js/features/progress.js — addition
function hasProgressData() {
    return Object.keys(progress).length > 0;
}
```

This function is only valid after `loadProgress()` has been called. Call order in `initializeApp()` must be: `loadProgress()` → `initActiveLevels()` → `renderDecks()`.

### Pattern 4: Shared Card Filter Predicate

**What:** A single function that answers "does this card pass the active level filter?" Used by both `getDueCount()` and `startDeck()` to guarantee count parity (FLTR-07).

```js
// Can live in deck-utils.js or progress.js
// This is a pure function — takes card and levels, returns boolean
function cardMatchesFilter(card, activeLevels) {
    return activeLevels.includes(card.level);
}
```

### Pattern 5: Filtered `getDueCount()`

**What:** Modify the existing `getDueCount(deck)` signature to `getDueCount(deck, activeLevels)`. This makes it explicit and testable.

```js
// src/js/features/progress.js
function getDueCount(deck, activeLevels) {
    let count = 0;
    deck.cards.forEach((card, index) => {
        if (activeLevels.includes(card.level) && isCardDue(deck.id, index)) {
            count++;
        }
    });
    return count;
}
```

In `app.js`, the call becomes:
```js
const dueCount = getDueCount(deck, getActiveLevels());
```

### Pattern 6: Filtered `startDeck()`

**What:** In `startDeck()`, the `tempDueIndices` loop must also filter by level. The card-level check must come BEFORE or alongside the `isCardDue` check.

```js
// src/js/core/app.js — startDeck()
const levels = getActiveLevels();
deck.cards.forEach((card, index) => {
    if (levels.includes(card.level) && isCardDue(deck.id, index)) {
        tempDueIndices.push(index);
    }
});
```

### Pattern 7: Filtered `generateChoices()`

**What:** The foil pool must only include cards that match the active level filter (FLTR-08). The cleanest approach is to change `generateChoices(correctCard, deck)` to `generateChoices(correctCard, filteredCards)` where `filteredCards` is the pre-filtered array.

**Why pre-filtered array over passing `activeLevels`:** The caller (`renderCard()`) already knows the active levels and the deck. Pre-filtering at the call site keeps `deck-utils.js` pure (no state dependency). This makes the function easier to unit test.

```js
// src/js/utils/deck-utils.js — modified signature
function generateChoices(correctCard, filteredCards) {
    // filteredCards is the level-filtered subset of deck.cards
    const potentialFoils = filteredCards.filter(c => c.back !== correctCard.back);
    // rest unchanged
}
```

In `app.js`, `renderCard()` becomes:
```js
const activeLevels = getActiveLevels();
const filteredCards = getCurrentDeck().cards.filter(c => activeLevels.includes(c.level));
const choices = generateChoices(card, filteredCards);
```

### Anti-Patterns to Avoid

- **Reading `activeLevels` directly from localStorage in multiple places:** Always go through `state.js` getters after init. Single source of truth.
- **Filtering inline in multiple call sites without a shared predicate:** FLTR-07 requires count parity; if the predicate differs even slightly between `getDueCount` and `startDeck`, counts will diverge. Use the same `activeLevels.includes(card.level)` expression.
- **Initializing `activeLevels` at module declaration time:** The locale is needed to derive the localStorage key, and `loadProgress()` must have run first. Initialize lazily via `initActiveLevels()` in `initializeApp()`, not at module load.
- **Changing `generateChoices` to import from state:** This creates a hidden global dependency. Pass the filtered array explicitly.
- **Applying the new/returning user default every page load:** The default logic (`hasProgressData()`) should only trigger when no saved filter preference exists. Once the user has a saved preference (even as a new user who just started), `loadLevelFilter()` returns non-null and the default is bypassed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-value state persistence | Custom serialization format | `JSON.stringify(['A1', 'A2'])` → `JSON.parse()` | Already used by `progress.js` for the SRS object; consistent and sufficient |
| State validation (empty filter guard) | UI-layer guard only | Setter-level guard in `setActiveLevels()` | Defense in depth; Phase 8 UI calls the same setter; guard only needed once |
| Card pool filtering for quiz | Custom quiz engine | Modify `generateChoices()` parameter | The existing function is correct; only the input changes |

**Key insight:** This phase adds wiring, not new infrastructure. Every pattern needed already exists in the codebase — localStorage load/save in `progress.js`, state getters/setters in `state.js`, card filtering in `deck-utils.js`. Phase 7 extends these patterns; it does not replace them.

---

## Common Pitfalls

### Pitfall 1: Count Mismatch Between Badge and Session
**What goes wrong:** `getDueCount()` and `startDeck()` each filter cards independently with slightly different logic. The badge shows 5 cards due; the session shows 3.
**Why it happens:** Developer adds level filter to one call site but not the other, or uses a different condition expression.
**How to avoid:** Extract `cardMatchesFilter(card, activeLevels)` as a shared predicate. Both call sites use it. Test verifies: count returned by `getDueCount()` equals the number of indices pushed into `tempDueIndices`.
**Warning signs:** Unit test for FLTR-07 fails: `getDueCount(deck, ['A1'])` !== `startDeck` index count.

### Pitfall 2: Filter Default Applied on Every Load
**What goes wrong:** `initActiveLevels()` always checks `hasProgressData()` and overwrites saved preferences. A new user who has studied one session comes back and gets reset to `['A1']` because the saved filter isn't checked first.
**Why it happens:** Developer checks `hasProgressData()` unconditionally.
**How to avoid:** Check `loadLevelFilter()` first. Only fall back to the new/returning user default if `loadLevelFilter()` returns `null`.

### Pitfall 3: Filter Not Reset When User Switches Language
**What goes wrong:** User studies Italian with A1 filter, switches to Spanish, gets the Italian filter state applied to Spanish decks.
**Why it happens:** Filter key is not locale-scoped, so `it-level-filter` bleeds into Spanish.
**How to avoid:** Use `{locale}-level-filter` as the key (matches pattern of `{locale}-progress`). When `switchLanguage()` in `app.js` calls `loadProgress()`, it must also call `loadLevelFilter()` and reset `activeLevels` accordingly.

### Pitfall 4: Foil Pool Too Small After Filtering
**What goes wrong:** User sets filter to `['A2']` only. Deck has 20 A2 cards. `generateChoices()` gets 19 foil candidates — this is fine. But if user sets `['A1']` only and a deck has only 4 A1 cards, `generateChoices()` gets 3 foil candidates — exactly the minimum. If the deck has fewer than 4 cards of the active level, the quiz cannot generate 4 options.
**Why it happens:** Each deck has been verified to have >= 4 cards per level (data-integrity test from Phase 6 enforces this). This pitfall is pre-mitigated by the Phase 6 minimum card requirement.
**How to avoid:** No additional guard needed for this phase given Phase 6 guarantees >= 4 A1 cards per deck. The `startDeck()` already shows an alert if `tempDueIndices.length === 0`. If foils < 3, `generateChoices()` returns fewer than 4 options — this is pre-existing behavior for small decks. Document as a known edge case, do not add new handling in Phase 7.
**Warning signs:** `generateChoices()` returns fewer than 4 options when level filter is active.

### Pitfall 5: Mutation of `activeLevels` Array
**What goes wrong:** Code does `getActiveLevels().push('A2')` instead of `setActiveLevels([...getActiveLevels(), 'A2'])`. The setter guard for empty-array is bypassed and save is never called.
**Why it happens:** The getter returns the live array reference.
**How to avoid:** Getter returns a copy: `return [...activeLevels]`. Or document that callers must use the setter. The setter is the only place `saveLevelFilter()` is called.

### Pitfall 6: Language Switch Forgets to Re-initialize Filter
**What goes wrong:** `switchLanguage()` in `app.js` calls `loadProgress()` and `renderDecks()` but not `initActiveLevels()`. The active levels state stays set to whatever the previous language had — which may be the correct value by coincidence but is not guaranteed.
**Why it happens:** `initActiveLevels()` is only added to `initializeApp()` and the developer forgets `switchLanguage()`.
**How to avoid:** `switchLanguage()` must call `initActiveLevels()` between `loadProgress()` and `renderDecks()`, the same order as `initializeApp()`.

---

## Code Examples

### Full `initializeApp()` call order with new additions

```js
// src/js/core/app.js
function initializeApp() {
    syncURLWithLocale();
    initializeI18n();
    updateLanguageSelectorUI();
    setupLanguageSelector();
    initializeViewElements();
    initializeUIElements();
    loadProgress();           // must come before initActiveLevels
    initActiveLevels();       // NEW: sets activeLevels from storage or user-type default
    renderDecks();            // NOW uses activeLevels for due counts
    setupEventListeners();
    initializeVoices();
    // ... mic button setup unchanged
}
```

### Full `switchLanguage()` with new addition

```js
// src/js/core/app.js
function switchLanguage(localeCode) {
    if (localeCode === getLocale()) return;
    setLocale(localeCode);
    loadProgress();           // load progress for new locale
    initActiveLevels();       // NEW: re-derive filter for new locale
    initializeI18n();
    updateLanguageSelectorUI();
    renderDecks();
    document.getElementById('language-dropdown').classList.add('hidden');
}
```

### `setActiveLevels()` with save and guard

```js
// src/js/core/state.js
function setActiveLevels(levels) {
    if (!levels || levels.length === 0) return; // FLTR-06: silent no-op
    activeLevels = [...levels]; // store a copy to prevent external mutation
    saveLevelFilter(activeLevels); // persist immediately
}
```

Note: `saveLevelFilter` must be imported. Two options: (a) call save from `state.js` by importing `saveLevelFilter` from `progress.js`, or (b) call `saveLevelFilter` from the caller after `setActiveLevels`. Option (b) avoids a circular dependency risk and is preferred — `state.js` stays dependency-free.

Preferred structure:
```js
// A helper in app.js or a new filter.js:
function updateActiveLevels(levels) {
    setActiveLevels(levels);       // updates state (no-ops on empty)
    saveLevelFilter(getActiveLevels()); // persists current value (after guard)
}
```

### `initActiveLevels()` complete

```js
// src/js/core/app.js
function initActiveLevels() {
    const saved = loadLevelFilter();
    if (saved !== null) {
        setActiveLevels(saved);
        return;
    }
    // No saved preference — apply new/returning user default
    const defaultLevels = hasProgressData() ? ['A1', 'A2'] : ['A1'];
    setActiveLevels(defaultLevels);
    saveLevelFilter(defaultLevels);
}
```

---

## State of the Art

| Old Approach (pre-Phase 7) | New Approach (post-Phase 7) | Impact |
|---------------------------|-----------------------------|--------|
| `getDueCount(deck)` counts all cards | `getDueCount(deck, activeLevels)` counts level-filtered cards | Badge count matches session |
| `startDeck()` studies all due cards | `startDeck()` filters by `activeLevels` before building index list | Session respects level filter |
| `generateChoices(card, deck)` draws foils from all cards | `generateChoices(card, filteredCards)` draws foils from level-filtered cards | No cross-level foil contamination |
| No level filter state | `activeLevels` in `state.js` | Single source of truth for filter |
| No filter persistence | `{locale}-level-filter` in localStorage | Filter survives browser close |
| No user-type defaulting | New user = A1 only; returning user = A1+A2 | Correct experience per FLTR-03/04 |

---

## Open Questions

1. **Where should `updateActiveLevels()` (the setter+saver combo) live?**
   - What we know: `state.js` should not import `progress.js` (would create a potential circular dependency since `progress.js` imports `i18n.js`). `app.js` already imports both.
   - What's unclear: Whether to create a thin `filter.js` module or just use a local function in `app.js`.
   - Recommendation: Define `updateActiveLevels()` as a local function in `app.js` for now. Phase 8 will need to call it from chip click handlers, which are also wired in `app.js`. No new module needed.

2. **Should `activeLevels` be locale-scoped in state, or is one global set sufficient?**
   - What we know: The localStorage key is locale-scoped (`it-level-filter`). When the user switches language, `initActiveLevels()` re-reads the locale-specific key.
   - What's unclear: Whether Italian A1+A2 and Spanish A1 should be independent preferences.
   - Recommendation: REQUIREMENTS.md explicitly marks "per-language level preference" as out of scope. The module-level `activeLevels` in `state.js` is a single global; `initActiveLevels()` simply overwrites it on language switch. This is correct behavior.

3. **Should `hasProgressData()` be exported from `progress.js` or derived inline in `initActiveLevels()`?**
   - What we know: `progress` is a module-level variable in `progress.js`; it is not exposed by the current exports.
   - What's unclear: Whether exposing it creates an unwanted dependency.
   - Recommendation: Export `hasProgressData()` from `progress.js`. It is a read-only query with no side effects. This keeps `app.js` free of internal knowledge about how progress is stored.

---

## Testing Strategy

Phase 7 logic is fully unit-testable without a DOM. Recommended test file: `tests/filter-logic.test.js`.

### Tests to write

| Test | What it verifies | Requirement |
|------|-----------------|-------------|
| `setActiveLevels(['A1'])` sets state to `['A1']` | Setter works | FLTR-02 |
| `setActiveLevels([])` is a no-op, state unchanged | Empty guard | FLTR-06 |
| `setActiveLevels(null)` is a no-op | Null guard | FLTR-06 |
| `getDueCount(deck, ['A1'])` counts only A1 cards that are due | Level-scoped count | FLTR-07 |
| `getDueCount(deck, ['A1'])` === number of A1 indices that would enter `startDeck` | Count parity | FLTR-07 |
| `generateChoices(card, a1Cards)` returns only A1 foils | No cross-level foils | FLTR-08 |
| After `loadProgress()` with empty store, `hasProgressData()` returns false | New user detection | FLTR-03 |
| After `loadProgress()` with populated store, `hasProgressData()` returns true | Returning user detection | FLTR-04 |
| `loadLevelFilter()` returns `null` when no key in localStorage | No saved preference | FLTR-05 |
| `saveLevelFilter(['A1'])` + `loadLevelFilter()` round-trips correctly | Persistence | FLTR-05 |
| `initActiveLevels()` defaults new user to `['A1']` | New user default | FLTR-03 |
| `initActiveLevels()` defaults returning user to `['A1', 'A2']` | Returning user default | FLTR-04 |
| `initActiveLevels()` restores `['A2']` if that was saved | Saved preference wins | FLTR-05 |

The existing `tests/vitest.setup.js` already mocks localStorage with full get/set/clear support — no additional test infrastructure needed.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `src/js/core/state.js` — confirmed module-level state pattern; no activeLevels exists
- Direct inspection of `src/js/features/progress.js` — confirmed `getDueCount()` iterates all cards; `loadProgress()` / `saveProgress()` pattern; `{locale}-progress` key format
- Direct inspection of `src/js/utils/deck-utils.js` — confirmed `generateChoices()` takes `(correctCard, deck)` and uses `deck.cards` for foil pool
- Direct inspection of `src/js/core/app.js` — confirmed `initializeApp()` call order; `startDeck()` loop; `renderDecks()` badge logic; `switchLanguage()` function
- Direct inspection of `src/js/core/i18n.js` — confirmed `LOCALE_STORAGE_KEY = 'language-learning-locale'` pattern; `getLocale()` available
- Direct inspection of `tests/vitest.setup.js` — confirmed localStorage mock available; `beforeEach` clear
- Direct inspection of `vitest.config.js` — confirmed `include: ['tests/**/*.test.js']`
- Direct inspection of `tests/progress.test.js` and `tests/deck-utils.test.js` — confirmed test patterns

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — FLTR-02 through FLTR-08 definitions
- `.planning/STATE.md` — "Returning users default to A1+A2; new users default to A1 only" decision; "One shared SRS track across levels"
- `.planning/ROADMAP.md` — Phase 7 success criteria and dependency on Phase 6

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — vanilla JS only; no new libraries; confirmed by project constraints
- Architecture: HIGH — verified against actual source; all call sites identified
- State pattern: HIGH — mirrors existing `state.js` pattern exactly
- localStorage persistence: HIGH — mirrors existing `progress.js` load/save pattern exactly
- User-type detection: HIGH — `progress` object inspection is definitive and simple
- Pitfalls: HIGH — derived from reading actual code paths that must be modified

**Research date:** 2026-02-23
**Valid until:** Stable — source files only change when intentionally edited; no external dependencies
