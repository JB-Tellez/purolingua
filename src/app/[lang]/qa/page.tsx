'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ClientOnly from '@/components/ClientOnly';
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
  const { activeLevels, setActiveLevels } = useLevelFilter(lang, hasProgress, 'qa');

  return (
    <main>
      <div className="section-header">
        <h1>{t('scenarioTitle')}</h1>
        <p className="subtitle">{t('scenarioSubtitle')}</p>
      </div>
      {/* Chips and badges come from localStorage: render them after hydration. */}
      <ClientOnly>
        <LevelFilterChips lang={lang} activeLevels={activeLevels} setActiveLevels={setActiveLevels} />
        <ScenarioGrid lang={lang} activeLevels={activeLevels} />
      </ClientOnly>
    </main>
  );
}
