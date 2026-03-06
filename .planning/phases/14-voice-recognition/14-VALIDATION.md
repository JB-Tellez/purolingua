---
phase: 14
slug: voice-recognition
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react (renderHook) |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `bun run test --run` |
| **Full suite command** | `bun run test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test --run`
- **After every plan wave:** Run `bun run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-hook-01 | 01 | 1 | VOICE-01, VOICE-02 | unit | `bun run test --run src/__tests__/hooks/useVoiceRecognition.test.ts` | Wave 0 | ⬜ pending |
| 14-hook-02 | 01 | 1 | VOICE-03, VOICE-04 | unit | `bun run test --run src/__tests__/hooks/useVoiceRecognition.test.ts` | Wave 0 | ⬜ pending |
| 14-hook-03 | 01 | 1 | VOICE-05, VOICE-06 | unit | `bun run test --run src/__tests__/hooks/useVoiceRecognition.test.ts` | Wave 0 | ⬜ pending |
| 14-mic-01 | 01 | 1 | VOICE-07, VOICE-08, VOICE-09 | unit/component | `bun run test --run src/__tests__/components/MicButton.test.tsx` | Wave 0 | ⬜ pending |
| 14-session-01 | 02 | 2 | VOICE-10, VOICE-11, VOICE-12 | integration | `bun run test --run src/__tests__/components/StudySession.test.tsx` | Wave 0 | ⬜ pending |
| 14-session-02 | 02 | 2 | VOICE-13, VOICE-14 | integration | `bun run test --run src/__tests__/components/StudySession.test.tsx` | Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/hooks/useVoiceRecognition.test.ts` — stubs for VOICE-01 through VOICE-06
- [ ] `src/__tests__/components/MicButton.test.tsx` — stubs for VOICE-07, VOICE-08, VOICE-09
- [ ] `src/__tests__/components/StudySession.test.tsx` — stubs for VOICE-10 through VOICE-14
- [ ] `SpeechRecognition` mock added to `src/__tests__/setup.ts` — required by all above test files

*Note: The `SpeechRecognition` mock must be added to the existing `setup.ts` (which already has `localStorage` mocked). The mock records constructor calls and exposes trigger functions to simulate `onresult`/`onerror`/`onend` events from test code.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Actual mic input + transcript accuracy | VOICE-15 | jsdom cannot capture real audio; transcript quality varies by voice/accent | Open `/it/daily` in Chrome, tap mic, speak a card phrase, verify flip |
| Mic permission denied shows error flash | VOICE-16 | Browser permission dialog not simulatable in jsdom | Block mic in browser settings, tap mic button, verify brief error flash + reset |
| Mic button hidden on Safari/IE (no SpeechRecognition) | VOICE-17 | Requires a real browser without the API; can be simulated by deleting mock in test but real verification needed | Open in Safari 14- or IE11, verify mic button is absent from UI |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
