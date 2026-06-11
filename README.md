# PuroLingua

A browser-based language learning app built with Next.js and React. PuroLingua uses flashcard decks and a spaced repetition algorithm to help you build real conversational vocabulary — no backend required.

**[Live Site](https://purolingua.com/?lang=it)** &nbsp;·&nbsp; **[GitHub](https://github.com/JB-Tellez/purolingua)**

---

## Features

- **Spaced Repetition (Leitner System)** — Cards are scheduled across 3 boxes (1, 3, and 7-day intervals). Correct answers advance a card; incorrect answers reset it to box 1.
- **Multi-language Support** — Currently supports Italian and Spanish, with an extensible i18n system for adding new languages.
- **Topic Decks** — Vocabulary organized into practical categories: Daily Life, Restaurant, Travel, Shopping, Hotel, Emergencies, Social, and Weather.
- **Audio Playback** — Hear any card read aloud via the Web Speech API.
- **Voice Recognition** — Speak your answer and get instant feedback using the browser's speech recognition API.
- **Multiple-Choice Quiz** — The card back presents randomized answer choices including plausible distractors.
- **Q&A Study Mode** — An open-ended question-and-answer mode with voice recognition, alongside the flashcard decks.
- **Persistent Progress** — Progress is saved per language to `localStorage` with no sign-up required.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router), static export |
| UI | React 19 |
| Language | TypeScript |
| i18n | next-intl 4 |
| Styling | Tailwind CSS 4 |
| Unit Tests | Vitest 4 + jsdom (Testing Library) |
| Browser APIs | Web Speech API (TTS + recognition) |
| Persistence | localStorage |
| Deployment | Static export served via nginx, deployed with Coolify |

---

## Getting Started

**Prerequisites:** Node.js 20+ and npm

```bash
# Clone the repository
git clone https://github.com/JB-Tellez/purolingua.git
cd purolingua

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production (static export to `out/`) |
| `npm start` | Serve the production build |
| `npm test` | Run unit tests (Vitest) |

---

## Project Structure

```
purolingua/
├── src/
│   ├── app/[lang]/        # App Router routes (locale-segmented; also /qa, /rephrase)
│   ├── components/        # React UI components
│   ├── hooks/             # useSRS, useQASRS, useLevelFilter, useVoiceRecognition
│   ├── lib/               # srs.ts (Leitner logic), generateChoices.ts
│   ├── data/              # Vocabulary content: it/, es/, qa/
│   ├── types/             # TypeScript types
│   ├── i18n/              # next-intl request config
│   └── __tests__/         # Vitest unit tests (components, hooks, lib)
├── messages/              # UI strings: it.json, es.json
├── next.config.ts
└── vitest.config.ts
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

1. Add `messages/<code>.json` with translated UI strings.
2. Add vocabulary decks under `src/data/<code>/`.
3. Register the new locale in `src/i18n/request.ts` (and the routing config).

The language picker will automatically include the new locale.

---

## License

ISC
