---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Vue Port
status: defining_requirements
stopped_at: —
last_updated: "2026-03-12T00:00:00.000Z"
last_activity: 2026-03-12 — Milestone v2.0 started
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v2.0 milestone started)

**Core value:** Users can study real conversational vocabulary offline, in any browser, with zero friction — no sign-up, no app install, just open and learn.
**Current focus:** Defining requirements for v2.0 Vue Port

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements

Last activity: 2026-03-12 — Milestone v2.0 started

## Accumulated Context

### Tech Debt Carried Forward (from v1.3)

- **DEBT-01**: `speak()` helper duplicated in `AudioButton.tsx` and `StudySession.tsx` — candidate for `src/lib/speak.ts`
- **DEBT-02**: `src/i18n/navigation.ts` locale helpers unused — all nav uses `next/link` directly
- **CONTENT-01**: A1 phrase linguistic quality needs native speaker review (Italian and Spanish)

### Key Context

- Source: `feat/nextjs-port` branch — Next.js 15 + TypeScript + Tailwind v4 + next-intl, v1.3 full features
- Target: Nuxt 3 + TypeScript + Tailwind + nuxt-i18n (vue-i18n), static export
- localStorage key format must be preserved (`${lang}-progress`, `qa_` prefix) for existing user data continuity
- Card indices are positional SRS keys — append-only insertion constraint still applies
- Static export to Hostinger (same constraint as Next.js port, `output: 'static'` in Nuxt)
