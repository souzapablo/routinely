# STATE

## Decisions

### AD-001
- **Decision**: The app is one npm package with `src/web`, `src/server` and `src/shared`, not npm workspaces.
- **Reason**: The user chose it to spend learning time on React and TypeScript, not monorepo tooling; `src/shared` still gives one place for code both sides use.
- **Trade-off**: No enforced package boundaries; web code could import server code by mistake (the two tsconfigs make that a type error).
- **Scope**: Whole repo
- **Date**: 2026-11-06
- **Status**: active

### AD-002
- **Decision**: The API uses Fastify 5.
- **Reason**: The user chose it over Hono for its mature TypeScript types, built-in pieces and `app.inject()` route testing.
- **Trade-off**: Fastify-specific request/reply APIs instead of web-standard `Request`/`Response`.
- **Scope**: `src/server`
- **Date**: 2026-11-06
- **Status**: active

### AD-003
- **Decision**: The server talks to SQLite through Node's built-in `node:sqlite` with plain SQL; the ORM is chosen with the first real schema.
- **Reason**: The user chose it; the skeleton runs one query, and choosing an ORM before any schema exists would be a guess. No native module to compile.
- **Trade-off**: Drizzle has no `node:sqlite` driver, so adopting Drizzle later means switching to better-sqlite3 behind the `Database` module.
- **Scope**: `src/server/db.ts` and every feature that adds tables
- **Date**: 2026-11-06
- **Status**: superseded by AD-021

### AD-004
- **Decision**: The server's TypeScript runs directly on Node 26 type stripping; only the web app is built. Server code uses erasable syntax only and `.ts` import extensions.
- **Reason**: No server compile step or `dist/server`; `tsc` is used only to check.
- **Trade-off**: No `enum`, `namespace` or parameter properties in server and shared code (`erasableSyntaxOnly` enforces it).
- **Scope**: `src/server`, `src/shared`
- **Date**: 2026-11-06
- **Status**: active

### AD-005
- **Decision**: The web app has a design system in `src/web/ui/`: tokens in one global `tokens.css` (light and dark, ported from the prototype), components styled with CSS Modules and built in-house on native elements. Outside `src/web/ui/`, app code may not use `button`, `input`, `select`, `textarea`, `a`, `label`, `h1`-`h6`, `p` or `span`; an ESLint rule fails `npm run check` when it does. `div`, `section`, `main` and similar structural elements stay allowed.
- **Reason**: The user wants reusable components and "never use basic itens, such as <button>". User chose "Interactive + text (Recommended)", "CSS Modules (Recommended)" and "Build them ourselves (Recommended)".
- **Trade-off**: Every new kind of control or text style needs a component first; no headless library, so complex widgets (dialog, popover) are written and tested by us.
- **Scope**: `src/web`
- **Date**: 2026-11-08
- **Status**: active (AD-005)

### AD-006
- **Decision**: React Router picks the page in the web app: `/` is the planner, `/status` the health page.
- **Reason**: User chose "React Router (Recommended)" over a hand-written path check and TanStack Router.
- **Trade-off**: One more dependency and its concepts; the server already sends `index.html` for any non-API GET, so no server change.
- **Scope**: `src/web`
- **Date**: 2026-11-08
- **Status**: active (AD-006)

### AD-007
- **Decision**: Storybook is the design-system catalog (`npm run storybook`). Stories are typechecked and linted by `npm run check`; building Storybook is not part of check.
- **Reason**: User chose "Storybook" for the catalog and "Typecheck + lint stories (Recommended)" for the gate.
- **Trade-off**: Several dev dependencies and their config; a story that renders wrongly is not caught by the gate.
- **Scope**: `src/web/ui`, tooling
- **Date**: 2026-11-08
- **Status**: active (AD-007)

### AD-008
- **Decision**: Icons come from `lucide-react`, used only through our `<Icon>` component in `src/web/ui/`.
- **Reason**: User chose "lucide-react behind our <Icon> (Recommended)"; the prototype's icons are in the Lucide style.
- **Trade-off**: A dependency; changing the icon set later touches only `<Icon>`.
- **Scope**: `src/web`
- **Date**: 2026-11-08
- **Status**: active (AD-008)

### AD-009
- **Decision**: Bricolage Grotesque, Instrument Sans and JetBrains Mono are self-hosted through `@fontsource` packages, bundled into `dist/web`.
- **Reason**: The app runs on the local network only; user chose "Self-host via @fontsource (Recommended)".
- **Trade-off**: Font files add to the bundle.
- **Scope**: `src/web`
- **Date**: 2026-11-08
- **Status**: active (AD-009)

### AD-010
- **Decision**: The main view leaves out the prototype's proposal intro (heading, paragraph, Anchor/Flexible legend), the "What changed from the first mockup" notes with Next steps, and the "This is an example week" banner.
- **Reason**: Asked "Which of these go into the real main view?"; user chose "Drop all three (Recommended)".
- **Trade-off**: The legend that explains anchors vs flexible items is gone from the screen.
- **Scope**: Main view
- **Date**: 2026-11-08
- **Status**: active (AD-010)

### AD-011
- **Decision**: Planner controls that do not work yet (week arrows, Today, Add activity, checkboxes, Find a time, + New flexible activity, move back to list) are drawn as in the prototype but natively disabled: not focusable, no action. They are not faded, except the Today button, which the prototype draws faded on the current week.
- **Reason**: Asked "What should the main view do with them?" after the user chose a static layout; user chose "Draw them, disabled (Recommended)" ("They appear exactly as in the prototype ... but they are disabled").
- **Trade-off**: The screen shows controls that do nothing until later features enable them.
- **Scope**: Main view, until each control's feature
- **Date**: 2026-11-08
- **Status**: active (AD-011)

### AD-012
- **Decision**: The language switch sits on the right of the top bar, and the top bar is the shell of every page, `/status` included.
- **Reason**: Asked where the language switch and status page go; user chose "Switch in top bar, status at /status (Recommended)" and "Same top bar, status card below (Recommended)".
- **Trade-off**: The top bar has one control the prototype does not draw.
- **Scope**: `src/web`
- **Date**: 2026-11-08
- **Status**: active (AD-012)

### AD-013
- **Decision**: The week grid's current-time line uses the accent color, not the prototype's red.
- **Reason**: Red is only for real errors (docs/product.md). Asked "What color should the now-line be?"; user chose "Accent teal (Recommended)".
- **Trade-off**: None beyond departing from the prototype.
- **Scope**: Week grid
- **Date**: 2026-11-08
- **Status**: active (AD-013)

### AD-014
- **Decision**: The "Days you showed up" row is drawn without the red dot and line the prototype shows at its left (a CSS class collision in the prototype).
- **Reason**: Asked "Should the build reproduce the red-dot bug?"; user chose "No, fix it (Recommended)".
- **Trade-off**: None.
- **Scope**: Today strip
- **Date**: 2026-11-08
- **Status**: active (AD-014)

### AD-015
- **Decision**: The tray header keeps the "N left" count of times still to place this week; a planning count is not a gap from a target under the product rule.
- **Reason**: Asked what the tray header should show given "never what's left undone or a gap from a target"; user chose "Keep \"4 left\" (Recommended)".
- **Trade-off**: A number that counts what is not yet planned stays on screen.
- **Scope**: "Fit in this week" tray
- **Date**: 2026-11-08
- **Status**: active (AD-015)

### AD-016
- **Decision**: The top bar's status slot shows "Example week" with a grey dot while the view shows the example fixture, where the captured prototype reads "Saving on this device only" with a green dot.
- **Reason**: Asked "What should that slot show?"; user chose "\"Example week\" (Recommended)". Nothing saves in this feature.
- **Trade-off**: None; the save states come with persistence.
- **Scope**: Top bar, until persistence
- **Date**: 2026-11-08
- **Status**: superseded by AD-023

### AD-017
- **Decision**: Planner rules (what appears, counts, order, positions, formatted dates) live in pure functions in `src/web/planner/model/` over the types in `src/shared/planner.ts`; planner components only render the results.
- **Reason**: CLAUDE.md requires rules in plain unit-tested functions; asked where the rules live, user chose "Small view-model functions (Recommended)".
- **Trade-off**: More small modules; a component change that needs a new number needs a model change first.
- **Scope**: `src/web/planner`, `src/shared/planner.ts`
- **Date**: 2026-11-08
- **Status**: active (AD-017)

### AD-018
- **Decision**: The layout gap scale is `--space-0`…`--space-7` = 0, 4, 6, 8, 10, 12, 16, 20 px, in `src/web/ui/styles/spacing.css`. The prototype's one-off 14, 18 and 28 px gaps stay in the CSS of the component that uses them.
- **Reason**: The prototype has no spacing scale and its main view uses ten gap values; `Stack`'s `gap` takes eight. Asked "Which values should --space-0 … --space-7 hold?"; user chose "0 4 6 8 10 12 16 20 (Recommended)".
- **Trade-off**: Three gaps are not on the scale and are written as raw px in their components.
- **Scope**: `src/web/ui`
- **Date**: 2026-11-08
- **Status**: active (AD-018)

### AD-019
- **Decision**: Under 640 px the top bar wraps: mark, "Routinely", the status slot and the + button stay on the first row as in the phone capture, and the language switch moves to a right-aligned second row.
- **Reason**: With the language switch (AD-012) on one row, 390 px pushed "Example week" under the Add button and cut "Português", and 360 px scrolled sideways. Asked "How should the top bar fit on narrow screens?"; user chose "Switch wraps to 2nd row (Recommended)".
- **Trade-off**: The top bar is taller on phones than in the prototype.
- **Scope**: Top bar
- **Date**: 2026-11-08
- **Status**: active (AD-019)

### AD-020
- **Decision**: The week runs Sunday to Saturday. `DayIndex` is the calendar weekday (Sunday 0 … Saturday 6, as `Date.getDay()`), and a week key is the week's Sunday.
- **Reason**: User: "sunday should be the first day of the week, not monday". Numbering days by calendar weekday keeps a stored day meaning the same weekday if the first day later becomes a setting ("maybe letter this could be a setting, but not right now").
- **Trade-off**: Fixed for now; a setting would change `weekStartOf` and the display order, and any rule that compares day indexes as positions in the week (the example week's "before today") would then need the offset.
- **Scope**: `src/web/planner/model/week.ts`, `src/shared/planner.ts`, every feature that stores days or weeks
- **Date**: 2026-11-08
- **Status**: active (AD-020)

### AD-021
- **Decision**: No ORM. The server keeps `node:sqlite` with hand-written SQL in one repository module per table. The schema comes from an ordered list of SQL migration steps in `src/server/migrations.ts`, applied by `openDatabase` and tracked with `PRAGMA user_version`. Each step runs in one transaction.
- **Reason**: With anchors as the first real table, user chose "Plain SQL, node:sqlite (Recommended)" over Drizzle + better-sqlite3 and Kysely. No new dependency and no native module.
- **Trade-off**: Every table's SQL and row mapping is written by hand; no generated types from the schema.
- **Scope**: `src/server`, every feature that adds tables
- **Date**: 2026-11-09
- **Status**: active (AD-021)

### AD-022
- **Decision**: Modal surfaces (the drawer, later dialogs) are design-system components built on the native `<dialog>` with `showModal()`. The browser provides the focus trap, Escape, the inert background and the backdrop. Component tests stub `showModal`/`close` in `test-setup.ts`, and focus behaviour is asserted in Playwright.
- **Reason**: User chose "Native <dialog> (Recommended)" over a hand-built modal.
- **Trade-off**: jsdom has no `showModal`, so focus trapping is proven only in e2e.
- **Scope**: `src/web/ui`
- **Date**: 2026-11-09
- **Status**: active (AD-022)

### AD-023
- **Decision**: The top bar's status slot shows the anchors' save state: "Loading your week…", "Saving…" (accent), "Saved" (green), "Not saved" and "Couldn't load your week" (red). "Example week" is gone.
- **Reason**: The example week leaves the planner with the anchors feature (spec 0004, "Real anchors only"); AD-016 was meant to last only until persistence.
- **Trade-off**: None.
- **Scope**: Top bar
- **Date**: 2026-11-09
- **Status**: active (AD-023)

### AD-024
- **Decision**: Playwright runs with one worker, and every e2e test that depends on stored data resets it through the API in `beforeEach` (delete all, then seed).
- **Reason**: The e2e server uses one database file shared across test files and runs; parallel workers would race on the same tables.
- **Trade-off**: The e2e suite runs serially.
- **Scope**: `e2e/`, `playwright.config.ts`
- **Date**: 2026-11-09
- **Status**: active (AD-024)

### AD-025
- **Decision**: Each spec ships as a stack of GitHub pull requests, one per phase in its `tasks.md`. Every phase has its own branch (`feat/NNNN-slug/pN-short-name`) built on the previous phase's branch. Phase 1's PR targets `main` and each later PR targets the branch below it. The stack merges bottom up with squash, rebasing the rest onto `main` after each merge. `CLAUDE.md` ("Branches and pull requests") has the procedure.
- **Reason**: User: "each spec is a stack on github. each phase being one PR" and "each phase should create a branch". A PR per phase keeps each review to one phase's diff.
- **Trade-off**: A fix in a lower phase means rebasing and force-pushing every branch above it, and squash merges mean the next branch is rebased with `--onto` after each merge.
- **Scope**: Git and GitHub workflow, every spec from 0004 on
- **Date**: 2026-11-09
- **Status**: active (AD-025)

## Handoff
