---
phase: 16
slug: bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x + jsdom + @testing-library/react |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `bun run test --run src/__tests__/components/StudySession.test.tsx` |
| **Full suite command** | `bun run test --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test --run src/__tests__/components/StudySession.test.tsx`
- **After every plan wave:** Run `bun run test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 0 | BUGFIX-01 | unit | `bun run test --run src/__tests__/components/DeckGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 16-01-02 | 01 | 1 | BUGFIX-01 | unit | `bun run test --run src/__tests__/components/DeckGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 16-02-01 | 02 | 0 | BUGFIX-02 | unit | `bun run test --run src/__tests__/components/StudySession.test.tsx` | ✅ (extend) | ⬜ pending |
| 16-02-02 | 02 | 1 | BUGFIX-02 | unit | `bun run test --run src/__tests__/components/StudySession.test.tsx` | ✅ (extend) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/components/DeckGrid.test.tsx` — stubs for BUGFIX-01 (badge rendering, due count computation, zero-state checkmark, new-user full count)
- Existing `StudySession.test.tsx` needs new test cases for BUGFIX-02 — no new file required, extend existing

*Existing infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge checkmark ✓ renders correctly at badge font size across browsers | BUGFIX-01 | Unicode rendering cannot be fully verified in jsdom | Load deck grid in browser; confirm ✓ appears when 0 cards due and is visually distinct |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
