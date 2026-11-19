// Accessible names must come from the locale's messages, not hard-coded English.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import MicButton from '@/components/MicButton';
import ChoiceButton from '@/components/ChoiceButton';
import SiteHeader from '@/components/SiteHeader';
import itMessages from '../../../messages/it.json';
import esMessages from '../../../messages/es.json';

vi.mock('next/navigation', () => ({ usePathname: () => '/it' }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const MESSAGES = { it: itMessages, es: esMessages } as const;
type Messages = Record<string, Record<string, string>>;

function renderIn(locale: 'it' | 'es', ui: React.ReactElement) {
  return render(<NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>{ui}</NextIntlClientProvider>);
}

describe.each(['it', 'es'] as const)('translated accessible names (%s)', (locale) => {
  const messages = MESSAGES[locale] as unknown as Messages;
  // Throws on a missing key, so an absent string can't match "any value".
  const m = new Proxy(messages, {
    get: (all, ns: string) => new Proxy(all[ns] ?? {}, {
      get: (strings, key: string) => {
        const value = strings[key];
        if (typeof value !== 'string' || !value) throw new Error(`missing message ${locale}.${ns}.${key}`);
        return value;
      },
    }),
  });

  it('MicButton: idle and listening labels', () => {
    const { rerender } = renderIn(locale, <MicButton state="idle" onPress={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', m.study.micStart);
    rerender(
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        <MicButton state="listening" onPress={vi.fn()} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', m.study.micListening);
  });

  it('ChoiceButton: the speak icon names the answer it plays', () => {
    renderIn(locale, <ChoiceButton text="Ciao" state="idle" onClick={vi.fn()} />);
    expect(document.querySelector('.quiz-audio-icon')).toHaveAttribute('aria-label', m.study.audioChoice.replace('{text}', 'Ciao'));
  });

  it('SiteHeader: language menu button', () => {
    renderIn(locale, <SiteHeader lang={locale} />);
    expect(document.querySelector('.language-btn')).toHaveAttribute('aria-label', m.nav.changeLanguage);
  });
});
