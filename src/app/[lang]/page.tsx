'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { deckMetadata } from '@/data/decks';
import { useSRS } from '@/hooks/useSRS';
import type { Lang } from '@/types';

// Note: generateStaticParams for [lang] is defined in layout.tsx.
// Omitted here because 'use client' and generateStaticParams cannot coexist on a page.

// ---- DeckGrid client component ----
interface DeckGridProps {
  lang: Lang;
}

function DeckGrid({ lang }: DeckGridProps) {
  const { progress } = useSRS(lang);

  const decks = deckMetadata.filter((d) => d.lang === lang);

  return (
    <div className="deck-grid">
      {decks.map((deck) => {
        // Count progress entries for this deck that are due today
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
              <h3>{deck.id}</h3>
              <p>{deck.i18nKey}</p>
              {dueCount > 0 && (
                <span className="deck-card-badge">{dueCount} due</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ---- LangPage client component ----
export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;

  return (
    <main>
      <div className="section-header">
        <h1>{lang === 'it' ? 'Italiano' : 'Español'}</h1>
        <p className="subtitle">Choose a deck to practice</p>
      </div>
      <DeckGrid lang={lang} />
    </main>
  );
}
