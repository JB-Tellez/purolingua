import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TITLE_TEMPLATE } from '../../titleTemplate';
import { routing, isLang } from '@/i18n/routing';
import { scenarios } from '@/data/qa';

// The scenario list is a client page, so its title is declared here.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = await getTranslations({ locale: lang, namespace: 'page' });
  return { title: { default: t('scenarioTitle'), template: TITLE_TEMPLATE } };
}

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    scenarios.map((s) => ({ lang, scenario: s.id }))
  );
}

type Props = { children: React.ReactNode };
export default function QALayout({ children }: Props) {
  return <>{children}</>;
}
