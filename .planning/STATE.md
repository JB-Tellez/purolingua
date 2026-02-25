# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Planning next milestone

## Current Position

Phase: v1.1 complete — planning next milestone
Status: Complete
Last activity: 2026-02-25 - Completed quick task 1: Remove Playwright tests

## Accumulated Context

### Decisions

- Vanilla JS only — no framework changes
- All persistence is localStorage; no backend
- Streak tracking was removed — do not re-add without deliberate discussion
- Web Speech API: TTS works broadly; voice recognition has browser support limitations (mainly Chromium-based)
- A1 cards must be appended to the END of deck arrays — never inserted before existing cards; positional indices are SRS keys
- One shared SRS track across levels — users advancing from A1 to A2 keep all progress
- Card schema: every card must have {front, back, level} with level one of 'A1' | 'A2'
- 20 A1 cards per deck provides minimum foil pool coverage for 4-option quiz format
- setActiveLevels does NOT call saveLevelFilter — coordinator pattern in app.js handles save-on-set
- updateActiveLevels() is the coordinator (sets state + persists); initActiveLevels() must run after loadProgress()
- generateChoices takes filteredCards array (not deck object)
- resetProgress() does not reset level filter preference (product decision — may revisit)

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Remove Playwright tests | 2026-02-25 | 956ea3d | [1-remove-playwright-tests](.planning/quick/1-remove-playwright-tests/) |

## Session Continuity

Last session: 2026-02-24
Stopped at: v1.1 milestone archived — ready for /gsd:new-milestone
Resume file: None
