'use client';
import { useTranslations } from 'next-intl';
import type { Lang } from '@/types';
import { speak } from '@/lib/speak';

interface Props {
  phrase: string;
  lang: Lang;
}

export default function AudioButton({ phrase, lang }: Props) {
  const t = useTranslations('study');

  return (
    <button
      className="audio-btn"
      onClick={(e) => { e.stopPropagation(); speak(phrase, lang); }}
      aria-label={t('audio')}
      title={t('audio')}
      type="button"
    >
      🔊
    </button>
  );
}
