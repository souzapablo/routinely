# Routinely

A calm weekly planner built around anchors (fixed parts of the week) with flexible goals placed around them. One user, local network only, English and pt-BR.

## Read first

- `docs/product.md`: what the product is and its design principles
- `docs/adr/`: architecture decisions (stack: React + TypeScript, Node, SQLite)
- `.specs/STATE.md`: project decisions (AD-NNN) and the current handoff; feature specs live in `.specs/features/`

## Commands

| Command         | What it does                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`   | Web app with hot reload on `http://localhost:5173` plus the API on port 3000                        |
| `npm run build` | Builds the web app into `dist/web`                                                                  |
| `npm start`     | One Node process serves `dist/web` and the API on `0.0.0.0:3000` (`PORT`, `DATABASE_PATH` override) |
| `npm run check` | Typecheck, lint, format check, tests and build, in that order; stops at the first failure           |
| `npm test`      | Every unit, component and integration test once (Vitest projects `web` and `server`)                |
| `npm run e2e`   | Builds and starts the app on port 3100 and runs the Playwright tests in Chromium                    |

Also: `npm run typecheck`, `npm run lint`, `npm run format` (writes) and `npm run format:check`.

First time on a machine, before `npm run e2e`: `npx playwright install chromium`.

## Rules

- Run `npm run check` before calling a task done, and `npm run e2e` when a change touches what the browser shows. The exit code decides, not a read of the code.
- Never make the user feel bad for undone items. Nothing undone is called missed, failed, overdue, late or skipped, in any language; no streaks; no red or warning styling on undone things (red is only for real errors). `docs/product.md` has the full rule, and it overrides every other design choice.
- Every UI string goes through i18n, in both `src/web/i18n/en.json` and `src/web/i18n/pt-BR.json`. Dates and times follow the active language.
- Server and shared code run on Node's type stripping: erasable syntax only (no `enum`, `namespace` or parameter properties) and `.ts` extensions on relative imports.
- Rules that change what the user sees live in plain functions with unit tests, not inside components.
