# Phase 18: Activity Picker and Scenario Browser — Research

**Researched:** 2026-03-09
**Domain:** Next.js App Router routing refactor + React UI composition
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Route topology:**
- `/[lang]` → Activity Picker (replaces current deck browser)
- `/[lang]/rephrase` → Rephrase deck browser (current `/[lang]` content moves here)
- `/[lang]/rephrase/[deck]` → Deck study session (current `/[lang]/[deck]` content moves here)
- `/[lang]/qa` → Q&A scenario browser (new)
- `/[lang]/qa/[scenario]` → Q&A study session (Phase 19 — route directory created as placeholder)
- Old `/[lang]/[deck]` directory is removed; all references updated
- `generateStaticParams` placement follows existing pattern — in layout.tsx files, not page.tsx

**Back navigation:**
- SiteHeader back button always goes up one segment: drop last path segment from current URL
- No back button on `/[lang]` (Activity Picker is root of language flow; use language selector to switch)
- Back from `/[lang]/rephrase/[deck]` → `/[lang]/rephrase`
- Back from `/[lang]/rephrase` → `/[lang]`
- Back from `/[lang]/qa` → `/[lang]`
- `onDeckPage` logic in SiteHeader updated to `segments.length >= 2`; `backHref` computed by dropping last segment

**Reset behavior:**
- Reset button clears the full `${lang}-progress` record — both Rephrase and Q&A progress (Q&A uses `qa_` prefixed keys in the same record)
- No activity-scoped reset in this phase

**Activity Picker visual:**
- Two large cards side by side (stacks vertically on mobile)
- Each card: icon (emoji, Claude's discretion) + title + short description
- No counts (deck count / scenario count) — clean without dynamic data dependency
- Titles and descriptions sourced from i18n locale files (next-intl), consistent with nav strings and deck labels
- Add activity i18n keys to both `messages/it.json` and `messages/es.json`

**Scenario browser layout:**
- Same grid layout as Rephrase deck browser
- `LevelFilterChips` at top — same FLTR-06 guard (cannot deselect all), same `useLevelFilter` hook
- Level filter shared: `useLevelFilter(lang, hasProgress)` — Q&A uses the same preference as Rephrase

**Scenario tile design:**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACTPICK-01 | User can choose between Rephrase and Q&A activities after selecting a language | Activity Picker page replaces current `/[lang]/page.tsx`; two card links routed to `/[lang]/rephrase` and `/[lang]/qa` respectively |
| QAFLOW-01 | User can browse Q&A scenarios in a grid with icon, title, and live due-count badge | ScenarioBrowser page at `/[lang]/qa`; reuses `.deck-card` CSS + `useQASRS` hook per tile for live due count |
| QAFLOW-02 | User can filter Q&A scenarios by level (A1/A2 chips, same FLTR-06 guard) | `LevelFilterChips` component + `useLevelFilter` hook reused verbatim; same FLTR-06 guard already enforced in hook |
</phase_requirements>

---

## Summary

Phase 18 is a routing and UI composition task: lift the existing deck browser to `/[lang]/rephrase`, insert an Activity Picker at `/[lang]`, and build a scenario browser at `/[lang]/qa`. No new domain logic is introduced — the work is wiring up existing pieces (components, hooks, CSS classes, i18n files) in new route files.

All three requirements are addressable with zero new library dependencies. The scenario browser is structurally identical to the deck browser; the only novel rendering concern is that `useQASRS` takes `cards` as a parameter, so each scenario tile must pass its card array into the hook call. The Activity Picker introduces new i18n keys and a two-card layout not yet in CSS — but the `.deck-card` / `.deck-grid` pattern can serve as reference, or a lighter custom layout can be used for two large navigation cards.

The SiteHeader back-navigation change from a hardcoded `/${lang}` to "drop last path segment" is the most cross-cutting change: it touches an existing component, affects all existing routes, and must be correct for 3+ and 2-segment paths alike.

**Primary recommendation:** Sequence work as (1) route restructure + SiteHeader fix, (2) Activity Picker page + i18n keys, (3) Scenario browser page, (4) placeholder `/[lang]/qa/[scenario]`. Each step is independently testable.

---

## Standard Stack

### Core (all already installed — no new dependencies)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Next.js App Router | 15+ (inferred from `params: Promise<>` pattern) | File-system routing, static export, layouts | Existing pattern |
| next-intl | current | i18n strings via `useTranslations` | `messages/it.json`, `messages/es.json` |
| React | 18+ | Client components | All page components use `'use client'` |
| Vitest + jsdom | 4.x | Unit testing hooks | `bun run test` |

### No new packages needed

All CSS classes, hooks, and components required by Phase 18 already exist in the codebase.

---

## Architecture Patterns

### Recommended File Structure After Phase 18

```
src/app/[lang]/
├── layout.tsx                    (unchanged — provides NextIntlClientProvider + SiteHeader)
├── page.tsx                      (REPLACED — now Activity Picker, was DeckBrowser)
├── rephrase/
│   ├── layout.tsx                (NEW — generateStaticParams for deck IDs)
│   ├── page.tsx                  (NEW — current /[lang]/page.tsx content, href updated)
│   └── [deck]/
│       ├── page.tsx              (NEW — current /[lang]/[deck]/page.tsx content)
│       ├── StudySession.tsx      (MOVED verbatim)
│       └── StudySessionNoSSR.tsx (MOVED verbatim)
└── qa/
    ├── layout.tsx                (NEW — generateStaticParams for scenario IDs)
    ├── page.tsx                  (NEW — ScenarioBrowser)
    └── [scenario]/
        └── page.tsx              (NEW — placeholder, Phase 19)
```

### Pattern 1: generateStaticParams in Layout (Established)

The project rule is that `page.tsx` files use `'use client'` and therefore cannot export `generateStaticParams`. It must live in the corresponding `layout.tsx`. The existing `/[lang]/[deck]/page.tsx` violates this pattern (it exports `generateStaticParams` directly) — but the CONTEXT.md decision says to follow the layout pattern going forward.

```typescript
// src/app/[lang]/rephrase/layout.tsx
import { DECK_IDS } from '@/data/decks';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    DECK_IDS.map((deck) => ({ lang, deck }))
  );
}
```

Note: The existing `/[lang]/[deck]/page.tsx` exports `generateStaticParams` while being a server component (no `'use client'`). When moving it to `/[lang]/rephrase/[deck]/page.tsx`, it can keep the same structure unchanged — the layout pattern only applies when the page itself is a client component.

### Pattern 2: useSRS / useLevelFilter Lifted to Page (Established in Phase 16)

From `src/app/[lang]/page.tsx` (Phase 16 result):

```typescript
export default function LangPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const { isCardDueForDeck, hasProgress } = useSRS(lang);
  const { activeLevels, setActiveLevels } = useLevelFilter(lang, hasProgress);

  return (
    <main>
      <LevelFilterChips lang={lang} activeLevels={activeLevels} setActiveLevels={setActiveLevels} />
      <DeckGrid lang={lang} activeLevels={activeLevels} isCardDueForDeck={isCardDueForDeck} />
    </main>
  );
}
```

The Q&A scenario browser follows the same pattern: lift `useLevelFilter` + `useSRS` (for `hasProgress`) to the page component, pass `activeLevels` down to both `LevelFilterChips` and `ScenarioGrid`.

### Pattern 3: useQASRS Called Per Scenario Tile

`useQASRS(lang, scenarioId, cards, activeLevels)` — the hook signature requires the full `cards` array and `activeLevels`. Each scenario tile in the browser grid must call this hook independently to get its `dueCards.length`. This is the correct per-tile pattern:

```typescript
function ScenarioTile({ scenario, lang, activeLevels }: ScenarioTileProps) {
  const { dueCards } = useQASRS(lang, scenario.id, scenario.cards, activeLevels);
  const due = dueCards.length;
  // ...
}
```

This results in one `useQASRS` call per rendered scenario tile (7 scenarios max). Each hook reads from the same localStorage key (`${lang}-progress`) but filters for its own `qa_${scenarioId}_*` keys via `useMemo`. This is acceptable at 7 instances — no performance concern.

### Pattern 4: SiteHeader Back Navigation (Breaking Change)

Current code (hardcoded):
```typescript
const onDeckPage = segments.length >= 2;
const backHref = `/${lang}`;
```

Required after Phase 18 (dynamic drop-last-segment):
```typescript
const onDeckPage = segments.length >= 2;
const backHref = '/' + segments.slice(0, -1).join('/');
```

`segments` is already computed as `pathname.split('/').filter(Boolean)`. `segments.length >= 2` threshold stays the same (show back button when 2+ path segments). For `/it/rephrase` (segments=`['it','rephrase']`), backHref becomes `/it`. For `/it/rephrase/daily` (segments=`['it','rephrase','daily']`), backHref becomes `/it/rephrase`. Correct in both cases.

### Pattern 5: Scenario Title by Language

No i18n key for scenario titles — titles are inline on the `Scenario` data object:
```typescript
const title = lang === 'it' ? scenario.titleIt : scenario.titleEs;
```

This is consistent with the `Scenario` type, which has `titleIt` and `titleEs` string fields (no `titleKey` i18n indirection).

### Pattern 6: Theme Class by Scenario Index (Fixed Mapping)

Available themes (from `style-reference.css`): `teal`, `red`, `yellow`, `blue`, `green`, `pink`, `purple`, `orange`.

The 7 scenarios in canonical order from `src/data/qa/index.ts`:
1. caffe (A1, icon ☕)
2. albergo (A1, icon 🏨)
3. ristorante (A1, icon 🍝)
4. strada (A1, icon 🗺️)
5. presentazioni (A1, icon 👋)
6. negozio (A2, icon 🛍️)
7. treno (A2, icon 🚄)

Recommended fixed theme mapping by index (0-based):

| Index | Scenario | Theme |
|-------|----------|-------|
| 0 | caffe | teal |
| 1 | albergo | blue |
| 2 | ristorante | red |
| 3 | strada | yellow |
| 4 | presentazioni | green |
| 5 | negozio | purple |
| 6 | treno | orange |

Note: `albergo` already uses icon 🏨 which conflicts with the existing `hotel` deck (also 🏨, theme `green`). Assigning `albergo` to `blue` avoids icon+theme duplication.

Implementation: `const SCENARIO_THEMES = ['teal','blue','red','yellow','green','purple','orange'] as const;` — index into array by scenario position in the `scenarios[]` array.

### Anti-Patterns to Avoid

- **`router.back()` for the back button:** Breaks on direct URL entry (user has no browser history). The CONTEXT.md decision explicitly prohibits this in favor of dropping the last path segment.
- **Reading `activeLevels` from localStorage directly in each tile:** Always derive from `useLevelFilter` at page level and pass as props.
- **`generateStaticParams` in a `'use client'` page file:** Next.js prohibits this combination. Keep it in `layout.tsx`.
- **Calling `useQASRS` at the grid level with all cards combined:** The hook is per-scenario. Call it once per tile.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Level filter state | Custom toggle logic | `useLevelFilter` hook | FLTR-06 guard already implemented, localStorage persistence included |
| Due count per scenario | Manual localStorage scan | `useQASRS(lang, scenarioId, cards, activeLevels).dueCards.length` | Correct key prefix, memoized, reactive to progress updates |
| i18n strings | Hardcoded English text | `useTranslations` + `messages/it.json` and `messages/es.json` | Consistency with existing nav/deck strings |
| Back link URL construction | `router.back()` or complex state | `'/' + segments.slice(0,-1).join('/')` | Simple, correct, works on direct URL entry |
| Scenario tile markup | New component from scratch | Reuse `.deck-card` + `.deck-icon-circle` + `.deck-card-badge` CSS classes | Visual consistency with deck browser guaranteed |

---

## Common Pitfalls

### Pitfall 1: Forgetting to Update All `href` References in DeckGrid

**What goes wrong:** The existing `DeckGrid` in `/[lang]/page.tsx` links decks to `/${lang}/${deck.id}`. After the restructure, those links must point to `/${lang}/rephrase/${deck.id}`. If only the file is moved and not the href, users get 404 on deck navigation.

**How to avoid:** The plan should include a specific step to update `href={`/${lang}/${deck.id}`}` to `href={`/${lang}/rephrase/${deck.id}`}` in the moved DeckGrid.

**Warning signs:** Build passes but clicking a deck card returns 404 or redirects to root.

### Pitfall 2: Old `/[lang]/[deck]` Route Still in Build Output

**What goes wrong:** If the `/[lang]/[deck]/` directory is deleted but the `generateStaticParams` in `/[lang]/rephrase/[deck]/page.tsx` (or its layout) doesn't cover all lang×deck combos, some decks won't be in the static output.

**How to avoid:** Verify `generateStaticParams` returns `routing.locales.flatMap(lang => DECK_IDS.map(deck => ({ lang, deck })))` — 2 langs × 8 decks = 16 paths, same as before.

### Pitfall 3: useQASRS Returns Wrong Due Count (Missing activeLevels)

**What goes wrong:** The hook signature is `useQASRS(lang, scenarioId, cards, activeLevels)`. If called with a hardcoded `['A1','A2']` instead of the page-level `activeLevels`, the due badge won't respect the user's current filter selection.

**How to avoid:** `activeLevels` must flow from `useLevelFilter` at the scenario browser page level, down through props to each tile component, into `useQASRS`.

### Pitfall 4: No Back Button on Activity Picker — SiteHeader Condition Must Change

**What goes wrong:** Current code shows the back button when `segments.length >= 2`. After Phase 18, `/it/rephrase` and `/it/qa` also have `segments.length >= 2` and correctly show back. But `/it` has `segments.length === 1` — back button correctly hidden. This logic does NOT need to change, only `backHref` does.

**Warning signs:** Back button appears or disappears at wrong route depths.

### Pitfall 5: hasProgress Initialization Race for Level Filter

**What goes wrong:** `useLevelFilter(lang, hasProgress)` uses `hasProgress` only for the initial default (A1 vs A1+A2). If the scenario browser page calls `useSRS(lang)` for `hasProgress`, the same localStorage read happens again. This is fine (idempotent read), but if a developer replaces this with `useQASRS`'s `hasProgress` return value and passes different cards, the initial level selection could be wrong.

**How to avoid:** Use `useSRS(lang).hasProgress` (not `useQASRS.hasProgress`) at the scenario browser page level — `hasProgress` from `useSRS` reflects whether the user has ANY progress (Rephrase or Q&A via the shared `{lang}-progress` key). This is the correct signal for "returning user" defaults.

### Pitfall 6: Activity Picker i18n Keys Must Exist in Both Locale Files Before Build

**What goes wrong:** If `messages/it.json` has `activities.rephrase.title` but `messages/es.json` does not, the Spanish build will throw a next-intl missing-key error (behavior depends on next-intl config — may error or silently fall back).

**How to avoid:** Add all new i18n keys to both files in the same task/commit. Check next-intl `missingTranslationHandler` config in `src/i18n/` to understand failure mode.

---

## Code Examples

### Scenario Browser Page (Minimal Structure)

```typescript
// src/app/[lang]/qa/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { scenarios } from '@/data/qa';
import LevelFilterChips from '@/components/LevelFilterChips';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import type { Lang } from '@/types';

export default function QABrowserPage() {
  const { lang } = useParams<{ lang: string }>();
  const { hasProgress } = useSRS(lang as Lang);
  const { activeLevels, setActiveLevels } = useLevelFilter(lang as Lang, hasProgress);

  return (
    <main>
      <LevelFilterChips lang={lang as Lang} activeLevels={activeLevels} setActiveLevels={setActiveLevels} />
      <ScenarioGrid lang={lang as Lang} activeLevels={activeLevels} />
    </main>
  );
}
```

### Scenario Tile With Live Due Count

```typescript
// Inside ScenarioGrid component
const SCENARIO_THEMES = ['teal', 'blue', 'red', 'yellow', 'green', 'purple', 'orange'] as const;

function ScenarioTile({ scenario, lang, activeLevels, index }: ScenarioTileProps) {
  const { dueCards } = useQASRS(lang, scenario.id, scenario.cards, activeLevels);
  const due = dueCards.length;
  const title = lang === 'it' ? scenario.titleIt : scenario.titleEs;
  const theme = SCENARIO_THEMES[index % SCENARIO_THEMES.length];

  return (
    <Link href={`/${lang}/qa/${scenario.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className={`deck-card theme-${theme}`} style={{ height: '100%' }}>
        <div className="deck-icon-circle">{scenario.icon}</div>
        <h3>{title}</h3>
        <span className={`deck-card-badge${due === 0 ? ' deck-card-badge--done' : ''}`}>
          {due === 0 ? '✓' : due}
        </span>
      </div>
    </Link>
  );
}
```

Note: No `<p>` description inside the scenario tile — scenarios have no description field.

### SiteHeader Back Navigation Fix

```typescript
// Before (hardcoded)
const backHref = `/${lang}`;

// After (drop last segment)
const backHref = '/' + segments.slice(0, -1).join('/');
```

The `onDeckPage` condition (`segments.length >= 2`) and the reset handler are unchanged.

### Activity Picker i18n Keys to Add

**messages/it.json** — add inside the existing JSON object:
```json
"activities": {
  "rephrase": {
    "title": "Rephrase",
    "description": "Pratica frasi con le flashcard"
  },
  "qa": {
    "title": "Dialogo",
    "description": "Rispondi a domande in situazioni reali"
  }
}
```

**messages/es.json** — add inside the existing JSON object:
```json
"activities": {
  "rephrase": {
    "title": "Rephrase",
    "description": "Practica frases con tarjetas"
  },
  "qa": {
    "title": "Diálogo",
    "description": "Responde preguntas en situaciones reales"
  }
}
```

Activity Picker emoji suggestions: Rephrase → 🃏 or 📚, Q&A → 💬 or 🗣️. Using 🃏 for Rephrase (flashcard feel) and 💬 for Q&A (dialogue) avoids overlap with existing deck icons.

### Placeholder Q&A Study Session Route

```typescript
// src/app/[lang]/qa/[scenario]/page.tsx
// Phase 19 placeholder — route exists to avoid 404 when Phase 19 is built
export default function QAStudyPage() {
  return <main><p>Coming soon.</p></main>;
}
```

### qa/layout.tsx — generateStaticParams for Scenarios

```typescript
// src/app/[lang]/qa/layout.tsx
import { routing } from '@/i18n/routing';
import { scenarios } from '@/data/qa';

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    scenarios.map((s) => ({ lang, scenario: s.id }))
  );
}

type Props = { children: React.ReactNode };
export default function QALayout({ children }: Props) {
  return <>{children}</>;
}
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `bun run test --run` |
| Full suite command | `bun run test` |
| Test location | `src/__tests__/**/*.{test,spec}.{ts,tsx}` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACTPICK-01 | Activity Picker renders two activity cards with correct hrefs | unit (component render) | `bun run test --run src/__tests__/components/ActivityPicker.test.tsx` | ❌ Wave 0 |
| QAFLOW-01 | ScenarioGrid renders 7 scenario tiles with live due-count badges | unit (hook integration) | `bun run test --run src/__tests__/components/ScenarioGrid.test.tsx` | ❌ Wave 0 |
| QAFLOW-02 | LevelFilterChips FLTR-06 guard — cannot deselect all in scenario browser | unit (existing hook) | `bun run test --run src/__tests__/hooks/useLevelFilter.test.tsx` | ✅ existing |

Note: The `useLevelFilter` tests already cover the FLTR-06 guard. QAFLOW-02 is satisfied by the existing test suite plus correct wiring in the scenario browser page.

Navigation behavior (back button hrefs, correct route structure) is best verified by manual smoke test or Playwright e2e, not unit tests — the routing is filesystem-driven and Next.js static export verification requires a build step.

### Sampling Rate
- **Per task commit:** `bun run test --run`
- **Per wave merge:** `bun run test --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/components/ActivityPicker.test.tsx` — covers ACTPICK-01 (two cards, correct hrefs to `/[lang]/rephrase` and `/[lang]/qa`)
- [ ] `src/__tests__/components/ScenarioGrid.test.tsx` — covers QAFLOW-01 (7 tiles rendered, badge shows due count from useQASRS, checkmark when due=0)

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `/[lang]/[deck]` — flat deck URL | `/[lang]/rephrase/[deck]` — activity-scoped URL | All existing deck links need updating |
| `/[lang]` — deck browser | `/[lang]` — activity picker | Page content replacement, not new file |
| `backHref = /${lang}` hardcoded | `backHref` = drop last path segment | Works for all route depths uniformly |

---

## Open Questions

1. **Does the existing `/[lang]/[deck]/page.tsx` export `generateStaticParams` as a server component?**
   - What we know: The file has no `'use client'` directive and exports `generateStaticParams` inline (confirmed by reading the file).
   - What's unclear: Whether the new `/[lang]/rephrase/[deck]/page.tsx` should follow the same pattern (server component with inline `generateStaticParams`) or move it to a new layout.
   - Recommendation: Keep it as a server component with inline `generateStaticParams` — consistent with the existing file structure, no reason to introduce a new `rephrase/[deck]/layout.tsx`.

2. **Activity Picker layout CSS: reuse `.deck-grid` or new CSS class?**
   - What we know: `.deck-grid` uses `repeat(auto-fill, minmax(300px, 1fr))` — with only two items this works but may leave large gaps on wide screens.
   - What's unclear: Whether two wide activity cards side by side looks better with a custom two-column grid.
   - Recommendation: Use a simple two-column grid via inline style or a minimal new class (`.activity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }`). The constraint says "stacks vertically on mobile" — add `@media (max-width: 600px) { .activity-grid { grid-template-columns: 1fr; } }`.

---

## Sources

### Primary (HIGH confidence)

All findings are based on direct code reading of the project source. No external library research was needed — Phase 18 uses zero new dependencies.

- `/Users/jbtellez/genies/purolingua/src/app/[lang]/page.tsx` — existing deck browser pattern (Phase 16 result)
- `/Users/jbtellez/genies/purolingua/src/app/[lang]/layout.tsx` — layout/generateStaticParams pattern
- `/Users/jbtellez/genies/purolingua/src/components/SiteHeader.tsx` — current back navigation implementation
- `/Users/jbtellez/genies/purolingua/src/components/LevelFilterChips.tsx` — reusable filter component
- `/Users/jbtellez/genies/purolingua/src/hooks/useQASRS.ts` — Phase 17 hook signature and behavior
- `/Users/jbtellez/genies/purolingua/src/hooks/useLevelFilter.ts` — FLTR-06 guard implementation
- `/Users/jbtellez/genies/purolingua/src/data/qa/index.ts` — canonical scenarios array (7 items, A1-first)
- `/Users/jbtellez/genies/purolingua/src/types/index.ts` — `Scenario`, `ScenarioId`, `QACard` types
- `/Users/jbtellez/genies/purolingua/src/style-reference.css` — `.deck-card`, `.deck-card-badge`, `theme-*` classes
- `/Users/jbtellez/genies/purolingua/messages/it.json` + `messages/es.json` — i18n file structure
- `/Users/jbtellez/genies/purolingua/vitest.config.ts` — test framework config

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified by reading source files; no new dependencies
- Architecture patterns: HIGH — all patterns derived from existing working code (Phase 16 deck browser)
- Pitfalls: HIGH — derived from concrete code analysis (actual hook signatures, actual route file contents)
- i18n key recommendations: MEDIUM — key names are Claude's discretion per CONTEXT.md; exact strings are suggested, not locked

**Research date:** 2026-03-09
**Valid until:** End of Phase 18 — no external library changes expected; project is self-contained
