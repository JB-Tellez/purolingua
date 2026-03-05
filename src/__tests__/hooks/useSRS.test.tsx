import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSRS } from '@/hooks/useSRS';

beforeEach(() => localStorage.clear());

describe('useSRS initial state', () => {
  it('starts with empty progress for new user', () => {
    const { result } = renderHook(() => useSRS('it'));
    expect(result.current.hasProgress).toBe(false);
  });

  it('isCardDueForDeck returns true for a new (never-answered) card', () => {
    const { result } = renderHook(() => useSRS('it'));
    expect(result.current.isCardDueForDeck('daily', 0)).toBe(true);
  });
});

describe('useSRS updateCard', () => {
  it('updateCard persists to localStorage under {lang}-progress key', () => {
    const { result } = renderHook(() => useSRS('it'));
    act(() => { result.current.updateCard('daily', 0, true); });
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['daily_0'].box).toBe(2);
    expect(stored['daily_0'].nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('updateCard(correct=false) resets box to 1', () => {
    const { result } = renderHook(() => useSRS('it'));
    act(() => { result.current.updateCard('daily', 0, true); });  // box → 2
    act(() => { result.current.updateCard('daily', 0, false); }); // box → 1
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['daily_0'].box).toBe(1);
  });

  it('after updateCard hasProgress becomes true', () => {
    const { result } = renderHook(() => useSRS('it'));
    act(() => { result.current.updateCard('daily', 0, true); });
    expect(result.current.hasProgress).toBe(true);
  });
});

describe('useSRS language isolation', () => {
  it('it-progress and es-progress are independent storage keys', () => {
    const { result: itHook } = renderHook(() => useSRS('it'));
    const { result: esHook } = renderHook(() => useSRS('es'));
    act(() => { itHook.current.updateCard('daily', 0, true); });
    expect(esHook.current.hasProgress).toBe(false);
    expect(localStorage.getItem('es-progress')).toBeNull();
  });
});

describe('useSRS isCardDueForDeck', () => {
  it('returns false for a just-answered card (box advanced, nextReview in future)', () => {
    const { result } = renderHook(() => useSRS('it'));
    act(() => { result.current.updateCard('daily', 0, true); });
    // After correct answer: nextReview = tomorrow → not due today
    expect(result.current.isCardDueForDeck('daily', 0)).toBe(false);
  });
});
