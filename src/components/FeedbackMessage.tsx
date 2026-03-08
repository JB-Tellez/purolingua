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

  if (state === null) return null;

  const colorClass = COLOR_CLASS[state];

  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-sm font-medium text-center ${colorClass}`}
    >
      {t(state)}
    </p>
  );
}
