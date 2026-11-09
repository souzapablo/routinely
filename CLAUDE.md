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
- Comment only what the code cannot say: why a non-obvious choice was made, a constraint, a workaround. Never cite the spec in code or comments: no task numbers, requirement or decision IDs, `SPEC_DEVIATION` markers or `.specs/` paths. That trace belongs in `.specs/` and the commit message. `npm test` fails on a comment that cites the spec.

## Branches and pull requests

Each spec ships as a stack of pull requests on GitHub, one per phase in its `tasks.md`. Every phase gets its own branch.

- **Branch per phase**: `feat/NNNN-slug/pN-short-name`, e.g. `feat/0004-anchors/p1-rules-and-server`. Phase 1 branches from `main`. Phase N branches from the tip of phase N-1. Phases with no `tasks.md` (a small fix spec) are one branch and one PR.
- **Where the specs go**: the spec, design and tasks commits go first on the phase 1 branch. The validation and `STATE.md` commits go last on the final phase's branch.
- **PR per phase**: the phase 1 PR targets `main`. The phase N PR targets the phase N-1 branch, so each PR's diff is only that phase. Title: `<type>(<scope>): <phase name> (NNNN, N/M)`. Body: the phase's tasks, plus the whole stack as a list of PR links in order, with the current one marked.
- **Gate per PR**: `npm run check` passes at the tip of every phase branch before its PR opens, plus `npm run e2e` when the phase touches what the browser shows. CI runs on every PR whatever its base.
- **Open as you go**: push the branch and open its PR when the phase's gate passes, then start the next phase from that tip. Don't wait for review.
- **Fixing a lower PR**: commit on that phase's branch, then rebase the branches above it with `git rebase --update-refs` from the top branch and push each one with `--force-with-lease`. Never merge one stack branch into another.
- **Merging**: bottom up, one PR at a time, squash into `main`. After a merge, run `git rebase --onto main <old base tip> <next branch>` (`--update-refs` brings the rest along), retarget the next PR to `main`, force-push with lease, and delete the merged branch.
- **Spec references** (task numbers, requirement IDs) are fine in PR titles, PR bodies and commit messages. They stay out of code and comments.
