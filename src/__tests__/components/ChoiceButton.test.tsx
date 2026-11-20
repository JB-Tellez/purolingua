import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChoiceButton from '@/components/ChoiceButton';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}(${JSON.stringify(params)})` : key,
}));

// Exact names: the speak icon's label must not leak into the answer's name, and
// it names its own answer so four speak buttons are not all just "Ascolta".
const answerButton = () => screen.getByRole('button', { name: 'Ciao' });
const speakIcon = () => screen.getByRole('button', { name: 'audioChoice({"text":"Ciao"})' });

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

// The Rephrase session focuses the first answer as soon as the card flips. An
// answer button that transitions `all` also animates the visibility it inherits
// from the back face, so for 0.2 s it is still hidden and focus() does nothing.
describe('ChoiceButton styles', () => {
  it('does not transition visibility, so an answer can take focus the moment it is shown', () => {
    const css = readFileSync(resolve(__dirname, '../../style-reference.css'), 'utf8');
    const rule = css.match(/^\.quiz-btn \{([^}]*)\}/m)?.[1] ?? '';
    const transition = rule.match(/transition(?:-property)?:\s*([^;]*);/)?.[1] ?? '';
    expect(transition).not.toBe('');
    expect(transition).not.toMatch(/\ball\b|visibility/);
  });
});
