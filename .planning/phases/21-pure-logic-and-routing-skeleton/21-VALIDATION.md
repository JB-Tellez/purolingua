---
phase: 21
slug: pure-logic-and-routing-skeleton
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `bun run vitest run --project unit` |
| **Full suite command** | `bun run vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run vitest run --project unit`
- **After every plan wave:** Run `bun run vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + `bun run generate && bun specs/verify-routes.ts` must pass
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 0 | DATA-02 | script | `bun specs/verify-routes.ts` | ❌ W0 | ⬜ pending |
| 21-01-02 | 01 | 1 | DATA-01 | unit | `bun run vitest run --project unit` | ✅ | ⬜ pending |
| 21-01-03 | 01 | 1 | DATA-02 | script | `bun run generate && bun specs/verify-routes.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `specs/verify-routes.ts` — route verification script for DATA-02 success criterion 3

*All other test infrastructure (Vitest unit project, setup.ts, alias config) is already in place from Phase 20.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated HTML contains non-error `<div id="__nuxt">` payload | DATA-02 | `nuxi generate` creates files even on SSR errors | Spot-check 2–3 generated HTML files for `<div id="__nuxt">` with real content |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
