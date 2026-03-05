---
phase: 9
slug: scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None in Phase 9 (Vitest + React Testing Library added in Phase 11) |
| **Config file** | none — Wave 0 creates package.json via scaffold |
| **Quick run command** | `bun run build` |
| **Full suite command** | `bun run build && test -d out` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run build`
- **After every plan wave:** Run `bun run build && test -d out`
- **Before `/gsd:verify-work`:** Build green + `out/` directory present
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | INFRA-01 | smoke | `bun run build` | ❌ W0 | ⬜ pending |
| 9-01-02 | 01 | 1 | INFRA-02 | build verification | `bun run build && test -d out` | ❌ W0 | ⬜ pending |
| 9-01-03 | 01 | 1 | DATA-01 | type check | `bun run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — created by scaffold; must have `build` script
- [ ] `next.config.ts` — must have `output: 'export'` before build test
- [ ] `src/types/index.ts` — must satisfy TypeScript strict mode (verified by build)

*Note: Phase 9 IS the scaffold, so Wave 0 requirements are satisfied by the scaffold task itself.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `bun run dev` starts dev server | INFRA-01 | Requires browser/port check | Run `bun run dev`, verify localhost:3000 loads |
| Locale routing works (`/it`, `/es`) | INFRA-01 | Runtime navigation behavior | Visit `/it` and `/es` routes, verify correct locale loads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
