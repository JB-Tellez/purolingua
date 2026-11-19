// src/hooks/useLevelFilter.ts
// React hook for CEFR level filter state with localStorage persistence.
// One filter per activity. Rephrase keeps the v1.1 key "{lang}-level-filter";
// Q&A uses "{lang}-qa-level-filter" and, until it saves one, starts from the
// Rephrase value (the filter both activities shared before the split).
// FLTR-06 guard: setActiveLevels([]) or (null) is a silent no-op;
//   at least one level must always remain selected.
'use client';
import { useState, useCallback } from 'react';
import type { Lang, Level } from '@/types';
import { isLevel, LEVELS } from '@/lib/levels';

export type Activity = 'rephrase' | 'qa';

function getFilterKey(lang: Lang, activity: Activity): string {
  return activity === 'qa' ? `${lang}-qa-level-filter` : `${lang}-level-filter`;
}

function loadFilter(lang: Lang, activity: Activity): Level[] | null {
  const own = loadFilterFrom(getFilterKey(lang, activity));
  if (own || activity === 'rephrase') return own;
  return loadFilterFrom(getFilterKey(lang, 'rephrase')); // carry-over
}

function loadFilterFrom(key: string): Level[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved) as unknown;
      // Keep only known levels: a stale or hand-edited value like ["B1"] would hide every card.
      const levels = Array.isArray(parsed) ? [...new Set(parsed.filter(isLevel))] : [];
      if (levels.length > 0) return levels;
    }
  } catch {
    // corrupted JSON — fall through to null
  }
  return null;
}

export function useLevelFilter(lang: Lang, hasProgress: boolean, activity: Activity) {
  const [activeLevels, setActiveLevelsState] = useState<Level[]>(() => {
    const saved = loadFilter(lang, activity);
    if (saved) return saved;
    // Returning users get every level; new users start at the lowest.
    return hasProgress ? [...LEVELS] : [LEVELS[0]];
  });

  const setActiveLevels = useCallback(
    (levels: Level[] | null) => {
      // FLTR-06: silent no-op if result would be empty
      if (!levels || levels.length === 0) return;
      setActiveLevelsState(levels);
      try {
        localStorage.setItem(getFilterKey(lang, activity), JSON.stringify(levels));
      } catch {
        // silent fail (private browsing / quota)
      }
    },
    [lang, activity]
  );

  return { activeLevels, setActiveLevels };
}
