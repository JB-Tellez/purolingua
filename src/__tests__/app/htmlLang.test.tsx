// The document language must match the page: /it and /es pages declare their
// locale in the static HTML, and the multilingual home page marks each part.
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';
import { routing } from '@/i18n/routing';
import LocaleLayout from '@/app/[lang]/layout';
import HomeLayout from '@/app/(home)/layout';
import HomePage from '@/app/(home)/page';
import GlobalNotFound from '@/app/global-not-found';

vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));
vi.mock('next-intl/server', () => ({ setRequestLocale: vi.fn(), getMessages: async () => ({}) }));
vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl')>()),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/SiteHeader', () => ({ default: () => null }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('<html lang>', () => {
  it.each([...routing.locales])('the /%s layout declares its locale', async (lang) => {
    const html = renderToStaticMarkup(await LocaleLayout({ children: <p />, params: Promise.resolve({ lang }) }));
    expect(html).toMatch(new RegExp(`^<html lang="${lang}">`));
  });

  it('the home layout declares English (its heading) and keeps the version footer', () => {
    const html = renderToStaticMarkup(<HomeLayout><p /></HomeLayout>);
    expect(html).toMatch(/^<html lang="en">/);
    expect(html).toMatch(/<footer>v\d+\.\d+\.\d+<\/footer>/);
  });
});

describe('404 page', () => {
  it('is a full English document with the site styles and a link home', () => {
    const html = renderToStaticMarkup(<GlobalNotFound />);
    expect(html).toMatch(/^<html lang="en">/);
    expect(html).toContain('href="/"');
    expect(html).toMatch(/<footer>v\d/);
  });
});

describe('home page language marking', () => {
  it('marks the Italian and Spanish subtitle parts', () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector('.subtitle [lang="it"]')).toHaveTextContent('Scegli la lingua');
    expect(container.querySelector('.subtitle [lang="es"]')).toHaveTextContent('Elige tu idioma');
  });

  it.each([...routing.locales])('marks the %s language card in its own language', (lang) => {
    const { container } = render(<HomePage />);
    const card = container.querySelector(`a[href="/${lang}"] .deck-card`);
    expect(card).toHaveAttribute('lang', lang);
  });
});
