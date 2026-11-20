// src/lib/speak.ts
// Text-to-speech for a phrase in the app language (Web Speech API).
import type { Lang } from '@/types';
import { LANG_LOCALE } from '@/lib/locale';

/**
 * Speaks `phrase`, cancelling any speech in progress. Prefers a voice with the
 * exact locale (e.g. 'it-IT'), then any voice for the language. No-op when
 * speech synthesis is unavailable (SSR or unsupported browser).
 */
export function speak(phrase: string, lang: Lang): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.lang = LANG_LOCALE[lang];
  utterance.rate = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const matching = voices.filter((v) => v.lang.startsWith(lang));
  const exact = matching.find((v) => v.lang === LANG_LOCALE[lang]);
  utterance.voice = exact ?? matching[0] ?? null;
  window.speechSynthesis.speak(utterance);
}

/** Cancels any speech in progress. No-op when speech synthesis is unavailable. */
export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
