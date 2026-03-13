---
phase: 25
slug: study-sessions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `vitest.config.ts` — `nuxt` project, `tests/nuxt/**/*.{test,spec}.ts` |
| **Quick run command** | `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` |
| **Full suite command** | `bun run vitest --project nuxt run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` or `tests/nuxt/QASession.test.ts`
- **After every plan wave:** Run `bun run vitest --project nuxt run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 0 | UI-06 | unit | `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` | ❌ W0 | ⬜ pending |
| 25-01-02 | 01 | 0 | UI-07 | unit | `bun run vitest --project nuxt run tests/nuxt/QASession.test.ts` | ❌ W0 | ⬜ pending |
| 25-02-01 | 02 | 1 | UI-06 | unit | `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` | ❌ W0 | ⬜ pending |
| 25-02-02 | 02 | 1 | UI-06 | unit | `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` | ❌ W0 | ⬜ pending |
| 25-03-01 | 03 | 1 | UI-07 | unit | `bun run vitest --project nuxt run tests/nuxt/QASession.test.ts` | ❌ W0 | ⬜ pending |
| 25-03-02 | 03 | 1 | UI-07 | unit | `bun run vitest --project nuxt run tests/nuxt/QASession.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/nuxt/RephraseSession.test.ts` — stubs for UI-06 (RED phase)
- [ ] `tests/nuxt/QASession.test.ts` — stubs for UI-07 (RED phase)

*(Existing test infrastructure: `vitest.config.ts` nuxt project and `mountSuspended` are already configured and working from Phase 22. No framework installation needed.)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice recognition accepts spoken answer and displays recognized text | UI-06, UI-07 | Requires real microphone hardware; SpeechRecognition API not mockable in jsdom | Load session page in browser, press mic button, speak a phrase, verify recognized text appears in FeedbackMessage |
| TTS audio plays correct pronunciation on AudioButton click | UI-06, UI-07 | Web Speech API `speechSynthesis.speak()` is not testable in jsdom | Load session page in browser, click AudioButton, verify audio plays |
| `nuxi generate` produces no hydration mismatch warnings | UI-06, UI-07 | SSR/CSR parity requires a full build | Run `bun run generate`, check terminal output for "hydration mismatch" strings |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
