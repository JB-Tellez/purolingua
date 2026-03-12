---
phase: 20
slug: scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 (existing) + @nuxt/test-utils ^4.0.0 (new) |
| **Config file** | `vitest.config.ts` (full replacement — Wave 0) |
| **Quick run command** | `bun run test --project unit` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~15 seconds (unit project <5s; nuxt project ~10s) |

---

## Sampling Rate

- **After every task commit:** Run `bun run test --project unit`
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green + `nuxi generate` produces `.output/public/`
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 0 | SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05 | install | `bun add nuxt @nuxtjs/i18n && bun add -D @tailwindcss/vite @nuxt/test-utils @vue/test-utils` | ❌ W0 | ⬜ pending |
| 20-01-02 | 01 | 0 | SCAF-05 | unit/nuxt | `bun run test --project nuxt` | ❌ W0 | ⬜ pending |
| 20-02-01 | 02 | 1 | SCAF-01 | build | `bun run nuxi prepare` (no TS errors) | ❌ W0 | ⬜ pending |
| 20-02-02 | 02 | 1 | SCAF-02 | build | `bun run nuxi generate` (no PostCSS errors) | ❌ W0 | ⬜ pending |
| 20-02-03 | 02 | 1 | SCAF-03 | build | `nuxi generate && ls .output/public/it .output/public/es` | ❌ W0 | ⬜ pending |
| 20-02-04 | 02 | 1 | SCAF-04 | build | `nuxi generate` + route count check in `.output/public/` | ❌ W0 | ⬜ pending |
| 20-02-05 | 02 | 1 | SCAF-05 | unit | `bun run test` (full suite green) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — add `"type": "module"` (required for @nuxt/test-utils/config ESM import)
- [ ] `vitest.config.ts` — replace with dual-project config (node + nuxt environments)
- [ ] `tests/nuxt/smoke.test.ts` — mountSuspended smoke test stub (covers SCAF-05)
- [ ] Framework install: `bun add nuxt @nuxtjs/i18n && bun add -D @tailwindcss/vite @nuxt/test-utils @vue/test-utils`
- [ ] Remove incompatible packages: `bun remove next next-intl react react-dom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/react @types/react-dom @tailwindcss/postcss`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `bun run dev` starts and app visible in browser | SCAF-01, SCAF-02, SCAF-03 | Browser rendering cannot be fully automated in CI; visual confirmation needed | Run `bun run dev`, open localhost, confirm page loads and Tailwind classes apply (inspect element) |
| Tailwind utility classes apply correctly in browser | SCAF-02 | PostCSS/Vite pipeline issues only manifest in browser dev mode | Apply a known Tailwind class (e.g., `text-red-500`) to index.vue, verify in browser inspector |
| No double-prefix routes in generated output | SCAF-03 | Requires human inspection of `.output/public/` directory tree | After `nuxi generate`, run `ls .output/public/` — no `it/it/` or `es/es/` directories should exist |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
