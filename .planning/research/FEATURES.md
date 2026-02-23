# Feature Research

**Domain:** CEFR difficulty levels (A1/A2) for a browser-based language learning flashcard app
**Researched:** 2026-02-22
**Confidence:** HIGH (CEFR spec is a stable international standard; existing codebase reviewed directly)

## Context: This Is a Milestone, Not a Greenfield Project

This research covers only what is new for v1.1. The existing system (spaced repetition, audio, voice, quiz, localStorage, multi-language) is already shipped and working. New features must integrate without breaking or redesigning existing behavior.

**Existing codebase constraints that shape every feature below:**
- Cards are plain objects `{ front, back }` — adding `level` requires touching card data in both locale files
- Progress is keyed by `deckId_cardIndex` (e.g. `daily_0`) — index-based, not ID-based
- `renderDecks()` in `app.js` uses `getDecks()` → locale decks array directly, no filtering layer exists
- `startDeck(deck)` passes the whole deck object; due-card filtering is inside that function
- localStorage key is `${locale}-progress` — one SRS track per language, shared across levels (correct per PROJECT.md)
- No global filter state object exists yet — must be added

---

## Scope Analysis: What the Existing Cards Actually Are

Reviewing the existing Spanish and Italian decks reveals consistent A2 characteristics:

- Multi-clause sentences: "Estoy muerto de cansancio" / "Sono stanco morto"
- Conditional/subjunctive mood implied: "¿Crees que nevará?" / "Pensi che nevicherà?"
- Social media / modern idioms: "¿Estás en Instagram?"
- Complex transactions: "¿Hay un error en la cuenta?"
- Idiomatic phrasing: "Solo estoy mirando", "Ha sido un placer"

**Conclusion (HIGH confidence):** All 160 existing cards (20 per deck × 8 decks) should be tagged A2. None qualify as A1 by CEFR definition.

---

## CEFR A1 Characteristics (HIGH confidence — CEFR is an established international standard)

A1 is the entry level. Learners can:
- Understand and use familiar everyday expressions
- Introduce themselves and ask basic questions
- Interact if the other person speaks slowly and clearly

**A1 language markers:**
- Single clause, present tense preferred
- High-frequency vocabulary only (top ~500-1000 words)
- Concrete, immediate needs (not abstract or hypothetical)
- Fixed phrases and formulaic expressions
- No complex verb moods, no idiomatic metaphors

**A2 language markers (what current cards already are):**
- Two-clause sentences
- Past tense, hypothetical, conditional
- Register awareness ("¿Me puede hacer un descuento?" is polite/formal)
- Idiomatic expressions that require inferring meaning
- Nuanced requests (extending a hotel stay, reporting a billing error)

---

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `level` property on every card (A1 or A2) | Without tags, filtering is impossible; foundational data requirement | LOW | Add `"level": "A2"` to all 160 existing cards, `"level": "A1"` to new content. Pure data edit, no logic change. |
| A1 phrase content for all 8 decks (both languages) | Without content there is nothing to filter to; the feature is meaningless | HIGH | 20 cards × 8 decks × 2 languages = 320 new cards. This is the bulk of the milestone's effort. Must be linguistically correct native-level phrasing. |
| Level filter UI on deck screen (A1 / A2 chips, multi-select) | Users need a way to activate the feature; no UI = feature does not exist | MEDIUM | Chips above the deck grid. Multi-select allows A1 only, A2 only, or both. Default: A1 selected only. |
| Default level: A1 selected on first visit | Per PROJECT.md spec; beginners land at the simpler content | LOW | Requires reading a default from localStorage or falling back to `["A1"]` |
| Level preference persists across sessions | Returning users expect their setting to be remembered (same pattern as language preference) | LOW | One new localStorage key: `level-filter` → JSON array e.g. `["A1"]` or `["A1","A2"]` |
| Deck grid filters in real-time when chips change | Standard filter UX; any delay or page reload feels broken | LOW | `renderDecks()` already re-renders from scratch; call it on chip toggle with active filter passed in |
| "Due count" badge on deck cards reflects only visible-level cards | If A1 is selected but badge counts all cards including A2, it misleads the user | MEDIUM | `getDueCount(deck)` must filter cards by active level(s) before counting. Requires passing active levels into that function. |
| At least one level always selected | Deselecting all levels would show no cards in any deck — confusing dead end | LOW | When toggling a chip off, check if it would leave zero selected levels; if so, prevent or auto-select the other |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| One SRS track regardless of level | Beginners who unlock A2 keep their A1 progress; no penalty for advancing. Other apps often create separate tracks. | LOW | Already resolved in PROJECT.md; `deckId_cardIndex` keys are unique per card across both levels so no collision |
| A1 content written as isolated learnable phrases, not translations of A2 | A1 phrases should be simpler constructions, not just shorter A2 phrases. Duolingo-style: "Hola, me llamo..." not "Yo me llamo..." | MEDIUM | Content authorship discipline; must be applied during content creation phase |
| Chips visible above deck grid (persistent, contextual) | Inline on deck screen = zero friction to change; no settings screen required | LOW | Better UX than burying in settings; consistent with app's zero-friction philosophy |
| Level badge on each deck card showing currently-visible count | "3 due (A1)" signals which level the card counts from; reassures user their filter is applied | LOW | Extend badge text to show active level(s) if desired, though even without label the count accuracy is sufficient |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Separate SRS progress tracks per level | "A1 and A2 are different learning goals, I want to reset one independently" | Doubles state complexity; index-based key system would need redesign; users advancing from A1 to A2 lose their A1 progress; violates PROJECT.md decision | One shared SRS track. The card's `deckId_cardIndex` key is unique per card regardless of level. Progress resets cleanly via the existing reset button. |
| Level progress bar / "X of Y A1 cards mastered" | Seems motivating | Requires defining what "mastered" means (Box 3? All due in next 7 days?); scope creep; streak was already removed for similar reasons | Due-count badge already shows remaining work. Keep that. |
| Auto-advance to A2 when A1 is complete | "Intelligent" progression | Requires defining completion threshold; breaks user agency; beginners may want more A1 repetition | User manually selects A2 chip when ready |
| A1/A2 badge displayed on individual flashcards during study | "Good to know what level I'm studying" | Disrupts the clean card face; adds cognitive load during active learning; level is a browsing/selection concept, not a study concept | Filter at the deck screen; no level label needed inside the study flow |
| B1/B2/C1/C2 levels | Natural request after A1/A2 | Out of scope for this milestone; massive content effort; requires new vocabulary domains beyond traveler use case | Defer. Architecture should make it easy (just add more level values), but don't build content now. |
| Separate decks per level (e.g., "Daily Life A1" and "Daily Life A2" as two deck cards) | Cleaner mental model | Doubles deck grid from 8 to 16 cards; breaks existing deck ID system; progress keys would need migration; filtering chips are the simpler approach | Level filter chips on the existing 8 deck cards. Each deck stays one unit. |

---

## A1 Content Specification Per Topic Category

**Confidence: MEDIUM** — CEFR A1 definition is HIGH confidence (established standard), specific phrase selections are synthesized from my training knowledge of CEFR word lists and standard phrasebooks. Linguistic review recommended before shipping.

**Rule for A1 content:** Single clause, present tense or fixed phrase, top-500 vocabulary, no idiomatic metaphor, concrete immediate need. Front = the target-language phrase. Back = a simpler paraphrase in the target language (same pattern as existing A2 cards).

### Daily Life (Vita Quotidiana / Vida Cotidiana)

A1 focus: greetings, time, basic needs, simple daily actions.

Representative A1 phrases (Spanish examples):
- "Buenos días." / "Buenas noches." / "Buenas tardes."
- "¿Cómo estás?" / "Bien, gracias."
- "Tengo hambre." / "Tengo sed."
- "Estoy cansado/a." / "Estoy bien."
- "¿Qué hora es?" / "Son las tres."
- "Por favor." / "Gracias." / "De nada."
- "Perdona." / "Lo siento."
- "No entiendo." / "¿Puede repetir?"
- "¿Dónde está el baño?"
- "Necesito agua."

Contrast with existing A2: Existing "Me desperté tarde" (past reflexive), "¿Tienes ganas de salir?" (idiom) are correctly A2.

### Restaurant (Al Ristorante / En el Restaurante)

A1 focus: ordering one item, asking price, simple dietary needs.

Representative A1 phrases:
- "Una mesa para dos, por favor."
- "La carta, por favor."
- "Quiero esto." (pointing)
- "Un café, por favor."
- "Agua, por favor."
- "Sin carne."
- "La cuenta, por favor."
- "¿Cuánto es?"
- "¡Está bueno!"
- "¿Tiene…?" + simple noun

Contrast with existing A2: "¿El servicio está incluido?", "¿La pasta es casera?" are A2 (presuppose cultural knowledge and complex syntax).

### Travel (In Viaggio / De Viaje)

A1 focus: asking location, simple directions, buying a ticket.

Representative A1 phrases:
- "¿Dónde está [el hotel / la estación / el aeropuerto]?"
- "A la derecha." / "A la izquierda." / "Todo recto."
- "Un billete, por favor."
- "¿Cuánto cuesta?"
- "¿Hay un autobús?"
- "Quiero ir a [place]."
- "¿Está lejos?"
- "¿Cuántos minutos?"
- "No entiendo."
- "Más despacio, por favor."

Contrast with existing A2: "¿Tengo que hacer transbordo?" (conditional + specialized vocab), "Perdí la conexión" (past + compound noun) are A2.

### Shopping (Fare Spese / De Compras)

A1 focus: asking price, saying yes/no to a purchase, basic size.

Representative A1 phrases:
- "¿Cuánto cuesta?"
- "Lo quiero." / "No, gracias."
- "¿Tiene una talla más grande / pequeña?"
- "En efectivo." / "Con tarjeta."
- "¿Dónde está la caja?"
- "Un kilo de [item], por favor."
- "Esto está bien."
- "Es para mí."
- "¿Hay más?"
- "Dame dos, por favor."

Contrast with existing A2: "¿Me puede hacer un descuento?" (formal conditional), "¿Tiene garantía?" (specialized concept) are A2.

### Hotel (In Albergo / En el Hotel)

A1 focus: check-in basics, asking for essentials, locating amenities.

Representative A1 phrases:
- "Tengo una reserva."
- "Mi nombre es [name]."
- "Una habitación, por favor."
- "¿Cuánto cuesta la noche?"
- "¿Dónde está el ascensor?"
- "La llave, por favor."
- "¿Hay desayuno?"
- "Necesito más toallas."
- "¿Hay WiFi?"
- "¿A qué hora es el check-out?"

Note: "¿A qué hora es el check-out?" straddles A1/A2 but "check-out" is loan vocabulary so common in hotel contexts it qualifies.

Contrast with existing A2: "¿Puedo tener una habitación con vistas?" (conditional + complex request), "Quisiera prolongar mi estancia" (formal conditional + noun phrase) are A2.

### Emergencies (Emergenze / Emergencias)

A1 focus: critical survival phrases — must be learned even at A1.

Note: This category has the most overlap between A1 and A2, because emergency phrases must be simple by necessity. Several existing cards are already near A1 simplicity. However, A1 should be even shorter, shout-able phrases.

Representative A1 phrases:
- "¡Ayuda!"
- "¡Llame a la policía!"
- "¡Un médico!"
- "Estoy enfermo/a."
- "Me duele aquí." (while pointing)
- "He perdido mi pasaporte."
- "¿Dónde está el hospital?"
- "¿Dónde está la farmacia?"
- "Soy alérgico/a a [item]."
- "No estoy bien."

Contrast with existing A2: "Alguien me está siguiendo" (present progressive + pronoun), "¿Dónde está la salida de emergencia?" (compound noun phrase) are A2 but barely.

### Social (Conversazioni Sociali / Conversaciones Sociales)

A1 focus: introductions, basic personal information, goodbyes.

Representative A1 phrases:
- "Hola." / "Adiós."
- "Me llamo [name]."
- "¿Cómo te llamas?"
- "Mucho gusto."
- "Soy de [country]."
- "¿De dónde eres?"
- "Tengo [number] años."
- "Hasta luego."
- "¿Hablas español/italiano?"
- "Un poco."

Note: Several existing cards are close to A1 ("¿Cómo te llamas?", "¿De dónde eres?") but carry A2 back-text complexity. The A1 version uses simpler paraphrases.

### Weather (Il Tempo / El Tiempo)

A1 focus: basic weather observations, simple adjectives.

Representative A1 phrases:
- "Hace calor." / "Hace frío."
- "Llueve." / "Está lloviendo." (both common enough for A1)
- "Hace sol."
- "¿Qué tiempo hace?"
- "Está nublado."
- "Hace viento."
- "¡Qué calor!" / "¡Qué frío!"
- "Hoy hace buen tiempo."
- "Hoy hace mal tiempo."
- "¿Necesitas un paraguas?"

Contrast with existing A2: "¿Crees que nevará?" (future + subjunctive), "Debería aclarar por la tarde" (conditional + time clause) are A2.

---

## Feature Dependencies

```
[level property on all cards]
    └──required by──> [level filter UI chips]
                          └──required by──> [filtered renderDecks()]
                                                └──required by──> [filtered getDueCount()]

[level filter persists in localStorage]
    └──enhances──> [level filter UI chips]

[A1 content created (320 new cards)]
    └──required for──> [level filter to show A1 cards]

[existing A2 content tagged]
    └──required for──> [A2 filter chip to work correctly]
```

### Dependency Notes

- **`level` property on cards required by everything:** No filter logic can work until all cards carry a `level` field. This must be done first.
- **A1 content required for user value:** The filter UI can be built independently, but there is nothing to show until A1 content exists. These can be developed in parallel but must both ship together.
- **`getDueCount()` filtering must match `startDeck()` filtering:** If the badge shows 5 cards due but the deck starts with 3 (because level filter wasn't applied to `getDueCount()`), the UX is broken. Both must use the same filter logic.
- **Level preference persistence enhances chips:** Chips work without persistence (defaulting to A1 on every load), but the experience degrades for returning users. Persistence is low complexity and should ship with the chips.
- **One SRS track (no conflict):** The existing `deckId_cardIndex` keying system already accommodates multi-level cards without conflict. A1 cards added after A2 cards in the array will have indices like `daily_20`, `daily_21`, etc. Progress is never lost.

---

## MVP Definition

### Launch With (v1.1)

These features form a coherent, usable milestone. Missing any one of them breaks the user experience.

- [ ] `level` property on all existing 160 cards (tag as `"A2"`) — enables filter to work on existing content
- [ ] A1 phrase content for 8 decks × 2 languages (~320 cards, ~20 per deck per language) — provides content to filter to
- [ ] Level filter chips in deck-selection view, default A1 selected — user-facing access to the feature
- [ ] `renderDecks()` filters deck's card pool by active levels before computing due count — accurate badge
- [ ] `startDeck()` filters card pool by active levels before SRS due check — accurate study session
- [ ] Level preference saved to and loaded from localStorage — returning users not reset to A1 on every visit
- [ ] Prevent deselecting all levels (always at least one chip active) — prevents broken empty state

### Add After Validation (v1.x)

- [ ] Level indicator in deck card badge text ("5 due · A1") — only if user feedback indicates confusion about which level is active
- [ ] B1 content — only after A1 content quality is validated by actual learners

### Future Consideration (v2+)

- [ ] B2/C1/C2 levels — requires domain expansion beyond traveler vocabulary
- [ ] Level-based onboarding quiz ("What level are you?") — only if data shows users are selecting wrong level
- [ ] Cross-device sync — blocked by no-backend constraint, would require major architecture change

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| A1 content (320 new cards, both languages) | HIGH | HIGH (authorship time) | P1 |
| `level` tag on all existing cards | HIGH | LOW (data edit) | P1 |
| Level filter chips (UI) | HIGH | MEDIUM | P1 |
| `renderDecks()` + `getDueCount()` level-aware filtering | HIGH | MEDIUM | P1 |
| `startDeck()` level-aware filtering | HIGH | LOW (small change) | P1 |
| Level preference persistence (localStorage) | MEDIUM | LOW | P1 |
| At-least-one-chip-active guard | MEDIUM | LOW | P1 |
| Level badge text in deck card | LOW | LOW | P2 |
| B1 content | LOW (future) | HIGH | P3 |

---

## Competitor Feature Analysis

| Feature | Duolingo | Babbel | PuroLingua (planned) |
|---------|----------|--------|----------------------|
| CEFR level display | Labels content A1-C2 but doesn't let users filter by it | Courses structured by CEFR level | User-selectable multi-level filter chips |
| Level selection UX | App places user into level via placement test | User picks course level at signup | User picks level at deck-selection screen, can change anytime |
| SRS + levels interaction | Separate courses = separate SRS tracks | Separate courses = separate progress | Shared SRS track across levels (no progress loss) |
| Default for beginners | Placement test or "start from scratch" | Beginner course default | A1 default, explicit opt-in to A2 |
| Level persistence | Account-based | Account-based | localStorage per language |

**Observation:** Major apps gate level behind accounts or placement tests. PuroLingua's zero-friction chip approach is genuinely simpler and more suitable for the app's "open and learn" philosophy.

---

## Implementation Notes for Roadmap

**Phase 1 should be: Content + Data Layer**
- Tag all 160 existing cards as A2
- Create 320 A1 cards (20 per deck × 8 decks × 2 languages)
- No code changes required; pure data work
- Can be done by a non-developer if structure is documented
- Validate content quality before building UI (so UI testing is against real content)

**Phase 2 should be: Filter Logic**
- Add global `activeLevels` state (array, default `["A1"]`)
- Persist to/from localStorage
- Update `getDueCount()` to accept level filter
- Update `startDeck()` to filter card pool by level
- Update `renderDecks()` to pass active levels into due-count calculation

**Phase 3 should be: Filter UI**
- Add chip row above deck grid in HTML
- Wire chip toggles to state + re-render
- Handle always-one-selected guard
- Load persisted preference on init

**Card index stability:** When A1 cards are appended after A2 cards in each deck array, existing progress keys (`daily_0` through `daily_19`) remain valid. No migration needed.

## Sources

- CEFR (Common European Framework of Reference for Languages) — established international standard, Council of Europe. Level descriptors are stable and well-documented.
- Existing PuroLingua codebase reviewed directly: `src/locales/es/decks.js`, `src/locales/it/decks.js`, `src/js/core/app.js`, `src/js/features/progress.js`, `src/js/utils/deck-utils.js`
- PROJECT.md milestone specification reviewed directly
- Competitor patterns (Duolingo, Babbel) based on training knowledge — MEDIUM confidence, verify against current product state if needed

---
*Feature research for: CEFR difficulty levels in a language learning flashcard app*
*Researched: 2026-02-22*
