import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the decks data
const decks = [
  {
    id: 'test-deck',
    title: 'Test Deck',
    description: 'Test Description',
    cards: [
      { front: 'Question 1', back: 'Answer 1' },
      { front: 'Question 2', back: 'Answer 2' },
      { front: 'Question 3', back: 'Answer 3' },
      { front: 'Question 4', back: 'Answer 4' },
      { front: 'Question 5', back: 'Answer 5' },
    ]
  }
];

// Utility functions extracted from app.js for testing
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getNextReviewDate(box) {
  const today = getTodayString();
  if (box === 1) return addDays(today, 1);
  if (box === 2) return addDays(today, 3);
  if (box === 3) return addDays(today, 7);
  return today;
}

function generateChoices(correctCard, deck) {
  const potentialFoils = deck.cards.filter(c => c.back !== correctCard.back);
  const shuffledFoils = potentialFoils.sort(() => 0.5 - Math.random());
  const foils = shuffledFoils.slice(0, 3);

  const choices = [
    { text: correctCard.back, isCorrect: true },
    ...foils.map(f => ({ text: f.back, isCorrect: false }))
  ];

  return choices.sort(() => 0.5 - Math.random());
}

function getCardKey(deckId, cardIndex) {
  return `${deckId}_${cardIndex}`;
}

function updateCardProgress(deckId, cardIndex, isCorrect, progressObj = {}) {
  const key = getCardKey(deckId, cardIndex);
  const cardProgress = progressObj[key] || { box: 1, nextReview: getTodayString() };

  if (isCorrect) {
    cardProgress.box = Math.min(cardProgress.box + 1, 3);
  } else {
    cardProgress.box = 1;
  }

  cardProgress.nextReview = getNextReviewDate(cardProgress.box);
  progressObj[key] = cardProgress;

  // Save to localStorage
  try {
    localStorage.setItem('italiano-progress', JSON.stringify(progressObj));
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e);
  }

  return progressObj;
}

describe('Spaced Repetition Logic', () => {
  it('getNextReviewDate(1) should return tomorrow', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expected = tomorrow.toISOString().split('T')[0];

    const result = getNextReviewDate(1);
    expect(result).toBe(expected);
  });

  it('getNextReviewDate(2) should return 3 days from now', () => {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + 3);
    const expected = future.toISOString().split('T')[0];

    const result = getNextReviewDate(2);
    expect(result).toBe(expected);
  });

  it('getNextReviewDate(3) should return 7 days from now', () => {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + 7);
    const expected = future.toISOString().split('T')[0];

    const result = getNextReviewDate(3);
    expect(result).toBe(expected);
  });
});

describe('Quiz Generation', () => {
  it('generateChoices should return 4 options', () => {
    const deck = decks[0];
    const card = deck.cards[0];
    const choices = generateChoices(card, deck);

    expect(choices.length).toBe(4);
  });

  it('generateChoices should include the correct answer', () => {
    const deck = decks[0];
    const card = deck.cards[0];
    const choices = generateChoices(card, deck);

    const hasCorrect = choices.some(c => c.text === card.back && c.isCorrect === true);
    expect(hasCorrect).toBe(true);
  });

  it('generateChoices should have exactly one correct answer', () => {
    const deck = decks[0];
    const card = deck.cards[0];
    const choices = generateChoices(card, deck);

    const correctCount = choices.filter(c => c.isCorrect).length;
    expect(correctCount).toBe(1);
  });

  it('generateChoices should include 3 foils from other cards', () => {
    const deck = decks[0];
    const card = deck.cards[0];
    const choices = generateChoices(card, deck);

    const foils = choices.filter(c => !c.isCorrect);
    expect(foils.length).toBe(3);

    // Each foil should be from a different card in the deck
    foils.forEach(foil => {
      const matchingCard = deck.cards.find(c => c.back === foil.text);
      expect(matchingCard).toBeDefined();
      expect(matchingCard.back).not.toBe(card.back);
    });
  });
});

describe('Progress Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updateCardProgress should save to localStorage', () => {
    const progress = {};

    // Trigger update
    updateCardProgress('test-deck', 0, true, progress);

    // Verify localStorage was called
    const savedData = localStorage.getItem('italiano-progress');
    expect(savedData).toBeTruthy();

    // Verify the data structure
    const parsedData = JSON.parse(savedData);
    expect(parsedData['test-deck_0'].box).toBe(2); // Should move to box 2
    expect(parsedData['test-deck_0'].nextReview).toBeDefined();
  });

  it('updateCardProgress should move card to box 2 on first success', () => {
    const progress = {};

    updateCardProgress('test-deck', 0, true, progress);

    expect(progress['test-deck_0'].box).toBe(2);
  });

  it('updateCardProgress should move card to box 3 on second success', () => {
    const progress = {
      'test-deck_0': { box: 2, nextReview: '2023-01-01' }
    };

    updateCardProgress('test-deck', 0, true, progress);

    expect(progress['test-deck_0'].box).toBe(3);
  });

  it('updateCardProgress should not exceed box 3', () => {
    const progress = {
      'test-deck_0': { box: 3, nextReview: '2023-01-01' }
    };

    updateCardProgress('test-deck', 0, true, progress);

    expect(progress['test-deck_0'].box).toBe(3); // Should stay at 3
  });

  it('updateCardProgress should reset to box 1 on failure', () => {
    const progress = {
      'test-deck_1': { box: 3, nextReview: '2023-01-01' }
    };

    updateCardProgress('test-deck', 1, false, progress);

    expect(progress['test-deck_1'].box).toBe(1);
  });

  it('updateCardProgress should update nextReview date', () => {
    const progress = {};

    updateCardProgress('test-deck', 0, true, progress);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 3); // Box 2 = 3 days
    const expected = tomorrow.toISOString().split('T')[0];

    expect(progress['test-deck_0'].nextReview).toBe(expected);
  });
});

describe('Card Key Generation', () => {
  it('getCardKey should combine deckId and cardIndex', () => {
    const key = getCardKey('my-deck', 5);
    expect(key).toBe('my-deck_5');
  });

  it('getCardKey should handle string indices', () => {
    const key = getCardKey('test-deck', '0');
    expect(key).toBe('test-deck_0');
  });
});

describe('Date Utilities', () => {
  it('getTodayString should return date in YYYY-MM-DD format', () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('addDays should add correct number of days', () => {
    const startDate = '2024-01-15';
    const result = addDays(startDate, 5);
    expect(result).toBe('2024-01-20');
  });

  it('addDays should handle month boundaries', () => {
    const startDate = '2024-01-30';
    const result = addDays(startDate, 5);
    expect(result).toBe('2024-02-04');
  });
});

describe('Audio Functionality', () => {
  // Mock speak function from app.js
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

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock speechSynthesis if not already mocked
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
    // Remove speechSynthesis to simulate unsupported browser
    const originalSpeechSynthesis = window.speechSynthesis;
    delete window.speechSynthesis;

    // Should not throw an error
    expect(() => speak('Test')).not.toThrow();

    // Restore
    window.speechSynthesis = originalSpeechSynthesis;
  });

  it('findBestItalianVoice should prefer high-quality voices', () => {
    // Mock function from app.js
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

    // Mock Italian voices
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

    // Mock non-Italian voices only
    const mockVoices = [
      { name: 'English US', lang: 'en-US' },
      { name: 'French', lang: 'fr-FR' },
    ];

    window.speechSynthesis.getVoices = vi.fn(() => mockVoices);

    const selectedVoice = findBestItalianVoice();

    expect(selectedVoice).toBeNull();
  });
});
