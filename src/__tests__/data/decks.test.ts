// Real deck data (not mocked): metadata must agree with the decks it describes.
import { describe, it, expect } from 'vitest';
import { deckMetadata, DECK_IDS } from '@/data/decks';
import { DECK_MAP } from '@/data/deckMap';
import { routing } from '@/i18n/routing';

describe('deckMetadata', () => {
  it('has exactly one entry per locale × deck', () => {
    const pairs = deckMetadata.map((d) => `${d.lang}/${d.id}`).sort();
    const expected = routing.locales.flatMap((l) => DECK_IDS.map((id) => `${l}/${id}`)).sort();
    expect(pairs).toEqual(expected);
  });

});

describe('DECK_IDS', () => {
  // DECK_MAP's type requires every DeckId, so this makes DECK_IDS complete too.
  it('lists every deck in DECK_MAP exactly once', () => {
    expect(new Set(DECK_IDS).size).toBe(DECK_IDS.length);
    expect([...DECK_IDS].sort()).toEqual(Object.keys(DECK_MAP.it).sort());
  });
});

describe('DECK_MAP', () => {
  it.each(routing.locales.flatMap((l) => DECK_IDS.map((id) => [`${l}/${id}`, DECK_MAP[l][id]] as const)))(
    '%s has 40 cards, 20 per level',
    (_key, cards) => {
      expect(cards).toHaveLength(40);
      expect(cards.filter((c) => c.level === 'A1')).toHaveLength(20);
    }
  );
});
