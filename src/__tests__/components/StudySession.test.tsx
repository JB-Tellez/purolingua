import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import StudySession from '@/app/[lang]/[deck]/StudySession';
import { mockRecognitionInstance, MockSpeechRecognition } from '../setup';
import type { Card } from '@/types';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}(${JSON.stringify(params)})`;
    return key;
  },
}));

vi.mock('@/hooks/useSRS', () => ({
  useSRS: () => ({
    isCardDueForDeck: () => true,
    updateCard: vi.fn(),
    hasProgress: false,
  }),
}));

vi.mock('@/hooks/useLevelFilter', () => ({
  useLevelFilter: () => ({
    activeLevels: ['A1', 'A2'],
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Minimal cards array: 4 distinct cards so generateChoices can always find 3 foils.
 * Card at index 0 is the "current card" since useSRS always returns isCardDueForDeck=true.
 */
const testCards: Card[] = [
  { front: 'Ciao', back: 'Hello', level: 'A1' },
  { front: 'Grazie', back: 'Thank you', level: 'A1' },
  { front: 'Per favore', back: 'Please', level: 'A2' },
  { front: 'Arrivederci', back: 'Goodbye', level: 'A2' },
];

function renderStudySession() {
  return render(
    <StudySession lang="it" deckId="daily" cards={testCards} />
  );
}

/**
 * Simulates startListening being called and then firing an onresult event.
 * Must be called inside act().
 */
function fireOnResult(transcript: string) {
  mockRecognitionInstance.onresult?.({ results: [[{ transcript }]] });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StudySession voice integration', () => {
  // VOICE-10: MicButton not rendered when isSupported = false
  it('VOICE-10: mic button is absent from DOM when isSupported is false', () => {
    // Remove SpeechRecognition from window
    const original = (window as { SpeechRecognition?: unknown }).SpeechRecognition;
    Object.defineProperty(window, 'SpeechRecognition', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    renderStudySession();

    expect(screen.queryByRole('button', { name: /start speaking/i })).toBeNull();

    // Restore
    Object.defineProperty(window, 'SpeechRecognition', {
      value: original ?? MockSpeechRecognition,
      writable: true,
      configurable: true,
    });
  });

  // VOICE-11: transcript match on card front calls setFlipped(true)
  it('VOICE-11: matching transcript on card front flips the card', async () => {
    vi.useFakeTimers();
    renderStudySession();

    // On card front (not yet flipped), there is exactly one mic button
    const micBtns = screen.getAllByRole('button', { name: /start speaking/i });
    // Only the front mic button should be present before flip
    expect(micBtns.length).toBe(1);
    const frontMicBtn = micBtns[0];

    // Click mic button to start listening
    act(() => {
      frontMicBtn.click();
    });

    // Fire onresult with transcript matching card front text (normalized)
    act(() => {
      fireOnResult('Ciao'); // matches testCards[0].front
    });

    // After match, card should be flipped — quiz choices should appear in DOM
    // ChoiceButton renders with class quiz-btn
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    expect(choiceButtons.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  // VOICE-12: transcript no-match on card front triggers error state
  it('VOICE-12: non-matching transcript on card front triggers mic error state', async () => {
    vi.useFakeTimers();
    renderStudySession();

    // On card front (not flipped), only one mic button
    const micBtn = screen.getByRole('button', { name: /start speaking/i });

    act(() => {
      micBtn.click();
    });

    // Fire onresult with non-matching transcript
    act(() => {
      fireOnResult('wrong phrase that does not match');
    });

    // mic button should now have error class
    expect(micBtn).toHaveClass('mic-btn--error');

    // After 800ms the error resets to idle
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(micBtn).not.toHaveClass('mic-btn--error');

    vi.useRealTimers();
  });

  // VOICE-13: transcript match on card back calls handleChoiceClick(matchedIndex)
  it('VOICE-13: matching transcript on card back calls handleChoiceClick with correct index', async () => {
    vi.useFakeTimers();
    renderStudySession();

    // First flip the card by clicking the reveal button
    const revealBtn = screen.getByRole('button', { name: /revealAnswer/i });
    act(() => {
      revealBtn.click();
    });

    // After flip: both front and back mic buttons are in DOM
    // The back mic button is the second one (front is first in DOM order)
    const micBtns = screen.getAllByRole('button', { name: /start speaking/i });
    expect(micBtns.length).toBe(2);
    const backMicBtn = micBtns[1]; // card-back is second in DOM

    act(() => {
      backMicBtn.click();
    });

    // Find which choice texts are rendered in the DOM
    // textContent includes the audio icon span (🔊) — strip it to get the bare choice text
    const choiceButtons = document.querySelectorAll('.quiz-btn');
    const rawText = choiceButtons[0].textContent ?? 'Hello';
    const targetText = rawText.replace(/^\p{Emoji}/u, '').trim();

    // Fire matching transcript for a choice
    act(() => {
      fireOnResult(targetText);
    });

    // After selection, one choice button should have a state class (correct or incorrect)
    // ChoiceButton applies state directly as class: 'quiz-btn correct' or 'quiz-btn incorrect'
    const answeredBtn = document.querySelector('.quiz-btn.correct, .quiz-btn.incorrect');
    expect(answeredBtn).not.toBeNull();

    vi.useRealTimers();
  });

  // VOICE-14: transcript no-match on card back triggers mic error state
  it('VOICE-14: non-matching transcript on card back triggers mic error state', async () => {
    vi.useFakeTimers();
    renderStudySession();

    // Flip card first
    const revealBtn = screen.getByRole('button', { name: /revealAnswer/i });
    act(() => {
      revealBtn.click();
    });

    // After flip: both front and back mic buttons
    const micBtns = screen.getAllByRole('button', { name: /start speaking/i });
    expect(micBtns.length).toBe(2);
    const backMicBtn = micBtns[1]; // card-back is second in DOM

    act(() => {
      backMicBtn.click();
    });

    // Non-matching transcript
    act(() => {
      fireOnResult('something that matches no choice at all xyz');
    });

    expect(backMicBtn).toHaveClass('mic-btn--error');

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(backMicBtn).not.toHaveClass('mic-btn--error');

    vi.useRealTimers();
  });
});
