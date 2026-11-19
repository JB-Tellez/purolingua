// src/lib/generateChoices.ts
// Multiple-choice distractor generation.
// Ported from v1.1 src/js/utils/deck-utils.js (on the `vanilla` branch).
// Upgrade: uses Fisher-Yates shuffle (v1.1 used biased .sort(() => 0.5 - Math.random())).
import type { Card } from '@/types';
import { shuffle } from '@/lib/shuffle';

export interface Choice {
  text: string;
  isCorrect: boolean;
}

/**
 * Returns 1 correct answer + up to 3 foils (distractors), all shuffled.
 *
 * @param correctCard - The card being studied (provides the correct answer text)
 * @param filteredCards - All cards in the active deck/level pool (foils drawn from here)
 *
 * Caller is responsible for pre-filtering filteredCards to the active level(s).
 * The correct card must be included in filteredCards for completeness but its
 * back text is excluded from the foil pool. Cards sharing a back text count once.
 * Cards with the same front are excluded too: their back is also a right answer.
 */
export function generateChoices(correctCard: Card, filteredCards: Card[]): Choice[] {
  // Distinct texts only: some decks give several cards the same back.
  const foilPool = [...new Set(
    filteredCards.filter(c => c.front !== correctCard.front).map(c => c.back)
  )].filter(back => back !== correctCard.back);
  const foils = shuffle(foilPool).slice(0, 3);
  const choices: Choice[] = [
    { text: correctCard.back, isCorrect: true },
    ...foils.map(text => ({ text, isCorrect: false })),
  ];
  return shuffle(choices);
}
