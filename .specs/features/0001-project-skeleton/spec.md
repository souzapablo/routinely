# Project Skeleton Specification

**Approved**: 2026-11-06 - user: "approved"

## Problem Statement

Routinely has a product brief and a stack decision (ADR-001), but no code. Before any planner feature is built, the repo needs a thin, working slice: browser → API → SQLite. It also needs the harness that lets every later change be checked automatically: type checking, lint and format, unit and component tests, an end-to-end smoke test, and CI. Building it first means every later feature starts with a safety net, instead of tests and tooling being added late.

## Goals

- [ ] One command (`npm run dev`) starts the app, and the status page shows the API and database as connected, in English or pt-BR.
- [ ] One command (`npm run check`) runs type checking, lint, the format check, unit and component tests, and the build, and exits 0 on a clean repo.
- [ ] Every push and pull request to GitHub runs the same checks plus the end-to-end smoke test.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Planner features (anchors, flexible activities, the week grid) | Later features; the skeleton only proves the layers connect |
| Domain tables in SQLite (activities, placements) | Schema belongs to the first planner feature |
| Creating the GitHub repo, pushing, or enabling Actions | A remote action; needs a separate go-ahead from the user |
| Local pre-commit hooks | User chose GitHub Actions as the place checks run |
| Running the server as an OS service, Docker, HTTPS | Deployment is a later concern; v1 runs on plain HTTP on the LAN (product brief) |
| Login or any access control | Product brief: local network only, no login in v1 |
| Languages other than English and pt-BR | Product brief |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| What the skeleton screen shows | A status page with the API and database state | Exercises every layer without starting planner features | y - user chose "Status page" |
| i18n in the skeleton | English + pt-BR wired from the first commit | Avoids retrofitting strings later | y - user chose "Yes, in skeleton" |
| Where CI runs | GitHub Actions workflow file in the repo | User choice; the repo itself is not created or pushed here | y - user chose "GitHub Actions" |
| Who writes the code | The agent writes everything, then walks the user through each file | User choice for this feature | y - user chose "You write, I review" |
| Language on first visit | pt-BR when the browser language starts with `pt`, otherwise English | Matches what the user's browser already says | y - approved with the spec |
| Where the language choice is stored | The browser's local storage on that device | A per-device UI preference, not planner data | y - approved with the spec |
| Port and network interface | Listens on `0.0.0.0`, port `3000`, overridable with `PORT` | Reachable from the phone on the same LAN (product brief) | y - approved with the spec |
| SQLite file location | `data/routinely.db`, overridable with `DATABASE_PATH`; ignored by git | Keeps personal data out of the repo | y - approved with the spec |
| Health check timeout in the browser | 5 seconds | Long enough for a LAN, short enough to not look stuck | y - approved with the spec |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: See that every layer is connected ⭐ MVP

**User Story**: As the owner, I want a page that shows whether the API and the database answer, so that I know the whole stack runs before I build features on it.

**Why P1**: It's the walking skeleton: without it, no later feature has a proven path from the browser to SQLite.

**Acceptance Criteria**:

1. WHEN a client sends `GET /api/health` and a query against the SQLite database succeeds THEN the API SHALL respond `200` with the JSON body `{"status":"ok","db":"ok"}`.
2. IF the SQLite query fails during `GET /api/health` THEN the API SHALL respond `503` with the JSON body `{"status":"error","db":"error"}`.
3. WHEN the API starts and the file at `DATABASE_PATH` does not exist THEN the API SHALL create the SQLite database file at that path, including missing parent folders.
4. WHEN the status page loads THEN the system SHALL show the heading "Routinely" and the text "Checking…" until the health check answers.
5. WHEN the health check returns `200` THEN the status page SHALL show "Server: connected" and "Database: connected".
6. WHEN the health check returns `503` THEN the status page SHALL show "Server: connected" and "Database: can't connect".
7. IF the health check fails with a network error or gets no answer within 5 seconds THEN the status page SHALL show "Server: can't connect" and "Database: can't connect".
8. WHEN the health check answers THEN the status page SHALL show "Checked at {time}", with the time of the answer formatted for the active language (e.g. "2:05 PM" in English, "14:05" in pt-BR).
9. The status page SHALL render without horizontal scrolling at window widths of 360 px and 1280 px.

**Independent Test**: Run `npm run dev`, open the page, and see "Server: connected" and "Database: connected". Then point `DATABASE_PATH` at an unreadable path and see "Database: can't connect".

---

### P1: Use the app in English or Portuguese ⭐ MVP

**User Story**: As the owner, I want to switch the interface between English and Portuguese, so that every later screen is built bilingual from the start.

**Why P1**: The product brief requires both languages in v1; wiring it now keeps every later string translatable.

**Acceptance Criteria**:

1. WHEN the status page loads with no saved language and the browser language starts with `pt` THEN the system SHALL show the page in pt-BR.
2. WHEN the status page loads with no saved language and the browser language does not start with `pt` THEN the system SHALL show the page in English.
3. WHEN the owner picks "Português" in the language switch THEN the system SHALL show every text on the page in pt-BR without a page reload: "Verificando…", "Servidor: conectado", "Servidor: sem conexão", "Banco de dados: conectado", "Banco de dados: sem conexão", "Verificado às {time}".
4. WHEN the owner picks "English" in the language switch THEN the system SHALL show every text on the page in English without a page reload.
5. WHEN the page is reloaded after the owner picked a language THEN the system SHALL show the page in the language picked last.
6. IF the saved language is anything other than `en` or `pt-BR` THEN the system SHALL ignore it and choose the language from the browser as in criteria 1 and 2.
7. The system SHALL set the page's `lang` attribute to the active language (`en` or `pt-BR`).

**Independent Test**: Open the page, switch to "Português", see all texts in pt-BR, reload, and see pt-BR again.

---

### P1: Check every change with one command ⭐ MVP

**User Story**: As the owner, I want type checking, lint, formatting, tests and the build behind one command, so that I (and an agent) can tell a change is safe without reviewing every line.

**Why P1**: This is the harness: it's what makes later features cheap to verify.

**Acceptance Criteria**:

1. WHEN the owner runs `npm run typecheck` THEN the system SHALL type-check the web, server and shared code with TypeScript `strict` mode on and exit 0 when there are no type errors.
2. IF any TypeScript file has a type error THEN `npm run typecheck` SHALL exit non-zero and name the file.
3. WHEN the owner runs `npm run lint` THEN the system SHALL lint all source files, including the React hooks rules, and exit non-zero on any lint error.
4. WHEN the owner runs `npm run format:check` THEN the system SHALL exit non-zero if any source file is not formatted.
5. WHEN the owner runs `npm test` THEN the system SHALL run every unit and component test once and exit non-zero if any test fails.
6. WHEN the owner runs `npm run e2e` THEN the system SHALL start the built app, open the status page in a real browser, and pass only if "Server: connected" and "Database: connected" appear.
7. WHEN the owner runs `npm run check` THEN the system SHALL run typecheck, lint, format check, tests and build in that order and stop at the first failure with a non-zero exit.

**Independent Test**: Run `npm run check` on a clean clone and see it exit 0. Add a type error and see it exit non-zero.

---

### P1: Run the app in development and on the LAN ⭐ MVP

**User Story**: As the owner, I want one command for development and one for running the built app, so that I can work on it on my laptop and use it from my phone on the same network.

**Why P1**: The product brief makes the LAN the way the app is used.

**Acceptance Criteria**:

1. WHEN the owner runs `npm run dev` THEN the system SHALL start the web dev server with hot reload and the API together, with browser requests to `/api/*` reaching the API.
2. WHEN the owner runs `npm run build` and then `npm start` THEN a single Node process SHALL serve both the built web app and the API on `0.0.0.0` at port `PORT` (default `3000`).
3. WHEN the server starts listening THEN it SHALL log one line with the address and port it listens on.
4. IF the port is already in use when the server starts THEN the server SHALL log the port number and exit with a non-zero code.
5. WHEN a browser on the LAN requests any non-`/api` path from the running built app THEN the server SHALL return the web app's `index.html`.

**Independent Test**: Run `npm run build && npm start`, open `http://<laptop-ip>:3000` on the phone, and see the status page connected.

---

### P1: Repo ready for agents and CI ⭐ MVP

**User Story**: As the owner, I want the repo under git, with a CI workflow and a `CLAUDE.md`, so that every change is checked on push and an agent knows how to work here.

**Why P1**: The harness only works if checks run on every change and the agent knows the commands.

**Acceptance Criteria**:

1. The repository SHALL be a git repository whose `.gitignore` excludes `node_modules/`, build output, the `data/` folder and `.env` files.
2. The repository SHALL contain a GitHub Actions workflow that runs on `push` and `pull_request` and executes `npm ci`, `npm run check` and `npm run e2e`.
3. The repository SHALL contain a `CLAUDE.md` that lists the `dev`, `build`, `start`, `check`, `test` and `e2e` commands, and points to `docs/product.md` and `docs/adr/`.
4. The repository SHALL pin the Node major version in `.nvmrc` and in `package.json` `engines`, and the CI workflow SHALL use the version from `.nvmrc`.

**Independent Test**: Run `git status` and see a clean tree after the first commit. Read the workflow file and see the three commands on both triggers.

---

## Edge Cases

- IF the SQLite query fails during `GET /api/health` THEN the API SHALL respond `503` (P1 health, criterion 2).
- IF the API is down or slower than 5 seconds THEN the status page SHALL show "Server: can't connect" (P1 health, criterion 7).
- IF the saved language is unknown THEN the system SHALL fall back to the browser language (P1 i18n, criterion 6).
- IF the port is in use THEN the server SHALL exit non-zero and name the port (P1 run, criterion 4).

Implicit-requirement sweep:

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | The saved language is limited to `en` / `pt-BR` (i18n criterion 6). `PORT` and `DATABASE_PATH` come from the owner's environment. |
| Failure / partial-failure states | Database failure (health criterion 2), API unreachable or slow (health criterion 7), port in use (run criterion 4). |
| Idempotency / retry / duplicate handling | N/A because the skeleton has only one read-only `GET` endpoint. |
| Auth boundaries & rate limits | N/A because the product brief limits v1 to one user on the local network, with no login. |
| Concurrency / ordering | N/A because the health check is read-only and there is one user. |
| Data lifecycle / expiry | The database file is created on first start (health criterion 3) and excluded from git (repo criterion 1); no data is stored yet. |
| Observability | One startup log line with the address and port (run criterion 3) and a log line for a port conflict (run criterion 4). |
| External-dependency failure | SQLite is the only dependency; its failure is health criterion 2. |
| State-transition integrity | N/A because the skeleton has no stateful entities. |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SKEL-01 | P1: Layers connected - health 200 | Execute (T7) | Implemented |
| SKEL-02 | P1: Layers connected - health 503 | Execute (T7) | Implemented |
| SKEL-03 | P1: Layers connected - create DB file | Execute (T6) | Implemented |
| SKEL-04 | P1: Layers connected - loading text | Design | Pending |
| SKEL-05 | P1: Layers connected - all connected | Design | Pending |
| SKEL-06 | P1: Layers connected - DB can't connect | Design | Pending |
| SKEL-07 | P1: Layers connected - server can't connect | Design | Pending |
| SKEL-08 | P1: Layers connected - checked-at time | Design | Pending |
| SKEL-09 | P1: Layers connected - 360/1280 px widths | Design | Pending |
| SKEL-10 | P1: Languages - pt browser default | Execute (T10) | Implemented |
| SKEL-11 | P1: Languages - English browser default | Execute (T10) | Implemented |
| SKEL-12 | P1: Languages - switch to Português | Design | Pending |
| SKEL-13 | P1: Languages - switch to English | Design | Pending |
| SKEL-14 | P1: Languages - remembered on reload | Design | Pending |
| SKEL-15 | P1: Languages - unknown saved value | Execute (T10) | Implemented |
| SKEL-16 | P1: Languages - `lang` attribute | Execute (T11) | Implemented |
| SKEL-17 | P1: One command - typecheck passes | Design | Pending |
| SKEL-18 | P1: One command - typecheck fails | Design | Pending |
| SKEL-19 | P1: One command - lint | Design | Pending |
| SKEL-20 | P1: One command - format check | Design | Pending |
| SKEL-21 | P1: One command - tests | Design | Pending |
| SKEL-22 | P1: One command - e2e | Design | Pending |
| SKEL-23 | P1: One command - check | Design | Pending |
| SKEL-24 | P1: Run - dev | Design | Pending |
| SKEL-25 | P1: Run - build + start on LAN | Execute (T9) | Implemented |
| SKEL-26 | P1: Run - startup log | Execute (T9) | Implemented |
| SKEL-27 | P1: Run - port in use | Execute (T9) | Implemented |
| SKEL-28 | P1: Run - SPA fallback | Execute (T8) | Implemented |
| SKEL-29 | P1: Repo - git + .gitignore | Design | Pending |
| SKEL-30 | P1: Repo - CI workflow | Design | Pending |
| SKEL-31 | P1: Repo - CLAUDE.md | Design | Pending |
| SKEL-32 | P1: Repo - Node version pinned | Design | Pending |

**Coverage:** 32 total, 0 mapped to tasks, 32 unmapped ⚠️ (mapped in Tasks)

---

## Sources

- `docs/product.md` - single user, LAN only, no login, English + pt-BR, plain HTTP, no install
- `docs/adr/001-use-react-typescript-node-and-sqlite.md` - React + TypeScript (Vite), Node + TypeScript, SQLite; library choices left to this feature's design

---

## Success Criteria

- [ ] `npm run check` and `npm run e2e` both exit 0 on a fresh clone after `npm ci`.
- [ ] The status page shows "Server: connected" and "Database: connected" on the laptop and on the phone over the LAN.
- [ ] The owner can read every file in the skeleton and explain what it does after the walkthrough.
