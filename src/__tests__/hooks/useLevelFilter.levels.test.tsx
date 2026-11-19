// The returning-user default follows LEVELS, so adding a level needs no change
// in the hook. (Own file: the LEVELS mock would break the main file's defaults.)
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLevelFilter } from '@/hooks/useLevelFilter';

vi.mock('@/lib/levels', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/levels')>()),
  LEVELS: ['A1', 'A2', 'B1'],
}));

describe('useLevelFilter default with a new level', () => {
  it('a returning user starts with every level in LEVELS', () => {
    const { result } = renderHook(() => useLevelFilter('it', true, 'rephrase'));
    expect(result.current.activeLevels).toEqual(['A1', 'A2', 'B1']);
  });
});
