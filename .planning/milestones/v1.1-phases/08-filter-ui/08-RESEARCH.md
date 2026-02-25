# Phase 8: Filter UI - Research

**Researched:** 2026-02-23
**Domain:** Vanilla JS DOM manipulation, CSS chip component, i18n string integration
**Confidence:** HIGH

---

## Summary

Phase 8 is a pure UI phase. All filter logic — state management, persistence, the FLTR-06 "at least one chip" guard, and the `updateActiveLevels()` coordinator — was completed in Phase 7 and is already wired and tested. Phase 8 adds the visible surface: two chip buttons (A1, A2) above the deck grid, styled to show active vs. inactive state, hooked into the existing `updateActiveLevels()` function, and labeled from the i18n system.

The implementation touches four locations: (1) `index.html` — add the chip container element; (2) `src/css/style.css` — add chip styles; (3) both locale `ui.js` files (`it/ui.js` and `es/ui.js`) — add `filters.levelA1` and `filters.levelA2` keys; and (4) `src/js/core/app.js` — wire chip click handlers and re-render chips on language switch. No new JS modules are needed.

The two requirements are tightly coupled: FLTR-01 (chip visibility and toggle behavior) and FLTR-09 (i18n labels). They share the same HTML element and can be delivered in a single plan or in two sequential plans (DOM+CSS first, then event wiring). The critical integration point is `renderDecks()` — it must also update chip visual state whenever it runs, because language switch calls `renderDecks()` after `initActiveLevels()` may have changed state.

**Primary recommendation:** Add a `<div id="level-filter">` container with two `<button>` chips before `<div class="deck-grid">` in `index.html`. Style `.filter-chip` and `.filter-chip.active` in CSS. Add `filters: { levelA1: 'A1', levelA2: 'A2' }` (or equivalent native-language labels) to both locale `ui.js` files. Wire chip click handlers in `app.js` using `updateActiveLevels()`, and call `renderFilterChips()` from `renderDecks()`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FLTR-01 | User can filter decks by level using A1/A2 chips on the deck screen | Chips are `<button>` elements in a container above `#deck-grid`. Clicking calls `updateActiveLevels()` (already in app.js). Visual active state driven by `getActiveLevels()`. Deck grid updates via existing `renderDecks()` call. |
| FLTR-09 | Level chip labels are defined in the i18n system (it/ui.js and es/ui.js) | Add `filters.levelA1` and `filters.levelA2` keys to both locale files. Chips use `t('filters.levelA1')` etc. Labels re-render when `initializeI18n()` runs on language switch (either via `data-i18n` attribute or explicit `renderFilterChips()` call). |
</phase_requirements>

---

## Existing Code State (Verified by Inspection)

### What Phase 7 delivered — Phase 8 depends on all of this

**`src/js/core/state.js`**
- `activeLevels` state variable with getter `getActiveLevels()` and setter `setActiveLevels()` — DONE
- `setActiveLevels([])` is a no-op (FLTR-06 guard) — DONE

**`src/js/core/app.js`**
- `updateActiveLevels(levels)` coordinator — sets state AND persists via `saveLevelFilter()` — DONE
- `initActiveLevels()` — reads saved filter or applies new/returning-user default — DONE
- `renderDecks()` — already calls `getDueCount(deck, getActiveLevels())` — DONE
- `switchLanguage()` — already calls `initActiveLevels()` before `renderDecks()` — DONE

**`src/js/features/progress.js`**
- `loadLevelFilter()`, `saveLevelFilter()` — DONE

**What is NOT done (Phase 8 must add):**
- No `<div id="level-filter">` element in `index.html`
- No chip CSS classes in `style.css`
- No `filters.levelA1` / `filters.levelA2` i18n keys in either locale `ui.js`
- No chip click event listeners in `app.js`
- No `renderFilterChips()` function to sync visual active state

### HTML structure (current)
```html
<section id="deck-selection" class="view active">
    <h1 data-i18n="deckSelection.title"></h1>
    <p class="subtitle" data-i18n="deckSelection.subtitle"></p>
    <div class="deck-grid" id="deck-grid">
        <!-- Decks injected here -->
    </div>
</section>
```
The chip container must be inserted between the `<p class="subtitle">` and `<div class="deck-grid">`.

### i18n system (current)
- `t('some.key')` resolves dot-notation key paths in locale data objects
- `data-i18n="some.key"` attributes are batch-updated by `initializeI18n()` which runs on init and on every language switch
- No `filters` namespace exists in either locale `ui.js` — must be added

### CSS design system (current)
- Custom properties: `--color-teal`, `--color-text`, `--color-text-light`, `--color-white`, `--color-bg`, `--radius-full`, `--radius-md`, `--shadow-sm`
- Existing interactive pill: `.language-btn` uses `border-radius: var(--radius-full)`, pill shape, border toggle on hover/active — good reference for chip style
- `.language-option.active` pattern uses `background-color: rgba(0, 168, 150, 0.1)` and `font-weight: 600` — establish active chip with stronger visual treatment

---

## Architecture Patterns

### Recommended Changes (files only, no new files needed)

```
index.html                  ← add #level-filter container with two chip buttons
src/css/style.css           ← add .level-filter, .filter-chip, .filter-chip.active
src/locales/it/ui.js        ← add filters: { levelA1, levelA2 } section
src/locales/es/ui.js        ← add filters: { levelA1, levelA2 } section
src/js/core/app.js          ← add renderFilterChips(), chip click handlers,
                               call renderFilterChips() from renderDecks()
```

No new JS modules. No new HTML files.

### Pattern 1: Chip HTML Structure

**What:** Two `<button>` elements in a flex container. Chip active state is a CSS class, not a disabled/checked attribute. Using `<button>` ensures keyboard accessibility.

**When to use:** This is the right element for a toggle action. Avoid `<input type="checkbox">` (requires label pairing); avoid `<div>` (not keyboard-accessible without extra ARIA work).

```html
<!-- In index.html, inside #deck-selection, between subtitle and #deck-grid -->
<div class="level-filter" id="level-filter">
    <button class="filter-chip" data-level="A1" data-i18n="filters.levelA1"></button>
    <button class="filter-chip" data-level="A2" data-i18n="filters.levelA2"></button>
</div>
```

Key design choices:
- `data-level="A1"` / `data-level="A2"` — click handler reads this attribute, no hardcoding in JS
- `data-i18n="filters.levelA1"` — picked up by `initializeI18n()`'s `querySelectorAll('[data-i18n]')` scan; labels update on language switch automatically
- Active class `.filter-chip.active` — toggled by `renderFilterChips()`

### Pattern 2: `renderFilterChips()` Function

**What:** Reads `getActiveLevels()` and syncs the `.active` CSS class on each chip. Called from `renderDecks()` so chip state is always consistent with filter state.

**When to use:** Every time the deck grid is re-rendered — which covers initial load, language switch, and (in future) any other trigger.

```js
// src/js/core/app.js
function renderFilterChips() {
    const activeLevels = getActiveLevels();
    document.querySelectorAll('.filter-chip').forEach(chip => {
        const level = chip.dataset.level;
        chip.classList.toggle('active', activeLevels.includes(level));
    });
}
```

Call site — add to `renderDecks()`:
```js
function renderDecks() {
    renderFilterChips(); // sync chip visual state
    deckGrid.innerHTML = '';
    getDecks().forEach(deck => {
        // ... existing deck rendering unchanged
    });
}
```

### Pattern 3: Chip Click Handler

**What:** On click, compute the new `activeLevels` array (toggle the clicked level) and call `updateActiveLevels()`. The FLTR-06 guard lives inside `setActiveLevels()`, so passing an empty array is safe — it will be silently ignored.

**When to use:** Attach once in `setupEventListeners()`. Use event delegation on `#level-filter` so the single listener handles both chips.

```js
// src/js/core/app.js — inside setupEventListeners()
document.getElementById('level-filter').addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    const clickedLevel = chip.dataset.level;
    const current = getActiveLevels();

    let next;
    if (current.includes(clickedLevel)) {
        // Remove this level (FLTR-06 guard in setActiveLevels handles empty-array no-op)
        next = current.filter(l => l !== clickedLevel);
    } else {
        // Add this level
        next = [...current, clickedLevel];
    }

    updateActiveLevels(next); // sets state + persists; no-op if next is []
    renderDecks();            // re-renders grid with new filter + updates chips
});
```

**Why event delegation:** Avoids needing to query chips individually; chip buttons are static DOM so delegation is straightforward.

### Pattern 4: i18n Integration

**What:** Add a `filters` namespace to both locale `ui.js` files. The `data-i18n` attribute on each chip causes `initializeI18n()` to update labels automatically on every language switch — no additional JS needed.

```js
// src/locales/it/ui.js — add inside exported object
filters: {
    levelA1: 'A1',
    levelA2: 'A2'
},
```

```js
// src/locales/es/ui.js — add inside exported object
filters: {
    levelA1: 'A1',
    levelA2: 'A2'
},
```

Note: "A1" and "A2" are CEFR level codes, not translated words. They are language-neutral. The locale files still need the keys so the i18n system can serve them — this also leaves the door open for localized descriptors in the future (e.g., "A1 — Principiante"). For v1.1, the label value is the same across both locales.

If the product decision is made to use descriptive labels (e.g., "Principiante" / "Intermedio"), this is the only place they need to change. For now, use the bare codes "A1" and "A2".

### Pattern 5: CSS for Chips

**What:** `.filter-chip` as a pill-shaped toggle button. `.filter-chip.active` with filled background to indicate selection. Use existing CSS custom properties to stay consistent with the design system.

```css
/* src/css/style.css — add after language selector styles */

/* Level Filter Chips */
.level-filter {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.filter-chip {
    background: var(--color-white);
    border: 2px solid rgba(0, 0, 0, 0.12);
    border-radius: var(--radius-full);
    padding: 0.35rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-light);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-main);
    box-shadow: var(--shadow-sm);
}

.filter-chip:hover {
    border-color: var(--color-teal);
    color: var(--color-text);
}

.filter-chip.active {
    background: var(--color-teal);
    border-color: var(--color-teal);
    color: var(--color-white);
    box-shadow: 0 2px 8px rgba(0, 168, 150, 0.35);
}

.filter-chip.active:hover {
    background: #009688;
    border-color: #009688;
}
```

**Design rationale:** Teal active state matches `--color-teal` used for teal deck cards and `.language-option.active` hover. Pills use `--radius-full` (same as `.deck-card-badge` and `.language-btn`). Inactive chip is muted (`color-text-light`) to communicate "off" state without disappearing.

### Anti-Patterns to Avoid

- **Using `disabled` attribute for inactive chips:** The chip should be visually inactive but still clickable to re-activate. `disabled` would prevent toggling back on.
- **Hardcoding level strings in click handler:** Use `chip.dataset.level` — keeps the handler generic and avoids "A1"/"A2" string literals in logic.
- **Re-attaching chip event listeners on every `renderDecks()` call:** Attach once in `setupEventListeners()`. Use event delegation so the listener survives DOM changes.
- **Setting chip labels with `innerHTML` + raw i18n strings:** Use `textContent` (via the existing `data-i18n` batch mechanism in `initializeI18n()`) to prevent XSS edge cases.
- **Forgetting to call `renderFilterChips()` from `renderDecks()`:** If chips are not re-synced when `renderDecks()` runs (e.g., after language switch), the chip visual state can diverge from `activeLevels`. Always call `renderFilterChips()` at the top of `renderDecks()`.
- **Placing chips inside the flashcard view:** Chips must only appear in deck selection view. Per FLTR-10 (v2 requirement, out of scope), chips should eventually be hidden during study — for now they simply don't exist in the flashcard view HTML.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chip active state persistence | Custom chip state manager | `updateActiveLevels()` already in app.js | Phase 7 built and tested this; chip click just calls it |
| "At least one chip" enforcement | UI-layer guard checking chip count before deselect | `setActiveLevels()` no-op guard already in state.js | Guard exists one layer below; chip code can pass [] freely |
| i18n label updating on language switch | Explicit chip re-render call | `data-i18n` attribute + existing `initializeI18n()` batch scan | `initializeI18n()` already does `querySelectorAll('[data-i18n]').forEach(...)` on every language switch |
| Badge count refresh after chip toggle | Manual per-deck badge DOM update | Call `renderDecks()` after `updateActiveLevels()` | `renderDecks()` already re-renders all badges using the current `activeLevels` |

**Key insight:** Phase 7 implemented all the hard logic. Phase 8 is a thin UI surface over an already-working system. Every piece of state management already exists; Phase 8 just adds the visual affordance.

---

## Common Pitfalls

### Pitfall 1: Chip Labels Not Updating on Language Switch
**What goes wrong:** User switches from Italian to Spanish; chip labels still show Italian strings (or the i18n key path itself if the key is missing).
**Why it happens:** `filters.levelA1` key was added to `it/ui.js` but forgotten in `es/ui.js`. Or chips were created with `textContent` set manually rather than via `data-i18n`, so they're not picked up by `initializeI18n()`.
**How to avoid:** (1) Add `filters` namespace to BOTH locale files. (2) Use `data-i18n="filters.levelA1"` attribute on chip buttons — the existing `initializeI18n()` scan will handle them. (3) After language switch, verify both chip labels update.
**Warning signs:** Console shows `Translation key "filters.levelA1" not found for locale "es"`. Chip label shows key path instead of value.

### Pitfall 2: Chip State Desync After Language Switch
**What goes wrong:** User has A1-only filter active. They switch language. The chips show A1+A2 both active (wrong), even though `activeLevels` is still `['A1']`.
**Why it happens:** `switchLanguage()` calls `renderDecks()` which re-renders the grid, but `renderFilterChips()` is not called, so the `.active` classes are not re-applied.
**How to avoid:** Call `renderFilterChips()` from within `renderDecks()` — this ensures any call to `renderDecks()` also syncs chip visual state. Since `switchLanguage()` calls `renderDecks()`, the chip state stays consistent automatically.
**Warning signs:** After language switch, chips show wrong active state. Unit test for language switch (if written) would catch this.

### Pitfall 3: Click Handler Attached Multiple Times
**What goes wrong:** `renderDecks()` re-attaches the click listener on `#level-filter` on each call. Multiple handlers fire per click, causing double-toggle behavior.
**Why it happens:** Chip listener setup code is placed inside `renderDecks()` instead of `setupEventListeners()`.
**How to avoid:** Attach chip click listener once, inside `setupEventListeners()`, using event delegation on `#level-filter`. `renderDecks()` should only call `renderFilterChips()` for CSS class updates.
**Warning signs:** Clicking a chip toggles state twice (active → inactive → active in a single click).

### Pitfall 4: Chips Appear in Flashcard View
**What goes wrong:** The chip container bleeds into the flashcard view, or chips are visible during a study session.
**Why it happens:** The chip container is placed in `<main>` outside of `#deck-selection`, so it doesn't hide when the deck selection view hides.
**How to avoid:** Place `<div class="level-filter" id="level-filter">` inside `<section id="deck-selection">`, not outside it. Since `deck-selection` gets `.hidden` when switching to flashcard view, the chips disappear automatically.
**Warning signs:** Chips visible during a study session.

### Pitfall 5: Chip Toggle Doesn't Refresh Due-Count Badges
**What goes wrong:** User clicks A2 chip to deactivate A2. Chips update visually. But deck cards still show the A1+A2 count in their badges.
**Why it happens:** `renderDecks()` is not called after `updateActiveLevels()` in the click handler. Or `renderDecks()` is called but `getDueCount()` is using a stale `activeLevels` reference.
**How to avoid:** Call `renderDecks()` immediately after `updateActiveLevels()` in the chip click handler. `getDueCount()` already takes `getActiveLevels()` as an argument — it reads fresh state on each call.
**Warning signs:** Deck badge counts don't change when chips are toggled.

---

## Code Examples

### Full chip click handler (event delegation pattern)

```js
// src/js/core/app.js — inside setupEventListeners()
document.getElementById('level-filter').addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    const clickedLevel = chip.dataset.level;
    const current = getActiveLevels();

    const next = current.includes(clickedLevel)
        ? current.filter(l => l !== clickedLevel)  // remove (may produce [])
        : [...current, clickedLevel];               // add

    updateActiveLevels(next); // no-op if next is [] (FLTR-06 guard in setActiveLevels)
    renderDecks();            // re-renders grid badges AND chip active state
});
```

### `renderFilterChips()` function

```js
// src/js/core/app.js
function renderFilterChips() {
    const activeLevels = getActiveLevels();
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', activeLevels.includes(chip.dataset.level));
    });
}
```

### Updated `renderDecks()` with chip sync call

```js
// src/js/core/app.js
function renderDecks() {
    renderFilterChips(); // sync chips before re-rendering grid
    deckGrid.innerHTML = '';
    getDecks().forEach(deck => {
        if (!deck.theme) return;
        const dueCount = getDueCount(deck, getActiveLevels());
        // ... rest of existing renderDecks() unchanged
    });
}
```

### i18n additions (both locale files)

```js
// src/locales/it/ui.js — inside the exported object, new section
filters: {
    levelA1: 'A1',
    levelA2: 'A2'
},
```

```js
// src/locales/es/ui.js — inside the exported object, new section
filters: {
    levelA1: 'A1',
    levelA2: 'A2'
},
```

### HTML chip container (inside `#deck-selection`)

```html
<!-- index.html — between subtitle <p> and #deck-grid -->
<div class="level-filter" id="level-filter">
    <button class="filter-chip" data-level="A1" data-i18n="filters.levelA1"></button>
    <button class="filter-chip" data-level="A2" data-i18n="filters.levelA2"></button>
</div>
```

---

## State of the Art

| Old Approach (pre-Phase 8) | New Approach (post-Phase 8) | Impact |
|---------------------------|-----------------------------|--------|
| Filter state exists in JS but has no visible UI | Chips above deck grid show A1/A2 filter state | Users can see and change their active level |
| `updateActiveLevels()` has no callers except `initActiveLevels()` | Chip click calls `updateActiveLevels()` | Filter toggle is user-accessible |
| `initializeI18n()` covers all `data-i18n` elements except (non-existent) chips | Chip buttons use `data-i18n` → covered automatically | Chip labels change on language switch with zero extra code |
| No chip CSS | `.filter-chip` / `.filter-chip.active` styles | Active state is visually distinct |

---

## Open Questions

1. **Should chip labels be bare CEFR codes ("A1", "A2") or descriptive strings ("Principiante", "Beginner")?**
   - What we know: CEFR codes are universally understood for language learners; they are language-neutral, so the same value works in both locale files.
   - What's unclear: Whether the product wants more descriptive labels that communicate the concept to new users.
   - Recommendation: Use bare codes "A1" / "A2" for v1.1. The i18n key is already in place, so descriptive labels can be added later by changing only the locale files. No code change needed.

2. **Should `renderFilterChips()` be called from `renderDecks()` or separately from all call sites?**
   - What we know: `renderDecks()` is called from: `initializeApp()`, `switchLanguage()`, `goHome()`, `resetProgress()`, and (new) the chip click handler. All of these need chips re-synced.
   - What's unclear: Whether there are future scenarios where `renderDecks()` runs without needing chip sync.
   - Recommendation: Call `renderFilterChips()` at the top of `renderDecks()`. This is the single correct chokepoint. There is no scenario in the current codebase where `renderDecks()` should run without syncing chips.

3. **Should the chip container have an accessible label (`aria-label` or `role="group"`)?**
   - What we know: Accessibility best practice for a group of related buttons is to wrap them in a `<fieldset>/<legend>` or a container with `role="group"` and `aria-label`.
   - What's unclear: The project has no stated accessibility requirement level.
   - Recommendation: Add `aria-label="Filter by level"` to the `#level-filter` container. This is a one-line addition that meaningfully improves accessibility with no complexity cost. Each chip button's accessible name comes from its text content (the A1/A2 label), which is sufficient.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.15 + jsdom 25 |
| Config file | `/Users/jbtellez/genies/purolingua/vitest.config.js` |
| Quick run command | `bun run test` |
| Full suite command | `bun run test` |
| Estimated runtime | ~5 seconds (6 existing test files, all unit) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FLTR-01 | Chip click calls `updateActiveLevels()` and `renderDecks()` re-renders badges | unit (DOM) | `bun run test -- --reporter=verbose tests/filter-ui.test.js` | No — Wave 0 gap |
| FLTR-01 | Clicking active chip removes level from activeLevels (FLTR-06 guard holds) | unit (DOM) | `bun run test -- --reporter=verbose tests/filter-ui.test.js` | No — Wave 0 gap |
| FLTR-01 | Clicking inactive chip adds level to activeLevels | unit (DOM) | `bun run test -- --reporter=verbose tests/filter-ui.test.js` | No — Wave 0 gap |
| FLTR-09 | `t('filters.levelA1')` resolves to non-empty string in both locales | unit | `bun run test -- --reporter=verbose tests/filter-ui.test.js` | No — Wave 0 gap |
| FLTR-09 | `t('filters.levelA2')` resolves to non-empty string in both locales | unit | `bun run test -- --reporter=verbose tests/filter-ui.test.js` | No — Wave 0 gap |

**Note on DOM tests:** Phase 7 filter logic tests (`filter-logic.test.js`) do not use the DOM — they test pure JS module functions directly. Phase 8 chip behavior tests will need to set up a minimal DOM fixture (chip buttons) in the test file's `beforeEach`. The existing jsdom environment is sufficient; no additional setup is needed.

### Nyquist Sampling Rate

- **Minimum sample interval:** After every committed task, run `bun run test`
- **Full suite trigger:** Before merging the final task of any plan wave
- **Phase-complete gate:** Full suite green before `/gsd:verify-work` runs
- **Estimated feedback latency per task:** ~5 seconds

### Wave 0 Gaps (must be created before implementation)

- [ ] `tests/filter-ui.test.js` — covers FLTR-01 (chip toggle behavior, FLTR-06 guard via chip) and FLTR-09 (i18n key presence in both locales)

Note: The Wave 0 test file should use direct module imports (no DOM rendering of app.js) following the existing pattern in `filter-logic.test.js`. For chip DOM behavior, the test can create minimal button elements and test the `renderFilterChips()` function directly by importing it, or test through the public state interface (`getActiveLevels()`) after simulating chip clicks.

---

## Sources

### Primary (HIGH confidence)

- Direct inspection of `/Users/jbtellez/genies/purolingua/index.html` — confirmed deck-selection HTML structure; location for chip container insertion; existing `data-i18n` attribute pattern
- Direct inspection of `/Users/jbtellez/genies/purolingua/src/js/core/app.js` — confirmed `updateActiveLevels()`, `initActiveLevels()`, `renderDecks()`, `setupEventListeners()`, `switchLanguage()` call order; confirmed `getDueCount(deck, getActiveLevels())` already in renderDecks
- Direct inspection of `/Users/jbtellez/genies/purolingua/src/js/core/state.js` — confirmed `getActiveLevels()`, `setActiveLevels()` with FLTR-06 guard
- Direct inspection of `/Users/jbtellez/genies/purolingua/src/js/core/i18n.js` — confirmed `t()` function and `data-i18n` batch-update mechanism in `initializeI18n()`; confirmed `t('filters.levelA1')` path will work once locale keys are added
- Direct inspection of `/Users/jbtellez/genies/purolingua/src/css/style.css` — confirmed CSS custom properties, `--radius-full`, `--color-teal`, `.language-btn` as pill reference, `.language-option.active` as active-state reference
- Direct inspection of `/Users/jbtellez/genies/purolingua/src/locales/it/ui.js` and `es/ui.js` — confirmed no `filters` namespace exists; confirmed key structure for addition
- Direct inspection of `/Users/jbtellez/genies/purolingua/src/js/features/progress.js` — confirmed Phase 7 work is complete; `getDueCount(deck, activeLevels)`, `loadLevelFilter()`, `saveLevelFilter()`, `hasProgressData()` all present
- Direct inspection of `/Users/jbtellez/genies/purolingua/vitest.config.js` and `tests/vitest.setup.js` — confirmed jsdom environment, localStorage mock, `beforeEach` clear pattern

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — FLTR-01 and FLTR-09 definitions; v2 note on FLTR-10 (chips hidden during session — out of scope)
- `.planning/STATE.md` — confirms Phase 7 complete; `updateActiveLevels()` is the coordinator for set+persist; pattern decisions for Phase 8 chip handlers
- `.planning/phases/07-filter-logic/07-RESEARCH.md` — confirms `updateActiveLevels()` was designed with Phase 8 callers in mind (Open Questions section)
- `.planning/ROADMAP.md` — Phase 8 success criteria and dependency on Phase 7

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — vanilla JS + existing CSS system; no new libraries; fully verified by source inspection
- Architecture: HIGH — all four change locations identified by direct code inspection; integration points verified
- i18n integration: HIGH — `data-i18n` mechanism verified in `initializeI18n()`; locale file structure confirmed
- CSS patterns: HIGH — existing CSS custom properties and `.active` pattern confirmed by inspection
- Pitfalls: HIGH — derived from reading the exact code paths that must be modified
- Test infrastructure: HIGH — Vitest + jsdom confirmed; existing test patterns in filter-logic.test.js are directly reusable

**Research date:** 2026-02-23
**Valid until:** Stable — source files only change when intentionally edited; no external dependencies
