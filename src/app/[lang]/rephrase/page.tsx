'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DeckGrid from '@/components/DeckGrid';
import LevelFilterChips from '@/components/LevelFilterChips';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import type { Lang } from '@/types';

// Note: generateStaticParams for [lang]/rephrase is in layout.tsx
// 'use client' and generateStaticParams cannot coexist on a page file.

export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const t = useTranslations('page');
  const { hasProgress } = useSRS(lang);
  const { activeLevels, setActiveLevels } = useLevelFilter(lang, hasProgress, 'rephrase');

  return (
    <main>
      <div className="section-header">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>
      <LevelFilterChips lang={lang} activeLevels={activeLevels} setActiveLevels={setActiveLevels} />
      <DeckGrid lang={lang} activeLevels={activeLevels} />
    </main>
  );
}
