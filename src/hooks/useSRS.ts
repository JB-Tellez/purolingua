// src/hooks/useSRS.ts
// React hook for SRS state management with localStorage persistence.
// localStorage key: "{lang}-progress" — matches v1.1 exactly for user data continuity.
'use client';
import { useState, useCallback } from 'react';
import type { DeckId, Lang, ProgressRecord } from '@/types';
import { getCardKey, advanceBox, isCardDue } from '@/lib/srs';

function getStorageKey(lang: Lang): string {
  return `${lang}-progress`;
}

function loadFromStorage(lang: Lang): ProgressRecord {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(getStorageKey(lang));
    return saved ? (JSON.parse(saved) as ProgressRecord) : {};
  } catch {
    return {};
  }
}

function saveToStorage(lang: Lang, record: ProgressRecord): void {
  try {
    localStorage.setItem(getStorageKey(lang), JSON.stringify(record));
  } catch {
    // localStorage unavailable (private browsing quota exceeded) — silent fail
  }
}

export function useSRS(lang: Lang) {
  const [progress, setProgress] = useState<ProgressRecord>(() => loadFromStorage(lang));

  const updateCard = useCallback(
    (deckId: DeckId, cardIndex: number, isCorrect: boolean) => {
      // Re-read storage instead of using in-memory state: a reset or another
      // writer may have changed the shared key since this hook mounted.
      // Kept outside the setState updater so StrictMode's double-invoke can't
      // advance the box twice.
      const current = loadFromStorage(lang);
      const key = getCardKey(deckId, cardIndex);
      const updated = { ...current, [key]: advanceBox(current[key], isCorrect) };
      saveToStorage(lang, updated);
      setProgress(updated);
    },
    [lang]
  );

  const isCardDueForDeck = useCallback(
    (deckId: DeckId, cardIndex: number): boolean => {
      const key = getCardKey(deckId, cardIndex);
      return isCardDue(progress[key]);
    },
    [progress]
  );

  const hasProgress = Object.keys(progress).length > 0;

  return { progress, updateCard, isCardDueForDeck, hasProgress };
}
