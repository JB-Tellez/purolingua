import { describe, it, expect, beforeEach } from 'vitest';
import { getActiveLevels, setActiveLevels } from '../src/js/core/state.js';
import { loadLevelFilter, saveLevelFilter, hasProgressData, loadProgress } from '../src/js/features/progress.js';

// Set the locale key before each test so getLocale() returns 'it'
// and level-filter resolves to 'it-level-filter'
beforeEach(() => {
    localStorage.setItem('language-learning-locale', 'it');
});

describe('activeLevels state — FLTR-02, FLTR-06', () => {
    it('setActiveLevels(["A1"]) sets state to ["A1"]', () => {
        setActiveLevels(['A1']);
        expect(getActiveLevels()).toEqual(['A1']);
    });

    it('setActiveLevels(["A1", "A2"]) sets state to ["A1", "A2"]', () => {
        setActiveLevels(['A1', 'A2']);
        expect(getActiveLevels()).toEqual(['A1', 'A2']);
    });

    it('setActiveLevels([]) is a no-op: state remains unchanged', () => {
        setActiveLevels(['A1', 'A2']);
        setActiveLevels([]); // no-op
        expect(getActiveLevels()).toEqual(['A1', 'A2']);
    });

    it('setActiveLevels(null) is a no-op: state remains unchanged', () => {
        setActiveLevels(['A1']);
        setActiveLevels(null); // no-op
        expect(getActiveLevels()).toEqual(['A1']);
    });

    it('getActiveLevels() returns a copy: mutating returned array does not affect internal state', () => {
        setActiveLevels(['A1']);
        const levels = getActiveLevels();
        levels.push('X2'); // mutate the copy
        // Internal state must not contain 'X2'
        expect(getActiveLevels()).not.toContain('X2');
        expect(getActiveLevels()).toEqual(['A1']);
    });
});

describe('level-filter localStorage — FLTR-05', () => {
    it('loadLevelFilter() returns null when localStorage has no key', () => {
        // localStorage is cleared before each test in vitest.setup.js,
        // then locale is re-set in our beforeEach — no level-filter key present
        expect(loadLevelFilter()).toBeNull();
    });

    it('saveLevelFilter(["A1"]) then loadLevelFilter() returns ["A1"]', () => {
        saveLevelFilter(['A1']);
        expect(loadLevelFilter()).toEqual(['A1']);
    });

    it('saveLevelFilter(["A1", "A2"]) then loadLevelFilter() returns ["A1", "A2"]', () => {
        saveLevelFilter(['A1', 'A2']);
        expect(loadLevelFilter()).toEqual(['A1', 'A2']);
    });

    it('loadLevelFilter() returns null when stored value is corrupted JSON', () => {
        localStorage.setItem('it-level-filter', 'not-valid-json{{{');
        expect(loadLevelFilter()).toBeNull();
    });
});

describe('hasProgressData — FLTR-03, FLTR-04', () => {
    it('hasProgressData() returns false after loadProgress() with empty localStorage (new user)', () => {
        loadProgress();
        expect(hasProgressData()).toBe(false);
    });

    it('hasProgressData() returns true after loadProgress() when it-progress has data (returning user)', () => {
        localStorage.setItem(
            'it-progress',
            JSON.stringify({ food_0: { box: 1, nextReview: '2026-01-01' } })
        );
        loadProgress();
        expect(hasProgressData()).toBe(true);
    });
});
