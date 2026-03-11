# Phase 16: Bug Fixes - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix two deferred v1.2 gaps:
1. **BUGFIX-01**: Deck grid tiles show live due-count badges reflecting actual SRS state for the active level filter — not the static card count from metadata.
2. **BUGFIX-02**: The `allDecksEmpty` check in StudySession is wrong — it iterates the current deck's filtered card indices against other decks' `isCardDueForDeck`, producing false positives. Fix so the all-done screen never fires prematurely in A1-only mode.

</domain>

<decisions>
## Implementation Decisions

### Badge zero-state (0 cards due)
- When 0 cards are due for a deck, show a checkmark ✓ in the badge position
- Checkmark uses same position as the count badge, but styled differently (e.g., green color or distinct background)
- Badges update immediately when level filter changes on the deck grid — no page reload required
- No distinction between "never started" and "fully studied" — both use the same zero-state treatment (don't distinguish them)

### Badge new-user state
- Brand-new users (no SRS progress) see the full card count as the badge number — all cards are due
- Badge count always respects the active level filter — A1-only filter shows only A1 card count
- Once any study happens, badges switch to live SRS-computed due counts immediately on next deck grid visit

### Badge label format
- Display the number only — no label text like "due" (language-neutral, like A1/A2 chip labels)
- Reuse existing `.deck-card-badge` CSS class and badge position — minimal styling change
- No i18n translation needed for the badge number

### Claude's Discretion
- Exact checkmark styling (color, background, font size)
- Implementation approach for wiring `useSRS` + `useLevelFilter` into the DeckGrid component
- Fix approach for `allDecksEmpty` cross-deck iteration bug (each deck must use its own card set/indices)
- How to scope `DECK_IDS` to the current language in the `allDecksEmpty` check

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for the implementation details.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useSRS(lang)` — exposes `isCardDueForDeck(deckId, cardIndex)` and `progress`; can be called in the deck grid component
- `useLevelFilter(lang, hasProgress)` — exposes `activeLevels`; already used in StudySession and LevelFilterChips
- `.deck-card-badge` CSS class — existing badge styling, reuse for due-count badge

### Established Patterns
- `useSRS` + `useLevelFilter` are already wired together in StudySession — same pattern applies to DeckGrid
- Level filter changes are reactive (React state) — badge updates will be automatic if hooks are used

### Integration Points
- **BUGFIX-01**: `src/app/[lang]/page.tsx` → `DeckGrid` component needs `useSRS` and `useLevelFilter` wired in; replace `deck.cardCount` with computed due count
- **BUGFIX-02**: `src/app/[lang]/[deck]/StudySession.tsx` → `allDecksEmpty` check (lines 198-200) needs to iterate each deck's own card set, not the current deck's cards

### Bug Root Causes (for planner clarity)
- **BUGFIX-01**: `DeckGrid` renders `{tc('deckCardCount', { count: deck.cardCount })}` using `deckMetadata.cardCount` (static) — no SRS wiring at all
- **BUGFIX-02**: `DECK_IDS.every(id => cards.filter(c => activeLevels.includes(c.level)).every((_, i) => !isCardDueForDeck(id, i)))` — `cards` is the current deck's cards; the iteration indices are wrong for other decks. Also `DECK_IDS` is language-agnostic (8 IDs, used by both Italian and Spanish), so the check incorrectly spans both languages.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-bug-fixes*
*Context gathered: 2026-03-09*
