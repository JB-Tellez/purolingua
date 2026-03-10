'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Lang } from '@/types';

interface Props {
  lang: Lang;
}

const ACTIVITIES = [
  { key: 'rephrase', icon: '🃏', path: 'rephrase' },
  { key: 'qa', icon: '💬', path: 'qa' },
] as const;

export default function ActivityPicker({ lang }: Props) {
  const t = useTranslations('activities');

  return (
    <div className="activity-grid">
      {ACTIVITIES.map(({ key, icon, path }) => (
        <Link
          key={key}
          href={`/${lang}/${path}`}
          style={{ textDecoration: 'none', display: 'block', height: '100%' }}
        >
          <div className="deck-card" style={{ height: '100%' }}>
            <div className="deck-icon-circle">{icon}</div>
            <h3>{t(`${key}.title`)}</h3>
            <p>{t(`${key}.description`)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
