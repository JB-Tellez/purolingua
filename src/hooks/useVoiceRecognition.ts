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
  // Per-session flags: once cancelled, that session's late events are ignored;
  // a session that is neither cancelled nor ended blocks a second start. With
  // continuous = false a session is done once it delivers its result.
  const sessionRef = useRef<{ cancelled: boolean; ended: boolean } | null>(null);

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  // Returns whether listening started, so callers only show "listening" when it did.
  const startListening = useCallback(
    (onResult: (transcript: string) => void, onError: () => void): boolean => {
      const RecognitionClass = getSpeechRecognition();
      // Checked through the ref, not isListening: that turns true only at onstart.
      const current = sessionRef.current;
      if (!RecognitionClass || (current && !current.cancelled && !current.ended)) return false;
      const rec = new RecognitionClass();
      rec.lang = LANG_LOCALE[lang];
      rec.continuous = false;
      rec.interimResults = false;
      const session = { cancelled: false, ended: false };
      sessionRef.current = session;

      // Only the newest session may change isListening: an older one that a new
      // start replaced (after its result) still fires onend.
      const isCurrent = () => sessionRef.current === session && !session.cancelled;
      rec.onstart = () => { if (isCurrent()) setIsListening(true); };
      rec.onend = () => {
        session.ended = true;
        if (isCurrent()) setIsListening(false); // a cancelled session already reset it
      };
      rec.onresult = (e) => {
        if (session.cancelled) return;
        session.ended = true; // one result per session: a new start may begin now
        if (e.results.length === 0) {
          console.error('[SpeechRecognition] no results returned');
          return;
        }
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      };
      rec.onerror = () => {
        if (session.cancelled) return; // e.g. the "aborted" error that follows a cancel
        session.ended = true;
        if (isCurrent()) setIsListening(false);
        onError();
      };

      recognitionRef.current = rec;
      try {
        rec.start();
      } catch {
        session.ended = true; // never started, so it must not block the next start
        return false;
      }
      return true;
    },
    [lang]
  );

  // Cancels the current session: abort() discards any pending result, unlike stop().
  const stopListening = useCallback(() => {
    if (sessionRef.current) sessionRef.current.cancelled = true;
    recognitionRef.current?.abort();
    setIsListening(false);
  }, []);

  // Leaving the page cancels too, so a late result never reaches an unmounted caller.
  useEffect(() => () => {
    if (sessionRef.current) sessionRef.current.cancelled = true;
    recognitionRef.current?.abort();
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
