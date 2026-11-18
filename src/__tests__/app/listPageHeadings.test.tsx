// Headings of the three list pages under /[lang], rendered with the real messages.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LangPage from '@/app/[lang]/page';
import RephraseBrowserPage from '@/app/[lang]/rephrase/page';
import QABrowserPage from '@/app/[lang]/qa/page';
import itMessages from '../../../messages/it.json';
import esMessages from '../../../messages/es.json';

let lang = 'it';
vi.mock('next/navigation', () => ({
  useParams: () => ({ lang }),
  usePathname: () => `/${lang}`,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const MESSAGES = { it: itMessages, es: esMessages } as const;

function heading(Page: React.ComponentType, locale: 'it' | 'es'): string {
  lang = locale;
  const { unmount } = render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      <Page />
    </NextIntlClientProvider>
  );
  const text = screen.getByRole('heading', { level: 1 }).textContent ?? '';
  unmount();
  return text;
}

describe.each(['it', 'es'] as const)('list page headings (%s)', (locale) => {
  it('the deck list keeps the "choose a deck" heading', () => {
    expect(heading(RephraseBrowserPage, locale)).toBe(MESSAGES[locale].page.title);
  });

  it('the activity picker and the scenario list each have their own heading', () => {
    const headings = [heading(LangPage, locale), heading(RephraseBrowserPage, locale), heading(QABrowserPage, locale)];
    expect(new Set(headings).size).toBe(3);
  });
});
