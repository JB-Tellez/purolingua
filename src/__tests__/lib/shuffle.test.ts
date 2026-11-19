import { describe, it, expect, vi } from 'vitest';
import { shuffle } from '@/lib/shuffle';

describe('shuffle', () => {
  it('returns the same items in a new array, leaving the input unchanged', () => {
    const input = [1, 2, 3, 4];
    const result = shuffle(input);
    expect(result).not.toBe(input);
    expect(input).toEqual([1, 2, 3, 4]);
    expect([...result].sort()).toEqual([1, 2, 3, 4]);
  });

  it('is a Fisher-Yates shuffle: Math.random() = 0 rotates left by one', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(shuffle(['a', 'b', 'c', 'd'])).toEqual(['b', 'c', 'd', 'a']);
  });

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['x'])).toEqual(['x']);
  });
});
