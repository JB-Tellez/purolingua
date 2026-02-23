# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Phase 6 — Content and Data (v1.1 Difficulty Levels)

## Current Position

Phase: 6 of 8 (Content and Data)
Plan: 1 of 1 in current phase
Status: In progress
Last activity: 2026-02-23 — Completed plan 06-01 (Italian A2 tagging and A1 card append)

Progress: [█░░░░░░░░░] 10%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 4min
- Total execution time: 4min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 06-content-and-data | 1 | 4min | 4min |

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

### Pending Todos

None yet.

### Blockers/Concerns

- A1 Italian phrase quality: specific phrase selections are synthesized from training knowledge, not validated by a native speaker. Recommend linguistic review before shipping Phase 6 content.
- Foil pool minimum: each deck must have at least 4 cards per level for a valid 4-option quiz. Verified in 06-01 — all Italian decks now have 20 A1 cards each (satisfies minimum).

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 06-01-PLAN.md — Italian A2 tagging and A1 card content
Resume file: None
