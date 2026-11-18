// src/hooks/useLevelFilter.ts
// React hook for CEFR level filter state with localStorage persistence.
// localStorage key: "{lang}-level-filter" — matches v1.1 exactly.
// FLTR-06 guard: setActiveLevels([]) or (null) is a silent no-op;
//   at least one level must always remain selected.
'use client';
import { useState, useCallback } from 'react';
import type { Lang, Level } from '@/types';
import { isLevel } from '@/lib/levels';

function getFilterKey(lang: Lang): string {
  return `${lang}-level-filter`;
}

function loadFilter(lang: Lang): Level[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(getFilterKey(lang));
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

export function useLevelFilter(lang: Lang, hasProgress: boolean) {
  const [activeLevels, setActiveLevelsState] = useState<Level[]>(() => {
    const saved = loadFilter(lang);
    if (saved) return saved;
    return hasProgress ? ['A1', 'A2'] : ['A1'];
  });

  const setActiveLevels = useCallback(
    (levels: Level[] | null) => {
      // FLTR-06: silent no-op if result would be empty
      if (!levels || levels.length === 0) return;
      setActiveLevelsState(levels);
      try {
        localStorage.setItem(getFilterKey(lang), JSON.stringify(levels));
      } catch {
        // silent fail (private browsing / quota)
      }
    },
    [lang]
  );

  return { activeLevels, setActiveLevels };
}
