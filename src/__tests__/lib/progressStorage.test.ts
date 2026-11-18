import { describe, it, expect, vi, afterEach } from 'vitest';
import { clearProgress, loadProgress, saveProgress } from '@/lib/progressStorage';

const record = { daily_0: { box: 2, nextReview: '2099-01-01' } };

afterEach(() => { vi.restoreAllMocks(); });

describe('loadProgress', () => {
  it('returns {} when nothing is saved', () => {
    expect(loadProgress('it')).toEqual({});
  });

  it('reads the {lang}-progress key', () => {
    localStorage.setItem('it-progress', JSON.stringify(record));
    expect(loadProgress('it')).toEqual(record);
    expect(loadProgress('es')).toEqual({});
  });

  it('returns {} when the saved value is not valid JSON', () => {
    localStorage.setItem('it-progress', '{not json');
    expect(loadProgress('it')).toEqual({});
  });
});

describe('saveProgress', () => {
  it('writes the record as JSON under {lang}-progress', () => {
    saveProgress('es', record);
    expect(JSON.parse(localStorage.getItem('es-progress')!)).toEqual(record);
  });

  it('does not throw when storage is full or unavailable', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    expect(() => saveProgress('it', record)).not.toThrow();
  });
});

describe('clearProgress', () => {
  it("removes only that language's progress", () => {
    saveProgress('it', record);
    saveProgress('es', record);
    localStorage.setItem('it-level-filter', '["A2"]');
    clearProgress('it');
    expect(localStorage.getItem('it-progress')).toBeNull();
    expect(loadProgress('es')).toEqual(record);
    expect(localStorage.getItem('it-level-filter')).toBe('["A2"]');
  });
});

describe('clearProgress when storage is unavailable', () => {
  it('does not throw (blocked site data), like load and save', () => {
    vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    expect(() => clearProgress('it')).not.toThrow();
  });
});
