import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MicButton from '@/components/MicButton';

describe('MicButton', () => {
  // Idle state: base class only
  it('idle state: renders with base mic-btn class and no state modifier', () => {
    render(<MicButton state="idle" onPress={vi.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('mic-btn');
    expect(btn).not.toHaveClass('mic-btn--listening');
    expect(btn).not.toHaveClass('mic-btn--error');
  });

  // VOICE-08: MicButton renders with listening class when state='listening'
  it('VOICE-08: renders listening visual state when state prop is listening', () => {
    render(<MicButton state="listening" onPress={vi.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('mic-btn');
    expect(btn).toHaveClass('mic-btn--listening');
    expect(btn).toHaveAttribute('aria-label', 'Listening\u2026');
  });

  // VOICE-09: MicButton renders with error class when state='error'
  it('VOICE-09: renders error visual state when state prop is error', () => {
    render(<MicButton state="error" onPress={vi.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('mic-btn');
    expect(btn).toHaveClass('mic-btn--error');
    expect(btn).not.toHaveClass('mic-btn--listening');
  });

  // onPress prop called on click
  it('onPress is called once when button is clicked', async () => {
    const onPress = vi.fn();
    render(<MicButton state="idle" onPress={onPress} />);
    const btn = screen.getByRole('button');
    await userEvent.click(btn);
    expect(onPress).toHaveBeenCalledOnce();
  });
});
