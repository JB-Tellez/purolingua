# Requirements: PuroLingua

**Defined:** 2026-03-04
**Core Value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.

## v1.2 Requirements

Port all v1.1 functionality to Next.js + TypeScript + Tailwind. Feature parity only. Delivers proper URL routing as new user-facing API surface.

### Infrastructure

- [x] **INFRA-01**: Feature branch `feat/nextjs-port` initialized with Next.js 15, TypeScript, Tailwind, and next-intl
- [x] **INFRA-02**: Static export configured (`output: 'export'`) and build verified

### Data & Types

- [x] **DATA-01**: Core TypeScript types defined (Card, Deck, Progress, Lang, DeckId, Level)
- [x] **DATA-02**: Italian card arrays (all 8 decks) ported to typed TypeScript modules
- [x] **DATA-03**: Spanish card arrays (all 8 decks) ported to typed TypeScript modules
- [x] **DATA-04**: Deck metadata module created (id, i18n key per deck)

### SRS Logic

- [x] **SRS-01**: Leitner box math in `lib/srs.ts` as pure TypeScript functions
- [x] **SRS-02**: Distractor generation in `lib/generateChoices.ts`
- [x] **SRS-03**: `useSRS(lang)` hook with localStorage persistence, same key format as v1.1
- [x] **SRS-04**: `useLevelFilter()` hook with localStorage persistence and FLTR-06 guard (cannot deselect all)

### Routing

- [x] **ROUTE-01**: Home page (`/`) with language picker
- [x] **ROUTE-02**: Deck grid page (`/[lang]`) with deck tiles and due-count badges
- [x] **ROUTE-03**: Study session page (`/[lang]/[deck]`) with full quiz flow
- [x] **ROUTE-04**: `generateStaticParams` covers all lang + deck combinations

### Components

- [x] **UI-01**: LevelFilterChips on deck grid, hidden during active study session
- [x] **UI-02**: FlashCard with front/back reveal
- [x] **UI-03**: ChoiceButton for multiple-choice quiz
- [x] **UI-04**: AudioButton using Web Speech API TTS

### i18n

- [x] **I18N-01**: next-intl message files for Italian and Spanish UI strings
- [x] **I18N-02**: All UI strings (deck names, button labels, chip labels) in message files

### Styling

- [x] **STYLE-01**: Tailwind CSS applied throughout with visual parity to v1.1

### Tests

- [x] **TEST-01**: Vitest + React Testing Library configured
- [x] **TEST-02**: `lib/srs.ts` unit tested
- [x] **TEST-03**: `lib/generateChoices.ts` unit tested
- [x] **TEST-04**: `useSRS` and `useLevelFilter` tested via `renderHook`

### Voice Recognition

- [x] **VOICE-01**: `useVoiceRecognition` returns `isSupported: true` when SpeechRecognition is present on window
- [x] **VOICE-02**: `useVoiceRecognition` returns `isSupported: false` when neither SpeechRecognition nor webkitSpeechRecognition is present
- [x] **VOICE-03**: `isListening` becomes `true` after `startListening` is called and recognition fires `onstart`
- [x] **VOICE-04**: `isListening` resets to `false` when recognition fires `onend`
- [x] **VOICE-05**: `onResult` callback fires with the transcript string when recognition returns a result
- [x] **VOICE-06**: `onError` callback fires and `isListening` resets when recognition fires `onerror`
- [x] **VOICE-07**: Normalization (lowercase + trim) correctly matches transcript to card front or choice text
- [x] **VOICE-08**: `MicButton` renders with `listening` visual state when `state='listening'`
- [x] **VOICE-09**: `MicButton` renders with `error` visual state when `state='error'`
- [x] **VOICE-10**: Mic button is absent from DOM when `isSupported` is `false`
- [x] **VOICE-11**: Matching transcript on card front flips the card (sets `flipped: true`)
- [x] **VOICE-12**: Non-matching transcript on card front shows error flash on mic button then resets to idle
- [x] **VOICE-13**: Matching transcript on card back calls `handleChoiceClick(matchedIndex)` with the correct choice index
- [x] **VOICE-14**: Non-matching transcript on card back shows error flash on mic button then resets to idle

## Deferred (v2.0+)

- A1 phrase linguistic quality verified by native speaker (Italian and Spanish)
- Level filter chips hidden during active study session (FLTR-10) — post-port
- B1/B2 content tiers

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features | Strict feature parity — v1.2 is a tech migration only |
| SSR / API routes | Static export only for now |
| React Context / Zustand | State surface small enough for focused hooks |
| Playwright E2E tests | Already removed in quick task 1 |
| User accounts / backend | Core value is zero-friction, localStorage-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 9 | Complete |
| INFRA-02 | Phase 9 | Complete |
| DATA-01 | Phase 9 | Complete |
| DATA-02 | Phase 10 | Complete |
| DATA-03 | Phase 10 | Complete |
| DATA-04 | Phase 10 | Complete |
| SRS-01 | Phase 11 | Complete |
| SRS-02 | Phase 11 | Complete |
| SRS-03 | Phase 11 | Complete |
| SRS-04 | Phase 11 | Complete |
| ROUTE-01 | Phase 12 | Complete |
| ROUTE-02 | Phase 12 | Complete |
| ROUTE-03 | Phase 12 | Complete |
| ROUTE-04 | Phase 12 | Complete |
| UI-01 | Phase 13 | Complete |
| UI-02 | Phase 13 | Complete |
| UI-03 | Phase 13 | Complete |
| UI-04 | Phase 13 | Complete |
| I18N-01 | Phase 13 | Complete |
| I18N-02 | Phase 13 | Complete |
| STYLE-01 | Phase 13 | Complete |
| TEST-01 | Phase 11 | Complete |
| TEST-02 | Phase 11 | Complete |
| TEST-03 | Phase 11 | Complete |
| TEST-04 | Phase 11 | Complete |
| VOICE-01 | Phase 14 | Complete |
| VOICE-02 | Phase 14 | Complete |
| VOICE-03 | Phase 14 | Complete |
| VOICE-04 | Phase 14 | Complete |
| VOICE-05 | Phase 14 | Complete |
| VOICE-06 | Phase 14 | Complete |
| VOICE-07 | Phase 14 | Complete |
| VOICE-08 | Phase 14 | Complete |
| VOICE-09 | Phase 14 | Complete |
| VOICE-10 | Phase 14 | Complete |
| VOICE-11 | Phase 14 | Complete |
| VOICE-12 | Phase 14 | Complete |
| VOICE-13 | Phase 14 | Complete |
| VOICE-14 | Phase 14 | Complete |

**Coverage:**
- v1.2 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-06 — Phase 14 VOICE-01 through VOICE-14 requirements added*
