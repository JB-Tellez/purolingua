import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useQASRS } from '@/hooks/useQASRS';
import type { QACard } from '@/types';

// Inline fixture — no import from src/data/qa/
const mockCards: QACard[] = [
  {
    id: 'test_01',
    question: 'Q1?',
    correct: 'C1',
    foils: ['F1', 'F2', 'F3'],
    questionEs: 'P1?',
    correctEs: 'R1',
    foilsEs: ['D1', 'D2', 'D3'],
    level: 'A1',
  },
  {
    id: 'test_02',
    question: 'Q2?',
    correct: 'C2',
    foils: ['F4', 'F5', 'F6'],
    questionEs: 'P2?',
    correctEs: 'R2',
    foilsEs: ['D4', 'D5', 'D6'],
    level: 'A2',
  },
];

beforeEach(() => localStorage.clear());

describe('useQASRS initial state', () => {
  it('starts with empty progress (hasProgress = false)', () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    expect(result.current.hasProgress).toBe(false);
  });

  it('all cards are dueCards for a new user with no progress', () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    expect(result.current.dueCards).toHaveLength(2);
  });
});

describe('useQASRS level filtering', () => {
  it("activeLevels=['A1'] excludes A2 cards from dueCards", () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1'])
    );
    expect(result.current.dueCards).toHaveLength(1);
    expect(result.current.dueCards[0].id).toBe('test_01');
  });

  it("activeLevels=['A2'] excludes A1 cards from dueCards", () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A2'])
    );
    expect(result.current.dueCards).toHaveLength(1);
    expect(result.current.dueCards[0].id).toBe('test_02');
  });

  it("activeLevels=['A1','A2'] includes all due cards", () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    expect(result.current.dueCards).toHaveLength(2);
  });
});

describe('useQASRS updateCard', () => {
  it("updateCard stores key 'qa_coffee_test_01' in 'it-progress'", () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    act(() => { result.current.updateCard('test_01', true); });
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['qa_coffee_test_01']).toBeDefined();
  });

  it('correct answer advances box from undefined to 2', () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    act(() => { result.current.updateCard('test_01', true); });
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['qa_coffee_test_01'].box).toBe(2);
  });

  it('incorrect answer resets box to 1', () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    act(() => { result.current.updateCard('test_01', false); });
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['qa_coffee_test_01'].box).toBe(1);
  });

  it('after updateCard, hasProgress becomes true', () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    act(() => { result.current.updateCard('test_01', true); });
    expect(result.current.hasProgress).toBe(true);
  });

  it('answered card is removed from dueCards (nextReview in future)', () => {
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    act(() => { result.current.updateCard('test_01', true); });
    const ids = result.current.dueCards.map(c => c.id);
    expect(ids).not.toContain('test_01');
  });
});

describe('useQASRS key isolation', () => {
  it("Q&A key 'qa_coffee_test_01' does not conflict with Rephrase key 'caffe_test_01'", () => {
    // Pre-seed a Rephrase key in localStorage
    localStorage.setItem('it-progress', JSON.stringify({ 'caffe_test_01': { box: 3, nextReview: '2099-01-01' } }));
    const { result } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    // The Q&A hook should still see both cards as due (qa_coffee_test_01 has no progress)
    expect(result.current.dueCards).toHaveLength(2);
  });

  it('it-progress and es-progress are independent', () => {
    const { result: itHook } = renderHook(() =>
      useQASRS('it', 'coffee', mockCards, ['A1', 'A2'])
    );
    const { result: esHook } = renderHook(() =>
      useQASRS('es', 'coffee', mockCards, ['A1', 'A2'])
    );
    act(() => { itHook.current.updateCard('test_01', true); });
    expect(esHook.current.hasProgress).toBe(false);
    expect(localStorage.getItem('es-progress')).toBeNull();
  });
});
