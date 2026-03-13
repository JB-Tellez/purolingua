# Phase 25: Study Sessions - Research

**Researched:** 2026-03-12
**Domain:** Vue 3 SFC study session pages, ClientOnly SSR wrapping, dueCards snapshot pattern, TTS (Web Speech API), voice recognition, Leitner SRS grading
**Confidence:** HIGH

## Summary

Phase 25 ports two study session components from the Next.js `feat/nextjs-port` branch into Nuxt 4 Vue SFCs: the Rephrase StudySession (`src/app/[lang]/rephrase/[deck]/StudySession.tsx`) and the Q&A StudySession (`src/app/[lang]/qa/[scenario]/QAStudySession.tsx`). Both source files have been read in full. All composables, leaf components, i18n messages, and data modules needed by both session pages exist in the Nuxt project as Phase 22–24 deliverables.

The defining architectural constraint is the **dueCards snapshot pattern**: `dueCards` must be snapshotted as a `ref` inside `onMounted`, never as a `computed`. If `dueCards` were computed, each card graded during a session would immediately update SRS progress, which can alter the due list and skip (or include) cards mid-session. Both source sessions implement this with React's `useState(() => ...)` initializer — the Vue equivalent is `ref([...])` set inside `onMounted`. The snapshot must capture the full list before any grading begins.

The second constraint is **`<ClientOnly>` wrapping**: both session pages access `localStorage`, `window.speechSynthesis`, and `SpeechRecognition`. These APIs are unavailable during server-side rendering. The Next.js source handles this with `'use client'` and a `NoSSR` wrapper component. In Nuxt, the correct equivalent is wrapping the entire page content in `<ClientOnly>`, which prevents the inner template from rendering on the server at all. All four composables (`useSRS`, `useLevelFilter`, `useQASRS`, `useVoiceRecognition`) already guard their own initialization with `onMounted`, but the session-level state (`dueCards`, `index`, `flipped`, `done`) still benefits from `<ClientOnly>` to avoid hydration mismatch warnings.

**Primary recommendation:** Implement both session pages as full Vue page SFCs using `<script setup>`, wrap the entire template body in `<ClientOnly>`, snapshot dueCards in `onMounted` as a `ref`, and port all interaction logic (flip, choice click, mic press, handleAnswer, resetSession) verbatim from the source React components, replacing React state setters with Vue `ref` mutations. No new packages are required.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-06 | Rephrase StudySession — full Leitner flip/grade/advance, `dueCards` snapshotted as `ref` in `onMounted`, voice recognition, TTS audio, deck-done and all-done end screens; wrapped in `<ClientOnly>` | Full source in `src/app/[lang]/rephrase/[deck]/StudySession.tsx`; all composables and leaf components confirmed present; snapshot pattern understood |
| UI-07 | Q&A StudySession — 4-choice interaction, `useQASRS`, TTS audio, voice recognition, correct/incorrect feedback, scenario-done and all-done screens; wrapped in `<ClientOnly>` | Full source in `src/app/[lang]/qa/[scenario]/QAStudySession.tsx`; Fisher-Yates shuffle, lang-keyed text fields, all-scenarios-done check logic understood |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 `<script setup>` | Nuxt 4 bundled | SFC authoring; reactive `ref`, `computed`, `onMounted`, `watch` | Established in Phases 22–24; all composables use this pattern |
| `<ClientOnly>` | Nuxt 4 built-in | Prevents SSR rendering of browser-only content | Official Nuxt pattern; replaces Next.js `dynamic(..., { ssr: false })` |
| `useSRS` | app/composables/useSRS.ts | SRS progress, `updateCard`, `isCardDueForDeck`, `hasProgress` | Phase 22 deliverable; confirmed API matches session needs |
| `useLevelFilter` | app/composables/useLevelFilter.ts | Active A1/A2 filter at session start | Phase 22 deliverable; `activeLevels` is `Ref<Level[] \| null>` |
| `useVoiceRecognition` | app/composables/useVoiceRecognition.ts | `startListening(onResult, onError)`, `isSupported`, `isListening` | Phase 22 deliverable; guards SpeechRecognition inside `onMounted` |
| `useQASRS` | app/composables/useQASRS.ts | Q&A SRS progress + `updateCard` per scenario | Phase 22 deliverable; `dueCards` is a computed — must be snapshotted in onMounted for Q&A session |
| `AudioButton` | app/components/AudioButton.vue | TTS audio playback button; props: `phrase`, `lang` | Phase 23 deliverable; speaks via `window.speechSynthesis` with `import.meta.client` guard |
| `ChoiceButton` | app/components/ChoiceButton.vue | Quiz answer button; props: `text`, `state`, `disabled`; emits: `click`, `speak` | Phase 23 deliverable; handles correct/incorrect/idle states |
| `MicButton` | app/components/MicButton.vue | Voice recognition trigger; props: `state`; emits: `press` | Phase 23 deliverable; states: idle/listening/error |
| `FeedbackMessage` | app/components/FeedbackMessage.vue | Feedback overlay; props: `state` (correct/incorrect/heard/notRecognized/null) | Phase 23 deliverable |
| `useI18n` | @nuxtjs/i18n | Translation access; `study.*` key namespace | Phase 23 confirmed; all study-namespace keys present in messages/it.json and es.json |
| `NuxtLinkLocale` | @nuxtjs/i18n | Back-link navigation to `/rephrase` or `/qa` | Phase 23–24 confirmed pattern |
| `generateChoices` | app/lib/generateChoices.ts | Generates 4 choices (1 correct + 3 foils) for Rephrase back-of-card quiz | Phase 21 deliverable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useRoute` | Nuxt/Vue Router auto-import | Access `route.params.deck` and `route.params.scenario` | Required in session pages to identify which deck/scenario is being studied |
| `~/data/decks` | app/data/decks.ts (mirror) | `deckMetadata` for all-decks-done check in Rephrase | Phase 24 created `app/data/decks.ts` mirror; use `~/data/decks` |
| `~/data/deckMap` | app/data/deckMap.ts (mirror) | `DECK_MAP` to load deck cards by lang+deckId | Phase 24 created `app/data/deckMap.ts` mirror; use `~/data/deckMap` |
| `../../../src/data/qa` | src/data/qa/index.ts | `scenarios` array for all-scenarios-done check | ScenarioGrid already imports from this path; same pattern applies |
| `isCardDue` | app/lib/srs.ts | Used in all-decks-done check to evaluate cards against live progress | Phase 21 deliverable; pure function |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `<ClientOnly>` wrapping | `onMounted` guards only | onMounted guards prevent crashes but don't prevent hydration mismatch warnings; `<ClientOnly>` is the correct Nuxt pattern for browser-only pages |
| Snapshotting dueCards in `onMounted` | Using `computed` for dueCards | `computed` causes mid-session card skipping as each graded card immediately leaves the due list — documented pitfall in STATE.md |
| App-level `speak()` function | Relying solely on `AudioButton` | AudioButton handles question/phrase audio. The Rephrase back-of-card choice buttons need per-choice `speak()` via ChoiceButton `@speak` emit. A local `speak(phrase, lang)` helper is needed in the session page (not a new component) |

**Installation:** No new packages — all dependencies satisfied by Phases 20–24.

## Architecture Patterns

### Recommended Project Structure
```
app/pages/
├── rephrase/
│   └── [deck].vue          # Rephrase StudySession page (UI-06)
└── qa/
    └── [scenario].vue      # Q&A StudySession page (UI-07)

tests/nuxt/
├── RephraseSession.test.ts  # Wave 0 stubs (new)
└── QASession.test.ts        # Wave 0 stubs (new)
```

Both session pages replace the existing placeholder files (`app/pages/rephrase/[deck].vue` and `app/pages/qa/[scenario].vue`) which currently render trivial placeholder text.

### Pattern 1: ClientOnly Wrapping with onMounted Snapshot (UI-06 and UI-07)

**What:** The entire interactive session is nested inside `<ClientOnly>`. Inside `onMounted`, read `activeLevels.value` and `isCardDueForDeck` (or `useQASRS.dueCards.value`) to snapshot the session's due card list into a `ref`. This ref is stable for the life of the session.

**When to use:** Any page that reads localStorage or uses browser APIs at the top level of its logic.

```vue
<!-- app/pages/rephrase/[deck].vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DECK_MAP } from '~/data/deckMap'
import { deckMetadata } from '~/data/decks'
import { isCardDue } from '~/lib/srs'
import type { Card, DeckId, Lang } from '~/types'

const route = useRoute()
const { locale } = useI18n()
const lang = locale.value as Lang
const deckId = route.params.deck as DeckId
const cards: Card[] = DECK_MAP[lang]?.[deckId] ?? []

const { isCardDueForDeck, updateCard, hasProgress } = useSRS(lang)
const { activeLevels } = useLevelFilter(lang, hasProgress)
const { isSupported, isListening, startListening } = useVoiceRecognition(lang)

// Session state — initialized to empty; set in onMounted after composables load
type DueEntry = { originalIndex: number; card: Card }
const dueCards = ref<DueEntry[]>([])
const index = ref(0)
const flipped = ref(false)
const done = ref(false)
const allDone = ref(false)
const selectedChoice = ref<number | null>(null)
const micState = ref<'idle' | 'listening' | 'error'>('idle')
const feedbackState = ref<'correct' | 'incorrect' | 'heard' | 'notRecognized' | null>(null)

onMounted(() => {
  // Snapshot due cards ONCE — prevents mid-session skipping as SRS updates
  const levels = activeLevels.value ?? ['A1']
  dueCards.value = cards
    .map((card, i) => ({ originalIndex: i, card }))
    .filter(({ card, originalIndex }) =>
      levels.includes(card.level) && isCardDueForDeck(deckId, originalIndex)
    )
})
</script>

<template>
  <ClientOnly>
    <!-- session UI renders only client-side -->
    <div v-if="allDone || dueCards.length === 0"><!-- all-done screen --></div>
    <div v-else-if="done"><!-- deck-done screen --></div>
    <div v-else><!-- active session card --></div>
  </ClientOnly>
</template>
```

Source: `src/app/[lang]/rephrase/[deck]/StudySession.tsx` — direct Vue translation.

### Pattern 2: Q&A Session dueCards Snapshot

**What:** For the Q&A session, `useQASRS` exposes a `dueCards` computed that filters `scenario.cards` by `activeLevels` and SRS due state. The session must snapshot this computed's value in `onMounted`.

**Critical difference from Rephrase:** In the Rephrase session, `dueCards` is built manually from `isCardDueForDeck` calls in `onMounted`. In the Q&A session, `useQASRS.dueCards` is a Vue `computed` that returns `QACard[]` (not `DueEntry[]` with originalIndex). Q&A cards use `card.id` (string) as the SRS key, not positional index — so no originalIndex mapping is needed.

```vue
<!-- app/pages/qa/[scenario].vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { scenarios } from '../../../src/data/qa'
import { isCardDue } from '~/lib/srs'
import type { Lang, Level, QACard, ScenarioId, ProgressRecord } from '~/types'

const route = useRoute()
const { locale } = useI18n()
const lang = locale.value as Lang
const scenarioId = route.params.scenario as ScenarioId
const scenario = scenarios.find(s => s.id === scenarioId)!

const { progress, hasProgress } = useSRS(lang)
const { activeLevels } = useLevelFilter(lang, hasProgress)
const { dueCards: qaComputedDue, updateCard } = useQASRS(
  lang, scenarioId, scenario.cards, activeLevels.value ?? ['A1']
)
const { isSupported, isListening, startListening } = useVoiceRecognition(lang)

const sessionDueCards = ref<QACard[]>([])
const index = ref(0)
// ... other state refs

onMounted(() => {
  // Snapshot dueCards.value from the computed — stable for session lifetime
  sessionDueCards.value = [...qaComputedDue.value]
})
</script>
```

**Note on activeLevels capture in useQASRS:** `useQASRS` takes `activeLevels: Level[]` as a plain array (confirmed from `app/composables/useQASRS.ts`). At setup time, `activeLevels.value` is `null` (SSR-safe default before `onMounted`). The workaround used in the Q&A source: bootstrap hasProgress from localStorage before calling `useLevelFilter`, so `activeLevels` is initialized by the time `onMounted` runs. The Vue equivalent: pass `activeLevels.value ?? ['A1']` at setup time and accept that `useQASRS.dueCards` may be slightly stale until `onMounted` fires — snapshotting inside `onMounted` corrects this because by then `activeLevels` has been set from localStorage.

### Pattern 3: handleAnswer — All-Done Check

Both sessions check, after the last card in a deck/scenario, whether all other decks/scenarios are also exhausted. This requires reading **live** (post-grade) progress state, not the stale snapshot.

**Rephrase all-done check** (`src/app/[lang]/rephrase/[deck]/StudySession.tsx` lines 198–212):
- Iterates `deckMetadata.filter(d => d.lang === lang)` (all decks for the language)
- For each deck, gets cards from `DECK_MAP[lang][id]`
- Filters by `activeLevels`, calls `isCardDueForDeck(id, i)` on each
- If ALL decks have zero due cards: `allDone = true`; else `done = true`

**Q&A all-done check** (`src/app/[lang]/qa/[scenario]/QAStudySession.tsx` lines 167–170):
- Iterates `allScenarios` (the full `scenarios` array from `src/data/qa`)
- For each scenario: checks `isScenarioHasDue(progress, sc.id, sc.cards, activeLevels)`
- `isScenarioHasDue` uses raw `progress` ProgressRecord and `isCardDue` directly
- If ANY scenario has due cards: `done = true`; else `allDone = true`

Both checks use live `progress.value` (the ref that was just updated by `updateCard`) — this is reactive at call time because `updateCard` mutates the `progress` ref synchronously.

### Pattern 4: speak() Helper (Local to Session Pages)

Both source sessions define a local `speak(phrase, lang)` function that:
1. Guards `typeof window === 'undefined'` — in Vue: `if (!import.meta.client) return`
2. Cancels any current speech: `window.speechSynthesis.cancel()`
3. Creates `SpeechSynthesisUtterance` with `lang = LANG_LOCALE[lang]` and `rate = 0.9`
4. Finds best matching voice: `voices.filter(v => v.lang.startsWith(lang))`
5. Calls `window.speechSynthesis.speak(utterance)`

This function is used for `ChoiceButton @speak` events (speaking individual choice text). `AudioButton` already handles its own TTS for the question/front phrase — the local `speak()` is only needed for the choice buttons.

Note: STATE.md records DEBT-01 (speak() is duplicated in AudioButton.vue and StudySession). This is a known tech debt item deferred to post-v2.0. Do not extract to a shared module in this phase.

```typescript
// Source: src/app/[lang]/rephrase/[deck]/StudySession.tsx lines 25–36
const LANG_LOCALE: Record<Lang, string> = { it: 'it-IT', es: 'es-ES' }

function speak(phrase: string, lang: Lang) {
  if (!import.meta.client || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(phrase)
  utterance.lang = LANG_LOCALE[lang]
  utterance.rate = 0.9
  const voices = window.speechSynthesis.getVoices()
  const matching = voices.filter(v => v.lang.startsWith(lang))
  const exact = matching.find(v => v.lang === LANG_LOCALE[lang])
  utterance.voice = exact ?? matching[0] ?? null
  window.speechSynthesis.speak(utterance)
}
```

### Pattern 5: Rephrase Flip / Choice Flow

The Rephrase session has two distinct sides of the card:

**Front (question side):**
- Shows `currentCard.front` (target language phrase)
- Has `AudioButton` for TTS
- Has `MicButton` if `isSupported` — clicking it starts recognition; if transcript matches `currentCard.front` (normalized), flips card and sets `feedbackState = 'heard'`
- Clicking anywhere on card container flips it

**Back (answer side, flipped=true):**
- Shows 4 `ChoiceButton` items generated by `generateChoices(currentCard, filteredCards)`
- `filteredCards` = `cards.filter(card => activeLevels.includes(card.level))` — stable for session
- `handleChoiceClick(i)`: sets `selectedChoice`, sets `feedbackState`, then calls `handleAnswer(isCorrect)` after 600ms timeout
- Has `MicButton` — transcript matched to choices; if match found, triggers `handleChoiceClick(matchedIndex)`
- Manual "Flip" and "Next" buttons: flip resets `flipped=false`; Next calls `handleAnswer(true)` (always correct when user clicks Next manually)

### Pattern 6: Q&A Choice Construction and Shuffle

```typescript
// Source: src/app/[lang]/qa/[scenario]/QAStudySession.tsx lines 37–44, 130–138
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// choices built per card change — recomputed when currentCard changes
const choices = computed(() => {
  if (!currentCard.value) return []
  const correctText = lang === 'it' ? currentCard.value.correct : currentCard.value.correctEs
  const foilTexts = lang === 'it' ? [...currentCard.value.foils] : [...currentCard.value.foilsEs]
  return shuffle([
    { text: correctText, isCorrect: true },
    ...foilTexts.map(f => ({ text: f, isCorrect: false })),
  ])
})
```

In Vue, `useMemo` → `computed`. `choices` can be a `computed` (not a session snapshot) because it only depends on which card is current — it does not drive session flow by itself.

**Q&A wrong-answer behavior** (differs from Rephrase): When user picks an incorrect answer, `selectedChoice` and `feedbackState` are reset after 800ms so the user can retry the same card. The card is NOT advanced and `updateCard` is NOT called. Only a correct answer advances to the next card.

### Anti-Patterns to Avoid

- **`dueCards` as `computed`:** Causes mid-session card skipping. Every card graded updates SRS progress, which changes the computed due list, shifting indices mid-session. Always snapshot as `ref` in `onMounted`.
- **Omitting `<ClientOnly>`:** Causes hydration mismatch warnings in `nuxi generate` output. The `onMounted` guards in composables prevent crashes but don't prevent the mismatch when the server renders empty state and the client renders filled state.
- **Calling `useRoute()` for lang (instead of `useI18n().locale`):** The lang comes from `@nuxtjs/i18n` locale routing, not a manual route param. `route.params.deck` and `route.params.scenario` are correct for the deck/scenario slug; lang should come from `useI18n().locale`.
- **Passing `activeLevels.value` to `useQASRS` without null coalescing:** `activeLevels.value` is `null` until `onMounted`. Pass `activeLevels.value ?? ['A1']` at call time to avoid type errors.
- **Reading `dueCards` (session ref) after `onMounted` mutation as a computed:** `sessionDueCards` must be a `ref` set in `onMounted`, not derived via `computed` from any reactive source.
- **Using `window.speechSynthesis` outside `import.meta.client` guard:** Causes SSR crash. `AudioButton.vue` already has this guard; the local `speak()` function in session pages must replicate it.
- **Calling composables outside `<script setup>`:** All composable calls (`useSRS`, `useLevelFilter`, `useVoiceRecognition`, `useQASRS`) must be at the top level of `<script setup>`, never inside `onMounted` or conditional blocks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SRS card grading | Custom box/date logic | `updateCard` from `useSRS` or `useQASRS` | Already implemented, tested, matches v1.1 localStorage format |
| Due card filtering | Manual localStorage scan | `isCardDueForDeck` (Rephrase) or `useQASRS.dueCards` (Q&A) | Composables handle reactive progress tracking and date comparison |
| Voice recognition lifecycle | Manual `SpeechRecognition` instantiation | `useVoiceRecognition` composable | Handles start/stop, error states, `onUnmounted` cleanup |
| 4-choice generation for Rephrase | Manual foil selection | `generateChoices(card, filteredCards)` from `~/lib/generateChoices` | Tested pure function; handles edge cases (fewer than 4 cards) |
| Fisher-Yates shuffle for Q&A choices | `Math.random()` sort | Local `shuffle<T>` function (copy from source) | One-liner `sort(() => Math.random() - 0.5)` is statistically biased; use the Fisher-Yates implementation from the source |
| Locale-aware back navigation | `<a href="/it/rephrase">` | `<NuxtLinkLocale to="/rephrase">` | Auto-prefixes current locale; no hardcoded lang prefix |
| i18n string lookup | Hardcoded strings | `useI18n().t('study.*')` | All required keys exist in messages/it.json and messages/es.json |

**Key insight:** The session interaction model (flip, choice click, mic press, handleAnswer, resetSession, all-done check) is complex enough that the v1.3 source is the specification. The Vue port is a translation, not a redesign.

## Common Pitfalls

### Pitfall 1: dueCards as computed causes mid-session skipping
**What goes wrong:** Cards are skipped or the session ends early. After grading card N, the computed re-runs. If card N is now not due (SRS moved it out), the computed list shrinks and `index` points to the wrong card or exceeds the new length.
**Why it happens:** `updateCard` mutates `progress.value` synchronously. Any `computed` that reads `progress.value` immediately re-evaluates.
**How to avoid:** Snapshot dueCards as `ref([...])` inside `onMounted`. Never use `computed` for the session's card list. This is documented in STATE.md "Critical Pitfalls to Avoid" item 5.
**Warning signs:** Session appears to skip cards or ends after 1–2 cards when more were due.

### Pitfall 2: `<ClientOnly>` omission causes hydration mismatch
**What goes wrong:** `nuxi generate` output produces pages that show hydration mismatch warnings in the browser console when loaded from `.output/public/`. The session interactive state (index, flipped, done) is computed client-side but the server renders a static empty state.
**Why it happens:** Without `<ClientOnly>`, Nuxt tries to match server-rendered HTML with client-hydrated HTML. Since `onMounted` only runs client-side, the DOM diverges.
**How to avoid:** Wrap the entire `<template>` body in `<ClientOnly>`. Can include a `<template #fallback>` with a loading spinner if desired.
**Warning signs:** Browser console shows "[Vue warn]: Hydration mismatch" for session routes.

### Pitfall 3: activeLevels null at setup time for useQASRS
**What goes wrong:** `useQASRS(lang, scenarioId, scenario.cards, activeLevels.value)` called with `null` as `activeLevels` at setup time (before `onMounted`). TypeScript may error; runtime uses `null` as the filter, showing 0 cards.
**Why it happens:** `useLevelFilter` initializes `activeLevels = ref<Level[] | null>(null)` and only sets it in `onMounted`.
**How to avoid:** Pass `activeLevels.value ?? ['A1']` as the fourth argument. The Q&A session snapshots `dueCards` in `onMounted` anyway, by which point `activeLevels.value` has been set — the snapshot corrects any stale filter.
**Warning signs:** Q&A session shows 0 cards due even for new users.

### Pitfall 4: Data import path for qa/scenarios
**What goes wrong:** `import { scenarios } from '~/data/qa'` fails because `app/data/` only contains `decks.ts` and `deckMap.ts` mirrors — no `qa/` mirror exists.
**Why it happens:** Only deck data was mirrored in Phase 24. The `src/data/qa/index.ts` barrel imports individual scenario files using `@/types` which resolves to `app/types` (works), but the barrel file itself is in `src/data/qa/`, not `app/data/qa/`.
**How to avoid:** Import from the relative path `'../../../src/data/qa'` (from `app/pages/qa/[scenario].vue`). This mirrors what `app/pages/qa/index.vue` does (`import { scenarios } from '../../../src/data/qa'` — confirmed from Phase 24 ScenarioGrid implementation).
**Warning signs:** `Cannot find module '~/data/qa'` at build time.

### Pitfall 5: Rephrase deck data import (use app/data mirrors)
**What goes wrong:** Importing `from '~/data/deckMap'` or `from '~/data/decks'` fails if `app/data/decks.ts` or `app/data/deckMap.ts` doesn't exist.
**What's actually true:** Phase 24 created `app/data/decks.ts` and `app/data/deckMap.ts` as Nuxt-compatible mirrors. Use `~/data/decks` and `~/data/deckMap` — these resolve to `app/data/decks.ts` and `app/data/deckMap.ts` respectively, which already work in the Nuxt context.
**Warning signs:** `Cannot find module '@/data/deckMap'` or "DECK_MAP is undefined" at runtime.

### Pitfall 6: normalize() function needed for mic matching
**What goes wrong:** Voice recognition transcript `"ciao."` doesn't match `"Ciao"` because of case and punctuation differences.
**Why it happens:** `SpeechRecognition` returns raw text; card content includes punctuation and mixed case.
**How to avoid:** Use the normalize function from the source:
```typescript
const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:'"¿¡]+$/g, '').trim()
```
Apply to both the transcript and the target string before comparison.

### Pitfall 7: Wrong answer handling differs between Rephrase and Q&A
**What goes wrong:** Q&A session advances to next card on wrong answer (incorrectly porting Rephrase behavior).
**Why it happens:** Rephrase calls `handleAnswer(isCorrect)` regardless on choice click (with 600ms delay). Q&A resets UI after 800ms on wrong answer — the card is NOT advanced.
**Rephrase:** Any choice click eventually calls `handleAnswer(isCorrect)` — SRS is updated with the actual result, then moves to next card.
**Q&A:** Wrong answer → reset UI for retry. `handleAnswer(true)` is only called for correct answers. SRS is updated only on correct.
**Warning signs:** Q&A session advances to next card even when user picks a wrong answer.

## Code Examples

### Verified: ClientOnly pattern from Nuxt docs
```vue
<!-- Source: Nuxt 4 official pattern; equivalent to Next.js 'use client' + dynamic(ssr:false) -->
<template>
  <ClientOnly>
    <div><!-- browser-only content --></div>
    <template #fallback>
      <p>Loading...</p>
    </template>
  </ClientOnly>
</template>
```

### Verified: dueCards snapshot pattern (from confirmed STATE.md pitfall)
```typescript
// Source: STATE.md "Critical Pitfalls to Avoid" item 5
// WRONG: dueCards as computed
const dueCards = computed(() => cards.filter(...)) // causes skipping

// CORRECT: snapshot as ref in onMounted
const dueCards = ref<DueEntry[]>([])
onMounted(() => {
  dueCards.value = cards
    .map((card, i) => ({ originalIndex: i, card }))
    .filter(({ card, originalIndex }) =>
      activeLevels.value!.includes(card.level) && isCardDueForDeck(deckId, originalIndex)
    )
})
```

### Verified: useVoiceRecognition API from app/composables/useVoiceRecognition.ts
```typescript
// Returns: { isSupported: Ref<boolean>, isListening: Ref<boolean>, startListening, stopListening }
const { isSupported, isListening, startListening } = useVoiceRecognition(lang)

startListening(
  (transcript: string) => {
    // called with recognized text
  },
  () => {
    // called on recognition error
  }
)
```

### Verified: generateChoices API from app/lib/generateChoices.ts
```typescript
// Source: app/lib/generateChoices.ts (Phase 21 deliverable)
// Returns: Array<{ text: string; isCorrect: boolean }> — 4 items (1 correct + 3 foils)
import { generateChoices } from '~/lib/generateChoices'

const choices = computed(() =>
  currentEntry.value
    ? generateChoices(currentEntry.value.card, filteredCards)
    : []
)
```

### Verified: i18n study namespace keys (from messages/it.json)
```
study.tapToReveal      — "Tocca per rivelare"
study.correct          — "Corretto"
study.incorrect        — "Sbagliato"
study.flipButton       — "Gira"
study.nextButton       — "Prossimo"
study.allDone          — "Hai finito per oggi! Torna domani."
study.backToDecks      — "← Torna ai mazzi"
study.cardCounter      — "Scheda {current} di {total}"  (named params)
study.audio            — "Ascolta"
study.heard            — "Sentito"
study.notRecognized    — "Non riconosciuto"
study.deckComplete     — "Mazzo completato!"
study.studyAgain       — "Studia ancora"
study.backToScenarios  — "← Torna agli scenari"
study.scenarioDone     — "Scenario completato!"
study.allScenariosDone — "Tutti gli scenari completati!"
```
All keys exist. `cardCounter` uses named params: `t('study.cardCounter', { current: index + 1, total: dueCards.length })`.

### Verified: ChoiceButton emit pattern (from app/components/ChoiceButton.vue)
```vue
<!-- Source: app/components/ChoiceButton.vue (Phase 23 deliverable) -->
<!-- emits: 'click' (no payload), 'speak' (no payload) -->
<ChoiceButton
  v-for="(choice, i) in choices"
  :key="i"
  :text="choice.text"
  :state="choiceState(i)"
  :disabled="selectedChoice !== null"
  @click="handleChoiceClick(i)"
  @speak="speak(choice.text, lang)"
/>
```

### Verified: Test pattern from existing nuxt tests
```typescript
// Source: tests/nuxt/DeckGrid.test.ts and useSRS.test.ts (established pattern)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'

describe('RephraseSession', () => {
  beforeEach(() => localStorage.clear())

  it('shows all-done when dueCards is empty', async () => {
    const { default: Page } = await import('../../app/pages/rephrase/[deck].vue')
    // mountSuspended triggers onMounted; localStorage is clear so dueCards = []
    const wrapper = await mountSuspended(Page)
    // test assertions
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js `dynamic(() => import('./StudySession'), { ssr: false })` | Nuxt `<ClientOnly>` wrapper | Phase 25 (new) | Direct equivalent; prevents server rendering of browser-only content |
| React `useState(() => dueCards)` initializer for snapshot | Vue `ref([])` + `onMounted(() => { dueCards.value = [...] })` | Phase 25 (new) | Same semantics: computed once at mount, stable for session lifetime |
| React `useMemo([currentCard])` for choices | Vue `computed(() => ...)` depending on `currentCard` | Phase 25 (new) | Equivalent reactive caching |
| Next.js `useParams()` for deck/scenario slug | Nuxt `useRoute().params.deck` / `.params.scenario` | Phase 25 (new) | Different API; same result |
| Next.js `useTranslations('study')` | Nuxt `useI18n().t('study.*')` with dot notation | Phase 23 established | Dotted key path format confirmed working |

## Open Questions

1. **Wave 0 test scope for session pages**
   - What we know: Session pages are complex (flip state, choice selection, mic state, end screens). Full interaction testing in a jsdom environment requires careful mocking of composables that use `onMounted` and browser APIs.
   - What's unclear: How much to test in Wave 0 stubs vs. implementation-time tests. The v1.3 StudySession.test.tsx has 20+ test cases using extensive module mocking.
   - Recommendation: Wave 0 stubs should cover: (a) all-done screen renders when localStorage is empty, (b) progress bar/counter element exists when cards are due, (c) `<ClientOnly>` wrapper is present. Full interaction tests (choice click, mic press, handleAnswer, end screens) can be Wave 1 tests written alongside implementation.

2. **Q&A session activeLevels bootstrap**
   - What we know: The v1.3 source QAStudySession.tsx bootstraps `hasProgress` from localStorage before calling `useLevelFilter` to ensure the correct default levels on first render. The Vue composables use `onMounted` for this initialization.
   - What's unclear: Whether the same bootstrapping is needed in Vue since `onMounted` runs before `dueCards` is snapshotted (the snapshot itself is in `onMounted`).
   - Recommendation: In Vue, the natural sequencing of `onMounted` callbacks (composable `onMounted` fires before page-level `onMounted` in most cases, but order is not guaranteed within the same component) means snapshotting `dueCards.value` from `useQASRS.dueCards.value` inside `onMounted` is correct because `useQASRS` also populates `progress` in its own `onMounted`. The planner should sequence the snapshot to read `activeLevels.value` after it has been set by `useLevelFilter`'s `onMounted`. Using `nextTick()` or simply reading `activeLevels.value` (which will be set by then in the same flush) should work.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @nuxt/test-utils |
| Config file | `vitest.config.ts` — `nuxt` project, `tests/nuxt/**/*.{test,spec}.ts` |
| Quick run command | `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` |
| Full suite command | `bun run vitest --project nuxt run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-06 | All-done screen renders when localStorage is empty (0 due cards) | unit | `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` | ❌ Wave 0 |
| UI-06 | Card counter and progress bar elements present when cards are due | unit | same file | ❌ Wave 0 |
| UI-06 | ClientOnly wrapper is present (SSR-safe) | unit | same file | ❌ Wave 0 |
| UI-06 | updateCard writes SRS progress to localStorage after grading | unit | same file | ❌ Wave 0 |
| UI-07 | All-done screen renders when localStorage is empty | unit | `bun run vitest --project nuxt run tests/nuxt/QASession.test.ts` | ❌ Wave 0 |
| UI-07 | Question text and 4 choice buttons render when cards are due | unit | same file | ❌ Wave 0 |
| UI-07 | ClientOnly wrapper is present | unit | same file | ❌ Wave 0 |
| UI-07 | Correct answer advances card; wrong answer resets for retry | unit | same file | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run vitest --project nuxt run tests/nuxt/RephraseSession.test.ts` or `tests/nuxt/QASession.test.ts`
- **Per wave merge:** `bun run vitest --project nuxt run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/nuxt/RephraseSession.test.ts` — covers UI-06 (Wave 0 stubs, RED phase)
- [ ] `tests/nuxt/QASession.test.ts` — covers UI-07 (Wave 0 stubs, RED phase)

*(Existing test infrastructure: `vitest.config.ts` nuxt project and `mountSuspended` are already configured and working from Phase 22. No framework installation needed.)*

## Sources

### Primary (HIGH confidence)
- `src/app/[lang]/rephrase/[deck]/StudySession.tsx` — full source of Rephrase session; read in full
- `src/app/[lang]/qa/[scenario]/QAStudySession.tsx` — full source of Q&A session; read in full
- `app/composables/useSRS.ts` — confirmed API: `{ isCardDueForDeck, updateCard, hasProgress, progress }`
- `app/composables/useLevelFilter.ts` — confirmed: `activeLevels: Ref<Level[] | null>`, null until `onMounted`
- `app/composables/useQASRS.ts` — confirmed: `dueCards` is `computed`, takes plain `Level[]` not `Ref`
- `app/composables/useVoiceRecognition.ts` — confirmed: `startListening(onResult, onError)`, `isSupported`, `isListening`
- `app/components/AudioButton.vue` — props: `phrase`, `lang`; handles its own TTS with `import.meta.client` guard
- `app/components/ChoiceButton.vue` — emits: `click`, `speak`; props: `text`, `state`, `disabled`
- `app/components/MicButton.vue` — emits: `press`; props: `state` (idle/listening/error)
- `app/components/FeedbackMessage.vue` — props: `state` (correct/incorrect/heard/notRecognized/null)
- `app/types/index.ts` — confirmed `QACard`, `Scenario`, `DeckId`, `ScenarioId`, `Lang`, `Level` types
- `app/data/decks.ts` — Phase 24 Nuxt-compatible mirror; `~/data/decks` resolves correctly
- `app/data/deckMap.ts` — Phase 24 Nuxt-compatible mirror; `~/data/deckMap` resolves correctly
- `app/pages/qa/index.vue` — confirmed: `scenarios` imported as `import { scenarios } from '../../../src/data/qa'`
- `messages/it.json` — all `study.*` i18n keys confirmed present
- `.planning/STATE.md` — dueCards pitfall (item 5), critical SSR pitfalls, Phase 24 decisions
- `tests/nuxt/DeckGrid.test.ts` — confirmed test pattern: `mountSuspended`, `localStorage.clear()` in `beforeEach`
- `vitest.config.ts` — nuxt project config confirmed; `tests/nuxt/**` glob pattern

### Secondary (MEDIUM confidence)
- `.planning/phases/24-browser-screens/24-03-SUMMARY.md` — `app/data/` mirror pattern confirmed; `~/data/decks` and `~/data/deckMap` work from pages

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies confirmed from existing codebase; no new packages
- Architecture: HIGH — full source files read; Vue translation patterns are deterministic; all APIs confirmed
- Pitfalls: HIGH — dueCards pitfall documented in STATE.md; ClientOnly requirement from v2.0 migration pattern; data import paths verified from Phase 24 implementation
- Q&A activeLevels bootstrap ordering: MEDIUM — onMounted sequencing in Vue is implementation-specific; recommendation given but may need nextTick adjustment during implementation

**Research date:** 2026-03-12
**Valid until:** Phase 25 completion (stable codebase; no external dependencies changing)
