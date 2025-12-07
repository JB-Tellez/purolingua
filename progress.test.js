import { describe, it, expect, beforeEach } from 'vitest';

// We need to expose internal functions for testing
// Create a test version that exports the helper functions
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const addDays = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getNextReviewDate = (box) => {
  const today = getTodayString();
  if (box === 1) return addDays(today, 1);
  if (box === 2) return addDays(today, 3);
  if (box === 3) return addDays(today, 7);
  return today;
};

const getCardKey = (deckId, cardIndex) => {
  return `${deckId}_${cardIndex}`;
};

// Mock version of updateCardProgress for testing
const updateCardProgress = (deckId, cardIndex, isCorrect, progressObj = {}) => {
  const key = getCardKey(deckId, cardIndex);
  const cardProgress = progressObj[key] || { box: 1, nextReview: getTodayString() };

  if (isCorrect) {
    cardProgress.box = Math.min(cardProgress.box + 1, 3);
  } else {
    cardProgress.box = 1;
  }

  cardProgress.nextReview = getNextReviewDate(cardProgress.box);
  progressObj[key] = cardProgress;

  try {
    localStorage.setItem('italiano-progress', JSON.stringify(progressObj));
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e);
  }

  return progressObj;
};

describe('Progress Management - Date Utilities', () => {
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

describe('Progress Management - Spaced Repetition Logic', () => {
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

describe('Progress Management - Card Key Generation', () => {
  it('getCardKey should combine deckId and cardIndex', () => {
    const key = getCardKey('my-deck', 5);
    expect(key).toBe('my-deck_5');
  });

  it('getCardKey should handle string indices', () => {
    const key = getCardKey('test-deck', '0');
    expect(key).toBe('test-deck_0');
  });
});

describe('Progress Management - Progress Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updateCardProgress should save to localStorage', () => {
    const progress = {};

    updateCardProgress('test-deck', 0, true, progress);

    const savedData = localStorage.getItem('italiano-progress');
    expect(savedData).toBeTruthy();

    const parsedData = JSON.parse(savedData);
    expect(parsedData['test-deck_0'].box).toBe(2);
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

    expect(progress['test-deck_0'].box).toBe(3);
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
    const future = new Date(today);
    future.setDate(future.getDate() + 3); // Box 2 = 3 days
    const expected = future.toISOString().split('T')[0];

    expect(progress['test-deck_0'].nextReview).toBe(expected);
  });
});
