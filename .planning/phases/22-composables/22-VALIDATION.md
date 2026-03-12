---
phase: 22
slug: composables
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `bun run vitest run --project nuxt` |
| **Full suite command** | `bun run vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run vitest run --project nuxt`
- **After every plan wave:** Run `bun run vitest run`
- **Before `/gsd:verify-work`:** `bun run generate` (no localStorage errors) + `bun run vitest run` (all green)
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 01 | 0 | COMP-01 | setup | `bun run vitest run --project nuxt` | ❌ W0 | ⬜ pending |
| 22-01-02 | 01 | 0 | COMP-02 | setup | `bun run vitest run --project nuxt` | ❌ W0 | ⬜ pending |
| 22-01-03 | 01 | 0 | COMP-03 | setup | `bun run vitest run --project nuxt` | ❌ W0 | ⬜ pending |
| 22-01-04 | 01 | 0 | COMP-04 | setup | `bun run vitest run --project nuxt` | ❌ W0 | ⬜ pending |
| 22-02-01 | 02 | 1 | COMP-01 | unit | `bun run vitest run --project nuxt tests/nuxt/useSRS.test.ts` | ❌ W0 | ⬜ pending |
| 22-02-02 | 02 | 1 | COMP-01 | smoke | `bun run generate` | ✅ | ⬜ pending |
| 22-03-01 | 03 | 1 | COMP-02 | unit | `bun run vitest run --project nuxt tests/nuxt/useLevelFilter.test.ts` | ❌ W0 | ⬜ pending |
| 22-04-01 | 04 | 1 | COMP-03 | unit | `bun run vitest run --project nuxt tests/nuxt/useQASRS.test.ts` | ❌ W0 | ⬜ pending |
| 22-05-01 | 05 | 1 | COMP-04 | unit | `bun run vitest run --project nuxt tests/nuxt/useVoiceRecognition.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `app/lib/srs.ts` — copy of `src/lib/srs.ts`; imported by all composables
- [ ] `app/lib/generateChoices.ts` — copy of `src/lib/generateChoices.ts`
- [ ] `app/types/index.ts` — copy of `src/types/index.ts`; imported by all composables
- [ ] `tests/nuxt/useSRS.test.ts` — test stubs covering COMP-01
- [ ] `tests/nuxt/useLevelFilter.test.ts` — test stubs covering COMP-02
- [ ] `tests/nuxt/useQASRS.test.ts` — test stubs covering COMP-03
- [ ] `tests/nuxt/useVoiceRecognition.test.ts` — test stubs covering COMP-04

Note: No Vitest config changes needed. The `nuxt` project already includes `tests/nuxt/**/*.{test,spec}.ts`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `nuxi generate` produces no SSR hydration crashes in browser | COMP-01, COMP-04 | Requires browser dev-tools inspection for hydration errors | Run `bun run generate && bun run preview`, open browser console, navigate study pages, confirm no hydration mismatch warnings |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
