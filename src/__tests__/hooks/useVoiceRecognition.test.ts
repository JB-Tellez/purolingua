import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { mockRecognitionInstance, MockSpeechRecognition } from '../setup';

describe('useVoiceRecognition', () => {
  // VOICE-01: isSupported = true when SpeechRecognition present
  it('VOICE-01: returns isSupported true when SpeechRecognition is on window', () => {
    const { result } = renderHook(() => useVoiceRecognition('it'));
    expect(result.current.isSupported).toBe(true);
  });

  // VOICE-02: isSupported = false when API absent
  it('VOICE-02: returns isSupported false when SpeechRecognition is absent', () => {
    // Temporarily remove SpeechRecognition from window
    const original = (window as { SpeechRecognition?: unknown }).SpeechRecognition;
    Object.defineProperty(window, 'SpeechRecognition', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useVoiceRecognition('it'));
    expect(result.current.isSupported).toBe(false);

    // Restore
    Object.defineProperty(window, 'SpeechRecognition', {
      value: original ?? MockSpeechRecognition,
      writable: true,
      configurable: true,
    });
  });

  // VOICE-03: isListening = true after startListening + onstart fires
  it('VOICE-03: isListening becomes true after startListening called and onstart fires', () => {
    const { result } = renderHook(() => useVoiceRecognition('it'));

    act(() => {
      result.current.startListening(vi.fn(), vi.fn());
    });

    act(() => {
      mockRecognitionInstance.onstart?.();
    });

    expect(result.current.isListening).toBe(true);
  });

  // VOICE-04: isListening resets to false on onend
  it('VOICE-04: isListening resets to false when recognition ends', () => {
    const { result } = renderHook(() => useVoiceRecognition('it'));

    act(() => {
      result.current.startListening(vi.fn(), vi.fn());
    });

    act(() => {
      mockRecognitionInstance.onstart?.();
    });

    expect(result.current.isListening).toBe(true);

    act(() => {
      mockRecognitionInstance.onend?.();
    });

    expect(result.current.isListening).toBe(false);
  });

  // VOICE-05: onResult callback fires with transcript
  it('VOICE-05: onResult callback receives transcript string', () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useVoiceRecognition('it'));

    act(() => {
      result.current.startListening(onResult, vi.fn());
    });

    act(() => {
      mockRecognitionInstance.onresult?.({ results: [[{ transcript: 'ciao' }]] });
    });

    expect(onResult).toHaveBeenCalledOnce();
    expect(onResult).toHaveBeenCalledWith('ciao');
  });

  // VOICE-06: onError callback fires on recognition error
  it('VOICE-06: onError callback fires on recognition error event', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useVoiceRecognition('it'));

    act(() => {
      result.current.startListening(vi.fn(), onError);
    });

    act(() => {
      mockRecognitionInstance.onerror?.({ error: 'not-allowed' });
    });

    expect(onError).toHaveBeenCalledOnce();
    expect(result.current.isListening).toBe(false);
  });
});
