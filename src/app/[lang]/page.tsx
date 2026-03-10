'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ActivityPicker from '@/components/ActivityPicker';
import type { Lang } from '@/types';

// Note: generateStaticParams for [lang] is in layout.tsx
// 'use client' and generateStaticParams cannot coexist on a page file.

export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const t = useTranslations('page');

  return (
    <main>
      <div className="section-header">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>
      <ActivityPicker lang={lang} />
    </main>
  );
}
