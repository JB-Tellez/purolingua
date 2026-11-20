// src/app/[lang]/qa/[scenario]/page.tsx
// Server component: validates route params, loads scenario data, renders QAStudySession.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing, isLang } from '@/i18n/routing';
import { scenarios } from '@/data/qa';
import QAStudySessionNoSSR from './QAStudySessionNoSSR';

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    scenarios.map((s) => ({ lang, scenario: s.id }))
  );
}

type Props = {
  params: Promise<{ lang: string; scenario: string }>;
};

// Titled with the scenario name ("Al Caffè · PuroLingua", via the [lang] template).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, scenario } = await params;
  const matched = scenarios.find((s) => s.id === scenario);
  if (!isLang(lang) || !matched) return {};
  return { title: lang === 'it' ? matched.titleIt : matched.titleEs };
}

export default async function QAStudyPage({ params }: Props) {
  const { lang, scenario } = await params;

  // Validate lang
  if (!isLang(lang)) {
    notFound();
  }

  // Find matching scenario
  const matchedScenario = scenarios.find((s) => s.id === scenario);
  if (!matchedScenario) {
    notFound();
  }

  setRequestLocale(lang);

  return <QAStudySessionNoSSR lang={lang} scenario={matchedScenario} />;
}
