# PuroLingua

## Current State: v1.3 Shipped

**Shipped:** 2026-03-10

Q&A Mode complete. The Next.js port (`feat/nextjs-port`) now has two distinct study activities: Rephrase (flashcard SRS) and Q&A (target-language conversation scenarios). All v1.2 regressions fixed. 98 unit tests pass.

## What This Is

PuroLingua is a browser-based language learning app for travelers and conversational learners. It uses flashcard decks and a Leitner spaced repetition system to build practical vocabulary across topic categories like restaurants, travel, and daily life — with CEFR-level filtering so beginners can start with A1 content before advancing. The v1.1 vanilla JS app lives at purolingua.com; the v1.2 Next.js port (`feat/nextjs-port`) is a TypeScript + React rebuild with proper URL routing, deployable as a static export to a VPS.

## Core Value

Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Spaced repetition (Leitner 3-box system: 1-, 3-, 7-day intervals) — v1.0
- ✓ Multi-language support: Italian and Spanish — v1.0
- ✓ Topic vocabulary decks (Daily Life, Restaurant, Travel, Shopping, Hotel, Emergencies, Social, Weather) — v1.0
- ✓ Audio playback via Web Speech API (TTS) — v1.0
- ✓ Voice recognition for spoken quiz answers — v1.0
- ✓ Multiple-choice quiz with randomized distractors — v1.0
- ✓ Persistent progress via localStorage (no sign-up) — v1.0
- ✓ Language picker UI — v1.0
- ✓ Extensible i18n system for adding new languages — v1.0
- ✓ GitHub Pages staging deployment — v1.0
- ✓ CEFR level tagging on all cards (A1 / A2) — v1.1
- ✓ A1 phrase content for all 8 Italian topic decks (~20 cards/deck) — v1.1
- ✓ A1 phrase content for all 8 Spanish topic decks (~20 cards/deck) — v1.1
- ✓ Level filter chips on deck screen (multi-select: A1, A2, or both) — v1.1
- ✓ New users default to A1 only; returning users default to A1+A2 — v1.1
- ✓ Level filter persists across sessions via localStorage — v1.1
- ✓ FLTR-06 guard: cannot deselect all level chips — v1.1
- ✓ Due-count badge and study session use identical level filter (no count mismatch) — v1.1
- ✓ Quiz distractors drawn only from level-filtered card pool — v1.1
- ✓ Level chip labels defined in i18n system — v1.1
- ✓ Next.js 15 static export with TypeScript, Tailwind, next-intl on feature branch — v1.2
- ✓ All card data ported to typed TypeScript modules (Card, Deck, Progress types) — v1.2
- ✓ SRS lib + hooks (`useSRS`, `useLevelFilter`) ported to TypeScript with 57 Vitest tests — v1.2
- ✓ Full URL routing (`/`, `/[lang]`, `/[lang]/[deck]`) with `generateStaticParams` — v1.2
- ✓ All UI components: FlashCard, ChoiceButton, AudioButton, LevelFilterChips — v1.2
- ✓ next-intl i18n delivering Italian and Spanish UI strings — v1.2
- ✓ Voice recognition hook (`useVoiceRecognition` + `MicButton`) — v1.2
- ✓ Feedback message overlay (correct/incorrect/heard/not-recognized) — v1.2
- ✓ Deck-complete and all-done end-of-session screens — v1.2
- ✓ Live due-count badges on Rephrase deck tiles reactive to level filter — v1.3
- ✓ `allDecksEmpty` fix: language-scoped, per-deck, index-preserving — v1.3
- ✓ 7 Italian + 7 Spanish Q&A scenarios (56 + 56 bilingual QACards, A1/A2) — v1.3
- ✓ `useQASRS` hook with `qa_`-prefixed Leitner keys, level filtering — v1.3
- ✓ Activity Picker screen (Rephrase / Q&A) at `/[lang]` — v1.3
- ✓ Scenario browser at `/[lang]/qa` with live due-count badges and level filter — v1.3
- ✓ `QAStudySession` — target-language-only, 4-choice, TTS audio, voice recognition, feedback, end screens — v1.3

### Active

<!-- Requirements for the next milestone. -->

(None yet — run `/gsd:new-milestone` to define v1.4 requirements)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- User accounts / backend — Core value is zero-friction, localStorage-first
- Streak tracking — Removed; not aligned with core value
- Mobile app — Web-first for now; browser works on mobile
- Per-language level preference — Global pref simpler and sufficient
- Separate SRS track per level — Breaks progress continuity when advancing from A1 to A2
- Content hash migration for card keys — Positional index keys safe with append-only insertion
- B1/B2 content tiers — Deferred to v2
- SSR / API routes — Static export only for portfolio use case
- React Context / Zustand — State surface small enough for focused hooks

## Context

Two codebases: v1.1 vanilla JS (~2,882 LOC) lives on `main`, ships to purolingua.com. v1.2 Next.js port (2,653 LOC TypeScript/TSX) lives on `feat/nextjs-port`, deployable static export. Both share the same card data structure and localStorage key format.

Deck data: 320 A2 cards + ~320 A1 cards across 8 topic decks per language (Italian + Spanish).

Known: A1 phrase content synthesized from training data — needs native speaker review before recommending to learners.

Tech stacks:
- v1.1 (main): Vite, Vitest + jsdom (unit), Playwright (E2E — Chromium/Firefox/WebKit)
- v1.2 (feat/nextjs-port): Next.js 15, TypeScript, Tailwind v4, next-intl, Vitest + React Testing Library

## Constraints

- **No backend**: All state lives in localStorage; no server round trips
- **Browser APIs only**: TTS and voice via Web Speech API; no paid services
- **Card indices**: A1 cards must always be appended to deck arrays — positional indices are SRS keys; inserting before existing cards corrupts progress
- **Static export only**: Next.js port uses `output: 'export'` — no middleware, no SSR, no API routes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Leitner 3-box system | Simple, proven SRS for casual learners | ✓ Good |
| localStorage for persistence | Zero friction, no sign-up | ✓ Good |
| Vanilla JS, no framework (v1.1) | Portability and simplicity | ✓ Good |
| Next.js + TypeScript + Tailwind (v1.2) | Portfolio-grade rewrite with proper routing | ✓ Good |
| Remove streak tracking | Didn't align with core value | ✓ Good |
| Web Speech API for audio | No cost, browser-native | ✓ Good |
| Append-only card insertion | Preserves SRS positional index contract | ✓ Good |
| One SRS track per language (not per level) | Users advancing A1→A2 keep all progress | ✓ Good |
| Coordinator pattern for activeLevels | setActiveLevels doesn't auto-save; initActiveLevels/updateActiveLevels coordinate | ✓ Good |
| CEFR codes as chip labels (A1/A2) | Language-neutral — same in all locales, no i18n duplication | ✓ Good |
| resetProgress() does not reset level filter | Filter preference is independent of SRS progress | ⚠️ Revisit |
| No middleware.ts (v1.2) | Static export incompatible with Next.js middleware; locale routing via generateStaticParams | ✓ Good |
| useSRS localStorage key format preserved | `${lang}-progress` matches v1.1 for existing user data continuity | ✓ Good |
| trailingSlash: true (v1.2) | Required for out/{locale}/index.html format on Hostinger static hosting | ✓ Good |
| Fisher-Yates shuffle in generateChoices | Upgrade from biased sort used in v1.1 | ✓ Good |
| FeedbackMessage in two positions | Inside card-back for quiz feedback, above controls for voice feedback | ✓ Good |
| span[role=button] for ChoiceButton speaker icon | Nesting buttons is invalid HTML | ✓ Good |
| Proceed with ROUTE-02 + UX-05 gaps | Both are non-breaking; deferred to v1.3 | ✓ Good — fixed in v1.3 |
| `useSRS`+`useLevelFilter` lifted into `LangPage` | Single hook ownership; chip toggle propagates to badge in one React cycle | ✓ Good |
| `qa_` prefix for Q&A SRS keys | Namespaces Q&A progress without breaking Rephrase key format | ✓ Good |
| `QAStudySession` SSR bypassed via `next/dynamic ssr:false` | localStorage + Web Speech API unavailable during SSR | ✓ Good |
| Scenario IDs as English slugs | Language-neutral URLs — same slug for `/it/qa/caffe` and `/es/qa/caffe` | ✓ Good |

---
*Last updated: 2026-03-10 after v1.3 milestone*
