'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Lang } from '@/types';
import { LANG_LOCALE } from '@/lib/locale';

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceRecognition(lang: Lang) {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Per-session flag: once cancelled, that session's late events are ignored.
  const sessionRef = useRef<{ cancelled: boolean } | null>(null);

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  const startListening = useCallback(
    (onResult: (transcript: string) => void, onError: () => void) => {
      const RecognitionClass = getSpeechRecognition();
      if (!RecognitionClass || isListening) return;
      const rec = new RecognitionClass();
      rec.lang = LANG_LOCALE[lang];
      rec.continuous = false;
      rec.interimResults = false;
      const session = { cancelled: false };
      sessionRef.current = session;

      rec.onstart = () => { if (!session.cancelled) setIsListening(true); };
      rec.onend = () => setIsListening(false);
      rec.onresult = (e) => {
        if (session.cancelled) return;
        if (e.results.length === 0) {
          console.error('[SpeechRecognition] no results returned');
          return;
        }
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      };
      rec.onerror = () => {
        setIsListening(false);
        if (session.cancelled) return; // e.g. the "aborted" error that follows a cancel
        onError();
      };

      recognitionRef.current = rec;
      try { rec.start(); } catch { /* guard against already-started */ }
    },
    [lang, isListening]
  );

  // Cancels the current session: abort() discards any pending result, unlike stop().
  const stopListening = useCallback(() => {
    if (sessionRef.current) sessionRef.current.cancelled = true;
    recognitionRef.current?.abort();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
