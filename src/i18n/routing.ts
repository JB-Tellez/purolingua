import { hasLocale } from 'next-intl';
import { defineRouting } from 'next-intl/routing';

// The single source of the supported locales: `Lang` (src/types) is derived from it.
export const routing = defineRouting({
  locales: ['it', 'es'] as const,
  defaultLocale: 'it',
});

/** Narrows a route param to a supported locale. */
export function isLang(value: string): value is (typeof routing.locales)[number] {
  return hasLocale(routing.locales, value);
}
