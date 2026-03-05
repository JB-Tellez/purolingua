import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

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
  if (!routing.locales.includes(lang as 'it' | 'es')) {
    notFound();
  }

  // Step 3: setRequestLocale BEFORE any next-intl hooks
  setRequestLocale(lang);

  // Load messages for NextIntlClientProvider
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
