// src/lib/srs.ts
// Pure Leitner SRS functions — no localStorage, no React, no side effects.
// Ported from v1.1 src/js/features/progress.js (main branch).
import type { DeckId, Progress } from '@/types';

/** Card key format matches v1.1 exactly: "{deckId}_{cardIndex}" */
export function getCardKey(deckId: DeckId, cardIndex: number): string {
  return `${deckId}_${cardIndex}`;
}

/** Returns today's date as a YYYY-MM-DD string. */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Leitner review intervals:
 *   box 1 → 1 day
 *   box 2 → 3 days
 *   box 3 → 7 days
 * Returns a YYYY-MM-DD string.
 */
export function getNextReviewDate(box: number): string {
  const today = getTodayString();
  if (box === 1) return addDays(today, 1);
  if (box === 2) return addDays(today, 3);
  if (box === 3) return addDays(today, 7);
  return today;
}

/**
 * A card is due if it has no progress record (new card) or
 * its nextReview date is today or in the past.
 * Date string comparison works for ISO format: "2026-03-01" <= "2026-03-05"
 */
export function isCardDue(progress: Progress | undefined): boolean {
  if (!progress) return true;
  return progress.nextReview <= getTodayString();
}

/**
 * Advance a card's box based on the answer.
 * Correct: move to next box (max box 3).
 * Incorrect: always reset to box 1.
 */
export function advanceBox(current: Progress | undefined, isCorrect: boolean): Progress {
  const currentBox = current?.box ?? 1;
  const newBox = isCorrect ? Math.min(currentBox + 1, 3) : 1;
  return { box: newBox, nextReview: getNextReviewDate(newBox) };
}
