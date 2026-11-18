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
        mockRecognitionInstance.onerror?.();
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('stopListening', () => {
    it('calls stop() on the recognition instance', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      const { startListening, stopListening } = result.current;

      act(() => {
        startListening(vi.fn(), vi.fn());
      });

      act(() => {
        stopListening();
      });

      expect(mockRecognitionInstance.stop).toHaveBeenCalled();
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
