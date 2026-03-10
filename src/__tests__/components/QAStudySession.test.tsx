import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import type { Scenario } from '@/types';
// Static import — brackets in path are literal directory names in Next.js App Router
import QAStudySession from '@/app/[lang]/qa/[scenario]/QAStudySession';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}(${JSON.stringify(params)})`;
    return key;
  },
}));
vi.mock('@/hooks/useQASRS', () => ({ useQASRS: vi.fn() }));
vi.mock('@/hooks/useVoiceRecognition', () => ({ useVoiceRecognition: vi.fn() }));
vi.mock('@/hooks/useLevelFilter', () => ({
  useLevelFilter: () => ({ activeLevels: ['A1', 'A2'] }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock @/data/qa to return 2 scenarios for all-done tests
vi.mock('@/data/qa', () => ({
  scenarios: [
    {
      id: 'coffee',
      icon: '☕',
      titleIt: 'Al Caffè',
      titleEs: 'En el Café',
      level: 'A1',
      cards: [
        {
          id: 'coffee_01',
          question: 'Che cosa prendi?',
          correct: 'Un caffè, grazie.',
          foils: ['Il conto, per favore.', 'No, grazie.', 'Vorrei dell\'acqua.'],
          questionEs: '¿Qué tomas?',
          correctEs: 'Un café, gracias.',
          foilsEs: ['La cuenta, por favor.', 'No, gracias.', 'Quiero agua.'],
          level: 'A1',
        },
      ],
    },
    {
      id: 'hotel',
      icon: '🏨',
      titleIt: 'All\'Albergo',
      titleEs: 'En el Hotel',
      level: 'A1',
      cards: [
        {
          id: 'hotel_01',
          question: 'Avete una camera libera?',
          correct: 'Sì, abbiamo una camera singola.',
          foils: ['No, siamo al completo.', 'Buonasera.', 'Il bagno è in fondo.'],
          questionEs: '¿Tienen habitación disponible?',
          correctEs: 'Sí, tenemos una habitación individual.',
          foilsEs: ['No, estamos completos.', 'Buenas tardes.', 'El baño está al fondo.'],
          level: 'A1',
        },
      ],
    },
  ],
}));

// Mock @/lib/srs isCardDue — controlled per test
let isCardDueImpl: (progress: unknown) => boolean = () => true;
vi.mock('@/lib/srs', () => ({
  isCardDue: (progress: unknown) => isCardDueImpl(progress),
}));

// ---------------------------------------------------------------------------
// Mock control helpers — configured before each test
// ---------------------------------------------------------------------------

import { useQASRS } from '@/hooks/useQASRS';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

const mockUpdateCard = vi.fn();
const mockIsCardDueForScenario = vi.fn(() => true);
let mockStartListening: ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Test fixture: 2-card scenario
// ---------------------------------------------------------------------------

const mockScenario: Scenario = {
  id: 'coffee',
  icon: '☕',
  titleIt: 'Al Caffè',
  titleEs: 'En el Café',
  level: 'A1',
  cards: [
    {
      id: 'coffee_01',
      question: 'Che cosa prendi?',
      correct: 'Un caffè, grazie.',
      foils: ['Il conto, per favore.', 'No, grazie.', 'Vorrei dell\'acqua.'],
      questionEs: '¿Qué tomas?',
      correctEs: 'Un café, gracias.',
      foilsEs: ['La cuenta, por favor.', 'No, gracias.', 'Quiero agua.'],
      level: 'A1',
    },
    {
      id: 'coffee_02',
      question: 'Vorrebbe altro?',
      correct: 'No, grazie.',
      foils: ['Sì, un\'altra pasta.', 'Il conto, per favore.', 'Un caffè, grazie.'],
      questionEs: '¿Quiere algo más?',
      correctEs: 'No, gracias.',
      foilsEs: ['Sí, otro pastel.', 'La cuenta, por favor.', 'Un café, gracias.'],
      level: 'A1',
    },
  ],
};

// Default useQASRS mock: 2 due cards, fresh progress
function setupDefaultQASRSMock(overrides?: Partial<ReturnType<typeof useQASRS>>) {
  (useQASRS as ReturnType<typeof vi.fn>).mockReturnValue({
    dueCards: mockScenario.cards,
    updateCard: mockUpdateCard,
    isCardDueForScenario: mockIsCardDueForScenario,
    hasProgress: false,
    progress: {},
    ...overrides,
  });
}

// Default useVoiceRecognition mock: isSupported=true, not listening
function setupVoiceRecognitionMock(overrides?: Partial<{ isSupported: boolean; isListening: boolean; startListening: ReturnType<typeof vi.fn> }>) {
  mockStartListening = vi.fn();
  (useVoiceRecognition as ReturnType<typeof vi.fn>).mockReturnValue({
    isSupported: true,
    isListening: false,
    startListening: mockStartListening,
    ...overrides,
  });
}

function renderQAStudySession(lang: 'it' | 'es' = 'it') {
  return render(<QAStudySession lang={lang} scenario={mockScenario} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  isCardDueImpl = () => true;
  mockIsCardDueForScenario.mockReturnValue(true);
  setupDefaultQASRSMock();
  setupVoiceRecognitionMock();
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('QAStudySession', () => {
  it('renders question text and audio button on card face', () => {
    renderQAStudySession('it');

    // Question text rendered
    expect(screen.getByText('Che cosa prendi?')).toBeInTheDocument();

    // AudioButton renders as button with audio-btn class
    const audioBtn = document.querySelector('.audio-btn');
    expect(audioBtn).toBeInTheDocument();
  });

  it('renders exactly 4 choice buttons (1 correct + 3 foils)', () => {
    renderQAStudySession('it');

    // ChoiceButton renders as .quiz-btn
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    expect(choiceButtons).toHaveLength(4);
  });

  it('tapping correct choice shows correct feedback state', () => {
    vi.useFakeTimers();
    renderQAStudySession('it');

    const choiceButtons = document.querySelectorAll('.quiz-btn');
    // Find the correct choice button (text matches card's correct answer)
    const correctBtn = Array.from(choiceButtons).find(
      (btn) => btn.textContent?.includes('Un caffè, grazie.')
    ) as HTMLElement;

    expect(correctBtn).toBeTruthy();
    act(() => {
      correctBtn.click();
    });

    // Correct button should have 'correct' class
    expect(correctBtn).toHaveClass('correct');

    // FeedbackMessage renders role="status" with correct feedback
    const feedback = screen.getByRole('status');
    expect(feedback).toBeInTheDocument();
    expect(feedback.textContent).toBe('correct');

    vi.useRealTimers();
  });

  it('tapping incorrect choice shows incorrect feedback state', () => {
    vi.useFakeTimers();
    renderQAStudySession('it');

    const choiceButtons = document.querySelectorAll('.quiz-btn');
    // Find a foil button
    const foilBtn = Array.from(choiceButtons).find(
      (btn) => btn.textContent?.includes('Il conto, per favore.')
    ) as HTMLElement;

    expect(foilBtn).toBeTruthy();
    act(() => {
      foilBtn.click();
    });

    // The clicked foil should have 'incorrect' class
    expect(foilBtn).toHaveClass('incorrect');

    // The correct answer should be highlighted
    const correctBtn = Array.from(document.querySelectorAll('.quiz-btn')).find(
      (btn) => btn.textContent?.includes('Un caffè, grazie.')
    ) as HTMLElement;
    expect(correctBtn).toHaveClass('correct');

    vi.useRealTimers();
  });

  it('auto-advances to next card after 600ms delay', () => {
    vi.useFakeTimers();
    renderQAStudySession('it');

    // Question text before click
    expect(screen.getByText('Che cosa prendi?')).toBeInTheDocument();

    // Explicitly click the correct answer button (not choiceButtons[0] which may be a foil after shuffle)
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    const correctBtn = Array.from(choiceButtons).find(
      (btn) => btn.textContent?.includes('Un caffè, grazie.')
    ) as HTMLElement;

    expect(correctBtn).toBeTruthy();

    act(() => {
      correctBtn.click();
    });

    // Before timer: still on first card
    expect(screen.getByText('Che cosa prendi?')).toBeInTheDocument();

    // After 600ms: advances to next card
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Should now show second card's question
    expect(screen.getByText('Vorrebbe altro?')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('wrong answer does not auto-advance — buttons reset after 800ms', () => {
    vi.useFakeTimers();
    renderQAStudySession('it');

    // First card question is shown
    expect(screen.getByText('Che cosa prendi?')).toBeInTheDocument();

    // Click a foil button
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    const foilBtn = Array.from(choiceButtons).find(
      (btn) => btn.textContent?.includes('Il conto, per favore.')
    ) as HTMLElement;

    expect(foilBtn).toBeTruthy();

    act(() => {
      foilBtn.click();
    });

    // After 599ms: still on the first card (no advance)
    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(screen.getByText('Che cosa prendi?')).toBeInTheDocument();

    // After 800ms total (another 201ms): buttons should be interactive again (selectedChoice reset)
    act(() => {
      vi.advanceTimersByTime(201);
    });

    // Buttons are no longer disabled — selectedChoice was reset to null
    const buttonsAfterReset = document.querySelectorAll('.quiz-btn');
    buttonsAfterReset.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });

    // updateCard was NOT called — wrong answer does not trigger SRS update
    expect(mockUpdateCard).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('mic button appears when isSupported; spoken match triggers correct feedback', () => {
    vi.useFakeTimers();
    renderQAStudySession('it');

    // MicButton renders when isSupported=true
    const micBtn = screen.getByRole('button', { name: /start speaking/i });
    expect(micBtn).toBeInTheDocument();

    // Click mic button
    act(() => {
      micBtn.click();
    });

    // startListening was called
    expect(mockStartListening).toHaveBeenCalled();

    // Fire the onResult callback with the correct answer
    const [[onResult]] = mockStartListening.mock.calls;
    act(() => {
      onResult('Un caffè, grazie.');
    });

    // Correct feedback shown
    const feedback = screen.getByRole('status');
    expect(feedback.textContent).toBe('correct');

    // updateCard called with correct answer (isCorrect=true)
    // (happens after 600ms setTimeout)
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(mockUpdateCard).toHaveBeenCalledWith('coffee_01', true);

    vi.useRealTimers();
  });

  it('spoken non-match sets notRecognized feedback, no SRS update', () => {
    vi.useFakeTimers();
    renderQAStudySession('it');

    const micBtn = screen.getByRole('button', { name: /start speaking/i });
    act(() => {
      micBtn.click();
    });

    // Fire onResult with a non-matching phrase
    const [[onResult]] = mockStartListening.mock.calls;
    act(() => {
      onResult('something completely wrong');
    });

    // notRecognized feedback shown
    const feedback = screen.getByRole('status');
    expect(feedback.textContent).toBe('notRecognized');

    // Mic button has error class
    expect(micBtn).toHaveClass('mic-btn--error');

    // No SRS update
    expect(mockUpdateCard).not.toHaveBeenCalled();

    // After 800ms: mic resets to idle, feedback clears
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(micBtn).not.toHaveClass('mic-btn--error');
    expect(screen.queryByRole('status')).toBeNull();

    vi.useRealTimers();
  });

  it('shows scenarioDone screen after last card when another scenario has due cards', () => {
    vi.useFakeTimers();

    // 1 due card only (the first card)
    (useQASRS as ReturnType<typeof vi.fn>).mockReturnValue({
      dueCards: [mockScenario.cards[0]],
      updateCard: mockUpdateCard,
      isCardDueForScenario: mockIsCardDueForScenario,
      hasProgress: false,
      progress: {},
    });

    // isCardDue returns true for albergo cards (another scenario has due cards)
    // returns false for caffe cards (this scenario is done)
    isCardDueImpl = (p: unknown) => {
      // If no progress record (undefined/null), card is due (new card)
      return p === undefined || p === null;
    };

    renderQAStudySession('it');

    // Click the correct answer to trigger handleAnswer (foil clicks no longer advance)
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    const correctBtn = Array.from(choiceButtons).find(
      (btn) => btn.textContent?.includes('Un caffè, grazie.')
    ) as HTMLElement;
    expect(correctBtn).toBeTruthy();
    act(() => {
      correctBtn.click();
    });

    // Advance timer to trigger handleAnswer
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Should show scenarioDone (not allScenariosDone) because albergo still has due cards
    expect(screen.getByText('scenarioDone')).toBeInTheDocument();
    expect(screen.queryByText('allScenariosDone')).toBeNull();

    vi.useRealTimers();
  });

  it('shows allScenariosDone screen after last card when all scenarios are empty', () => {
    vi.useFakeTimers();

    // 1 due card, with progress that marks all cards as not due
    const progressWithAllDone = {
      'qa_coffee_coffee_01': { box: 3, nextReview: '2099-01-01' },
      'qa_hotel_albergo_01': { box: 3, nextReview: '2099-01-01' },
    };

    (useQASRS as ReturnType<typeof vi.fn>).mockReturnValue({
      dueCards: [mockScenario.cards[0]],
      updateCard: mockUpdateCard,
      isCardDueForScenario: mockIsCardDueForScenario,
      hasProgress: true,
      progress: progressWithAllDone,
    });

    // isCardDue returns false for all cards — all scenarios exhausted
    isCardDueImpl = () => false;

    renderQAStudySession('it');

    // Click the correct answer to trigger handleAnswer (foil clicks no longer advance)
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    const correctBtn = Array.from(choiceButtons).find(
      (btn) => btn.textContent?.includes('Un caffè, grazie.')
    ) as HTMLElement;
    expect(correctBtn).toBeTruthy();
    act(() => {
      correctBtn.click();
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // All scenarios done → allScenariosDone screen
    expect(screen.getByText('allScenariosDone')).toBeInTheDocument();
    expect(screen.queryByText('scenarioDone')).toBeNull();

    vi.useRealTimers();
  });

  it('dueCards.length === 0 at mount shows done screen immediately', () => {
    // No due cards at mount
    (useQASRS as ReturnType<typeof vi.fn>).mockReturnValue({
      dueCards: [],
      updateCard: mockUpdateCard,
      isCardDueForScenario: mockIsCardDueForScenario,
      hasProgress: false,
      progress: {},
    });

    // isCardDue false for all — allScenariosDone shown
    isCardDueImpl = () => false;

    renderQAStudySession('it');

    // Should immediately show done screen (allScenariosDone when no due cards in any scenario)
    expect(screen.getByText('allScenariosDone')).toBeInTheDocument();
  });

  it('Study again button on scenarioDone screen resets session', () => {
    vi.useFakeTimers();

    // 1 due card
    (useQASRS as ReturnType<typeof vi.fn>).mockReturnValue({
      dueCards: [mockScenario.cards[0]],
      updateCard: mockUpdateCard,
      isCardDueForScenario: mockIsCardDueForScenario,
      hasProgress: false,
      progress: {},
    });

    // Another scenario has due cards → scenarioDone screen
    isCardDueImpl = (p: unknown) => p === undefined || p === null;

    renderQAStudySession('it');

    // Answer the only card by clicking the correct answer (foil clicks no longer advance)
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    const correctBtn = Array.from(choiceButtons).find(
      (btn) => btn.textContent?.includes('Un caffè, grazie.')
    ) as HTMLElement;
    expect(correctBtn).toBeTruthy();
    act(() => {
      correctBtn.click();
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // scenarioDone screen is shown
    expect(screen.getByText('scenarioDone')).toBeInTheDocument();

    // Click "Study again"
    const studyAgainBtn = screen.getByRole('button', { name: 'studyAgain' });
    act(() => {
      studyAgainBtn.click();
    });

    // Session UI reappears — question text visible again
    expect(screen.getByText('Che cosa prendi?')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
