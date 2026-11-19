'use client';
import { useTranslations } from 'next-intl';

type FeedbackState = 'correct' | 'incorrect' | 'heard' | 'notRecognized' | null;

interface Props {
  state: FeedbackState;
}

const COLOR_CLASS: Record<Exclude<FeedbackState, null>, string> = {
  correct: 'text-green-600',
  incorrect: 'text-red-500',
  heard: 'text-blue-500',
  notRecognized: 'text-gray-500',
};

export default function FeedbackMessage({ state }: Props) {
  const t = useTranslations('study');

  // The region stays mounted (empty when there is nothing to say): screen
  // readers announce changes to an existing live region, not a new one.
  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-sm font-medium text-center${state ? ` ${COLOR_CLASS[state]}` : ''}`}
    >
      {state ? t(state) : ''}
    </p>
  );
}
