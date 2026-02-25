# PuroLingua

## What This Is

PuroLingua is a browser-based language learning app for travelers and conversational learners. It uses flashcard decks and a Leitner spaced repetition system to build practical vocabulary across topic categories like restaurants, travel, and daily life — with CEFR-level filtering so beginners can start with A1 content before advancing. No account, no backend, no frameworks.

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

### Active

<!-- Requirements for the next milestone. -->

- [ ] A1 phrase linguistic quality verified by native speaker (Italian and Spanish)
- [ ] Level filter chips hidden during active study session (FLTR-10)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- User accounts / backend — Core value is zero-friction, localStorage-first
- Streak tracking — Removed; not aligned with core value
- Mobile app — Web-first for now; browser works on mobile
- Per-language level preference — Global pref simpler and sufficient
- Separate SRS track per level — Breaks progress continuity when advancing from A1 to A2
- Content hash migration for card keys — Positional index keys safe with append-only insertion
- B1/B2 content tiers — Deferred to v2

## Context

Shipped v1.1 with ~2,882 LOC vanilla JS.
Tech stack: Vite, Vitest + jsdom (unit), Playwright (E2E — Chromium/Firefox/WebKit).
Deck data: 320 A2 cards + ~320 A1 cards across 8 topic decks per language (Italian + Spanish).
Known: A1 phrase content synthesized from training data — needs native speaker review before recommending to learners.
Live at purolingua.com; GitHub Pages for staging.

## Constraints

- **Tech stack**: Vanilla JS only — no React, Vue, etc. Keeps it simple and universally compatible
- **No backend**: All state lives in localStorage; no server round trips
- **Browser APIs only**: TTS and voice via Web Speech API; no paid services
- **Card indices**: A1 cards must always be appended to deck arrays — positional indices are SRS keys; inserting before existing cards corrupts progress

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Leitner 3-box system | Simple, proven SRS for casual learners | ✓ Good |
| localStorage for persistence | Zero friction, no sign-up | ✓ Good |
| Vanilla JS, no framework | Portability and simplicity | ✓ Good |
| Remove streak tracking | Didn't align with core value | ✓ Good |
| Web Speech API for audio | No cost, browser-native | ✓ Good |
| Append-only card insertion | Preserves SRS positional index contract | ✓ Good |
| One SRS track per language (not per level) | Users advancing A1→A2 keep all progress | ✓ Good |
| Coordinator pattern for activeLevels | setActiveLevels doesn't auto-save; initActiveLevels/updateActiveLevels coordinate | ✓ Good |
| CEFR codes as chip labels (A1/A2) | Language-neutral — same in all locales, no i18n duplication | ✓ Good |
| resetProgress() does not reset level filter | Filter preference is independent of SRS progress | ⚠️ Revisit |

---
*Last updated: 2026-02-24 after v1.1 milestone*
