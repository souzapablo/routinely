# Main Layout Validation

**Date**: 2026-11-08
**Spec**: `.specs/features/0002-main-layout/spec.md`
**Diff range**: `f8e58894259277b5fef59357c6ffbe36cd7a1e8e..a602132` (38 commits, `a79bedd`..`a602132`)
**Verifier**: independent sub-agent (author ≠ verifier)

**Verdict**: FAIL

Every AC has a test, and both gates exit 0. The feature still fails for two reasons. First, the C10/C11 walk found a visual difference from the captures that is not listed: anchor time ranges are cut off with no ellipsis. Second, one mutant survived the sensor: the right alignment of the AD-019 top-bar second row.

---

## Task Completion

| Task | Status | Notes |
| --- | --- | --- |
| T1–T37 | ✅ Done | 87 `Done when` boxes ticked, none open. Every commit in the range maps to one task. |

---

## Gate Check

| Gate | Command | Exit | Result |
| --- | --- | --- | --- |
| Build | `npm run check` | 0 | typecheck, lint and format pass. 47 test files, **314 tests passed**, 0 failed, 0 skipped. Build passes. |
| Full | `npm run e2e` | 0 | **11 passed** (7 in `main.spec.ts`, 4 in `status.spec.ts`), 0 failed, 0 skipped |

- No test file was deleted in the range. The only deleted file is `src/web/styles.css`, which T18 replaced with design-system CSS. `StatusPage.test.tsx` and `LanguageSwitch.test.tsx` are unchanged.
- No spec citations in `src/` (`SPEC_DEVIATION`, `AD-0`, `.specs/`). No undone wording in `en.json` or `pt-BR.json`.
- Port 3100 was free before each e2e run, so Playwright's `reuseExistingServer` served this worktree's build.

### C1–C43 proof commands

All 41 command proofs ran from this worktree, each with exit 0 and exactly 1 matching test passed (none matched 0 tests). C10 and C11 are browser walks (see below).

| C | Proof result |
| --- | --- |
| C1, C2, C3 | `test/harness.test.ts` 1 passed each |
| C4 | `tokens.test.ts` 1 passed |
| C5, C7, C15, C33, C35, C36, C39 | `e2e/main.spec.ts -g ...` 1 passed each |
| C6, C8 | `test/designSystem.test.ts` 1 passed each |
| C9 | `Button.test.tsx` 1 passed |
| C12, C13, C21, C22, C32, C34 | `PlannerPage.test.tsx` 1 passed each |
| C14 | `WeekGrid.test.tsx` 1 passed |
| C16–C20 | `GridBlock.test.tsx` 1 passed each |
| C23 | `TodayStrip.test.tsx` 1 passed |
| C24–C26 | `progress.test.ts` 1 passed each |
| C27 | `tray.test.ts` 1 passed |
| C28–C30, C40 | `Tray.test.tsx` 1 passed each |
| C31 | `TopBar.test.tsx` 1 passed |
| C37, C38 | `grid.test.ts` 1 passed each |
| C41, C43 | `e2e/status.spec.ts -g ...` 1 passed each |
| C42 | `App.test.tsx` 1 passed |

---

## Spec-Anchored Acceptance Criteria

### P1: Design system

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| DS-01 | lint non-zero; output names each of 14 elements | `test/harness.test.ts:140` `expect(result.code).not.toBe(0)`; `:142` `expect(result.output).toContain(...)` per element in `rawElements` (`:28-43`, all 14) | ✅ |
| DS-02 | inside `ui/`: no error | `test/harness.test.ts:157` `expect(result.code, result.output).toBe(0)` | ✅ |
| DS-03 | div/section/main/header/aside/nav outside: no error | `test/harness.test.ts:169` `expect(result.code, result.output).toBe(0)` | ✅ |
| DS-04 | every light token equals the prototype `:root` | `src/web/ui/styles/tokens.test.ts:134` `expect(declarations(block)).toEqual(normalizeAll(light))` (exact set, so no extra and no missing tokens) | ✅ |
| DS-05 | dark OS scheme → bg `#0F131A` | `e2e/main.spec.ts:84` `toHaveCSS("background-color","rgb(15, 19, 26)")`; also `tokens.test.ts:138` dark block | ✅ |
| DS-06 | a stories file per component, one story per variant/state incl. disabled | `test/designSystem.test.ts:48` `expect(componentsWithoutStories(uiDir)).toEqual([])` | ⚠️ The test proves only that each file exists with at least one story. Per-variant coverage was checked by hand: Button has Default/Primary/Ghost/Dashed/Accent/Small/IconOnly/CollapseLabel/Pressed/NotPressed/Disabled/Inert; CheckboxRow has Disabled/Inert; CheckToggle has Inert plus pressed/unpressed on every tone; Text has all tones; StatusIndicator has all 4 tones. |
| DS-07 | 3 font families bundled; no request to another host | `e2e/main.spec.ts:63` `expect([...origins]).toEqual([baseURL origin])`; `:76` loaded faces contain each family | ✅ |
| DS-08 | only Icon imports lucide-react | `test/designSystem.test.ts:52` `expect(lucideImportersOtherThanIcon()).toEqual([])` | ✅ |
| DS-09 | disabled → native `disabled`, skipped by Tab | `src/web/ui/Button/Button.test.tsx:98` "disabled and inert buttons are skipped by Tab" (attribute plus `userEvent.tab()` focus check); the same in the CheckboxRow and CheckToggle tests | ✅ |

### P1: Main view

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| MAIN-01 | 1280×900 matches `main--desktop.png` apart from the listed differences | Walk, `captures/main--desktop.running.png` | ❌ Unlisted differences (see the walk) |
| MAIN-02 | 390×844 matches `main--phone.png`: tray above grid, grid scrolls, label hidden | Walk, `captures/main--phone.running.png`; `e2e/main.spec.ts:49-50` overflowX `auto`, hidden > 0 | ❌ Same time-range ellipsis difference |
| MAIN-03 | "This week" + "Nov 2 – Nov 8, 2026" | `src/web/planner/PlannerPage.test.tsx:44` heading level 1 "This week"; `:48` `getByText("Nov 2 – Nov 8, 2026")`; `format.test.ts:20` exact string | ✅ |
| MAIN-04 | 7 columns Mon→Sun, weekday + day number; hours 06–23 in the language's format | `PlannerPage.test.tsx:58` `toEqual(["Mon",…,"Sun"])`; `:63` `["2",…,"8"]`; `:70-72` 17 labels, "6 AM"…"10 PM"; `e2e/main.spec.ts:173-174` pt-BR "06:00"…"22:00" | ✅ (17 rows cover 06:00–23:00) |
| MAIN-05 | today's column marked, day number circled in accent | `WeekGrid.test.tsx:45-62` only Sunday head and column have `styles.today` | ⚠️ The accent circle is checked by class only. The walk confirms the teal circle. |
| MAIN-06 | line across today at now, accent | `e2e/main.spec.ts:109` `toBeCloseTo(79.2,0)`; `:110` `inToday` true; `:112` `rgb(31, 111, 107)` = `--accent` | ✅ |
| MAIN-07 | slate block, hatch, lock, name, range, positioned | `GridBlock.test.tsx:49` `toHaveClass(styles.anchor)`; `:51` `svg.lucide-lock`; `:52` range text; `:53` top 132 / height 396 | ⚠️ The hatch is checked through the class only. The walk shows it. |
| MAIN-08 | placement in its category color, top from start, height from duration | `GridBlock.test.tsx:68-72` `--tone-*` = `var(--sage-*)`; `Swatch.test.tsx:56` full `categoryTones` map (movement sage, home sky, errands apricot, rest lilac, people rose); `grid.test.ts` geometry | ✅ |
| MAIN-09 | < 40 px → name row only | `GridBlock.test.tsx:90` `not.toHaveTextContent("7:00 – 7:45 PM")`; `grid.test.ts` `isTinyBlock(39.9)` true, `(40)` false | ✅ |
| MAIN-10 | done anchor faded, check filled | `GridBlock.test.tsx:96` `toHaveClass(styles.done)`; `:99-100` `aria-pressed="true"` | ✅ |
| MAIN-11 | done placement struck, faded, check filled | `GridBlock.test.tsx:106-110` done class, `textStyles.strike`, `aria-pressed` true | ✅ |
| MAIN-12 | "Today · <weekday, month day>", items in start order with checkbox, name, range, dot (slate for anchors) | `PlannerPage.test.tsx:79` "Today · Thursday, Nov 5"; `:85` `["Gym class","Work","Read"]`; `:86-88` ranges; `TodayStrip.test.tsx:95,99` anchor/movement swatch | ✅ |
| MAIN-13 | "Now" pill instead of the dot | `PlannerPage.test.tsx:95-97`; `TodayStrip.test.tsx:113-114` Now present, swatch null | ✅ |
| MAIN-14 | "A free day" + exact empty text | `TodayStrip.test.tsx:63-68` exact strings | ✅ |
| MAIN-15 | "N of M done" | `PlannerPage.test.tsx:89` "0 of 3 done"; `progress.test.ts:54` `todaySummary` toEqual | ✅ |
| MAIN-16 | "Days you showed up", "N of 7", 7 dots M–S filled per day with a done item | `TodayStrip.test.tsx:124-141`; `progress.test.ts:74` `daysShowedUp` toEqual | ✅ |
| MAIN-17 | "N of M done" + meter N/M, capped | `TodayStrip.test.tsx:143-146` text and `aria-valuenow/max`; `progress.test.ts:100` `{done:3,total:9}`; `:105` cap `{done:2,total:9}` | ✅ |
| MAIN-18 | "Fit in this week", "N left" (per activity ≥ 0), hint | `Tray.test.tsx:73-80`; `tray.test.ts:50` `trayLeft` toBe(5); over-placed counts 0 in `tray.test.ts:53` | ✅ |
| MAIN-19 | "N× this week · dur (· K placed)", pips done/placed/open, Find a time | `Tray.test.tsx:88-103` | ✅ (pip colors are checked through classes) |
| MAIN-20 | fully placed: swatch, no Find a time, "All done/placed this week" | `Tray.test.tsx:118-128` | ✅ |
| MAIN-21 | ends with "+ New flexible activity" | `Tray.test.tsx:135-137` last button accessible name | ✅ |
| MAIN-22 | mark, name, "Example week" grey dot, Add with plus, language switch | `src/web/app/TopBar.test.tsx:16-29` (`statusStyles.neutral`, `lucide-plus`, both language buttons enabled) | ✅ |
| MAIN-23 | the listed controls drawn disabled | `PlannerPage.test.tsx:105-123` every button and checkbox `toBeDisabled()`, each named control present; `WeekHeader.test.tsx:26-31` | ✅ |
| MAIN-24 | no red or undone wording, either language | `e2e/main.spec.ts:146` no element computes to `--bad`; `:149-151` undone-word regex, both languages | ✅ |
| MAIN-25 | all texts from i18n | `PlannerPage.test.tsx:148-156` no English fragment from `en.json` in pt-BR | ✅ |
| MAIN-26 | Português → pt-BR texts, dates, 24 h | `e2e/main.spec.ts:161-178` (`lang`, "Esta semana", "2 de nov. – 8 de nov. de 2026", "09:00 – 18:00", no AM/PM) | ✅ |
| MAIN-27 | no horizontal scroll at 390/1280; grid scrolls inside its card | `e2e/main.spec.ts:38` overflow 0; `:49-50` | ✅ |

### Edge cases

| Edge | Outcome | Evidence | Result |
| --- | --- | --- | --- |
| MAIN-28 no now-line outside 06–23 | null at 05:59 and 23:00 | `grid.test.ts` `expect(nowOffset(at(5,59))).toBeNull()`, `expect(nowOffset(at(23))).toBeNull()`; `WeekGrid.test.tsx:75` none when null | ✅ |
| MAIN-29 clip to grid hours | 05–07 → top 0, h 44; 23:00–23:30 → null | `grid.test.ts` `blockGeometry(at(5),at(7))` toEqual `{top:0,height:44}`, `blockGeometry(at(23),at(23,30))` toBeNull | ✅ |
| MAIN-30 names cut with an ellipsis on one line | ellipsis, nowrap, 1 line | `e2e/main.spec.ts:198-203` "Therapy session" | ✅ for names. The time range is **not** ellipsized (see the walk). |
| MAIN-31 empty tray | empty text + "0 left" | `Tray.test.tsx:140-151` | ✅ |

### P1: Status page

| AC | Outcome | Evidence | Result |
| --- | --- | --- | --- |
| STATUS-01 | top bar + status card at `/status` | `e2e/status.spec.ts:7-8`; `App.test.tsx:50-61` banner before the heading, server and database connected | ✅ |
| STATUS-02 | unknown path → planner | `App.test.tsx:71` heading "This week"; `Navigate replace` in `App.tsx:21` | ✅ |
| STATUS-03 | language survives a reload | `e2e/status.spec.ts:33-35` | ✅ |

**Status**: 41/43 ACs pass. MAIN-01 and MAIN-02 fail the walk. 4 spec-precision gaps are noted above (DS-06, MAIN-05, MAIN-07, MAIN-19 pip colors), each covered by hand or by the walk.

---

## C10/C11 Walk

Setup: clock fixed to Sunday 2026-11-08 07:48 local, light scheme, English (Playwright `en-US`), built app on port 3100, full-page screenshots at 1280×900 and 390×844. They were taken with a temporary spec, since deleted.

### Matches, accounting for the listed differences and ADs

- AD-010: no proposal intro, legend, example banner, "What changed" notes or Next steps. AD-016: "Example week" with a grey dot. AD-012: language switch on the right. AD-019: switch on a right-aligned second row at 390 px. AD-013: teal now-line and dot. AD-011: Today faded, the other controls drawn normally.
- Week header, Today strip (free day, 6 of 7, 11 of 16 done, meter), grid, tray ("4 left", items, pips, Call parents swatch with "All done this week", "+ New flexible activity") are in the same places with the same colors, hatch and lock icons. Thursday's Gym class is dark and undone, the other past items are faded and checked, and the placed names are struck through. The tray sits beside the grid at 1280 px and above it at 390 px, the grid scrolls sideways, and Add is icon-only on the phone.
- AD-014: the prototype's 7th "Days you showed up" dot is the stray red dot at the strip's left edge. The product draws all seven dots in place, with today's (Sunday) dot open and outlined and "S" in bold. MAIN-16 ("seven day dots") requires this.

### Unlisted differences

1. **Anchor time ranges are cut off with no ellipsis** (desktop and phone). The prototype shows "9:00 AM – 6:00…" on the Work blocks, and "9:00 AM – …" and "7:00 – 8:0…" on the phone. The product cuts the text hard: "9:00 AM – 6:00" on desktop, "9:00 AM – 6" and "7:00 – 8:00" on the phone. Root cause: `src/web/planner/components/GridBlock.module.css:37-43` sets `text-overflow: ellipsis` on the `.time` wrapper, but the text sits in a block-level `<Text as="div">` child. Measured in Chromium: inner `textOverflow: clip`, `overflow: visible`, scrollWidth 119 > clientWidth 102. Fix: render the time with `<Text truncate>` (as the name already is), or with `as="span"`.
2. **The Today strip's empty text does not wrap on desktop.** The prototype keeps "Nothing planned today. Drag something…" in a narrow column of about 220 px, on 3 lines. The product draws it on one full-width line. On the phone, both versions wrap at full width. This is cosmetic.
3. Spec documentation gap, not a code issue: AD-019 (the taller top bar on phones) is missing from the spec's `## Differences from the source` table, though STATE.md confirms it.

---

## Discrimination Sensor

The mutations ran in this verifier's own isolated git worktree. Each was reverted with `git checkout -- <file>`, and `git stash` was never used. The baseline `git status --porcelain` (only the two untracked `.running.png`) matched after every revert.

| # | File | Mutation | Tests run | Killed? |
| --- | --- | --- | --- | --- |
| 1 | `src/web/planner/model/progress.ts:53` | `Math.min(done, timesPerWeek)` → `done` (no cap) | `progress.test.ts` | ✅ Killed ("caps done placements…") |
| 2 | `src/web/planner/model/tray.ts` `trayLeft` | dropped `Math.max(0, …)` | `tray.test.ts` | ✅ Killed ("counts an over-placed activity as 0") |
| 3 | `src/web/planner/model/grid.ts` `nowOffset` | `minutes >= GRID_END` → `>` | `grid.test.ts` | ✅ Killed ("draws no now-line outside 06:00–23:00") |
| 4 | `src/web/App.tsx:21` | removed the `*` → `Navigate` route | `App.test.tsx` | ✅ Killed ("sends unknown paths to the planner") |
| 5 | `src/web/planner/model/exampleWeek.ts:82` | placements done `day < today` → `<=` | `src/web/planner` | ✅ Killed (2 tests) |
| 6 | `src/web/planner/model/schedule.ts:57` | removed the start-time sort | `src/web/planner` | ✅ Killed (2 tests) |
| 7 | `src/web/app/TopBar.module.css` `.language` | `flex-basis: 100%` → `auto` (the switch wraps left-aligned instead of right-aligned: measured x=16 vs x=230 at 390 px) | `e2e/status.spec.ts` | ❌ **Survived** (4/4 pass) |
| 8 | `src/web/app/TopBar.module.css` media query | removed `flex-wrap: wrap` | `e2e/status.spec.ts` | ✅ Killed ("fits 360 px…", "keeps the top bar parts apart") |
| 9 | `src/web/planner/components/WeekGrid.module.css:3` | `.scroll` `overflow-x: auto` → `visible` | `e2e/main.spec.ts` | ✅ Killed ("has no horizontal scroll") |
| 10 | `src/web/planner/components/WeekGrid.module.css:102` | now-line `var(--accent)` → `var(--bad)` | `e2e/main.spec.ts` | ✅ Killed (now-line color and no-error-red tests) |

**Sensor depth**: expanded (10 mutations). **Result**: 9/10 killed. **FAIL** (1 survivor)

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code / surgical / no scope creep | ✅ Every change maps to a task. Rules live in `planner/model/` per AD-017. |
| Matches patterns | ✅ CSS Modules, design-system components, erasable TS |
| Spec-anchored outcome check | ✅ with 4 precision gaps (class-level visual checks) |
| Per-layer coverage | ✅ Model branches are tested 1:1. Routes cover `/`, `/status` and the fallback. |
| Unclaimed tests | ✅ none found |
| Guidelines: `CLAUDE.md` | ✅ No spec citations in comments. Strings are i18n'd in both languages. No red on undone items. |

Note, outside the spec: `PlannerPage` builds the example data once per mount (`useState`). A page left open from Sunday into Monday moves to the new week while its placements keep the old week key. The fixture is temporary, so this is low priority.

---

## Fix Plans

### Fix 1 (Major, blocks MAIN-01/02): ellipsis on block time ranges
- **Root cause**: `GridBlock.tsx` wraps the time in `<Text as="div" mono>` inside `.time`, so the wrapper's `text-overflow` never applies.
- **Fix task**: render the time with `<Text as="div" mono truncate>` (or `as="span"`). Extend `e2e/main.spec.ts` "cuts long names with an ellipsis" to also check a Work block's time range: `textOverflow: "ellipsis"` on the element that overflows.
- **Verify**: rerun the walk; Work shows "9:00 AM – 6:00…".

### Fix 2 (Minor, AD-019): assert the second-row right alignment
- **Fix task**: in `e2e/status.spec.ts` "keeps the top bar parts apart on a phone", assert that the language buttons sit below the Add button (`en.y >= add.y + add.height`) and are right-aligned (`pt.x + pt.width` close to `add.x + add.width`).
- **Verify**: mutation 7 is killed.

### Fix 3 (Cosmetic): Today-strip empty text width on desktop
- **Fix task**: give the empty text the prototype's max width (about 220 px) at desktop width, or record the difference as accepted in the spec.

### Fix 4 (Docs): add AD-019 to the spec's `## Differences from the source` table.

---

## Requirement Traceability Update

| Requirement | New Status |
| --- | --- |
| DS-01…DS-09, MAIN-03…MAIN-31, STATUS-01…03 | ✅ Verified |
| MAIN-01, MAIN-02 | ❌ Needs Fix (Fix 1, Fix 3) |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 41/43 ACs pass. MAIN-01 and MAIN-02 fail the walk. 4 spec-precision gaps are flagged and covered by hand or by the walk.
**Sensor**: 9/10 killed (TopBar right alignment survived)
**Gate**: `npm run check` exit 0 (314 passed). `npm run e2e` exit 0 (11 passed). C-proofs: 41/41 commands pass.

**Next steps**: route Fix 1 and Fix 2 (and Fix 3 or a decision on it) to an implementer, then re-verify.

## State validation

`python3 ~/.claude/skills/tlc-spec-driven/scripts/validate_state.py 0002-main-layout` → exit 1: "validation.md verdict is FAIL - route the ranked gaps to fix tasks, then re-verify (feature is not done)". This is the expected result for a FAIL verdict.
