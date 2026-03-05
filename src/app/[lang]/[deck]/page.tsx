// src/app/[lang]/[deck]/page.tsx
// Server component: validates route params, loads deck cards, renders StudySession.
// generateStaticParams covers all 16 lang×deck paths for static export.
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { DECK_IDS } from '@/data/decks';
import type { Card, DeckId, Lang } from '@/types';
import StudySession from './StudySession';

// Italian decks
import { italianDaily } from '@/data/it';
import { italianRestaurant } from '@/data/it';
import { italianTravel } from '@/data/it';
import { italianShopping } from '@/data/it';
import { italianHotel } from '@/data/it';
import { italianEmergencies } from '@/data/it';
import { italianSocial } from '@/data/it';
import { italianWeather } from '@/data/it';

// Spanish decks
import { spanishDaily } from '@/data/es';
import { spanishRestaurant } from '@/data/es';
import { spanishTravel } from '@/data/es';
import { spanishShopping } from '@/data/es';
import { spanishHotel } from '@/data/es';
import { spanishEmergencies } from '@/data/es';
import { spanishSocial } from '@/data/es';
import { spanishWeather } from '@/data/es';

const DECK_MAP: Record<Lang, Record<DeckId, Card[]>> = {
  it: {
    daily: italianDaily,
    restaurant: italianRestaurant,
    travel: italianTravel,
    shopping: italianShopping,
    hotel: italianHotel,
    emergencies: italianEmergencies,
    social: italianSocial,
    weather: italianWeather,
  },
  es: {
    daily: spanishDaily,
    restaurant: spanishRestaurant,
    travel: spanishTravel,
    shopping: spanishShopping,
    hotel: spanishHotel,
    emergencies: spanishEmergencies,
    social: spanishSocial,
    weather: spanishWeather,
  },
};

function getCards(lang: Lang, deckId: DeckId): Card[] {
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
  if (!routing.locales.includes(lang as Lang)) {
    notFound();
  }

  // Validate deck
  if (!DECK_IDS.includes(deck as DeckId)) {
    notFound();
  }

  setRequestLocale(lang);

  const cards = getCards(lang as Lang, deck as DeckId);

  return (
    <StudySession
      lang={lang as Lang}
      deckId={deck as DeckId}
      cards={cards}
    />
  );
}
