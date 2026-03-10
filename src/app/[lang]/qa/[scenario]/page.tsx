// src/app/[lang]/qa/[scenario]/page.tsx
// Server component: validates route params, loads scenario data, renders QAStudySession.
// generateStaticParams is in qa/layout.tsx (cannot coexist with 'use client' in QAStudySession).
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { scenarios } from '@/data/qa';
import type { Lang } from '@/types';
import QAStudySession from './QAStudySession';

type Props = {
  params: Promise<{ lang: string; scenario: string }>;
};

export default async function QAStudyPage({ params }: Props) {
  const { lang, scenario } = await params;

  // Validate lang
  if (!['it', 'es'].includes(lang)) {
    notFound();
  }

  // Find matching scenario
  const matchedScenario = scenarios.find((s) => s.id === scenario);
  if (!matchedScenario) {
    notFound();
  }

  setRequestLocale(lang);

  return <QAStudySession lang={lang as Lang} scenario={matchedScenario} />;
}
