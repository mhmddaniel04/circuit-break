# Circuit Break: The Logic Gate Puzzle Game

A web-based puzzle game that teaches Form 5 students how logic gates (AND, OR, NOT) work.
Players place gate tiles on a grid to route power from binary sources to target lightbulbs.

**Course:** CSC536 · **Group:** CDCS2536B · **Lecturer:** Dr. Nurul Hijja Mazlan

## Tech stack

React · TypeScript · Vite · Zustand · React Router · i18next (EN/BM) · Vitest · Oxlint · Prettier

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start the dev server             |
| `npm run build`     | Type-check and build for release |
| `npm run lint`      | Check code with Oxlint           |
| `npm run format`    | Format all files with Prettier   |
| `npm run typecheck` | Check TypeScript types           |
| `npm run test`      | Run tests in watch mode          |
| `npm run test:run`  | Run tests once                   |

## Project structure

```
src/
├── app/         App shell and routes
├── pages/       One folder per screen
├── features/    Game features (board, simulation, hints, scoring, progress)
├── levels/      Level data (JSON)
├── components/  Reusable UI components
├── i18n/        English and Bahasa Melayu text
├── store/       Global state
└── styles/      Design tokens and global CSS
```
