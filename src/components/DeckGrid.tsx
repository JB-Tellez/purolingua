'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { deckMetadata } from '@/data/decks';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { DECK_MAP } from '@/data/deckMap';
import type { Card, DeckId, Lang, Level } from '@/types';

interface Props {
  lang: Lang;
}

interface DeckGridInnerProps {
  lang: Lang;
  activeLevels: Level[];
  isCardDueForDeck: (deckId: DeckId, cardIndex: number) => boolean;
}

function DeckGridInner({ lang, activeLevels, isCardDueForDeck }: DeckGridInnerProps) {
  const t = useTranslations('decks');
  const td = useTranslations('deckDescriptions');

  const decks = deckMetadata.filter((d) => d.lang === lang);

  function getDueCount(deckId: DeckId, cards: Card[]): number {
    return cards
      .map((card, i) => ({ card, i }))
      .filter(({ card }) => (activeLevels as Level[]).includes(card.level))
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
            href={`/${lang}/${deck.id}`}
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
          >
            <div className={`deck-card theme-${deck.theme}`} style={{ height: '100%' }}>
              <div className="deck-icon-circle">{deck.icon}</div>
              <h3>{t(deck.i18nKey)}</h3>
              <p>{td(deck.i18nKey)}</p>
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

export default function DeckGrid({ lang }: Props) {
  const { isCardDueForDeck, hasProgress } = useSRS(lang);
  const { activeLevels } = useLevelFilter(lang, hasProgress);

  return (
    <DeckGridInner
      lang={lang}
      activeLevels={activeLevels}
      isCardDueForDeck={isCardDueForDeck}
    />
  );
}
