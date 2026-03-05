# Phase 11: Logic and Tests - Research

**Researched:** 2026-03-05
**Domain:** TypeScript SRS logic, React hooks (localStorage), Vitest + React Testing Library for Next.js App Router
**Confidence:** HIGH (SRS logic translation), HIGH (test tooling), MEDIUM (RTL `renderHook` + jsdom for localStorage hooks)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRS-01 | Leitner box math in `lib/srs.ts` as pure TypeScript functions | v1.1 `progress.js` fully documents all logic: 3 boxes, date strings, key format |
| SRS-02 | Distractor generation in `lib/generateChoices.ts` | v1.1 `deck-utils.js` `generateChoices` is direct source; needs Fisher-Yates upgrade |
| SRS-03 | `useSRS(lang)` hook with localStorage persistence, same key format as v1.1 | localStorage key is `{lang}-progress`; data shape is `{ box: number, nextReview: string }` |
| SRS-04 | `useLevelFilter()` hook with localStorage persistence and FLTR-06 guard | key is `{lang}-level-filter`; guard rejects empty/null; default A1 for new users |
| TEST-01 | Vitest + React Testing Library configured | vitest@4.0.15 already in node_modules; RTL not yet installed; need `vitest.config.ts` |
| TEST-02 | `lib/srs.ts` unit tested | Pure function tests — no DOM, no hook, standard Vitest describe/it/expect |
| TEST-03 | `lib/generateChoices.ts` unit tested | Pure function tests — same pattern as v1.1 `deck-utils.test.js` |
| TEST-04 | `useSRS` and `useLevelFilter` tested via `renderHook` | Requires `@testing-library/react` + jsdom environment |
</phase_requirements>

---

## Summary

Phase 11 ports the Leitner SRS logic and level-filter state from the vanilla JS `src/js/features/progress.js` and `src/js/utils/deck-utils.js` on the `main` branch into typed TypeScript modules in `src/lib/` and `src/hooks/`. Simultaneously it establishes the test infrastructure (Vitest + React Testing Library) and writes comprehensive tests for all new modules.

The SRS logic itself is simple and fully understood from the v1.1 source: 3-box Leitner system with YYYY-MM-DD date strings, card keys of `{deckId}_{cardIndex}`, and localStorage keyed by `{lang}-progress`. There are no algorithmic surprises — the port is a faithful TypeScript translation with one important data-type correction: the v1.2 `Progress` interface in `src/types/index.ts` currently defines `nextReview: number` (Unix timestamp), but the v1.1 implementation uses YYYY-MM-DD strings. The correct shape for SRS-01 is **`nextReview: string`** to preserve v1.1 localStorage key compatibility.

The test stack requires adding `@testing-library/react` and `@testing-library/user-event` as devDependencies. Vitest v4.0.15 is already in `node_modules` from the pre-port era but is absent from the current `package.json` — it must be added explicitly. A `vitest.config.ts` must be created at the repo root.

**Primary recommendation:** Split phase into two waves — Wave 1: pure logic files (`lib/srs.ts`, `lib/generateChoices.ts`) + their Vitest unit tests; Wave 2: React hooks (`hooks/useSRS.ts`, `hooks/useLevelFilter.ts`) + `renderHook` tests. Wave 0 installs test tooling and creates `vitest.config.ts`.

---

## Critical Data Type Discrepancy

**Problem:** `src/types/index.ts` (Phase 9, already committed) defines:
```typescript
export interface Progress {
  box: number;
  nextReview: number; // Unix timestamp (ms)
}
```

**Reality from v1.1 source** (`src/js/features/progress.js` on `main`):
```javascript
// nextReview is always a YYYY-MM-DD string: "2026-03-06"
cardProgress.nextReview = getNextReviewDate(cardProgress.box);
// getNextReviewDate returns today.toISOString().split('T')[0]
```

**Impact:** If `useSRS` writes date strings to localStorage but the TypeScript type says `number`, (a) TypeScript strict mode will reject string assignment, and (b) existing users' v1.1 progress data uses strings. The type MUST be corrected to `nextReview: string` in Phase 11.

**Action:** Phase 11 Wave 0 or Wave 1 task: update `src/types/index.ts` `Progress.nextReview` from `number` to `string`.

---

## Standard Stack

### Core (Phase 11 additions)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^4.0.15 | Test runner, assertion library | Already in node_modules; v4 is current stable |
| @testing-library/react | ^16.x | `renderHook`, hook testing | Official React hook testing library |
| @testing-library/user-event | ^14.x | User interaction simulation | Standard companion to RTL |
| @vitest/coverage-v8 | ^4.x | Coverage reports | Bundled with vitest; v8 is default provider |
| jsdom | ^25.x | DOM simulation for tests | Already in node_modules; Vitest jsdom environment |

### Already Present (no install needed)

| Library | Version | Where | Notes |
|---------|---------|-------|-------|
| vitest | 4.0.15 | `node_modules/vitest` | NOT in `package.json` — must add |
| jsdom | 25.x | `node_modules/jsdom` | NOT in `package.json` — must add |
| typescript | ^5 | `package.json` devDependencies | Available |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsdom environment | happy-dom | happy-dom is lighter but less faithful to browser APIs; jsdom is Vitest default |
| @testing-library/react | Enzyme | RTL is the current standard; Enzyme is unmaintained for React 18+ |
| Vitest | Jest | Jest requires additional Next.js config complexity; Vitest is native ESM, faster |

**Installation (Wave 0):**
```bash
bun add -D vitest @testing-library/react @testing-library/user-event @vitest/coverage-v8 jsdom
```

Note: `bun add -D vitest` will also update `package.json` to record the dependency — this is required since the current `package.json` lacks it entirely.

---

## Architecture Patterns

### Recommended File Layout (Phase 11 additions)

```
src/
├── lib/
│   ├── srs.ts              # Pure SRS functions (no React, no side effects)
│   └── generateChoices.ts  # Pure choice generation
├── hooks/
│   ├── useSRS.ts           # React hook: SRS state + localStorage
│   └── useLevelFilter.ts   # React hook: level filter state + localStorage
tests/                      # Existing test directory (vanilla JS era)
src/__tests__/              # NEW: TypeScript test files for Next.js port
    ├── lib/
    │   ├── srs.test.ts
    │   └── generateChoices.test.ts
    └── hooks/
        ├── useSRS.test.tsx
        └── useLevelFilter.test.tsx
vitest.config.ts            # NEW: root-level Vitest config
```

**Note on test directory:** The existing `tests/` directory contains vanilla JS tests importing from `src/js/` (main branch paths). These imports will fail in the `feat/nextjs-port` context since `src/js/` no longer exists. The new TypeScript tests MUST go in `src/__tests__/` to use `@/` path aliases cleanly. Existing `tests/*.js` should be either removed or noted as legacy (they are not part of v1.2 TEST-01 through TEST-04 requirements).

### Pattern 1: Pure SRS Library (`lib/srs.ts`)

**What:** Extract all stateless SRS functions from v1.1 `progress.js` into a pure TypeScript module. No localStorage access, no React. Functions receive and return plain values.

**Why separate from hook:** Enables direct unit testing without DOM or hook setup overhead. Hook (`useSRS`) composes on top of these functions.

```typescript
// src/lib/srs.ts
// Source: v1.1 src/js/features/progress.js (main branch)
import type { DeckId, Progress, ProgressRecord } from '@/types';

/** Card key format matches v1.1 exactly: "{deckId}_{cardIndex}" */
export function getCardKey(deckId: DeckId, cardIndex: number): string {
  return `${deckId}_${cardIndex}`;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/** Leitner intervals: box 1 → 1 day, box 2 → 3 days, box 3 → 7 days */
export function getNextReviewDate(box: number): string {
  const today = getTodayString();
  if (box === 1) return addDays(today, 1);
  if (box === 2) return addDays(today, 3);
  if (box === 3) return addDays(today, 7);
  return today;
}

export function isCardDue(progress: Progress | undefined): boolean {
  if (!progress) return true; // new cards are always due
  return progress.nextReview <= getTodayString();
}

export function advanceBox(current: Progress | undefined, isCorrect: boolean): Progress {
  const currentBox = current?.box ?? 1;
  const newBox = isCorrect ? Math.min(currentBox + 1, 3) : 1;
  return { box: newBox, nextReview: getNextReviewDate(newBox) };
}
```

**Note:** The function signature for `isCardDue` changes from v1.1. In v1.1 it takes `(deckId, cardIndex)` and reads from module-level `progress` state. In v1.2 it takes the `Progress` record directly — this is a deliberate improvement for testability. The hook handles the lookup.

### Pattern 2: Pure Choice Generator (`lib/generateChoices.ts`)

**What:** Direct port of v1.1 `generateChoices` from `deck-utils.js`. Accept `correctCard` and `filteredCards` (pre-filtered by caller to active levels), return `{ text: string, isCorrect: boolean }[]`.

**Key insight from v1.1:** The v1.1 implementation uses `.sort(() => 0.5 - Math.random())` for shuffling — this is a known biased shuffle. The Phase 11 port should upgrade to Fisher-Yates. The test suite must be written to be shuffle-agnostic (check presence, not order).

```typescript
// src/lib/generateChoices.ts
import type { Card } from '@/types';

export interface Choice {
  text: string;
  isCorrect: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Returns 1 correct answer + up to 3 foils, shuffled. */
export function generateChoices(correctCard: Card, filteredCards: Card[]): Choice[] {
  const foilPool = filteredCards.filter(c => c.back !== correctCard.back);
  const foils = shuffleArray(foilPool).slice(0, 3);
  const choices: Choice[] = [
    { text: correctCard.back, isCorrect: true },
    ...foils.map(f => ({ text: f.back, isCorrect: false })),
  ];
  return shuffleArray(choices);
}
```

### Pattern 3: `useSRS(lang)` Hook

**What:** React hook that manages SRS progress for a given language in localStorage. Wraps `lib/srs.ts` functions with `useState` and `useCallback`.

**localStorage key:** `{lang}-progress` — matches v1.1 exactly (`it-progress`, `es-progress`). This is critical for user data continuity.

```typescript
// src/hooks/useSRS.ts
'use client';
import { useState, useCallback } from 'react';
import type { DeckId, Lang, ProgressRecord } from '@/types';
import { getCardKey, advanceBox, isCardDue } from '@/lib/srs';

function getStorageKey(lang: Lang): string {
  return `${lang}-progress`;
}

function loadFromStorage(lang: Lang): ProgressRecord {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(getStorageKey(lang));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveToStorage(lang: Lang, record: ProgressRecord): void {
  try {
    localStorage.setItem(getStorageKey(lang), JSON.stringify(record));
  } catch {
    // localStorage unavailable (private browsing quota) — silent fail
  }
}

export function useSRS(lang: Lang) {
  const [progress, setProgress] = useState<ProgressRecord>(() => loadFromStorage(lang));

  const updateCard = useCallback(
    (deckId: DeckId, cardIndex: number, isCorrect: boolean) => {
      setProgress(prev => {
        const key = getCardKey(deckId, cardIndex);
        const updated = { ...prev, [key]: advanceBox(prev[key], isCorrect) };
        saveToStorage(lang, updated);
        return updated;
      });
    },
    [lang]
  );

  const isCardDueForDeck = useCallback(
    (deckId: DeckId, cardIndex: number): boolean => {
      const key = getCardKey(deckId, cardIndex);
      return isCardDue(progress[key]);
    },
    [progress]
  );

  const hasProgress = Object.keys(progress).length > 0;

  return { progress, updateCard, isCardDueForDeck, hasProgress };
}
```

**SSR guard:** `typeof window === 'undefined'` check in `loadFromStorage` prevents `localStorage` access during Next.js server-side rendering (even though `output: 'export'` makes SSR minimal, the build still renders pages server-side at build time). The `'use client'` directive ensures the hook only runs in the browser.

### Pattern 4: `useLevelFilter()` Hook

**What:** React hook for level filter state with FLTR-06 guard (cannot deselect all) and localStorage persistence.

**localStorage key:** `{lang}-level-filter` — matches v1.1 exactly.

**Default behavior (from STATE.md decisions):**
- New users (no progress): default to `['A1']`
- Returning users (has progress): default to `['A1', 'A2']`

The hook needs `hasProgress: boolean` as input to determine the correct default on first load.

```typescript
// src/hooks/useLevelFilter.ts
'use client';
import { useState, useCallback } from 'react';
import type { Lang, Level } from '@/types';

function getFilterKey(lang: Lang): string {
  return `${lang}-level-filter`;
}

function loadFilter(lang: Lang): Level[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(getFilterKey(lang));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Level[];
    }
  } catch {
    // corrupted JSON — return null
  }
  return null;
}

export function useLevelFilter(lang: Lang, hasProgress: boolean) {
  const [activeLevels, setActiveLevelsState] = useState<Level[]>(() => {
    const saved = loadFilter(lang);
    if (saved) return saved;
    return hasProgress ? ['A1', 'A2'] : ['A1'];
  });

  const setActiveLevels = useCallback(
    (levels: Level[] | null) => {
      if (!levels || levels.length === 0) return; // FLTR-06: silent no-op
      setActiveLevelsState(levels);
      try {
        localStorage.setItem(getFilterKey(lang), JSON.stringify(levels));
      } catch {
        // silent fail
      }
    },
    [lang]
  );

  return { activeLevels, setActiveLevels };
}
```

### Pattern 5: `vitest.config.ts`

**What:** Root-level Vitest config pointing at `src/__tests__/` with jsdom environment and React Testing Library setup.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

Note: `@vitejs/plugin-react` is required to transform JSX in test files. Install: `bun add -D @vitejs/plugin-react`.

### Pattern 6: Test Setup File

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// localStorage mock (same pattern as existing tests/vitest.setup.js)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
```

Note: `@testing-library/jest-dom` extends Vitest matchers with DOM assertions (`toBeInTheDocument`, etc.). Install: `bun add -D @testing-library/jest-dom`.

### Anti-Patterns to Avoid

- **Accessing `localStorage` directly in `lib/srs.ts`:** Keep lib functions pure. All localStorage access lives in the hooks. Mixing them makes unit tests require DOM setup.
- **Using `nextReview: number` (timestamp) in Progress type:** The v1.1 format is YYYY-MM-DD strings. The `Progress` interface in `src/types/index.ts` must be corrected from `number` to `string` in this phase.
- **`sort(() => 0.5 - Math.random())` shuffle:** This produces biased results. Use Fisher-Yates in `generateChoices.ts`.
- **Importing from `src/js/`** in new test files: `src/js/` does not exist on `feat/nextjs-port`. Import from `@/lib/` and `@/hooks/`.
- **Reading `window.localStorage` without SSR guard in hooks:** Even in static export, Next.js build runs pages server-side. Use `typeof window === 'undefined'` guard or `useEffect` for initialization.
- **Calling `renderHook` without `wrapper` when hook needs context:** These hooks are self-contained; no provider wrapper needed. But this must be confirmed once hooks are written.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hook testing | Custom renderer | `@testing-library/react` `renderHook` | Handles act() wrapping, state updates, cleanup |
| DOM assertions | Custom predicates | `@testing-library/jest-dom` matchers | `toBeInTheDocument`, `toHaveValue`, etc. |
| localStorage mock | Ad-hoc object | Setup file pattern (from v1.1 `vitest.setup.js`) | Reuse battle-tested mock; clear `beforeEach` |
| Date math (box intervals) | Custom logic | Direct port from v1.1 | Already correct and tested in v1.1 context |
| Shuffle | `.sort(() => Math.random())` | Fisher-Yates | `.sort(Math.random)` is biased; Fisher-Yates is uniform |

**Key insight:** The SRS logic is simple enough that no external library (like `ts-fsrs`) is warranted. The 3-box Leitner system is 30 lines of code. External SRS libraries add unnecessary complexity and version risk for this scope.

---

## Common Pitfalls

### Pitfall 1: Progress Type Mismatch (`nextReview: number` vs `string`)

**What goes wrong:** TypeScript strict mode rejects `getNextReviewDate()` return value (a string like `"2026-03-06"`) being assigned to `nextReview: number` in the existing `Progress` interface.

**Why it happens:** Phase 9 stub typed `nextReview` as `number` (Unix timestamp) which is one valid representation, but v1.1 used date strings. Date string comparison (`"2026-03-06" <= "2026-03-06"`) works correctly for ISO format but would fail with timestamps for the `isCardDue` comparison logic.

**How to avoid:** In Phase 11 Wave 0 or Wave 1, update `src/types/index.ts` to `nextReview: string`.

**Warning signs:** TypeScript error `Type 'string' is not assignable to type 'number'` in `srs.ts`.

### Pitfall 2: `localStorage` Not Available During Next.js Build

**What goes wrong:** Hook initializer (`useState(() => loadFromStorage(lang))`) runs during SSR/build phase where `localStorage` is undefined, causing `ReferenceError`.

**Why it happens:** Next.js App Router renders pages on the server at build time even for `output: 'export'`. `localStorage` is a browser-only API.

**How to avoid:** Guard with `typeof window === 'undefined'` or initialize to empty state and load in `useEffect`. The pattern in the research code example above handles this.

**Warning signs:** Build error `ReferenceError: localStorage is not defined` during `bun run build`.

### Pitfall 3: Vitest `@/` Alias Not Resolved

**What goes wrong:** Test files using `import { getCardKey } from '@/lib/srs'` throw `Cannot find module '@/lib/srs'` in the test runner.

**Why it happens:** Vitest runs independently of Next.js. The `tsconfig.json` paths alias (`@/*` → `./src/*`) must be replicated in `vitest.config.ts` under `resolve.alias`.

**How to avoid:** Add `resolve.alias: { '@': resolve(__dirname, './src') }` to `vitest.config.ts`. Verified pattern.

**Warning signs:** Module not found errors for `@/` imports in vitest output.

### Pitfall 4: Missing `@vitejs/plugin-react` for JSX in Tests

**What goes wrong:** Hook test files (`.tsx`) fail to parse JSX syntax because the default Vitest transform does not include React JSX transformation.

**Why it happens:** Vitest uses Vite under the hood but does not automatically apply the React plugin.

**How to avoid:** Add `react()` plugin from `@vitejs/plugin-react` to `vitest.config.ts` `plugins` array.

### Pitfall 5: Hook Tests Not Wrapped in `act()`

**What goes wrong:** State updates inside hook tests cause React "not wrapped in act()" warnings, and assertions may read stale state.

**Why it happens:** `renderHook` from RTL handles initial render inside `act`, but subsequent `result.current.updateCard(...)` calls must also be wrapped.

**How to avoid:** RTL's `act` is re-exported from `@testing-library/react`. Use:
```typescript
import { renderHook, act } from '@testing-library/react';
// ...
act(() => { result.current.updateCard('daily', 0, true); });
```

### Pitfall 6: Biased Foil Shuffle in Tests

**What goes wrong:** Tests checking specific foil positions (e.g., "first foil must be X") fail intermittently due to shuffle.

**Why it happens:** `generateChoices` shuffles the output.

**How to avoid:** Write tests that check presence/membership, not position:
```typescript
expect(choices.map(c => c.text)).toContain(correctCard.back);
expect(choices.filter(c => !c.isCorrect)).toHaveLength(3);
```

---

## Code Examples

### Unit Test: `lib/srs.ts` (TEST-02)

```typescript
// src/__tests__/lib/srs.test.ts
import { describe, it, expect } from 'vitest';
import { getCardKey, getTodayString, getNextReviewDate, isCardDue, advanceBox } from '@/lib/srs';

describe('getCardKey', () => {
  it('combines deckId and cardIndex with underscore', () => {
    expect(getCardKey('daily', 0)).toBe('daily_0');
    expect(getCardKey('restaurant', 12)).toBe('restaurant_12');
  });
});

describe('getNextReviewDate', () => {
  it('box 1 → tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getNextReviewDate(1)).toBe(tomorrow.toISOString().split('T')[0]);
  });
  it('box 2 → 3 days', () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(getNextReviewDate(2)).toBe(future.toISOString().split('T')[0]);
  });
  it('box 3 → 7 days', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(getNextReviewDate(3)).toBe(future.toISOString().split('T')[0]);
  });
});

describe('isCardDue', () => {
  it('returns true for undefined (new card)', () => {
    expect(isCardDue(undefined)).toBe(true);
  });
  it('returns true when nextReview <= today', () => {
    expect(isCardDue({ box: 1, nextReview: '2020-01-01' })).toBe(true);
  });
  it('returns false when nextReview is future', () => {
    expect(isCardDue({ box: 2, nextReview: '2099-01-01' })).toBe(false);
  });
});

describe('advanceBox', () => {
  it('new card correct → box 2', () => {
    expect(advanceBox(undefined, true).box).toBe(2);
  });
  it('box 3 correct → stays box 3 (max)', () => {
    expect(advanceBox({ box: 3, nextReview: '2026-01-01' }, true).box).toBe(3);
  });
  it('any box incorrect → box 1', () => {
    expect(advanceBox({ box: 3, nextReview: '2026-01-01' }, false).box).toBe(1);
  });
});
```

### Unit Test: `lib/generateChoices.ts` (TEST-03)

```typescript
// src/__tests__/lib/generateChoices.test.ts
import { describe, it, expect } from 'vitest';
import { generateChoices } from '@/lib/generateChoices';
import type { Card } from '@/types';

const makeCards = (n: number, level: 'A1' | 'A2' = 'A1'): Card[] =>
  Array.from({ length: n }, (_, i) => ({
    front: `front-${i}`,
    back: `back-${i}`,
    level,
  }));

describe('generateChoices', () => {
  it('returns exactly 4 choices', () => {
    const cards = makeCards(5);
    expect(generateChoices(cards[0], cards)).toHaveLength(4);
  });
  it('exactly one isCorrect', () => {
    const cards = makeCards(5);
    const choices = generateChoices(cards[0], cards);
    expect(choices.filter(c => c.isCorrect)).toHaveLength(1);
  });
  it('correct text matches card back', () => {
    const cards = makeCards(5);
    const correct = generateChoices(cards[0], cards).find(c => c.isCorrect);
    expect(correct?.text).toBe(cards[0].back);
  });
  it('foils are from filteredCards pool only', () => {
    const a1Cards = makeCards(4, 'A1');
    const a2Cards = makeCards(4, 'A2');
    const choices = generateChoices(a1Cards[0], a1Cards);
    const a2Backs = a2Cards.map(c => c.back);
    choices.filter(c => !c.isCorrect).forEach(f => {
      expect(a2Backs).not.toContain(f.text);
    });
  });
  it('fewer than 4 foils available → returns what is available (no crash)', () => {
    const cards = makeCards(2);
    const choices = generateChoices(cards[0], cards);
    expect(choices.length).toBeGreaterThanOrEqual(1);
    expect(choices.filter(c => c.isCorrect)).toHaveLength(1);
  });
});
```

### Hook Test: `useSRS` (TEST-04)

```typescript
// src/__tests__/hooks/useSRS.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSRS } from '@/hooks/useSRS';

beforeEach(() => localStorage.clear());

describe('useSRS', () => {
  it('starts with empty progress for new user', () => {
    const { result } = renderHook(() => useSRS('it'));
    expect(result.current.hasProgress).toBe(false);
  });

  it('updateCard persists to localStorage under {lang}-progress key', () => {
    const { result } = renderHook(() => useSRS('it'));
    act(() => { result.current.updateCard('daily', 0, true); });
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['daily_0'].box).toBe(2);
  });

  it('isCardDueForDeck returns true for new card', () => {
    const { result } = renderHook(() => useSRS('it'));
    expect(result.current.isCardDueForDeck('daily', 0)).toBe(true);
  });

  it('it-progress and es-progress are independent', () => {
    const { result: itHook } = renderHook(() => useSRS('it'));
    const { result: esHook } = renderHook(() => useSRS('es'));
    act(() => { itHook.current.updateCard('daily', 0, true); });
    expect(esHook.current.hasProgress).toBe(false);
  });
});
```

### Hook Test: `useLevelFilter` (TEST-04)

```typescript
// src/__tests__/hooks/useLevelFilter.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLevelFilter } from '@/hooks/useLevelFilter';

beforeEach(() => localStorage.clear());

describe('useLevelFilter default values', () => {
  it('new user (hasProgress=false) defaults to ["A1"]', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('returning user (hasProgress=true) defaults to ["A1","A2"]', () => {
    const { result } = renderHook(() => useLevelFilter('it', true));
    expect(result.current.activeLevels).toEqual(['A1', 'A2']);
  });

  it('saved localStorage value takes precedence over default', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A2']));
    const { result } = renderHook(() => useLevelFilter('it', true));
    expect(result.current.activeLevels).toEqual(['A2']);
  });
});

describe('useLevelFilter FLTR-06 guard', () => {
  it('setActiveLevels([]) is a no-op', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels([]); });
    expect(result.current.activeLevels).toEqual(['A1']);
  });

  it('setActiveLevels(null) is a no-op', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels(null); });
    expect(result.current.activeLevels).toEqual(['A1']);
  });
});

describe('useLevelFilter localStorage persistence', () => {
  it('setActiveLevels(["A1","A2"]) saves to {lang}-level-filter', () => {
    const { result } = renderHook(() => useLevelFilter('it', false));
    act(() => { result.current.setActiveLevels(['A1', 'A2']); });
    const stored = JSON.parse(localStorage.getItem('it-level-filter') ?? 'null');
    expect(stored).toEqual(['A1', 'A2']);
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Module-level `progress = {}` in vanilla JS | `useState` + localStorage hook | Phase 11 | React re-renders on update; no global mutation |
| `sort(() => 0.5 - Math.random())` shuffle | Fisher-Yates shuffle | Phase 11 | Uniform distribution; deterministic with seeded random |
| `unstable_setRequestLocale` (next-intl v3) | `setRequestLocale` (next-intl v4) | next-intl v4 | Stable API |
| Separate `vitest.config.js` (CJS) | `vitest.config.ts` (TypeScript) | Vitest 3+ | Type-safe config |
| Jest + `jest-environment-jsdom` | Vitest + `environment: 'jsdom'` | 2023-2024 | Faster, native ESM, no Babel needed |

**Deprecated/outdated:**
- `@testing-library/react-hooks`: Deprecated — use `renderHook` from `@testing-library/react` (v13+)
- `jest-dom/extend-expect`: Use `@testing-library/jest-dom` with `import '@testing-library/jest-dom'` in setup file

---

## Open Questions

1. **`src/types/index.ts` `Progress.nextReview` correction**
   - What we know: The type says `number` but v1.1 uses strings. This MUST change.
   - What's unclear: Whether the Phase 9 or 10 plans left any downstream consumers that hardcode `number`.
   - Recommendation: Correct the type in Phase 11 Wave 0 task; check for any downstream references before committing.

2. **Existing `tests/*.js` files on `feat/nextjs-port`**
   - What we know: The `tests/` directory has vanilla JS tests that import from `src/js/` (which doesn't exist on this branch). Running them will fail.
   - What's unclear: Whether to delete them, skip them in the new vitest config, or leave them as unrun legacy.
   - Recommendation: The new `vitest.config.ts` should only `include: ['src/__tests__/**']`. The old `tests/` directory can remain as reference documentation but will not be executed in the new test pipeline.

3. **`@vitejs/plugin-react` vs `@vitejs/plugin-react-swc`**
   - What we know: Both work with Vitest. The SWC variant is faster for large codebases.
   - What's unclear: Whether the existing Next.js install uses SWC internally (it does by default in Next.js 16).
   - Recommendation: Use `@vitejs/plugin-react` (Babel) for compatibility — test suite is small and speed difference is negligible. If build times become an issue, swap to SWC variant.

---

## Validation Architecture

Config `workflow.nyquist_validation` key is absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.15 |
| Config file | `vitest.config.ts` (root) — does NOT exist yet (Wave 0 gap) |
| Quick run command | `bun run test -- --run` |
| Full suite command | `bun run test -- --run --coverage` |

Note: `package.json` does not have a `test` script yet. Wave 0 must add: `"test": "vitest"` to `package.json` scripts.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRS-01 | Leitner box math functions work correctly | unit | `bun run test -- --run src/__tests__/lib/srs.test.ts` | Wave 0 gap |
| SRS-02 | `generateChoices` returns correct/foil structure | unit | `bun run test -- --run src/__tests__/lib/generateChoices.test.ts` | Wave 0 gap |
| SRS-03 | `useSRS` persists/reads `{lang}-progress` correctly | unit (renderHook) | `bun run test -- --run src/__tests__/hooks/useSRS.test.tsx` | Wave 0 gap |
| SRS-04 | `useLevelFilter` enforces FLTR-06, persists filter | unit (renderHook) | `bun run test -- --run src/__tests__/hooks/useLevelFilter.test.tsx` | Wave 0 gap |
| TEST-01 | Vitest config runs without errors | smoke | `bun run test -- --run` exits 0 | Wave 0 gap |
| TEST-02 | `lib/srs.ts` all exported functions covered | unit | `bun run test -- --run src/__tests__/lib/srs.test.ts` | Wave 0 gap |
| TEST-03 | `lib/generateChoices.ts` covered | unit | `bun run test -- --run src/__tests__/lib/generateChoices.test.ts` | Wave 0 gap |
| TEST-04 | `useSRS` + `useLevelFilter` hook tests pass | unit (renderHook) | `bun run test -- --run src/__tests__/hooks/` | Wave 0 gap |

### Sampling Rate

- **Per task commit:** `bun run test -- --run` (all tests, exits 0)
- **Per wave merge:** `bun run test -- --run && bun run build` (tests + TypeScript build)
- **Phase gate:** Full test suite green + `bun run build` exits 0 before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — root-level Vitest config with jsdom + `@/` alias + React plugin
- [ ] `src/__tests__/setup.ts` — localStorage mock + `@testing-library/jest-dom` import
- [ ] `src/__tests__/lib/srs.test.ts` — covers SRS-01, TEST-02
- [ ] `src/__tests__/lib/generateChoices.test.ts` — covers SRS-02, TEST-03
- [ ] `src/__tests__/hooks/useSRS.test.tsx` — covers SRS-03, TEST-04
- [ ] `src/__tests__/hooks/useLevelFilter.test.tsx` — covers SRS-04, TEST-04
- [ ] `package.json` `test` script: `"test": "vitest"`
- [ ] Install: `bun add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitejs/plugin-react @vitest/coverage-v8 jsdom`
- [ ] Fix `src/types/index.ts`: `Progress.nextReview: string` (not `number`)

---

## Sources

### Primary (HIGH confidence)

- v1.1 source (main branch) `src/js/features/progress.js` — complete SRS implementation read directly
- v1.1 source (main branch) `src/js/core/state.js` — `setActiveLevels` FLTR-06 guard read directly
- v1.1 source (main branch) `src/js/utils/deck-utils.js` — `generateChoices` implementation read directly
- `src/types/index.ts` (feat/nextjs-port) — confirmed `Progress.nextReview: number` type error
- `tests/filter-logic.test.js` (existing) — behavioral contract for `useLevelFilter` tests ported from
- `tests/progress.test.js` (existing) — behavioral contract for `useSRS` / `lib/srs.ts` tests ported from
- `node_modules/vitest/package.json` — confirmed vitest@4.0.15 present but not in package.json

### Secondary (MEDIUM confidence)

- [testing-library.com/docs/react-testing-library/api/#renderhook](https://testing-library.com/docs/react-testing-library/api/#renderhook) — `renderHook` API (knowledge as of August 2025)
- [vitest.dev/config/](https://vitest.dev/config/) — vitest.config.ts shape with resolve.alias (knowledge as of August 2025)

### Tertiary (LOW confidence)

- `@vitejs/plugin-react` requirement for JSX in Vitest — inferred from Vitest documentation patterns; should be verified if build errors arise

---

## Metadata

**Confidence breakdown:**
- SRS logic (srs.ts, generateChoices.ts): HIGH — direct read of v1.1 source; logic is simple and complete
- Hook patterns (useSRS, useLevelFilter): HIGH — standard React useState/useCallback; localStorage key format confirmed from v1.1 source
- Test configuration (vitest.config.ts): HIGH — vitest already installed; RTL patterns are stable
- Progress type discrepancy (`nextReview: string`): HIGH — confirmed by direct code read
- `@vitejs/plugin-react` requirement: MEDIUM — standard Vitest+React pattern; not directly verified against installed vitest@4

**Research date:** 2026-03-05
**Valid until:** 2026-06-05 (Vitest and RTL are stable; re-verify if planning takes longer than 90 days)
