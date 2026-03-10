'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LevelFilterChips from '@/components/LevelFilterChips';
import ScenarioGrid from '@/components/ScenarioGrid';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import type { Lang } from '@/types';

export default function QABrowserPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const t = useTranslations('page');
  const { hasProgress } = useSRS(lang);
  const { activeLevels, setActiveLevels } = useLevelFilter(lang, hasProgress);

  return (
    <main>
      <div className="section-header">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>
      <LevelFilterChips lang={lang} activeLevels={activeLevels} setActiveLevels={setActiveLevels} />
      <ScenarioGrid lang={lang} activeLevels={activeLevels} />
    </main>
  );
}
