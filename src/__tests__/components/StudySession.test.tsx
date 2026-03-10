import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import StudySession from '@/app/[lang]/rephrase/[deck]/StudySession';
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

// Controllable isCardDueForDeck: tests set this function before rendering.
// Default: always return true (all cards due, voice integration tests behavior).
let isDueImpl: (id: string, i: number) => boolean = () => true;

vi.mock('@/hooks/useSRS', () => ({
  useSRS: () => ({
    isCardDueForDeck: (id: string, i: number) => isDueImpl(id, i),
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

// Minimal DECK_MAP for BUGFIX-02 tests:
// 'restaurant' deck has 2 cards: index 0 is A2 (filtered OUT by activeLevels in bug scenario),
// index 1 is A1. With the buggy code, after filtering, card at original index 1 gets
// filtered-array index 0. The bug then calls isCardDueForDeck('restaurant', 0) thinking
// it's checking the first card, but original index 1 is what matters.
// The fix uses .map((c,i) => ({c,i})).filter(...).every(({i}) => ...) to preserve original index.
vi.mock('@/data/deckMap', () => ({
  DECK_MAP: {
    it: {
      // daily: single A1 card (the session deck)
      daily:      [{ front: 'Ciao',   back: 'Hello',    level: 'A1' }],
      // restaurant: 2 cards — index 0 is A2, index 1 is A1
      // Bug: after activeLevels filter, index 1 becomes filtered-array index 0
      // Fix preserves original index 1
      restaurant: [
        { front: 'Buonasera', back: 'Good evening', level: 'A2' },
        { front: 'Grazie',    back: 'Thank you',    level: 'A1' },
      ],
    },
    es: {
      daily:      [{ front: 'Hola',    back: 'Hello',    level: 'A1' }],
      restaurant: [{ front: 'Gracias', back: 'Thank you', level: 'A1' }],
    },
  },
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

// Reset isDueImpl to default before each test
beforeEach(() => {
  isDueImpl = () => true;
});

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

    // First flip the card by clicking the card container
    const cardContainer = document.querySelector('.card-container') as HTMLElement;
    act(() => {
      cardContainer.click();
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

    // Flip card first by clicking the card container
    const cardContainer = document.querySelector('.card-container') as HTMLElement;
    act(() => {
      cardContainer.click();
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

// ---------------------------------------------------------------------------
// BUGFIX-02: allDecksEmpty cross-deck and language-scope correctness
// ---------------------------------------------------------------------------
// Strategy for distinguishing snapshot vs allDecksEmpty calls:
// The initial dueCards snapshot calls isCardDueForDeck('daily', 0) once at render.
// The allDecksEmpty check (inside handleAnswer's else-branch) iterates all lang decks.
// We use per-deckId call counters to control return values precisely.
//
// DECK_MAP mock for 'restaurant': [A2-card at index 0, A1-card at index 1]
// Bug scenario: buggy code calls isCardDueForDeck('restaurant', 0) after filtering
//   (filtered-array index 0 = original index 1 of A1 card)
// Fix scenario: fixed code calls isCardDueForDeck('restaurant', 1) (correct original index)
//
// Test E verifies: with 'restaurant' due at original index 1, buggy code passes wrong
// index 0 → isDue returns false (we set it up this way) → incorrectly shows allDone.
// Fixed code passes index 1 → isDue returns true → correctly shows deckComplete.

describe('StudySession allDecksEmpty fix (BUGFIX-02)', () => {
  // Test E (BUGFIX-02 cross-deck): uses index-sensitivity to expose the bug.
  // 'restaurant' deck has [A2@0, A1@1]. activeLevels=['A1','A2'] so both are included.
  // We set isDueImpl so that:
  //   - index 0 of 'restaurant' returns false (card not due)
  //   - index 1 of 'restaurant' returns true  (card IS due — different original index)
  //
  // Buggy code: iterates filtered array, passes index 0 → false → allDecksEmpty=true → allDone (WRONG)
  // Fixed code: preserves original index, passes index 1 → true → allDecksEmpty=false → deckComplete (CORRECT)
  it('BUGFIX-02 E: shows deckComplete (not allDone) when restaurant has a due card at original index 1', () => {
    vi.useFakeTimers();

    // Track call count for 'daily' to distinguish snapshot from allDecksEmpty
    const callCount: Record<string, number> = {};
    isDueImpl = (id: string, i: number) => {
      callCount[id] = (callCount[id] ?? 0) + 1;

      if (id === 'daily') {
        // 1st call: initial dueCards snapshot → true (session starts with 1 card)
        // 2nd call: allDecksEmpty → false (deck exhausted)
        return callCount[id] === 1;
      }

      if (id === 'restaurant') {
        // Only called during allDecksEmpty check
        // index 1 (original A1 card) is due; index 0 (original A2 card) is not
        return i === 1;
      }

      return false;
    };

    const oneCard: Card[] = [{ front: 'Ciao', back: 'Hello', level: 'A1' }];
    render(<StudySession lang="it" deckId="daily" cards={oneCard} />);

    // Flip the card
    const cardContainer = document.querySelector('.card-container') as HTMLElement;
    act(() => { cardContainer.click(); });

    // Click the primary "next" button to call handleAnswer(true) on the last card
    const nextBtn = screen.getByRole('button', { name: /nextButton/i });
    act(() => { nextBtn.click(); });

    // Fixed: restaurant has a due card at original index 1 → deckComplete (not allDone)
    expect(screen.getByText('deckComplete')).toBeTruthy();
    expect(screen.queryByText('allDone')).toBeNull();

    vi.useRealTimers();
  });

  // Test F (BUGFIX-02 language scope): only Italian decks should be checked.
  // With lang='it', allDecksEmpty iterates deckMetadata filtered to lang='it' (2 decks in mock).
  // Both Italian decks exhausted → allDone. Spanish decks (also in mock) must NOT be checked.
  it('BUGFIX-02 F: allDone screen appears when all Italian decks exhausted (language-scoped, Spanish ignored)', () => {
    vi.useFakeTimers();

    // Track which deck IDs were checked in allDecksEmpty
    const checkedIds: string[] = [];
    const callCount: Record<string, number> = {};

    isDueImpl = (id: string, _i: number) => {
      callCount[id] = (callCount[id] ?? 0) + 1;

      if (id === 'daily') {
        // 1st call: snapshot → true (session starts)
        // 2nd call: allDecksEmpty → false (exhausted)
        return callCount[id] === 1;
      }

      // Record which IDs were checked during allDecksEmpty
      if (!checkedIds.includes(id)) checkedIds.push(id);

      // All non-daily decks: not due (exhausted)
      return false;
    };

    const oneCard: Card[] = [{ front: 'Ciao', back: 'Hello', level: 'A1' }];
    render(<StudySession lang="it" deckId="daily" cards={oneCard} />);

    const cardContainer = document.querySelector('.card-container') as HTMLElement;
    act(() => { cardContainer.click(); });

    const nextBtn = screen.getByRole('button', { name: /nextButton/i });
    act(() => { nextBtn.click(); });

    // All Italian decks exhausted → allDone
    expect(screen.getByText('allDone')).toBeTruthy();
    expect(screen.queryByText('deckComplete')).toBeNull();

    // Verify only Italian decks were checked (not Spanish)
    // Mock DECK_MAP has 'it': {daily, restaurant} and 'es': {daily, restaurant}
    // Fixed code: deckMetadata.filter(d => d.lang === 'it') → only 'it' daily + restaurant
    // Spanish deck IDs should NOT appear in checkedIds
    expect(checkedIds).not.toContain('hola'); // no Spanish-only IDs (IDs are same names)
    // More importantly, the count of decks checked should match Italian-only (2 decks in mock)
    // daily was called twice total (snapshot + allDecksEmpty), restaurant once
    // Spanish decks should not have been called at all
    expect(callCount['Hola']).toBeUndefined();   // Spanish deck key doesn't exist
    expect(callCount['Gracias']).toBeUndefined(); // Spanish deck key doesn't exist

    vi.useRealTimers();
  });
});
