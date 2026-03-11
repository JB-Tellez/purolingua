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

## Milestone: v1.3 — Q&A Mode

**Shipped:** 2026-03-10
**Phases:** 4 (16–19) | **Plans:** 13 | **LOC:** 5,275 TypeScript/TSX (total) | **Timeline:** 2 days

### What Was Built

- Fixed live SRS due-count badges on Rephrase deck tiles — lifted `useSRS` + `useLevelFilter` into `LangPage` so chip toggle propagates in a single React cycle
- Fixed premature all-done screen — extracted shared `DECK_MAP`, language-scoped `deckMetadata.filter`, index-preserving array pattern
- 56 Italian + 56 Spanish bilingual QACards across 7 scenarios (5 A1, 2 A2) with fixed-tuple foils
- `useQASRS` hook with `qa_`-prefixed Leitner keys, activeLevels filtering, 12 Vitest tests
- Activity Picker at `/[lang]` routing to Rephrase or Q&A; Scenario browser at `/[lang]/qa` with ScenarioGrid live due-count tiles
- `QAStudySession` — target-language-only, 4-choice, TTS audio, voice recognition (non-match reset), SRS advance, scenario-done + all-done screens; SSR bypassed via `next/dynamic ssr:false`

### What Worked

- **UAT-driven gap closure** — Bug found in Test 3 (wrong-answer auto-advance) led directly to Plan 04; the UAT loop caught a behavior-level bug that unit tests didn't catch
- **Phase 16 as a standalone bugfix phase** — isolating v1.2 regressions before adding new features meant Phase 17+ built on a clean foundation
- **`qa_` prefix namespace** — reusing the same localStorage `{lang}-progress` record with a key prefix required no schema migration and zero collision risk with Rephrase keys
- **SSR bypass pattern established** — `next/dynamic ssr:false` wrapper is now a named pattern for components using browser APIs; Phase 19 applied it cleanly

### What Was Inefficient

- **Wrong-answer bug required Plan 04** — handleChoiceClick auto-advanced on wrong answers; this behavioral requirement (wrong = stay on card) was in the UAT criteria but not tested in the unit suite; a unit test for that branch would have caught it pre-UAT
- **generateStaticParams at both layout and page level** — Next.js static export requires it at the page level even when layout.tsx already has it; this cost a fix commit during Phase 19
- **Hydration mismatch added a fix commit** — QAStudySession's dependency on localStorage + SpeechRecognition during SSR wasn't anticipated in Plan 02; SSR bypass should be planned when browser-API hooks are introduced

### Patterns Established

- **Hook lift for cross-sibling reactivity** — when two sibling components need shared state (LevelFilterChips + DeckGrid), lift the hook to the parent and pass as props; don't call hooks independently in each sibling
- **`next/dynamic ssr:false` for browser-API components** — any component using localStorage or Web Speech API needs the SSR bypass wrapper; document at component creation time
- **Index-preserving filter pattern** — `.map((card,i) => ({card,i})).filter(...).every(({i}) => ...)` for per-card index lookups without re-indexing
- **it.todo() for test scaffolds** — scaffolds with `it.todo()` surface as pending in Vitest output, signaling work remaining; cleaner than `it.skip()`

### Key Lessons

- Unit tests for branch behavior (correct vs wrong answer path) are essential when the behavior requirement is clear — don't rely solely on UAT to catch those
- Plan the SSR bypass at the component design stage, not as a hotfix after hydration errors
- Lifting state to parent (hook ownership pattern) is the correct React solution for sibling reactivity — isolated `useState` per sibling is a known anti-pattern

### Cost Observations

- Sessions: ~4 sessions across 2 days
- Notable: Phase 17 (data authoring) was the most predictable — typed structure + clear content spec = zero deviation. Phase 19 had the most fix commits due to unplanned SSR issues.

---

## Cross-Milestone Trends

| Milestone | Phases | Plans | Days | LOC |
|-----------|--------|-------|------|-----|
| v1.0 | 5 (est.) | — | — | ~2,882 JS |
| v1.1 | 3 | 9 | 2 | +4,307 JS |
| v1.2 | 7 | 19 | 4 | 2,653 TS |
| v1.3 | 4 | 13 | 2 | 5,275 TS |

### Patterns Across Milestones

- **Append-only card insertion** — established in v1.1, carried into v1.2 type constraints; positional SRS key contract is stable
- **FLTR-06 guard** — first enforced in v1.1 state machine, re-implemented in v1.2 `useLevelFilter` hook; clean boundary
- **Verification gaps compound** — skipping VERIFICATION.md in v1.2 Phases 13/14 caused audit blockers; consistent verification is the highest-leverage process improvement
- **Hook ownership at parent** — v1.3 reinforced that sibling components sharing reactive state must lift the hook to their common parent; isolated calls per sibling create silent state divergence
- **UAT catches behavioral gaps unit tests miss** — both v1.2 and v1.3 had production-behavior bugs (ROUTE-02 badge, wrong-answer auto-advance) that passed unit tests; UAT with real browser interaction is non-negotiable
