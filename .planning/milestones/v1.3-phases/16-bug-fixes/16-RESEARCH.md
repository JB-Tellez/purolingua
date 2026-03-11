# Phase 16: Bug Fixes - Research

**Researched:** 2026-03-09
**Domain:** React hook composition, SRS state, deck grid rendering (Next.js App Router)
**Confidence:** HIGH — all findings from direct codebase inspection; no external dependencies needed

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Badge zero-state: show a checkmark (✓) when 0 cards are due; same badge position, distinct styling (e.g., green)
- Badge new-user state: brand-new users (no SRS progress) see the full card count as the badge number
- Badge count always respects the active level filter (A1-only shows only A1 count)
- Once any study happens, badges switch to live SRS-computed due counts immediately
- Badge label format: number only — no label text like "due"; reuse existing `.deck-card-badge` CSS class
- No i18n translation needed for the badge number
- No distinction between "never started" and "fully studied" — both use same zero-state treatment (checkmark)

### Claude's Discretion
- Exact checkmark styling (color, background, font size)
- Implementation approach for wiring `useSRS` + `useLevelFilter` into the DeckGrid component
- Fix approach for `allDecksEmpty` cross-deck iteration bug (each deck must use its own card set/indices)
- How to scope `DECK_IDS` to the current language in the `allDecksEmpty` check

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUGFIX-01 | User sees live due-count badges on Rephrase deck tiles (not static card count) | DeckGrid must call `useSRS` + `useLevelFilter`; compute due count per deck from card arrays; zero-state shows checkmark |
| BUGFIX-02 | User is not shown all-done screen prematurely in A1-only mode | `allDecksEmpty` in StudySession must load each deck's own cards by ID and iterate correct indices; must also scope to current language only |
</phase_requirements>

---

## Summary

Phase 16 fixes two pre-existing bugs carried from v1.2. Both bugs are self-contained changes to existing components with no new library dependencies. The entire fix surface is two files: `src/app/[lang]/page.tsx` (BUGFIX-01) and `src/app/[lang]/[deck]/StudySession.tsx` (BUGFIX-02).

**BUGFIX-01** is a wiring omission: `DeckGrid` renders `deck.cardCount` (a static metadata integer) instead of computing actual due cards from SRS state. The fix requires adding `useSRS(lang)` and `useLevelFilter(lang, hasProgress)` to `DeckGrid`, loading each deck's `Card[]` array to know indices, then counting cards that pass both level filter and `isCardDueForDeck`. Because `useLevelFilter` reads from `localStorage` the same way `LevelFilterChips` writes to it, filter-chip changes will automatically trigger a re-render with updated counts — no extra event wiring needed.

**BUGFIX-02** is an index-scope bug: the `allDecksEmpty` check in `handleAnswer` iterates `cards` (the current deck's array) as a proxy for ALL decks. The loop variable `i` is therefore wrong for every other deck. The fix requires loading all decks for the current language via the existing `DECK_MAP` pattern (already in the deck page) and checking each deck's own card indices. The language-scoping bug (`DECK_IDS` spans both languages) must also be fixed by filtering `deckMetadata` by `lang` instead of using the raw `DECK_IDS` constant.

**Primary recommendation:** Fix both bugs as targeted in-place edits — no new hooks, no new components, no new data files.

---

## Standard Stack

### Core (already in project — no new installs needed)

| Tool | Version | Purpose | Status |
|------|---------|---------|--------|
| Next.js App Router | 15.x | Page/component framework | Already installed |
| React hooks (`useState`, `useMemo`, `useCallback`) | 18.x | Reactivity in client components | Already used |
| `useSRS(lang)` | project hook | SRS state: `isCardDueForDeck`, `hasProgress`, `progress` | Used in StudySession; needs adding to DeckGrid |
| `useLevelFilter(lang, hasProgress)` | project hook | Active level filter state | Used in StudySession and LevelFilterChips; needs adding to DeckGrid |
| Vitest + jsdom + @testing-library/react | project | Unit test framework | Already configured |

**Installation:** None required.

---

## Architecture Patterns

### Pattern 1: Hook composition in a client component (already established)

The exact pattern used in `StudySession.tsx` applies directly to `DeckGrid`:

```typescript
// Source: src/app/[lang]/[deck]/StudySession.tsx lines 38-39
const { isCardDueForDeck, hasProgress } = useSRS(lang);
const { activeLevels } = useLevelFilter(lang, hasProgress);
```

`DeckGrid` is already a `'use client'` component (it calls `useParams` and `useTranslations`). No structural change to the component boundary is needed — just add the two hook calls.

### Pattern 2: Computing due count per deck

Each deck's due count = count of card indices where:
1. `card.level` is in `activeLevels` (level filter)
2. `isCardDueForDeck(deck.id, i)` returns `true` (SRS state)

New user (no progress): `isCardDueForDeck` returns `true` for every card by design (see `useSRS.ts` — `isCardDue(undefined)` returns `true`). So the count equals the number of level-filtered cards, which matches the locked "new user sees full card count" requirement automatically — no special-casing needed.

```typescript
// Pseudocode for due count computation in DeckGrid
function getDueCount(deckId: DeckId, cards: Card[]): number {
  return cards
    .filter((card, i) =>
      activeLevels.includes(card.level) && isCardDueForDeck(deckId, i)
    )
    .length;
}
```

### Pattern 3: Providing card arrays to DeckGrid

`DeckGrid` currently only has `deckMetadata` (which has `cardCount` but not the actual `Card[]` arrays). To compute due counts, it needs the real card arrays. The `DECK_MAP` structure already exists in the deck page (`src/app/[lang]/[deck]/page.tsx`) and is the established pattern:

```typescript
// Source: src/app/[lang]/[deck]/page.tsx — existing DECK_MAP
const DECK_MAP: Record<Lang, Record<DeckId, Card[]>> = {
  it: { daily: italianDaily, /* ... */ },
  es: { daily: spanishDaily, /* ... */ },
};
```

The same map (or a version of it) belongs in `src/app/[lang]/page.tsx`. Since the lang page is `'use client'`, the card data is bundled statically (no server fetch) — same approach as the deck page.

### Pattern 4: Badge rendering — number vs. checkmark

```typescript
// In DeckGrid render, replace the static badge span:
// Before:
<span className="deck-card-badge">{tc('deckCardCount', { count: deck.cardCount })}</span>

// After (Claude's discretion on exact styling):
const due = getDueCount(deck.id, deckCards);
<span className={`deck-card-badge${due === 0 ? ' deck-card-badge--done' : ''}`}>
  {due === 0 ? '✓' : due}
</span>
```

No i18n key needed for the number or the checkmark per locked decisions.

### Pattern 5: Fixing allDecksEmpty in StudySession

**Root cause (from CONTEXT.md):**
```typescript
// BUGGY — lines 198-200 in StudySession.tsx
const allDecksEmpty = DECK_IDS.every(id =>
  cards.filter(c => activeLevels.includes(c.level)).every((_, i) => !isCardDueForDeck(id, i))
);
```

Two bugs:
1. `cards` is the current deck's cards — `i` is wrong for all other decks
2. `DECK_IDS` is language-neutral (8 IDs) — iterates both languages' progress keys

**Fix approach (two sub-patterns):**

Sub-pattern A: Scope deck IDs to current language using `deckMetadata`:
```typescript
// Source: src/data/decks.ts — deckMetadata has lang field
import { deckMetadata } from '@/data/decks';
const langDeckIds = deckMetadata.filter(d => d.lang === lang).map(d => d.id);
```

Sub-pattern B: Load each deck's own cards and iterate correct indices:
```typescript
// Same DECK_MAP pattern from deck page — import and reuse
const allDecksEmpty = langDeckIds.every(id => {
  const deckCards = DECK_MAP[lang][id];
  return deckCards
    .map((card, i) => ({ card, i }))
    .filter(({ card }) => activeLevels.includes(card.level))
    .every(({ i }) => !isCardDueForDeck(id, i));
});
```

Note: The `DECK_MAP` definition (with all language-specific card imports) could be extracted to a shared module (e.g., `src/data/deckMap.ts`) to avoid duplication between `src/app/[lang]/[deck]/page.tsx` and `StudySession.tsx`. This is Claude's discretion.

### Recommended Project Structure (no changes needed)

The existing structure is unchanged. All edits are in-place within:
```
src/app/[lang]/page.tsx              ← BUGFIX-01: DeckGrid hook wiring + badge compute
src/app/[lang]/[deck]/StudySession.tsx ← BUGFIX-02: allDecksEmpty fix
src/data/deckMap.ts                  ← optional: extract shared DECK_MAP (Claude's discretion)
```

### Anti-Patterns to Avoid

- **Lifting `useLevelFilter` state from DeckGrid to LangPage**: Both `LevelFilterChips` and `DeckGrid` call `useLevelFilter(lang, hasProgress)` independently. Because both read from and write to the same `localStorage` key (`{lang}-level-filter`), and both mount in the same React tree, React state in `useLevelFilter` will re-render both components when the chip is toggled — no prop-drilling needed. Do not try to share state via props.
- **Calling `useSRS` in the server component (LangPage)**: `useSRS` is `'use client'` and reads `localStorage` — it cannot run on the server. `DeckGrid` is already client-side so it works there.
- **Caching due counts in `useState`**: Due counts should be computed directly in render from `progress` (which is already reactive state in `useSRS`). Storing them in a separate state variable creates stale-state risks.
- **Using `DECK_IDS` for language-scoped logic**: `DECK_IDS` is language-neutral by design. Any logic that needs "decks for this language" must use `deckMetadata.filter(d => d.lang === lang)`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SRS due-date logic | Custom date comparison | `isCardDueForDeck` from `useSRS` | Already handles `undefined` (new cards), date parsing, box intervals |
| Level filter state | New filter state variable | `useLevelFilter(lang, hasProgress)` | localStorage-backed, FLTR-06 guard, already reactive |
| Language-scoped deck list | Custom array | `deckMetadata.filter(d => d.lang === lang)` | Single source of truth for deck metadata |
| Card arrays per deck | Re-declaring data | Existing `DECK_MAP` (from deck page) or importing from `@/data/it` + `@/data/es` | Data files already exist and are complete |

**Key insight:** Both bugs are wiring problems — the building blocks are all present and correct. No new logic needs to be invented.

---

## Common Pitfalls

### Pitfall 1: Level filter state mismatch between LevelFilterChips and DeckGrid

**What goes wrong:** If `DeckGrid` calls `useLevelFilter(lang, hasProgress)` with a different `hasProgress` value than `LevelFilterChips`, and no localStorage value has been saved yet, the two instances will initialize with different defaults and diverge.

**Why it happens:** `LevelFilterChips` calls `useSRS(lang)` to get `hasProgress`, then passes it to `useLevelFilter`. `DeckGrid` must do the same — call `useSRS(lang)` first, then pass `hasProgress` to `useLevelFilter`.

**How to avoid:** Both components call `useSRS(lang)` independently. Since they use the same storage key (`{lang}-progress`), `hasProgress` will be consistent. Do not hardcode `hasProgress=false` or `hasProgress=true` in `DeckGrid`.

**Warning signs:** Badge shows full card count for returning user when A1+A2 is the expected default; or badge shows only A1 count for returning user when A1+A2 is saved in localStorage.

### Pitfall 2: Card indices for allDecksEmpty are off-by-filtered-index

**What goes wrong:** Even after fixing to load each deck's own cards, if you filter first then enumerate with `forEach`/`map`, the index variable is the filtered index, not the original index. `isCardDueForDeck` requires the original array index (as stored in `{deckId}_{originalIndex}` localStorage key).

**Why it happens:** `cards.filter(...).every((_, i) => ...)` — `i` here is the position within the filtered array, not within the full `cards` array.

**How to avoid:** Use `.map((card, i) => ({ card, i }))` first (preserving original index), then `.filter(({ card }) => ...)`, then `.every(({ i }) => !isCardDueForDeck(id, i))`. The original index `i` is preserved through the map.

**Warning signs:** `allDecksEmpty` returns `true` prematurely in A2-only mode (where original indices don't align with filtered indices), or returns wrong result for decks with mixed A1/A2 content near the start.

### Pitfall 3: Forgetting that DeckGrid is inside LangPage which is 'use client'

**What goes wrong:** Attempting to make `DeckGrid` a server component to avoid bundling card arrays.

**Why it happens:** `LangPage` uses `useParams` — which requires `'use client'`. Since `DeckGrid` is defined in the same file, it inherits the client boundary.

**How to avoid:** Keep everything in `src/app/[lang]/page.tsx` as client code. Card arrays are small (40 cards × 8 decks × 2 languages = 640 entries) and acceptable to include in the client bundle.

### Pitfall 4: DECK_MAP duplication between page.tsx and StudySession.tsx

**What goes wrong:** Defining a second copy of `DECK_MAP` in `StudySession.tsx` (or inlining all deck imports) creates a maintenance burden.

**Why it happens:** `StudySession` only receives `cards` for the current deck as a prop — it doesn't have access to other decks' cards without importing them.

**How to avoid:** Extract `DECK_MAP` to a shared module (`src/data/deckMap.ts`) and import from both locations. This is consistent with how `DECK_IDS` and `deckMetadata` are already centralized in `src/data/decks.ts`.

---

## Code Examples

Verified patterns from existing codebase:

### How useSRS isCardDue works for a new card (no entry in progress)
```typescript
// Source: src/hooks/useSRS.ts lines 46-52
const isCardDueForDeck = useCallback(
  (deckId: DeckId, cardIndex: number): boolean => {
    const key = getCardKey(deckId, cardIndex);
    return isCardDue(progress[key]);  // progress[key] is undefined for new cards
  },
  [progress]
);
// isCardDue(undefined) returns true — new cards are always due
```

### useSRS + useLevelFilter wiring (from StudySession)
```typescript
// Source: src/app/[lang]/[deck]/StudySession.tsx lines 38-39
const { isCardDueForDeck, updateCard, hasProgress } = useSRS(lang);
const { activeLevels } = useLevelFilter(lang, hasProgress);
```

### Language-scoped deck list
```typescript
// Source: src/data/decks.ts — deckMetadata has lang: 'it' | 'es' on each entry
import { deckMetadata } from '@/data/decks';
const langDecks = deckMetadata.filter(d => d.lang === lang);
// Result: 8 DeckMeta entries for the current language only
```

### Correct index-preserving filter pattern
```typescript
// Pattern that preserves originalIndex through a level filter:
const dueLevelCards = cards
  .map((card, i) => ({ card, originalIndex: i }))
  .filter(({ card }) => activeLevels.includes(card.level));
// Now iterate: dueLevelCards.every(({ originalIndex }) => !isCardDueForDeck(id, originalIndex))
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|-----------------|-------|
| Static `deck.cardCount` in badge | Live computed due count from `useSRS` | BUGFIX-01 |
| Cross-deck index aliasing in `allDecksEmpty` | Per-deck card arrays with correct original indices | BUGFIX-02 |
| Language-neutral `DECK_IDS` in session end check | `deckMetadata.filter(d => d.lang === lang)` | BUGFIX-02 language scope fix |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + jsdom + @testing-library/react |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `bun run test --run src/__tests__/components/StudySession.test.tsx` |
| Full suite command | `bun run test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUGFIX-01 | DeckGrid badge shows live due count, not static cardCount | unit | `bun run test --run src/__tests__/components/DeckGrid.test.tsx` | ❌ Wave 0 |
| BUGFIX-01 | Badge shows full count for new user (no progress) | unit | same file | ❌ Wave 0 |
| BUGFIX-01 | Badge shows ✓ when 0 cards are due | unit | same file | ❌ Wave 0 |
| BUGFIX-01 | Badge updates when activeLevels changes | unit | same file | ❌ Wave 0 |
| BUGFIX-02 | allDecksEmpty returns false when other decks still have due cards | unit | `bun run test --run src/__tests__/components/StudySession.test.tsx` | ✅ (extend) |
| BUGFIX-02 | allDecksEmpty is scoped to current language only | unit | same file | ✅ (extend) |

### Sampling Rate
- **Per task commit:** `bun run test --run src/__tests__/components/StudySession.test.tsx`
- **Per wave merge:** `bun run test --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/components/DeckGrid.test.tsx` — covers BUGFIX-01 (badge rendering, due count computation, zero-state)
- Existing `StudySession.test.tsx` needs new test cases for BUGFIX-02 (no new file required, extend existing)

---

## Open Questions

1. **Should DECK_MAP be extracted to a shared module?**
   - What we know: It's currently defined only in `src/app/[lang]/[deck]/page.tsx`. `StudySession.tsx` needs all-language deck card arrays for `allDecksEmpty`.
   - What's unclear: Whether extracting to `src/data/deckMap.ts` is worth the file addition vs. inlining imports directly in `StudySession.tsx`.
   - Recommendation: Extract to `src/data/deckMap.ts` — it follows the existing pattern of `src/data/decks.ts` as a central data registry, avoids duplication, and the file is trivial (just re-exports the map).

2. **Should checkmark be rendered as text ✓ or as an icon/element?**
   - What we know: Locked decision says "checkmark ✓ in the badge position, styled differently." Exact styling is Claude's discretion.
   - What's unclear: Whether Unicode ✓ renders consistently across browsers at badge font sizes.
   - Recommendation: Use Unicode `✓` with a CSS class (`.deck-card-badge--done`) that sets `color: green` (or a project CSS variable). Safe, language-neutral, no dependency.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read: `src/app/[lang]/page.tsx` — DeckGrid bug source (line 37)
- Direct codebase read: `src/app/[lang]/[deck]/StudySession.tsx` — allDecksEmpty bug (lines 198-200)
- Direct codebase read: `src/hooks/useSRS.ts` — hook API surface
- Direct codebase read: `src/hooks/useLevelFilter.ts` — hook API surface
- Direct codebase read: `src/data/decks.ts` — DECK_IDS, deckMetadata, DeckMeta shape
- Direct codebase read: `src/components/LevelFilterChips.tsx` — established useSRS + useLevelFilter wiring pattern
- Direct codebase read: `src/app/[lang]/[deck]/page.tsx` — existing DECK_MAP pattern
- Direct codebase read: `src/__tests__/` — test infrastructure (Vitest + jsdom + RTL)

### Secondary (MEDIUM confidence)
- None required — all findings from authoritative codebase source

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Bug root causes: HIGH — confirmed by direct code inspection with line references
- Fix approach: HIGH — follows established patterns already present in the codebase
- Test gaps: HIGH — enumerated from actual test file inventory
- Badge styling: MEDIUM — Unicode ✓ cross-browser behavior assumed safe but not verified

**Research date:** 2026-03-09
**Valid until:** Stable — no external dependencies; valid until codebase refactor
