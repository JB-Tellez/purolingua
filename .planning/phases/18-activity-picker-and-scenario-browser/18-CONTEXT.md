# Phase 18: Activity Picker and Scenario Browser - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the navigation shell between language selection and content: insert an Activity Picker at `/[lang]`, move the Rephrase deck browser to `/[lang]/rephrase`, move deck study pages to `/[lang]/rephrase/[deck]`, and build the Q&A scenario browser at `/[lang]/qa`. No Q&A study session UI in this phase — that's Phase 19.

</domain>

<decisions>
## Implementation Decisions

### Route topology
- `/[lang]` → Activity Picker (replaces current deck browser)
- `/[lang]/rephrase` → Rephrase deck browser (current `/[lang]` content moves here)
- `/[lang]/rephrase/[deck]` → Deck study session (current `/[lang]/[deck]` content moves here)
- `/[lang]/qa` → Q&A scenario browser (new)
- `/[lang]/qa/[scenario]` → Q&A study session (Phase 19 — route directory created as placeholder)
- Old `/[lang]/[deck]` directory is removed; all references updated
- `generateStaticParams` placement follows existing pattern — in layout.tsx files, not page.tsx

### Back navigation
- SiteHeader back button always goes up one segment: drop last path segment from current URL
- No back button on `/[lang]` (Activity Picker is root of language flow; use language selector to switch)
- Back from `/[lang]/rephrase/[deck]` → `/[lang]/rephrase`
- Back from `/[lang]/rephrase` → `/[lang]`
- Back from `/[lang]/qa` → `/[lang]`
- `onDeckPage` logic in SiteHeader updated to `segments.length >= 2`; `backHref` computed by dropping last segment

### Reset behavior
- Reset button clears the full `${lang}-progress` record — both Rephrase and Q&A progress (Q&A uses `qa_` prefixed keys in the same record)
- No activity-scoped reset in this phase

### Activity Picker visual
- Two large cards side by side (stacks vertically on mobile)
- Each card: icon (emoji, Claude's discretion) + title + short description
- No counts (deck count / scenario count) — clean without dynamic data dependency
- Titles and descriptions sourced from i18n locale files (next-intl), consistent with nav strings and deck labels
- Add activity i18n keys to both `src/locales/it/` and `src/locales/es/` (or wherever next-intl messages live)

### Scenario browser layout
- Same grid layout as Rephrase deck browser
- `LevelFilterChips` at top — same FLTR-06 guard (cannot deselect all), same `useLevelFilter` hook
- Level filter shared: `useLevelFilter(lang, hasProgress)` — Q&A uses the same preference as Rephrase

### Scenario tile design
- Mirrors DeckGrid tile exactly: `.deck-card` structure with icon circle, title, due-count badge
- Reuses `.deck-card-badge` and `.deck-card-badge--done` (checkmark `✓` when due=0)
- Due count computed from `useQASRS(lang, scenarioId)` — respects `activeLevels` filter
- Title: target-language title — `scenario.titleIt` for `lang === 'it'`, `scenario.titleEs` for `lang === 'es'`
- Theme color: cycle through existing `theme-*` CSS classes by scenario index (fixed mapping, not randomized)
- No scenario descriptions — scenarios only have `titleIt`/`titleEs`, no description field

### Claude's Discretion
- Exact emoji icons for Activity Picker cards (Rephrase and Q&A)
- Specific `theme-*` class assigned to each scenario (fixed mapping by index)
- Exact wording of activity card titles and descriptions (to be added to i18n files)
- Placeholder route for `/[lang]/qa/[scenario]` — minimal file, no StudySession yet

</decisions>

<specifics>
## Specific Ideas

- Route structure confirmed with ASCII layout:
  ```
  / → /[lang] (Picker) → /[lang]/rephrase (Deck Browser) → /[lang]/rephrase/[deck] (Study)
                        → /[lang]/qa (Scenario Browser)   → /[lang]/qa/[scenario] (Phase 19)
  ```
- Back always drops last path segment — no special-casing per route, no `router.back()` (breaks on direct URL entry)
- Scenario tile mirrors DeckGrid tile exactly — reuse `.deck-card` + existing theme classes

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/[lang]/page.tsx` — current deck browser; content moves to `src/app/[lang]/rephrase/page.tsx`
- `src/app/[lang]/[deck]/` — current study session route; moves to `src/app/[lang]/rephrase/[deck]/`
- `DeckGrid` component (inline in `src/app/[lang]/page.tsx`) — moves with deck browser, href links update to `/[lang]/rephrase/[deck]`
- `LevelFilterChips` — reusable as-is for scenario browser; same props interface
- `useSRS`, `useLevelFilter` — lifted to page level in Phase 16; same pattern for scenario browser page
- `useQASRS(lang, scenarioId)` — Phase 17 hook; called per scenario tile for live due count
- `scenarios` array from `src/data/qa/index.ts` — A1-first canonical order; drives scenario browser render
- `.deck-card`, `.deck-card-badge`, `.deck-card-badge--done`, `theme-*` CSS — reused verbatim for scenario tiles

### Established Patterns
- `useSRS` + `useLevelFilter` lifted to page component, passed as props to grid and chips (Phase 16 pattern)
- Badge: number when due > 0, `✓` when due === 0; respects `activeLevels`
- `generateStaticParams` in layout.tsx (not page.tsx) — required because page.tsx uses `'use client'`
- i18n strings in next-intl locale files; `useTranslations('namespace')` hook in client components

### Integration Points
- `src/app/[lang]/page.tsx` → gutted and replaced with Activity Picker UI
- `src/app/[lang]/rephrase/page.tsx` (new) → current `/[lang]/page.tsx` content
- `src/app/[lang]/rephrase/layout.tsx` (new) → `generateStaticParams` for deck IDs
- `src/app/[lang]/rephrase/[deck]/page.tsx` (new) → current `/[lang]/[deck]/page.tsx` content
- `src/app/[lang]/qa/page.tsx` (new) → scenario browser
- `src/app/[lang]/qa/layout.tsx` (new) → `generateStaticParams` for scenario IDs
- `src/app/[lang]/qa/[scenario]/page.tsx` (new) → placeholder (Phase 19)
- `src/components/SiteHeader.tsx` → update `backHref` to drop last path segment instead of hardcoding `/${lang}`
- next-intl locale files → add activity picker i18n keys

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 18-activity-picker-and-scenario-browser*
*Context gathered: 2026-03-09*
