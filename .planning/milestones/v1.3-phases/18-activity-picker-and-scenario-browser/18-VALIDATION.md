---
phase: 18
slug: activity-picker-and-scenario-browser
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + jsdom |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `bun run test --run` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test --run`
- **After every plan wave:** Run `bun run test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 0 | ACTPICK-01 | unit | `bun run test --run src/__tests__/components/ActivityPicker.test.tsx` | ❌ W0 | ⬜ pending |
| 18-01-02 | 01 | 0 | QAFLOW-01 | unit | `bun run test --run src/__tests__/components/ScenarioGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 18-01-03 | 01 | 1 | ACTPICK-01 | unit | `bun run test --run src/__tests__/components/ActivityPicker.test.tsx` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 1 | QAFLOW-01 | unit | `bun run test --run src/__tests__/components/ScenarioGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 18-02-02 | 02 | 1 | QAFLOW-02 | unit | `bun run test --run src/__tests__/hooks/useLevelFilter.test.tsx` | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/components/ActivityPicker.test.tsx` — stubs for ACTPICK-01 (two cards, correct hrefs to `/[lang]/rephrase` and `/[lang]/qa`)
- [ ] `src/__tests__/components/ScenarioGrid.test.tsx` — stubs for QAFLOW-01 (7 tiles rendered, badge shows due count from useQASRS, checkmark when due=0)

*QAFLOW-02 covered by existing `src/__tests__/hooks/useLevelFilter.test.tsx`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Back button navigates up one path segment at all route depths | QAFLOW-01, QAFLOW-02 | Filesystem-driven routing; Next.js static export requires build step | Navigate to `/it/rephrase/ristorante` → click back → confirm `/it/rephrase`; then back → confirm `/it`; then `/it/qa` → back → confirm `/it` |
| Activity Picker renders and both cards navigate correctly in browser | ACTPICK-01 | React hydration and client navigation require browser | Visit `/it`, click Rephrase → confirm deck browser; visit `/it`, click Q&A → confirm scenario browser |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
