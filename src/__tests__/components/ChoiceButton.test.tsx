import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChoiceButton from '@/components/ChoiceButton';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Exact name: the speak icon's label must not leak into the answer's name.
const answerButton = () => screen.getByRole('button', { name: 'Ciao' });
const speakIcon = () => screen.getByRole('button', { name: 'audio' });

describe('ChoiceButton', () => {
  it('shows the answer text and reports a click', () => {
    const onClick = vi.fn();
    render(<ChoiceButton text="Ciao" state="idle" onClick={onClick} />);
    fireEvent.click(answerButton());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each(['correct', 'incorrect'] as const)('is locked and styled once answered (%s)', (state) => {
    render(<ChoiceButton text="Ciao" state={state} onClick={vi.fn()} />);
    expect(answerButton()).toBeDisabled();
    expect(answerButton()).toHaveClass('quiz-btn', state);
  });

  it('is disabled when the disabled prop is set, even while idle', () => {
    render(<ChoiceButton text="Ciao" state="idle" onClick={vi.fn()} disabled />);
    expect(answerButton()).toBeDisabled();
  });

  it('the speak icon speaks without choosing the answer', () => {
    const onClick = vi.fn();
    const onSpeak = vi.fn();
    render(<ChoiceButton text="Ciao" state="idle" onClick={onClick} onSpeak={onSpeak} />);
    fireEvent.click(speakIcon());
    expect(onSpeak).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('the speak icon is a native button beside the answer, not nested inside it', () => {
    render(<ChoiceButton text="Ciao" state="idle" onClick={vi.fn()} />);
    expect(speakIcon().tagName).toBe('BUTTON');
    expect(speakIcon()).toHaveAttribute('type', 'button');
    expect(answerButton()).not.toContainElement(speakIcon());
  });

  it.each(['correct', 'incorrect'] as const)('the speak icon stays usable after answering (%s)', (state) => {
    const onSpeak = vi.fn();
    render(<ChoiceButton text="Ciao" state={state} onClick={vi.fn()} onSpeak={onSpeak} />);
    expect(speakIcon()).toBeEnabled();
    fireEvent.click(speakIcon());
    expect(onSpeak).toHaveBeenCalledOnce();
  });
});
