// src/lib/progressStorage.ts
// The "{lang}-progress" localStorage record, shared by Rephrase (useSRS) and
// Q&A (useQASRS). Key name matches v1.1 for user data continuity.
import type { Lang, ProgressRecord } from '@/types';

function getStorageKey(lang: Lang): string {
  return `${lang}-progress`;
}

export function loadProgress(lang: Lang): ProgressRecord {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(getStorageKey(lang));
    return saved ? (JSON.parse(saved) as ProgressRecord) : {};
  } catch {
    return {};
  }
}

export function saveProgress(lang: Lang, record: ProgressRecord): void {
  try {
    localStorage.setItem(getStorageKey(lang), JSON.stringify(record));
  } catch {
    // localStorage unavailable (private browsing / quota exceeded) — silent fail
  }
}

export function clearProgress(lang: Lang): void {
  localStorage.removeItem(getStorageKey(lang));
}
