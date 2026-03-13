// app/data/deckMap.ts
// Mirror of src/data/deckMap.ts — imports deck arrays via relative paths to avoid
// @/data/* alias mismatch between src/ context (@=src/) and app/ context (@=app/).
// Individual deck files use `@/types` which resolves correctly in both contexts
// because app/types/index.ts exports the same types as src/types.
import type { Card, DeckId, Lang } from '~/types'

// Italian decks
import { italianDaily } from '../../src/data/it/daily'
import { italianRestaurant } from '../../src/data/it/restaurant'
import { italianTravel } from '../../src/data/it/travel'
import { italianShopping } from '../../src/data/it/shopping'
import { italianHotel } from '../../src/data/it/hotel'
import { italianEmergencies } from '../../src/data/it/emergencies'
import { italianSocial } from '../../src/data/it/social'
import { italianWeather } from '../../src/data/it/weather'

// Spanish decks
import { spanishDaily } from '../../src/data/es/daily'
import { spanishRestaurant } from '../../src/data/es/restaurant'
import { spanishTravel } from '../../src/data/es/travel'
import { spanishShopping } from '../../src/data/es/shopping'
import { spanishHotel } from '../../src/data/es/hotel'
import { spanishEmergencies } from '../../src/data/es/emergencies'
import { spanishSocial } from '../../src/data/es/social'
import { spanishWeather } from '../../src/data/es/weather'

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
}
