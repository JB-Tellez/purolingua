// src/hooks/useQASRS.ts
// React hook for Q&A mode SRS state management with localStorage persistence.
// Shares the "{lang}-progress" localStorage key with useSRS — keys are disjoint
// by the 'qa_' prefix, so Rephrase and Q&A progress coexist without collision.
'use client';
import { useState, useCallback, useMemo } from 'react';
import type { Lang, Level, QACard, ScenarioId, ProgressRecord } from '@/types';
import { advanceBox, isCardDue } from '@/lib/srs';

/** Q&A card key format: "qa_{scenarioId}_{cardId}" — disjoint from Rephrase keys */
function getQACardKey(scenarioId: ScenarioId, cardId: string): string {
  return `qa_${scenarioId}_${cardId}`;
}

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
    // localStorage unavailable (private browsing / quota exceeded) — silent fail
  }
}

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
  const [progress, setProgress] = useState<ProgressRecord>(() => loadFromStorage(lang));

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
      setProgress(prev => {
        const key = getQACardKey(scenarioId, cardId);
        const updated = { ...prev, [key]: advanceBox(prev[key], isCorrect) };
        saveToStorage(lang, updated);
        return updated;
      });
    },
    [lang, scenarioId]
  );

  const isCardDueForScenario = useCallback(
    (cardId: string): boolean =>
      isCardDue(progress[getQACardKey(scenarioId, cardId)]),
    [progress, scenarioId]
  );

  const hasProgress = Object.keys(progress).length > 0;

  return { dueCards, updateCard, isCardDueForScenario, hasProgress, progress };
}
