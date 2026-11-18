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

  it.each(deckMetadata.map((d) => [`${d.lang}/${d.id}`, d] as const))(
    '%s: cardCount matches the cards in DECK_MAP',
    (_key, deck) => {
      expect(DECK_MAP[deck.lang][deck.id]).toHaveLength(deck.cardCount);
    }
  );
});
