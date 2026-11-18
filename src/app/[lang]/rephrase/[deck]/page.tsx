// src/app/[lang]/rephrase/[deck]/page.tsx
// Server component: validates route params, loads deck cards, renders StudySession.
// generateStaticParams covers all 16 lang×deck paths for static export.
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing, isLang } from '@/i18n/routing';
import { DECK_IDS } from '@/data/decks';
import type { DeckId, Lang } from '@/types';
import StudySession from './StudySessionNoSSR';
import { DECK_MAP } from '@/data/deckMap';

function getCards(lang: Lang, deckId: DeckId) {
  return DECK_MAP[lang]?.[deckId] ?? [];
}

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    DECK_IDS.map((deck) => ({ lang, deck }))
  );
}

type Props = {
  params: Promise<{ lang: string; deck: string }>;
};

export default async function DeckPage({ params }: Props) {
  const { lang, deck } = await params;

  // Validate lang
  if (!isLang(lang)) {
    notFound();
  }

  // Validate deck
  if (!DECK_IDS.includes(deck as DeckId)) {
    notFound();
  }

  setRequestLocale(lang);

  const cards = getCards(lang, deck as DeckId);

  return (
    <StudySession
      lang={lang}
      deckId={deck as DeckId}
      cards={cards}
    />
  );
}
