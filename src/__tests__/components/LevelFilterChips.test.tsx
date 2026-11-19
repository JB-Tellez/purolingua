import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LevelFilterChips from '@/components/LevelFilterChips';
import type { Level } from '@/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function renderChips(activeLevels: Level[]) {
  const setActiveLevels = vi.fn();
  render(<LevelFilterChips lang="it" activeLevels={activeLevels} setActiveLevels={setActiveLevels} />);
  return setActiveLevels;
}

const chip = (level: Level) => screen.getByRole('button', { name: `chips.${level}` });

describe('LevelFilterChips', () => {
  it('renders one chip per level, in order', () => {
    renderChips(['A1']);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['chips.A1', 'chips.A2']);
  });

  it('marks active levels as pressed', () => {
    renderChips(['A2']);
    expect(chip('A1')).toHaveAttribute('aria-pressed', 'false');
    expect(chip('A2')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('A2')).toHaveClass('filter-chip', 'active');
  });

  it('turning a level on adds it', () => {
    const set = renderChips(['A1']);
    fireEvent.click(chip('A2'));
    expect(set).toHaveBeenCalledWith(['A1', 'A2']);
  });

  it('turning a level off removes it', () => {
    const set = renderChips(['A1', 'A2']);
    fireEvent.click(chip('A1'));
    expect(set).toHaveBeenCalledWith(['A2']);
  });

  it('turning off the last level passes [] and relies on the setter to ignore it (FLTR-06)', () => {
    const set = renderChips(['A1']);
    fireEvent.click(chip('A1'));
    expect(set).toHaveBeenCalledWith([]);
  });
});

describe('LevelFilterChips label', () => {
  it('names the chip group, so screen readers announce the filter label', () => {
    renderChips(['A1']);
    expect(screen.getByRole('group', { name: 'label' })).toBeInTheDocument();
  });
});
