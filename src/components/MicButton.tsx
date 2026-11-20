'use client';
import { useTranslations } from 'next-intl';

interface Props {
  state: 'idle' | 'listening' | 'error';
  onPress: () => void;
}

export default function MicButton({ state, onPress }: Props) {
  const t = useTranslations('study');
  const baseClass = 'mic-btn';
  const stateClass = state !== 'idle' ? ` mic-btn--${state}` : '';

  return (
    <button
      type="button"
      className={`${baseClass}${stateClass}`}
      onClick={(e) => { e.stopPropagation(); onPress(); }}
      // A fixed name: aria-pressed alone says it is listening (a toggle whose
      // name also changed would be announced as, e.g., "In ascolto…, pressed").
      aria-label={t('micStart')}
      aria-pressed={state === 'listening'}
    >
      {'\uD83C\uDF99'}
    </button>
  );
}
