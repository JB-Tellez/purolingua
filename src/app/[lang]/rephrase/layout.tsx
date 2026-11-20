import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TITLE_TEMPLATE } from '../../titleTemplate';
import { routing, isLang } from '@/i18n/routing';
import { DECK_IDS } from '@/data/decks';

// The deck list is a client page, so its title is declared here.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = await getTranslations({ locale: lang, namespace: 'page' });
  return { title: { default: t('title'), template: TITLE_TEMPLATE } };
}

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    DECK_IDS.map((deck) => ({ lang, deck }))
  );
}

type Props = { children: React.ReactNode };
export default function RephraseLayout({ children }: Props) {
  return <>{children}</>;
}
