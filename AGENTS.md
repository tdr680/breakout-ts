# Repository Guidelines

## Project Structure & Module Organization

This repository is currently plan-first; `PLAN.md` is the source of truth for the intended Breakout implementation. The planned Vite project should keep browser code under `src/`, with gameplay and canvas rendering in `src/main.ts` and presentation rules in `src/style.css`. Keep `index.html` minimal and place any future static assets in `public/`. Do not add a game framework or split the code into many modules unless complexity clearly justifies it.

If automated tests are introduced, place them beside the code as `src/*.test.ts` or in a top-level `tests/` directory, but use one convention consistently.

## Build, Test, and Development Commands

After the Vite + TypeScript scaffold is added, use:

- `npm install` — install locked project dependencies.
- `npm run dev` — start Vite's local development server.
- `npm run build` — type-check and produce the production bundle.
- `npm run preview` — serve the production bundle for final browser checks.

No test command or test framework exists yet. Do not document or rely on `npm test` until it is added to `package.json`.

## Coding Style & Naming Conventions

Use TypeScript with two-space indentation, semicolons, single quotes, and explicit types for game-state objects. Prefer small functions and plain interfaces over classes. Use `camelCase` for variables and functions, `PascalCase` for types, and `UPPER_SNAKE_CASE` for fixed gameplay constants. Keep physics in canvas coordinates and avoid unexplained numeric literals. Follow the existing formatter or linter configuration if one is later introduced.

## Testing Guidelines

Until automated tests are added, run `npm run build` and complete the manual scenarios in `PLAN.md`: paddle boundaries, wall/paddle/brick collisions, win and loss states, restart behavior, and responsive canvas scaling. When adding tests, name them by behavior, for example `collision.test.ts`, and cover state transitions and edge cases rather than canvas pixel output.

## Commit & Pull Request Guidelines

There is no Git history from which to infer conventions. Use short imperative commit subjects, such as `Add paddle input handling`, and keep each commit focused. Pull requests should summarize behavior changes, list verification performed, link relevant issues, and include a screenshot or short recording for visual gameplay changes. Note any intentional deviation from `PLAN.md`.
