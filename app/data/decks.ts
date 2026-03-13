// app/data/decks.ts
// Mirror of src/data/decks.ts — uses ~/types alias (resolves to app/types in Nuxt context)
import type { DeckId, Lang } from '~/types'

export interface DeckMeta {
  id: DeckId;
  lang: Lang;
  i18nKey: DeckId;
  icon: string;
  theme: string;
  cardCount: number;
}

export const deckMetadata: DeckMeta[] = [
  // Italian decks
  { id: 'daily',       lang: 'it', i18nKey: 'daily',       icon: '☀️',  theme: 'teal',   cardCount: 40 },
  { id: 'restaurant',  lang: 'it', i18nKey: 'restaurant',  icon: '🍝',  theme: 'red',    cardCount: 40 },
  { id: 'travel',      lang: 'it', i18nKey: 'travel',      icon: '🗺️', theme: 'yellow', cardCount: 40 },
  { id: 'shopping',    lang: 'it', i18nKey: 'shopping',    icon: '🛒',  theme: 'blue',   cardCount: 40 },
  { id: 'hotel',       lang: 'it', i18nKey: 'hotel',       icon: '🏨',  theme: 'green',  cardCount: 40 },
  { id: 'emergencies', lang: 'it', i18nKey: 'emergencies', icon: '🚨',  theme: 'pink',   cardCount: 40 },
  { id: 'social',      lang: 'it', i18nKey: 'social',      icon: '💬',  theme: 'purple', cardCount: 40 },
  { id: 'weather',     lang: 'it', i18nKey: 'weather',     icon: '☁️',  theme: 'orange', cardCount: 40 },
  // Spanish decks
  { id: 'daily',       lang: 'es', i18nKey: 'daily',       icon: '☀️',  theme: 'teal',   cardCount: 40 },
  { id: 'restaurant',  lang: 'es', i18nKey: 'restaurant',  icon: '🍝',  theme: 'red',    cardCount: 40 },
  { id: 'travel',      lang: 'es', i18nKey: 'travel',      icon: '🗺️', theme: 'yellow', cardCount: 40 },
  { id: 'shopping',    lang: 'es', i18nKey: 'shopping',    icon: '🛒',  theme: 'blue',   cardCount: 40 },
  { id: 'hotel',       lang: 'es', i18nKey: 'hotel',       icon: '🏨',  theme: 'green',  cardCount: 40 },
  { id: 'emergencies', lang: 'es', i18nKey: 'emergencies', icon: '🚨',  theme: 'pink',   cardCount: 40 },
  { id: 'social',      lang: 'es', i18nKey: 'social',      icon: '💬',  theme: 'purple', cardCount: 40 },
  { id: 'weather',     lang: 'es', i18nKey: 'weather',     icon: '☁️',  theme: 'orange', cardCount: 40 },
]

/** All 8 unique deck IDs (language-neutral) */
export const DECK_IDS: DeckId[] = [
  'daily', 'restaurant', 'travel', 'shopping',
  'hotel', 'emergencies', 'social', 'weather',
]
