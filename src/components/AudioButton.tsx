'use client';
import { useTranslations } from 'next-intl';
import type { Lang } from '@/types';

const LANG_LOCALE: Record<Lang, string> = {
  it: 'it-IT',
  es: 'es-ES',
};

interface Props {
  phrase: string;
  lang: Lang;
}

export default function AudioButton({ phrase, lang }: Props) {
  const t = useTranslations('study');

  function speak() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = LANG_LOCALE[lang];
    utterance.rate = 0.9;

    // Pick best voice for this locale
    const voices = window.speechSynthesis.getVoices();
    const langCode = lang; // 'it' or 'es'
    const fullLocale = LANG_LOCALE[lang]; // 'it-IT' or 'es-ES'
    const matching = voices.filter((v) => v.lang.startsWith(langCode));
    const exact = matching.find((v) => v.lang === fullLocale);
    const best = exact ?? matching[0] ?? null;
    if (best) utterance.voice = best;

    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      className="audio-btn"
      onClick={(e) => { e.stopPropagation(); speak(); }}
      aria-label={t('audio')}
      title={t('audio')}
      type="button"
    >
      🔊
    </button>
  );
}
