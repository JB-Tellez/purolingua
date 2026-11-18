import { describe, it, expect } from 'vitest';
import { LANG_LOCALE } from '@/lib/locale';

describe('LANG_LOCALE', () => {
  it('maps each app language to its BCP 47 speech locale', () => {
    expect(LANG_LOCALE).toEqual({ it: 'it-IT', es: 'es-ES' });
  });
});
