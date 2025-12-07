import { beforeEach } from 'vitest';

// Setup mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
  }
};

// Mock speechSynthesis API
global.speechSynthesis = {
  speak: () => {},
  cancel: () => {},
  getVoices: () => [],
  onvoiceschanged: null
};

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
