import { describe, it, expect } from 'vitest';
import { generateChoices } from '@/lib/generateChoices';
import type { Card } from '@/types';

const makeCards = (n: number, level: 'A1' | 'A2' = 'A1'): Card[] =>
  Array.from({ length: n }, (_, i) => ({
    front: `front-${level}-${i}`,
    back: `back-${level}-${i}`,
    level,
  }));

describe('generateChoices', () => {
  it('returns exactly 4 choices when pool has 4+ cards', () => {
    const cards = makeCards(5);
    expect(generateChoices(cards[0], cards)).toHaveLength(4);
  });

  it('exactly one choice is isCorrect', () => {
    const cards = makeCards(5);
    const choices = generateChoices(cards[0], cards);
    expect(choices.filter(c => c.isCorrect)).toHaveLength(1);
  });

  it('correct choice text matches correctCard.back', () => {
    const cards = makeCards(5);
    const correct = generateChoices(cards[0], cards).find(c => c.isCorrect);
    expect(correct?.text).toBe(cards[0].back);
  });

  it('foils are drawn only from the provided filteredCards pool', () => {
    // Pool A: only A1 cards. Pool B: only A2 cards.
    // Ask for choices from pool A only — no A2 backs should appear.
    const a1Cards = makeCards(4, 'A1');
    const a2Cards = makeCards(4, 'A2');
    const choices = generateChoices(a1Cards[0], a1Cards);
    const a2Backs = new Set(a2Cards.map(c => c.back));
    choices.filter(c => !c.isCorrect).forEach(f => {
      expect(a2Backs.has(f.text)).toBe(false);
    });
  });

  it('returns correct + available foils when pool has fewer than 4 foils (no crash)', () => {
    const cards = makeCards(2); // 1 correct + 1 foil
    const choices = generateChoices(cards[0], cards);
    expect(choices.length).toBeGreaterThanOrEqual(1);
    expect(choices.filter(c => c.isCorrect)).toHaveLength(1);
  });

  it('no duplicate texts in choices', () => {
    const cards = makeCards(10);
    const choices = generateChoices(cards[0], cards);
    const texts = choices.map(c => c.text);
    expect(new Set(texts).size).toBe(texts.length);
  });
});
