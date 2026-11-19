'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Lang } from '@/types';
import { LANG_LOCALE } from '@/lib/locale';

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
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
  // a session that is neither cancelled nor ended blocks a second start (with
  // continuous = false it is done once it delivers its result); settled means
  // the caller has had its one callback.
  const sessionRef = useRef<{ cancelled: boolean; ended: boolean; settled: boolean } | null>(null);


  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  // Returns whether listening started, so callers only show "listening" when it did.
  const startListening = useCallback(
    (onResult: (transcript: string) => void, onError: () => void): boolean => {
      const RecognitionClass = getSpeechRecognition();
      // Checked through the session ref, so a start still waiting for the browser counts.
      const current = sessionRef.current;
      if (!RecognitionClass || (current && !current.cancelled && !current.ended)) return false;
      const rec = new RecognitionClass();
      rec.lang = LANG_LOCALE[lang];
      rec.continuous = false;
      rec.interimResults = false;
      const session = { cancelled: false, ended: false, settled: false };
      sessionRef.current = session;

      rec.onend = () => {
        session.ended = true;
        // Ended with neither a usable result nor an error: still report back.
        if (!session.cancelled && !session.settled) {
          session.settled = true;
          onError();
        }
      };
      rec.onresult = (e) => {
        if (session.cancelled) return;
        session.ended = true; // one result per session: a new start may begin now
        if (e.results.length === 0) {
          console.error('[SpeechRecognition] no results returned'); // onend reports it
          return;
        }
        session.settled = true;
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      };
      rec.onerror = () => {
        if (session.cancelled || session.settled) return; // e.g. the "aborted" error that follows a cancel
        session.ended = true;
        session.settled = true;
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
  }, []);

  // Leaving the page cancels too, so a late result never reaches an unmounted caller.
  useEffect(() => () => {
    if (sessionRef.current) sessionRef.current.cancelled = true;
    recognitionRef.current?.abort();
  }, []);

  return { isSupported, startListening, stopListening };
}
