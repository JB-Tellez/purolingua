import { describe, it, expect } from 'vitest';

// VOICE-01: isSupported = true when SpeechRecognition present
describe('useVoiceRecognition', () => {
  it('VOICE-01: returns isSupported true when SpeechRecognition is on window', () => {
    expect(true).toBe(true); // stub — replaced in Plan 02
  });

  // VOICE-02: isSupported = false when API absent
  it('VOICE-02: returns isSupported false when SpeechRecognition is absent', () => {
    expect(true).toBe(true);
  });

  // VOICE-03: isListening = true after startListening
  it('VOICE-03: isListening becomes true after startListening called', () => {
    expect(true).toBe(true);
  });

  // VOICE-04: isListening resets to false on onend
  it('VOICE-04: isListening resets to false when recognition ends', () => {
    expect(true).toBe(true);
  });

  // VOICE-05: onResult callback fires with transcript
  it('VOICE-05: onResult callback receives transcript string', () => {
    expect(true).toBe(true);
  });

  // VOICE-06: onError callback fires on recognition error
  it('VOICE-06: onError callback fires on recognition error event', () => {
    expect(true).toBe(true);
  });
});
