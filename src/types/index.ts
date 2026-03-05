// src/types/index.ts
// Core domain types for PuroLingua v1.2
// All downstream phases import from '@/types'

export type Lang = 'it' | 'es';

export type Level = 'A1' | 'A2';

// DeckId literals confirmed against src/locales/it/decks.js (main branch)
export type DeckId =
  | 'daily'
  | 'restaurant'
  | 'travel'
  | 'shopping'
  | 'hotel'
  | 'emergencies'
  | 'social'
  | 'weather';

export interface Card {
  front: string;   // target language word/phrase
  back: string;    // translation/answer
  level: Level;    // CEFR level
}

export interface Deck {
  id: DeckId;
  lang: Lang;
  cards: Card[];
}

// Progress stored in localStorage keyed by "{deckId}_{cardIndex}"
// e.g., "daily_0", "restaurant_12"
// Key format MUST match v1.1 exactly — see src/js/features/progress.js on main branch
export interface Progress {
  box: number;
  nextReview: string; // YYYY-MM-DD date string; matches v1.1 localStorage format exactly
}

export type ProgressRecord = Record<string, Progress>;
