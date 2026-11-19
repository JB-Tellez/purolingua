# PuroLingua

A browser-based language learning app built with Next.js and React. PuroLingua uses flashcard decks and a spaced repetition algorithm to help you build real conversational vocabulary — no backend required.

**[Live Site](https://purolingua.com/)** &nbsp;·&nbsp; **[GitHub](https://github.com/JB-Tellez/purolingua)**

---

## Features

- **Spaced Repetition (Leitner System)** — Cards are scheduled across 3 boxes (1, 3, and 7-day intervals). Correct answers advance a card; incorrect answers reset it to box 1.
- **Multi-language Support** — Currently supports Italian and Spanish, with an extensible i18n system for adding new languages.
- **Topic Decks** — Vocabulary organized into practical categories: Daily Life, Restaurant, Travel, Shopping, Hotel, Emergencies, Social, and Weather.
- **Audio Playback** — Hear any card read aloud via the Web Speech API.
- **Voice Recognition** — Speak your answer and get instant feedback using the browser's speech recognition API.
- **Multiple-Choice Quiz** — The card back presents randomized answer choices including plausible distractors.
- **Q&A Study Mode** — Scenario-based questions answered by multiple choice (one correct answer, three distractors), by tap or by voice, alongside the flashcard decks.
- **Level Filter** — Choose CEFR levels (A1, A2); Rephrase and Q&A each remember their own choice.
- **Practice Replay** — "Study again" replays a finished session without changing your schedule.
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

**Prerequisites:** Node.js 22.18+ and npm (`node scripts/analyze-test-coverage.ts` runs TypeScript directly, which needs Node's built-in type stripping; `package.json` `engines` says the same)

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
| `npm start` | Serve the static export in `out/` with `serve` (run `npm run build` first) |
| `npm test` | Run unit tests (Vitest) |

---

## Project Structure

```
purolingua/
├── src/
│   ├── app/(home)/        # Language picker (/) and its root layout
│   ├── app/[lang]/        # Locale root layout and routes (/qa, /rephrase)
│   ├── components/        # React UI components
│   ├── hooks/             # useSRS, useQASRS, useLevelFilter, useVoiceRecognition
│   ├── lib/               # srs.ts (Leitner logic), generateChoices.ts, matchTranscript.ts, levels.ts, storage/speech helpers
│   ├── data/              # Vocabulary content: it/, es/, qa/
│   ├── types/             # TypeScript types
│   ├── i18n/              # next-intl routing (isLang) and request config
│   └── __tests__/         # Vitest unit tests (app, components, data, hooks, i18n, lib)
├── scripts/               # analyze-test-coverage.ts (static coverage-gap CLI)
├── messages/              # UI strings: it.json, es.json
├── next.config.ts
└── vitest.config.ts
```

---

## System Overview

PuroLingua is a backend-free, statically exported Next.js 16 App Router app (`next.config.ts`: `output: 'export'`, `trailingSlash: true`), built in Docker and served by nginx (`Dockerfile`, `nginx.conf`). All routes are pre-rendered from `generateStaticParams` over `routing.locales` × `DECK_IDS` / `scenarios`. The two study sessions (`rephrase/[deck]/StudySession`, `qa/[scenario]/QAStudySession`) are client-only (`next/dynamic` with `ssr: false`). Content is compiled in from `src/data`, UI strings come from `messages/<locale>.json` via next-intl, learner state lives only in browser `localStorage`, and audio/voice use the Web Speech API.

Request flow: `src/app/[lang]/layout.tsx` (a root layout that renders `<html lang={lang}>`) validates the locale, loads messages, and wraps pages in `NextIntlClientProvider` + `SiteHeader` → a browser page (`DeckGrid` / `ScenarioGrid` with `LevelFilterChips`) → a study session that reads due cards through `useSRS` / `useQASRS` (scheduling math in `src/lib/srs.ts`) and writes results back to `localStorage`.

## Local Interface & Invariants

- `next.config.ts`: `withNextIntl(nextConfig)`; `createNextIntlPlugin('./src/i18n/request.ts')` registers the request config; `output: 'export'` means no server runtime (no API routes, middleware, or request-time rendering).
- `vitest.config.ts`: jsdom environment, `globals: true`, setup file `./src/__tests__/setup.ts`, includes `src/__tests__/**/*.{test,spec}.{ts,tsx}` and `scripts/__tests__/**/*.{test,spec}.ts`, alias `@` → `./src`.
- `vitest.scripts.config.ts`: node environment, includes only `scripts/__tests__/**/*.test.ts`.
- `postcss.config.mjs`: single plugin `@tailwindcss/postcss`.
- `next-env.d.ts`: generated by Next.js; do not edit.

## Subdirectories & System Boundaries

- src: [./src/README.md](./src/README.md) - All application source (intermediate blueprint).
  - src/app: [./src/app/README.md](./src/app/README.md) - Two root layouts (`(home)` and `[lang]`) sharing `RootDocument`, the language picker, and the global 404; locale segment [./src/app/[lang]/README.md](./src/app/[lang]/README.md); deck browser [rephrase](./src/app/[lang]/rephrase/README.md) and session [rephrase/[deck]](./src/app/[lang]/rephrase/[deck]/README.md); scenario browser [qa](./src/app/[lang]/qa/README.md) and session [qa/[scenario]](./src/app/[lang]/qa/[scenario]/README.md).
  - src/components: [./src/components/README.md](./src/components/README.md) - Shared client UI (grids with due badges, quiz buttons, feedback, level chips, `SiteHeader`).
  - src/hooks: [./src/hooks/README.md](./src/hooks/README.md) - `useSRS`, `useQASRS`, `useLevelFilter`, `useVoiceRecognition`.
  - src/lib: [./src/lib/README.md](./src/lib/README.md) - SRS scheduling and key formats, distractor generation, transcript matching, levels, and thin storage/speech helpers.
  - src/data: [./src/data/README.md](./src/data/README.md) - `deckMetadata`, `DECK_IDS`, `DECK_MAP`; [it](./src/data/it/README.md), [es](./src/data/es/README.md) decks; [qa](./src/data/qa/README.md) scenarios.
  - src/i18n: [./src/i18n/README.md](./src/i18n/README.md) - next-intl `routing`, `isLang`, and request config.
  - src/types: [./src/types/README.md](./src/types/README.md) - Domain types only.
- scripts: [./scripts/README.md](./scripts/README.md) - `analyze-test-coverage.ts` static coverage-gap CLI.

## Global Invariants

- **Persisted storage keys are a compatibility contract.** `{lang}-progress` holds one `ProgressRecord` shared by Rephrase (`{deckId}_{cardIndex}`, `src/lib/srs.ts:getCardKey`) and Q&A (`qa_{scenarioId}_{cardId}`, `src/lib/srs.ts:getQACardKey`), read and written through `src/lib/progressStorage.ts`; `{lang}-level-filter` holds the Rephrase level filter; Q&A has its own `{lang}-qa-level-filter` (added after v1.1), which starts from the Rephrase value until Q&A saves one. `{lang}-progress`, `{deckId}_{cardIndex}`, and `{lang}-level-filter` match v1.1, the pre-Next.js app on the `vanilla` branch (`src/js/features/progress.js`), so existing users keep their progress; the Q&A keys were added later and are this app's own contract.
- **Card position and id are persisted identity.** Reordering or inserting cards mid-array in `src/data/it` / `src/data/es`, or renaming a Q&A `card.id` / scenario `id`, orphans stored progress.
- **Every deck has 40 cards, 20 per level.** `src/__tests__/data/decks.test.ts` checks the real `DECK_MAP`, and that `DECK_IDS` lists every deck.
- **The level filter is never empty.** `useLevelFilter.setActiveLevels(null | [])` is a no-op (FLTR-06); `LevelFilterChips` relies on this guard.
- **Static params must agree.** Each dynamic segment's `layout.tsx` and `page.tsx` both export `generateStaticParams` (client pages cannot), and they must produce the same set.
- **`routing.locales` is the one locale list.** `src/types:Lang` is derived from `src/i18n/routing.ts:routing.locales`, and routes validate with `isLang`. The per-language tables (`src/app/(home)/page.tsx:LANGUAGES`, `src/components/SiteHeader.tsx:LANG_META`, `src/data/deckMap.ts:DECK_MAP`, `src/lib/locale.ts:LANG_LOCALE`) are typed `Record<Lang, …>`, so `tsc` fails until each has the new locale. Not compiler-checked: `messages/*.json`, `src/data/decks.ts:deckMetadata`, and the Q&A `*It` / `*Es` fields.
- **Dates are UTC `YYYY-MM-DD` strings**, compared lexicographically (`src/lib/srs.ts:isCardDue`).

## Global Side Effects

- Browser `localStorage`: read/write `{lang}-progress`, `{lang}-level-filter` (Rephrase), and `{lang}-qa-level-filter` (Q&A). SRS writes always re-read the stored record first. `SiteHeader` reset removes `{lang}-progress` (both Rephrase and Q&A progress), but not the level filters, then reloads the page.
- Web Speech API: `speechSynthesis` playback (`src/lib/speak.ts`, used by `AudioButton` and both sessions) and `SpeechRecognition` / `webkitSpeechRecognition` microphone capture (`useVoiceRecognition`).
- Network: Google Fonts from `fonts.googleapis.com` / `fonts.gstatic.com` (`src/app/RootDocument.tsx`); no other runtime network calls.
- Build time: `package.json` imported for the version footer; `messages/<locale>.json` loaded by `src/i18n/request.ts`; static output written to `out/`.

## System Verification

- Run: `npx vitest run` (single run; `npm test` starts Vitest in watch mode in an interactive terminal).
- Scripts only: `npx vitest run --config vitest.scripts.config.ts`.
- Type check: `npx tsc --noEmit`.
- Coverage gaps: `node scripts/analyze-test-coverage.ts src/` (see [scripts/README.md](./scripts/README.md) for its limits).

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
2. Add the locale to `routing.locales` in `src/i18n/routing.ts`. `Lang` follows automatically.
3. Add vocabulary decks under `src/data/<code>/` (40 cards each, 20 per level), then register them in `src/data/deckMap.ts` (`DECK_MAP`) and `src/data/decks.ts` (`deckMetadata`).
4. Run `npx tsc --noEmit` and add the locale to each table it reports: `LANGUAGES` (`src/app/(home)/page.tsx`), `LANG_META` (`src/components/SiteHeader.tsx`), `DECK_MAP` (step 3), and `LANG_LOCALE` (`src/lib/locale.ts`).

The language picker in `src/components/SiteHeader.tsx` lists every `LANG_META` entry, so it needs no other change. Q&A scenarios only carry Italian fields and parallel `*Es` fields; any non-`it` locale currently shows the Spanish fields.

---

## License

MIT — see [LICENSE](./LICENSE).
