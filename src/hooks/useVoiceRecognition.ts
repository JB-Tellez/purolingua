'use client';
import { useState, useRef, useCallback } from 'react';
import type { Lang } from '@/types';

const LANG_LOCALE: Record<Lang, string> = {
  it: 'it-IT',
  es: 'es-ES',
};

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceRecognition(lang: Lang) {
  const RecognitionClass = getSpeechRecognition();
  const isSupported = !!RecognitionClass;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(
    (onResult: (transcript: string) => void, onError: () => void) => {
      if (!RecognitionClass || isListening) return;
      const rec = new RecognitionClass();
      rec.lang = LANG_LOCALE[lang];
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      };
      rec.onerror = () => {
        setIsListening(false);
        onError();
      };

      recognitionRef.current = rec;
      try { rec.start(); } catch { /* guard against already-started */ }
    },
    [lang, RecognitionClass, isListening]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
