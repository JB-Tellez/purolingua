import { describe, it, expect } from 'vitest';
import { LEVELS, isLevel } from '@/lib/levels';

describe('LEVELS', () => {
  it('lists every CEFR level the app uses, in order', () => {
    expect(LEVELS).toEqual(['A1', 'A2']);
  });
});

describe('isLevel', () => {
  it.each(['A1', 'A2'])('accepts %s', (v) => expect(isLevel(v)).toBe(true));
  it.each(['B1', 'a1', '', 42, null, undefined])('rejects %j', (v) => expect(isLevel(v)).toBe(false));
});
