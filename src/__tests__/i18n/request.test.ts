// The per-request locale and messages: an unknown or missing locale falls back
// to routing.defaultLocale.
import { describe, it, expect, vi } from 'vitest';
import getConfig from '@/i18n/request';
import itMessages from '../../../messages/it.json';
import esMessages from '../../../messages/es.json';

// Under Vitest, next-intl/server resolves to its client build, which throws.
// The server getRequestConfig returns the callback it is given, so mock it as
// that identity and call the callback as next-intl would.
vi.mock('next-intl/server', () => ({ getRequestConfig: <T,>(fn: T) => fn }));

type RequestConfig = { locale: string; messages: unknown };
const resolve = (requested: string | undefined) =>
  (getConfig as unknown as (p: { requestLocale: Promise<string | undefined> }) => Promise<RequestConfig>)(
    { requestLocale: Promise.resolve(requested) }
  );

describe('i18n request config', () => {
  it('uses a supported locale and loads its messages', async () => {
    expect(await resolve('es')).toEqual({ locale: 'es', messages: esMessages });
  });

  it.each([['an unsupported locale', 'fr'], ['a missing locale', undefined]])(
    'falls back to the default locale (it) for %s',
    async (_label, requested) => {
      expect(await resolve(requested)).toEqual({ locale: 'it', messages: itMessages });
    }
  );
});
