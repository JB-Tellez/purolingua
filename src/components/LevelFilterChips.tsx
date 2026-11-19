'use client';
import { useTranslations } from 'next-intl';
import type { Lang, Level } from '@/types';
import { LEVELS } from '@/lib/levels';

interface Props {
  lang: Lang;
  activeLevels: Level[];
  setActiveLevels: (levels: Level[] | null) => void;
}

export default function LevelFilterChips({ lang: _lang, activeLevels, setActiveLevels }: Props) {
  const t = useTranslations('filter');

  function toggle(level: Level) {
    if (activeLevels.includes(level)) {
      // FLTR-06: setActiveLevels silently ignores empty arrays
      setActiveLevels(activeLevels.filter((l) => l !== level));
    } else {
      setActiveLevels([...activeLevels, level]);
    }
  }

  return (
    <div className="level-filter" role="group" aria-label={t('label')}>
      {LEVELS.map((level) => (
        <button
          key={level}
          className={`filter-chip${activeLevels.includes(level) ? ' active' : ''}`}
          onClick={() => toggle(level)}
          aria-pressed={activeLevels.includes(level)}
        >
          {t(`chips.${level}`)}
        </button>
      ))}
    </div>
  );
}
