import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DeckGrid from '@/components/DeckGrid';
import type { Level } from '@/types';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// One Italian deck
vi.mock('@/data/decks', () => ({
  deckMetadata: [
    { id: 'daily', lang: 'it', icon: '☀️', theme: 'yellow' },
  ],
}));

// 'daily' has 2 A1 cards (indices 0, 1) and 1 A2 card (index 2)
vi.mock('@/data/deckMap', () => ({
  DECK_MAP: {
    it: {
      daily: [
        { front: 'Ciao',   back: 'Hello',        level: 'A1' },
        { front: 'Grazie', back: 'Thank you',    level: 'A1' },
        { front: 'Buona',  back: 'Good morning', level: 'A2' },
      ],
    },
    es: {},
  },
}));

// Controllable SRS mock; overridden per test
let isDueImpl: (id: string, i: number) => boolean = () => true;

vi.mock('@/hooks/useSRS', () => ({
  useSRS: () => ({
    isCardDueForDeck: (id: string, i: number) => isDueImpl(id, i),
    updateCard: vi.fn(),
    hasProgress: false,
    progress: {},
  }),
}));

const A1: Level[] = ['A1'];

beforeEach(() => { isDueImpl = () => true; });

// ---------------------------------------------------------------------------
// DeckGrid badge tests
// ---------------------------------------------------------------------------

describe('DeckGrid badge', () => {
  it('A: shows the live due count, not the deck size', () => {
    isDueImpl = (_id, i) => i === 0;
    render(<DeckGrid lang="it" activeLevels={A1} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.queryByText('2')).toBeNull();
  });

  it('B: counts every due card in the active levels', () => {
    render(<DeckGrid lang="it" activeLevels={A1} />);
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('C: shows a checkmark (✓) when 0 cards are due', () => {
    isDueImpl = () => false;
    render(<DeckGrid lang="it" activeLevels={A1} />);
    expect(screen.getByText('✓')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('D: follows the activeLevels prop, so the filter chips update the badge', () => {
    const { rerender } = render(<DeckGrid lang="it" activeLevels={A1} />);
    expect(screen.getByText('2')).toBeTruthy();
    rerender(<DeckGrid lang="it" activeLevels={['A1', 'A2']} />);
    expect(screen.getByText('3')).toBeTruthy();
  });
});

describe('DeckGrid links', () => {
  it('links each deck to its study route', () => {
    render(<DeckGrid lang="it" activeLevels={A1} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/it/rephrase/daily');
  });
});
