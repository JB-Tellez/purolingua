# Requirements: PuroLingua

**Defined:** 2026-02-22
**Core Value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.

## v1.1 Requirements

Requirements for the Difficulty Levels milestone. Each maps to roadmap phases.

### Content

- [ ] **CONT-01**: All 160 existing Italian and Spanish cards have `level: "A2"` added to their data
- [ ] **CONT-02**: Italian decks include A1 phrase content for all 8 topic categories (minimum 4 cards per deck, ~20 target)
- [ ] **CONT-03**: Spanish decks include A1 phrase content for all 8 topic categories (minimum 4 cards per deck, ~20 target)

### Filter

- [ ] **FLTR-01**: User can filter decks by level using A1/A2 chips on the deck screen
- [ ] **FLTR-02**: Level filter is multi-select — user can have A1 only, A2 only, or both active simultaneously
- [ ] **FLTR-03**: New users (no prior SRS progress in localStorage) default to A1 only
- [ ] **FLTR-04**: Returning users (existing SRS progress detected in localStorage) default to A1+A2
- [ ] **FLTR-05**: Level filter selection persists across browser sessions via localStorage
- [ ] **FLTR-06**: At least one level chip must remain selected — deselecting all is prevented
- [ ] **FLTR-07**: Due-count badge and study session use the same level filter logic (no count mismatch)
- [ ] **FLTR-08**: Quiz answer choices (distractors) are drawn from the level-filtered card pool only
- [ ] **FLTR-09**: Level chip labels are defined in the i18n system (it/ui.js and es/ui.js)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Difficulty Levels

- **FLTR-10**: Level filter chips are hidden/disabled during an active study session
- **FLTR-11**: B1/B2 content tiers added to decks

### Onboarding

- **ONBRD-01**: Level placement quiz helps new users choose starting level
- **ONBRD-02**: Level progress bar shows mastery percentage per level

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Per-language level preference | Adds complexity; global level pref simpler and sufficient for v1.1 |
| Separate SRS track per level | Breaks "one track per language" — users advancing from A1 to A2 would lose progress continuity |
| Content hash migration for card keys | Positional index keys are safe with append-only insertion; migration not worth the risk |
| Streak tracking | Previously removed — do not re-add |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | Phase 6 | Pending |
| CONT-02 | Phase 6 | Pending |
| CONT-03 | Phase 6 | Pending |
| FLTR-01 | Phase 8 | Pending |
| FLTR-02 | Phase 7 | Pending |
| FLTR-03 | Phase 7 | Pending |
| FLTR-04 | Phase 7 | Pending |
| FLTR-05 | Phase 7 | Pending |
| FLTR-06 | Phase 7 | Pending |
| FLTR-07 | Phase 7 | Pending |
| FLTR-08 | Phase 7 | Pending |
| FLTR-09 | Phase 8 | Pending |

**Coverage:**
- v1.1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 — traceability filled after roadmap creation*
