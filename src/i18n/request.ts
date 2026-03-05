// src/i18n/request.ts — stub for Phase 9 build verification (Plan 02 replaces this)
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  return {
    locale: 'it',
    messages: {},
  };
});
