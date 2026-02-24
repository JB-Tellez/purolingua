import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import itUI from '../src/locales/it/ui.js';
import esUI from '../src/locales/es/ui.js';
import { setActiveLevels } from '../src/js/core/state.js';
import { renderFilterChips } from '../src/js/core/app.js';

// FLTR-09: i18n filter key presence
describe('FLTR-09: i18n filter key presence', () => {
    it('it locale has filters.levelA1 string', () => {
        expect(itUI.filters?.levelA1).toBeTruthy();
        expect(typeof itUI.filters?.levelA1).toBe('string');
    });
    it('it locale has filters.levelA2 string', () => {
        expect(itUI.filters?.levelA2).toBeTruthy();
        expect(typeof itUI.filters?.levelA2).toBe('string');
    });
    it('es locale has filters.levelA1 string', () => {
        expect(esUI.filters?.levelA1).toBeTruthy();
        expect(typeof esUI.filters?.levelA1).toBe('string');
    });
    it('es locale has filters.levelA2 string', () => {
        expect(esUI.filters?.levelA2).toBeTruthy();
        expect(typeof esUI.filters?.levelA2).toBe('string');
    });
});

// FLTR-01: renderFilterChips() active-state sync
describe('FLTR-01: renderFilterChips active state sync', () => {
    let chipA1, chipA2;

    beforeEach(() => {
        chipA1 = document.createElement('button');
        chipA1.className = 'filter-chip';
        chipA1.dataset.level = 'A1';
        chipA2 = document.createElement('button');
        chipA2.className = 'filter-chip';
        chipA2.dataset.level = 'A2';
        document.body.appendChild(chipA1);
        document.body.appendChild(chipA2);
    });

    afterEach(() => {
        chipA1.remove();
        chipA2.remove();
    });

    it('A1-only: A1 chip gets .active, A2 does not', () => {
        setActiveLevels(['A1']);
        renderFilterChips();
        expect(chipA1.classList.contains('active')).toBe(true);
        expect(chipA2.classList.contains('active')).toBe(false);
    });

    it('A2-only: A2 chip gets .active, A1 does not', () => {
        setActiveLevels(['A2']);
        renderFilterChips();
        expect(chipA1.classList.contains('active')).toBe(false);
        expect(chipA2.classList.contains('active')).toBe(true);
    });

    it('A1+A2: both chips get .active', () => {
        setActiveLevels(['A1', 'A2']);
        renderFilterChips();
        expect(chipA1.classList.contains('active')).toBe(true);
        expect(chipA2.classList.contains('active')).toBe(true);
    });
});
