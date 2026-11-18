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

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={disabled || state !== 'idle'}
      type="button"
    >
      <span
        className="quiz-audio-icon"
        role="button"
        aria-label={t('audio')}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onSpeak?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            onSpeak?.();
          }
        }}
      >
        🔊
      </span>
      {text}
    </button>
  );
}
