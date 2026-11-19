import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AudioButton from '@/components/AudioButton';
import { speak } from '@/lib/speak';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/lib/speak', () => ({ speak: vi.fn() }));

describe('AudioButton', () => {
  it('is a button labelled study.audio', () => {
    render(<AudioButton phrase="Ciao" lang="it" />);
    expect(screen.getByRole('button', { name: 'audio' })).toHaveAttribute('type', 'button');
  });

  it('speaks the phrase in the page language when clicked', () => {
    render(<AudioButton phrase="Hola" lang="es" />);
    screen.getByRole('button', { name: 'audio' }).click();
    expect(speak).toHaveBeenCalledWith('Hola', 'es');
  });

  it('does not pass the click to a clickable parent (it sits on the flip card)', () => {
    const onParentClick = vi.fn();
    render(<div onClick={onParentClick}><AudioButton phrase="Ciao" lang="it" /></div>);
    screen.getByRole('button', { name: 'audio' }).click();
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
