import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLevelFilter } from '@/hooks/useLevelFilter';

beforeEach(() => localStorage.clear());

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
});
