# Phase 6: Content and Data - Research

**Researched:** 2026-02-22
**Domain:** Static data authoring, card schema evolution, Vitest data-integrity testing
**Confidence:** HIGH

---

## Summary

Phase 6 is a pure data phase. There is no new runtime logic, no new UI, and no library to install. The work is:

1. Add `level: "A2"` to all 160 existing cards (80 Italian + 80 Spanish) that currently lack the property.
2. Append A1 phrase cards to the end of every deck array — 4 minimum per deck, 20 target per deck — in both languages.
3. Write a Vitest test that imports both locale deck files and asserts every card in every deck has `level` equal to `"A1"` or `"A2"`.

The two critical constraints driving all decisions in this phase are (a) the append-only rule for positional SRS keys and (b) the minimum 4-card-per-deck threshold required for the quiz foil pool. Both are already known quantities; this phase makes the data conform.

**Primary recommendation:** Edit the two deck files directly. Add `level: "A2"` inline to every existing card object, then append A1 card objects with `level: "A1"` at the array tail. Write a single data-integrity test file in `tests/` using the established Vitest pattern.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | All 160 existing Italian and Spanish cards have `level: "A2"` added to their data | Confirmed: 8 decks x 20 cards x 2 languages = 160 cards, all currently missing `level` property. Direct inline edit of both decks.js files. |
| CONT-02 | Italian decks include A1 phrase content for all 8 topic categories (min 4 cards per deck, ~20 target) | Confirmed: 8 Italian decks identified (daily, restaurant, travel, shopping, hotel, emergencies, social, weather). A1 cards appended after index 19 in each deck. |
| CONT-03 | Spanish decks include A1 phrase content for all 8 topic categories (min 4 cards per deck, ~20 target) | Confirmed: same 8 deck IDs in Spanish. A1 cards appended after index 19. |
</phase_requirements>

---

## Current Data State (Verified by Inspection)

### Card Counts Per Deck — Both Languages
| Deck ID | Italian Cards | Spanish Cards | Notes |
|---------|---------------|---------------|-------|
| daily | 20 | 20 | index 0–19 are A2 |
| restaurant | 20 | 20 | index 0–19 are A2 |
| travel | 20 | 20 | index 0–19 are A2 |
| shopping | 20 | 20 | index 0–19 are A2 |
| hotel | 20 | 20 | index 0–19 are A2 |
| emergencies | 20 | 20 | index 0–19 are A2 |
| social | 20 | 20 | index 0–19 are A2 |
| weather | 20 | 20 | index 0–19 are A2 |
| **Total** | **160** | **160** | All lack `level` property |

**Confirmed:** No card in either file currently has a `level` property. The `level` field is entirely absent from the schema.

### Current Card Schema (no level field)
```js
{
    "front": "Ho perso il treno.",
    "back": "Non sono arrivato in tempo alla stazione."
}
```

### Target Card Schema — A2 (existing cards)
```js
{
    "front": "Ho perso il treno.",
    "back": "Non sono arrivato in tempo alla stazione.",
    "level": "A2"
}
```

### Target Card Schema — A1 (new appended cards)
```js
{
    "front": "Ciao!",
    "back": "Saluto informale.",
    "level": "A1"
}
```

---

## Architecture Patterns

### The Append-Only Rule (CRITICAL)

Card progress keys are `{deckId}_{cardIndex}` (confirmed in `src/js/features/progress.js` line 29-31). The index is the array position. Inserting a card before index 19 would shift all subsequent indices, corrupting stored SRS progress.

**Rule:** A1 cards MUST be pushed to the END of each deck's `cards` array. Never inserted before position 20.

After Phase 6, deck arrays will look like:
- Indices 0–19: existing A2 cards (tagged `level: "A2"`)
- Indices 20+: new A1 cards (tagged `level: "A1"`)

### Quiz Foil Pool Minimum

`generateChoices()` in `src/js/utils/deck-utils.js` requires at least 4 cards in the pool to generate 1 correct + 3 foils. The current per-deck count is 20. After Phase 6, decks will have 20 + N cards (N >= 4 per level). The foil constraint is satisfied at the whole-deck level. Phase 7 will need to ensure the filtered pool (per-level) also has >= 4 cards — that is Phase 7's concern, not Phase 6's. Phase 6 only needs to hit >= 4 A1 cards per deck, which is the minimum stated in CONT-02/CONT-03.

### File Locations

```
src/locales/it/decks.js   ← Italian deck data (edit in place)
src/locales/es/decks.js   ← Spanish deck data (edit in place)
tests/                    ← New data-integrity test goes here
```

No new files are needed for the data edits. One new test file is needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Data integrity checking | Custom node script | Vitest test in `tests/` — already wired, already running in CI |
| Card content | A content generation pipeline | Static inline JSON in the deck file |
| Schema migration | A migration runner | Direct inline edit — static file, no DB |

**Key insight:** This is a static JSON-in-JS file. There is no migration system, no runtime schema evolution, and no need for tooling. Edit the file. Done.

---

## Common Pitfalls

### Pitfall 1: Inserting Instead of Appending
**What goes wrong:** Developer adds A1 cards at the top or middle of the `cards` array. All subsequent card indices shift. Existing users' SRS progress keys become invalid — their boxes reset silently.
**Why it happens:** It feels natural to group A1 before A2.
**How to avoid:** Always push new card objects to the END of the `cards` array. Never insert before the last existing card.
**Warning signs:** Any card at index < 20 has `level: "A1"`.

### Pitfall 2: Editing Existing Card Index Order
**What goes wrong:** Reordering existing A2 cards while tagging them. Same SRS key corruption as above.
**How to avoid:** Add `level: "A2"` in place to each card. Do not reorder the array.

### Pitfall 3: Forgetting One Language
**What goes wrong:** Adding A1 content to Italian but not Spanish (or vice versa). Tests pass if test only covers one language.
**How to avoid:** Data-integrity test MUST import BOTH `src/locales/it/decks.js` AND `src/locales/es/decks.js` and iterate all decks in both.

### Pitfall 4: Level Field Typo
**What goes wrong:** `level: "a1"` (lowercase), `level: "A 2"` (space), `level: "A2 "` (trailing space). Future filter logic does exact string match.
**How to avoid:** Test asserts `["A1", "A2"].includes(card.level)` — catches any variation.

### Pitfall 5: Missing a Deck
**What goes wrong:** 7 of 8 decks get A1 content, one is missed. Requirements fail.
**How to avoid:** Loop over the full deck array in the test; don't hardcode deck IDs. Assert every deck has at least 4 cards with `level: "A1"`.

### Pitfall 6: A1 Content Quality
**What goes wrong:** A1 phrases are too complex for A1 learners (should be simple greetings, numbers, basic nouns/verbs) or are duplicates of existing A2 phrases.
**How to avoid:** A1 phrases should be:
- Simple present tense or infinitive
- Common vocabulary (Ciao, Grazie, Per favore, numbers 1–10, days of week, colors)
- Not paraphrases of existing A2 cards in the same deck
- STATE.md acknowledges: "A1 Italian phrase quality... not validated by a native speaker. Recommend linguistic review before shipping."

---

## Code Examples

### Pattern: Adding `level` to Existing Card (CONT-01)
```js
// Before (current state)
{
    "front": "Ho perso il treno.",
    "back": "Non sono arrivato in tempo alla stazione."
},

// After (add level field inline, do NOT reorder)
{
    "front": "Ho perso il treno.",
    "back": "Non sono arrivato in tempo alla stazione.",
    "level": "A2"
},
```

### Pattern: Appending A1 Cards (CONT-02 / CONT-03)
```js
// In src/locales/it/decks.js, inside the "daily" deck's cards array
// AFTER the last existing card at index 19:
{
    "front": "Ciao!",
    "back": "Saluto informale tra amici.",
    "level": "A1"
},
{
    "front": "Buongiorno.",
    "back": "Saluto formale del mattino.",
    "level": "A1"
},
{
    "front": "Arrivederci.",
    "back": "Saluto di addio formale.",
    "level": "A1"
},
{
    "front": "Grazie.",
    "back": "Espressione di gratitudine.",
    "level": "A1"
},
```

### Pattern: Data-Integrity Test
```js
// tests/data-integrity.test.js
import { describe, it, expect } from 'vitest';
import itDecks from '../src/locales/it/decks.js';
import esDecks from '../src/locales/es/decks.js';

const VALID_LEVELS = ['A1', 'A2'];
const MIN_A1_PER_DECK = 4;

describe('Data Integrity — Card Level Fields', () => {
    it('every Italian card has a valid level field', () => {
        itDecks.forEach(deck => {
            deck.cards.forEach((card, index) => {
                expect(
                    VALID_LEVELS.includes(card.level),
                    `Italian deck "${deck.id}" card[${index}] has invalid level: "${card.level}"`
                ).toBe(true);
            });
        });
    });

    it('every Spanish card has a valid level field', () => {
        esDecks.forEach(deck => {
            deck.cards.forEach((card, index) => {
                expect(
                    VALID_LEVELS.includes(card.level),
                    `Spanish deck "${deck.id}" card[${index}] has invalid level: "${card.level}"`
                ).toBe(true);
            });
        });
    });

    it('every Italian deck has at least 4 A1 cards', () => {
        itDecks.forEach(deck => {
            const a1Count = deck.cards.filter(c => c.level === 'A1').length;
            expect(
                a1Count,
                `Italian deck "${deck.id}" has only ${a1Count} A1 cards (need >= 4)`
            ).toBeGreaterThanOrEqual(MIN_A1_PER_DECK);
        });
    });

    it('every Spanish deck has at least 4 A1 cards', () => {
        esDecks.forEach(deck => {
            const a1Count = deck.cards.filter(c => c.level === 'A1').length;
            expect(
                a1Count,
                `Spanish deck "${deck.id}" has only ${a1Count} A1 cards (need >= 4)`
            ).toBeGreaterThanOrEqual(MIN_A1_PER_DECK);
        });
    });

    it('A1 cards are appended after A2 cards in every deck', () => {
        [...itDecks, ...esDecks].forEach(deck => {
            let seenA1 = false;
            deck.cards.forEach((card, index) => {
                if (card.level === 'A1') seenA1 = true;
                if (seenA1 && card.level === 'A2') {
                    throw new Error(
                        `Deck "${deck.id}" card[${index}] is A2 after A1 cards — append order violated`
                    );
                }
            });
        });
    });
});
```

The test imports the deck files directly as ES modules. Vitest is already configured with `jsdom` environment and `setupFiles` pointing to `tests/vitest.setup.js`. No additional config is needed — the test file just needs to be placed in `tests/` (included via `tests/**/*.test.js` glob in `vitest.config.js`).

---

## A1 Content Guidance Per Deck

Recommendations for A1 phrase content. These are learner-level targets, not final copy. Linguistic review is recommended before shipping (see STATE.md blockers).

| Deck | A1 Theme | Example Phrases |
|------|----------|----------------|
| daily | Greetings, time of day, basic verbs | Ciao, Buongiorno, Buonasera, Come stai?, Bene grazie |
| restaurant | Basic orders, polite requests | Un caffè per favore, Acqua, Grazie, Prego |
| travel | Numbers, directions (simple) | Dov'è...?, A sinistra, A destra, Dritto, Quant'è? |
| shopping | Numbers, colors, basic prices | Quanto costa?, Un euro, Due chili, Rosso, Grande |
| hotel | Basic room requests, yes/no | Sì, No, Per favore, Una camera, Due notti |
| emergencies | Core help phrases | Aiuto!, Mi fa male, Chiama il 118, Ho bisogno di... |
| social | Introductions, numbers | Mi chiamo..., Ho ... anni, Piacere, Da dove vieni? |
| weather | Simple weather descriptions | Fa caldo, Fa freddo, Piove, C'è il sole, Che tempo fa? |

---

## Testing Setup

**Test runner:** Vitest 4.0.15 with jsdom environment.
**Config:** `vitest.config.js` — `include: ['tests/**/*.test.js']`, setup file `tests/vitest.setup.js`.
**Run command:** `bun run test`
**Existing tests:** `progress.test.js`, `deck-utils.test.js`, `app.test.js`, `audio.test.js` — all in `tests/`.
**New test:** `tests/data-integrity.test.js` (name is a recommendation; planner may choose).

The test imports locale deck files as ES modules. Vitest handles ES module imports natively (project uses `"type": "module"` in package.json). No additional mocking is needed — deck files are pure data with no browser APIs.

---

## Open Questions

1. **A1 content linguistic quality**
   - What we know: Content will be synthesized from training knowledge; native speaker review is flagged in STATE.md.
   - What's unclear: Whether the phase should ship with minimum viable content (4 per deck) or full 20-card target.
   - Recommendation: Plan for 20 cards per deck (matching A2 density) but document the native-speaker review concern as a shipping gate.

2. **Exact A1 phrase copy for Spanish**
   - What we know: Spanish decks mirror Italian topic structure exactly.
   - What's unclear: Whether Spanish A1 content should be parallel translations of Italian A1 cards or independently authored.
   - Recommendation: Independent authoring per language; same topics but culturally appropriate phrasing. Planner should create separate tasks for Italian and Spanish content.

3. **Order-preservation test**
   - What we know: The SRS key scheme requires A1 cards to trail A2 cards.
   - What's unclear: Whether the data-integrity test should enforce this ordering constraint.
   - Recommendation: Yes — include the ordering assertion in the test (pattern shown in Code Examples above).

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `src/locales/it/decks.js` — 8 decks, 20 cards each, no `level` field
- Direct inspection of `src/locales/es/decks.js` — 8 decks, 20 cards each, no `level` field
- Direct inspection of `src/js/features/progress.js` — confirmed card key pattern `{deckId}_{cardIndex}`
- Direct inspection of `vitest.config.js` — confirmed `include: ['tests/**/*.test.js']`, jsdom environment
- Direct inspection of `tests/vitest.setup.js` — confirmed localStorage mock, no additional setup needed for data tests
- Direct inspection of `tests/deck-utils.test.js` — confirmed Vitest test pattern (describe/it/expect, direct ES module import)

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — documented constraints (append-only, returning user defaults, linguistic review concern)
- `.planning/REQUIREMENTS.md` — CONT-01, CONT-02, CONT-03 definitions

---

## Metadata

**Confidence breakdown:**
- Current data state: HIGH — verified by direct file inspection and node count
- Append-only rule: HIGH — confirmed in progress.js source and STATE.md decisions
- Test pattern: HIGH — verified against existing test files and vitest.config.js
- A1 content quality: LOW — synthesized from training knowledge, not native-speaker verified

**Research date:** 2026-02-22
**Valid until:** Stable — deck files and test infrastructure change only when intentionally edited. No external dependencies.
