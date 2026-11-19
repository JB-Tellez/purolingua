# EGM Drift Report — 2026-11-19 (second run)

Scope: the 18 EGM contracts (`README.md` plus 17 child `README.md` files), each compared against the current source at `8ca9fab`, after every finding in `2026-11-19_DRIFT_REPORT.md` was resolved. Only divergences are listed: doc ↔ code mismatches, code ↔ code inconsistencies the contracts surface, and code paths no contract covers.

How findings were checked: every contract and the changed source files were read in full. A throwaway Vitest scan (deleted afterwards) ran `normalize` and `bestMatch` over the real deck and scenario answers. Baseline: `npx vitest run` passes (37 files, 334 tests), `tsc --noEmit` is clean. Findings marked "not reproduced" come from reading the code.

## src/types/README.md

No drift detected.

## src/lib/README.md

- **[FIXED 2026-11-19: shared words are a multiset intersection; tests in `matchTranscript.test.ts`. The content scan is unchanged: 4 near-synonym pairs, and every answer picks itself.]** **`matchScore` counts a repeated target word once per occurrence, so a score can exceed 1 and beat an exact match** (confirmed). `shared` counts every target word found in the transcript's *set*, so a target that repeats a word gets credit for each repeat, while the transcript's single copy is counted once in the denominator. `bestMatch('il treno', ['Il treno.', 'Il treno, il.'])` returns `1`: the non-exact target scores `2 × 3 / (2 + 3) = 1.2`, above the exact match's `1`. This contradicts the contract ("the word overlap `2 × shared / (transcript words + target words)`", "An exact match always wins"). 74 of the 1,054 distinct answers in the decks and scenarios repeat a word after normalization (e.g. "Cerco il luogo dove prendere il bus.", "Né grande né piccolo."). Counting shared words as a multiset intersection would keep the score at most 1.
- `LEVELS` is documented as "Used by `LevelFilterChips`". `useLevelFilter` now uses it too (the returning-user default).

## src/hooks/README.md

- **[FIXED 2026-11-19: `startListening` returns whether it started and the sessions show "listening" only then; a session ends at its result or a throwing `start()`; an older session's late `onend` is ignored. Tests in `useVoiceRecognition.test.ts` and both session tests.]** **`startListening` can return without starting, while both sessions already show the mic as listening** (not reproduced). The new guard blocks a start while the current session is neither cancelled nor ended. A session ends only at `onend` or `onerror`, so:
  - Between a result and its `onend`, a new start is refused. For example, the front-mic transcript matches, the card flips, and the user presses the back mic at once.
  - If `rec.start()` throws (swallowed, per Side Effects), the session never ends, and every later start is refused until a cancel or unmount.

  `startListening` returns nothing, so the session has already set `micState` to `'listening'`. The button shows listening (with `aria-pressed`) while nothing runs, no callback ever arrives, and only a second press (which cancels) clears it.
- The Overview says `useLevelFilter` "validates with `@/lib/levels:isLevel`". It also takes its returning-user default from `LEVELS`.

## src/components/README.md

- `AudioButton` has no tests, and the contract says so ("`AudioButton` has no tests yet"). `AGENTS.md` treats untested exports as gaps to close before changing code, and the analyzer reports it as a high-severity gap (`node scripts/analyze-test-coverage.ts src/components/`). It is the only component without a test file.

## src/i18n/README.md

No drift detected.

## src/data/README.md

- Verification says `DeckGrid.test.tsx` and `StudySession.test.tsx` "mock `@/data/decks` and `@/data/deckMap`". `StudySession.test.tsx` mocks only `@/data/deckMap`; `StudySession.endScreens.test.tsx` is the one that mocks both, and the contract does not mention it.

## src/data/it/README.md

No drift detected.

## src/data/es/README.md

No drift detected.

## src/data/qa/README.md

No drift detected.

## src/app/[lang]/README.md

No drift detected.

## src/app/[lang]/rephrase/README.md

No drift detected.

## src/app/[lang]/rephrase/[deck]/README.md

- **[FIXED 2026-11-19: `resetMicError` resets only an error still showing, in both sessions; tests in both session test files (reproduced there first).]** The 800 ms mic-error reset can overwrite a newer mic state (not reproduced). After `notRecognized`, `setTimeout(() => setMicState('idle'), 800)` runs unconditionally. If the user presses the mic again within those 800 ms, the mic goes to `'listening'` and a new recognizer starts, then the old timer sets it back to `'idle'` while the recognizer runs. A press then tries to start again (refused, see `src/hooks`) instead of cancelling. The contract says the mic shows `error` "for 800 ms" but not what happens to a press during that time. `QAStudySession` has the same timer, and it also clears the feedback.

## src/app/[lang]/qa/README.md

No drift detected.

## src/app/[lang]/qa/[scenario]/README.md

No drift detected beyond the mic-error timer noted under `rephrase/[deck]`.

## src/app/README.md

No drift detected.

## src/README.md

No drift detected.

## scripts/README.md

- Every CLI run prints Node's `MODULE_TYPELESS_PACKAGE_JSON` warning to stderr ("Module type of …analyze-test-coverage.ts is not specified … Reparsing as ES module"), because `package.json` has no `"type"` and the file uses ES module syntax. The output is still correct, but the contract's Side Effects list only the script's own warnings and errors. Renaming the script `.mts` (or adding `"type": "module"`) would silence it, but both change things the contract and `AGENTS.md` reference.

## README.md

- The "Static params must agree" global invariant says "Each dynamic segment's `layout.tsx` and `page.tsx` both export `generateStaticParams` (client pages cannot)", which contradicts itself and the code. `[lang]` has the export in `layout.tsx` only (its `page.tsx` is a client page). `rephrase` / `qa` declare their children's params in `layout.tsx`, and the server pages `[deck]/page.tsx` / `[scenario]/page.tsx` repeat them.
- Project Structure's `lib/` line and the `src/lib` entry under Subdirectories list the modules but not `shuffle.ts`, added in the last round ("storage/speech helpers" does not cover it). `src/README.md` and `src/lib/README.md` do list it.

## Files no contract covers

No drift detected.
