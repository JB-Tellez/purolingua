import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, isLang } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import RootDocument from '../RootDocument';

export const metadata: Metadata = {
  title: 'PuroLingua',
  description: 'Language learning flashcards',
};

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
