// src/hooks/useQASRS.ts
// React hook for Q&A mode SRS state management with localStorage persistence.
// Shares the "{lang}-progress" localStorage key with useSRS — keys are disjoint
// by the 'qa_' prefix, so Rephrase and Q&A progress coexist without collision.
'use client';
import { useState, useCallback, useMemo } from 'react';
import type { Lang, Level, QACard, ScenarioId, ProgressRecord } from '@/types';
import { advanceBox, isCardDue, getQACardKey } from '@/lib/srs';
import { loadProgress, saveProgress } from '@/lib/progressStorage';

/**
 * SRS hook for Q&A mode.
 *
 * @param lang         - Language context ('it' | 'es') — determines storage key
 * @param scenarioId   - Scenario being studied — used to namespace Q&A card keys
 * @param cards        - Full cards array for the scenario
 * @param activeLevels - Level filter; only cards whose level is in this array appear in dueCards
 */
export function useQASRS(
  lang: Lang,
  scenarioId: ScenarioId,
  cards: QACard[],
  activeLevels: Level[]
) {
  const [progress, setProgress] = useState<ProgressRecord>(() => loadProgress(lang));

  const dueCards = useMemo(
    () =>
      cards.filter(
        card =>
          activeLevels.includes(card.level) &&
          isCardDue(progress[getQACardKey(scenarioId, card.id)])
      ),
    [cards, activeLevels, progress, scenarioId]
  );

  const updateCard = useCallback(
    (cardId: string, isCorrect: boolean) => {
      // Re-read storage instead of using in-memory state: a reset or useSRS
      // may have changed the shared key since this hook mounted.
      // Kept outside the setState updater so StrictMode's double-invoke can't
      // advance the box twice.
      const current = loadProgress(lang);
      const key = getQACardKey(scenarioId, cardId);
      const updated = { ...current, [key]: advanceBox(current[key], isCorrect) };
      saveProgress(lang, updated);
      setProgress(updated);
    },
    [lang, scenarioId]
  );

  return { dueCards, updateCard, progress };
}
