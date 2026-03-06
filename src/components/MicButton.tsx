'use client';

interface Props {
  state: 'idle' | 'listening' | 'error';
  onPress: () => void;
}

export default function MicButton({ state, onPress }: Props) {
  const baseClass = 'mic-btn';
  const stateClass = state !== 'idle' ? ` mic-btn--${state}` : '';

  return (
    <button
      type="button"
      className={`${baseClass}${stateClass}`}
      onClick={(e) => { e.stopPropagation(); onPress(); }}
      aria-label={state === 'listening' ? 'Listening\u2026' : 'Start speaking'}
      aria-pressed={state === 'listening'}
    >
      {'\uD83C\uDF99'}
    </button>
  );
}
