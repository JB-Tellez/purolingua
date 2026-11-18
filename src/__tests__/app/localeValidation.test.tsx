// Route-level locale validation: every [lang] entry point must 404 on an
// unknown locale and accept every locale in routing.locales.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routing } from '@/i18n/routing';
import LocaleLayout from '@/app/[lang]/layout';
import DeckPage from '@/app/[lang]/rephrase/[deck]/page';
import QAStudyPage from '@/app/[lang]/qa/[scenario]/page';
import { scenarios } from '@/data/qa';

const notFound = vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); });
vi.mock('next/navigation', () => ({ notFound: () => notFound() }));
vi.mock('next-intl/server', () => ({ setRequestLocale: vi.fn(), getMessages: async () => ({}) }));
vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl')>()),
  NextIntlClientProvider: () => null,
}));
vi.mock('@/components/SiteHeader', () => ({ default: () => null }));
vi.mock('@/app/[lang]/rephrase/[deck]/StudySessionNoSSR', () => ({ default: () => null }));
vi.mock('@/app/[lang]/qa/[scenario]/QAStudySessionNoSSR', () => ({ default: () => null }));

beforeEach(() => { notFound.mockClear(); });

const entryPoints = {
  layout: (lang: string) => LocaleLayout({ children: null, params: Promise.resolve({ lang }) }),
  'rephrase deck page': (lang: string) => DeckPage({ params: Promise.resolve({ lang, deck: 'daily' }) }),
  'qa scenario page': (lang: string) =>
    QAStudyPage({ params: Promise.resolve({ lang, scenario: scenarios[0].id }) }),
};

describe.each(Object.entries(entryPoints))('%s locale validation', (_name, enter) => {
  it('404s on an unknown locale', async () => {
    await expect(enter('en')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it.each([...routing.locales])('accepts %s', async (locale) => {
    await enter(locale);
    expect(notFound).not.toHaveBeenCalled();
  });
});
