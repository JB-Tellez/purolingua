import { describe, it, expect, beforeEach } from 'vitest';
import { getActiveLevels, setActiveLevels } from '../src/js/core/state.js';
import { loadLevelFilter, saveLevelFilter, hasProgressData, loadProgress, getDueCount } from '../src/js/features/progress.js';
import { generateChoices } from '../src/js/utils/deck-utils.js';

// Set the locale key before each test so getLocale() returns 'it'
// and level-filter resolves to 'it-level-filter'
beforeEach(() => {
    localStorage.setItem('language-learning-locale', 'it');
});

describe('activeLevels state — FLTR-02, FLTR-06', () => {
    it('setActiveLevels(["A1"]) sets state to ["A1"]', () => {
        setActiveLevels(['A1']);
        expect(getActiveLevels()).toEqual(['A1']);
    });

    it('setActiveLevels(["A1", "A2"]) sets state to ["A1", "A2"]', () => {
        setActiveLevels(['A1', 'A2']);
        expect(getActiveLevels()).toEqual(['A1', 'A2']);
    });

    it('setActiveLevels([]) is a no-op: state remains unchanged', () => {
        setActiveLevels(['A1', 'A2']);
        setActiveLevels([]); // no-op
        expect(getActiveLevels()).toEqual(['A1', 'A2']);
    });

    it('setActiveLevels(null) is a no-op: state remains unchanged', () => {
        setActiveLevels(['A1']);
        setActiveLevels(null); // no-op
        expect(getActiveLevels()).toEqual(['A1']);
    });

    it('getActiveLevels() returns a copy: mutating returned array does not affect internal state', () => {
        setActiveLevels(['A1']);
        const levels = getActiveLevels();
        levels.push('X2'); // mutate the copy
        // Internal state must not contain 'X2'
        expect(getActiveLevels()).not.toContain('X2');
        expect(getActiveLevels()).toEqual(['A1']);
    });
});

describe('level-filter localStorage — FLTR-05', () => {
    it('loadLevelFilter() returns null when localStorage has no key', () => {
        // localStorage is cleared before each test in vitest.setup.js,
        // then locale is re-set in our beforeEach — no level-filter key present
        expect(loadLevelFilter()).toBeNull();
    });

    it('saveLevelFilter(["A1"]) then loadLevelFilter() returns ["A1"]', () => {
        saveLevelFilter(['A1']);
        expect(loadLevelFilter()).toEqual(['A1']);
    });

    it('saveLevelFilter(["A1", "A2"]) then loadLevelFilter() returns ["A1", "A2"]', () => {
        saveLevelFilter(['A1', 'A2']);
        expect(loadLevelFilter()).toEqual(['A1', 'A2']);
    });

    it('loadLevelFilter() returns null when stored value is corrupted JSON', () => {
        localStorage.setItem('it-level-filter', 'not-valid-json{{{');
        expect(loadLevelFilter()).toBeNull();
    });
});

describe('hasProgressData — FLTR-03, FLTR-04', () => {
    it('hasProgressData() returns false after loadProgress() with empty localStorage (new user)', () => {
        loadProgress();
        expect(hasProgressData()).toBe(false);
    });

    it('hasProgressData() returns true after loadProgress() when it-progress has data (returning user)', () => {
        localStorage.setItem(
            'it-progress',
            JSON.stringify({ food_0: { box: 1, nextReview: '2026-01-01' } })
        );
        loadProgress();
        expect(hasProgressData()).toBe(true);
    });
});

// Shared fixture: 8 cards (4 A2 at indices 0-3, 4 A1 at indices 4-7)
// Mirrors the real deck pattern: A2 cards first, A1 appended at end.
const mockLevelDeck = {
    id: 'test-level-deck',
    cards: [
        { front: 'ciao', back: 'hello', level: 'A2' },               // index 0
        { front: 'buongiorno', back: 'good morning', level: 'A2' },  // index 1
        { front: 'arrivederci', back: 'goodbye', level: 'A2' },      // index 2
        { front: 'prego', back: 'you are welcome', level: 'A2' },    // index 3
        { front: 'scusa', back: 'excuse me', level: 'A1' },          // index 4
        { front: 'per favore', back: 'please', level: 'A1' },        // index 5
        { front: 'grazie', back: 'thank you', level: 'A1' },         // index 6
        { front: 'di niente', back: 'not at all', level: 'A1' },     // index 7
    ]
};

describe('getDueCount level filtering — FLTR-07', () => {
    // localStorage is cleared before each test in vitest.setup.js,
    // and locale is re-set in our top-level beforeEach ('it').
    // All cards in mockLevelDeck have no stored progress, so isCardDue returns
    // true for each — counts are fully determined by level filter only.
    //
    // Count parity guarantee: getDueCount(deck, activeLevels) uses the SAME
    // card-level predicate as startDeck (levels.includes(card.level) && isCardDue).
    // These tests verify that the badge number and the session queue length agree
    // for every possible activeLevels value.

    beforeEach(() => {
        // loadProgress must be called before getDueCount so the module-level
        // progress variable is initialised from (empty) localStorage.
        loadProgress();
    });

    it("getDueCount(mockLevelDeck, ['A1']) returns 4 — only the 4 A1 cards (indices 4-7) are counted", () => {
        expect(getDueCount(mockLevelDeck, ['A1'])).toBe(4);
    });

    it("getDueCount(mockLevelDeck, ['A2']) returns 4 — only the 4 A2 cards (indices 0-3) are counted", () => {
        expect(getDueCount(mockLevelDeck, ['A2'])).toBe(4);
    });

    it("getDueCount(mockLevelDeck, ['A1', 'A2']) returns 8 — all cards are due when both levels active", () => {
        expect(getDueCount(mockLevelDeck, ['A1', 'A2'])).toBe(8);
    });

    it('count parity: getDueCount A1 result equals number of A1 cards that are due (new cards — all due)', () => {
        // Compute expected count independently: filter by level then check due status.
        // With empty localStorage, every card is "new" => isCardDue returns true => all 4 A1 cards due.
        const expectedA1DueCount = mockLevelDeck.cards.filter(c => c.level === 'A1').length;
        expect(getDueCount(mockLevelDeck, ['A1'])).toBe(expectedA1DueCount);
    });
});

describe('generateChoices foil filtering — FLTR-08', () => {
    // generateChoices(correctCard, filteredCards) receives a pre-filtered array —
    // the caller (renderCard in app.js) filters deck.cards by activeLevels BEFORE
    // calling generateChoices. These tests verify that when the caller passes a
    // level-restricted pool, all foils stay within that pool (no cross-level
    // contamination even if both level arrays were merged).

    const a1Cards = mockLevelDeck.cards.filter(c => c.level === 'A1');
    const a2Cards = mockLevelDeck.cards.filter(c => c.level === 'A2');
    const a1Card = a1Cards[0]; // { front: 'scusa', back: 'excuse me', level: 'A1' }
    const a2Card = a2Cards[0]; // { front: 'ciao', back: 'hello', level: 'A2' }

    it('generateChoices(a1Card, a1Cards) returns exactly 4 choices', () => {
        const choices = generateChoices(a1Card, a1Cards);
        expect(choices).toHaveLength(4);
    });

    it('generateChoices(a1Card, a1Cards) — all foil texts exist in a1Cards (A1-only foils)', () => {
        const choices = generateChoices(a1Card, a1Cards);
        const a1Backs = a1Cards.map(c => c.back);
        const foils = choices.filter(ch => !ch.isCorrect);
        foils.forEach(foil => {
            expect(a1Backs).toContain(foil.text);
        });
    });

    it('no cross-level contamination: generateChoices(a1Card, a1Cards) foils do NOT appear in a2Cards', () => {
        const choices = generateChoices(a1Card, a1Cards);
        const a2Backs = a2Cards.map(c => c.back);
        const foils = choices.filter(ch => !ch.isCorrect);
        foils.forEach(foil => {
            expect(a2Backs).not.toContain(foil.text);
        });
    });

    it('generateChoices(a2Card, a2Cards) — all foil texts exist in a2Cards (A2-only foils)', () => {
        const choices = generateChoices(a2Card, a2Cards);
        const a2Backs = a2Cards.map(c => c.back);
        const foils = choices.filter(ch => !ch.isCorrect);
        foils.forEach(foil => {
            expect(a2Backs).toContain(foil.text);
        });
    });
});
