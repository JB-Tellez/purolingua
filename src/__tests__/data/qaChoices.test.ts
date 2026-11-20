// Real Q&A data (not mocked): the choices on each card must not give the answer away.
import { describe, it, expect } from 'vitest';
import { scenarios } from '@/data/qa';
import { normalize } from '@/lib/matchTranscript';
import type { QACard } from '@/types';

const LANGS = {
  it: (c: QACard) => ({ correct: c.correct, foils: c.foils }),
  es: (c: QACard) => ({ correct: c.correctEs, foils: c.foilsEs }),
};
const cards = scenarios.flatMap((s) => s.cards);

describe.each(Object.entries(LANGS))('Q&A choices (%s)', (_lang, pick) => {
  // With four choices and no length cue, the correct one would be strictly the
  // longest about a quarter of the time. It was 64% (it) and 52% (es), so a
  // learner could often pick it without understanding it.
  it('makes the correct answer the strictly longest choice on at most a third of the cards', () => {
    const longest = cards.filter((c) => {
      const { correct, foils } = pick(c);
      return foils.every((f) => correct.length > f.length);
    });
    expect(longest.length).toBeLessThanOrEqual(Math.floor(cards.length / 3));
  });

  // Voice answers are matched after normalize(); two choices that normalize
  // alike could never be told apart.
  it('has four choices that differ after normalization on every card', () => {
    for (const c of cards) {
      const { correct, foils } = pick(c);
      expect(new Set([correct, ...foils].map(normalize)).size, c.id).toBe(4);
    }
  });
});
