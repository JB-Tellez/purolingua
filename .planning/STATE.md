# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Phase 7 — Filter Logic (v1.1 Difficulty Levels)

## Current Position

Phase: 7 of 8 (Filter Logic)
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-02-23 — Completed plan 07-03 (filter logic wiring in app.js)

Progress: [██████░░░░] 63%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 3min
- Total execution time: 24min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 06-content-and-data | 3 | 10min | 3min |
| 07-filter-logic | 3 | 17min | 5min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

- Vanilla JS only — no framework changes
- All persistence is localStorage; no backend
- Streak tracking was removed — do not re-add without deliberate discussion
- Web Speech API: TTS works broadly; voice recognition has browser support limitations (mainly Chromium-based)
- A1 cards must be appended to the END of deck arrays — never inserted before existing cards; positional indices are SRS keys
- Returning users (prior localStorage progress detected) default to A1+A2; new users default to A1 only
- One shared SRS track across levels — users advancing from A1 to A2 keep all progress
- Card schema: every card must have {front, back, level} with level one of 'A1' | 'A2'
- 20 A1 cards per deck provides minimum foil pool coverage for 4-option quiz format
- [Phase 06-content-and-data]: Spanish A1 cards authored independently (not translated from Italian A1 cards); card schema requires level field after back; A2 at indices 0-19, A1 at indices 20-39
- [Phase 06-content-and-data plan 03]: Data-integrity test (tests/data-integrity.test.js) verifies level fields, min 4 A1 cards per deck, and append order — run `bun run test` to verify after any deck edit
- [Phase 07-filter-logic plan 01]: setActiveLevels does NOT call saveLevelFilter — coordinator pattern in app.js (Plan 03) handles save-on-set; loadLevelFilter returns null (not default) so initActiveLevels() can distinguish new vs returning user; activeLevels excluded from resetDeckState() (persists across deck navigation)
- [Phase 07-filter-logic plan 02]: filter-logic tests use direct source imports (no mocking) following existing test patterns; beforeEach sets locale key so locale-scoped localStorage keys resolve to it-level-filter / it-progress
- [Phase 07-filter-logic plan 03]: updateActiveLevels() is the coordinator (sets state + persists); initActiveLevels() must run after loadProgress() in both initializeApp and switchLanguage; generateChoices now takes filteredCards array (not deck object); badge count (getDueCount) and session queue (startDeck) use identical card-level predicate for parity

### Pending Todos

None yet.

### Blockers/Concerns

- A1 Italian phrase quality: specific phrase selections are synthesized from training knowledge, not validated by a native speaker. Recommend linguistic review before shipping Phase 6 content.
- Foil pool minimum: each deck must have at least 4 cards per level for a valid 4-option quiz. Verified in 06-01 — all Italian decks now have 20 A1 cards each (satisfies minimum).

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 07-03-PLAN.md — filter logic wiring in app.js (Phase 7, Plan 3 of 4)
Resume file: None
