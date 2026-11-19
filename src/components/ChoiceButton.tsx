'use client';
import { useTranslations } from 'next-intl';

interface Props {
  text: string;
  state: 'idle' | 'correct' | 'incorrect';
  onClick: () => void;
  disabled?: boolean;
  onSpeak?: () => void;
}

export default function ChoiceButton({ text, state, onClick, disabled, onSpeak }: Props) {
  const t = useTranslations('study');
  const classNames = ['quiz-btn', state !== 'idle' ? state : ''].filter(Boolean).join(' ');

  // The speak button is a sibling, not a child: interactive content can't nest
  // inside a <button>, and browsers drop clicks inside a disabled one, which
  // would silence it once the answer is locked.
  return (
    <div className="quiz-option">
      <button
        type="button"
        className="quiz-audio-icon"
        aria-label={t('audioChoice', { text })}
        onClick={(e) => {
          e.stopPropagation();
          onSpeak?.();
        }}
      >
        🔊
      </button>
      <button
        className={classNames}
        onClick={onClick}
        disabled={disabled || state !== 'idle'}
        type="button"
      >
        {text}
      </button>
    </div>
  );
}
