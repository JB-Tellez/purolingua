# Requirements: PuroLingua

**Defined:** 2026-03-08
**Core Value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.

## v1.3 Requirements

### Activity Picker

- [x] **ACTPICK-01**: User can choose between Rephrase and Q&A activities after selecting a language

### Q&A Data

- [x] **QADATA-01**: User can access 7 Italian Q&A scenarios with target-language questions and 4-option responses
- [x] **QADATA-02**: User can access 7 Spanish Q&A scenarios with target-language questions and 4-option responses (parallel to Italian)

### Q&A Flow

- [x] **QAFLOW-01**: User can browse Q&A scenarios in a grid with icon, title, and live due-count badge
- [x] **QAFLOW-02**: User can filter Q&A scenarios by level (A1/A2 chips, same FLTR-06 guard)
- [x] **QAFLOW-03**: User sees a target-language question with an audio button on the card front
- [x] **QAFLOW-04**: User selects the correct response from 4 target-language options — no native language shown
- [x] **QAFLOW-05**: User can speak an answer via voice recognition in Q&A sessions
- [x] **QAFLOW-06**: User's Q&A progress persists via Leitner SRS with prefixed localStorage keys (`qa_{scenarioId}_{cardId}`)
- [x] **QAFLOW-07**: User sees correct/incorrect feedback overlay consistent with Rephrase mode
- [x] **QAFLOW-08**: User sees scenario-complete and all-done end screens after finishing a session

### Bug Fixes

- [x] **BUGFIX-01**: User sees live due-count badges on Rephrase deck tiles (not static card count)
- [x] **BUGFIX-02**: User is not shown all-done screen prematurely in A1-only mode

## Future Requirements

### Tech Debt

- **DEBT-01**: Extract duplicated `speak()` helper from AudioButton.tsx and StudySession.tsx into `src/lib/speak.ts`
- **DEBT-02**: Remove unused `src/i18n/navigation.ts` locale helpers

### Content Quality

- **CONTENT-01**: A1 phrase linguistic quality reviewed by native speaker (Italian and Spanish)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mixed Rephrase + Q&A decks | Activity types stay fully separate |
| English context hints in Q&A | No native language once activity begins — by design |
| B1/B2 scenario content | Deferred to v2 |
| New Rephrase deck content | v1.3 focused on Q&A mode addition |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUGFIX-01 | Phase 16 | Complete |
| BUGFIX-02 | Phase 16 | Complete |
| QADATA-01 | Phase 17 | Complete |
| QADATA-02 | Phase 17 | Complete |
| QAFLOW-06 | Phase 17 | Complete |
| ACTPICK-01 | Phase 18 | Complete |
| QAFLOW-01 | Phase 18 | Complete |
| QAFLOW-02 | Phase 18 | Complete |
| QAFLOW-03 | Phase 19 | Complete |
| QAFLOW-04 | Phase 19 | Complete |
| QAFLOW-05 | Phase 19 | Complete |
| QAFLOW-07 | Phase 19 | Complete |
| QAFLOW-08 | Phase 19 | Complete |

**Coverage:**
- v1.3 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after roadmap creation*
