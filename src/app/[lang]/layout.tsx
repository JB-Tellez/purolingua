import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, isLang } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import RootDocument from '../RootDocument';
import { TITLE_TEMPLATE } from '../titleTemplate';

// Every page below is titled "<page> · PuroLingua" in its own language; the
// activity picker (a client page, which cannot export metadata) gets the default.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = await getTranslations({ locale: lang });
  return {
    title: { template: TITLE_TEMPLATE, default: `${t('page.activityTitle')} · PuroLingua` },
    description: t('meta.description'),
  };
}

// Step 1: generateStaticParams — tell Next.js which locale paths to build
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  // Step 2: await params (Next.js 16 — params is a Promise)
  const { lang } = await params;

  // Validate locale
  if (!isLang(lang)) {
    notFound();
  }

  // Step 3: setRequestLocale BEFORE any next-intl hooks
  setRequestLocale(lang);

  // Load messages for NextIntlClientProvider
  const messages = await getMessages();

  return (
    // A root layout (there is no app/layout.tsx), so <html lang> matches the locale.
    <RootDocument lang={lang}>
      <NextIntlClientProvider messages={messages}>
        <SiteHeader lang={lang} />
        {children}
      </NextIntlClientProvider>
    </RootDocument>
  );
}
