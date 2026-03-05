'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { deckMetadata } from '@/data/decks';
import { useSRS } from '@/hooks/useSRS';
import type { Lang } from '@/types';

// Note: generateStaticParams for [lang] is defined in layout.tsx.
// Omitted here because 'use client' and generateStaticParams cannot coexist on a page.

// ---- DeckGrid client component ----
// Defined in same file per Phase 12 constraints (Phase 13 will extract to components/)
interface DeckGridProps {
  lang: Lang;
}

function DeckGrid({ lang }: DeckGridProps) {
  const { progress } = useSRS(lang);

  const decks = deckMetadata.filter((d) => d.lang === lang);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {decks.map((deck) => {
        // TODO Phase 13: pass real cards from deck data module to compute due count
        // For now, count progress entries for this deck that are due today
        const today = new Date().toISOString().slice(0, 10);
        const dueCount = Object.entries(progress).filter(([key, prog]) => {
          return key.startsWith(`${deck.id}_`) && prog.nextReview <= today;
        }).length;

        return (
          <Link
            key={deck.id}
            href={`/${lang}/${deck.id}`}
            className="relative flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <span className="text-4xl">{deck.icon}</span>
            <span className="font-medium capitalize">{deck.i18nKey}</span>
            <span className="absolute top-2 right-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
              {dueCount}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// ---- LangPage client component ----
// setRequestLocale is handled by layout.tsx which runs first for the [lang] segment.
// This page uses useParams() to read the resolved locale in client context.
export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        {lang === 'it' ? 'Italiano' : 'Español'} &mdash; Decks
      </h1>
      <DeckGrid lang={lang} />
    </main>
  );
}
