# EGM Drift Report — 2026-11-19 (third run)

Scope: the 18 EGM contracts (`README.md` plus 17 child `README.md` files), compared against the source at `5b8c12d`, after every finding in `2026-11-19_DRIFT_REPORT_2.md` was fixed. Only divergences are listed: doc ↔ code mismatches, code ↔ code inconsistencies the contracts surface, and code paths no contract covers.

How findings were checked: the files changed since the last review (`useVoiceRecognition.ts`, both study sessions, `matchTranscript.ts`, and the contracts edited with them) were read in full; the other contracts were rechecked against the source they describe. Baseline: `npx vitest run` passes (38 files, 346 tests), `tsc --noEmit` is clean. Findings marked "not reproduced" come from reading the code.

## src/types/README.md

No drift detected.

## src/lib/README.md

No drift detected.

## src/hooks/README.md

- **[FIXED 2026-11-19: removed, with its setters and the `isCurrent` guard; the tests that checked it now check what callers can observe.]** **`useVoiceRecognition(...).isListening` has no consumer.** Both sessions now decide the mic toggle from their own `micState` (their comments say why: `isListening` turns true only at `onstart`), and nothing else reads it: outside the hook and its tests, `isListening` appears only in those two comments. The contract documents it as a return value, and the hook keeps `setIsListening` calls and an `isCurrent()` guard in four handlers just to maintain it. Earlier rounds removed unused hook return values (`useSRS().progress`, `useQASRS().hasProgress`) for the same reason.
- **[FIXED 2026-11-19: each start that is not cancelled calls back exactly once; a session ending with no usable result calls `onError`, which the sessions show as `notRecognized`. Tests in `useVoiceRecognition.test.ts`.]** **When recognition ends with neither a result nor an error, the session never hears back, and the mic stays "listening"** (not reproduced). `startListening` reports back only through `onResult` and `onError`. An empty result list ends the session, logs an error, and calls neither (documented), and a browser that fires `onend` without `onresult` or `onerror` behaves the same. Both sessions leave `micState` at `'listening'` until the user presses the mic again (which cancels). The contract describes the empty-results case but not that the caller is left waiting.

## src/components/README.md

No drift detected.

## src/i18n/README.md

- **[FIXED 2026-11-19: `src/__tests__/i18n/request.test.ts` covers a supported locale and the fallback for an unsupported or missing one (checked by breaking the fallback).]** `request.ts` has no test. Its invariant ("Any unsupported or missing locale falls back to `routing.defaultLocale`") is checked nowhere: no test imports `src/i18n/request.ts`, `src/__tests__/i18n` covers `isLang` only, and `localeValidation.test.tsx` covers the route files. The coverage analyzer reports 0 gaps because the file's only export is an anonymous `getRequestConfig(...)` call. The Verification section does not say the fallback is untested.

## src/data/README.md

No drift detected.

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

No drift detected beyond the silent-end case under `src/hooks`.

## src/app/[lang]/qa/README.md

No drift detected.

## src/app/[lang]/qa/[scenario]/README.md

No drift detected beyond the silent-end case under `src/hooks`.

## src/app/README.md

No drift detected.

## src/README.md

No drift detected.

## scripts/README.md

No drift detected.

## README.md

No drift detected.

## Files no contract covers

No drift detected.
