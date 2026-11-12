# Flexible Activities Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/0005-flexible-activities/design.md`
**Status**: In Progress
**Approved**: 2026-11-12 - user: "i have approved and you can do eveything needed"
**Mutations**: 3
**Build**: `npm run build; npm run typecheck; npm run lint`

---

## Test Coverage Matrix

> Generated from the codebase, the project rules and the spec. Guidelines found: `CLAUDE.md` (rules that change what the user sees live in plain functions with unit tests; `npm run check` before done; `npm run e2e` when the browser changes; no spec citations in comments), `vite.config.ts` (Vitest projects `web` and `server`), `playwright.config.ts`. Samples: `src/shared/anchors.test.ts`, `src/server/migrations.test.ts`, `src/server/anchors/repository.test.ts`, `src/server/anchors/routes.test.ts`, `src/server/index.test.ts`, `src/web/anchors/api.test.ts`, `src/web/anchors/AnchorsProvider.test.tsx`, `src/web/anchors/AnchorDrawer.test.tsx`, `e2e/anchors.spec.ts`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Shared rules and order | unit | Every rule and its order; every boundary (60/61 chars, 0/1/14/15 times, each allowed and a disallowed duration, each category and an unknown one); the comparator's case fold, ties by id | `src/shared/*.test.ts` | `npx vitest run --project server` |
| Migrations | integration (real temp-file SQLite) | Fresh file reaches version 2; a version-1 file with anchors migrates and keeps them; `CHECK`s reject bad rows | `src/server/migrations.test.ts` | `npx vitest run --project server` |
| Repositories | integration (real temp-file SQLite) | Every method, the order against the shared comparator, missing id | `src/server/*/repository.test.ts` | `npx vitest run --project server` |
| Routes | integration (`app.inject` over a real temp-file DB) | Every route: happy path, each rule code, `invalid`, 404, nothing changed on failure | `src/server/activities/routes.test.ts` | `npx vitest run --project server` |
| Server entry | integration (child process) | Restart keeps activities | `src/server/index.test.ts` | `npx vitest run --project server` |
| Web model (pure) | unit | All branches; 1:1 to the ACs they back; both languages where text is formatted | `src/web/*/model/*.test.ts` | `npx vitest run --project web` |
| Web API client | unit (stubbed `fetch`) | Every status → result, network error, non-JSON body, schema failure | `src/web/activities/api.test.ts` | `npx vitest run --project web` |
| List hooks | unit (`renderHook`, stubbed API module) | Load ok and failed, abort on unmount, save and delete results, sorted insert | `src/web/week/*.test.ts` | `npx vitest run --project web` |
| Design-system components | component (Vitest + jsdom + Testing Library) | Every prop that changes the DOM or the accessible tree; a story exists (AD-007) | `src/web/ui/**/*.test.tsx` | `npx vitest run --project web` |
| Provider, drawer, fields, tray, planner, top bar, App | component (stubbed API modules) | Every state and transition the spec names for that piece | `src/web/**/*.test.tsx` | `npx vitest run --project web` |
| Whole app in a browser | e2e (Playwright, Chromium, clock fixed, API reset per test) | Each story's Independent Test; 390 px drawer; long name; tray fits at 1280×800; no error red on calm messages | `e2e/*.spec.ts` | `npm run e2e` |
| i18n JSON, spec documents | none | build gate only (the i18n parity test runs in `npm test`) | - | build gate only |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Server | Tasks with shared or server tests | `npm run typecheck && npx vitest run --project server` |
| Quick | Tasks with web unit or component tests | `npm run typecheck && npx vitest run --project web` |
| Full | Tasks with e2e tests, and the last task of a phase that changes the browser | `npm run check && npm run e2e` |
| Build | Last task of a phase that doesn't change the browser | `npm run check` |

Every task's commit also passes `npm run lint` and `npm run format:check`.

---

## Execution Plan

Phases run in order; tasks within a phase run in order. Each phase is one branch and one PR (`feat/0005-flexible-activities/pN-…`).

### Phase 1: Rules and server (`p1-rules-and-server`)

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8
```

### Phase 2: Week provider refactor (`p2-week-provider`)

```
T9 → T10 → T11 → T12 → T13
```

### Phase 3: Activity web model and API (`p3-activity-model`)

```
T14 → T15 → T16 → T17 → T18 → T19
```

### Phase 4: Design-system components (`p4-design-system`)

```
T20 → T21 → T22 → T23
```

### Phase 5: App wiring (`p5-app-wiring`)

```
T24 → T25 → T26 → T27 → T28
```

### Phase 6: Browser checks (`p6-browser-checks`)

```
T29 → T30 → T31 → T32
```

---

## Task Breakdown

### T1: Shared name order

**What**: `src/shared/order.ts` with `compareNames` (folds ASCII `A`–`Z` only, then compares by code unit), `compareAnchors` (start, name, id) and `compareActivities` (name, id).
**Where**: `src/shared/order.ts`
**Depends on**: None
**Reuses**: `Anchor`, `FlexibleActivity` from `src/shared/planner.ts`
**Requirement**: FLX-50, FLX-51

**Done when**:

- [x] Tests: "read" sorts before "Run" and "Run" after "apple"; "ana" and "Ana" compare equal by name, and ties go by id; "É" is not folded to "é" (it sorts as its code unit); `compareAnchors` puts the earlier start first whatever the name
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: unit
**Gate**: server
**Commit**: `feat(shared): add the name order`

---

### T2: Shared activity rules

**What**: `src/shared/activities.ts` with `ActivityInput` (zod shape), `ActivityProblemCode`, `activityProblem(input)`, `normalizeActivity(input)`, `MIN_TIMES`, `MAX_TIMES`, `DURATIONS`, `CATEGORIES`, as in the design.
**Where**: `src/shared/activities.ts`
**Depends on**: T1
**Reuses**: `MAX_NAME` from `src/shared/anchors.ts`; zod pattern from `AnchorInput`
**Requirement**: FLX-08, FLX-38, FLX-39, FLX-40, FLX-41, FLX-42, FLX-44

**Done when**:

- [x] Tests: each rule returns its code; an input breaking several rules returns the first in the order name, times, duration, category; a 60-char trimmed name passes and 61 fails; a whitespace-only name is `nameEmpty`; times 1 and 14 pass, 0, 15 and 1.5 are `timesOutOfRange`; each of the seven durations passes, 20 and 0 are `durationNotAllowed`; each of the five categories passes, "sport" is `categoryUnknown`
- [x] Tests: `normalizeActivity` trims the name
- [x] Tests: `ActivityInput` rejects a missing name, a string `timesPerWeek`, a numeric category
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: unit
**Gate**: server
**Commit**: `feat(shared): add flexible activity rules`

---

### T3: Migration step 2

**What**: Append the `activities` table from the design, with its `CHECK`s, as step 2 in `src/server/migrations.ts`.
**Where**: `src/server/migrations.ts`
**Depends on**: T2
**Reuses**: `migrate` and its tests
**Requirement**: FLX-07, FLX-08

**Done when**:

- [x] Tests: a fresh file ends at `user_version` 2 with both tables; a version-1 file holding anchors migrates to 2 and keeps them; inserting a row with category "sport", 15 times or duration 20 throws
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): add the activities table`

---

### T4: Activity repository

**What**: `src/server/activities/repository.ts` with `list`, `get`, `create`, `replace`, `remove`; `Database` gains `activities`.
**Where**: `src/server/activities/repository.ts`
**Depends on**: T3
**Reuses**: `src/server/anchors/repository.ts` structure; `compareActivities`
**Requirement**: FLX-01, FLX-02, FLX-03, FLX-04, FLX-05

**Done when**:

- [x] Tests: create returns the row with a new id and `get` finds it; `replace` changes every field and returns `undefined` for an unknown id; `remove` returns `false` for an unknown id; `list()` over "read", "Run", "apple", "Ana", "ana", "Écrire", "zebra" equals the same rows sorted with `compareActivities`
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): store flexible activities`

---

### T5: GET and POST /api/activities

**What**: `src/server/activities/routes.ts` with `registerActivityRoutes` serving `GET` and `POST`, registered in `buildApp`.
**Where**: `src/server/activities/routes.ts`
**Depends on**: T4
**Reuses**: `src/server/anchors/routes.ts`
**Requirement**: FLX-01, FLX-02, FLX-06, FLX-08

**Done when**:

- [x] Tests: `GET` on an empty table answers 200 `[]`; `POST` of a valid body answers 201 with the stored activity (name trimmed) and a later `GET` lists it; `POST` with each rule broken answers 400 with that code and stores nothing; a body of the wrong shape answers 400 `{ code: "invalid" }`
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): list and create activities`

---

### T6: PUT and DELETE /api/activities/:id

**What**: Add `PUT` and `DELETE` to `registerActivityRoutes`; on `PUT` the 404 check runs before the rules.
**Where**: `src/server/activities/routes.ts` (modify)
**Depends on**: T5
**Reuses**: anchor `PUT`/`DELETE` handlers
**Requirement**: FLX-03, FLX-04, FLX-05, FLX-06

**Done when**:

- [x] Tests: `PUT` of a valid body answers 200 and `GET` shows the change; `PUT` to an unknown id with a broken body answers 404, not 400; `PUT` with a broken rule answers 400 and leaves the row as it was; `DELETE` answers 204 and the row is gone; `DELETE` of an unknown id answers 404 and leaves the others
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `feat(server): replace and delete activities`

---

### T7: Anchor list order breaks ties by id

**What**: The anchor repository lists `ORDER BY start, name COLLATE NOCASE, id`.
**Where**: `src/server/anchors/repository.ts` (modify)
**Depends on**: T6
**Reuses**: `compareAnchors`
**Requirement**: FLX-50

**Done when**:

- [x] Tests: `list()` over anchors at the same start named "read", "Run", "Ana", "ana" equals the same rows sorted with `compareAnchors`
- [x] Gate passes: `npm run typecheck && npx vitest run --project server`

**Tests**: integration
**Gate**: server
**Commit**: `fix(server): order anchors the same way every time`

---

### T8: Activities survive a restart

**What**: Extend the child-process test so a stored activity is listed after the server restarts on the same file.
**Where**: `src/server/index.test.ts` (modify)
**Depends on**: T7
**Reuses**: the anchors restart test
**Requirement**: FLX-07

**Done when**:

- [x] Tests: `POST` Run 5 km (movement, 2, 45), stop the server, start it on the same file, `GET /api/activities` returns it
- [x] Gate passes: `npm run check`

**Tests**: integration
**Gate**: build
**Commit**: `test(server): activities survive a restart`

---

### T9: Week save status

**What**: Move `saveStatus.ts` to `src/web/week/model/`, rename its keys to `week.status.*` (both i18n files), and add `LoadResult` and `afterLoads`.
**Where**: `src/web/week/model/saveStatus.ts`
**Depends on**: None in this phase (Phase 1 completes first)
**Reuses**: `src/web/anchors/model/saveStatus.ts`
**Requirement**: FLX-15, FLX-16, FLX-17

**Done when**:

- [x] Tests: the old `statusView` tests pass against the new keys; `afterLoads` gives `loading` when either is pending, `loadFailed` when either failed and neither is pending, `saved` when both are ok
- [x] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `refactor(web): move the save status to the week`

---

### T10: Drawer state

**What**: `src/web/week/model/drawer.ts` with `ItemType`, `DrawerState`, `drawerTitleKey` and `showsTypeRow`.
**Where**: `src/web/week/model/drawer.ts`
**Depends on**: T9
**Reuses**: the `DrawerState` in `AnchorsProvider.tsx`
**Requirement**: FLX-19, FLX-20, FLX-21, FLX-30, FLX-31

**Done when**:

- [x] Tests: `add` (either type) gives `drawer.addTitle`, `editAnchor` gives `drawer.editAnchorTitle`, `editActivity` gives `drawer.editActivityTitle`; `showsTypeRow` is true only for `add`
- [x] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): drawer state for both kinds of item`

---

### T11: Anchor list hook

**What**: `src/web/week/useAnchorList.ts`: the anchor list with its load (abort guard), save and delete calls, returning results and inserting with `compareAnchors`.
**Where**: `src/web/week/useAnchorList.ts`
**Depends on**: T10
**Reuses**: the load, save and delete code in `AnchorsProvider.tsx`
**Requirement**: FLX-50

**Done when**:

- [x] Tests: load ok fills the list and reports `ok`; load failed leaves it empty and reports `failed`; unmount aborts the load; a saved anchor lands in `compareAnchors` order ("Run" after a stored "read" at the same start); delete removes it; each API result comes back to the caller
- [x] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `refactor(web): anchor list hook`

---

### T12: WeekProvider replaces AnchorsProvider

**What**: `src/web/week/WeekProvider.tsx` with `useWeek()`, built on `useAnchorList`, the new `DrawerState` and `afterLoads`. `TopBar`, `PlannerPage` and `App` use it, and `AnchorsProvider` and its test are deleted after their assertions move.
**Where**: `src/web/week/WeekProvider.tsx`
**Depends on**: T11
**Reuses**: `AnchorsProvider.tsx` and `AnchorsProvider.test.tsx`
**Requirement**: FLX-15, FLX-16, FLX-17, FLX-20

**Done when**:

- [x] Every assertion from `AnchorsProvider.test.tsx` passes against `WeekProvider` (same count or more)
- [x] Tests: `openAdd("anchor")` sets `{ mode: "add", type: "anchor" }`; `openEditAnchor(id)` sets `editAnchor`
- [x] `TopBar.test.tsx` and `PlannerPage.test.tsx` pass with the new provider
- [x] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `refactor(web): week provider`

---

### T13: ItemDrawer with anchor fields

**What**: `src/web/week/ItemDrawer.tsx` and `AnchorFields.tsx` replace `AnchorDrawer`, showing only the anchor fields for now. The shared words move to `drawer.*` in both i18n files. The add title becomes "Add activity", the edit title "Edit anchor", and Save "Save activity". The e2e texts are updated to match.
**Where**: `src/web/week/ItemDrawer.tsx`
**Depends on**: T12
**Reuses**: `AnchorDrawer.tsx` and `AnchorDrawer.test.tsx`
**Requirement**: FLX-20, FLX-31, FLX-37

**Done when**:

- [x] Every assertion from `AnchorDrawer.test.tsx` passes against `ItemDrawer`, with the new title and Save texts
- [x] Tests: adding shows "Add activity", editing an anchor shows "Edit anchor", Save reads "Save activity" in both
- [x] `e2e/anchors.spec.ts` and `e2e/main.spec.ts` use the new texts
- [x] Gate passes: `npm run check && npm run e2e`

**Tests**: component
**Gate**: full
**Commit**: `refactor(web): item drawer`

---

### T14: Activity API client

**What**: `src/web/activities/api.ts` with `loadActivities`, `saveActivity`, `deleteActivity` and their result types.
**Where**: `src/web/activities/api.ts`
**Depends on**: None in this phase (Phase 2 completes first)
**Reuses**: `src/web/anchors/api.ts`
**Requirement**: FLX-09, FLX-32, FLX-35, FLX-47, FLX-49, FLX-52

**Done when**:

- [ ] Tests: 200 with a valid list → list; 200 with a bad body, 500, network error → `failed`; save 201/200 → `ok`, 400 with each known code → `rule`, 400 with an unknown code → `failed`, 404 → `notFound`, 500 → `failed`; `POST` when the id is null and `PUT` with the encoded id otherwise; delete 204 → `ok`, 404 → `notFound`, 500 → `failed`
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): activities API client`

---

### T15: Activity form model

**What**: `src/web/activities/model/form.ts` with `ActivityDraft`, `newActivityDraft`, `draftFromActivity`, `activityDraftToInput`, `activityFormProblem`, `stepTimes` and `canStep`.
**Where**: `src/web/activities/model/form.ts`
**Depends on**: T14
**Reuses**: `activityProblem`
**Requirement**: FLX-19, FLX-25, FLX-26, FLX-30, FLX-38, FLX-44

**Done when**:

- [ ] Tests: the new draft is `{ "", 1, 30, "movement" }`; `draftFromActivity` copies every field; `stepTimes` goes 1→2 and 2→1 and stays at 1 and 14; `canStep` is `{ down: false }` at 1 and `{ up: false }` at 14; an empty name gives `nameEmpty`
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): flexible activity form model`

---

### T16: Duration and category options

**What**: `src/web/activities/model/options.ts` with `durationOptions()` and `categoryOptions()`, plus the `categories.*` keys in both i18n files.
**Where**: `src/web/activities/model/options.ts`
**Depends on**: T15
**Reuses**: `DURATIONS`, `CATEGORIES`, `durationParts`
**Requirement**: FLX-27, FLX-28

**Done when**:

- [ ] Tests: seven durations render as "15 min", "30 min", "45 min", "1 h", "1 h 30 min", "2 h", "3 h" in en and in pt-BR as the `duration.*` keys give them; five categories in the order Movement, Home, Errands, Rest, People, and in pt-BR Movimento, Casa, Tarefas, Descanso, Pessoas
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): duration and category options`

---

### T17: Activity preview

**What**: `src/web/activities/model/preview.ts` with `activityPreviewParts(draft)`, plus its i18n keys.
**Where**: `src/web/activities/model/preview.ts`
**Depends on**: T16
**Reuses**: anchor `previewParts` shape
**Requirement**: FLX-29

**Done when**:

- [ ] Tests: `{ "Run 5 km", 2, 45, movement }` renders "Run 5 km · 2× a week · 45 min each · Movement" in en and "Run 5 km · 2× por semana · 45 min cada · Movimento" in pt-BR; an empty name renders "Untitled" / "Sem nome"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): flexible activity preview`

---

### T18: Activity messages

**What**: `src/web/activities/model/messages.ts` with `activityProblemMessage(p)`, plus the `activities.rules.*` keys.
**Where**: `src/web/activities/model/messages.ts`
**Depends on**: T17
**Reuses**: the `drawer.rules.nameEmpty` and `nameTooLong` keys from T13
**Requirement**: FLX-38, FLX-39, FLX-40, FLX-41, FLX-42

**Done when**:

- [ ] Tests: `nameEmpty` renders "Give it a name so you can recognize it on the calendar."; `nameTooLong` names 60; each of the other three codes renders its en and pt-BR text
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): flexible activity messages`

---

### T19: Activity list hook

**What**: `src/web/week/useActivityList.ts`: the activity list with its load (abort guard), save and delete calls, inserting with `compareActivities`.
**Where**: `src/web/week/useActivityList.ts`
**Depends on**: T18
**Reuses**: `useAnchorList`
**Requirement**: FLX-09, FLX-17, FLX-32, FLX-47, FLX-51

**Done when**:

- [ ] Tests: load ok fills the list and reports `ok`; load failed leaves it empty and reports `failed`; unmount aborts; a saved "Run" lands after a stored "read"; an edit replaces in place and re-sorts; delete removes it; each API result comes back to the caller
- [ ] Gate passes: `npm run check`

**Tests**: unit
**Gate**: build
**Commit**: `feat(web): activity list hook`

---

### T20: RadioCardGroup

**What**: `src/web/ui/RadioCardGroup/` with a story: a `fieldset` and `legend` of native radios drawn as cards with an icon, title and description.
**Where**: `src/web/ui/RadioCardGroup/RadioCardGroup.tsx`
**Depends on**: None in this phase (Phase 3 completes first)
**Reuses**: `FieldGroup` legend styles, `Icon`, prototype `.kind` styles
**Requirement**: FLX-21

**Done when**:

- [ ] Tests: renders a radio group named by its legend; each option is a radio named by its title and described by its description; the checked option matches `value`; choosing another calls `onChange` with its value
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): radio card group`

---

### T21: Stepper

**What**: `src/web/ui/Stepper/` with a story: − / value / +, `min`, `max`, `value`, `onChange`, and labels for both buttons.
**Where**: `src/web/ui/Stepper/Stepper.tsx`
**Depends on**: T20
**Reuses**: `Button`, prototype `.stepper` styles
**Requirement**: FLX-25, FLX-26

**Done when**:

- [ ] Tests: + calls `onChange(value + 1)` and − calls `onChange(value - 1)`; − is disabled at `min` and + at `max`; the value sits in an `output` with `aria-live="polite"`; the group is labelled
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): stepper`

---

### T22: SelectField

**What**: `src/web/ui/SelectField/` with a story: a label and a native `select` with `options`.
**Where**: `src/web/ui/SelectField/SelectField.tsx`
**Depends on**: T21
**Reuses**: `TextField` styles
**Requirement**: FLX-27

**Done when**:

- [ ] Tests: the select is named by its label; it lists the options in order with the current one selected; choosing one calls `onChange` with its value
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(ui): select field`

---

### T23: ChipRadioGroup

**What**: `src/web/ui/ChipRadioGroup/` with a story: a `fieldset` of native radios drawn as the prototype's category chips, each with a `tone` from `categoryTones`.
**Where**: `src/web/ui/ChipRadioGroup/ChipRadioGroup.tsx`
**Depends on**: T22
**Reuses**: `categoryTones`, prototype `.cat` styles
**Requirement**: FLX-28

**Done when**:

- [ ] Tests: the group is named by its legend; each chip is a radio named by its label; each chip carries its tone's color variables; choosing one calls `onChange`
- [ ] Gate passes: `npm run check`

**Tests**: component
**Gate**: build
**Commit**: `feat(ui): chip radio group`

---

### T24: WeekProvider holds activities

**What**: `WeekProvider` adds `useActivityList`, both loads feeding `afterLoads`, `openAdd("flexible")`, `openEditActivity`, `saveActivity`, `remove()` for an activity, and the activity 404 path.
**Where**: `src/web/week/WeekProvider.tsx` (modify)
**Depends on**: None in this phase (Phase 4 completes first)
**Reuses**: the anchor paths in the same provider
**Requirement**: FLX-15, FLX-16, FLX-17, FLX-32, FLX-33, FLX-34, FLX-35, FLX-47, FLX-49, FLX-52

**Done when**:

- [ ] Tests: status is `loading` until both loads end; `loadFailed` when only activities fail, and the anchors are still there; a saved activity closes the drawer, appears in `activities` and toasts "Saved {name}."; `saving` while it runs; `notSaved` on failure with the drawer open; a rule result returns the status to its value before; delete toasts "Deleted {name}."; a 404 closes the drawer, reloads only the activities and toasts "That activity was already deleted."
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): week provider holds flexible activities`

---

### T25: FlexibleFields

**What**: `src/web/week/FlexibleFields.tsx`: Times per week stepper, Each time takes select, Kind chips and the preview, for an `ActivityDraft`.
**Where**: `src/web/week/FlexibleFields.tsx`
**Depends on**: T24
**Reuses**: `Stepper`, `SelectField`, `ChipRadioGroup`, `stepTimes`, `canStep`, `durationOptions`, `categoryOptions`, `activityPreviewParts`
**Requirement**: FLX-22, FLX-25, FLX-26, FLX-27, FLX-28, FLX-29

**Done when**:

- [ ] Tests: + and − change the times shown; − is disabled at 1 and + at 14; the select offers the seven durations; Kind offers the five categories; the preview follows the draft
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): flexible activity fields`

---

### T26: ItemDrawer adds and edits flexible activities

**What**: `ItemDrawer` gains the Type row, both drafts side by side, the flexible save and delete, and "Edit activity".
**Where**: `src/web/week/ItemDrawer.tsx` (modify)
**Depends on**: T25
**Reuses**: `RadioCardGroup`, `FlexibleFields`, `activityFormProblem`, `activityProblemMessage`
**Requirement**: FLX-19, FLX-21, FLX-22, FLX-23, FLX-24, FLX-30, FLX-32, FLX-35, FLX-36, FLX-37, FLX-38, FLX-43, FLX-44, FLX-45, FLX-46, FLX-47, FLX-48, FLX-49

**Done when**:

- [ ] Tests: adding as flexible shows the Type row on Flexible with the defaults and focuses the name; editing an activity shows "Edit activity", no Type row and its values; Flexible hides Repeats on, Start and End, and Anchor hides the flexible fields; times set to 3, a switch to Anchor and back still shows 3, with the error line empty; an empty name shows the message, focuses the name and calls no save; a valid save calls `saveActivity` with the draft; a failed save shows "Not saved. …" and keeps the values; Delete arms then deletes, and is disarmed on reopening; a failed delete shows "Not deleted. …"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add and edit flexible activities in the drawer`

---

### T27: Tray opens and adds activities

**What**: `Tray` gets `onOpen(id)` through a `CoverButton` per item, `onAdd()` on "+ New flexible activity" (no longer inert), and a grip drawn in the category ink.
**Where**: `src/web/planner/components/Tray.tsx` (modify)
**Depends on**: T26
**Reuses**: `CoverButton`, `categoryTones`
**Requirement**: FLX-10, FLX-11, FLX-14, FLX-19, FLX-30, FLX-54

**Done when**:

- [ ] Tests: activating the "Edit {name}" button calls `onOpen` with the id; Enter on it does too; "+ New flexible activity" calls `onAdd`; "Find a time" stays inert and outside the tab order; the grip carries the category's ink color; an item renders "2× this week · 45 min" and two open pips
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): open and add activities from the tray`

---

### T28: Planner draws the stored activities

**What**: `PlannerPage` feeds `useWeek().activities` into `PlannerData` and wires the tray's `onOpen` and `onAdd`.
**Where**: `src/web/planner/PlannerPage.tsx` (modify)
**Depends on**: T27
**Reuses**: `trayItems`, `trayLeft`, `weekProgress`
**Requirement**: FLX-09, FLX-12, FLX-13, FLX-18

**Done when**:

- [ ] Tests: with Read (3) and Run 5 km (2) loaded, the tray lists them in that order and reads "5 left", and "This week" counts 5 more than the anchors alone; with none, the tray shows its empty text and "0 left"; clicking an item opens "Edit activity"; "+ New flexible activity" opens the drawer on Flexible
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: component
**Gate**: full
**Commit**: `feat(web): planner lists flexible activities`

---

### T29: e2e activity reset helper

**What**: `e2e/activities.ts` with `resetActivities(request, activities)`, called in `beforeEach` of every e2e file that reads the planner.
**Where**: `e2e/activities.ts`
**Depends on**: None in this phase (Phase 5 completes first)
**Reuses**: `e2e/anchors.ts`
**Requirement**: FLX-09

**Done when**:

- [ ] `e2e/anchors.spec.ts` and `e2e/main.spec.ts` reset activities in `beforeEach`; the existing e2e tests pass on a database that held activities before the run
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): reset activities through the API`

---

### T30: e2e add, edit, delete and refuse

**What**: `e2e/activities.spec.ts` with the Independent Tests of the add/edit, rules and delete stories.
**Where**: `e2e/activities.spec.ts`
**Depends on**: T29
**Reuses**: `resetAnchors`, `resetActivities`
**Requirement**: FLX-19, FLX-30, FLX-32, FLX-38, FLX-43, FLX-46, FLX-47, FLX-36

**Done when**:

- [ ] Tests: add Run 5 km (2×, 45 min, Movement) from the tray and see it listed with the toast; edit it to 1 h; an empty name shows the message and sends no request; Delete twice removes it and it stays gone after a reload; closing the drawer returns focus to the tray item or button that opened it
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): add, edit and delete flexible activities`

---

### T31: e2e tray, order and phone width

**What**: Browser checks for the tray story, name order, the 390 px drawer, a 60-character name, the tray fitting at 1280×800 and calm messages.
**Where**: `e2e/activities.spec.ts` (modify)
**Depends on**: T30
**Reuses**: the anchors phone-width and no-red tests
**Requirement**: FLX-09, FLX-11, FLX-12, FLX-13, FLX-14, FLX-50, FLX-51, FLX-53, FLX-54

**Done when**:

- [ ] Tests: seeded Read and Run 5 km show in order with "5 left"; stored "read" and a new "Run" keep their order before and after a reload; at 390 px the flexible drawer has no sideways scroll and its footer is visible; a 60-char name is cut with an ellipsis on one line; five seeded activities fit the tray column at 1280×800; the empty-name message is not drawn in the error color
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): tray, order and phone width`

---

### T32: Withdraw the language-in-drawer case

**What**: Remove the "follows a language change" e2e test that switches language through a scripted click while the drawer is open, and mark ANC-46 withdrawn in the anchors spec.
**Where**: `e2e/anchors.spec.ts` (modify)
**Depends on**: T31
**Reuses**: none
**Requirement**: ANC-46 (withdrawn)

**Done when**:

- [ ] The test is gone; ANC-46's row in `.specs/features/0004-anchors/spec.md` reads "Withdrawn (0005)", and its edge case says the language switch can't be reached while the drawer is open
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): drop the language change inside the drawer`

---

## Checks

Proofs for tests not yet written name the test the task writes; the task uses that exact name.

**C1** - `GET /api/activities` answers 200 with every activity, ordered by name ignoring case, then by id (FLX-01, AC 1)
Proof: `npx vitest run src/server/activities/routes.test.ts -t "lists activities by name ignoring case, then by id"`

**C2** - `POST` of a valid activity stores it with a new id and answers 201 with it (FLX-02, AC 2)
Proof: `npx vitest run src/server/activities/routes.test.ts -t "stores a valid activity with its name trimmed and answers 201 with it"`

**C3** - `PUT` for a stored id replaces every field and answers 200 (FLX-03, AC 3)
Proof: `npx vitest run src/server/activities/routes.test.ts -t "replaces every field and answers 200 with the stored activity"`

**C4** - `DELETE` for a stored id removes it and answers 204 (FLX-04, AC 4)
Proof: `npx vitest run src/server/activities/routes.test.ts -t "removes the activity and answers 204"`

**C5** - `PUT` or `DELETE` of an unknown id answers 404 and changes nothing (FLX-05, AC 5)
Proof: `npx vitest run src/server/activities/routes.test.ts -t "answers 404 for an unknown id"`

**C6** - A body breaking a rule answers 400 with that rule's code and stores nothing (FLX-06, AC 6)
Proof: `npx vitest run src/server/activities/routes.test.ts -t "and stores nothing"`

**C7** - Activities are listed after a server restart (FLX-07, AC 7)
Proof: `npx vitest run src/server/index.test.ts -t "keeps activities after a restart"`

**C8** - The table stores only the five categories, 1-14 times and the allowed minutes (FLX-08, AC 8)
Proof: `npx vitest run src/server/migrations.test.ts -t "the activities table"`

**C9** - The tray lists the loaded activities in the order the server sent (FLX-09, tray AC 1)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "lists the stored activities in the order the server sent"`

**C10** - A tray item shows its name, "2× this week · 45 min" and two open pips (FLX-10, tray AC 2)
Proof: `npx vitest run src/web/planner/components/Tray.test.tsx -t "shows the times and duration with one open pip per time"`

**C11** - A tray item's grip carries its category's ink color (FLX-11, tray AC 3)
Proof: `npx vitest run src/web/planner/components/Tray.test.tsx -t "draws the grip in the category's ink"`

**C12** - Read (3) and Run 5 km (2) make the tray read "5 left" (FLX-12, tray AC 4)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "reads 5 left for Read and Run 5 km"`

**C13** - "This week" counts every activity's times per week next to the anchors' occurrences (FLX-13, tray AC 5)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "counts every activity's times in This week"`

**C14** - "Find a time" is disabled and no tray item starts a drag (FLX-14, tray AC 6)
Proof: `npx vitest run src/web/planner/components/Tray.test.tsx -t "keeps Find a time inert and starts no drag"`

**C15** - The status reads "Loading your week…" until both loads end (FLX-15, tray AC 7)
Proof: `npx vitest run src/web/week/WeekProvider.test.tsx -t "is loading until both loads end"`

**C16** - The status reads "Saved" once both loads succeed (FLX-16, tray AC 8)
Proof: `npx vitest run src/web/week/WeekProvider.test.tsx -t "is saved once both loads succeed"`

**C17** - A failed activities load gives "Couldn't load your week" and no activities (FLX-17, tray AC 9)
Proof: `npx vitest run src/web/week/WeekProvider.test.tsx -t "is loadFailed with no activities when only the activities fail"`

**C18** - With no activities the tray shows its empty text and "0 left" (FLX-18, tray AC 10)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "shows the empty tray text and 0 left with no activities"`

**C19** - Adding a flexible activity opens "Add activity" on Flexible with "", 1, 30 min, Movement and focus on the name (FLX-19, drawer AC 1)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "adds a flexible activity on Flexible with the defaults and focus on the name"`

**C20** - The top bar + opens "Add activity" on Anchor with the anchor defaults and focus on the name (FLX-20, drawer AC 2)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "adds an anchor on Anchor with the anchor defaults and focus on the name"`

**C21** - The Type row shows only while adding (FLX-21, drawer AC 3)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "shows the Type row only when adding"`

**C22** - Flexible shows Name, Times per week, Each time takes and Kind, and hides Repeats on, Start and End (FLX-22, drawer AC 4)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "shows the flexible fields and hides the anchor fields on Flexible"`

**C23** - Anchor shows Name, Repeats on, Start and End, and hides the flexible fields (FLX-23, drawer AC 5)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "shows the anchor fields and hides the flexible fields on Anchor"`

**C24** - Switching type and back keeps each type's values, with the error line empty (FLX-24, drawer AC 6)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "keeps each type's values across a switch, with the error line empty"`

**C25** - + raises times per week by 1 and − lowers it by 1 (FLX-25, drawer AC 7)
Proof: `npx vitest run src/web/week/FlexibleFields.test.tsx -t "steps times per week up and down"`

**C26** - − is disabled at 1 and + at 14 (FLX-26, drawer AC 8)
Proof: `npx vitest run src/web/week/FlexibleFields.test.tsx -t "disables − at 1 and + at 14"`

**C27** - Each time takes offers 15 min, 30 min, 45 min, 1 h, 1 h 30 min, 2 h, 3 h in the active language (FLX-27, drawer AC 9)
Proof: `npx vitest run src/web/activities/model/options.test.ts -t "durationOptions"`

**C28** - Kind offers Movement, Home, Errands, Rest, People as one-choice options in their colors (FLX-28, drawer AC 10)
Proof: `npx vitest run src/web/week/FlexibleFields.test.tsx -t "offers the five kinds in their colors"`

**C29** - The preview reads "Run 5 km · 2× a week · 45 min each · Movement", "Untitled" with no name (FLX-29, drawer AC 11)
Proof: `npx vitest run src/web/activities/model/preview.test.ts -t "activityPreviewParts"`

**C30** - Activating a tray item opens "Edit activity" filled with its values (FLX-30, drawer AC 12)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "edits a stored activity filled from it, titled Edit activity, with no Type row"`

**C31** - Editing an anchor opens "Edit anchor" (FLX-31, drawer AC 13)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "titles an anchor edit Edit anchor"`

**C32** - Saving a valid activity closes the drawer, lists it and toasts "Saved Run 5 km." (FLX-32, drawer AC 14)
Proof: `npx playwright test e2e/activities.spec.ts -g "adds Run 5 km from the tray and edits it to 1 h"`

**C33** - While an activity save runs the status reads "Saving…" (FLX-33, drawer AC 15)
Proof: `npx vitest run src/web/week/WeekProvider.test.tsx -t "is saving while an activity save runs"`

**C34** - A successful activity save leaves the status "Saved" (FLX-34, drawer AC 16)
Proof: `npx vitest run src/web/week/WeekProvider.test.tsx -t "saves an activity, closes, lists it, is saved and toasts"`

**C35** - A failed save keeps every value and shows "Not saved. Your changes are still here, so you can try again." (FLX-35, drawer AC 17)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "keeps every flexible value and shows Not saved when the save fails"`

**C36** - Closing the drawer returns focus to the control that opened it (FLX-36, drawer AC 18)
Proof: `npx playwright test e2e/activities.spec.ts -g "returns focus to the control that opened the drawer"`

**C37** - Save reads "Save activity" when adding and when editing (FLX-37, drawer AC 19)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "reads Save activity when adding and editing"`

**C38** - An empty name shows "Give it a name so you can recognize it on the calendar." and focuses the name (FLX-38, rules AC 1)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "asks for a flexible activity's name, sends nothing and focuses the name field"`

**C39** - A 61-character trimmed name is refused, 60 passes (FLX-39, rules AC 2)
Proof: `npx vitest run src/shared/activities.test.ts -t "accepts a trimmed name of 60 characters and refuses 61 with nameTooLong"`

**C40** - 0, 15 and 1.5 times a week are refused (FLX-40, rules AC 3)
Proof: `npx vitest run src/shared/activities.test.ts -t "times a week with timesOutOfRange"`

**C41** - Durations of 20 and 0 minutes are refused (FLX-41, rules AC 4)
Proof: `npx vitest run src/shared/activities.test.ts -t "with durationNotAllowed"`

**C42** - An unknown category is refused (FLX-42, rules AC 5)
Proof: `npx vitest run src/shared/activities.test.ts -t "refuses an unknown category with categoryUnknown"`

**C43** - A rule message keeps the drawer open and sends nothing (FLX-43, rules AC 6)
Proof: `npx playwright test e2e/activities.spec.ts -g "an empty name shows the message and sends nothing"`

**C44** - Only the first broken rule is reported, in the order name, times, duration, category (FLX-44, rules AC 7)
Proof: `npx vitest run src/shared/activities.test.ts -t "reports only the first broken rule, in the order name, times, duration, category"`

**C45** - Delete shows only while editing a stored activity (FLX-45, delete AC 1)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "shows Delete only when editing an activity"`

**C46** - The first Delete click arms it ("Click again to delete") and deletes nothing (FLX-46, delete AC 2)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "arms Delete on the first click and deletes the activity on the second"`

**C47** - The armed Delete removes the activity, closes the drawer and toasts "Deleted Run 5 km."; it stays gone after a reload (FLX-47, delete AC 3)
Proof: `npx playwright test e2e/activities.spec.ts -g "deletes Run 5 km with two clicks and it stays gone after a reload"`

**C48** - Delete is disarmed when the drawer opens (FLX-48, delete AC 4)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "disarms Delete when the drawer opens on an activity again"`

**C49** - A failed delete keeps the drawer open and shows "Not deleted. Try again in a moment." (FLX-49, delete AC 5)
Proof: `npx vitest run src/web/week/ItemDrawer.test.tsx -t "shows Not deleted when the activity delete fails"`

**C50** - A saved anchor lands in the server's order (FLX-50, order AC 1)
Proof: `npx vitest run src/web/week/useAnchorList.test.ts -t "puts a saved anchor in the server's order"`

**C51** - A saved "Run" stays after a stored "read", before and after a reload (FLX-51, order AC 2)
Proof: `npx playwright test e2e/activities.spec.ts -g "keeps read before Run after a save and after a reload"`

**C52** - A 404 on an activity save or delete closes the drawer, reloads the activities and toasts "That activity was already deleted." (FLX-52, edge case 1)
Proof: `npx vitest run src/web/week/WeekProvider.test.tsx -t "closes, reloads the activities and toasts when the activity was already deleted"`

**C53** - At 390 px the flexible drawer has no sideways scroll and its controls and footer stay visible (FLX-53, edge case 2)
Proof: `npx playwright test e2e/activities.spec.ts -g "fits the flexible drawer at 390 px without sideways scroll"`

**C54** - A 60-character name is cut with an ellipsis on one line in the tray (FLX-54, edge case 3)
Proof: `npx playwright test e2e/activities.spec.ts -g "cuts a 60-character name with an ellipsis on one line"`

---

## Handoff

**Settled mid-build:** 2026-11-12 - user: "i have approved and you can do eveything needed" (approval of spec and tasks, the Checks backfill, inline execution, and pushing phase branches)
**Dispatched:** none
**Walked:** not yet

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

Phase 1:  T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8
Phase 2:  T9 → T10 → T11 → T12 → T13
Phase 3:  T14 → T15 → T16 → T17 → T18 → T19
Phase 4:  T20 → T21 → T22 → T23
Phase 5:  T24 → T25 → T26 → T27 → T28
Phase 6:  T29 → T30 → T31 → T32
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1, T2 | one shared module each | ✅ |
| T3 | one migration step | ✅ |
| T4 | one repository (plus its `Database` member) | ✅ |
| T5, T6 | two endpoints each, one routes file | ⚠️ cohesive, same file |
| T7, T8 | one query / one test | ✅ |
| T9–T11 | one module each | ✅ |
| T12 | one provider (callers switch imports) | ⚠️ cohesive move |
| T13 | one drawer (fields split out, keys renamed) | ⚠️ cohesive move |
| T14–T19 | one module each | ✅ |
| T20–T23 | one component each | ✅ |
| T24–T28 | one component each | ✅ |
| T29–T32 | one e2e file change each | ✅ |

## Diagram-Definition Cross-Check

Each task depends only on the one before it in its phase; a phase's first task depends on nothing in its phase because the phase before completes first.

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | start | ✅ |
| T2–T8 | T(n-1) | T(n-1) → T(n) | ✅ |
| T9 | None in this phase | Phase 1 → Phase 2 | ✅ |
| T10–T13 | T(n-1) | T(n-1) → T(n) | ✅ |
| T14 | None in this phase | Phase 2 → Phase 3 | ✅ |
| T15–T19 | T(n-1) | T(n-1) → T(n) | ✅ |
| T20 | None in this phase | Phase 3 → Phase 4 | ✅ |
| T21–T23 | T(n-1) | T(n-1) → T(n) | ✅ |
| T24 | None in this phase | Phase 4 → Phase 5 | ✅ |
| T25–T28 | T(n-1) | T(n-1) → T(n) | ✅ |
| T29 | None in this phase | Phase 5 → Phase 6 | ✅ |
| T30–T32 | T(n-1) | T(n-1) → T(n) | ✅ |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1, T2 | Shared rules and order | unit | unit | ✅ |
| T3 | Migrations | integration | integration | ✅ |
| T4, T7 | Repositories | integration | integration | ✅ |
| T5, T6 | Routes | integration | integration | ✅ |
| T8 | Server entry | integration | integration | ✅ |
| T9, T10, T15–T18 | Web model | unit | unit | ✅ |
| T11, T19 | List hooks | unit | unit | ✅ |
| T14 | Web API client | unit | unit | ✅ |
| T12, T13, T24–T28 | Provider, drawer, fields, tray, planner | component | component | ✅ |
| T20–T23 | Design-system components | component | component | ✅ |
| T29–T32 | Whole app in a browser | e2e | e2e | ✅ |

## Requirement Coverage

Every FLX ID maps to at least one task: FLX-01–08 (T1–T8), FLX-09–18 (T9, T12, T14, T19, T24, T27, T28, T29, T31), FLX-19–37 (T10, T13, T15–T17, T20–T22, T24–T26, T30), FLX-38–44 (T2, T15, T18, T26, T30), FLX-45–49 (T24, T26, T30), FLX-50–51 (T1, T7, T11, T19, T31), FLX-52–54 (T14, T24, T27, T31).
