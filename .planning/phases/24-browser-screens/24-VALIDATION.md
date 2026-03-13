---
phase: 24
slug: browser-screens
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `vitest.config.ts` — `nuxt` project, `tests/nuxt/**/*.{test,spec}.ts` |
| **Quick run command** | `bun run vitest --project nuxt run tests/nuxt/ActivityPicker.test.ts` |
| **Full suite command** | `bun run vitest --project nuxt run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run vitest --project nuxt run tests/nuxt/ActivityPicker.test.ts` (or the relevant file for the task)
- **After every plan wave:** Run `bun run vitest --project nuxt run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 0 | UI-03 | unit | `bun run vitest --project nuxt run tests/nuxt/ActivityPicker.test.ts` | ❌ W0 | ⬜ pending |
| 24-01-02 | 01 | 0 | UI-04 | unit | `bun run vitest --project nuxt run tests/nuxt/DeckGrid.test.ts` | ❌ W0 | ⬜ pending |
| 24-01-03 | 01 | 0 | UI-05 | unit | `bun run vitest --project nuxt run tests/nuxt/ScenarioGrid.test.ts` | ❌ W0 | ⬜ pending |
| 24-02-01 | 02 | 1 | UI-03 | unit | `bun run vitest --project nuxt run tests/nuxt/ActivityPicker.test.ts` | ❌ W0 | ⬜ pending |
| 24-03-01 | 03 | 1 | UI-04 | unit | `bun run vitest --project nuxt run tests/nuxt/DeckGrid.test.ts` | ❌ W0 | ⬜ pending |
| 24-04-01 | 04 | 1 | UI-05 | unit | `bun run vitest --project nuxt run tests/nuxt/ScenarioGrid.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/nuxt/ActivityPicker.test.ts` — stubs for UI-03 (renders tiles, NuxtLinkLocale href)
- [ ] `tests/nuxt/DeckGrid.test.ts` — stubs for UI-04, FLTR-06 guard (DeckGrid)
- [ ] `tests/nuxt/ScenarioGrid.test.ts` — stubs for UI-05, FLTR-06 guard (ScenarioGrid)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Activity tile click navigates to correct locale-prefixed route in browser | UI-03 | NuxtLinkLocale locale injection requires real browser navigation | Open `/it`, click Rephrase tile → expect `/it/rephrase`; open `/es`, click Q&A tile → expect `/es/qa` |
| Badge count visually updates in same render cycle as chip toggle | UI-04, UI-05 | Render cycle timing hard to assert in unit tests | Toggle A1/A2 chip → badge count updates without page reload or flash |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
