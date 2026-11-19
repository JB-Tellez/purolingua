// src/types/index.ts
// Core domain types for PuroLingua 0.1.2 (package.json; v1.1 is the `vanilla` branch)
// All downstream phases import from '@/types'

import type { routing } from '@/i18n/routing';

export type Lang = (typeof routing.locales)[number];

export type Level = 'A1' | 'A2';

// DeckId literals confirmed against v1.1 src/locales/it/decks.js (on the `vanilla` branch)
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
  back: string;    // the answer: a same-language paraphrase of `front` (not a translation)
  level: Level;    // CEFR level
}

// Progress stored in localStorage, one ProgressRecord per language, with two key formats:
//   Rephrase "{deckId}_{cardIndex}" (e.g. "daily_0") — MUST match v1.1 exactly, see
//     src/js/features/progress.js on the `vanilla` branch
//   Q&A "qa_{scenarioId}_{cardId}" (e.g. "qa_coffee_coffee_01") — added after v1.1
export interface Progress {
  box: number;
  nextReview: string; // YYYY-MM-DD date string; matches v1.1 localStorage format exactly
}

export type ProgressRecord = Record<string, Progress>;

// Q&A Mode types — added Phase 17

export type ScenarioId =
  | 'coffee'
  | 'hotel'
  | 'restaurant'
  | 'street'
  | 'introductions'
  | 'shop'
  | 'train';

export interface QACard {
  id: string;                        // e.g. "coffee_01"
  question: string;                  // Italian question
  correct: string;                   // Italian correct response
  foils: [string, string, string];   // Italian foils, fixed tuple
  questionEs: string;                // Spanish question (parallel translation)
  correctEs: string;                 // Spanish correct response (parallel translation)
  foilsEs: [string, string, string]; // Spanish foils, fixed tuple (parallel translations)
  level: Level;
}

export interface Scenario {
  id: ScenarioId;
  icon: string;      // emoji
  titleIt: string;   // e.g. "Al Caffè"
  titleEs: string;   // e.g. "En el Café"
  cards: QACard[];
}
