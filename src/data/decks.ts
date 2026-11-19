import type { DeckId, Lang } from '@/types';

export interface DeckMeta {
  id: DeckId;
  lang: Lang;
  icon: string;
  theme: string;
}

export const deckMetadata: DeckMeta[] = [
  // Italian decks
  { id: 'daily',       lang: 'it', icon: '☀️',  theme: 'teal' },
  { id: 'restaurant',  lang: 'it', icon: '🍝',  theme: 'red' },
  { id: 'travel',      lang: 'it', icon: '🗺️', theme: 'yellow' },
  { id: 'shopping',    lang: 'it', icon: '🛒',  theme: 'blue' },
  { id: 'hotel',       lang: 'it', icon: '🏨',  theme: 'green' },
  { id: 'emergencies', lang: 'it', icon: '🚨',  theme: 'pink' },
  { id: 'social',      lang: 'it', icon: '💬',  theme: 'purple' },
  { id: 'weather',     lang: 'it', icon: '☁️',  theme: 'orange' },
  // Spanish decks
  { id: 'daily',       lang: 'es', icon: '☀️',  theme: 'teal' },
  { id: 'restaurant',  lang: 'es', icon: '🍝',  theme: 'red' },
  { id: 'travel',      lang: 'es', icon: '🗺️', theme: 'yellow' },
  { id: 'shopping',    lang: 'es', icon: '🛒',  theme: 'blue' },
  { id: 'hotel',       lang: 'es', icon: '🏨',  theme: 'green' },
  { id: 'emergencies', lang: 'es', icon: '🚨',  theme: 'pink' },
  { id: 'social',      lang: 'es', icon: '💬',  theme: 'purple' },
  { id: 'weather',     lang: 'es', icon: '☁️',  theme: 'orange' },
];

/** All 8 unique deck IDs (language-neutral) */
export const DECK_IDS: DeckId[] = [
  'daily', 'restaurant', 'travel', 'shopping',
  'hotel', 'emergencies', 'social', 'weather',
];
