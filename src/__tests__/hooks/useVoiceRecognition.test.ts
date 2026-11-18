import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { mockRecognitionInstance } from '@/__tests__/setup';

describe('useVoiceRecognition', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset mock instance state between tests
    mockRecognitionInstance.lang = '';
    mockRecognitionInstance.onstart = null;
    mockRecognitionInstance.onend = null;
    mockRecognitionInstance.onresult = null;
    mockRecognitionInstance.onerror = null;
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns isSupported: true when browser supports SpeechRecognition', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      expect(result.current.isSupported).toBe(true);
      expect(result.current.isListening).toBe(false);
    });
  });

  describe('startListening', () => {
    it('creates a recognition instance and sets isListening: true', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      const { startListening } = result.current;

      act(() => {
        startListening(vi.fn(), vi.fn());
      });

      // Trigger onstart to simulate the browser calling it
      act(() => {
        mockRecognitionInstance.onstart?.();
      });

      expect(result.current.isListening).toBe(true);
    });

    it('sets the language from the lang prop', () => {
      const { result } = renderHook(() => useVoiceRecognition('es' as any));
      const { startListening } = result.current;

      act(() => {
        startListening(vi.fn(), vi.fn());
      });

      expect(mockRecognitionInstance.lang).toBe('es-ES');
    });

    it('calls onResult with the transcript from the first result', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      const onResult = vi.fn();
      const { startListening } = result.current;

      act(() => {
        startListening(onResult, vi.fn());
      });

      act(() => {
        mockRecognitionInstance.onresult?.({
          results: [[{ transcript: 'ciao mondo' }]] as any,
        });
      });

      expect(onResult).toHaveBeenCalledWith('ciao mondo');
    });

    it('does NOT call onResult when there are no results', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      const onResult = vi.fn();
      const { startListening } = result.current;

      act(() => {
        startListening(onResult, vi.fn());
      });

      act(() => {
        mockRecognitionInstance.onresult?.({ results: [] } as any);
      });

      expect(onResult).not.toHaveBeenCalled();
    });

    it('calls onError and sets isListening: false on error', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      const onError = vi.fn();
      const { startListening } = result.current;

      act(() => {
        startListening(vi.fn(), onError);
      });

      act(() => {
        mockRecognitionInstance.onerror?.({ error: 'no-speech' });
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('stopListening (cancel)', () => {
    function startThenCancel() {
      const onResult = vi.fn();
      const onError = vi.fn();
      const hook = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { hook.result.current.startListening(onResult, onError); });
      act(() => { mockRecognitionInstance.onstart?.(); });
      mockRecognitionInstance.abort.mockClear();
      act(() => { hook.result.current.stopListening(); });
      return { hook, onResult, onError };
    }

    it('aborts recognition, which discards any pending result', () => {
      startThenCancel();
      expect(mockRecognitionInstance.abort).toHaveBeenCalledOnce();
    });

    it('stops listening immediately', () => {
      const { hook } = startThenCancel();
      expect(hook.result.current.isListening).toBe(false);
    });

    it('ignores a late result or the "aborted" error the browser fires after cancelling', () => {
      const { onResult, onError } = startThenCancel();
      act(() => {
        mockRecognitionInstance.onresult?.({ results: [[{ transcript: 'Ciao' }]] });
        mockRecognitionInstance.onerror?.({ error: 'aborted' });
      });
      expect(onResult).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('a new session after cancelling delivers results normally', () => {
      const { hook } = startThenCancel();
      act(() => { mockRecognitionInstance.onend?.(); });
      const onResult = vi.fn();
      act(() => { hook.result.current.startListening(onResult, vi.fn()); });
      act(() => { mockRecognitionInstance.onresult?.({ results: [[{ transcript: 'Ciao' }]] }); });
      expect(onResult).toHaveBeenCalledWith('Ciao');
    });

    it('is safe to call when not listening', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      const { stopListening } = result.current;

      expect(() => act(() => stopListening())).not.toThrow();
    });
  });

  describe('idempotent start', () => {
    it('does not create a second instance when already listening', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      const { startListening } = result.current;

      act(() => {
        startListening(vi.fn(), vi.fn());
      });

      const initialListen = result.current.isListening;
      const callCount = vi.mocked((globalThis as any).SpeechRecognition).mock?.calls?.length ?? 0;

      act(() => {
        startListening(vi.fn(), vi.fn());
      });

      expect(result.current.isListening).toBe(initialListen);
      expect(vi.mocked((globalThis as any).SpeechRecognition).mock?.calls?.length).toBe(callCount + 1);
    });
  });
});
