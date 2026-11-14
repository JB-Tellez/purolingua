// End-of-session screens with the REAL useSRS / useLevelFilter and localStorage.
// StudySession.test.tsx mocks useSRS with due-checks that ignore updateCard, so it
// cannot see whether the just-answered card is counted after it is saved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import StudySession from '@/app/[lang]/rephrase/[deck]/StudySession';
import { DECK_MAP } from '@/data/deckMap';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}(${JSON.stringify(params)})` : key,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/useVoiceRecognition', () => ({
  useVoiceRecognition: () => ({ isSupported: false, isListening: false, startListening: vi.fn() }),
}));

vi.mock('@/data/decks', () => ({
  deckMetadata: [
    { id: 'daily', lang: 'it', i18nKey: 'daily', icon: '', theme: 'teal', cardCount: 2 },
    { id: 'restaurant', lang: 'it', i18nKey: 'restaurant', icon: '', theme: 'red', cardCount: 1 },
    { id: 'daily', lang: 'es', i18nKey: 'daily', icon: '', theme: 'teal', cardCount: 1 },
  ],
}));

vi.mock('@/data/deckMap', () => ({
  DECK_MAP: {
    it: {
      daily: [
        { front: 'Ciao', back: 'Hello', level: 'A1' },        // index 0: the one due card
        { front: 'Grazie', back: 'Thank you', level: 'A1' },  // index 1: seeded as not due
      ],
      restaurant: [{ front: 'Il conto', back: 'The bill', level: 'A1' }],
    },
    es: {
      daily: [{ front: 'Hola', back: 'Hello', level: 'A1' }], // always due; must be ignored for 'it'
    },
  },
}));

const FUTURE = { box: 3, nextReview: '2099-01-01' };

function seed(progress: Record<string, unknown>) {
  localStorage.setItem('it-level-filter', JSON.stringify(['A1', 'A2']));
  localStorage.setItem('it-progress', JSON.stringify(progress));
}

function renderDaily() {
  render(<StudySession lang="it" deckId="daily" cards={DECK_MAP.it.daily} />);
}

function answer(text: string) {
  act(() => { fireEvent.click(screen.getByRole('button', { name: new RegExp(text) })); });
  act(() => { vi.advanceTimersByTime(600); });
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('StudySession end screens (real SRS state)', () => {
  it('shows allDone after correctly answering the last due card in the language', () => {
    seed({ daily_1: FUTURE, restaurant_0: FUTURE });
    renderDaily();
    answer('Hello');
    expect(screen.getByText('allDone')).toBeInTheDocument();
    expect(screen.queryByText('deckComplete')).toBeNull();
  });

  it('shows allDone after a wrong answer on the last due card (it is due again tomorrow, not today)', () => {
    seed({ daily_1: FUTURE, restaurant_0: FUTURE });
    renderDaily();
    answer('Thank you');
    expect(screen.getByText('allDone')).toBeInTheDocument();
  });

  it('shows allDone when the last card is finished with the Next button', () => {
    seed({ daily_1: FUTURE, restaurant_0: FUTURE });
    renderDaily();
    act(() => { (document.querySelector('.card-container') as HTMLElement).click(); });
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'nextButton' })); });
    expect(screen.getByText('allDone')).toBeInTheDocument();
  });

  it('shows deckComplete when another deck in the language still has a due card', () => {
    seed({ daily_1: FUTURE }); // restaurant_0 has no record → due
    renderDaily();
    answer('Hello');
    expect(screen.getByText('deckComplete')).toBeInTheDocument();
    expect(screen.queryByText('allDone')).toBeNull();
  });
});
