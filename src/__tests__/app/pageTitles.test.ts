// Page titles and descriptions: every page used to share the title "PuroLingua"
// and the English description, so tabs, history, and screen readers could not
// tell pages apart. Titles are "<page> · PuroLingua", built from existing text.
import { describe, it, expect, vi } from 'vitest';
import { createTranslator } from 'next-intl';
import itMessages from '../../../messages/it.json';
import esMessages from '../../../messages/es.json';

// Under Vitest next-intl/server resolves to its client build, so getTranslations
// is rebuilt here from the real message files.
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getMessages: async () => ({}),
  getTranslations: async ({ locale, namespace }: { locale: 'it' | 'es'; namespace?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- namespace is a plain string here
    createTranslator({ locale, messages: locale === 'it' ? itMessages : esMessages, namespace: namespace as any }),
}));

import { generateMetadata as langLayoutMetadata } from '@/app/[lang]/layout';
import { generateMetadata as rephraseLayoutMetadata } from '@/app/[lang]/rephrase/layout';
import { generateMetadata as qaLayoutMetadata } from '@/app/[lang]/qa/layout';
import { generateMetadata as deckPageMetadata } from '@/app/[lang]/rephrase/[deck]/page';
import { generateMetadata as scenarioPageMetadata } from '@/app/[lang]/qa/[scenario]/page';
import { metadata as homeMetadata } from '@/app/(home)/layout';
import { metadata as notFoundMetadata } from '@/app/global-not-found';

const params = <T extends object>(p: T) => ({ params: Promise.resolve(p) });

describe('page titles', () => {
  it('keeps "PuroLingua" on the language picker', () => {
    expect(homeMetadata.title).toBe('PuroLingua');
  });

  it('names the 404 page', () => {
    expect(notFoundMetadata.title).toBe('Page not found · PuroLingua');
  });

  it('gives every locale page the "· PuroLingua" template and the activity picker its heading', async () => {
    expect(await langLayoutMetadata(params({ lang: 'it' }))).toMatchObject({
      title: { template: '%s · PuroLingua', default: "Scegli un'Attività · PuroLingua" },
    });
    expect(await langLayoutMetadata(params({ lang: 'es' }))).toMatchObject({
      title: { template: '%s · PuroLingua', default: 'Elige una Actividad · PuroLingua' },
    });
  });

  it('describes the locale pages in their own language', async () => {
    expect((await langLayoutMetadata(params({ lang: 'it' }))).description).toBe("Frasi e dialoghi per imparare l'italiano");
    expect((await langLayoutMetadata(params({ lang: 'es' }))).description).toBe('Frases y diálogos para aprender español');
  });

  // A plain title string in a layout resets the template for the pages below it
  // (the static build titled a session just "Ristorante"), so these layouts
  // pass the template on.
  it('titles the deck and scenario lists with their headings, keeping the template for sessions', async () => {
    expect((await rephraseLayoutMetadata(params({ lang: 'it' }))).title).toEqual({ default: 'Scegli un Mazzo', template: '%s · PuroLingua' });
    expect((await qaLayoutMetadata(params({ lang: 'es' }))).title).toEqual({ default: 'Elige un Escenario', template: '%s · PuroLingua' });
  });

  it('titles a study session with its deck or scenario name', async () => {
    expect((await deckPageMetadata(params({ lang: 'it', deck: 'restaurant' }))).title).toBe('Ristorante');
    expect((await deckPageMetadata(params({ lang: 'es', deck: 'weather' }))).title).toBe('El Tiempo');
    expect((await scenarioPageMetadata(params({ lang: 'it', scenario: 'coffee' }))).title).toBe('Al Caffè');
    expect((await scenarioPageMetadata(params({ lang: 'es', scenario: 'coffee' }))).title).toBe('En el Café');
  });

  it('returns no metadata for an unknown locale, deck, or scenario (the page 404s)', async () => {
    expect(await langLayoutMetadata(params({ lang: 'fr' }))).toEqual({});
    expect(await deckPageMetadata(params({ lang: 'it', deck: 'nope' }))).toEqual({});
    expect(await scenarioPageMetadata(params({ lang: 'it', scenario: 'nope' }))).toEqual({});
  });
});
