import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { mockRecognitionInstance, MockSpeechRecognition } from '@/__tests__/setup';

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
    // Drop any queued mockImplementationOnce a test left unused.
    MockSpeechRecognition.mockReset();
    MockSpeechRecognition.mockImplementation(function () { return mockRecognitionInstance; });
  });

  describe('initial state', () => {
    it('returns isSupported: true when browser supports SpeechRecognition', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      expect(result.current.isSupported).toBe(true);
    });

    // Callers track "listening" themselves (isListening would turn true only at
    // onstart), so the hook exposes no listening state.
    it('returns only isSupported, startListening, and stopListening', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      expect(Object.keys(result.current).sort()).toEqual(['isSupported', 'startListening', 'stopListening']);
    });
  });

  describe('startListening', () => {
    it('creates one recognizer per start, single-shot without interim results', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { result.current.startListening(vi.fn(), vi.fn()); });
      expect(MockSpeechRecognition).toHaveBeenCalledOnce();
      expect(mockRecognitionInstance.continuous).toBe(false);
      expect(mockRecognitionInstance.interimResults).toBe(false);
      expect(mockRecognitionInstance.start).toHaveBeenCalledOnce();
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

    it('calls onError on error', () => {
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

  // Every start that is not cancelled reports back exactly once, through onResult
  // or onError, so a caller showing "listening" is never left waiting.
  describe('exactly one callback per start', () => {
    function start() {
      const onResult = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { result.current.startListening(onResult, onError); });
      act(() => { mockRecognitionInstance.onstart?.(); });
      return { onResult, onError };
    }

    it('ending with neither a result nor an error calls onError', () => {
      const { onResult, onError } = start();
      act(() => { mockRecognitionInstance.onend?.(); });
      expect(onError).toHaveBeenCalledOnce();
      expect(onResult).not.toHaveBeenCalled();
    });

    it('an empty result list, then the end, calls onError once', () => {
      const { onResult, onError } = start();
      act(() => {
        mockRecognitionInstance.onresult?.({ results: [] } as any);
        mockRecognitionInstance.onend?.();
      });
      expect(onError).toHaveBeenCalledOnce();
      expect(onResult).not.toHaveBeenCalled();
    });

    it("an empty result list calls onError at once, so a new start isn't hit by a late one", () => {
      const firstError = vi.fn();
      const secondError = vi.fn();
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { result.current.startListening(vi.fn(), firstError); });
      act(() => { mockRecognitionInstance.onresult?.({ results: [] } as any); });
      expect(firstError).toHaveBeenCalledOnce(); // before onend

      const first = { onend: mockRecognitionInstance.onend };
      act(() => { result.current.startListening(vi.fn(), secondError); }); // before the old onend
      act(() => { first.onend?.(); });

      expect(firstError).toHaveBeenCalledOnce();
      expect(secondError).not.toHaveBeenCalled();
    });

    it('an error, then the end, calls onError once', () => {
      const { onError } = start();
      act(() => {
        mockRecognitionInstance.onerror?.({ error: 'no-speech' });
        mockRecognitionInstance.onend?.();
      });
      expect(onError).toHaveBeenCalledOnce();
    });

    it('a result, then the end, calls only onResult', () => {
      const { onResult, onError } = start();
      act(() => {
        mockRecognitionInstance.onresult?.({ results: [[{ transcript: 'Ciao' }]] });
        mockRecognitionInstance.onend?.();
      });
      expect(onResult).toHaveBeenCalledOnce();
      expect(onError).not.toHaveBeenCalled();
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

    it('a new start is accepted right after cancelling, without waiting for the end', () => {
      const { hook } = startThenCancel();
      let started: boolean | undefined;
      act(() => { started = hook.result.current.startListening(vi.fn(), vi.fn()); });
      expect(started).toBe(true);
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

  describe('one recognizer at a time', () => {
    // The shared mock returns one object; these tests need a distinct recognizer per start.
    function makeRecognizer() {
      return {
        start: vi.fn(), stop: vi.fn(), abort: vi.fn(),
        lang: '', continuous: false, interimResults: false,
        onstart: null as (() => void) | null,
        onend: null as (() => void) | null,
        onresult: null as ((e: { results: [[{ transcript: string }]] }) => void) | null,
        onerror: null as ((e: { error: string }) => void) | null,
      };
    }

    it('a second start while the first is still starting creates no second recognizer', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { result.current.startListening(vi.fn(), vi.fn()); });
      act(() => { result.current.startListening(vi.fn(), vi.fn()); }); // before onstart
      expect(MockSpeechRecognition).toHaveBeenCalledOnce();
    });

    it("a cancelled session's late end or error reaches no callback and leaves the next session running", () => {
      const first = makeRecognizer();
      const second = makeRecognizer();
      MockSpeechRecognition.mockImplementationOnce(function () { return first; })
        .mockImplementationOnce(function () { return second; });
      const firstError = vi.fn();
      const secondResult = vi.fn();
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { result.current.startListening(vi.fn(), firstError); });
      act(() => { result.current.stopListening(); });
      act(() => { result.current.startListening(secondResult, vi.fn()); });

      act(() => { first.onerror?.({ error: 'aborted' }); first.onend?.(); });

      expect(firstError).not.toHaveBeenCalled();
      let third: boolean | undefined;
      act(() => { third = result.current.startListening(vi.fn(), vi.fn()); });
      expect(third).toBe(false); // the second session is still listening
      act(() => { second.onresult?.({ results: [[{ transcript: 'Ciao' }]] }); });
      expect(secondResult).toHaveBeenCalledWith('Ciao');
    });

    it('returns true when it starts, and false while a session is still listening', () => {
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      let first: boolean | undefined, second: boolean | undefined;
      act(() => { first = result.current.startListening(vi.fn(), vi.fn()); });
      act(() => { second = result.current.startListening(vi.fn(), vi.fn()); });
      expect([first, second]).toEqual([true, false]);
    });

    it("a session that has delivered its result doesn't block a new start, and its late end doesn't end the new one", () => {
      const first = makeRecognizer();
      const second = makeRecognizer();
      MockSpeechRecognition.mockImplementationOnce(function () { return first; })
        .mockImplementationOnce(function () { return second; });
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { result.current.startListening(vi.fn(), vi.fn()); });
      act(() => { first.onstart?.(); first.onresult?.({ results: [[{ transcript: 'Ciao' }]] }); });

      let started: boolean | undefined;
      act(() => { started = result.current.startListening(vi.fn(), vi.fn()); }); // before first's onend
      act(() => { first.onend?.(); });

      expect(started).toBe(true);
      let third: boolean | undefined;
      act(() => { third = result.current.startListening(vi.fn(), vi.fn()); });
      expect(third).toBe(false); // the first session's late end did not end the second
    });

    it('returns false when start() throws, and the next start works', () => {
      const first = makeRecognizer();
      first.start.mockImplementation(() => { throw new Error('InvalidStateError'); });
      MockSpeechRecognition.mockImplementationOnce(function () { return first; });
      const { result } = renderHook(() => useVoiceRecognition('it' as any));
      let a: boolean | undefined, b: boolean | undefined;
      act(() => { a = result.current.startListening(vi.fn(), vi.fn()); });
      act(() => { b = result.current.startListening(vi.fn(), vi.fn()); });
      expect([a, b]).toEqual([false, true]);
    });

    it('unmounting aborts the recognizer and ignores its late result', () => {
      const onResult = vi.fn();
      const { result, unmount } = renderHook(() => useVoiceRecognition('it' as any));
      act(() => { result.current.startListening(onResult, vi.fn()); });
      act(() => { mockRecognitionInstance.onstart?.(); });

      unmount();
      mockRecognitionInstance.onresult?.({ results: [[{ transcript: 'Ciao' }]] });

      expect(mockRecognitionInstance.abort).toHaveBeenCalledOnce();
      expect(onResult).not.toHaveBeenCalled();
    });
  });
});
