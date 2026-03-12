import tailwindcss from '@tailwindcss/vite'

// Note: src/data/decks.ts and src/data/qa/index.ts use `@/types` alias which is
// not available at nuxt.config.ts evaluation time. IDs are inlined here to avoid
// import failures — they must stay in sync with src/data/ as decks/scenarios change.
const DECK_IDS = [
  'daily', 'restaurant', 'travel', 'shopping',
  'hotel', 'emergencies', 'social', 'weather',
] as const

const SCENARIO_IDS = [
  'caffe', 'albergo', 'ristorante', 'strada',
  'presentazioni', 'negozio', 'treno',
] as const

const LOCALES = ['it', 'es'] as const

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'it',
    locales: [
      { code: 'it', language: 'it-IT', file: 'it.json' },
      { code: 'es', language: 'es-ES', file: 'es.json' },
    ],
    // '../messages' is relative to srcDir (app/) — resolves to repo root/messages/
    langDir: '../messages',
  },

  nitro: {
    prerender: {
      // Explicit routes only — crawler disabled to prevent 404s from bare /rephrase
      // and /qa links in i18n prefix strategy (prefix strategy has no un-prefixed routes)
      crawlLinks: false,
      routes: [
        '/',
        ...LOCALES.map(lang => `/${lang}`),
        ...LOCALES.map(lang => `/${lang}/rephrase`),
        ...LOCALES.map(lang => `/${lang}/qa`),
        ...LOCALES.flatMap(lang => DECK_IDS.map(id => `/${lang}/rephrase/${id}`)),
        ...LOCALES.flatMap(lang => SCENARIO_IDS.map(id => `/${lang}/qa/${id}`)),
      ],
    },
  },
})
