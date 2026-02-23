import { describe, it, expect } from 'vitest';
import { generateChoices } from '../src/js/utils/deck-utils.js';

const mockDeck = {
  id: 'test-deck',
  title: 'Test Deck',
  description: 'Test Description',
  cards: [
    { front: 'Question 1', back: 'Answer 1' },
    { front: 'Question 2', back: 'Answer 2' },
    { front: 'Question 3', back: 'Answer 3' },
    { front: 'Question 4', back: 'Answer 4' },
    { front: 'Question 5', back: 'Answer 5' },
  ]
};

describe('Deck Utils - Quiz Generation', () => {
  it('generateChoices should return 4 options', () => {
    const card = mockDeck.cards[0];
    const choices = generateChoices(card, mockDeck.cards);

    expect(choices.length).toBe(4);
  });

  it('generateChoices should include the correct answer', () => {
    const card = mockDeck.cards[0];
    const choices = generateChoices(card, mockDeck.cards);

    const hasCorrect = choices.some(c => c.text === card.back && c.isCorrect === true);
    expect(hasCorrect).toBe(true);
  });

  it('generateChoices should have exactly one correct answer', () => {
    const card = mockDeck.cards[0];
    const choices = generateChoices(card, mockDeck.cards);

    const correctCount = choices.filter(c => c.isCorrect).length;
    expect(correctCount).toBe(1);
  });

  it('generateChoices should include 3 foils from other cards', () => {
    const card = mockDeck.cards[0];
    const choices = generateChoices(card, mockDeck.cards);

    const foils = choices.filter(c => !c.isCorrect);
    expect(foils.length).toBe(3);

    // Each foil should be from a different card in the deck
    foils.forEach(foil => {
      const matchingCard = mockDeck.cards.find(c => c.back === foil.text);
      expect(matchingCard).toBeDefined();
      expect(matchingCard.back).not.toBe(card.back);
    });
  });
});
