import { describe, it, expect } from 'vitest';
import { routing, isLang } from '@/i18n/routing';

describe('isLang', () => {
  it.each([...routing.locales])('accepts the routed locale %s', (locale) => {
    expect(isLang(locale)).toBe(true);
  });

  it.each(['en', 'IT', '', 'it-IT'])('rejects %j', (value) => {
    expect(isLang(value)).toBe(false);
  });
});
