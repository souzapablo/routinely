# Sunday Week Start Validation

**Date**: 2026-11-08
**Spec**: `.specs/features/0003-sunday-week-start/spec.md`
**Diff range**: `bbcaa19..3fb03d1` (93aa875 spec, 3fb03d1 fix; rebased from d0a0e94..ded8b2a with an identical tree)
**Verifier**: independent sub-agent (author ≠ verifier)
**Verdict**: PASS

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| Single fix commit 3fb03d1 | ✅ Done | No `tasks.md` for this small fix; gate is `npm run check` per CLAUDE.md |

---

## Spec-Anchored Acceptance Criteria

| Req | Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | ------------------------- | -------------------- | ----------------------- | ------ |
| SWS-01 | WHEN the planner opens on any day THEN seven columns from that week's Sunday through Saturday | Sun 8 … Sat 14 for 2026-11-08 | `src/web/planner/PlannerPage.test.tsx:59` - `toEqual(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"])`; `:64` - `toEqual(["8",…,"14"])`; `src/web/planner/model/week.test.ts:71-80` - `days.map(d=>d.index)` `[0..6]`, dates Nov 8…14; `week.test.ts:100-108` month/year crossing from Sun Dec 27 | ✅ PASS |
| SWS-02 | WHEN today is a Sunday THEN it starts a new week, range Sunday to following Saturday | `weekStartOf(Sun)` = same day; range Nov 8 – Nov 14, 2026 | `week.test.ts:16` - `weekStartOf(local(2026,11,8,15,30))` `toEqual(local(2026,11,8))`; `week.test.ts:40` - `weekKey(Sun Nov 8)` `toBe("2026-11-08")`; `PlannerPage.test.tsx:50` - `getByText("Nov 8 – Nov 14, 2026")`; `PlannerPage.test.tsx:65` - `heads[0]` has today class | ✅ PASS |
| SWS-03 | WHEN the week range is shown THEN Sunday to Saturday in the active language | "Nov 8 – Nov 14, 2026" / "8 de nov. – 14 de nov. de 2026" | `src/web/planner/model/format.test.ts:20-22` - `toBe("Nov 8 – Nov 14, 2026")`; `format.test.ts:26-28` - `toBe("Dec 27, 2026 – Jan 2, 2027")`; `format.test.ts:32-34` - `toBe("8 de nov. – 14 de nov. de 2026")`; `e2e/main.spec.ts:242` - pt-BR regex in browser | ✅ PASS |
| SWS-04 | WHEN "Days you showed up" is drawn THEN seven days Sunday first | Labels S M T W T F S, Sunday first, on-state aligned with weekday | `PlannerPage.test.tsx:82-91` - `toEqual(["S","M","T","W","T","F","S"])`; `:92-100` - on-state `[false,true,true,true,false,false,false]` for Thu Nov 5; `:101` - `dots[4]` today | ✅ PASS |
| SWS-05 | WHEN a week key is computed THEN the Sunday on or before as `YYYY-MM-DD` | Sun → itself, Sat → previous Sun, year crossing | `week.test.ts:40-42` - `"2026-11-08"`, `"2026-11-08"` (Sat 14), `"2026-11-01"` (Sat 7); `week.test.ts:46` - `weekKey(2027-01-02)` `toBe("2026-12-27")` | ✅ PASS |
| SWS-06 | WHEN a day index is computed THEN 0 for Sunday through 6 for Saturday | Sun 0, Mon 1, Thu 4, Sat 6 | `week.test.ts:52-55` - `toBe(0)`, `toBe(1)`, `toBe(4)`, `toBe(6)` | ✅ PASS |
| SWS-07 | WHEN the example week is built THEN same weekdays as before | Work [1..5], Gym [2,4], Therapy [3], Run 1, Read 2 and 4, Call 6 | `src/web/planner/model/exampleWeek.test.ts:10-33` - anchors `days: [1,2,3,4,5]`, `[2,4]`, `[3]`; `exampleWeek.test.ts:84-89` - placements `day: 1`, `2`, `4`, `6`, week `"2026-11-08"` | ✅ PASS |
| SWS-08 | WHEN built on a Sunday THEN nothing done | `doneAnchors` and `donePlacementIds` empty | `exampleWeek.test.ts:125-126` - `toEqual([])` both | ✅ PASS |
| SWS-09 | WHEN built on a Saturday THEN Sun–Fri done except Thursday's Gym, Saturday undone | 7 anchor records (work 1-5, gym 2, therapy 3); placements run-mon, read-tue, read-thu; call-sat undone | `exampleWeek.test.ts:107-117` - exact sorted done-anchor list for week `2026-11-08`; `exampleWeek.test.ts:118-120` - `toEqual(["read-thu","read-tue","run-mon"].sort())` | ✅ PASS |

**Status**: ✅ All 9 ACs covered with spec-anchored assertions. No spec-precision gaps: each AC names an exact day, date or string, and the spec's Independent Tests (Sun 2026-11-08 grid and range; Sat 2026-11-14 vs Sun 2026-11-08 done records) are the exact fixtures used.

---

## Discrimination Sensor

Scratch: temporary `git worktree` at HEAD under the session scratchpad, `node_modules` symlinked. Tests run: `npx vitest run --project web src/web/planner/model src/web/planner/PlannerPage.test.tsx src/web/planner/components` (baseline 89/89 pass).

| # | File:line | Mutation | Killed? |
| - | --------- | -------- | ------- |
| 1 | `src/web/planner/model/week.ts:6` | `dayIndex` back to Monday=0: `(getDay()+6)%7` | ✅ Killed (9 failed) |
| 2 | `src/web/planner/model/week.ts:20` | `weekStartOf` returns the Monday | ✅ Killed (13 failed) |
| 3 | `src/web/planner/model/exampleWeek.ts:13` | Gym anchor Thu→Fri `[2,4]`→`[2,5]` | ✅ Killed (6 failed) |
| 4 | `src/web/planner/model/exampleWeek.ts:76` | Anchor done `day < today` → `day <= today` | ✅ Killed (2 failed) |
| 5 | `src/web/planner/model/week.ts:44` | `weekDays` `index: dayIndex(date)` → `index: i` | ⚪ Survived - equivalent mutant (see below) |
| 6 | `src/web/planner/model/exampleWeek.ts:58` | Call parents Sat→Fri `day: 6`→`5` | ✅ Killed (2 failed) |
| 7 | `src/web/planner/model/exampleWeek.ts:63` | Undone gym day Thu→Wed `day: 4`→`3` | ✅ Killed (1 failed) |
| 8 | `src/web/planner/model/exampleWeek.ts:82` | Placement done `p.day < today` → `<=` | ✅ Killed (3 failed) |
| 9 | `src/web/planner/model/format.ts:41` | Range end `addDays(weekStart, 6)` → `5` | ✅ Killed (4 failed) |
| 10 | `src/web/planner/PlannerPage.tsx:115` | Showed-up dots shifted one day (`(index+6)%7`) | ✅ Killed (1 failed) |
| 11 | `src/web/planner/model/week.ts:42` | `weekDays` date off by one (`i + 1`) | ✅ Killed (5 failed) |

**Mutant 5 is equivalent on every reachable input**: the only production caller is `PlannerPage.tsx:60` `weekDays(weekStartOf(now), now)`, and `weekStartOf` always returns a local-midnight Sunday via calendar arithmetic (`addDays` uses `new Date(y, m, d + n)`), so `dayIndex(addDays(sunday, i)) === i` for i in 0..6. Distinguishing it needs a non-Sunday `weekStart`, which the spec rules out (Sunday start is fixed; a configurable start is out of scope). Not a gap for this feature. If a first-day-of-week setting lands later, add a `weekDays` test with a non-Sunday start.

**Isolation**: real tree `git status --porcelain` empty before and after; worktree removed and pruned; no stash used.

**Sensor depth**: lightweight (expanded to 11 mutations)
**Result**: 10/10 non-equivalent mutants killed - PASS ✅

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `dayIndex` now `getDay()`; `mondayOf` renamed `weekStartOf`; example fixture days shifted +1 |
| Surgical changes | ✅ Only week rules, fixture, formatter param names, doc comments, product.md and tests |
| No scope creep | ✅ No first-day setting added (out of scope); listed as deferred in `docs/product.md` |
| Matches patterns | ✅ Rules stay in plain functions in `model/` with unit tests |
| No stale Monday logic | ✅ `grep mondayOf\|Monday` in `src`/`e2e`: only a test name and a test comment |
| Comments do not cite the spec | ✅ None in diff; enforced by `npm test` which passed |
| i18n | ✅ No new UI strings; weekday labels come from `Intl` via `formatWeekday` |
| Spec-anchored outcome check | ✅ |
| Every test maps to a spec requirement | ✅ New/changed tests map to SWS-01..09 |
| Documented guidelines followed: `CLAUDE.md` | ✅ |

---

## Edge Cases

- [x] Today is Sunday: starts a new week (SWS-02), `week.test.ts:16`, `PlannerPage.test.tsx:65`
- [x] Saturday belongs to the week of the previous Sunday: `week.test.ts:19-23`, `:41`
- [x] Month and year boundaries: `week.test.ts:29-35`, `:46`, `:97-109`, `format.test.ts:25-29`
- [x] DST: `addDays` uses calendar arithmetic, so midnight is kept (unchanged by this diff)

---

## Gate Check

- **Gate command**: `npm run check` (typecheck, lint, format check, tests, build)
- **Result**: exit 0; 49 test files, 325 passed, 0 failed, 0 skipped; build OK
- **Test count before feature** (`it(`/`test(` calls before the fix): 224
- **Test count after feature**: 226
- **Delta**: +2 (`weekStartOf` Saturday case, "lists Days you showed up Sunday first"); no tests removed, no assertion weakened (Monday cases rewritten to the Sunday equivalents; the Saturday done-placements assertion is now an explicit list instead of "all placements")
- **e2e**: `npm run e2e` exit 0, 13 passed (Chromium); includes the pt-BR range `8 de nov. – 14 de nov. de 2026` at `e2e/main.spec.ts:242`

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SWS-01 | Implemented | ✅ Verified |
| SWS-02 | Implemented | ✅ Verified |
| SWS-03 | Implemented | ✅ Verified |
| SWS-04 | Implemented | ✅ Verified |
| SWS-05 | Implemented | ✅ Verified |
| SWS-06 | Implemented | ✅ Verified |
| SWS-07 | Implemented | ✅ Verified |
| SWS-08 | Implemented | ✅ Verified |
| SWS-09 | Implemented | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 9/9 ACs matched spec outcome, 0 spec-precision gaps
**Sensor**: 10/10 non-equivalent mutants killed (1 equivalent survivor, documented)
**Gate**: `npm run check` exit 0, 325 passed; `npm run e2e` exit 0, 13 passed

**What works**: Sunday-first grid, range and showed-up dots; Sunday week key; calendar-weekday `DayIndex`; example week on the same weekdays with correct done records on Sunday and Saturday.

**Issues found**: none blocking.

**Next steps**: optional, when a first-day setting is built: add a `weekDays` test with a non-Sunday start to cover `index: dayIndex(date)`.
