'use client';

interface Props {
  text: string;
  state: 'idle' | 'correct' | 'incorrect';
  onClick: () => void;
  disabled?: boolean;
}

export default function ChoiceButton({ text, state, onClick, disabled }: Props) {
  const classNames = ['quiz-btn', state !== 'idle' ? state : ''].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={disabled || state !== 'idle'}
      type="button"
    >
      <span className="quiz-audio-icon" aria-hidden="true">🔊</span>
      {text}
    </button>
  );
}
