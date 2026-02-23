# Stack Research

**Domain:** CEFR level filtering for vanilla JS language learning app (milestone v1.1)
**Researched:** 2026-02-22
**Confidence:** HIGH

## Summary Verdict

No new libraries or tools are needed. The CEFR A1/A2 level feature is achievable entirely within the existing stack. Every required capability — data tagging, UI filter rendering, state management, and localStorage persistence — already exists in the codebase and needs only extension, not replacement.

---

## Existing Stack (Do Not Change)

These are confirmed and already in use. Recorded here as integration context for the new feature.

| Technology | Current Version | Role in Project |
|------------|-----------------|-----------------|
| Vanilla JS (ES Modules) | ES2022 (browser-native) | All application logic; no transpilation needed |
| Vite | ^6.0.0 | Dev server and build; static asset bundling |
| Vitest | ^4.0.15 | Unit tests (jsdom environment) |
| Playwright | ^1.58.2 | E2E tests (Chromium, Firefox, WebKit) |
| localStorage | Browser-native | Per-language progress persistence |
| Web Speech API | Browser-native | TTS and voice recognition |

---

## Stack Additions for v1.1

**None required.** The following is an explicit no-op list — each capability was investigated and confirmed to already exist.

### Level Tagging on Cards

**Capability needed:** Add a `level` field (`"A1"` or `"A2"`) to each card object in the locale deck files.

**Where it lives:** `/src/locales/it/decks.js` and `/src/locales/es/decks.js` — plain JS array exports. Add `"level": "A1"` or `"level": "A2"` to each card object literal.

**No library needed.** Card data is a static JS object. Adding a property requires no tooling.

### Level Filter State

**Capability needed:** Track which levels are active (A1, A2, or both). Persist across sessions.

**Where it lives:** `features/progress.js` already has the localStorage read/write pattern using `getStorageKey()` per-language keys. The level preference is a separate concern from SRS progress — use a new key (e.g., `it-level-filter`) rather than mixing it into the existing `it-progress` object.

**No library needed.** The existing `localStorage.getItem` / `localStorage.setItem` pattern from `progress.js` is the right template. Copy it into a new small module (e.g., `features/level-filter.js`) or extend state.js.

### Level Filter UI (Chip/Toggle)

**Capability needed:** Render A1/A2 filter chips on the deck screen, handle multi-select, re-render decks on change.

**Where it lives:** `renderDecks()` in `app.js` already builds DOM dynamically from `getDecks()`. The filter chips follow the exact same pattern as the language dropdown (create element, add class, addEventListener click). The `index.html` deck-selection section has a placeholder `<h1>` + `<p>` above `#deck-grid` — chips slot in naturally between subtitle and grid.

**No library needed.** The existing DOM manipulation pattern (createElement / classList / addEventListener) handles this fully.

### Deck Filtering Logic

**Capability needed:** Filter `deck.cards` to only cards matching the active level(s) before passing to quiz or due-count functions.

**Where it lives:** `getDueCount(deck)` in `progress.js` iterates `deck.cards`. `startDeck(deck)` in `app.js` also iterates `deck.cards` to find due indices. Both need a pre-filter step: `deck.cards.filter(card => activelevels.includes(card.level))`.

**No library needed.** Plain `Array.filter()`.

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Any state management library (Redux, Zustand, Signals) | Adds framework coupling; the project deliberately uses vanilla JS module-level variables | Extend `state.js` with `currentLevelFilter` getter/setter following the existing pattern |
| React / Vue component for filter chips | Violates the explicit "vanilla JS only" constraint; introduces build complexity | `document.createElement` + classList, same as language dropdown implementation |
| A CSS framework or component library | Overkill for 2 chip buttons; adds dead weight to a static app | Extend the existing CSS custom properties in `style.css`; the design system (CSS variables, theme classes) already handles button and badge patterns |
| A schema validation library (zod, yup) | Card data is static, authored by the developer, not user input | Document the `level` field in a comment in the deck file; validate in tests |
| i18n keys for "A1" / "A2" labels | CEFR level names are internationally standardized proper nouns — they do not translate | Hardcode "A1" and "A2" as string literals in the filter chip UI |

---

## Integration Points (Where to Touch Existing Code)

These are the exact files that need modification. No new dependencies required.

| File | Change Type | What Changes |
|------|-------------|--------------|
| `src/locales/it/decks.js` | Data | Add `"level": "A2"` to all existing card objects (all existing cards are A2 per PROJECT.md) |
| `src/locales/es/decks.js` | Data | Same as above |
| `src/locales/it/decks.js` | Data | Add new A1 card objects with `"level": "A1"` for all 8 topics |
| `src/locales/es/decks.js` | Data | Same as above |
| `src/locales/it/ui.js` | i18n | Add `deckSelection.levelFilter` key for filter section label if needed |
| `src/locales/es/ui.js` | i18n | Same as above |
| `src/js/features/progress.js` | Logic | `getDueCount` must accept a cards array (already filtered by level) rather than full deck |
| `src/js/core/app.js` | Logic + UI | Add `renderLevelFilter()`, update `renderDecks()` to pre-filter cards by active level, wire up filter state |
| `src/js/core/state.js` | State | Add `currentLevelFilter` (default `['A1']`), getter/setter |
| `src/css/style.css` | CSS | Add `.level-filter`, `.level-chip`, `.level-chip.active` classes |

---

## localStorage Key Design

The level preference must be scoped per language (matching existing pattern) and separate from SRS progress.

```
// Existing keys (do not change):
it-progress    → { "deckId_cardIndex": { box, nextReview } }
es-progress    → same

// New keys to add:
it-level-filter  → ["A1"]          (default: A1 only)
es-level-filter  → ["A1"]          (default: A1 only)
```

This mirrors `getStorageKey()` in `progress.js` — use `${locale}-level-filter` as the key pattern.

---

## Card Data Schema (After v1.1)

Current card shape:
```js
{ "front": "...", "back": "..." }
```

Required card shape after v1.1:
```js
{ "front": "...", "back": "...", "level": "A1" }
// or
{ "front": "...", "back": "...", "level": "A2" }
```

All existing cards tagged `"A2"`. New A1 content tagged `"A1"`. The `level` field is a required string on all cards post-migration.

---

## Alternatives Considered

| Recommendation | Alternative | Why Not |
|----------------|-------------|---------|
| Add `level` property to existing card objects in place | Separate A1/A2 into parallel arrays or separate deck files | Splitting decks breaks the single-SRS-track-per-language requirement; progress is keyed by `deckId_cardIndex` so card positions must stay stable across levels |
| Single filter state stored as JSON array in localStorage | Store as comma-separated string or bitmask | JSON array is consistent with how `it-progress` is stored; `JSON.parse`/`JSON.stringify` already in use |
| Pre-filter cards before passing to existing functions | Modify `isCardDue` and `updateCardProgress` to be level-aware | Keeping level concern at the deck-display layer keeps SRS functions pure and unchanged; avoids breaking existing tests |

---

## Version Compatibility

No new packages means no new compatibility surface. Existing versions are self-consistent:

| Package | Version | Notes |
|---------|---------|-------|
| vite | ^6.0.0 | No config changes needed for this feature |
| vitest | ^4.0.15 | jsdom environment handles localStorage mock; no setup changes needed |
| @playwright/test | ^1.58.2 | `addInitScript` for localStorage seeding already in use in E2E tests; level filter tests follow same pattern |

---

## Sources

- Codebase inspection (HIGH confidence): `/src/js/core/app.js`, `/src/js/features/progress.js`, `/src/js/core/state.js`, `/src/js/core/i18n.js`, `/src/locales/it/decks.js`, `index.html`
- `.planning/PROJECT.md` (HIGH confidence): Confirmed constraint "vanilla JS only — no React, Vue, etc." and v1.1 feature scope
- E2E test pattern review (HIGH confidence): `/e2e/deck-selection.spec.js` — confirmed `addInitScript` + localStorage seeding pattern for level filter tests

---
*Stack research for: CEFR level filtering (A1/A2) in PuroLingua v1.1*
*Researched: 2026-02-22*
