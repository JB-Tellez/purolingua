// src/data/deckMap.ts
// Shared card array map for all language x deck combinations.
// Used by DeckPage (route param lookup) and StudySession (allDecksEmpty cross-deck check).
import type { Card, DeckId, Lang } from '@/types';

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

export const DECK_MAP: Record<Lang, Record<DeckId, Card[]>> = {
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
