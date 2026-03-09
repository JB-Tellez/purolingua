'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deckMetadata } from '@/data/decks';
import LevelFilterChips from '@/components/LevelFilterChips';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { DECK_MAP } from '@/data/deckMap';
import type { Card, DeckId, Lang, Level } from '@/types';

// Note: generateStaticParams for [lang] is in layout.tsx
// 'use client' and generateStaticParams cannot coexist on a page file.

interface DeckGridProps {
  lang: Lang;
  activeLevels: Level[];
  isCardDueForDeck: (deckId: DeckId, cardIndex: number) => boolean;
}

function DeckGrid({ lang, activeLevels, isCardDueForDeck }: DeckGridProps) {
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

export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const t = useTranslations('page');
  const { isCardDueForDeck, hasProgress } = useSRS(lang);
  const { activeLevels, setActiveLevels } = useLevelFilter(lang, hasProgress);

  return (
    <main>
      <div className="section-header">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>
      <LevelFilterChips lang={lang} activeLevels={activeLevels} setActiveLevels={setActiveLevels} />
      <DeckGrid lang={lang} activeLevels={activeLevels} isCardDueForDeck={isCardDueForDeck} />
    </main>
  );
}
