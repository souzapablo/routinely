# Project Skeleton Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/0001-project-skeleton/design.md`
**Status**: Approved
**Approved**: 2026-11-06 - user: "task approved, run t1"
**Mutations**: 3
**Build**: `npm run build; npm run typecheck; npm run lint`

---

## Test Coverage Matrix

> Generated from the approved spec and design (no code or tests exist yet; test types and runners were settled in design.md Tech Decisions). Guidelines found: none - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Shared contract (zod schema) | none | build gate only | `src/shared/*.ts` | build gate only |
| Web rules (`healthView`, `detectLanguage`) | unit | All branches; 1:1 to spec ACs; every listed edge case | `src/web/**/*.test.ts` | `npx vitest run --project web` |
| Web hooks and components | component (Vitest + jsdom + Testing Library) | Every state the spec names and every control's gesture | `src/web/**/*.test.tsx`, `src/web/**/*.test.ts` | `npx vitest run --project web` |
| Server data access (`db.ts`) | integration (real SQLite in a temp folder) | Create, open, ping, failure | `src/server/**/*.test.ts` | `npx vitest run --project server` |
| Server routes and app | integration (`app.inject()`) | Every route: happy, error, 404, SPA fallback | `src/server/**/*.test.ts` | `npx vitest run --project server` |
| Server entry | integration (child process) | Listen log, port in use | `src/server/index.test.ts` | `npx vitest run --project server` |
| Harness and repo files | integration (runs the tools / reads the files) | Every harness and repo AC | `test/*.test.ts` | `npx vitest run --project server` |
| Whole app in a browser | e2e (Playwright, Chromium) | Connected state, widths, language after reload | `e2e/*.spec.ts` | `npm run e2e` |
| Config files (tsconfig, eslint, prettier, vite) | none | build gate only | root config files | build gate only |

## Gate Check Commands

> Generated from the design - confirm before Execute. T1 and T2 run before every tool exists, so their gate is the subset that exists at that point.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Bootstrap | T1-T2, before Vitest, ESLint and Prettier exist | `npm install` (T1); `npm run typecheck` (T2) |
| Quick | Tasks with unit, component or integration tests only | `npm run typecheck && npx vitest run` |
| Full | Tasks with e2e tests | `npm run typecheck && npx vitest run && npm run e2e` |
| Build | Config-only tasks and the end of each phase | `npm run typecheck && npm run lint && npm run format:check && npx vitest run && npm run build` (= `npm run check` once T17 adds it) |

---

## Execution Plan

Phases run in order; tasks within a phase run in order.

### Phase 1: Toolchain

```
T1 → T2 → T3 → T4 → T5
```

### Phase 2: Server

```
T6 → T7 → T8 → T9
```

### Phase 3: Web

```
T10 → T11 → T12 → T13 → T14 → T15
```

### Phase 4: Harness and repo

```
T16 → T17 → T18 → T19
```

---

## Task Breakdown

### T1: Create the repo and package manifest ✅

**What**: Run `git init`, add `.gitignore`, `.nvmrc` (`26`), and `package.json` with `engines.node` `>=26 <27`, `"type": "module"`, and the dependencies from design.md Tech Decisions at the versions that resolve together (TypeScript pinned to `6.0.3`). Then run `npm install` to produce `package-lock.json`.
**Where**: `package.json`
**Depends on**: None
**Reuses**: design.md Tech Decisions; versions checked on 2026-11-06
**Requirement**: SKEL-29, SKEL-32

**Done when**:

- [x] `git status` works and `node_modules/` is not listed
- [x] `npm install` exits 0 with no peer-dependency errors
- [x] `npx tsc --version` prints `Version 6.0.3`

**Tests**: none (config; SKEL-29 and SKEL-32 are proven by T18 and T19)
**Gate**: bootstrap - `npm install`
**Commit**: `chore: initialize repo and package manifest`

---

### T2: Add TypeScript configs and the shared health contract ✅

**What**: Add `tsconfig.json` (references only), `tsconfig.web.json` (DOM, `src/web` + `src/shared`) and `tsconfig.node.json` (Node types, `src/server` + `src/shared` + `test` + root config files), all `strict`, `noEmit`, `erasableSyntaxOnly`, `allowImportingTsExtensions`, `verbatimModuleSyntax`. Add `src/shared/health.ts` with the `HealthResponse` zod schema and type, and the `typecheck` script.
**Where**: `tsconfig.node.json`, `tsconfig.web.json`, `src/shared/health.ts`
**Depends on**: T1
**Reuses**: design.md Data Models
**Requirement**: SKEL-17

**Done when**:

- [x] `npm run typecheck` exits 0
- [x] An `enum` in `src/shared` makes `npm run typecheck` fail (checked by hand, then removed)

**Tests**: none (config + schema; SKEL-17/18 are proven by T17)
**Gate**: bootstrap - `npm run typecheck`
**Commit**: `chore: add TypeScript configs and shared health contract`

---

### T3: Add the Vitest projects and the health view rule ✅

**What**: Add `vite.config.ts` with the React plugin and two Vitest projects: `web` (jsdom, `src/web/**/*.test.{ts,tsx}`, jest-dom setup) and `server` (node, `src/server/**/*.test.ts`, `test/**/*.test.ts`). Add the `test` script (`vitest run`). Add `src/web/health/healthView.ts` (`toHealthView`) with its unit tests.
**Where**: `src/web/health/healthView.ts`
**Depends on**: T2
**Reuses**: `src/shared/health.ts`
**Requirement**: SKEL-05, SKEL-06, SKEL-07

**Done when**:

- [x] `toHealthView` returns connected/connected for `200` with a valid body, connected/unreachable for `503`, connected/unreachable for a body that fails the schema, and unreachable/unreachable for `{ kind: "failed" }`
- [x] Gate passes: `npm run typecheck && npx vitest run`
- [x] Test count: 4 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add health view rule and Vitest projects`

---

### T4: Add ESLint ✅

**What**: Add `eslint.config.js` with typescript-eslint type-aware recommended rules (both tsconfigs), eslint-plugin-react-hooks recommended rules for `src/web`, and ignores for `dist/`, `data/`, `test/fixtures/`. Add the `lint` script (`eslint .`).
**Where**: `eslint.config.js`
**Depends on**: T3
**Reuses**: -
**Requirement**: SKEL-19

**Done when**:

- [x] `npm run lint` exits 0 on the repo
- [x] Gate passes: `npm run typecheck && npm run lint && npx vitest run`

**Tests**: none (config; SKEL-19 is proven by T17)
**Gate**: build (without format and build, which don't exist yet)
**Commit**: `chore: add ESLint with type-aware and React hooks rules`

---

### T5: Add Prettier ✅

**What**: Add `.prettierrc.json`, `.prettierignore` (`dist/`, `data/`, `package-lock.json`, `test/fixtures/`), and the `format` / `format:check` scripts; format the repo once.
**Where**: `.prettierrc.json`
**Depends on**: T4
**Reuses**: -
**Requirement**: SKEL-20

**Done when**:

- [x] `npm run format:check` exits 0
- [x] Gate passes: `npm run typecheck && npm run lint && npm run format:check && npx vitest run`

**Tests**: none (config; SKEL-20 is proven by T17)
**Gate**: build (without build, which doesn't exist yet)
**Commit**: `chore: add Prettier`

---

### T6: Add the database module ✅

**What**: `openDatabase(path)` creates missing parent folders, opens the file with `node:sqlite` `DatabaseSync`, and returns `{ ping(), close() }`; `ping` runs `SELECT 1` and throws on failure.
**Where**: `src/server/db.ts`
**Depends on**: None in this phase (Phase 1 completes first)
**Reuses**: -
**Requirement**: SKEL-03

**Done when**:

- [x] Opening `<tmp>/a/b/routinely.db` creates both folders and the file
- [x] `ping()` succeeds on an open database and throws after `close()`
- [x] Gate passes: `npm run typecheck && npx vitest run`
- [x] Test count: 7 tests pass (4 + 3)

**Tests**: integration
**Gate**: quick
**Commit**: `feat(server): add SQLite database module`

---

### T7: Add the Fastify app and health route ✅

**What**: `buildApp({ db })` returns a Fastify instance with `GET /api/health` answering `200 {"status":"ok","db":"ok"}` when `db.ping()` succeeds and `503 {"status":"error","db":"error"}` when it throws, and `404` JSON for unknown `/api/*` paths.
**Where**: `src/server/app.ts`, `src/server/routes/health.ts`
**Depends on**: T6
**Reuses**: `src/shared/health.ts`, `src/server/db.ts` (`Database` type)
**Requirement**: SKEL-01, SKEL-02

**Done when**:

- [x] `app.inject()` tests cover 200, 503 and an unknown `/api/nope` → 404
- [x] Gate passes: `npm run typecheck && npx vitest run`
- [x] Test count: 10 tests pass (7 + 3)

**Tests**: integration
**Gate**: quick
**Commit**: `feat(server): add Fastify app with health route`

---

### T8: Serve the built web app with an SPA fallback

**What**: When `webRoot` is given, `buildApp` serves its files with `@fastify/static` and returns `index.html` for any non-`/api` GET that matches no file.
**Where**: `src/server/app.ts` (modify)
**Depends on**: T7
**Reuses**: `src/server/app.ts`
**Requirement**: SKEL-28

**Done when**:

- [ ] With a temp `webRoot` holding `index.html` and `assets/app.js`: `/assets/app.js` returns the file, `/some/page` returns `index.html`, `/api/nope` still returns 404 JSON
- [ ] Gate passes: `npm run typecheck && npx vitest run`
- [ ] Test count: 13 tests pass (10 + 3)

**Tests**: integration
**Gate**: quick
**Commit**: `feat(server): serve built web app with SPA fallback`

---

### T9: Add the server entry

**What**: `src/server/index.ts` reads `PORT` (default `3000`) and `DATABASE_PATH` (default `data/routinely.db`), opens the database, builds the app with `webRoot` `dist/web`, listens on `0.0.0.0`, logs `Routinely listening on http://0.0.0.0:<port>`, and on `EADDRINUSE` logs `Port <port> is already in use` to stderr and exits `1`. Adds the `start` script.
**Where**: `src/server/index.ts`
**Depends on**: T8
**Reuses**: `src/server/app.ts`, `src/server/db.ts`
**Requirement**: SKEL-25, SKEL-26, SKEL-27

**Done when**:

- [ ] Child-process tests: the server answers `/api/health` on the given `PORT`, prints exactly one listening line, and exits `1` naming the port when the port is taken
- [ ] Gate passes: `npm run typecheck && npx vitest run`
- [ ] Test count: 16 tests pass (13 + 3)

**Tests**: integration
**Gate**: quick
**Commit**: `feat(server): add server entry with port and startup handling`

---

### T10: Add the language detection rule

**What**: `detectLanguage(saved, browserLanguages)` returns a saved `en` / `pt-BR`; otherwise `pt-BR` when the first browser language starts with `pt`, else `en`.
**Where**: `src/web/i18n/detectLanguage.ts`
**Depends on**: None in this phase (Phase 2 completes first)
**Reuses**: -
**Requirement**: SKEL-10, SKEL-11, SKEL-15

**Done when**:

- [ ] Tests cover: `pt-BR` and `pt-PT` browser → pt-BR; `en-US`, `es`, empty list → en; saved `en` beats a `pt` browser; saved `fr` is ignored
- [ ] Gate passes: `npm run typecheck && npx vitest run`
- [ ] Test count: 20 tests pass (16 + 4)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add language detection rule`

---

### T11: Set up i18n with English and pt-BR

**What**: `src/web/i18n/index.ts` initializes i18next + react-i18next with `en.json` and `pt-BR.json` (every string from the spec), starts in `detectLanguage(localStorage, navigator.languages)`, and on `languageChanged` saves `routinely.lang` (in `try/catch`) and sets `document.documentElement.lang`.
**Where**: `src/web/i18n/index.ts`, `src/web/i18n/en.json`, `src/web/i18n/pt-BR.json`
**Depends on**: T10
**Reuses**: `src/web/i18n/detectLanguage.ts`
**Requirement**: SKEL-14, SKEL-16

**Done when**:

- [ ] Tests: changing the language sets `<html lang>` and writes `routinely.lang`; a throwing `localStorage` doesn't break the change
- [ ] Both JSON files have the same keys (tested)
- [ ] Gate passes: `npm run typecheck && npx vitest run`
- [ ] Test count: 23 tests pass (20 + 3)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): set up i18n for English and pt-BR`

---

### T12: Add the useHealth hook

**What**: `useHealth()` fetches `/api/health` once on mount, aborts after 5 seconds with its own `setTimeout` + `AbortController` (so fake timers drive it), maps the result with `toHealthView`, and returns `{ state: "checking" }` or `{ state: "done", view, checkedAt }`.
**Where**: `src/web/health/useHealth.ts`
**Depends on**: T11
**Reuses**: `src/web/health/healthView.ts`
**Requirement**: SKEL-04, SKEL-07

**Done when**:

- [ ] `renderHook` tests: starts `checking`; a 200 gives connected/connected; a fetch that never answers gives unreachable/unreachable after 5 s and not before; unmounting aborts the request
- [ ] Gate passes: `npm run typecheck && npx vitest run`
- [ ] Test count: 27 tests pass (23 + 4)

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add useHealth hook with 5 s timeout`

---

### T13: Add the status page

**What**: `StatusPage` renders the heading "Routinely", "Checking…" while checking, then the server and database lines and "Checked at {time}" (time via `Intl.DateTimeFormat` in the active language); failure lines use `--bad`.
**Where**: `src/web/StatusPage.tsx`
**Depends on**: T12
**Reuses**: `src/web/health/useHealth.ts`, `src/web/i18n/index.ts`
**Requirement**: SKEL-04, SKEL-05, SKEL-06, SKEL-07, SKEL-08

**Done when**:

- [ ] Tests with a mocked `fetch`: checking state; 200; 503; network error; checked-at time shows `2:05 PM` in en and `14:05` in pt-BR for a fixed clock
- [ ] Gate passes: `npm run typecheck && npx vitest run`
- [ ] Test count: 32 tests pass (27 + 5)

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add status page`

---

### T14: Add the language switch

**What**: `LanguageSwitch` shows "English" and "Português" and changes the i18next language on click, without a reload.
**Where**: `src/web/LanguageSwitch.tsx`
**Depends on**: T13
**Reuses**: `src/web/i18n/index.ts`
**Requirement**: SKEL-12, SKEL-13

**Done when**:

- [ ] Tests render `LanguageSwitch` with `StatusPage`: picking "Português" shows every spec pt-BR string (checking, connected and can't-connect states); picking "English" shows the English strings again
- [ ] Gate passes: `npm run typecheck && npx vitest run`
- [ ] Test count: 34 tests pass (32 + 2)

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add language switch`

---

### T15: Add the app shell, styles and dev setup

**What**: Add `index.html`, `src/web/main.tsx` (imports i18n, renders `App`), `src/web/App.tsx` (`StatusPage` + `LanguageSwitch`), `src/web/styles.css` (prototype light/dark tokens, layout that fits 360 px), Vite `build.outDir` `dist/web` and the `/api` proxy to port 3000, and the `dev` (`concurrently`) and `build` scripts.
**Where**: `src/web/App.tsx`, `src/web/main.tsx`, `index.html`, `src/web/styles.css`
**Depends on**: T14
**Reuses**: prototype `:root` tokens, `src/web/StatusPage.tsx`, `src/web/LanguageSwitch.tsx`
**Requirement**: SKEL-24, SKEL-25

**Done when**:

- [ ] Component test: `App` renders the heading and both language buttons
- [ ] `npm run build` writes `dist/web/index.html`
- [ ] `npm run dev` shows "Server: connected" and "Database: connected" at `http://localhost:5173` (walked by hand)
- [ ] Gate passes: `npm run typecheck && npm run lint && npm run format:check && npx vitest run && npm run build`
- [ ] Test count: 35 tests pass (34 + 1)

**Tests**: component
**Gate**: build
**Commit**: `feat(web): add app shell, styles and dev setup`

---

### T16: Add the Playwright end-to-end tests

**What**: Add `playwright.config.ts` (Chromium; `webServer` runs `npm run build && npm start` with `PORT=3100` and a temp `DATABASE_PATH`) and `e2e/status.spec.ts`; add the `e2e` script.
**Where**: `e2e/status.spec.ts`
**Depends on**: None in this phase (Phase 3 completes first)
**Reuses**: `npm run build`, `npm start`
**Requirement**: SKEL-09, SKEL-14, SKEL-22, SKEL-25

**Done when**:

- [ ] E2E: shows "Server: connected" and "Database: connected"; no horizontal scroll at 360 px and 1280 px; "Português" survives a reload
- [ ] Gate passes: `npm run typecheck && npx vitest run && npm run e2e`
- [ ] Test count: 35 unit/component/integration + 3 e2e pass

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): add status page end-to-end tests`

---

### T17: Add the harness tests and the check script

**What**: Add the `check` script (`npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`) and `test/harness.test.ts`, which runs the real tools: typecheck on the repo; typecheck with a temp file holding a type error; ESLint on `test/fixtures/hooks-violation.tsx`; Prettier on `test/fixtures/unformatted.ts`; and reads the `test` and `check` scripts.
**Where**: `test/harness.test.ts`
**Depends on**: T16
**Reuses**: `package.json` scripts, `eslint.config.js`, `.prettierrc.json`
**Requirement**: SKEL-17, SKEL-18, SKEL-19, SKEL-20, SKEL-21, SKEL-23

**Done when**:

- [ ] The six harness tests pass, and the temp type-error file is removed even when a test fails
- [ ] `npm run check` exits 0
- [ ] Gate passes: `npm run check`
- [ ] Test count: 41 tests pass (35 + 6)

**Tests**: integration
**Gate**: build
**Commit**: `test: add harness tests and check script`

---

### T18: Add the GitHub Actions workflow

**What**: Add `.github/workflows/ci.yml` (on `push` and `pull_request`; `actions/setup-node` with `node-version-file: .nvmrc` and npm cache; `npm ci`, `npx playwright install --with-deps chromium`, `npm run check`, `npm run e2e`) and `test/repo.test.ts` with the workflow and Node-pin tests (parses YAML with `yaml`).
**Where**: `.github/workflows/ci.yml`, `test/repo.test.ts`
**Depends on**: T17
**Reuses**: `.nvmrc`, `package.json` `engines`
**Requirement**: SKEL-30, SKEL-32

**Done when**:

- [ ] Repo tests pass: both triggers run the three commands; `.nvmrc` major = `engines` major and CI reads `.nvmrc`
- [ ] Gate passes: `npm run check`
- [ ] Test count: 43 tests pass (41 + 2)

**Tests**: integration
**Gate**: build
**Commit**: `ci: add GitHub Actions workflow`

---

### T19: Add CLAUDE.md

**What**: Add `CLAUDE.md` (commands `dev`, `build`, `start`, `check`, `test`, `e2e`; first-time `npx playwright install chromium`; pointers to `docs/product.md`, `docs/adr/` and `.specs/STATE.md`; rules: run `npm run check` before calling a task done, never make the user feel bad for undone items), plus repo tests for `CLAUDE.md` and `.gitignore` (`git check-ignore`).
**Where**: `CLAUDE.md`, `test/repo.test.ts` (modify)
**Depends on**: T18
**Reuses**: `docs/product.md` design principles
**Requirement**: SKEL-29, SKEL-31

**Done when**:

- [ ] Repo tests pass: `CLAUDE.md` names the six commands and both doc paths; `git check-ignore` matches `node_modules/x`, `dist/x`, `data/routinely.db`, `.env`
- [ ] Gate passes: `npm run check`
- [ ] Test count: 45 tests pass (43 + 2)

**Tests**: integration
**Gate**: build
**Commit**: `docs: add CLAUDE.md`

---

## Checks

**C1** - `GET /api/health` answers `200` `{"status":"ok","db":"ok"}` when the ping succeeds (SKEL-01, AC 1)
Proof: `npx vitest run src/server/routes/health.test.ts -t "answers 200 ok when the database ping succeeds"`

**C2** - `GET /api/health` answers `503` `{"status":"error","db":"error"}` when the ping throws (SKEL-02, AC 2)
Proof: `npx vitest run src/server/routes/health.test.ts -t "answers 503 error when the database ping throws"`

**C3** - Opening a missing `DATABASE_PATH` creates the file and its parent folders (SKEL-03, AC 3)
Proof: `npx vitest run src/server/db.test.ts -t "creates the database file and missing parent folders"`

**C4** - The page shows "Routinely" and "Checking…" until the check answers (SKEL-04, AC 4)
Proof: `npx vitest run src/web/StatusPage.test.tsx -t "shows the heading and Checking until the health check answers"`

**C5** - A `200` shows "Server: connected" and "Database: connected" (SKEL-05, AC 5)
Proof: `npx vitest run src/web/StatusPage.test.tsx -t "shows server and database connected on 200"`

**C6** - A `503` shows "Server: connected" and "Database: can't connect" (SKEL-06, AC 6)
Proof: `npx vitest run src/web/StatusPage.test.tsx -t "shows database can't connect on 503"`

**C7** - A network error shows "Server: can't connect" and "Database: can't connect" (SKEL-07, AC 7)
Proof: `npx vitest run src/web/StatusPage.test.tsx -t "shows both can't connect on a network error"`

**C8** - No answer within 5 seconds counts as a failure, and an answer before 5 s does not (SKEL-07, AC 7)
Proof: `npx vitest run src/web/health/useHealth.test.ts -t "fails after 5 seconds without an answer"`

**C9** - "Checked at {time}" shows `2:05 PM` in English and `14:05` in pt-BR (SKEL-08, AC 8)
Proof: `npx vitest run src/web/StatusPage.test.tsx -t "shows the checked-at time in the active language"`

**C10** - The page has no horizontal scroll at 360 px and 1280 px (SKEL-09, AC 9)
Proof: `npx playwright test e2e/status.spec.ts -g "fits 360 px and 1280 px without horizontal scroll"`

**C11** - With no saved language, a browser language starting with `pt` gives pt-BR (SKEL-10, AC 1)
Proof: `npx vitest run src/web/i18n/detectLanguage.test.ts -t "picks pt-BR when the browser language starts with pt"`

**C12** - With no saved language, any other browser language gives English (SKEL-11, AC 2)
Proof: `npx vitest run src/web/i18n/detectLanguage.test.ts -t "picks English when the browser language is not Portuguese"`

**C13** - Picking "Português" shows every spec text in pt-BR without a reload (SKEL-12, AC 3)
Proof: `npx vitest run src/web/LanguageSwitch.test.tsx -t "switching to Português shows every text in pt-BR"`

**C14** - Picking "English" shows every text in English without a reload (SKEL-13, AC 4)
Proof: `npx vitest run src/web/LanguageSwitch.test.tsx -t "switching back to English shows every text in English"`

**C15** - The picked language is still active after a reload (SKEL-14, AC 5)
Proof: `npx playwright test e2e/status.spec.ts -g "keeps the picked language after a reload"`

**C16** - A saved language other than `en` / `pt-BR` is ignored (SKEL-15, AC 6)
Proof: `npx vitest run src/web/i18n/detectLanguage.test.ts -t "ignores a saved value other than en or pt-BR"`

**C17** - `<html lang>` matches the active language (SKEL-16, AC 7)
Proof: `npx vitest run src/web/i18n/index.test.ts -t "sets the html lang attribute to the active language"`

**C18** - `npm run typecheck` exits 0 on the clean repo with `strict` on (SKEL-17, AC 1)
Proof: `npx vitest run test/harness.test.ts -t "typecheck passes on the clean repo"`

**C19** - A type error makes `npm run typecheck` exit non-zero and name the file (SKEL-18, AC 2)
Proof: `npx vitest run test/harness.test.ts -t "typecheck fails and names a file with a type error"`

**C20** - `npm run lint` reports a React hooks rule violation and exits non-zero (SKEL-19, AC 3)
Proof: `npx vitest run test/harness.test.ts -t "lint reports a React hooks rule violation"`

**C21** - `npm run format:check` exits non-zero on an unformatted file (SKEL-20, AC 4)
Proof: `npx vitest run test/harness.test.ts -t "format check fails on an unformatted file"`

**C22** - `npm test` runs every test once, across the `web` and `server` projects (SKEL-21, AC 5)
Proof: `npx vitest run test/harness.test.ts -t "npm test runs every test once in both projects"`

**C23** - `npm run e2e` passes only when the browser shows both connected lines (SKEL-22, AC 6)
Proof: `npx playwright test e2e/status.spec.ts -g "shows server and database connected"`

**C24** - `npm run check` runs typecheck, lint, format check, tests and build in that order and stops at the first failure (SKEL-23, AC 7)
Proof: `npx vitest run test/harness.test.ts -t "check runs every step in order and stops at the first failure"`

**C25** - `npm run dev` serves the page with hot reload and `/api/*` reaches the API (SKEL-24, AC 1)
Proof: walk - run `npm run dev`, open `http://localhost:5173`, see "Server: connected" and "Database: connected"; edit a string in `en.json` and see it change without a reload

**C26** - The started server listens on `0.0.0.0` at `PORT` and answers the API (SKEL-25, AC 2)
Proof: `npx vitest run src/server/index.test.ts -t "listens on 0.0.0.0 at PORT and answers the API"`

**C27** - On listen, the server logs one line with the address and port (SKEL-26, AC 3)
Proof: `npx vitest run src/server/index.test.ts -t "logs one line with the address and port"`

**C28** - A busy port makes the server log the port and exit `1` (SKEL-27, AC 4)
Proof: `npx vitest run src/server/index.test.ts -t "exits 1 and names the port when it is in use"`

**C29** - A non-`/api` path returns the web app's `index.html` (SKEL-28, AC 5)
Proof: `npx vitest run src/server/app.test.ts -t "returns index.html for a non-api path"`

**C30** - `.gitignore` excludes `node_modules/`, build output, `data/` and `.env` files (SKEL-29, AC 1)
Proof: `npx vitest run test/repo.test.ts -t "gitignore excludes node_modules, build output, data and env files"`

**C31** - The CI workflow runs `npm ci`, `npm run check` and `npm run e2e` on `push` and `pull_request` (SKEL-30, AC 2)
Proof: `npx vitest run test/repo.test.ts -t "CI runs npm ci, check and e2e on push and pull_request"`

**C32** - `CLAUDE.md` lists the six commands and points to `docs/product.md` and `docs/adr/` (SKEL-31, AC 3)
Proof: `npx vitest run test/repo.test.ts -t "CLAUDE.md lists the commands and points to the docs"`

**C33** - The Node major is pinned in `.nvmrc` and `engines`, and CI reads `.nvmrc` (SKEL-32, AC 4)
Proof: `npx vitest run test/repo.test.ts -t "Node major is pinned in .nvmrc, engines and CI"`

---

## Handoff

**Settled mid-build:** 2026-11-06 - asked to start T4 while T3 was not done; user chose "Do T3, then T4 (Recommended)"; T5 also adds `.gitattributes` (`* text=auto eol=lf`, `core.autocrlf` is on) and ignores `.specs/` in `.prettierignore` (skill scripts generate files there) - user: "go for it"
**Dispatched:** none
**Walked:** none

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 → T2 → T3 → T4 → T5
Phase 2:  T6 → T7 → T8 → T9
Phase 3:  T10 → T11 → T12 → T13 → T14 → T15
Phase 4:  T16 → T17 → T18 → T19
```

Execution is strictly sequential. 19 tasks pack into 3 batches of whole phases: Phases 1-2 (9 tasks), Phase 3 (6 tasks), Phase 4 (4 tasks).
