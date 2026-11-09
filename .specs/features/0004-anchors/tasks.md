# Anchors Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/0004-anchors/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from the codebase, the project rules and the spec. Guidelines found: `CLAUDE.md` (rules that change what the user sees live in plain functions with unit tests; `npm run check` before done; `npm run e2e` when the browser changes; no spec citations in comments), `vite.config.ts` (Vitest projects `web` and `server`), `playwright.config.ts`. Samples: `src/server/routes/health.test.ts`, `src/server/db.test.ts`, `src/server/index.test.ts`, `src/web/health/useHealth.test.ts`, `src/web/planner/model/schedule.test.ts`, `src/web/app/TopBar.test.tsx`, `e2e/main.spec.ts`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Shared rules | unit | Every rule and its order; every boundary (60/61 chars, 0/1425, step, touching, first shared day); 1:1 to ANC-26…33, 35 | `src/shared/*.test.ts` | `npx vitest run --project server` |
| Database and migrations | integration (real temp-file SQLite) | Fresh file, already-migrated file, failing step rolls back | `src/server/*.test.ts` | `npx vitest run --project server` |
| Repository | integration (real temp-file SQLite) | Every method, ordering, missing id | `src/server/anchors/*.test.ts` | `npx vitest run --project server` |
| Routes | integration (`app.inject` over a real temp-file DB) | Every route: happy path, each rule code, 404, 409, `invalid`, nothing changed on failure | `src/server/anchors/routes.test.ts` | `npx vitest run --project server` |
| Server entry | integration (child process) | Restart keeps anchors | `src/server/index.test.ts` | `npx vitest run --project server` |
| Web model (pure) | unit | All branches; 1:1 to the ACs they back; both languages where text is formatted | `src/web/anchors/model/*.test.ts`, `src/web/planner/model/*.test.ts` | `npx vitest run --project web` |
| Web API client | unit (stubbed `fetch`) | Every status → result, network error, non-JSON body, schema failure | `src/web/anchors/api.test.ts` | `npx vitest run --project web` |
| Design-system components | component (Vitest + jsdom + Testing Library) | Every prop that changes the DOM or the accessible tree; stories exist (AD-007) | `src/web/ui/**/*.test.tsx` | `npx vitest run --project web` |
| Provider, drawer, planner, top bar, App | component (stubbed API module) | Every state and transition the spec names for that piece | `src/web/**/*.test.tsx` | `npx vitest run --project web` |
| Whole app in a browser | e2e (Playwright, Chromium, clock fixed, API seeded) | Each story's Independent Test; focus trap and return; 390 px; language change; no error red on rule messages | `e2e/*.spec.ts` | `npm run e2e` |
| i18n JSON, Playwright config | none | build gate only (the i18n parity test runs in `npm test`) | - | build gate only |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Server | Tasks with shared or server tests | `npm run typecheck && npx vitest run --project server` |
| Quick | Tasks with web unit or component tests | `npm run typecheck && npx vitest run --project web` |
| Full | Tasks with e2e tests | `npm run check && npm run e2e` |
| Build | End of each phase | `npm run check` |

Every task's commit also passes `npm run lint` and `npm run format:check` (the pre-commit state must be clean for `npm run check` at the phase end).

---

## Execution Plan

Phases run in order; tasks within a phase run in order.

### Phase 1: Rules and server

```
T1 → T2 → T3 → T4 → T5 → T6
```

### Phase 2: Web model and API client

```
T7 → T8 → T9 → T10 → T11 → T12
```

### Phase 3: Design-system components

```
T13 → T14 → T15 → T16 → T17 → T18 → T19 → T20
```

### Phase 4: App wiring

```
T21 → T22 → T23 → T24 → T25 → T26
```

### Phase 5: Browser checks

```
T27 → T28 → T29
```

---

## Task Breakdown

### T1: Shared anchor rules

**What**: `src/shared/anchors.ts` with `AnchorInput` (zod shape), `ProblemCode`, `AnchorProblem`, `anchorProblem(input, others)`, `normalizeAnchor(input)`, `MAX_NAME`, `STEP`, `LAST_START`, as in the design. Add `src/shared/**/*.test.ts` to the `server` Vitest project's `include`.
**Where**: `src/shared/anchors.ts`
**Depends on**: None
**Reuses**: `Anchor`, `DayIndex` from `src/shared/planner.ts`; zod pattern from `src/shared/health.ts`
**Requirement**: ANC-09, ANC-26, ANC-27, ANC-28, ANC-29, ANC-30, ANC-31, ANC-32, ANC-33, ANC-35, ANC-45

**Done when**:

- [x] Tests: each rule returns its code; a draft breaking several rules returns the first in spec order; 60-char trimmed name passes, 61 fails; whitespace-only name is `nameEmpty`; null start or end is `timesMissing`; 540/555 pass, 545 is `timeStep`; end 1425 passes, end 1440 fails; end equal to start is `endBeforeStart`; overlap returns the other's name and the first shared day in week order (Sunday first); touching (end 540 / start 540) passes; overlap on a non-shared day passes
- [x] Tests: `normalizeAnchor` trims and returns days unique and ascending
- [x] Tests: `AnchorInput` rejects a weekday 7, a non-integer time, a missing name
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: unit
**Gate**: server
**Commit**: `feat(shared): add anchor rules`

---

### T2: Migrations in openDatabase

**What**: `src/server/migrations.ts` with the ordered step list (step 1 creates the `anchors` table from the design) and `migrate(sqlite)`, each step in a transaction with its `user_version` bump; `openDatabase` calls it before returning.
**Where**: `src/server/migrations.ts`
**Depends on**: T1
**Reuses**: `openDatabase` in `src/server/db.ts`; temp-dir pattern from `src/server/db.test.ts`
**Requirement**: ANC-08

**Done when**:

- [x] Tests: a fresh file ends at `user_version` 1 with an `anchors` table; opening an already-migrated file again changes nothing and keeps its rows; a failing step (test passes its own list) leaves `user_version` and the schema as they were
- [x] Existing `db.test.ts` and `index.test.ts` still pass
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): run schema migrations on open`

---

### T3: Anchor repository

**What**: `src/server/anchors/repository.ts` with `list`, `get`, `create`, `replace`, `remove` in plain SQL; `Database` gains `anchors`.
**Where**: `src/server/anchors/repository.ts`
**Depends on**: T2
**Reuses**: `DatabaseSync` handle from `openDatabase`
**Requirement**: ANC-01, ANC-02, ANC-03, ANC-04, ANC-09

**Done when**:

- [ ] Tests: `create` returns the anchor with a new id and `list` returns it; `list` orders by start, then name ignoring case; `replace` changes every field and returns `undefined` for an unknown id; `remove` returns `true` then `false`; days round-trip as numbers
- [ ] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): store anchors in SQLite`

---

### T4: GET and POST /api/anchors

**What**: `src/server/anchors/routes.ts` with `registerAnchorRoutes`; `GET` lists, `POST` parses the shape (400 `invalid`), runs `anchorProblem` against stored anchors (400 code / 409 overlap), normalizes and creates (201). Registered in `buildApp`.
**Where**: `src/server/anchors/routes.ts`
**Depends on**: T3
**Reuses**: `registerHealthRoute` pattern; `app.inject` tests from `routes/health.test.ts`
**Requirement**: ANC-01, ANC-02, ANC-06, ANC-07, ANC-09, ANC-33

**Done when**:

- [ ] Tests (real temp-file DB): `GET` on an empty store is `[]`; `POST` Work Mon–Fri answers 201 with an id and `GET` returns it; three posted anchors come back ordered by start then name; days `[5,1,1,3]` are stored `[1,3,5]`; each rule answers 400 with its code and `GET` is unchanged; a non-JSON or wrongly shaped body answers 400 `invalid`; an overlapping `POST` answers 409 `{ code: "overlap", other: "Work", day: 1 }` and stores nothing; a touching `POST` answers 201
- [ ] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): list and create anchors`

---

### T5: PUT and DELETE /api/anchors/:id

**What**: Add `PUT` (404 first, then 400, then 409 against every other anchor, then replace, 200) and `DELETE` (204 / 404).
**Where**: `src/server/anchors/routes.ts` (modify)
**Depends on**: T4
**Reuses**: T4 helpers
**Requirement**: ANC-03, ANC-04, ANC-05, ANC-06, ANC-07, ANC-35

**Done when**:

- [ ] Tests: `PUT` replaces name, days, start and end and answers 200 with the stored anchor; `PUT` of an anchor onto its own old time is not an overlap; `PUT` overlapping another answers 409 and changes nothing; `PUT` breaking a rule answers 400 and changes nothing; `PUT` and `DELETE` on an unknown id answer 404 and `GET` is unchanged; `PUT` on an unknown id with a broken body answers 404; `DELETE` answers 204 and the anchor is gone
- [ ] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): replace and delete anchors`

---

### T6: Anchors survive a restart

**What**: Child-process test in `src/server/index.test.ts`: start, `POST` an anchor, stop, start again on the same `DATABASE_PATH`, `GET` returns it.
**Where**: `src/server/index.test.ts` (modify)
**Depends on**: T5
**Reuses**: `startServer`, `waitForOutput`, `freePort` in the same file
**Requirement**: ANC-08

**Done when**:

- [ ] Test "keeps anchors after a restart" passes
- [ ] Gate passes: `npm run check` (end of phase)

**Tests**: integration
**Gate**: build
**Commit**: `test(server): anchors survive a restart`

---

### T7: Format a weekday index and a time of day

**What**: `formatWeekdayIndex(day, lang, width)` (via a fixed reference week) and `formatTime(minutes, lang)` in the planner's format module.
**Where**: `src/web/planner/model/format.ts` (modify)
**Depends on**: None in this phase (Phase 1 completes first)
**Reuses**: `formatWeekday`, `atMinutes`
**Requirement**: ANC-18, ANC-30, ANC-32

**Done when**:

- [ ] Tests: day 0 is "Sun" / "dom." and day 1 "Mon" / "seg." (short); `formatTime(555)` is "9:15 AM" in en and "09:15" in pt-BR
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): format weekday indexes and times of day`

---

### T8: Anchor form model

**What**: `src/web/anchors/model/form.ts` with `AnchorDraft`, `newDraft`, `draftFromAnchor`, `draftToInput`, `formProblem` (excludes the edited anchor), `minutesFromTime`, `timeFromMinutes`.
**Where**: `src/web/anchors/model/form.ts`
**Depends on**: T7
**Reuses**: `anchorProblem` (T1)
**Requirement**: ANC-16, ANC-17, ANC-26, ANC-28, ANC-29, ANC-30, ANC-31, ANC-32, ANC-33, ANC-35

**Done when**:

- [ ] Tests: `newDraft` is empty name, days 1–5, "09:00"–"18:00"; `draftFromAnchor` round-trips through `draftToInput`; empty time string becomes `null`; "09:10" becomes 550 and is refused as `timeStep`; editing Work without changing it is not an overlap with itself; a new draft overlapping Work is
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): anchor form model`

---

### T9: Rule and failure messages

**What**: `src/web/anchors/model/messages.ts`: `problemMessage(problem, lang)` and `failureMessage(kind)` returning `{ key, values }`; add the message strings to `en.json` and `pt-BR.json` (`anchors.rules.*`, `anchors.failure.*`).
**Where**: `src/web/anchors/model/messages.ts`
**Depends on**: T8
**Reuses**: `formatWeekdayIndex`, `formatTime` (T7)
**Requirement**: ANC-22, ANC-26, ANC-28, ANC-29, ANC-30, ANC-31, ANC-32, ANC-41

**Done when**:

- [ ] Tests: each code maps to its key; overlap values are `{ other: "Work", weekday: "Mon" }` in en and `"seg."` in pt-BR; the step example values are "9:00 AM"/"9:15 AM" in en and "09:00"/"09:15" in pt-BR; rendered en strings equal the spec's wording exactly
- [ ] No pt-BR string uses missed/failed/overdue/late/skipped wording
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): anchor rule messages`

---

### T10: Drawer preview line

**What**: `src/web/anchors/model/preview.ts`: `daysLabel(days, lang)` and `previewParts(draft, lang)`; strings in both JSON files.
**Where**: `src/web/anchors/model/preview.ts`
**Depends on**: T9
**Reuses**: `formatWeekdayIndex`, `formatTimeRange`
**Requirement**: ANC-18, ANC-46

**Done when**:

- [ ] Tests: all 7 days → "every day"; exactly 1–5 → "Mon–Fri" (pt-BR from its short names); exactly 0 and 6 → "weekends"; `[1,3]` → "Mon, Wed"; `[0,1,2,3,4,5]` is a list, not "Mon–Fri"; empty name → "Untitled"; invalid or empty times → no time range; valid draft ends with "every week"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): anchor preview line`

---

### T11: Save status view

**What**: `src/web/anchors/model/saveStatus.ts`: `SaveStatus` and `statusView(status) → { tone, key }`; status strings in both JSON files.
**Where**: `src/web/anchors/model/saveStatus.ts`
**Depends on**: T10
**Reuses**: `StatusTone` from `StatusIndicator`
**Requirement**: ANC-12, ANC-13, ANC-14, ANC-20, ANC-21, ANC-22, ANC-41

**Done when**:

- [ ] Tests: `loading` → busy "Loading your week…"; `saving` → busy "Saving…"; `saved` → ok "Saved"; `notSaved` → error "Not saved"; `loadFailed` → error "Couldn't load your week"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): save status view`

---

### T12: Anchors API client

**What**: `src/web/anchors/api.ts`: `loadAnchors`, `saveAnchor`, `deleteAnchor` returning the design's result types.
**Where**: `src/web/anchors/api.ts`
**Depends on**: T11
**Reuses**: `checkHealth` fetch pattern; `AnchorInput`, `AnchorProblem` (T1)
**Requirement**: ANC-19, ANC-22, ANC-41, ANC-42, ANC-43

**Done when**:

- [ ] Tests (stubbed `fetch`): 200 list → anchors; 500, network error, non-JSON and wrong-shaped list → `"failed"`; save `POST` when id is null and `PUT /api/anchors/:id` otherwise; 201/200 → `ok`; 400 with a rule code and 409 overlap → `rule`; 400 `invalid` → `failed`; 404 → `notFound`; 500/network → `failed`; delete 204 → `ok`, 404 → `notFound`, 500 → `failed`
- [ ] Gate passes: `npm run check` (end of phase)

**Tests**: unit
**Gate**: build
**Commit**: `feat(web): anchors API client`

---

### T13: Drawer

**What**: `src/web/ui/Drawer/` on native `<dialog>`: `open`, `title`, `onClose`, `footer`, `returnFocusFallback`; Escape via `cancel`, backdrop click, focus return; right side, `min(440px, 100%)`, pinned footer; stories. Stub `showModal`/`close` in `src/web/test-setup.ts`.
**Where**: `src/web/ui/Drawer/Drawer.tsx`
**Depends on**: None in this phase (Phase 2 completes first)
**Reuses**: tokens, `Heading`, `Button` (close)
**Requirement**: ANC-23, ANC-24, ANC-25, ANC-47

**Done when**:

- [ ] Tests: opening calls `showModal` and shows the title as the dialog's name; `cancel` event, close button and a click on the dialog element itself call `onClose`; a click inside the panel does not; closing focuses the element focused before opening, or the fallback when that element was removed
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): add Drawer`

---

### T14: TextField

**What**: `src/web/ui/TextField/`: label + text input, `value`, `onChange`, `maxLength`, forwarded `ref`; stories.
**Where**: `src/web/ui/TextField/TextField.tsx`
**Depends on**: T13
**Reuses**: tokens
**Requirement**: ANC-16, ANC-27

**Done when**:

- [ ] Tests: the label names the input; `maxLength` is set; typing calls `onChange`; the ref focuses the input
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): add TextField`

---

### T15: TimeField

**What**: `src/web/ui/TimeField/`: label + `input type="time" step="900"` with an `"HH:MM"` value; stories.
**Where**: `src/web/ui/TimeField/TimeField.tsx`
**Depends on**: T14
**Reuses**: TextField styles
**Requirement**: ANC-30

**Done when**:

- [ ] Tests: the label names the input; type is `time` and step `900`; changing it calls `onChange` with `"HH:MM"`; an empty value passes through as `""`
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): add TimeField`

---

### T16: FieldGroup

**What**: `src/web/ui/FieldGroup/`: `fieldset` + `legend` wrapping children; stories with day toggles.
**Where**: `src/web/ui/FieldGroup/FieldGroup.tsx`
**Depends on**: T15
**Reuses**: `Button pressed` in the story
**Requirement**: ANC-16

**Done when**:

- [ ] Tests: renders a group named by the legend containing its children
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): add FieldGroup`

---

### T17: MessageLine

**What**: `src/web/ui/MessageLine/`: always-mounted live region; `tone` `"calm"` (muted with an info icon) or `"error"` (red); empty when no message; stories.
**Where**: `src/web/ui/MessageLine/MessageLine.tsx`
**Depends on**: T16
**Reuses**: `Text`, `Icon`
**Requirement**: ANC-36

**Done when**:

- [ ] Tests: the region exists with `role="status"` even when empty; the message appears inside it; `calm` has no error class; `error` has it
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): add MessageLine`

---

### T18: Toast

**What**: `src/web/ui/Toast/`: fixed bottom-centred `role="status"` text; `message` and `id` props; calls `onDone` 3.4 s after each new `id`; stories.
**Where**: `src/web/ui/Toast/Toast.tsx`
**Depends on**: T17
**Reuses**: tokens, `Text`
**Requirement**: ANC-19, ANC-39, ANC-42

**Done when**:

- [ ] Tests (fake timers): shows the message; calls `onDone` at 3400 ms, not before; a new `id` with the same text restarts the timer
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): add Toast`

---

### T19: CoverButton

**What**: `src/web/ui/CoverButton/`: an invisible `button` stretched over its positioned parent, with `label` as the accessible name and `onClick`; stories.
**Where**: `src/web/ui/CoverButton/CoverButton.tsx`
**Depends on**: T18
**Reuses**: `VisuallyHidden` pattern
**Requirement**: ANC-17

**Done when**:

- [ ] Tests: a button named by `label`; click, Enter and Space call `onClick`; it is in the Tab order
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): add CoverButton`

---

### T20: Button danger variant

**What**: `variant="danger"`: red fill for a destructive action; story.
**Where**: `src/web/ui/Button/Button.tsx` (modify)
**Depends on**: T19
**Reuses**: `--bad`, `--bad-soft` tokens
**Requirement**: ANC-38

**Done when**:

- [ ] Tests: `danger` adds its class; other variants do not
- [ ] Gate passes: `npm run check` (end of phase)

**Tests**: component
**Gate**: build
**Commit**: `feat(ui): add a danger button variant`

---

### T21: AnchorsProvider

**What**: `src/web/anchors/AnchorsProvider.tsx` and `useAnchors()`: load on mount with the StrictMode guard, status, drawer state, `openAdd`, `openEdit`, `closeDrawer`, `save`, `remove`, toast; 404 reloads the list; toast strings in both JSON files.
**Where**: `src/web/anchors/AnchorsProvider.tsx`
**Depends on**: None in this phase (Phase 3 completes first)
**Reuses**: `useHealth` guard; api (T12); `statusView` (T11); messages (T9)
**Requirement**: ANC-10, ANC-12, ANC-13, ANC-14, ANC-19, ANC-20, ANC-21, ANC-22, ANC-34, ANC-39, ANC-41, ANC-42, ANC-43

**Done when**:

- [ ] Tests (api module stubbed): status `loading` then `saved` with the anchors; `loadFailed` and an empty list on failure; `save` sets `saving`, then on `ok` closes the drawer, puts the anchor in the list, sets `saved` and toasts "Saved Work."; `rule` keeps the drawer open, returns the problem and restores the previous status; `failed` returns the failure and sets `notSaved`; `notFound` closes, reloads and toasts "That anchor was already deleted."; `remove` on `ok` drops the anchor and toasts "Deleted Work."; `remove` `failed` sets `notSaved`
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): anchors provider`

---

### T22: TopBar shows the save status and opens the drawer

**What**: TopBar reads `status` and `openAdd` from `useAnchors()`; the + button is enabled; `topBar.exampleWeek` removed from both JSON files.
**Where**: `src/web/app/TopBar.tsx` (modify)
**Depends on**: T21
**Reuses**: `statusView`
**Requirement**: ANC-12, ANC-13, ANC-14, ANC-16, ANC-20, ANC-21, ANC-22

**Done when**:

- [ ] Tests: each status renders its text and tone; the + button is enabled and calls `openAdd`; no "Example week"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): top bar shows the save status`

---

### T23: Anchor blocks open the drawer

**What**: `GridBlock` takes `anchorId` and `onOpen`; anchor blocks render a `CoverButton` ("Edit {name}") under their content; placements do not; `grid.editAnchor` in both JSON files.
**Where**: `src/web/planner/components/GridBlock.tsx` (modify)
**Depends on**: T22
**Reuses**: `CoverButton` (T19)
**Requirement**: ANC-17

**Done when**:

- [ ] Tests: an anchor block has a button "Edit Work" that calls `onOpen("id")` on click, Enter and Space; a placement block has none; the check toggle is still present and not inside the cover button
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): open an anchor from its block`

---

### T24: Planner draws the loaded anchors

**What**: `PlannerPage` builds `PlannerData` from `useAnchors().anchors` with no activities, placements or done marks and passes `openEdit` to the grid; delete `exampleWeek.ts` and its test.
**Where**: `src/web/planner/PlannerPage.tsx` (modify)
**Depends on**: T23
**Reuses**: every planner model function, unchanged
**Requirement**: ANC-10, ANC-11, ANC-15, ANC-44

**Done when**:

- [ ] Tests (provider stubbed): Work Mon–Fri draws five blocks on Monday to Friday; today's anchors are in the Today strip; no placements and an empty tray message; no anchors → the Today empty text and the tray empty text, no error class; clicking a block calls `openEdit` with its id
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): draw the saved anchors`

---

### T25: AnchorDrawer

**What**: `src/web/anchors/AnchorDrawer.tsx`: the form in `Drawer` with Name, "Repeats on" toggles (Sunday first), Start, End, preview, `MessageLine`, Cancel, Save, two-click Delete in edit mode; checks `formProblem` before `save`; resets draft, message and arming on each open; labels in both JSON files.
**Where**: `src/web/anchors/AnchorDrawer.tsx`
**Depends on**: T24
**Reuses**: `Drawer`, `TextField`, `TimeField`, `FieldGroup`, `MessageLine`, `Button` (T13–T20); form, messages, preview (T8–T10)
**Requirement**: ANC-16, ANC-17, ANC-18, ANC-19, ANC-20, ANC-22, ANC-23, ANC-26, ANC-27, ANC-28, ANC-29, ANC-30, ANC-31, ANC-32, ANC-33, ANC-34, ANC-36, ANC-37, ANC-38, ANC-39, ANC-40, ANC-41, ANC-43, ANC-46

**Done when**:

- [ ] Tests (provider stubbed): add mode is titled "Add anchor" with empty name, Mon–Fri pressed, 09:00–18:00, focus on name, no Delete; edit mode is "Edit anchor" filled from the anchor, with Delete; each rule shows its message, sends nothing, and an empty name refocuses the field; a valid save calls `save` with the draft; Save is disabled while `saving`; a `failed` outcome keeps every value and shows the "Not saved…" line in error tone; a server overlap outcome shows the overlap message; first Delete reads "Click again to delete" and deletes nothing, second calls `remove`; reopening disarms it; a delete failure shows "Not deleted…"; switching to pt-BR re-renders labels, weekday names, preview and message
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): anchor drawer`

---

### T26: Wire the provider, drawer and toast into App

**What**: `App` wraps the top bar and routes in `AnchorsProvider`, renders `AnchorDrawer` and the provider's `Toast` once, and gives the drawer the + button as its focus fallback.
**Where**: `src/web/App.tsx` (modify)
**Depends on**: T25
**Reuses**: `MemoryRouter` tests in `App.test.tsx`
**Requirement**: ANC-16, ANC-19, ANC-24

**Done when**:

- [ ] Tests (`fetch` stubbed): `/` loads and shows a stored anchor and "Saved"; pressing + opens "Add anchor"; saving shows the toast; `/status` still renders
- [ ] Gate passes: `npm run check` (end of phase)

**Tests**: component
**Gate**: build
**Commit**: `feat(web): wire anchors into the app`

---

### T27: e2e on one worker with an API reset; existing tests seed anchors

**What**: `workers: 1` in `playwright.config.ts`; `e2e/anchors.ts` helper (`resetAnchors(request, anchors)`) used in `beforeEach`; `e2e/main.spec.ts` seeds the old example anchors (Work, Gym class, Therapy session), drops the tray-overflow assertion, and expects "Salvo" where it expected "Semana de exemplo".
**Where**: `e2e/main.spec.ts` (modify)
**Depends on**: None in this phase (Phase 4 completes first)
**Reuses**: existing e2e tests
**Requirement**: ANC-10, ANC-44

**Done when**:

- [ ] Every existing e2e test passes against seeded anchors
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): seed anchors through the API`

---

### T28: e2e add, edit, rule, delete

**What**: `e2e/anchors.spec.ts` with each story's Independent Test: API store + reload; add Work → five blocks and "Saved Work."; edit end to 17:00; Gym overlap message then 18:00–19:00 saves; Delete twice → gone after reload.
**Where**: `e2e/anchors.spec.ts`
**Depends on**: T27
**Reuses**: `resetAnchors` (T27)
**Requirement**: ANC-10, ANC-13, ANC-16, ANC-17, ANC-19, ANC-21, ANC-32, ANC-33, ANC-38, ANC-39

**Done when**:

- [ ] Tests pass: "draws stored anchors", "adds an anchor", "edits an anchor", "refuses an overlap and accepts touching", "deletes with two clicks"
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): add, edit and delete anchors`

---

### T29: e2e focus, phone width, language, colors

**What**: In `e2e/anchors.spec.ts`: Tab stays inside the open drawer; Escape closes and focus returns to the + button; opening from a block and closing returns focus to that block; at 390 px the drawer fills the width and Save is in view with no sideways scroll; switching to Português with the drawer open changes its texts; a rule message is not in error red.
**Where**: `e2e/anchors.spec.ts` (modify)
**Depends on**: T28
**Reuses**: `tokenColor` helper pattern from `main.spec.ts`
**Requirement**: ANC-23, ANC-24, ANC-25, ANC-36, ANC-46, ANC-47

**Done when**:

- [ ] Tests pass: "keeps focus in the drawer", "returns focus when it closes", "fits a phone", "follows a language change", "shows rule messages without error red"
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): drawer focus, phone width and language`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 → T2 → T3 → T4 → T5 → T6
Phase 2:  T7 → T8 → T9 → T10 → T11 → T12
Phase 3:  T13 → T14 → T15 → T16 → T17 → T18 → T19 → T20
Phase 4:  T21 → T22 → T23 → T24 → T25 → T26
Phase 5:  T27 → T28 → T29
```

29 tasks pack into four batches of whole phases: P1 (6), P2 (6), P3 (8), P4+P5 (9).

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | start of P1 | ✅ |
| T2–T6 | previous task | chain in P1 | ✅ |
| T7 | Phase 1 | start of P2 | ✅ |
| T8–T12 | previous task | chain in P2 | ✅ |
| T13 | Phase 2 | start of P3 | ✅ |
| T14–T20 | previous task | chain in P3 | ✅ |
| T21 | Phase 3 | start of P4 | ✅ |
| T22–T26 | previous task | chain in P4 | ✅ |
| T27 | Phase 4 | start of P5 | ✅ |
| T28–T29 | previous task | chain in P5 | ✅ |

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Shared rules | unit | unit | ✅ |
| T2 | Database and migrations | integration | integration | ✅ |
| T3 | Repository | integration | integration | ✅ |
| T4, T5 | Routes | integration | integration | ✅ |
| T6 | Server entry | integration | integration | ✅ |
| T7–T11 | Web model | unit | unit | ✅ |
| T12 | Web API client | unit | unit | ✅ |
| T13–T20 | Design-system components | component | component | ✅ |
| T21–T26 | Provider, drawer, planner, top bar, App | component | component | ✅ |
| T27–T29 | Whole app in a browser | e2e | e2e | ✅ |
