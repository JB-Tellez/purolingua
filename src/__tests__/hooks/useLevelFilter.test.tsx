import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, onTestFinished } from 'vitest';
import { useLevelFilter } from '@/hooks/useLevelFilter';

beforeEach(() => localStorage.clear());

// No "window is undefined" (SSR) tests here: removing window breaks React 19's
// react-dom inside render() (bare `window.event` read), so they can't run under
// jsdom. The hook's `typeof window` guard is covered by its window-present branch.

// Standalone localStorage mock (duplicated from setup.ts for tests that need to
// replace it entirely — e.g. quota-throw scenarios).
const makeStorageMock = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (n: number) => { const keys = Object.keys(store); return n < keys.length ? keys[n] : null; },
  } as Storage;
};

describe('useLevelFilter default values', () => {
  it('new user (hasProgress=false, no localStorage) defaults to ["A1"]', () => {
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('returning user (hasProgress=true, no localStorage) defaults to ["A1","A2"]', () => {
    const { result } = renderHook(() => useLevelFilter('it', true, 'rephrase'));
    expect(result.current.activeLevels).toEqual(['A1', 'A2']);
  });

  it('saved localStorage value takes precedence over hasProgress default', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A2']));
    const { result } = renderHook(() => useLevelFilter('it', true, 'rephrase'));
    expect(result.current.activeLevels).toEqual(['A2']);
  });

  it('corrupted localStorage falls back to default', () => {
    localStorage.setItem('it-level-filter', 'not-valid-json{{{');
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it.each([
    ['only unknown levels', ['B1']],
    ['non-string entries', [42, null]],
    ['a non-array value', { A1: true }],
  ])('a saved filter with %s falls back to the default', (_label, saved) => {
    localStorage.setItem('it-level-filter', JSON.stringify(saved));
    const { result } = renderHook(() => useLevelFilter('it', true, 'rephrase'));
    expect(result.current.activeLevels).toEqual(['A1', 'A2']);
  });

  it('unknown and duplicate entries are dropped from an otherwise valid filter', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A2', 'B1', 'A2']));
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    expect(result.current.activeLevels).toEqual(['A2']);
  });
});

describe('useLevelFilter FLTR-06 guard', () => {
  it('setActiveLevels([]) is a no-op — cannot deselect all levels', () => {
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    act(() => { result.current.setActiveLevels([]); });
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('setActiveLevels(null) is a no-op — cannot deselect all levels', () => {
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    act(() => { result.current.setActiveLevels(null); });
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('no-op does not write to localStorage', () => {
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    act(() => { result.current.setActiveLevels([]); });
    expect(localStorage.getItem('it-level-filter')).toBeNull();
  });
});

describe('useLevelFilter localStorage persistence', () => {
  it('valid setActiveLevels saves to {lang}-level-filter key', () => {
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    act(() => { result.current.setActiveLevels(['A1', 'A2']); });
    const stored = JSON.parse(localStorage.getItem('it-level-filter') ?? 'null');
    expect(stored).toEqual(['A1', 'A2']);
  });

  it('uses {lang}-level-filter — Italian and Spanish keys are independent', () => {
    const { result: itHook } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    act(() => { itHook.current.setActiveLevels(['A2']); });
    expect(localStorage.getItem('es-level-filter')).toBeNull();
  });

  it('setActiveLevels updates state when localStorage.setItem throws (quota/private browsing)', () => {
    const throwSetItem = vi.fn(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    onTestFinished(() => { Object.defineProperty(window, 'localStorage', original); }); // don't leak into later tests
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...makeStorageMock(),
        setItem: throwSetItem,
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    act(() => { result.current.setActiveLevels(['A1', 'A2']); });
    expect(result.current.activeLevels).toEqual(['A1', 'A2']);
    expect(throwSetItem).toHaveBeenCalledWith('it-level-filter', JSON.stringify(['A1', 'A2']));
  });
});

describe('useLevelFilter per activity', () => {
  const saved = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

  it('Rephrase saves to the v1.1 key {lang}-level-filter', () => {
    const { result } = renderHook(() => useLevelFilter('it', false, 'rephrase'));
    act(() => result.current.setActiveLevels(['A2']));
    expect(saved('it-level-filter')).toEqual(['A2']);
    expect(saved('it-qa-level-filter')).toBeNull();
  });

  it('Q&A saves to {lang}-qa-level-filter and leaves the Rephrase filter alone', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A1']));
    const { result } = renderHook(() => useLevelFilter('it', false, 'qa'));
    act(() => result.current.setActiveLevels(['A2']));
    expect(saved('it-qa-level-filter')).toEqual(['A2']);
    expect(saved('it-level-filter')).toEqual(['A1']);
  });

  it('each activity reads its own saved filter', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A1']));
    localStorage.setItem('it-qa-level-filter', JSON.stringify(['A2']));
    expect(renderHook(() => useLevelFilter('it', false, 'rephrase')).result.current.activeLevels).toEqual(['A1']);
    expect(renderHook(() => useLevelFilter('it', false, 'qa')).result.current.activeLevels).toEqual(['A2']);
  });

  it('Q&A starts from the previously shared filter until it saves its own (carry-over)', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A2']));
    const { result } = renderHook(() => useLevelFilter('it', false, 'qa'));
    expect(result.current.activeLevels).toEqual(['A2']);
  });

  it('a Q&A carry-over value is still validated', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['B1']));
    const { result } = renderHook(() => useLevelFilter('it', true, 'qa'));
    expect(result.current.activeLevels).toEqual(['A1', 'A2']);
  });
});
