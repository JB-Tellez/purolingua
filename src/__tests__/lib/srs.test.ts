import { describe, it, expect } from 'vitest';
import { getCardKey, getTodayString, getNextReviewDate, isCardDue, advanceBox } from '@/lib/srs';

describe('getCardKey', () => {
  it('combines deckId and cardIndex with underscore', () => {
    expect(getCardKey('daily', 0)).toBe('daily_0');
    expect(getCardKey('restaurant', 12)).toBe('restaurant_12');
  });
});

describe('getTodayString', () => {
  it('returns a YYYY-MM-DD formatted string', () => {
    expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('getNextReviewDate', () => {
  it('box 1 returns tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getNextReviewDate(1)).toBe(tomorrow.toISOString().split('T')[0]);
  });
  it('box 2 returns 3 days from now', () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(getNextReviewDate(2)).toBe(future.toISOString().split('T')[0]);
  });
  it('box 3 returns 7 days from now', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(getNextReviewDate(3)).toBe(future.toISOString().split('T')[0]);
  });
});

describe('isCardDue', () => {
  it('returns true for undefined (new card)', () => {
    expect(isCardDue(undefined)).toBe(true);
  });
  it('returns true when nextReview is a past date', () => {
    expect(isCardDue({ box: 1, nextReview: '2020-01-01' })).toBe(true);
  });
  it('returns true when nextReview is today', () => {
    expect(isCardDue({ box: 1, nextReview: getTodayString() })).toBe(true);
  });
  it('returns false when nextReview is a future date', () => {
    expect(isCardDue({ box: 2, nextReview: '2099-01-01' })).toBe(false);
  });
});

describe('advanceBox', () => {
  it('new card (undefined) correct → box 2', () => {
    const result = advanceBox(undefined, true);
    expect(result.box).toBe(2);
    expect(result.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('box 1 correct → box 2', () => {
    expect(advanceBox({ box: 1, nextReview: '2026-01-01' }, true).box).toBe(2);
  });
  it('box 2 correct → box 3', () => {
    expect(advanceBox({ box: 2, nextReview: '2026-01-01' }, true).box).toBe(3);
  });
  it('box 3 correct → stays box 3 (max)', () => {
    expect(advanceBox({ box: 3, nextReview: '2026-01-01' }, true).box).toBe(3);
  });
  it('any box incorrect → box 1', () => {
    expect(advanceBox({ box: 1, nextReview: '2026-01-01' }, false).box).toBe(1);
    expect(advanceBox({ box: 2, nextReview: '2026-01-01' }, false).box).toBe(1);
    expect(advanceBox({ box: 3, nextReview: '2026-01-01' }, false).box).toBe(1);
  });
  it('incorrect result always has a nextReview date string', () => {
    const result = advanceBox({ box: 3, nextReview: '2026-01-01' }, false);
    expect(result.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
