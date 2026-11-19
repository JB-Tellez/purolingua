# EGM Drift Report — 2026-11-19 (fourth run)

Scope: the 18 EGM contracts (`README.md` plus 17 child `README.md` files), compared against the source at `3f470aa`, after every finding in `2026-11-19_DRIFT_REPORT_3.md` was fixed. Only divergences are listed: doc ↔ code mismatches, code ↔ code inconsistencies the contracts surface, and code paths no contract covers.

How findings were checked: this run was done in the same session that wrote the last three rounds' fixes. To offset that, it re-read the final `useVoiceRecognition.ts` and then concentrated on code the earlier rounds only skimmed: the smaller components, the CSS they depend on (every class name in `src/**/*.tsx` was checked against `style-reference.css` and `globals.css`), and v1.1's behaviour on the `vanilla` branch. Baseline: `npx vitest run` passes (39 files, 354 tests), `tsc --noEmit` is clean. Findings marked "not reproduced" come from reading the code.

## src/hooks/README.md

- **An empty result list lets a new start begin before the old session has reported back** (not reproduced; introduced by the last round's fix). On an empty result list, `onresult` marks the session `ended` (so a new start is accepted) but leaves it unsettled, so its `onError` fires only at its own `onend`. If the user presses the mic again in between, a new session starts, and the old session's late `onError` then runs the caller's error handler: both sessions set `micState` to `'error'` and show `notRecognized`, overwriting the new attempt's `'listening'`. The contract says "an older session's late events never affect a newer one". Settling (and calling `onError`) at the empty result itself, instead of waiting for `onend`, would close the gap.

## src/components/README.md

- **Reset deletes all progress for the language on one click, with no confirmation.** v1.1 asked first (`showConfirm(t('alerts.resetConfirmTitle'), t('alerts.resetConfirmMessage'))` in `src/js/core/app.js` on the `vanilla` branch) and confirmed afterwards. `SiteHeader`'s reset is `<a href="#">`, a link used as an action button, whose click calls `clearProgress(lang)` and reloads at once (`SiteHeader.tsx:30-37`, `56-64`). There is no undo. The contract documents what reset clears, but not that nothing guards it.
- **The language dropdown stays open until an option is chosen.** v1.1 closed it on any outside click (`app.js:192`, "Close dropdown when clicking outside"). `SiteHeader` closes it only when the user picks an option (`onClick={() => setDropdownOpen(false)}` on the dropdown itself), and Escape does nothing. The toggle button has no `aria-expanded`, so screen readers are not told whether the menu is open.
- **The finished-deck badge has no style or words.** `DeckGrid` and `ScenarioGrid` add `deck-card-badge--done` when nothing is due, and the contract's Due-badges invariant names that class, but neither stylesheet defines it: `style-reference.css` has only `.deck-card-badge`. A finished deck's `✓` looks like a count badge. The badge text is also a bare number or `✓`. v1.1 rendered words through i18n (`t('deckSelection.cardCount', { count })` / `t('deckSelection.completed')`), so a screen reader now hears just "12" or "check mark", with no context.
- **The level filter's group label is never exposed.** `LevelFilterChips` puts `aria-label={t('filter.label')}` on a plain `<div>`. Without a role (such as `role="group"`), assistive technology ignores `aria-label` on a generic element, so the label ("Livello" / "Nivel") is never announced. No test checks the label: neither `LevelFilterChips.test.tsx` nor `a11yLabels.test.tsx` mentions it.

## Contracts with no drift detected

`README.md`, `src/README.md`, `src/types`, `src/lib`, `src/i18n`, `src/data`, `src/data/it`, `src/data/es`, `src/data/qa`, `src/app`, `src/app/[lang]`, `src/app/[lang]/rephrase`, `src/app/[lang]/rephrase/[deck]`, `src/app/[lang]/qa`, `src/app/[lang]/qa/[scenario]`, `scripts`. No files fall outside a contract.
