# Q&A Scenarios Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Q&A conversation activity alongside the existing Rephrase activity, with an activity picker at `/{lang}`, scenario browser at `/{lang}/qa`, and full Leitner SRS tracking — all in the target language, no native language shown.

**Architecture:** New `QACard` / `Scenario` types and data files are added in parallel to existing `Card` / `Deck` data. A new `useQASRS` hook shares the `{lang}-progress` localStorage record (prefixed keys `qa_{scenarioId}_{cardId}`). A new `QAStudySession` component mirrors `StudySession` but takes `QACard[]` and uses pre-baked foils.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, next-intl, Vitest + React Testing Library, Web Speech API.

---

### Task 1: Add QACard, ScenarioId, ScenarioMeta types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add the new types**

Append to the end of `src/types/index.ts`:

```ts
export type ScenarioId =
  | 'caffe'
  | 'albergo'
  | 'ristorante'
  | 'strada'
  | 'negozio'
  | 'treno'
  | 'presentazioni';

export interface QACard {
  id: string;                        // unique within scenario, e.g. "caffe_01"
  question: string;                  // target language question
  correct: string;                   // target language correct response
  foils: [string, string, string];   // exactly 3 wrong responses, target language
  level: Level;
}

export interface ScenarioMeta {
  id: ScenarioId;
  icon: string;           // emoji, e.g. "☕"
  titleIt: string;        // Italian title, e.g. "Al Caffè"
  titleEs: string;        // Spanish title, e.g. "En el Café"
  cardCount: number;
}
```

**Step 2: Verify TypeScript compiles**

Run: `bun run build 2>&1 | head -20`
Expected: no new type errors

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(qa): add QACard, ScenarioId, ScenarioMeta types"
```

---

### Task 2: Add scenario metadata registry

**Files:**
- Create: `src/data/scenarios.ts`

**Step 1: Create the file**

```ts
// src/data/scenarios.ts
import type { ScenarioId, ScenarioMeta } from '@/types';

export const scenarioMetadata: ScenarioMeta[] = [
  { id: 'caffe',         icon: '☕',  titleIt: 'Al Caffè',           titleEs: 'En el Café',          cardCount: 5 },
  { id: 'albergo',       icon: '🏨',  titleIt: 'In Albergo',         titleEs: 'En el Hotel',         cardCount: 5 },
  { id: 'ristorante',    icon: '🍽️', titleIt: 'Al Ristorante',       titleEs: 'En el Restaurante',   cardCount: 5 },
  { id: 'strada',        icon: '🗺️', titleIt: 'Per Strada',          titleEs: 'En la Calle',         cardCount: 4 },
  { id: 'negozio',       icon: '🛍️', titleIt: 'Al Negozio',          titleEs: 'En la Tienda',        cardCount: 5 },
  { id: 'treno',         icon: '🚆',  titleIt: 'In Treno',            titleEs: 'En el Tren',          cardCount: 4 },
  { id: 'presentazioni', icon: '👋',  titleIt: 'Presentazioni',       titleEs: 'Presentaciones',      cardCount: 4 },
];

export const SCENARIO_IDS: ScenarioId[] = scenarioMetadata.map(s => s.id);
```

**Step 2: Verify build**

Run: `bun run build 2>&1 | head -20`
Expected: no errors

**Step 3: Commit**

```bash
git add src/data/scenarios.ts
git commit -m "feat(qa): add scenario metadata registry"
```

---

### Task 3: Add generateQAChoices lib (TDD)

**Files:**
- Create: `src/lib/generateQAChoices.ts`
- Create: `src/__tests__/lib/generateQAChoices.test.ts`

**Step 1: Write the failing tests**

```ts
// src/__tests__/lib/generateQAChoices.test.ts
import { describe, it, expect } from 'vitest';
import { generateQAChoices } from '@/lib/generateQAChoices';
import type { QACard } from '@/types';

const makeCard = (): QACard => ({
  id: 'test_01',
  question: 'Cosa desidera?',
  correct: 'Un caffè, per favore.',
  foils: ['Dov\'è il bagno?', 'Mi chiamo Luca.', 'A domani!'],
  level: 'A1',
});

describe('generateQAChoices', () => {
  it('returns exactly 4 choices', () => {
    expect(generateQAChoices(makeCard())).toHaveLength(4);
  });

  it('exactly one choice isCorrect', () => {
    const choices = generateQAChoices(makeCard());
    expect(choices.filter(c => c.isCorrect)).toHaveLength(1);
  });

  it('correct choice text matches card.correct', () => {
    const card = makeCard();
    const correct = generateQAChoices(card).find(c => c.isCorrect);
    expect(correct?.text).toBe(card.correct);
  });

  it('foil texts match card.foils', () => {
    const card = makeCard();
    const choices = generateQAChoices(card);
    const foilTexts = choices.filter(c => !c.isCorrect).map(c => c.text).sort();
    expect(foilTexts).toEqual([...card.foils].sort());
  });

  it('shuffles choices differently across calls (probabilistic)', () => {
    const card = makeCard();
    const orders = new Set(
      Array.from({ length: 20 }, () => generateQAChoices(card).map(c => c.text).join('|'))
    );
    // With 4 items there are 24 permutations — 20 calls should produce >1 unique order
    expect(orders.size).toBeGreaterThan(1);
  });
});
```

**Step 2: Run tests to confirm they fail**

Run: `bun run vitest run src/__tests__/lib/generateQAChoices.test.ts`
Expected: FAIL — "Cannot find module '@/lib/generateQAChoices'"

**Step 3: Implement generateQAChoices**

```ts
// src/lib/generateQAChoices.ts
import type { QACard } from '@/types';
import type { Choice } from './generateChoices';

// Re-use the Fisher-Yates shuffle from generateChoices (same pattern)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Returns 1 correct answer + 3 pre-baked foils, all shuffled.
 * Unlike generateChoices, foils are stored directly on QACard — no pool needed.
 */
export function generateQAChoices(card: QACard): Choice[] {
  const choices: Choice[] = [
    { text: card.correct, isCorrect: true },
    ...card.foils.map(f => ({ text: f, isCorrect: false })),
  ];
  return shuffleArray(choices);
}
```

**Step 4: Run tests to confirm they pass**

Run: `bun run vitest run src/__tests__/lib/generateQAChoices.test.ts`
Expected: PASS — 5 tests

**Step 5: Commit**

```bash
git add src/lib/generateQAChoices.ts src/__tests__/lib/generateQAChoices.test.ts
git commit -m "feat(qa): add generateQAChoices with tests"
```

---

### Task 4: Add useQASRS hook (TDD)

**Files:**
- Create: `src/hooks/useQASRS.ts`
- Create: `src/__tests__/hooks/useQASRS.test.tsx`

**Step 1: Write the failing tests**

```ts
// src/__tests__/hooks/useQASRS.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useQASRS } from '@/hooks/useQASRS';

beforeEach(() => localStorage.clear());

describe('useQASRS initial state', () => {
  it('starts with empty progress for a new user', () => {
    const { result } = renderHook(() => useQASRS('it'));
    expect(result.current.hasProgress).toBe(false);
  });

  it('isQACardDue returns true for a never-answered card', () => {
    const { result } = renderHook(() => useQASRS('it'));
    expect(result.current.isQACardDue('caffe', 'caffe_01')).toBe(true);
  });
});

describe('useQASRS updateQACard', () => {
  it('persists to the same {lang}-progress localStorage key as useSRS', () => {
    const { result } = renderHook(() => useQASRS('it'));
    act(() => { result.current.updateQACard('caffe', 'caffe_01', true); });
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['qa_caffe_caffe_01'].box).toBe(2);
    expect(stored['qa_caffe_caffe_01'].nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('updateQACard(correct=false) resets box to 1', () => {
    const { result } = renderHook(() => useQASRS('it'));
    act(() => { result.current.updateQACard('caffe', 'caffe_01', true); });  // box → 2
    act(() => { result.current.updateQACard('caffe', 'caffe_01', false); }); // box → 1
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}');
    expect(stored['qa_caffe_caffe_01'].box).toBe(1);
  });

  it('after updateQACard hasProgress becomes true', () => {
    const { result } = renderHook(() => useQASRS('it'));
    act(() => { result.current.updateQACard('caffe', 'caffe_01', true); });
    expect(result.current.hasProgress).toBe(true);
  });

  it('it-progress and es-progress are independent', () => {
    const { result: itHook } = renderHook(() => useQASRS('it'));
    const { result: esHook } = renderHook(() => useQASRS('es'));
    act(() => { itHook.current.updateQACard('caffe', 'caffe_01', true); });
    expect(esHook.current.hasProgress).toBe(false);
  });
});

describe('useQASRS isQACardDue', () => {
  it('returns false for a just-answered card (nextReview in future)', () => {
    const { result } = renderHook(() => useQASRS('it'));
    act(() => { result.current.updateQACard('caffe', 'caffe_01', true); });
    expect(result.current.isQACardDue('caffe', 'caffe_01')).toBe(false);
  });
});
```

**Step 2: Run to confirm failure**

Run: `bun run vitest run src/__tests__/hooks/useQASRS.test.tsx`
Expected: FAIL — "Cannot find module '@/hooks/useQASRS'"

**Step 3: Implement useQASRS**

```ts
// src/hooks/useQASRS.ts
// SRS hook for Q&A scenario cards.
// Uses the same {lang}-progress localStorage key as useSRS.
// Progress keys are prefixed: "qa_{scenarioId}_{cardId}"
'use client';
import { useState, useCallback } from 'react';
import type { Lang, ScenarioId, ProgressRecord } from '@/types';
import { advanceBox, isCardDue } from '@/lib/srs';

// Duplicated from useSRS — kept local to avoid modifying existing hook
function loadFromStorage(lang: Lang): ProgressRecord {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(`${lang}-progress`);
    return saved ? (JSON.parse(saved) as ProgressRecord) : {};
  } catch {
    return {};
  }
}

function saveToStorage(lang: Lang, record: ProgressRecord): void {
  try {
    localStorage.setItem(`${lang}-progress`, JSON.stringify(record));
  } catch {
    // localStorage unavailable — silent fail
  }
}

function getQAKey(scenarioId: ScenarioId, cardId: string): string {
  return `qa_${scenarioId}_${cardId}`;
}

export function useQASRS(lang: Lang) {
  const [progress, setProgress] = useState<ProgressRecord>(() => loadFromStorage(lang));

  const updateQACard = useCallback(
    (scenarioId: ScenarioId, cardId: string, isCorrect: boolean) => {
      setProgress(prev => {
        const key = getQAKey(scenarioId, cardId);
        const updated = { ...prev, [key]: advanceBox(prev[key], isCorrect) };
        saveToStorage(lang, updated);
        return updated;
      });
    },
    [lang]
  );

  const isQACardDue = useCallback(
    (scenarioId: ScenarioId, cardId: string): boolean => {
      const key = getQAKey(scenarioId, cardId);
      return isCardDue(progress[key]);
    },
    [progress]
  );

  const hasProgress = Object.keys(progress).length > 0;

  return { progress, updateQACard, isQACardDue, hasProgress };
}
```

**Step 4: Run tests to confirm pass**

Run: `bun run vitest run src/__tests__/hooks/useQASRS.test.tsx`
Expected: PASS — 7 tests

**Step 5: Commit**

```bash
git add src/hooks/useQASRS.ts src/__tests__/hooks/useQASRS.test.tsx
git commit -m "feat(qa): add useQASRS hook with tests"
```

---

### Task 5: Add Italian Q&A scenario content

**Files:**
- Create: `src/data/it/scenarios/caffe.ts`
- Create: `src/data/it/scenarios/albergo.ts`
- Create: `src/data/it/scenarios/ristorante.ts`
- Create: `src/data/it/scenarios/strada.ts`
- Create: `src/data/it/scenarios/negozio.ts`
- Create: `src/data/it/scenarios/treno.ts`
- Create: `src/data/it/scenarios/presentazioni.ts`
- Create: `src/data/it/scenarios/index.ts`

**Step 1: Create caffe.ts**

```ts
// src/data/it/scenarios/caffe.ts
import type { QACard } from '@/types';

export const caffeit: QACard[] = [
  { id: 'caffe_01', level: 'A1', question: 'Buongiorno! Cosa desidera?',              correct: 'Un cappuccino, per favore.',         foils: ["Dov'è il bagno?",              'Mi chiamo Luca.',         'A domani!']                          },
  { id: 'caffe_02', level: 'A1', question: 'Prende qualcosa da mangiare?',             correct: 'Sì, un cornetto, grazie.',           foils: ['No, sono americano.',          "Parlo un po' d'italiano.", 'A che ora apre?']                    },
  { id: 'caffe_03', level: 'A1', question: 'Tutto insieme o separato?',                correct: 'Tutto insieme, grazie.',             foils: ["Un bicchiere d'acqua.",         'Sono allergico al glutine.', 'È lontano da qui?']               },
  { id: 'caffe_04', level: 'A1', question: 'Il caffè è pronto. Vuole lo zucchero?',   correct: 'Sì, uno zucchero, grazie.',          foils: ['Devo andare alla stazione.',   'Costa troppo.',           'Sono le dieci.']                     },
  { id: 'caffe_05', level: 'A1', question: 'Si accomodi pure!',                        correct: 'Grazie, molto gentile.',             foils: ['Un biglietto per Roma.',       "Dov'è il museo?",         'Sono stanco.']                       },
];
```

**Step 2: Create albergo.ts**

```ts
// src/data/it/scenarios/albergo.ts
import type { QACard } from '@/types';

export const albergoit: QACard[] = [
  { id: 'albergo_01', level: 'A1', question: 'Buonasera. Ha una prenotazione?',       correct: 'Sì, a nome Johnson.',               foils: ['No, grazie, sto bene.',        'Vorrei un caffè.',          "Dov'è la stazione?"]               },
  { id: 'albergo_02', level: 'A1', question: 'Per quante notti?',                      correct: 'Per tre notti.',                     foils: ['Il bagno è in fondo al corridoio.', 'Siamo in due.',    'Alle nove di mattina.']              },
  { id: 'albergo_03', level: 'A1', question: 'Vuole una camera con vista sul mare?',  correct: 'Sì, se è possibile.',               foils: ['No, non ho prenotato.',        'Il ristorante è aperto?', 'Grazie, buona serata.']              },
  { id: 'albergo_04', level: 'A1', question: 'Il check-out è alle undici.',            correct: 'Va bene, grazie mille.',             foils: ['Vorrei prenotare un taxi.',    'Dove posso parcheggiare?', 'È compresa la colazione?']          },
  { id: 'albergo_05', level: 'A1', question: 'Desidera qualcosa per la colazione?',   correct: 'Sì, un cappuccino e dei cornetti.', foils: ['No, parto domani.',            'La camera non è pronta.', 'Sono allergico.']                    },
];
```

**Step 3: Create ristorante.ts**

```ts
// src/data/it/scenarios/ristorante.ts
import type { QACard } from '@/types';

export const ristoranteit: QACard[] = [
  { id: 'ristorante_01', level: 'A1', question: 'Cosa prende come primo?',          correct: 'Per me gli spaghetti al pomodoro.', foils: ['Il conto, per favore.',         'Sono senza glutine.',        'Due caffè, grazie.']                 },
  { id: 'ristorante_02', level: 'A1', question: 'Da bere?',                          correct: "Un'acqua frizzante e un calice di vino rosso.", foils: ['Molto bene, grazie.', 'La camera è al terzo piano.', 'Vado alla stazione.']             },
  { id: 'ristorante_03', level: 'A1', question: 'Come ha trovato il cibo?',          correct: 'Ottimo, davvero buono!',            foils: ['Alle otto di sera.',            'È la prima a destra.',       'Un biglietto di andata e ritorno.']  },
  { id: 'ristorante_04', level: 'A1', question: 'Posso portarle il dolce?',          correct: 'Sì, cosa avete?',                   foils: ['Il conto, per favore.',         'No, preferisco il pesce.',   "Dov'è il bagno?"]                    },
  { id: 'ristorante_05', level: 'A2', question: 'Vuole un altro po\' di vino?',       correct: "Sì, grazie, ancora un po'.",        foils: ['Sì, ho prenotato.',            'No, sono a dieta.',          'Il menu, per favore.']               },
];
```

**Step 4: Create strada.ts**

```ts
// src/data/it/scenarios/strada.ts
import type { QACard } from '@/types';

export const stradait: QACard[] = [
  { id: 'strada_01', level: 'A1', question: "Scusi, dov'è la stazione?",             correct: 'È sempre dritto, poi gira a sinistra.', foils: ['Sì, grazie mille!',           'Mi chiamo Anna.',            'Vorrei un biglietto.']               },
  { id: 'strada_02', level: 'A1', question: 'È lontano da qui?',                      correct: 'No, sono circa cinque minuti a piedi.', foils: ['Sono le tre.',                'Prendo un caffè.',           'Buonasera!']                         },
  { id: 'strada_03', level: 'A2', question: 'Come si arriva al museo?',               correct: 'Prenda la seconda a destra, poi dritto.', foils: ['Costa dieci euro.',          'Mi piace molto.',            'Alle otto di sera.']                 },
  { id: 'strada_04', level: 'A2', question: "C'è una farmacia vicino?",               correct: "Sì, è in fondo alla via, a sinistra.", foils: ['Certo, prego!',               'Non capisco.',               'Sono di Roma.']                      },
];
```

**Step 5: Create negozio.ts**

```ts
// src/data/it/scenarios/negozio.ts
import type { QACard } from '@/types';

export const negozioit: QACard[] = [
  { id: 'negozio_01', level: 'A2', question: 'Posso aiutarla?',                       correct: 'Sì, cerco una giacca.',              foils: ['No, sto aspettando il treno.', 'Sì, prenoto per due.',     'Il museo è chiuso oggi.']            },
  { id: 'negozio_02', level: 'A2', question: 'Che taglia porta?',                     correct: 'Porto la media.',                    foils: ['Costa troppo.',                'Sono le undici.',            'Un gelato al limone.']               },
  { id: 'negozio_03', level: 'A2', question: 'Come vuole pagare?',                    correct: 'Con la carta, grazie.',              foils: ['Ho fame.',                     "Dov'è la fermata dell'autobus?", 'Buongiorno!']                   },
  { id: 'negozio_04', level: 'A2', question: 'Abbiamo anche questo in rosso.',        correct: 'Posso provarlo?',                    foils: ['Quanto costa?',                'No, grazie, sto bene.',      "Dov'è la cassa?"]                    },
  { id: 'negozio_05', level: 'A2', question: 'Vuole lo scontrino?',                   correct: 'Sì, grazie.',                        foils: ['No, non ho fame.',             'A che ora chiude?',          'Sono le tre.']                       },
];
```

**Step 6: Create treno.ts**

```ts
// src/data/it/scenarios/treno.ts
import type { QACard } from '@/types';

export const trenoit: QACard[] = [
  { id: 'treno_01', level: 'A2', question: 'È libero questo posto?',                  correct: 'Sì, prego, si accomodi.',            foils: ['Il treno arriva alle tre.',    'Mi piace viaggiare.',        'Grazie, buon viaggio!']              },
  { id: 'treno_02', level: 'A2', question: 'Questo è il treno per Roma?',             correct: 'Sì, parte alle quindici e trenta.', foils: ['No, non ho il biglietto.',     'Mi chiamo Marco.',           'Prendo un caffè.']                   },
  { id: 'treno_03', level: 'A2', question: 'Ha il biglietto?',                        correct: 'Sì, eccolo.',                        foils: ['Sono americano.',              "Dov'è il bagno?",            'Arrivo domani.']                     },
  { id: 'treno_04', level: 'A2', question: 'A che ora arriviamo a Firenze?',          correct: 'Tra circa venti minuti.',            foils: ['È il terzo binario.',          'Ho fame.',                   'La stazione è grande.']              },
];
```

**Step 7: Create presentazioni.ts**

```ts
// src/data/it/scenarios/presentazioni.ts
import type { QACard } from '@/types';

export const presentazioniit: QACard[] = [
  { id: 'pres_01', level: 'A1', question: 'Come ti chiami?',                          correct: 'Mi chiamo Sara. E tu?',              foils: ['Ho venticinque anni.',         'Abito a Roma.',              'Sto bene, grazie.']                  },
  { id: 'pres_02', level: 'A1', question: "Da quanto tempo studi l'italiano?",        correct: 'Studio italiano da sei mesi.',       foils: ['Mi piace la pizza.',           'Abito al terzo piano.',      'Vengo domani.']                      },
  { id: 'pres_03', level: 'A1', question: 'Di dove sei?',                             correct: 'Sono americana, di New York.',       foils: ['Studio medicina.',             'Ho una sorella.',            'Parlo inglese.']                     },
  { id: 'pres_04', level: 'A2', question: 'Parli altre lingue?',                      correct: 'Parlo inglese e un po\' di francese.', foils: ['Ho ventotto anni.',          'Lavoro in centro.',          'Mi piace molto.']                    },
];
```

**Step 8: Create the scenarios index**

```ts
// src/data/it/scenarios/index.ts
export { caffeit }          from './caffe';
export { albergoit }        from './albergo';
export { ristoranteit }     from './ristorante';
export { stradait }         from './strada';
export { negozioit }        from './negozio';
export { trenoit }          from './treno';
export { presentazioniit }  from './presentazioni';
```

**Step 9: Verify TypeScript**

Run: `bun run build 2>&1 | head -20`
Expected: no errors

**Step 10: Commit**

```bash
git add src/data/it/scenarios/
git commit -m "feat(qa): add Italian Q&A scenario content (7 scenarios)"
```

---

### Task 6: Add Spanish Q&A scenario content

**Files:**
- Create: `src/data/es/scenarios/caffe.ts`
- Create: `src/data/es/scenarios/albergo.ts`
- Create: `src/data/es/scenarios/ristorante.ts`
- Create: `src/data/es/scenarios/strada.ts`
- Create: `src/data/es/scenarios/negozio.ts`
- Create: `src/data/es/scenarios/treno.ts`
- Create: `src/data/es/scenarios/presentazioni.ts`
- Create: `src/data/es/scenarios/index.ts`

**Step 1: Create caffe.ts (Spanish)**

```ts
// src/data/es/scenarios/caffe.ts
import type { QACard } from '@/types';

export const caffees: QACard[] = [
  { id: 'caffe_01', level: 'A1', question: '¡Buenos días! ¿Qué desea?',               correct: 'Un café con leche, por favor.',      foils: ['¿Dónde está el baño?',         'Me llamo Carlos.',           '¡Hasta mañana!']                     },
  { id: 'caffe_02', level: 'A1', question: '¿Toma algo de comer?',                     correct: 'Sí, una tostada, gracias.',          foils: ['No, soy americano.',           'Hablo un poco de español.',  '¿A qué hora abre?']                  },
  { id: 'caffe_03', level: 'A1', question: '¿Todo junto o separado?',                  correct: 'Todo junto, gracias.',               foils: ['Un vaso de agua.',             'Soy alérgico al gluten.',    '¿Está lejos de aquí?']               },
  { id: 'caffe_04', level: 'A1', question: 'El café está listo. ¿Quiere azúcar?',     correct: 'Sí, un azúcar, gracias.',            foils: ['Tengo que ir a la estación.',  'Es demasiado caro.',         'Son las diez.']                      },
  { id: 'caffe_05', level: 'A1', question: '¡Siéntese, por favor!',                    correct: 'Gracias, muy amable.',               foils: ['Un billete para Madrid.',      '¿Dónde está el museo?',      'Estoy cansado.']                     },
];
```

**Step 2: Create albergo.ts (Spanish)**

```ts
// src/data/es/scenarios/albergo.ts
import type { QACard } from '@/types';

export const albergoes: QACard[] = [
  { id: 'albergo_01', level: 'A1', question: 'Buenas tardes. ¿Tiene reserva?',        correct: 'Sí, a nombre de Johnson.',          foils: ['No, gracias, estoy bien.',     'Quiero un café.',            '¿Dónde está la estación?']           },
  { id: 'albergo_02', level: 'A1', question: '¿Para cuántas noches?',                  correct: 'Para tres noches.',                  foils: ['El baño está al fondo del pasillo.', 'Somos dos.',         'A las nueve de la mañana.']          },
  { id: 'albergo_03', level: 'A1', question: '¿Quiere una habitación con vista al mar?', correct: 'Sí, si es posible.',              foils: ['No, no he reservado.',         '¿El restaurante está abierto?', 'Gracias, buenas noches.']          },
  { id: 'albergo_04', level: 'A1', question: 'El check-out es a las once.',            correct: 'Está bien, muchas gracias.',         foils: ['Quisiera reservar un taxi.',   '¿Dónde puedo aparcar?',      '¿Está incluido el desayuno?']        },
  { id: 'albergo_05', level: 'A1', question: '¿Desea algo para el desayuno?',          correct: 'Sí, un café con leche y unas tostadas.', foils: ['No, me voy mañana.',       'La habitación no está lista.', 'Soy alérgico.']                  },
];
```

**Step 3: Create ristorante.ts (Spanish)**

```ts
// src/data/es/scenarios/ristorante.ts
import type { QACard } from '@/types';

export const ristorantees: QACard[] = [
  { id: 'ristorante_01', level: 'A1', question: '¿Qué va a tomar de primero?',       correct: 'Para mí, los espaguetis con tomate.', foils: ['La cuenta, por favor.',      'Soy sin gluten.',            'Dos cafés, gracias.']                },
  { id: 'ristorante_02', level: 'A1', question: '¿Para beber?',                       correct: 'Agua con gas y una copa de vino tinto.', foils: ['Muy bien, gracias.',       'La habitación está en el tercer piso.', 'Voy a la estación.']        },
  { id: 'ristorante_03', level: 'A1', question: '¿Qué le ha parecido la comida?',     correct: '¡Excelente, muy buena!',             foils: ['A las ocho de la tarde.',      'Es la primera a la derecha.', 'Un billete de ida y vuelta.']        },
  { id: 'ristorante_04', level: 'A1', question: '¿Le traigo el postre?',              correct: 'Sí, ¿qué tienen?',                   foils: ['La cuenta, por favor.',        'No, prefiero el pescado.',   '¿Dónde está el baño?']               },
  { id: 'ristorante_05', level: 'A2', question: '¿Quiere un poco más de vino?',       correct: 'Sí, gracias, un poco más.',          foils: ['Sí, tengo reserva.',           'No, estoy a dieta.',         'La carta, por favor.']               },
];
```

**Step 4: Create strada.ts (Spanish)**

```ts
// src/data/es/scenarios/strada.ts
import type { QACard } from '@/types';

export const stradaes: QACard[] = [
  { id: 'strada_01', level: 'A1', question: 'Perdone, ¿dónde está la estación?',      correct: 'Siga todo recto, luego gire a la izquierda.', foils: ['¡Sí, muchas gracias!', 'Me llamo Ana.',              'Quisiera un billete.']               },
  { id: 'strada_02', level: 'A1', question: '¿Está lejos de aquí?',                   correct: 'No, son unos cinco minutos a pie.', foils: ['Son las tres.',                'Tomo un café.',              '¡Buenas tardes!']                    },
  { id: 'strada_03', level: 'A2', question: '¿Cómo se llega al museo?',               correct: 'Tome la segunda a la derecha, luego todo recto.', foils: ['Cuesta diez euros.', 'Me gusta mucho.',            'A las ocho de la tarde.']            },
  { id: 'strada_04', level: 'A2', question: '¿Hay una farmacia cerca?',               correct: 'Sí, está al final de la calle, a la izquierda.', foils: ['¡Claro, por favor!', 'No entiendo.',               'Soy de Madrid.']                     },
];
```

**Step 5: Create negozio.ts (Spanish)**

```ts
// src/data/es/scenarios/negozio.ts
import type { QACard } from '@/types';

export const negozioes: QACard[] = [
  { id: 'negozio_01', level: 'A2', question: '¿Le puedo ayudar?',                     correct: 'Sí, busco una chaqueta.',            foils: ['No, estoy esperando el tren.', 'Sí, reservo para dos.',    'El museo está cerrado hoy.']         },
  { id: 'negozio_02', level: 'A2', question: '¿Qué talla usa?',                       correct: 'Uso la talla mediana.',              foils: ['Cuesta demasiado.',            'Son las once.',              'Un helado de limón.']                },
  { id: 'negozio_03', level: 'A2', question: '¿Cómo quiere pagar?',                   correct: 'Con tarjeta, gracias.',              foils: ['Tengo hambre.',                '¿Dónde está la parada del autobús?', '¡Buenos días!']             },
  { id: 'negozio_04', level: 'A2', question: 'También lo tenemos en rojo.',           correct: '¿Puedo probármelo?',                 foils: ['¿Cuánto cuesta?',              'No, gracias, estoy bien.',   '¿Dónde está la caja?']               },
  { id: 'negozio_05', level: 'A2', question: '¿Quiere el recibo?',                    correct: 'Sí, gracias.',                       foils: ['No, no tengo hambre.',         '¿A qué hora cierra?',        'Son las tres.']                      },
];
```

**Step 6: Create treno.ts (Spanish)**

```ts
// src/data/es/scenarios/treno.ts
import type { QACard } from '@/types';

export const trenoes: QACard[] = [
  { id: 'treno_01', level: 'A2', question: '¿Está libre este asiento?',               correct: 'Sí, por favor, siéntese.',           foils: ['El tren llega a las tres.',    'Me gusta viajar.',           '¡Gracias, buen viaje!']              },
  { id: 'treno_02', level: 'A2', question: '¿Es este el tren para Madrid?',           correct: 'Sí, sale a las quince y media.',     foils: ['No, no tengo el billete.',     'Me llamo Marco.',            'Tomo un café.']                      },
  { id: 'treno_03', level: 'A2', question: '¿Tiene el billete?',                      correct: 'Sí, aquí está.',                     foils: ['Soy americano.',               '¿Dónde está el baño?',       'Llego mañana.']                      },
  { id: 'treno_04', level: 'A2', question: '¿A qué hora llegamos a Sevilla?',         correct: 'En unos veinte minutos.',            foils: ['Es el tercer andén.',          'Tengo hambre.',              'La estación es grande.']             },
];
```

**Step 7: Create presentazioni.ts (Spanish)**

```ts
// src/data/es/scenarios/presentazioni.ts
import type { QACard } from '@/types';

export const presentazioneies: QACard[] = [
  { id: 'pres_01', level: 'A1', question: '¿Cómo te llamas?',                         correct: 'Me llamo Sara. ¿Y tú?',              foils: ['Tengo veinticinco años.',      'Vivo en Madrid.',            'Estoy bien, gracias.']               },
  { id: 'pres_02', level: 'A1', question: '¿Desde cuándo estudias español?',          correct: 'Estudio español desde hace seis meses.', foils: ['Me gusta la paella.',       'Vivo en el tercer piso.',    'Vengo mañana.']                      },
  { id: 'pres_03', level: 'A1', question: '¿De dónde eres?',                          correct: 'Soy americana, de Nueva York.',      foils: ['Estudio medicina.',            'Tengo una hermana.',         'Hablo inglés.']                      },
  { id: 'pres_04', level: 'A2', question: '¿Hablas otros idiomas?',                   correct: 'Hablo inglés y un poco de francés.', foils: ['Tengo veintiocho años.',       'Trabajo en el centro.',      'Me gusta mucho.']                    },
];
```

**Step 8: Create the Spanish scenarios index**

```ts
// src/data/es/scenarios/index.ts
export { caffees }              from './caffe';
export { albergoes }            from './albergo';
export { ristorantees }         from './ristorante';
export { stradaes }             from './strada';
export { negozioes }            from './negozio';
export { trenoes }              from './treno';
export { presentazioneies }     from './presentazioni';
```

**Step 9: Verify TypeScript**

Run: `bun run build 2>&1 | head -20`
Expected: no errors

**Step 10: Commit**

```bash
git add src/data/es/scenarios/
git commit -m "feat(qa): add Spanish Q&A scenario content (7 scenarios)"
```

---

### Task 7: Add i18n strings for activity picker and scenario browser

**Files:**
- Modify: `messages/it.json`
- Modify: `messages/es.json`

**Step 1: Add strings to messages/it.json**

Inside the JSON object, add the following two new top-level keys (alongside existing `"nav"`, `"page"`, etc.):

```json
"activity": {
  "title": "Cosa vuoi fare?",
  "rephrase": "Ripetizione",
  "rephraseDesc": "Studia il vocabolario con le carte",
  "qa": "Domande e Risposte",
  "qaDesc": "Pratica le conversazioni reali"
},
"scenarios": {
  "title": "Scegli uno scenario",
  "caffe": "Al Caffè",
  "albergo": "In Albergo",
  "ristorante": "Al Ristorante",
  "strada": "Per Strada",
  "negozio": "Al Negozio",
  "treno": "In Treno",
  "presentazioni": "Presentazioni",
  "backToActivity": "← Attività",
  "backToScenarios": "← Scenari"
}
```

**Step 2: Add strings to messages/es.json**

```json
"activity": {
  "title": "¿Qué quieres hacer?",
  "rephrase": "Repetición",
  "rephraseDesc": "Estudia el vocabulario con las tarjetas",
  "qa": "Preguntas y Respuestas",
  "qaDesc": "Practica conversaciones reales"
},
"scenarios": {
  "title": "Elige un escenario",
  "caffe": "En el Café",
  "albergo": "En el Hotel",
  "ristorante": "En el Restaurante",
  "strada": "En la Calle",
  "negozio": "En la Tienda",
  "treno": "En el Tren",
  "presentazioni": "Presentaciones",
  "backToActivity": "← Actividad",
  "backToScenarios": "← Escenarios"
}
```

**Step 3: Verify build**

Run: `bun run build 2>&1 | head -20`
Expected: no errors

**Step 4: Commit**

```bash
git add messages/it.json messages/es.json
git commit -m "feat(qa): add activity picker and scenario browser i18n strings"
```

---

### Task 8: Create rephrase deck browser at /[lang]/rephrase

**Files:**
- Create: `src/app/[lang]/rephrase/page.tsx`

The rephrase page is the current `[lang]/page.tsx` deck browser, placed at the new `/rephrase` path. Copy the deck browser component from `[lang]/page.tsx`.

**Step 1: Create the file**

```tsx
// src/app/[lang]/rephrase/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deckMetadata } from '@/data/decks';
import LevelFilterChips from '@/components/LevelFilterChips';
import type { Lang } from '@/types';

function DeckGrid({ lang }: { lang: Lang }) {
  const t = useTranslations('decks');
  const td = useTranslations('deckDescriptions');
  const tc = useTranslations();

  const decks = deckMetadata.filter((d) => d.lang === lang);

  return (
    <div className="deck-grid">
      {decks.map((deck) => (
        <Link
          key={deck.id}
          href={`/${lang}/${deck.id}`}
          style={{ textDecoration: 'none', display: 'block', height: '100%' }}
        >
          <div className={`deck-card theme-${deck.theme}`} style={{ height: '100%' }}>
            <div className="deck-icon-circle">{deck.icon}</div>
            <h3>{t(deck.i18nKey)}</h3>
            <p>{td(deck.i18nKey)}</p>
            <span className="deck-card-badge">{tc('deckCardCount', { count: deck.cardCount })}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function RephrasePage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const t = useTranslations('page');
  const ta = useTranslations('activity');

  return (
    <main>
      <div className="section-header">
        <Link href={`/${lang}`} className="nav-back-btn">{ta('backToActivity' as never) || '← Back'}</Link>
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>
      <LevelFilterChips lang={lang} />
      <DeckGrid lang={lang} />
    </main>
  );
}
```

Note: the back link uses the `scenarios.backToActivity` key — add a helper or just inline the string since this is UI chrome. Simplest: use the `activity` namespace key. Check the i18n key matches what you added in Task 7.

**Step 2: Update StudySession back link to point to /[lang]/rephrase**

Modify `src/app/[lang]/[deck]/StudySession.tsx` line 64:

Change:
```ts
const backLink = `/${lang}`;
```

To:
```ts
const backLink = `/${lang}/rephrase`;
```

**Step 3: Verify build and navigation**

Run: `bun run build 2>&1 | head -20`
Expected: no errors

Navigate to `/it/rephrase` — should show deck grid.
Navigate to `/it/daily` — back button should go to `/it/rephrase`.

**Step 4: Commit**

```bash
git add src/app/[lang]/rephrase/page.tsx src/app/[lang]/[deck]/StudySession.tsx
git commit -m "feat(qa): add rephrase deck browser at /[lang]/rephrase, update back links"
```

---

### Task 9: Convert /[lang] to activity picker

**Files:**
- Modify: `src/app/[lang]/page.tsx`

**Step 1: Replace the deck browser with an activity picker**

Replace the entire contents of `src/app/[lang]/page.tsx` with:

```tsx
// src/app/[lang]/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Lang } from '@/types';

export default function ActivityPickerPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const t = useTranslations('activity');

  return (
    <main>
      <div className="section-header">
        <h1>{t('title')}</h1>
      </div>
      <div className="deck-grid">
        <Link href={`/${lang}/rephrase`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
          <div className="deck-card theme-teal" style={{ height: '100%' }}>
            <div className="deck-icon-circle">🔄</div>
            <h3>{t('rephrase')}</h3>
            <p>{t('rephraseDesc')}</p>
          </div>
        </Link>
        <Link href={`/${lang}/qa`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
          <div className="deck-card theme-purple" style={{ height: '100%' }}>
            <div className="deck-icon-circle">💬</div>
            <h3>{t('qa')}</h3>
            <p>{t('qaDesc')}</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
```

**Step 2: Verify build**

Run: `bun run build 2>&1 | head -20`
Expected: no errors

**Step 3: Verify in browser**

Navigate to `/it` — should show two activity cards (Ripetizione + Domande e Risposte).
Click Ripetizione → goes to `/it/rephrase` (deck grid).

**Step 4: Commit**

```bash
git add src/app/[lang]/page.tsx
git commit -m "feat(qa): convert /[lang] to activity picker"
```

---

### Task 10: Add scenario browser at /[lang]/qa

**Files:**
- Create: `src/app/[lang]/qa/page.tsx`

**Step 1: Create the scenario browser page**

```tsx
// src/app/[lang]/qa/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { scenarioMetadata } from '@/data/scenarios';
import LevelFilterChips from '@/components/LevelFilterChips';
import type { Lang } from '@/types';

export default function ScenarioBrowserPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang as Lang;
  const t = useTranslations('scenarios');
  const ta = useTranslations('activity');

  return (
    <main>
      <div className="section-header">
        <Link href={`/${lang}`} className="nav-back-btn">{ta('backToActivity' as never) || '← Back'}</Link>
        <h1>{t('title')}</h1>
      </div>
      <LevelFilterChips lang={lang} />
      <div className="deck-grid">
        {scenarioMetadata.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/${lang}/qa/${scenario.id}`}
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
          >
            <div className="deck-card theme-purple" style={{ height: '100%' }}>
              <div className="deck-icon-circle">{scenario.icon}</div>
              <h3>{t(scenario.id)}</h3>
              <span className="deck-card-badge">{scenario.cardCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

Note: the `activity.backToActivity` i18n key needs to be accessible from the `scenarios` namespace or referenced via `useTranslations('activity')`. The example above uses two separate `useTranslations` calls which is fine.

**Step 2: Verify build**

Run: `bun run build 2>&1 | head -20`
Expected: no errors

**Step 3: Verify in browser**

Navigate to `/it/qa` — should show 7 scenario cards with icons, Italian titles.

**Step 4: Commit**

```bash
git add src/app/[lang]/qa/page.tsx
git commit -m "feat(qa): add scenario browser at /[lang]/qa"
```

---

### Task 11: Add QAStudySession component (TDD)

**Files:**
- Create: `src/app/[lang]/qa/[scenario]/QAStudySession.tsx`
- Create: `src/__tests__/components/QAStudySession.test.tsx`

**Step 1: Write the failing tests**

```tsx
// src/__tests__/components/QAStudySession.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QAStudySession from '@/app/[lang]/qa/[scenario]/QAStudySession';
import type { QACard } from '@/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}(${JSON.stringify(params)})`;
    return key;
  },
}));

vi.mock('@/hooks/useQASRS', () => ({
  useQASRS: () => ({
    isQACardDue: () => true,
    updateQACard: vi.fn(),
    hasProgress: false,
  }),
}));

vi.mock('@/hooks/useLevelFilter', () => ({
  useLevelFilter: () => ({ activeLevels: ['A1', 'A2'] }),
}));

vi.mock('@/hooks/useVoiceRecognition', () => ({
  useVoiceRecognition: () => ({ isSupported: false, isListening: false, startListening: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const testCards: QACard[] = [
  { id: 'caffe_01', level: 'A1', question: 'Cosa desidera?',         correct: 'Un caffè, per favore.',  foils: ["Dov'è il bagno?",    'Mi chiamo Luca.',    'A domani!']         },
  { id: 'caffe_02', level: 'A1', question: 'Prende da mangiare?',    correct: 'Sì, un cornetto.',       foils: ['No, sono stanco.',   'Costa troppo.',      'Buonasera!']        },
  { id: 'caffe_03', level: 'A1', question: 'Tutto insieme?',         correct: 'Sì, insieme, grazie.',   foils: ['Ho fame.',           'Sono le tre.',       'Buongiorno!']       },
  { id: 'caffe_04', level: 'A1', question: 'Vuole lo zucchero?',     correct: 'Sì, uno zucchero.',      foils: ['Costa molto.',       'Vado via.',          'Non capisco.']      },
];

function renderQAStudySession() {
  return render(
    <QAStudySession lang="it" scenarioId="caffe" icon="☕" cards={testCards} />
  );
}

describe('QAStudySession rendering', () => {
  it('renders the first card question', () => {
    renderQAStudySession();
    expect(screen.getByText('Cosa desidera?')).toBeInTheDocument();
  });

  it('renders the scenario icon in the header', () => {
    renderQAStudySession();
    expect(screen.getByText('☕')).toBeInTheDocument();
  });

  it('does NOT render any native-language text from card data', () => {
    renderQAStudySession();
    // All text on screen should be target language only.
    // The question and choices are Italian — no translation present.
    expect(screen.queryByText('translation')).not.toBeInTheDocument();
  });
});

describe('QAStudySession card flip', () => {
  it('shows tapToReveal hint before flip', () => {
    renderQAStudySession();
    expect(screen.getByText('tapToReveal')).toBeInTheDocument();
  });

  it('shows 4 choice buttons after flipping the card', async () => {
    renderQAStudySession();
    const cardContainer = document.querySelector('.card-container')!;
    await userEvent.click(cardContainer);
    // All 4 choices should be rendered (correct + 3 foils)
    const choiceButtons = document.querySelectorAll('.choice-btn');
    expect(choiceButtons.length).toBe(4);
  });

  it('one of the choices matches card.correct', async () => {
    renderQAStudySession();
    const cardContainer = document.querySelector('.card-container')!;
    await userEvent.click(cardContainer);
    expect(screen.getByText('Un caffè, per favore.')).toBeInTheDocument();
  });
});

describe('QAStudySession back link', () => {
  it('back link points to /[lang]/qa not /[lang]', () => {
    renderQAStudySession();
    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toHaveAttribute('href', '/it/qa');
  });
});
```

**Step 2: Run to confirm failure**

Run: `bun run vitest run src/__tests__/components/QAStudySession.test.tsx`
Expected: FAIL — "Cannot find module"

**Step 3: Implement QAStudySession**

```tsx
// src/app/[lang]/qa/[scenario]/QAStudySession.tsx
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { QACard, ScenarioId, Lang } from '@/types';
import { useQASRS } from '@/hooks/useQASRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { generateQAChoices } from '@/lib/generateQAChoices';
import AudioButton from '@/components/AudioButton';
import ChoiceButton from '@/components/ChoiceButton';
import FeedbackMessage from '@/components/FeedbackMessage';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import MicButton from '@/components/MicButton';

interface Props {
  lang: Lang;
  scenarioId: ScenarioId;
  icon: string;
  cards: QACard[];
}

const LANG_LOCALE: Record<Lang, string> = { it: 'it-IT', es: 'es-ES' };

function speak(phrase: string, lang: Lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.lang = LANG_LOCALE[lang];
  utterance.rate = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const matching = voices.filter((v) => v.lang.startsWith(lang));
  const exact = matching.find((v) => v.lang === LANG_LOCALE[lang]);
  utterance.voice = exact ?? matching[0] ?? null;
  window.speechSynthesis.speak(utterance);
}

export default function QAStudySession({ lang, scenarioId, icon, cards }: Props) {
  const { isQACardDue, updateQACard, hasProgress } = useQASRS(lang);
  const { activeLevels } = useLevelFilter(lang, hasProgress);
  const t = useTranslations('study');
  const ts = useTranslations('scenarios');

  const backLink = `/${lang}/qa`;

  const [dueCards] = useState(() =>
    cards
      .filter(card => activeLevels.includes(card.level) && isQACardDue(scenarioId, card.id))
  );

  const { isSupported, isListening, startListening } = useVoiceRecognition(lang);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | 'heard' | 'notRecognized' | null>(null);

  const currentCard = dueCards[index];

  const choices = useMemo(
    () => currentCard ? generateQAChoices(currentCard) : [],
    [currentCard]
  );

  function resetSession() {
    setIndex(0);
    setFlipped(false);
    setDone(false);
    setSelectedChoice(null);
    setMicState('idle');
    setFeedbackState(null);
  }

  if (done || dueCards.length === 0) {
    return (
      <main>
        <div id="flashcard-view" style={{ paddingTop: '2rem' }}>
          <Link href={backLink} className="nav-back-btn">{ts('backToScenarios')}</Link>
          <div className="card-container" style={{ height: 'auto', perspective: 'none' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                {dueCards.length === 0 ? t('allDone') : t('deckComplete')}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={backLink}>
                  <button className="btn secondary" type="button">{ts('backToScenarios')}</button>
                </Link>
                <button className="btn primary" type="button" onClick={resetSession}>{t('studyAgain')}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:'"¿¡]+$/g, '').trim();

  function handleBackMicPress() {
    if (isListening || selectedChoice !== null) return;
    setMicState('listening');
    startListening(
      (transcript) => {
        setMicState('idle');
        const matchedIndex = choices.findIndex(c => normalize(c.text) === normalize(transcript));
        if (matchedIndex !== -1) {
          setFeedbackState('heard');
          handleChoiceClick(matchedIndex);
        } else {
          setFeedbackState('notRecognized');
          setMicState('error');
          setTimeout(() => setMicState('idle'), 800);
        }
      },
      () => {
        setFeedbackState('notRecognized');
        setMicState('error');
        setTimeout(() => setMicState('idle'), 800);
      }
    );
  }

  function handleAnswer(isCorrect: boolean) {
    updateQACard(scenarioId, currentCard.id, isCorrect);
    setFlipped(false);
    setSelectedChoice(null);
    setFeedbackState(null);
    if (index + 1 < dueCards.length) {
      setIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  }

  function handleChoiceClick(choiceIndex: number) {
    if (selectedChoice !== null) return;
    const isCorrect = choices[choiceIndex].isCorrect;
    setSelectedChoice(choiceIndex);
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => handleAnswer(isCorrect), 600);
  }

  const progressPercent = Math.round((index / dueCards.length) * 100);

  return (
    <main>
      <div id="flashcard-view">
        <Link href={backLink} className="nav-back-btn">{ts('backToScenarios')}</Link>

        <div style={{ textAlign: 'center', fontSize: '2rem', margin: '0.5rem 0' }}>
          {icon}
        </div>

        <div className="progress-bar" style={{ width: '100%' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
          {t('cardCounter', { current: index + 1, total: dueCards.length })}
        </p>

        <div
          className="card-container"
          onClick={() => { if (!flipped) setFlipped(true); }}
        >
          <div className={`card${flipped ? ' flipped' : ''}`}>
            <div className="card-face card-front">
              <AudioButton phrase={currentCard.question} lang={lang} />
              <span id="card-front-text">{currentCard.question}</span>
              {!flipped && (
                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                  {t('tapToReveal')}
                </p>
              )}
            </div>
            <div className="card-face card-back">
              {isSupported && flipped && (
                <MicButton state={micState} onPress={handleBackMicPress} />
              )}
              <div className="quiz-options">
                {choices.map((choice, i) => {
                  let state: 'idle' | 'correct' | 'incorrect' = 'idle';
                  if (selectedChoice !== null) {
                    if (choice.isCorrect) state = 'correct';
                    else if (i === selectedChoice) state = 'incorrect';
                  }
                  return (
                    <ChoiceButton
                      key={i}
                      text={choice.text}
                      state={state}
                      onClick={() => handleChoiceClick(i)}
                      disabled={selectedChoice !== null}
                      onSpeak={() => speak(choice.text, lang)}
                    />
                  );
                })}
              </div>
              <FeedbackMessage state={feedbackState} />
            </div>
          </div>
        </div>

        <FeedbackMessage state={feedbackState} />

        {flipped && (
          <div className="controls">
            <button className="btn secondary" onClick={() => setFlipped(false)}>
              {t('flipButton')}
            </button>
            <button className="btn primary" onClick={() => handleAnswer(true)}>
              {t('nextButton')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
```

**Step 4: Run tests to confirm pass**

Run: `bun run vitest run src/__tests__/components/QAStudySession.test.tsx`
Expected: PASS — 7 tests

**Step 5: Run all tests to confirm no regressions**

Run: `bun run vitest run`
Expected: all tests pass

**Step 6: Commit**

```bash
git add src/app/[lang]/qa/[scenario]/QAStudySession.tsx src/__tests__/components/QAStudySession.test.tsx
git commit -m "feat(qa): add QAStudySession component with tests"
```

---

### Task 12: Add Q&A route page at /[lang]/qa/[scenario]

**Files:**
- Create: `src/app/[lang]/qa/[scenario]/page.tsx`
- Create: `src/app/[lang]/qa/[scenario]/QAStudySessionNoSSR.tsx`

**Step 1: Create QAStudySessionNoSSR.tsx**

This is the same pattern as `StudySessionNoSSR.tsx` — wraps the component with `dynamic` to disable SSR (required for Web Speech API + localStorage).

First, check the existing `StudySessionNoSSR.tsx` to match the pattern exactly:

```tsx
// src/app/[lang]/qa/[scenario]/QAStudySessionNoSSR.tsx
'use client';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type QAStudySessionType from './QAStudySession';

const QAStudySessionDynamic = dynamic(() => import('./QAStudySession'), { ssr: false });

type Props = ComponentProps<typeof QAStudySessionType>;

export default function QAStudySessionNoSSR(props: Props) {
  return <QAStudySessionDynamic {...props} />;
}
```

**Step 2: Create the route page**

```tsx
// src/app/[lang]/qa/[scenario]/page.tsx
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SCENARIO_IDS, scenarioMetadata } from '@/data/scenarios';
import type { Lang, ScenarioId, QACard } from '@/types';
import QAStudySessionNoSSR from './QAStudySessionNoSSR';

// Italian scenarios
import { caffeit, albergoit, ristoranteit, stradait, negozioit, trenoit, presentazioniit } from '@/data/it/scenarios';
// Spanish scenarios
import { caffees, albergoes, ristorantees, stradaes, negozioes, trenoes, presentazioneies } from '@/data/es/scenarios';

const SCENARIO_MAP: Record<Lang, Record<ScenarioId, QACard[]>> = {
  it: {
    caffe: caffeit,
    albergo: albergoit,
    ristorante: ristoranteit,
    strada: stradait,
    negozio: negozioit,
    treno: trenoit,
    presentazioni: presentazioniit,
  },
  es: {
    caffe: caffees,
    albergo: albergoes,
    ristorante: ristorantees,
    strada: stradaes,
    negozio: negozioes,
    treno: trenoes,
    presentazioni: presentazioneies,
  },
};

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    SCENARIO_IDS.map((scenario) => ({ lang, scenario }))
  );
}

type Props = {
  params: Promise<{ lang: string; scenario: string }>;
};

export default async function QAScenarioPage({ params }: Props) {
  const { lang, scenario } = await params;

  if (!routing.locales.includes(lang as Lang)) notFound();
  if (!SCENARIO_IDS.includes(scenario as ScenarioId)) notFound();

  setRequestLocale(lang);

  const cards = SCENARIO_MAP[lang as Lang][scenario as ScenarioId];
  const meta = scenarioMetadata.find(s => s.id === scenario)!;

  return (
    <QAStudySessionNoSSR
      lang={lang as Lang}
      scenarioId={scenario as ScenarioId}
      icon={meta.icon}
      cards={cards}
    />
  );
}
```

**Step 3: Verify full build**

Run: `bun run build 2>&1 | head -40`
Expected: build succeeds, static export includes `/it/qa/caffe`, `/it/qa/albergo` etc.

**Step 4: Run all tests**

Run: `bun run vitest run`
Expected: all tests pass

**Step 5: Smoke test navigation manually**

- `/it` → activity picker (Ripetizione + Domande e Risposte)
- `/it/rephrase` → deck grid
- `/it/daily` → rephrase study session, back button → `/it/rephrase`
- `/it/qa` → scenario browser (7 scenarios with icons)
- `/it/qa/caffe` → Q&A session, question in Italian, 4 Italian choices, no English

**Step 6: Commit**

```bash
git add src/app/[lang]/qa/[scenario]/page.tsx src/app/[lang]/qa/[scenario]/QAStudySessionNoSSR.tsx
git commit -m "feat(qa): add Q&A route at /[lang]/qa/[scenario]"
```

---

## Summary

| Task | Files | Key test |
|------|-------|----------|
| 1 | `src/types/index.ts` | TypeScript build |
| 2 | `src/data/scenarios.ts` | TypeScript build |
| 3 | `src/lib/generateQAChoices.ts` | 5 unit tests |
| 4 | `src/hooks/useQASRS.ts` | 7 unit tests |
| 5 | `src/data/it/scenarios/` | TypeScript build |
| 6 | `src/data/es/scenarios/` | TypeScript build |
| 7 | `messages/it.json`, `messages/es.json` | TypeScript build |
| 8 | `src/app/[lang]/rephrase/page.tsx`, `StudySession.tsx` | Manual nav |
| 9 | `src/app/[lang]/page.tsx` | Manual nav |
| 10 | `src/app/[lang]/qa/page.tsx` | Manual nav |
| 11 | `src/app/[lang]/qa/[scenario]/QAStudySession.tsx` | 7 unit tests |
| 12 | `src/app/[lang]/qa/[scenario]/page.tsx` + NoSSR | Full build + nav |
