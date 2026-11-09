# 0004-anchors Validation

**Date**: 2026-11-09
**Spec**: `.specs/features/0004-anchors/spec.md`
**Diff range**: `main...feat/0004-anchors/p5-browser-checks` (commits `78dd5c3..0f4a816`, 33 commits on top of `main` at `69d59a9`)
**Verifier**: independent sub-agent (author ≠ verifier)

**Verdict**: PASS

---

## Task Completion

| Task | Status | Notes |
| --- | --- | --- |
| T1–T6 (Phase 1: rules and server) | ✅ Done | All Done-when boxes checked |
| T7–T12 (Phase 2: web model and API client) | ✅ Done | - |
| T13–T20 (Phase 3: design-system components) | ✅ Done | - |
| T21–T27 (Phase 4: provider, drawer, wiring, e2e seeding) | ✅ Done | - |
| T28–T29 (Phase 5: browser checks) | ✅ Done | - |

`tasks.md`: 62 checked boxes, 0 unchecked.

---

## Spec-Anchored Acceptance Criteria

### P1: Anchors are stored on the server

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| ANC-01 GET lists | 200, `{id,name,days,start,end}`, by start then name | `src/server/anchors/routes.test.ts:56` - `expect((await list()).map((a) => a.name)).toEqual(["Work","Gym","Lunch"])` (+ `:31` status 200, `:72` `toEqual([created])` full shape) | ✅ PASS |
| ANC-02 POST creates | 201 with stored anchor and new id | `src/server/anchors/routes.test.ts:68-72` - `expect(res.statusCode).toBe(201)`; `toMatchObject(work)`; `created.id` matches uuid; `list()` equals `[created]` | ✅ PASS |
| ANC-03 PUT replaces | 200 with stored anchor, all four fields replaced | `src/server/anchors/routes.test.ts:176-178` - `toBe(200)`; `res.json()` `toEqual({ id: stored.id, ...changed })`; list equals the same | ✅ PASS |
| ANC-04 DELETE | 204, removed | `src/server/anchors/routes.test.ts:290-292` - `toBe(204)`; body `""`; `list()` `toEqual([kept])` | ✅ PASS |
| ANC-05 unknown id | 404, nothing changed | `routes.test.ts:253-255` (PUT) and `:303-305` (DELETE) - `toBe(404)`; `toEqual({ code: "notFound" })`; `list()` `toEqual([stored])` | ✅ PASS |
| ANC-06 broken rule | 400 + the rule's code, nothing changed | `routes.test.ts:90-95` (POST, all 6 codes) and `:228-235` (PUT, all 6 codes) - `toBe(400)`; `toEqual({ code })`; list unchanged | ✅ PASS |
| ANC-07 overlap | 409 + other name + first shared day, nothing changed | `routes.test.ts:108-110` - `toBe(409)`; `toEqual({ code: "overlap", other: "Work", day: 1 })` for days `[3,1]`; `list()` `toEqual([stored])`; PUT at `:216-218` | ✅ PASS |
| ANC-08 survives restart | same anchors after restart | `src/server/index.test.ts:140-141` - real process killed and restarted on the same DB; `expect(await res.json()).toEqual([stored])` | ✅ PASS |
| ANC-09 day format | 0..6, unique, ascending | `src/shared/anchors.test.ts:191` - `normalizeAnchor` → `days: [1, 3, 5]` from `[5,1,1,3]`; `routes.test.ts:79-80` stored `[1,3,5]`; `:148` weekday 7 → 400 invalid; `repository.test.ts:60` days come back as numbers | ✅ PASS |

### P1: The planner draws my real anchors

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| ANC-10 draws anchors | each anchor on each of its days as a locked block | `src/web/planner/PlannerPage.test.tsx:207` - per-column anchor names `toEqual([[], ["Work"]×5, []])`; `e2e/anchors.spec.ts:45-46` - `blocks(page,"Work")` `toHaveCount(5)`, Choir `toHaveCount(2)` | ✅ PASS |
| ANC-11 anchors only | no flexible/placements/done; strip, showed-up, tray from anchors | `PlannerPage.test.tsx:130-136` showed-up all `false`; `:154` `"0 of 2 done"`; `:216-225` tray empty text, no "Find a time"; `:207` no placement blocks | ✅ PASS |
| ANC-12 loading status | "Loading your week…", accent dot | `src/web/anchors/AnchorsProvider.test.tsx:70` `toBe("loading")`; `src/web/app/TopBar.test.tsx:65` text `^Loading your week…$` + `statusStyles.busy` (busy dot = `var(--accent)`); `saveStatus.test.ts:19-21` | ✅ PASS |
| ANC-13 loaded status | "Saved", green dot | `AnchorsProvider.test.tsx:77`; `TopBar.test.tsx:65` (`saved` → `statusStyles.ok`, dot `var(--ok)`); `src/web/App.test.tsx:75`; `e2e/anchors.spec.ts:16` | ✅ PASS |
| ANC-14 load failure | "Couldn't load your week", red dot, no anchors | `AnchorsProvider.test.tsx:89-90` `loadFailed` + `anchors` `toEqual([])`; `TopBar.test.tsx:65` (`loadFailed` → error) | ✅ PASS |
| ANC-15 empty week | empty grid, Today and tray empty messages, no error styling | `PlannerPage.test.tsx:233-244` - both empty texts present, no slots, `querySelector('[class*="error"]')` `toBeNull()` | ✅ PASS |

### P1: Add and edit an anchor

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| ANC-16 open to add | "Add anchor", empty name, Mon–Fri, 09:00, 18:00, name focused | `src/web/anchors/AnchorDrawer.test.tsx:96-104`; `TopBar.test.tsx:74` `openAdd` called; `e2e/anchors.spec.ts:58-59` accessible name + focus | ✅ PASS |
| ANC-17 open to edit | click/Enter/Space → "Edit anchor" filled | `AnchorDrawer.test.tsx:125-131`; `src/web/planner/components/GridBlock.test.tsx:135-136` Enter and Space call `onOpen("id")`; `PlannerPage.test.tsx:253`; `e2e/anchors.spec.ts:77-79, 210-211` | ✅ PASS |
| ANC-18 preview line | name/Untitled · days label · range in language · every week | `AnchorDrawer.test.tsx:139-145` exact text; `src/web/anchors/model/preview.test.ts:27-45` every day / Mon–Fri / weekends / list in en and pt-BR | ✅ PASS |
| ANC-19 save | send, close, draw stored, toast "Saved {name}." | `AnchorsProvider.test.tsx:148-163` payload values, drawer closed, anchors, toast `"Saved Work."`; `e2e/anchors.spec.ts:63-66` | ✅ PASS |
| ANC-20 saving | Save disabled; "Saving…" accent dot | `AnchorDrawer.test.tsx:285` `toBeDisabled()`; `AnchorsProvider.test.tsx:147` `toBe("saving")`; `TopBar.test.tsx:65` | ✅ PASS |
| ANC-21 saved status | "Saved", green dot | `AnchorsProvider.test.tsx:162`; `TopBar.test.tsx:65` | ✅ PASS |
| ANC-22 save failure | drawer open, values kept, exact failure text, "Not saved" red | `AnchorDrawer.test.tsx:300-307` text + `messageStyles.error` + all four values; `AnchorsProvider.test.tsx:218-219` drawer stays `add`, `notSaved` | ✅ PASS |
| ANC-23 close without saving | Cancel / close button / scrim / Escape | `AnchorDrawer.test.tsx:153-154` Cancel; `src/web/ui/Drawer/Drawer.test.tsx:54` (cancel/Escape), `:62` (close button), `:68` (backdrop), `:76` (panel click does not close); `e2e/anchors.spec.ts:202-206` Escape, nothing stored | ✅ PASS |
| ANC-24 focus return | focus back on the opener | `Drawer.test.tsx:94, 110`; `App.test.tsx:120` (fallback when block deleted); `e2e/anchors.spec.ts:204, 214` | ✅ PASS |
| ANC-25 focus trap | focus stays in the drawer | `e2e/anchors.spec.ts:187` `not.toBe("page")` for 40 Tab and 40 Shift+Tab; `:191` wraps back. Accepts Chrome's hop to browser UI (AD-022) | ✅ PASS (see note 1) |

### P1: The drawer refuses an anchor that breaks a rule

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| ANC-26 empty name | exact text, name focused | `AnchorDrawer.test.tsx:165-170` text, calm tone, `nameField()` `toHaveFocus()`, save not called; `src/shared/anchors.test.ts:38-46` | ✅ PASS |
| ANC-27 name length | >60 trimmed refused; field max 60 | `anchors.test.ts:52-55` 60 ok (with spaces), 61 → `nameTooLong`; `routes.test.ts:85`; `AnchorDrawer.test.tsx:101` `maxLength="60"` | ✅ PASS |
| ANC-28 no day | exact text | `AnchorDrawer.test.tsx:182-185`; `anchors.test.ts:59` | ✅ PASS |
| ANC-29 times set | exact text | `AnchorDrawer.test.tsx:195`; `anchors.test.ts:64-70` | ✅ PASS |
| ANC-30 15-minute steps | exact text, times in language format | `AnchorDrawer.test.tsx:207-209` "9:00 AM or 9:15 AM"; `src/web/anchors/model/messages.test.ts:47` pt-BR `{ first: "09:00", second: "09:15" }`; `anchors.test.ts:72-94` | ✅ PASS |
| ANC-31 end after start | exact text | `AnchorDrawer.test.tsx:221-223`; `anchors.test.ts:96-106` equal and before | ✅ PASS |
| ANC-32 overlap message | names other + first shared day in week order | `AnchorDrawer.test.tsx:237-239`; `anchors.test.ts:118-139` Sunday-first and earliest-day ordering; `e2e/anchors.spec.ts:109-111` | ✅ PASS |
| ANC-33 touching allowed | both accepted | `anchors.test.ts:145-146`; `routes.test.ts:123`; `e2e/anchors.spec.ts:116-122` | ✅ PASS |
| ANC-34 nothing sent | drawer open, no request, status unchanged | `AnchorDrawer.test.tsx:170,185,196,210,224,241` `save` not called; `e2e/anchors.spec.ts:112-114` drawer visible, `posts` `toEqual([])`, "Saved" still shown; server-rule path `AnchorsProvider.test.tsx:202` status restored | ✅ PASS |
| ANC-35 own version ignored | edit not an overlap with itself | `AnchorDrawer.test.tsx:251-256` save called with 17:00 draft; `routes.test.ts:199-200` PUT 200 | ✅ PASS |
| ANC-36 message announced | live region announces changes | `src/web/ui/MessageLine/MessageLine.test.tsx:10` `aria-live="polite"`, `:18` same region kept when message appears | ✅ PASS |

### P2: Delete an anchor

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| ANC-37 Delete only when editing | shown on edit, absent on add | `AnchorDrawer.test.tsx:105` `queryByRole(... "Delete")` `toBeNull()`; `:132` present on edit | ✅ PASS |
| ANC-38 first click arms | "Click again to delete", red fill, nothing deleted | `AnchorDrawer.test.tsx:337-339` label + `buttonStyles.danger` (`background: var(--bad)`) + `remove` not called; `e2e/anchors.spec.ts:137-140` blocks still 5, API still 1 | ✅ PASS |
| ANC-39 second click deletes | delete, close, gone from every day, toast "Deleted {name}." | `AnchorDrawer.test.tsx:342`; `AnchorsProvider.test.tsx:254-259`; `e2e/anchors.spec.ts:143-149` incl. after reload | ✅ PASS |
| ANC-40 disarmed on open | reopen → not armed | `AnchorDrawer.test.tsx:353-354` `not.toHaveClass(buttonStyles.danger)` | ✅ PASS |
| ANC-41 delete failure | open, exact text, "Not saved" red | `AnchorDrawer.test.tsx:367-370`; `AnchorsProvider.test.tsx:272-275` | ✅ PASS |

### Edge cases

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| ANC-42 deleted elsewhere (404) | close, reload, toast "That anchor was already deleted." | `AnchorsProvider.test.tsx:234-239` (save) and `:286-288` (delete): drawer closed, toast text, `loadAnchors` called twice, anchors reloaded; `api.test.ts:103, 139` 404 → `notFound` | ✅ PASS |
| ANC-43 server 409 | overlap message with server's name/day | `AnchorDrawer.test.tsx:324-327` "This overlaps Therapy on Wed…"; `src/web/anchors/api.test.ts:95-99` 409 → rule | ✅ PASS |
| ANC-44 clipped to grid hours | clipped like before | `src/web/planner/model/grid.test.ts:53-61` (pre-existing `blockGeometry`, unchanged by this diff; anchors drawn through it) | ✅ PASS |
| ANC-45 23:45 end | 23:45 accepted, 24:00 refused | `anchors.test.ts:83-86` | ✅ PASS |
| ANC-46 language change in drawer | labels, weekdays, preview, message change | `AnchorDrawer.test.tsx:403-417`; `e2e/anchors.spec.ts:258-275` | ✅ PASS (see note 2) |
| ANC-47 390 px | full width, footer visible, no sideways scroll | `e2e/anchors.spec.ts:226-241` x 0, width 390, Delete/Cancel/Save `toBeInViewport({ ratio: 1 })`, sideways `{ page: 0, drawer: 0 }` | ✅ PASS |

**Status**: ✅ 47/47 ACs covered with assertions on the spec-defined outcome.

**Notes**

1. ANC-25: in Chrome, Tab past the last control of a native modal `<dialog>` goes to the browser's own UI, then back to the dialog. The test fails if any page element behind the drawer gets focus and requires the wrap back. The page never gets focus, which meets the requirement's intent; the trade-off is recorded as AD-022. The sensor confirmed the test discriminates: a non-modal `show()` fails it (E1).
2. ANC-46: the native modal makes the top bar inert, so the owner can't actually change language with the drawer open. The e2e fires the switch's click from script. The behaviour is verified (the unit test drives `i18n.changeLanguage`; E3 kills a mutant that freezes the language). The edge case is reachable only by script today; it is a spec-wording observation, not a defect.

---

## Payload / Conjunction Check

- Save payload: `AnchorsProvider.test.tsx:148-153` asserts every field (`name`, `days`, `start: 540`, `end: 1080`) and the `null` id for POST; `:181` the id `"w"` for PUT. `AnchorDrawer.test.tsx:251-256, 272-277` assert the full draft.
- Server responses: 409 body asserted on `code`, `other` and `day` (`routes.test.ts:109, 217`); 400 on `code`; 201/200 on the full stored anchor.
- Conjunctions ("and change nothing", "close and reload and toast", "keep open with every value and message and status") are each asserted in full at the rows cited above. No call-only assertions found on payload-bearing criteria.

---

## Discrimination Sensor

Run in a detached `git worktree` under the scratchpad (`node_modules` symlinked). Removed afterwards; real-tree `git status --porcelain` matched the empty baseline.

| # | File:line | Mutation | Tests run | Killed? |
| --- | --- | --- | --- | --- |
| 1 | `src/shared/anchors.ts:63` | Overlap `<` → `<=` (touching counts as overlap) | shared + routes | ✅ Killed (3 failed) |
| 2 | `src/web/anchors/AnchorDrawer.tsx:106` | `if (!armed)` → `if (false)` (Delete deletes on first click) | AnchorDrawer | ✅ Killed (2) |
| 3 | `src/web/ui/Drawer/Drawer.tsx:59` | Removed `target?.focus()` (no focus return) | Drawer, App | ✅ Killed (3) |
| 4 | `src/web/anchors/model/saveStatus.ts:15` | `notSaved: "error"` → `"busy"` (status mapping) | saveStatus, TopBar | ✅ Killed (2) |
| 5 | `src/server/anchors/routes.ts:16` | Overlap answers 400 instead of 409 | routes | ✅ Killed (2) |
| 6 | `src/web/anchors/api.ts:74` | Removed save 404 → `notFound` | api | ✅ Killed (1) |
| 7 | `src/web/anchors/AnchorDrawer.tsx:204` | Rule messages in error (red) tone | AnchorDrawer | ✅ Killed (3) |
| 8 | `src/server/anchors/routes.ts:63` | PUT counts the anchor's own stored version | routes | ✅ Killed (3) |
| 9 | `src/web/anchors/AnchorsProvider.tsx:123` | Server rule sets `notSaved` instead of restoring status | AnchorsProvider | ✅ Killed (1) |
| 10 | `src/web/anchors/AnchorDrawer.tsx:62` | Delete not disarmed on reopen | AnchorDrawer | ✅ Killed (1) |
| 11 | `src/web/anchors/AnchorsProvider.tsx:105` | 404 path skips the reload | AnchorsProvider | ✅ Killed (2) |
| 12 | `src/web/anchors/api.ts:97` | Removed delete 404 → `notFound` | api | ✅ Killed (1) |
| 13 | `src/shared/anchors.ts:61` | First shared day in input order, not week order | shared | ✅ Killed (1) |
| E1 | `src/web/ui/Drawer/Drawer.tsx:49` | `showModal()` → `show()` (no focus trap) | e2e "keeps focus in the drawer" | ✅ Killed |
| E2 | `src/web/ui/Drawer/Drawer.module.css:4-5` | Fixed 440px width, no max-width | e2e "fits a phone" | ✅ Killed |
| E3 | `src/web/anchors/AnchorDrawer.tsx:45` | Language frozen at first render | e2e "follows a language change" + AnchorDrawer unit | ✅ Killed (both) |

**Sensor depth**: expanded (core feature, data integrity): 13 unit/integration + 3 e2e mutations
**Result**: 16/16 killed - PASS ✅

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | ✅ |
| Surgical changes | ✅ (example week removed as the spec requires; e2e tray-overflow assertion dropped because the tray is now empty, as T27 states) |
| No scope creep | ✅ |
| Matches patterns | ✅ (design-system components with stories and tests; rules in plain functions with unit tests) |
| Spec-anchored outcome check | ✅ |
| Per-layer coverage (domain 1:1; routes happy + edge + error) | ✅ every route has 2xx, 400, 404/409 tests |
| Every test maps to a requirement | ✅ |
| Guidelines followed: `CLAUDE.md` (i18n in both files, no undone wording, erasable TS, no spec citations in code; the comment-citation check runs in `npm test`) | ✅ |

Minor observation (not a gap): the client re-sorts after a save with a case-sensitive name compare (`AnchorsProvider.tsx:49-53`); the server sorts `name COLLATE NOCASE`. Two anchors with the same start and names differing only in case could be listed in a different order until reload. No spec outcome depends on it.

---

## Gate Check

- **Build gate** `npm run check`: exit 0. Typecheck, lint and format clean; Vitest 66 files, **549 passed, 0 failed, 0 skipped**; build OK.
- **Full gate** `npm run e2e`: exit 0. **23 passed** (10 in `anchors.spec.ts`, 9 in `main.spec.ts`, 4 in `status.spec.ts`), 1 worker.
- **Test count before feature** (`main`): 238 declared Vitest tests (`vitest list`), 13 e2e.
- **Test count after**: 410 declared Vitest tests (549 run, after `it.each` expansion), 23 e2e.
- **Delta**: +172 declared Vitest tests, +10 e2e. `exampleWeek.test.ts` was deleted along with the example week it tested (spec: example removed). One e2e assertion (tray list overflow) was removed because the tray has no items now.
- **Skipped tests**: none.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| ANC-01 … ANC-47 | Implemented | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 47/47 ACs matched the spec outcome; 0 spec-precision gaps (2 notes: ANC-25 browser-UI hop per AD-022, ANC-46 reachable only by script)
**Sensor**: 16/16 mutations killed
**Gate**: 549 unit/component/integration + 23 e2e passed, 0 failed

**Next steps**: none required. Optional: make the client sort match the server's case-insensitive name order.
