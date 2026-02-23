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
