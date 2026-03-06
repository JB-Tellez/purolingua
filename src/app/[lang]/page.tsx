'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deckMetadata } from '@/data/decks';
import { useSRS } from '@/hooks/useSRS';
import LevelFilterChips from '@/components/LevelFilterChips';
import type { Lang } from '@/types';

// Note: generateStaticParams for [lang] is in layout.tsx
// 'use client' and generateStaticParams cannot coexist on a page file.

const LANG_NAMES: Record<Lang, string> = {
  it: 'Italiano',
  es: 'Español',
};

interface DeckGridProps {
  lang: Lang;
}

function DeckGrid({ lang }: DeckGridProps) {
  const { progress } = useSRS(lang);
  const t = useTranslations('decks');

  const decks = deckMetadata.filter((d) => d.lang === lang);

  return (
    <div className="deck-grid">
      {decks.map((deck) => {
        const today = new Date().toISOString().slice(0, 10);
        const dueCount = Object.entries(progress).filter(([key, prog]) => {
          return key.startsWith(`${deck.id}_`) && prog.nextReview <= today;
        }).length;

        return (
          <Link
            key={deck.id}
            href={`/${lang}/${deck.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div className={`deck-card theme-${deck.theme}`}>
              <div className="deck-icon-circle">{deck.icon}</div>
              <h3>{t(deck.i18nKey)}</h3>
              {dueCount > 0 && (
                <span className="deck-card-badge">{dueCount}</span>
              )}
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

  return (
    <main>
      <div className="section-header">
        <h1>{LANG_NAMES[lang]}</h1>
        <p className="subtitle">{t('chooseDeck')}</p>
      </div>
      <LevelFilterChips lang={lang} />
      <DeckGrid lang={lang} />
    </main>
  );
}
