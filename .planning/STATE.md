---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Next.js Port
status: planning
stopped_at: Completed 15-03-PLAN.md
last_updated: "2026-03-08T17:16:53.069Z"
last_activity: 2026-03-07 — Phase 14 complete; session bugs fixed
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 19
  completed_plans: 19
  percent: 93
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** v1.2 — Phase 15: Study Session UX Polish

## Current Position

Phase: 15 of 15 (Study Session UX Polish)
Plan: — (needs planning)
Status: Ready to plan
Last activity: 2026-03-07 — Phase 14 complete; session bugs fixed

Progress: [█████████░] 93%

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v1.2)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 09-scaffold P01 | 5 | 3 tasks | 10 files |
| Phase 09-scaffold P02 | 5 | 2 tasks | 8 files |
| Phase 10-data-migration P02 | 3 | 2 tasks | 8 files |
| Phase 10-data-migration P01 | 15 | 2 tasks | 8 files |
| Phase 10-data-migration P03 | 5 | 2 tasks | 3 files |
| Phase 11-logic-and-tests P01 | 5 | 2 tasks | 8 files |
| Phase 11-logic-and-tests P02 | 4 | 2 tasks | 4 files |
| Phase 11-logic-and-tests P03 | 2 | 2 tasks | 4 files |
| Phase 12-routing P02 | 2 | 1 tasks | 3 files |
| Phase 12-routing P01 | 15 | 1 tasks | 1 files |
| Phase 13-ui-i18n-and-styling P01 | 2 | 2 tasks | 4 files |
| Phase 13-ui-i18n-and-styling P02 | 2 | 2 tasks | 3 files |
| Phase 14-voice-recognition P01 | 5 | 2 tasks | 4 files |
| Phase 14-voice-recognition P02 | 5 | 2 tasks | 6 files |
| Phase 15-study-session-ux-polish P02 | 5 | 2 tasks | 2 files |
| Phase 15-study-session-ux-polish P01 | 8 | 2 tasks | 3 files |
| Phase 15-study-session-ux-polish P03 | 5 | 1 tasks | 1 files |
| Phase 15-study-session-ux-polish P03 | 35 | 3 tasks | 1 files |

## Accumulated Context

### Decisions

- v1.2 is a strict feature parity port — no new features, no SSR, no external state library
- Static export only (`output: 'export'`); deployed to Hostinger VPS from `feat/nextjs-port`
- localStorage key format from v1.1 must be preserved exactly in useSRS hook
- FLTR-06 guard must be enforced in useLevelFilter — cannot deselect all levels
- Tests live alongside logic in Phase 11 (not a separate phase) — test-alongside-build pattern
- CEFR codes A1/A2 are language-neutral; next-intl message files cover deck names and UI strings only
- [Phase 09-scaffold]: Scaffolded create-next-app to /tmp then copied files — tool refuses to run in directories with existing content (.planning/, tests/)
- [Phase 09-scaffold]: i18n/request.ts stub with hardcoded locale 'it' satisfies next-intl plugin at build time; Plan 02 replaces with routing-aware config
- [Phase 09-scaffold]: DeckId uses eight confirmed literals from main-branch vanilla JS source: daily, restaurant, travel, shopping, hotel, emergencies, social, weather
- [Phase 09-scaffold]: trailingSlash: true required in next.config.ts for out/{locale}/index.html output (Hostinger static hosting format)
- [Phase 09-scaffold]: No middleware.ts created — static export is incompatible with Next.js middleware; locale routing uses generateStaticParams + setRequestLocale pattern only
- [Phase 10-data-migration]: Card order preserved exactly from main-branch vanilla JS source — positional indices are SRS localStorage keys
- [Phase 10-data-migration]: Card order preserved exactly from main-branch source — A2 first, A1 appended — to maintain SRS key integrity
- [Phase 10-data-migration]: Italian deck modules omit id/title/description/icon/theme — those go in Plan 03 metadata module; only front/back/level copied
- [Phase 10-data-migration]: i18nKey equals DeckId string — deck IDs match message file namespace keys exactly
- [Phase 10-data-migration]: DECK_IDS exported as flat DeckId[] without lang for Phase 12 generateStaticParams
- [Phase 11-logic-and-tests]: Test stubs avoid importing unimplemented modules — stubs use expect(true).toBe(true) placeholder until Plans 02/03 replace them
- [Phase 11-logic-and-tests]: Progress.nextReview changed from number (Unix ms) to string (YYYY-MM-DD) to match v1.1 localStorage format
- [Phase 11-logic-and-tests]: addDays uses setUTCDate to avoid PST timezone offset corrupting YYYY-MM-DD date math
- [Phase 11-logic-and-tests]: makeCards test helper includes level in back string to distinguish pool isolation test data
- [Phase 11-logic-and-tests]: Fisher-Yates shuffle used over biased sort in generateChoices.ts - upgrade from v1.1
- [Phase 11-logic-and-tests]: useSRS localStorage key is exactly ${lang}-progress — matches v1.1 format for existing user data continuity
- [Phase 11-logic-and-tests]: FLTR-06 guard: setActiveLevels([]) and (null) are silent no-ops in useLevelFilter hook
- [Phase 12-routing]: StudySession placed in separate file from page.tsx to satisfy Next.js use client + generateStaticParams separation constraint
- [Phase 12-routing]: StudySession uses isCardDueForDeck + updateCard (actual useSRS API) not getDueCards/markCard (plan pseudocode)
- [Phase 12-routing]: 'use client' page with useParams() — setRequestLocale delegated to layout.tsx; generateStaticParams cannot coexist with use client in Next.js 16
- [Phase 12-routing]: Due badge counts ProgressRecord keys by deckId prefix — useSRS has no getDueCount; badges show 0 until Phase 13 wires card data
- [Phase 12-routing]: style-reference.css imported globally in globals.css so all design system classes are available to both pages without scoped imports
- [Phase 12-routing]: Deck theme class (theme-teal, theme-red, etc.) sourced directly from deckMetadata[].theme — no mapping layer needed
- [Phase 13-ui-i18n-and-styling]: LANG_NAMES static map used for language proper nouns (Italiano, Español) — not i18n-managed
- [Phase 13-ui-i18n-and-styling]: generateChoices actual signature is (correctCard, filteredCards) returning Choice[] — plan interface was wrong; StudySession adapted to use choice.isCorrect flag
- [Phase 14-voice-recognition]: Singleton mockRecognitionInstance exported from setup.ts so tests can access handler fields directly without re-importing
- [Phase 14-voice-recognition]: Stub test files avoid importing unimplemented modules — stubs use expect(true).toBe(true) placeholders until Plans 02/03 replace them
- [Phase 14-voice-recognition]: MockSpeechRecognition uses regular function not arrow function — arrow functions cannot be used as constructors with new()
- [Phase 14-voice-recognition]: RecognitionClass captured at render time (not in startListening) so isSupported reflects window state at hook mount
- [Phase 15-study-session-ux-polish]: FeedbackMessage uses static COLOR_CLASS record keyed by Exclude<FeedbackState, null> for exhaustive type-safe state-to-color mapping
- [Phase 15-study-session-ux-polish]: aria-live=polite chosen for FeedbackMessage — feedback is informational, not urgent, avoids interrupting screen reader flow
- [Phase 15-study-session-ux-polish]: Used span[role=button] instead of nested button for ChoiceButton speaker icon — nesting buttons is invalid HTML
- [Phase 15-study-session-ux-polish]: onSpeak prop is optional (onSpeak?: () => void) so existing ChoiceButton call sites compile without changes
- [Phase 15-study-session-ux-polish]: FeedbackMessage rendered in two positions: inside card-back for quiz choice feedback, above controls for voice recognition feedback when flipped
- [Phase 15-study-session-ux-polish]: resetSession() resets all state fields instead of key-prop remount — keeps due cards snapshot frozen for study-again flow
- [Phase 15-study-session-ux-polish]: allDone state guard checked before done in render path so all-done screen takes priority when both could be true
- [Phase 15-study-session-ux-polish]: resetSession() resets all state fields instead of key-prop remount — keeps due cards snapshot frozen for study-again flow
- [Phase 15-study-session-ux-polish]: allDone state guard checked before done in render path so all-done screen takes priority when both could be true
- [Phase 15-study-session-ux-polish]: FeedbackMessage rendered in two positions: inside card-back for quiz choice feedback, above controls for voice recognition feedback when flipped

### Pending Todos

- A1 phrase linguistic quality: needs native speaker review (Italian and Spanish) before shipping to learners

### Roadmap Evolution

- Phase 14 added: Voice Recognition — mic button on card front (speak to flip) and card back (speak to match choice)
- Phase 15 added: Study Session UX Polish — audio icon per ChoiceButton, feedback message overlay, deck-complete/all-done alert modals

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08T17:16:53.065Z
Stopped at: Completed 15-03-PLAN.md
Resume file: None
