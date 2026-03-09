# Milestones

## v1.2 — Next.js Port

**Shipped:** 2026-03-09
**Phases:** 9–15 (7 phases, 19 plans)
**Files changed:** 323 | **LOC:** 2,653 TypeScript/TSX | **Timeline:** 4 days

### What Shipped

- Next.js 15 + TypeScript + Tailwind + next-intl project scaffolded on `feat/nextjs-port` with static export
- All 320 A2 + 320 A1 flashcards (16 decks, Italian + Spanish) ported to typed TypeScript modules
- Leitner SRS math, choice generation, `useSRS`, and `useLevelFilter` hooks ported with 57 Vitest tests
- Full URL routing (`/`, `/[lang]`, `/[lang]/[deck]`) with `generateStaticParams` covering all 16 paths
- All UI components built (FlashCard, ChoiceButton, AudioButton, LevelFilterChips) with next-intl i18n
- Voice recognition hook (`useVoiceRecognition` + `MicButton`), feedback message overlay, and end-of-session screens

### Known Gaps

Proceeded with known gaps from audit — deferred to v1.3:

- **ROUTE-02**: Live due-count badges not implemented — `src/app/[lang]/page.tsx` shows static card count; `useSRS` never called in deck grid
- **UX-05**: `allDecksEmpty` check defective in A1-only mode — uses current deck's filtered index range for all decks, triggers all-done prematurely

---

## v1.0 — Initial Release

**Shipped:** 2025 (pre-GSD)
**Phases:** 1–5 (estimated; pre-GSD, no phase tracking)

### What Shipped

- Spaced repetition (Leitner 3-box system)
- Italian and Spanish vocabulary decks (8 topic categories each)
- Audio playback (Web Speech API TTS)
- Voice recognition for spoken quiz answers
- Multiple-choice quiz with randomized distractors
- Persistent progress via localStorage
- Language picker UI
- Extensible i18n system
- Vite build system
- Vitest unit tests + Playwright E2E tests (Chromium, Firefox, WebKit)
- GitHub Pages staging deployment
- Streak tracking added then removed

### Key Outcomes

- Live at purolingua.com
- Works across major browsers
- Zero-friction: no sign-up, no backend required

---
*Last updated: 2026-02-22*

## v1.1 — Difficulty Levels

**Shipped:** 2026-02-23
**Phases:** 6–8 (3 phases, 9 plans)
**Files changed:** 37 | **Net lines:** +4,307 | **Timeline:** 2 days

### What Shipped

- CEFR level tagging: all 320 existing Italian and Spanish cards tagged `level: "A2"`
- ~160 A1 phrase cards added to all 8 Italian topic decks (appended, no index corruption)
- ~160 A1 phrase cards added to all 8 Spanish topic decks (appended, no index corruption)
- Level filter state machine: `activeLevels` in state.js, localStorage persistence, new/returning user defaults
- Level filter wired through `getDueCount`, `startDeck`, and `generateChoices` — no count mismatch, no cross-level foil contamination
- A1/A2 pill-shaped filter chips above deck grid with i18n labels and FLTR-06 guard (can't deselect all)

### Tech Debt

- A1 phrase linguistic quality: content synthesized from training data, not verified by native speaker
- Browser visual confirmation pending for chip styles and localStorage round-trip behavior
- FLTR-03 edge case: `resetProgress()` does not reset level filter preference (product decision deferred)

---

