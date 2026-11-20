// src/app/[lang]/rephrase/[deck]/page.tsx
// Server component: validates route params, loads deck cards, renders StudySession.
// generateStaticParams covers all 16 lang×deck paths for static export.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
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

// Titled with the deck name ("Ristorante · PuroLingua", via the [lang] template).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, deck } = await params;
  if (!isLang(lang) || !DECK_IDS.includes(deck as DeckId)) return {};
  const t = await getTranslations({ locale: lang, namespace: 'decks' });
  return { title: t(deck as DeckId) };
}

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
