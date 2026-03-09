# Retrospective: PuroLingua

## Milestone: v1.2 — Next.js Port

**Shipped:** 2026-03-09
**Phases:** 7 (9–15) | **Plans:** 19 | **LOC:** 2,653 TypeScript/TSX | **Timeline:** 4 days

### What Was Built

- Next.js 15 project with TypeScript, Tailwind v4, next-intl, and static export on `feat/nextjs-port`
- All 640 flashcards (8 Italian + 8 Spanish decks) ported to typed TypeScript modules
- Pure TypeScript SRS lib (`lib/srs.ts`, `lib/generateChoices.ts`) + React hooks (`useSRS`, `useLevelFilter`) with 57 Vitest tests
- Full URL routing (`/`, `/[lang]`, `/[lang]/[deck]`) with `generateStaticParams` for all 16 paths
- UI components: FlashCard, ChoiceButton (with speaker icon), AudioButton, LevelFilterChips, MicButton, FeedbackMessage
- Voice recognition hook (`useVoiceRecognition`) wired into StudySession (speak-to-flip, speak-to-match)
- Feedback overlay (4 states: correct/incorrect/heard/not-recognized) and end screens (deck-complete + all-done)

### What Worked

- **Phase-per-concern decomposition** — separating scaffold, data, logic, routing, UI, and voice into distinct phases kept each plan focused and fast to execute
- **TDD for voice recognition (Phase 14)** — writing stub tests first, then replacing with real assertions, caught the `new` constructor issue with arrow functions early
- **Fisher-Yates over biased sort** — upgrade to a proper shuffle in `generateChoices.ts` was clean because it was isolated in a pure function
- **Summary.md dependency graphs** — the `requires/provides` YAML in each plan summary made cross-phase handoffs clear

### What Was Inefficient

- **Audit found gaps after shipping** — ROUTE-02 (live badge) was claimed as complete in Phase 12 VERIFICATION.md but never implemented; better integration checking during execution would catch this
- **Missing VERIFICATION.md for Phases 13 and 14** — verification step was skipped under time pressure; audit blocked on missing evidence even when implementation was correct
- **STATE.md performance metrics** — the metrics table was never populated during this milestone; either automate or remove the field
- **Phase 15 VERIFICATION.md went stale immediately** — written before VOICE-13/14 test fixes and UX-01–05 req additions; a verification should be written after all fixes, not mid-phase

### Patterns Established

- **`use client` + `generateStaticParams` separation** — Next.js 16 requires these in different files; `StudySession.tsx` handles client state, `page.tsx` handles static generation
- **No middleware in static export** — `middleware.ts` incompatible with `output: 'export'`; locale routing works via `generateStaticParams` + `setRequestLocale` in layout
- **`span[role=button]` for icon-buttons inside buttons** — avoids invalid nested `<button>` HTML
- **`resetSession()` over key-prop remount** — resetting all state fields keeps the due-cards snapshot frozen for study-again flow

### Key Lessons

- Write VERIFICATION.md only after the phase is fully done (including any bug fixes) — stale verifications cost audit time
- Integration tests for page-level data wiring (like `useSRS` in deck grid) catch gaps that unit tests miss
- `allDecksEmpty` logic belongs at the hook level (knowing all deck card arrays), not derived from the current session's filtered card array

### Cost Observations

- Sessions: ~8 sessions across 4 days
- Notable: Voice recognition phase was the heaviest — mock setup, hook implementation, and StudySession integration each needed separate plans to stay manageable

---

## Cross-Milestone Trends

| Milestone | Phases | Plans | Days | LOC |
|-----------|--------|-------|------|-----|
| v1.0 | 5 (est.) | — | — | ~2,882 JS |
| v1.1 | 3 | 9 | 2 | +4,307 JS |
| v1.2 | 7 | 19 | 4 | 2,653 TS |

### Patterns Across Milestones

- **Append-only card insertion** — established in v1.1, carried into v1.2 type constraints; positional SRS key contract is stable
- **FLTR-06 guard** — first enforced in v1.1 state machine, re-implemented in v1.2 `useLevelFilter` hook; clean boundary
- **Verification gaps compound** — skipping VERIFICATION.md in v1.2 Phases 13/14 caused audit blockers; consistent verification is the highest-leverage process improvement
