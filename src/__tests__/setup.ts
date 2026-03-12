// @testing-library/jest-dom removed — no longer in devDependencies after Nuxt migration
import { beforeEach, vi } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// SpeechRecognition mock — makes jsdom look like a real browser for voice-recognition tests
export const mockRecognitionInstance = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  lang: '',
  continuous: false,
  interimResults: false,
  onstart: null as (() => void) | null,
  onend: null as (() => void) | null,
  onresult: null as ((e: { results: [[{ transcript: string }]] }) => void) | null,
  onerror: null as ((e: { error: string }) => void) | null,
};

// Must use a regular function (not arrow) so `new MockSpeechRecognition()` works
export const MockSpeechRecognition = vi.fn(function () {
  return mockRecognitionInstance;
});

Object.defineProperty(window, 'SpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  MockSpeechRecognition.mockClear();
  mockRecognitionInstance.onstart = null;
  mockRecognitionInstance.onend = null;
  mockRecognitionInstance.onresult = null;
  mockRecognitionInstance.onerror = null;
  mockRecognitionInstance.lang = '';
});
