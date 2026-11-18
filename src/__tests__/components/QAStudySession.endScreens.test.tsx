// End-of-session screens with the REAL useQASRS / useLevelFilter / isCardDue and
// localStorage. QAStudySession.test.tsx mocks useQASRS and isCardDue, so it cannot
// see whether the just-answered card is counted after it is saved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import QAStudySession from '@/app/[lang]/qa/[scenario]/QAStudySession';
import { scenarios } from '@/data/qa';
import type { Scenario } from '@/types';

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

vi.mock('@/data/qa', () => {
  const card = (id: string, correct: string) => ({
    id,
    question: `${id}?`,
    correct,
    foils: [`${id} foil 1`, `${id} foil 2`, `${id} foil 3`],
    questionEs: `${id} es?`,
    correctEs: `${correct} es`,
    foilsEs: [`${id} es 1`, `${id} es 2`, `${id} es 3`],
    level: 'A1',
  });
  return {
    scenarios: [
      { id: 'coffee', icon: '', titleIt: '', titleEs: '', level: 'A1', cards: [card('coffee_01', 'Un caffè')] },
      { id: 'hotel', icon: '', titleIt: '', titleEs: '', level: 'A1', cards: [card('hotel_01', 'Una camera')] },
    ],
  };
});

const FUTURE = { box: 3, nextReview: '2099-01-01' };

function seed(progress: Record<string, unknown>) {
  localStorage.setItem('it-level-filter', JSON.stringify(['A1', 'A2']));
  localStorage.setItem('it-progress', JSON.stringify(progress));
}

function renderCoffee() {
  render(<QAStudySession lang="it" scenario={scenarios[0] as Scenario} />);
}

function answerCorrectly() {
  act(() => { fireEvent.click(screen.getByRole('button', { name: /Un caffè/ })); });
  act(() => { vi.advanceTimersByTime(600); });
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('QAStudySession end screens (real SRS state)', () => {
  it('shows allScenariosDone after answering the last due card across all scenarios', () => {
    seed({ qa_hotel_hotel_01: FUTURE });
    renderCoffee();
    answerCorrectly();
    expect(screen.getByText('allScenariosDone')).toBeInTheDocument();
    expect(screen.queryByText('scenarioDone')).toBeNull();
  });

  it('shows scenarioDone when another scenario still has a due card', () => {
    seed({}); // hotel_01 has no record → due
    renderCoffee();
    answerCorrectly();
    expect(screen.getByText('scenarioDone')).toBeInTheDocument();
    expect(screen.queryByText('allScenariosDone')).toBeNull();
  });
});

describe('QAStudySession answer recording (real SRS state)', () => {
  const DUE_BOX_2 = { box: 2, nextReview: '2000-01-01' };
  const saved = () => JSON.parse(localStorage.getItem('it-progress') ?? '{}');

  function missThenRetry(foil: string, correct: string) {
    act(() => { fireEvent.click(screen.getByRole('button', { name: new RegExp(foil) })); });
    act(() => { vi.advanceTimersByTime(800); }); // choices reset for a retry
    act(() => { fireEvent.click(screen.getByRole('button', { name: new RegExp(correct) })); });
    act(() => { vi.advanceTimersByTime(600); });
  }

  it('a card answered correctly on the first try moves up a box', () => {
    seed({ qa_coffee_coffee_01: DUE_BOX_2, qa_hotel_hotel_01: FUTURE });
    renderCoffee();
    answerCorrectly();
    expect(saved().qa_coffee_coffee_01.box).toBe(3);
  });

  it('a card missed before the correct retry is recorded as wrong (back to box 1)', () => {
    seed({ qa_coffee_coffee_01: DUE_BOX_2, qa_hotel_hotel_01: FUTURE });
    renderCoffee();
    missThenRetry('coffee_01 foil 1', 'Un caffè');
    expect(saved().qa_coffee_coffee_01.box).toBe(1);
  });

  it('a miss on one card does not count against the next card', () => {
    seed({ qa_coffee_coffee_01: DUE_BOX_2, qa_coffee_hotel_01: DUE_BOX_2, qa_hotel_hotel_01: FUTURE });
    const twoCards = { ...scenarios[0], cards: [scenarios[0].cards[0], scenarios[1].cards[0]] } as Scenario;
    render(<QAStudySession lang="it" scenario={twoCards} />);
    missThenRetry('coffee_01 foil 1', 'Un caffè');
    act(() => { fireEvent.click(screen.getByRole('button', { name: /Una camera/ })); });
    act(() => { vi.advanceTimersByTime(600); });
    expect(saved().qa_coffee_coffee_01.box).toBe(1);
    expect(saved().qa_coffee_hotel_01.box).toBe(3);
  });
});

describe('QAStudySession "Study again" practice replay (real SRS state)', () => {
  const saved = () => JSON.parse(localStorage.getItem('it-progress') ?? '{}');
  const studyAgain = () => act(() => { fireEvent.click(screen.getByRole('button', { name: 'studyAgain' })); });

  it('replays the session cards', () => {
    seed({ qa_hotel_hotel_01: FUTURE });
    renderCoffee();
    answerCorrectly();
    studyAgain();
    expect(screen.getByRole('button', { name: /Un caffè/ })).toBeInTheDocument();
  });

  it('does not save answers given during the replay', () => {
    seed({ qa_hotel_hotel_01: FUTURE });
    renderCoffee();
    answerCorrectly();
    const afterSession = saved();
    studyAgain();
    act(() => { fireEvent.click(screen.getByRole('button', { name: /coffee_01 foil 1/ })); });
    act(() => { vi.advanceTimersByTime(800); });
    answerCorrectly();
    expect(saved()).toEqual(afterSession);
    expect(screen.getByText('allScenariosDone')).toBeInTheDocument();
  });

  it('is not offered when the session started with no due cards', () => {
    seed({ qa_coffee_coffee_01: FUTURE, qa_hotel_hotel_01: FUTURE });
    renderCoffee();
    expect(screen.getByText('allScenariosDone')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'studyAgain' })).toBeNull();
  });
});

describe('QAStudySession default level filter (real storage)', () => {
  it('a user with only Rephrase progress gets the returning-user default (A1 + A2), like the Q&A list page', () => {
    localStorage.setItem('it-progress', JSON.stringify({ daily_0: FUTURE })); // no saved level filter
    const a2Scenario = { ...scenarios[0], cards: [{ ...scenarios[0].cards[0], level: 'A2' }] } as Scenario;
    render(<QAStudySession lang="it" scenario={a2Scenario} />);
    expect(screen.getByRole('button', { name: /Un caffè/ })).toBeInTheDocument();
  });
});
