# Q&A Scenarios — Design Doc

**Date:** 2026-03-08
**Status:** Approved

## Overview

A new activity type alongside the existing Rephrase flashcard mode. Users are presented with a question in the target language and select the most contextually appropriate response from 4 options — all in the target language. No native language is shown once the activity begins.

## Navigation Flow

```
Landing
  └── Pick Language (Italian / Spanish)
        └── Pick Activity (Rephrase / Q&A)
              ├── Rephrase → existing deck browser (unchanged)
              └── Q&A → scenario browser
                    └── Scenario (icon + target-language title)
                          └── Study session (Q&A cards, Leitner SRS)
```

- Language selection remains first, unchanged from today.
- A new Activity Picker screen sits between language and deck/scenario.
- The Rephrase path is completely unchanged.
- The Q&A path leads to a Scenario browser.

## Data Model

```ts
type QACard = {
  id: string                       // e.g. "caffe_01"
  question: string                 // target language
  correct: string                  // target language
  foils: [string, string, string]  // target language
  level: "A1" | "A2"
}

type Scenario = {
  id: string       // e.g. "caffe"
  icon: string     // emoji, e.g. "☕"
  titleIt: string  // "Al Caffè"
  titleEs: string  // "En el Café"
  cards: QACard[]
}
```

### SRS / Persistence

- Progress keys: `qa_{scenarioId}_{cardId}` — stored in the existing localStorage progress object.
- No new persistence mechanism. Same Leitner 3-box system (1-, 3-, 7-day intervals).
- Level filter (A1/A2 chips) applies identically to Q&A sessions — same hook, same FLTR-06 guard.

## Study Session Mechanics

Identical to Rephrase session except no native language appears anywhere:

- **Card front:** question in target language + audio button (TTS reads the question aloud)
- **Card flip:** reveals 4 choices, all in target language
- **Choice selection:** same correct/incorrect feedback as Rephrase
- **Voice recognition:** same spoken answer option available
- **Session header:** scenario icon only (e.g. ☕) — no title text — as a subtle context anchor
- **SRS flow:** correct → advance box, incorrect → back to box 1 (identical to Rephrase)

## Launch Content

7 scenarios per language (Italian + Spanish), parallel content:

| Icon | Italian Title | Spanish Title | Level |
|------|--------------|---------------|-------|
| ☕ | Al Caffè | En el Café | A1 |
| 🏨 | In Albergo | En el Hotel | A1 |
| 🍽️ | Al Ristorante | En el Restaurante | A1 |
| 🗺️ | Per Strada | En la Calle | A1 |
| 🛍️ | Al Negozio | En la Tienda | A2 |
| 🚆 | In Treno | En el Tren | A2 |
| 👋 | Presentazioni | Presentaciones | A1 |

Each scenario: ~8–12 cards at launch.

### Sample Content (Italian)

**Al Caffè (A1)**
- "Buongiorno! Cosa desidera?" → ✓ Un cappuccino, per favore. ✗ Dov'è il bagno? ✗ Mi chiamo Luca. ✗ A domani!
- "Prende qualcosa da mangiare?" → ✓ Sì, un cornetto, grazie. ✗ No, sono americano. ✗ Parlo un po' d'italiano. ✗ A che ora apre?
- "Tutto insieme o separato?" → ✓ Tutto insieme, grazie. ✗ Un bicchiere d'acqua. ✗ Sono allergico al glutine. ✗ È lontano da qui?

**In Albergo (A1)**
- "Ha una prenotazione?" → ✓ Sì, a nome Johnson. ✗ No, grazie, sto bene. ✗ Vorrei un caffè. ✗ Dov'è la stazione?
- "Per quante notti?" → ✓ Per tre notti. ✗ Il bagno è in fondo al corridoio. ✗ Siamo in due. ✗ Alle nove di mattina.
- "Vuole una camera con vista sul mare?" → ✓ Sì, se è possibile. ✗ No, non ho prenotato. ✗ Il ristorante è aperto? ✗ Grazie, buona serata.

**Al Ristorante (A1)**
- "Cosa prende come primo?" → ✓ Per me gli spaghetti al pomodoro. ✗ Il conto, per favore. ✗ Sono senza glutine. ✗ Due caffè, grazie.
- "Da bere?" → ✓ Un'acqua frizzante e un calice di vino rosso. ✗ Molto bene, grazie. ✗ La camera è al terzo piano. ✗ Vado alla stazione.
- "Come ha trovato il cibo?" → ✓ Ottimo, davvero buono! ✗ Alle otto di sera. ✗ È la prima a destra. ✗ Un biglietto di andata e ritorno.

**Per Strada (A1)**
- "Scusi, dov'è la stazione?" → ✓ È sempre dritto, poi gira a sinistra. ✗ Sì, grazie mille! ✗ Mi chiamo Anna. ✗ Vorrei un biglietto.

**Al Negozio (A2)**
- "Posso aiutarla?" → ✓ Sì, cerco una giacca. ✗ No, sto aspettando il treno. ✗ Sì, prenoto per due. ✗ Il museo è chiuso oggi.
- "Che taglia porta?" → ✓ Porto la media. ✗ Costa troppo. ✗ Sono le undici. ✗ Un gelato al limone.
- "Come vuole pagare?" → ✓ Con la carta, grazie. ✗ Ho fame. ✗ Dov'è la fermata dell'autobus? ✗ Buongiorno!

**In Treno (A2)**
- "È libero questo posto?" → ✓ Sì, prego, si accomodi. ✗ Il treno arriva alle tre. ✗ Mi piace viaggiare. ✗ Grazie, buon viaggio!

**Presentazioni (A1)**
- "Come ti chiami?" → ✓ Mi chiamo Sara. E tu? ✗ Ho venticinque anni. ✗ Abito a Roma. ✗ Sto bene, grazie.
- "Da quanto tempo studi l'italiano?" → ✓ Studio italiano da sei mesi. ✗ Mi piace la pizza. ✗ Abito al terzo piano. ✗ Vengo domani.

## Out of Scope

- Mixed Rephrase + Q&A decks — activity types stay fully separate
- English context hints during Q&A session — no native language once activity begins
- B1/B2 scenario content — deferred to v2
