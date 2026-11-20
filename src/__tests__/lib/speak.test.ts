import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { speak, stopSpeaking } from '@/lib/speak';

class FakeUtterance {
  lang = '';
  rate = 1;
  voice: { lang: string } | null = null;
  constructor(public text: string) {}
}

const voice = (lang: string) => ({ lang, name: lang });
let voices: { lang: string }[] = [];
const synth = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => voices };

beforeEach(() => {
  voices = [];
  synth.cancel.mockClear();
  synth.speak.mockClear();
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
});
afterEach(() => { vi.unstubAllGlobals(); });

const spoken = () => synth.speak.mock.calls[0][0] as FakeUtterance;

describe('speak', () => {
  it('cancels any current speech, then speaks the phrase in the language locale at rate 0.9', () => {
    speak('Ciao', 'it');
    expect(synth.cancel).toHaveBeenCalledBefore(synth.speak);
    expect(spoken()).toMatchObject({ text: 'Ciao', lang: 'it-IT', rate: 0.9 });
  });

  it('prefers a voice with the exact locale', () => {
    voices = [voice('es-MX'), voice('es-ES')];
    speak('Hola', 'es');
    expect(spoken().voice?.lang).toBe('es-ES');
  });

  it('falls back to any voice for the language', () => {
    voices = [voice('en-US'), voice('it-CH')];
    speak('Ciao', 'it');
    expect(spoken().voice?.lang).toBe('it-CH');
  });

  it('leaves the browser default voice when none matches', () => {
    voices = [voice('en-US')];
    speak('Ciao', 'it');
    expect(spoken().voice).toBeNull();
  });

  it('does nothing when speech synthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(() => speak('Ciao', 'it')).not.toThrow();
    expect(synth.speak).not.toHaveBeenCalled();
  });
});

describe('stopSpeaking', () => {
  it('cancels any current speech', () => {
    stopSpeaking();
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it('does nothing without speech synthesis', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(() => stopSpeaking()).not.toThrow();
  });
});
