# PuroLingua

## What This Is

PuroLingua is a browser-based language learning app for travelers and conversational learners. It uses flashcard decks and a Leitner spaced repetition system to build practical vocabulary across topic categories like restaurants, travel, and daily life — no account, no backend, no frameworks.

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

### Active

<!-- Current scope. Building toward these. -->

(None yet — milestone v1.1 in progress)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- User accounts / backend — Core value is zero-friction, localStorage-first
- Streak tracking — Removed; not aligned with core value
- Mobile app — Web-first for now; browser works on mobile

## Context

- Vanilla JavaScript (ES Modules), no frameworks — deliberate constraint for simplicity and portability
- Vite for build tooling; Vitest for unit tests; Playwright for E2E (Chromium, Firefox, WebKit)
- Web Speech API for TTS and voice recognition — browser-native, no external service
- localStorage for persistence — per-language key, no cross-device sync
- Live at purolingua.com; GitHub Pages for staging

## Constraints

- **Tech stack**: Vanilla JS only — no React, Vue, etc. Keeps it simple and universally compatible
- **No backend**: All state lives in localStorage; no server round trips
- **Browser APIs only**: TTS and voice via Web Speech API; no paid services

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Leitner 3-box system | Simple, proven SRS for casual learners | ✓ Good |
| localStorage for persistence | Zero friction, no sign-up | ✓ Good |
| Vanilla JS, no framework | Portability and simplicity | ✓ Good |
| Remove streak tracking | Didn't align with core value | — Pending |
| Web Speech API for audio | No cost, browser-native | ✓ Good |

---
*Last updated: 2026-02-22 after GSD initialization*
