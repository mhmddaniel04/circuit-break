# Circuit Break: The Logic Gate Puzzle Game

A web puzzle game that teaches Form 5 (SPM) students how logic gates work. Players place AND, OR, NOT, NAND, NOR and XOR gates on a circuit board to light the right bulbs, and **Bit**, an AI tutor, gives hints without giving away the answer.

**▶ Play:** https://circuit-break-sigma.vercel.app/

**Course:** CSC536 · **Group:** CDCS2536B · **Lecturer:** Dr. Nurul Hijja Mazlan

## Learning objectives

1. **Evaluate** the output (0 or 1) of the basic logic gates for given inputs.
2. **Build and repair** combinational circuits that send power to the right outputs.

## Features

- **30 levels in 5 worlds**: NOT → AND → OR → combined circuits and repairs → NAND, NOR, XOR and a half adder
- **Truth-table testing**: many levels check every input combination, with a results table and ✓ / ✗ on each bulb
- **AI hints from Bit** (Google Gemini): 3 hints per level, each more specific, based on the student's own circuit. A written hint is shown when offline
- **Stars, score and timer**, with progress saved in the browser
- **Learn Gates** page with interactive truth tables
- **English and Bahasa Melayu**
- **Accessible**: keyboard play, colour-blind mode, screen-reader labels, WCAG 2.1 AA contrast
- **Installable and offline**: add it to a phone's home screen and play without internet

## Tech stack

| Area     | Tools                                                    |
| -------- | -------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, React Router, Zustand, i18next  |
| AI hints | Google Gemini via a Vercel serverless function           |
| Testing  | Vitest, Testing Library, Playwright, axe-core            |
| Quality  | Oxlint, Prettier, Husky, GitHub Actions                  |
| Hosting  | Vercel (auto-deploys from GitHub), PWA (vite-plugin-pwa) |

## Getting started

```bash
npm install
cp .env.example .env    # then put your Gemini API key in .env
npm run dev
```

Open http://localhost:5173. Without a key the game still works; Bit shows the written hints.

## Scripts

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Start the dev server (with `/api/hint`) |
| `npm run build`       | Type-check and build for release        |
| `npm run preview`     | Serve the built game locally            |
| `npm run lint`        | Check code with Oxlint                  |
| `npm run format`      | Format all files with Prettier          |
| `npm run typecheck`   | Check TypeScript types                  |
| `npm run test:run`    | Unit and component tests (Vitest)       |
| `npm run test:e2e`    | Browser tests (Playwright)              |
| `npm run test:e2e:ui` | Watch the browser tests play the game   |

## Project structure

```
api/hint.ts          Vercel function: POST /api/hint
server/              Hint server code (Gemini, validation, rate limit)
src/
├── app/             App shell and routes
├── pages/           Home, World Map, Level, Learn, Settings
├── features/
│   ├── simulation/  Logic engine: gates, circuit evaluation, solver (no React)
│   ├── board/       Circuit board, toolbox, results table
│   ├── hints/       AI hint client and Bit's panel
│   ├── scoring/     Stars and score rules
│   ├── progress/    Saved progress and level unlocking
│   └── settings/    Sound, colour-blind mode
├── levels/data/     The 30 levels, one JSON file per world
├── components/ui/   Shared buttons, stars, toggle, confetti
└── i18n/            English and Bahasa Melayu text
tests/e2e/           Playwright browser tests
docs/                Architecture, testing plan, quiz, feedback form
```

## Adding a level

Add an object to the right file in `src/levels/data/`. The tests check every level automatically: valid wiring, inside the grid, and **solvable with its toolbox**.

## Testing

- **170** unit and component tests: `npm run test:run`
- **47** browser tests, including solving **all 30 levels** through the real interface and an accessibility scan of every page: `npm run test:e2e`

See [docs/testing/](docs/testing/) for the student testing plan, quiz and feedback form.

## Deployment

Pushing to `main` deploys to production on Vercel; pushing to `dev` creates a preview link. The Gemini key is stored only in Vercel's environment variables (`GEMINI_API_KEY`), never in the code.
