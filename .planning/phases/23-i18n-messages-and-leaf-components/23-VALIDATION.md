---
phase: 23
slug: i18n-messages-and-leaf-components
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `bun run test --project nuxt` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test --project nuxt`
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 0 | UI-01 | unit | `bun run test --project nuxt tests/components/SiteHeader.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-01-02 | 01 | 0 | UI-01 | unit | `bun run test --project nuxt tests/components/ChoiceButton.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-01-03 | 01 | 0 | UI-01 | unit | `bun run test --project nuxt tests/components/AudioButton.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-01-04 | 01 | 0 | UI-01 | unit | `bun run test --project nuxt tests/components/MicButton.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-01-05 | 01 | 0 | UI-01 | unit | `bun run test --project nuxt tests/components/FeedbackMessage.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-01-06 | 01 | 0 | UI-01 | unit | `bun run test --project nuxt tests/components/LevelFilterChips.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-02-01 | 02 | 1 | UI-01 | unit | `bun run test --project nuxt tests/components/SiteHeader.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-02-02 | 02 | 1 | UI-01 | unit | `bun run test --project nuxt tests/components/ChoiceButton.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-02-03 | 02 | 1 | UI-01 | unit | `bun run test --project nuxt tests/components/AudioButton.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-02-04 | 02 | 1 | UI-01 | unit | `bun run test --project nuxt tests/components/MicButton.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-02-05 | 02 | 1 | UI-01 | unit | `bun run test --project nuxt tests/components/FeedbackMessage.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-02-06 | 02 | 1 | UI-01 | unit | `bun run test --project nuxt tests/components/LevelFilterChips.nuxt.test.ts` | ❌ W0 | ⬜ pending |
| 23-03-01 | 03 | 2 | UI-02 | build | `bun run generate && ls dist/it/index.html dist/es/index.html` | ✅ | ⬜ pending |
| 23-03-02 | 03 | 2 | UI-02 | manual | See Manual-Only below | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/components/SiteHeader.nuxt.test.ts` — stubs for locale switcher, back button, reset (UI-01)
- [ ] `tests/components/ChoiceButton.nuxt.test.ts` — stubs for click/speak emits (UI-01)
- [ ] `tests/components/AudioButton.nuxt.test.ts` — stubs for SSR safety, speak() guard (UI-01)
- [ ] `tests/components/MicButton.nuxt.test.ts` — stubs for press emit (UI-01)
- [ ] `tests/components/FeedbackMessage.nuxt.test.ts` — stubs for display-only prop rendering (UI-01)
- [ ] `tests/components/LevelFilterChips.nuxt.test.ts` — stubs for update:activeLevels emit (UI-01)

*All six test files are new — components don't exist yet.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Locale JSON loads without 404 in static output | UI-02 | Requires running `nuxi generate` and inspecting network requests in browser | Run `bun run generate`, open `dist/it/index.html` in browser, open DevTools Network, verify `it.json` / `es.json` load with 200 |
| Locale switcher navigates to `/es/` root | UI-02 | Requires browser navigation | Open `/it/`, click locale switcher, verify redirect to `/es/` |
| All visible UI strings change on locale switch | UI-02 | Requires visual verification across pages | Compare `/it/` vs `/es/` page content — all labels/buttons should be translated |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
