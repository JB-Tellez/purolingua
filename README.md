# PuroLingua

A browser-based language learning app built with vanilla JavaScript. PuroLingua uses flashcard decks and a spaced repetition algorithm to help you build real conversational vocabulary — no frameworks, no backend required.

**[Live Site](https://purolingua.com/?lang=it)** &nbsp;·&nbsp; **[GitHub](https://github.com/JB-Tellez/purolingua)**

---

## Features

- **Spaced Repetition (Leitner System)** — Cards are scheduled across 3 boxes (1, 3, and 7-day intervals). Correct answers advance a card; incorrect answers reset it to box 1.
- **Multi-language Support** — Currently supports Italian and Spanish, with an extensible i18n system for adding new languages.
- **Topic Decks** — Vocabulary organized into practical categories: Daily Life, Restaurant, Travel, Shopping, Hotel, Emergencies, Social, and Weather.
- **Audio Playback** — Hear any card read aloud via the Web Speech API.
- **Voice Recognition** — Speak your answer and get instant feedback using the browser's speech recognition API.
- **Multiple-Choice Quiz** — The card back presents randomized answer choices including plausible distractors.
- **Persistent Progress** — Progress is saved per language to `localStorage` with no sign-up required.
- **No Build Required to Use** — Works directly in the browser via Vite's dev server or as a static build.

---

## Tech Stack

| Category | Technology |
|---|---|
| Language | Vanilla JavaScript (ES Modules) |
| Build Tool | Vite |
| Unit Tests | Vitest + jsdom |
| E2E Tests | Playwright (Chromium, Firefox, WebKit) |
| Browser APIs | Web Speech API (TTS + recognition) |
| Persistence | localStorage |
| Styling | Custom CSS |

---

## Getting Started

**Prerequisites:** [Bun](https://bun.sh) or Node.js 18+

```bash
# Clone the repository
git clone https://github.com/JB-Tellez/purolingua.git
cd purolingua

# Install dependencies
bun install

# Start the dev server
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start local dev server |
| `bun run build` | Build for production |
| `bun run preview` | Preview the production build |
| `bun run test` | Run unit tests (Vitest) |
| `bun run test:watch` | Run unit tests in watch mode |
| `bun run test:ui` | Open the Vitest browser UI |
| `bun run test:coverage` | Generate a coverage report |

For end-to-end tests (requires Playwright browsers):

```bash
npx playwright install
npx playwright test
```

---

## Project Structure

```
purolingua/
├── src/
│   ├── js/
│   │   ├── core/          # App bootstrap, state, view routing, i18n
│   │   ├── features/      # Audio, voice recognition, progress tracking, UI helpers
│   │   └── utils/         # Deck utilities (shuffle, choice generation)
│   ├── locales/
│   │   ├── es/            # Spanish UI strings and decks
│   │   └── it/            # Italian UI strings and decks
│   └── css/
│       └── style.css
├── tests/                 # Vitest unit tests
├── vite.config.js
├── vitest.config.js
└── playwright.config.js
```

---

## How the Spaced Repetition Works

Every card starts unreviewed (due immediately). After each session:

| Result | Box | Next Review |
|---|---|---|
| Correct (Box 1 → 2) | 2 | 3 days |
| Correct (Box 2 → 3) | 3 | 7 days |
| Correct (Box 3) | 3 | 7 days |
| Incorrect (any box) | 1 | 1 day |

Progress is stored in `localStorage` under a per-language key, so switching languages preserves each language's independent study history.

---

## Adding a New Language

1. Create `src/locales/<code>/ui.js` with translated UI strings and locale metadata.
2. Create `src/locales/<code>/decks.js` with vocabulary decks.
3. Import and register both in `src/js/core/i18n.js`.

The language picker will automatically include the new locale.

---

## License

ISC
