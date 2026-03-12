/**
 * specs/verify-routes.ts
 *
 * Verifies that all expected locale x deck/scenario routes exist as index.html
 * files in .output/public/ after `nuxi generate`.
 *
 * Run from repo root:
 *   bun specs/verify-routes.ts
 *
 * Exits 0 on full pass, 1 on any failure.
 *
 * Constants are inlined (not imported from nuxt.config.ts) so this script can
 * run in any Node/Bun environment without config eval context.
 */

import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

// ── Constants ──────────────────────────────────────────────────────────────
// Must stay in sync with nuxt.config.ts DECK_IDS / SCENARIO_IDS / LOCALES
const DECK_IDS = [
  'daily', 'restaurant', 'travel', 'shopping',
  'hotel', 'emergencies', 'social', 'weather',
]

const SCENARIO_IDS = [
  'caffe', 'albergo', 'ristorante', 'strada',
  'presentazioni', 'negozio', 'treno',
]

const LOCALES = ['it', 'es']

const OUTPUT = resolve(process.cwd(), '.output/public')

// ── Build expected route list ──────────────────────────────────────────────
// 36 routes total (bare '/' becomes 200.html redirect — excluded here)
const expectedRoutes: string[] = [
  // /it, /es  (2)
  ...LOCALES.map(lang => `/${lang}`),
  // /it/rephrase, /es/rephrase  (2)
  ...LOCALES.map(lang => `/${lang}/rephrase`),
  // /it/qa, /es/qa  (2)
  ...LOCALES.map(lang => `/${lang}/qa`),
  // /it/rephrase/{deck}, /es/rephrase/{deck}  (16)
  ...LOCALES.flatMap(lang => DECK_IDS.map(id => `/${lang}/rephrase/${id}`)),
  // /it/qa/{scenario}, /es/qa/{scenario}  (14)
  ...LOCALES.flatMap(lang => SCENARIO_IDS.map(id => `/${lang}/qa/${id}`)),
]

// ── Verification ───────────────────────────────────────────────────────────
const NUXT_MARKER = '<div id="__nuxt">'

let missingRoutes: string[] = []
let badContentRoutes: string[] = []

for (let i = 0; i < expectedRoutes.length; i++) {
  const route = expectedRoutes[i]
  // strip leading slash, append index.html
  const filePath = resolve(OUTPUT, route.slice(1), 'index.html')

  if (!existsSync(filePath)) {
    missingRoutes.push(`MISSING  ${route}  →  ${filePath}`)
    continue
  }

  // Full content check for all routes (spot-check first 3 is implied by reading all)
  const shouldCheck = i < 3 // strict spot-check for first 3; log-only for rest
  const html = readFileSync(filePath, 'utf-8')
  if (!html.includes(NUXT_MARKER)) {
    badContentRoutes.push(`BAD HTML ${route}  (missing ${NUXT_MARKER})`)
    if (shouldCheck) {
      console.error(`[spot-check] ${route} does not contain ${NUXT_MARKER}`)
    }
  }
}

// ── Results ────────────────────────────────────────────────────────────────
let failed = false

if (missingRoutes.length > 0) {
  console.error(`\n${missingRoutes.length} missing route(s):`)
  for (const line of missingRoutes) console.error(' ', line)
  failed = true
}

if (badContentRoutes.length > 0) {
  console.error(`\n${badContentRoutes.length} route(s) with bad HTML content:`)
  for (const line of badContentRoutes) console.error(' ', line)
  failed = true
}

if (!failed) {
  console.log(`All ${expectedRoutes.length} routes verified in .output/public/`)
  process.exit(0)
} else {
  process.exit(1)
}
