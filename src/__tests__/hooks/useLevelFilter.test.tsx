import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    const { result } = renderHook(() => useLevelFilter('it', false));
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('returning user (hasProgress=true, no localStorage) defaults to ["A1","A2"]', () => {
    const { result } = renderHook(() => useLevelFilter('it', true));
    expect(result.current.activeLevels).toEqual(['A1', 'A2']);
  });

  it('saved localStorage value takes precedence over hasProgress default', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A2']));
    const { result } = renderHook(() => useLevelFilter('it', true));
    expect(result.current.activeLevels).toEqual(['A2']);
  });

  it('corrupted localStorage falls back to default', () => {
    localStorage.setItem('it-level-filter', 'not-valid-json{{{');
    const { result } = renderHook(() => useLevelFilter('it', false));
    expect(result.current.activeLevels).toEqual(['A1']);
  });
});

describe('useLevelFilter FLTR-06 guard', () => {
  it('setActiveLevels([]) is a no-op — cannot deselect all levels', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels([]); });
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('setActiveLevels(null) is a no-op — cannot deselect all levels', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels(null); });
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('no-op does not write to localStorage', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels([]); });
    expect(localStorage.getItem('it-level-filter')).toBeNull();
  });
});

describe('useLevelFilter localStorage persistence', () => {
  it('valid setActiveLevels saves to {lang}-level-filter key', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels(['A1', 'A2']); });
    const stored = JSON.parse(localStorage.getItem('it-level-filter') ?? 'null');
    expect(stored).toEqual(['A1', 'A2']);
  });

  it('uses {lang}-level-filter — Italian and Spanish keys are independent', () => {
    const { result: itHook } = renderHook(() => useLevelFilter('it', false));
    act(() => { itHook.current.setActiveLevels(['A2']); });
    expect(localStorage.getItem('es-level-filter')).toBeNull();
  });

  it('setActiveLevels updates state when localStorage.setItem throws (quota/private browsing)', () => {
    const throwSetItem = vi.fn(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...makeStorageMock(),
        setItem: throwSetItem,
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels(['A1', 'A2']); });
    expect(result.current.activeLevels).toEqual(['A1', 'A2']);
    expect(throwSetItem).toHaveBeenCalledWith('it-level-filter', JSON.stringify(['A1', 'A2']));
  });
});
