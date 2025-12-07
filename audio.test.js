import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock speak function (similar to the one in audio.js)
function speak(text) {
  if (!window.speechSynthesis) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function findBestItalianVoice() {
  const voices = window.speechSynthesis.getVoices();
  const italianVoices = voices.filter(voice => voice.lang.startsWith('it'));

  if (italianVoices.length === 0) return null;

  const preferredNames = ['Alice', 'Luca', 'Google italiano', 'it-IT-Premium'];
  for (const name of preferredNames) {
    const voice = italianVoices.find(v => v.name.includes(name));
    if (voice) return voice;
  }

  const itITVoice = italianVoices.find(v => v.lang === 'it-IT');
  if (itITVoice) return itITVoice;

  return italianVoices[0];
}

describe('Audio - Speech Synthesis', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    if (!global.window) {
      global.window = {};
    }
    global.window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
    };
  });

  it('speak function should call speechSynthesis.speak', () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    speak('Ciao');

    expect(speakSpy).toHaveBeenCalled();
  });

  it('speak function should cancel previous speech before speaking', () => {
    const cancelSpy = vi.spyOn(window.speechSynthesis, 'cancel');

    speak('Buongiorno');

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('speak function should create utterance with correct language', () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    speak('Grazie');

    expect(speakSpy).toHaveBeenCalled();
    const utterance = speakSpy.mock.calls[0][0];
    expect(utterance.lang).toBe('it-IT');
  });

  it('speak function should set speech rate to 0.9', () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    speak('Arrivederci');

    expect(speakSpy).toHaveBeenCalled();
    const utterance = speakSpy.mock.calls[0][0];
    expect(utterance.rate).toBe(0.9);
  });

  it('speak function should pass the correct text to utterance', () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak');
    const testText = 'Buona sera';

    speak(testText);

    expect(speakSpy).toHaveBeenCalled();
    const utterance = speakSpy.mock.calls[0][0];
    expect(utterance.text).toBe(testText);
  });

  it('speak function should handle missing speechSynthesis gracefully', () => {
    const originalSpeechSynthesis = window.speechSynthesis;
    delete window.speechSynthesis;

    expect(() => speak('Test')).not.toThrow();

    window.speechSynthesis = originalSpeechSynthesis;
  });
});

describe('Audio - Voice Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    if (!global.window) {
      global.window = {};
    }
    global.window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
    };
  });

  it('findBestItalianVoice should prefer high-quality voices', () => {
    const mockVoices = [
      { name: 'English US', lang: 'en-US' },
      { name: 'Generic Italian', lang: 'it-IT' },
      { name: 'Alice', lang: 'it-IT' },
      { name: 'French', lang: 'fr-FR' },
    ];

    window.speechSynthesis.getVoices = vi.fn(() => mockVoices);

    const selectedVoice = findBestItalianVoice();

    expect(selectedVoice.name).toBe('Alice');
  });

  it('findBestItalianVoice should return null if no Italian voices available', () => {
    const mockVoices = [
      { name: 'English US', lang: 'en-US' },
      { name: 'French', lang: 'fr-FR' },
    ];

    window.speechSynthesis.getVoices = vi.fn(() => mockVoices);

    const selectedVoice = findBestItalianVoice();

    expect(selectedVoice).toBeNull();
  });
});
