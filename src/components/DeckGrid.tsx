'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { deckMetadata } from '@/data/decks';
import { useSRS } from '@/hooks/useSRS';
import { DECK_MAP } from '@/data/deckMap';
import type { Card, DeckId, Lang, Level } from '@/types';

interface Props {
  lang: Lang;
  // From the page's useLevelFilter, shared with LevelFilterChips so the badges follow the chips.
  activeLevels: Level[];
}

export default function DeckGrid({ lang, activeLevels }: Props) {
  const t = useTranslations('decks');
  const td = useTranslations('deckDescriptions');
  const { isCardDueForDeck } = useSRS(lang);

  const decks = deckMetadata.filter((d) => d.lang === lang);

  function getDueCount(deckId: DeckId, cards: Card[]): number {
    return cards
      .map((card, i) => ({ card, i }))
      .filter(({ card }) => activeLevels.includes(card.level))
      .filter(({ i }) => isCardDueForDeck(deckId, i))
      .length;
  }

  return (
    <div className="deck-grid">
      {decks.map((deck) => {
        const deckCards = DECK_MAP[lang]?.[deck.id] ?? [];
        const due = getDueCount(deck.id, deckCards);
        return (
          <Link
            key={deck.id}
            href={`/${lang}/rephrase/${deck.id}`}
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
          >
            <div className={`deck-card theme-${deck.theme}`} style={{ height: '100%' }}>
              <div className="deck-icon-circle">{deck.icon}</div>
              <h3>{t(deck.id)}</h3>
              <p>{td(deck.id)}</p>
              <span className={`deck-card-badge${due === 0 ? ' deck-card-badge--done' : ''}`}>
                {due === 0 ? '✓' : due}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
