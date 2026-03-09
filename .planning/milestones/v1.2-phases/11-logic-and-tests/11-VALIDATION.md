---
phase: 11
slug: logic-and-tests
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.15 |
| **Config file** | `vitest.config.ts` (root) — "none — Wave 0 installs" |
| **Quick run command** | `bun run test -- --run` |
| **Full suite command** | `bun run test -- --run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test -- --run`
- **After every plan wave:** Run `bun run test -- --run && bun run build`
- **Before `/gsd:verify-work`:** Full suite must be green + `bun run build` exits 0
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 0 | TEST-01 | smoke | `bun run test -- --run` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 0 | TEST-01 | smoke | `bun run test -- --run` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 1 | SRS-01, TEST-02 | unit | `bun run test -- --run src/__tests__/lib/srs.test.ts` | ❌ W0 | ⬜ pending |
| 11-02-02 | 02 | 1 | SRS-02, TEST-03 | unit | `bun run test -- --run src/__tests__/lib/generateChoices.test.ts` | ❌ W0 | ⬜ pending |
| 11-03-01 | 03 | 2 | SRS-03, TEST-04 | unit (renderHook) | `bun run test -- --run src/__tests__/hooks/useSRS.test.tsx` | ❌ W0 | ⬜ pending |
| 11-03-02 | 03 | 2 | SRS-04, TEST-04 | unit (renderHook) | `bun run test -- --run src/__tests__/hooks/useLevelFilter.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — root-level Vitest config with jsdom + `@/` alias + React plugin
- [ ] `src/__tests__/setup.ts` — localStorage mock + `@testing-library/jest-dom` import
- [ ] `src/__tests__/lib/srs.test.ts` — stub covering SRS-01, TEST-02
- [ ] `src/__tests__/lib/generateChoices.test.ts` — stub covering SRS-02, TEST-03
- [ ] `src/__tests__/hooks/useSRS.test.tsx` — stub covering SRS-03, TEST-04
- [ ] `src/__tests__/hooks/useLevelFilter.test.tsx` — stub covering SRS-04, TEST-04
- [ ] `package.json` `test` script: `"test": "vitest"`
- [ ] Install: `bun add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitejs/plugin-react @vitest/coverage-v8 jsdom`
- [ ] Fix `src/types/index.ts`: `Progress.nextReview: string` (not `number`)

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
