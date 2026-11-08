# Main Layout Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, the walk, check_proofs, the Verifier and the screens sub-agent).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/0002-main-layout/design.md`
**Status**: Approved
**Approved**: 2026-11-08 - user: "approved, but do not start just commit"
**Mutations**: 3
**Build**: `npm run build; npm run typecheck; npm run lint`

---

## Test Coverage Matrix

> Generated from the codebase, the project rules and the spec. Guidelines found: `CLAUDE.md` (rules that change what the user sees live in plain functions with unit tests; `npm run check` before done; `npm run e2e` when the browser changes), `vite.config.ts` (Vitest projects `web` and `server`), `playwright.config.ts`. Samples: `src/web/health/healthView.test.ts`, `src/web/StatusPage.test.tsx`, `src/web/LanguageSwitch.test.tsx`, `test/harness.test.ts`, `test/repo.test.ts`, `e2e/status.spec.ts`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Design tokens and global CSS | unit (reads the CSS file) | Every prototype light token value; dark block present | `src/web/ui/styles/*.test.ts` | `npx vitest run --project web` |
| Design-system components | component (Vitest + jsdom + Testing Library) | Every prop that changes the DOM (variant, state, `disabled`, `inert`, `pressed`, accessible name) | `src/web/ui/**/*.test.tsx` | `npx vitest run --project web` |
| Stories | none | typecheck + lint only (AD-007) | `src/web/ui/**/*.stories.tsx` | build gate only |
| Planner model | unit | All branches; 1:1 to spec ACs; every listed edge case | `src/web/planner/model/*.test.ts`, `src/web/planner/useNow.test.ts` | `npx vitest run --project web` |
| Planner components and page | component | Every state the spec names for that section | `src/web/planner/**/*.test.tsx`, `src/web/app/*.test.tsx` | `npx vitest run --project web` |
| App routing | component (`MemoryRouter`) | Each route and the fallback | `src/web/App.test.tsx` | `npx vitest run --project web` |
| Repo and harness rules | integration (runs the tools / reads the files) | Lint rule allow and deny cases; stories and Icon rules | `test/*.test.ts` | `npx vitest run --project server` |
| Whole app in a browser | e2e (Playwright, Chromium, clock fixed) | Widths, colors, fonts, language, dark scheme, routes | `e2e/*.spec.ts` | `npm run e2e` |
| Shared types, config files | none | build gate only | `src/shared/planner.ts`, root configs | build gate only |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Tasks with unit or component tests only | `npm run typecheck && npx vitest run --project web` |
| Integration | Tasks with repo or harness tests | `npm run typecheck && npx vitest run` |
| Full | Tasks with e2e tests | `npm run check && npm run e2e` |
| Build | Config-only tasks and the end of each phase | `npm run check` |

---

## Execution Plan

Phases run in order; tasks within a phase run in order.

### Phase 1: Tooling and tokens

```
T1 → T2 → T3
```

### Phase 2: Layout and text primitives

```
T4 → T5 → T6 → T7 → T8
```

### Phase 3: Controls

```
T9 → T10 → T11
```

### Phase 4: Indicators

```
T12 → T13 → T14 → T15 → T16
```

### Phase 5: Migrate existing UI and enforce the rule

```
T17 → T18 → T19
```

### Phase 6: Planner model

```
T20 → T21 → T22 → T23 → T24 → T25 → T26 → T27 → T28
```

### Phase 7: Planner components

```
T29 → T30 → T31 → T32 → T33 → T34 → T35
```

### Phase 8: Routing and browser checks

```
T36 → T37
```

---

## Task Breakdown

### T1: Add the new dependencies and confirm their APIs

**What**: Install `react-router`, `lucide-react`, `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/instrument-sans`, `@fontsource/jetbrains-mono` (dependencies) and `storybook`, `@storybook/react-vite` (dev). Read the installed packages and record in this task's Done when: the React Router declarative exports (`BrowserRouter`, `MemoryRouter`, `Routes`, `Route`, `Navigate`), and each font's CSS family name and the import paths for Bricolage's optical-size axis and JetBrains Mono 400/500.
**Where**: `package.json`
**Depends on**: None
**Reuses**: versions checked 2026-11-08 (React Router 8.5, lucide-react 1.70, Storybook 10.6, fontsource 5.3)
**Requirement**: DS-07, DS-08

**Done when**:

- [x] `npm install` exits 0 with no peer-dependency errors (`npm ls` exits 0)
- [x] React Router exports and font family names/paths written here:
  - `react-router` 8.5.1 exports `BrowserRouter`, `MemoryRouter`, `Routes`, `Route`, `Navigate` (all functions, imported from `react-router`)
  - Bricolage Grotesque: family `'Bricolage Grotesque Variable'`; optical-size axis via `import '@fontsource-variable/bricolage-grotesque/opsz.css'` (weight 200-800 plus `opsz`)
  - Instrument Sans: family `'Instrument Sans Variable'`; `import '@fontsource-variable/instrument-sans'` (weight 400-700)
  - JetBrains Mono: family `'JetBrains Mono'`; `import '@fontsource/jetbrains-mono/400.css'` and `import '@fontsource/jetbrains-mono/500.css'`
  - Installed: lucide-react 1.70.0, storybook and @storybook/react-vite 10.6.6, fontsource packages 5.3.0
- [x] Gate passes: `npm run check`

**Tests**: none (dependencies only; DS-07 is proven by T37, DS-08 by T4)
**Gate**: build
**Commit**: `chore: add router, icons, fonts and Storybook`

---

### T2: Port the prototype tokens and global styles

**What**: Create `src/web/ui/styles/tokens.css` with every prototype token (light `:root`; dark under `prefers-color-scheme: dark` guarded by `:root:not([data-theme="light"])`, and under `:root[data-theme="dark"]`), font families from T1, and `global.css` (font imports, box-sizing, body, `:focus-visible`, reduced motion). `main.tsx` imports them instead of `styles.css`; the skeleton-only rules move with the components that need them in T17/T18, and `styles.css` is deleted then.
**Where**: `src/web/ui/styles/tokens.css`
**Depends on**: T1
**Reuses**: prototype `:root` block; `src/web/styles.css`
**Requirement**: DS-04, DS-05

**Done when**:

- [x] `tokens.test.ts` "light tokens match the prototype" checks every light value (`--bg #EEF1F4` ... `--rose-line #EBBAC5`, fonts, `--r 10px`)
- [x] `tokens.test.ts` "dark tokens match the prototype" checks every dark value
- [x] Gate passes: `npm run typecheck && npx vitest run --project web` (also `npm run check` and `npm run e2e`)
- Notes: the test reads `tokens.css?raw`, which needs `css.include` for `src/web/ui/styles` in the `web` Vitest project (Vitest empties CSS by default). `styles.css` keeps only the skeleton rules and is imported by `App.tsx` until T17/T18.

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): port the prototype design tokens`

---

### T3: Configure Storybook and the stories rule

**What**: Add `.storybook/main.ts` (framework `@storybook/react-vite`, stories `../src/web/ui/**/*.stories.tsx`) and `.storybook/preview.ts` (imports `global.css`), the `storybook` script, `.storybook` in `tsconfig.web.json` and the ESLint project list, `storybook-static/` in `.gitignore` and `.prettierignore`. Add `test/designSystem.test.ts` with "every component has stories": each `src/web/ui/<Name>/<Name>.tsx` has `<Name>.stories.tsx` exporting at least one story. Smoke-run `npx storybook build` once and note the outcome here.
**Where**: `.storybook/main.ts`
**Depends on**: T2
**Reuses**: `test/repo.test.ts` file-reading style
**Requirement**: DS-06

**Done when**:

- [x] `npx storybook build` exits 0 (outcome noted)
- [x] "every component has stories" passes (no components yet) and fails on a component folder without stories (checked by hand)
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: `npx storybook build --test` exits 0 with the root `vite.config.ts` (its `test` block does not get in the way); it warns "No story files found" until T4 adds the first story. By hand: a `Fake/Fake.tsx` with no stories file, and one whose stories file has only a default export, both fail the rule with `[ 'Fake' ]`; adding `export const Default` makes it pass.

**Tests**: integration
**Gate**: integration
**Commit**: `chore: configure Storybook for the design system`

---

### T4: Icon

**What**: `Icon` maps `plus`, `lock`, `chevronLeft`, `chevronRight`, `grip`, `x`, `check` to Lucide icons at 12 or 16 px, stroke 1.8, `aria-hidden`. Story per icon and size. Add "only Icon imports lucide-react" to `test/designSystem.test.ts`.
**Where**: `src/web/ui/Icon/Icon.tsx`
**Depends on**: None in this phase (Phase 1 completes first)
**Reuses**: -
**Requirement**: DS-08

**Done when**:

- [x] `Icon.test.tsx`: renders an `svg` with `aria-hidden="true"` and the requested size for each name
- [x] "only Icon imports lucide-react" passes
- [x] Gate passes: `npm run typecheck && npx vitest run`
- Notes: `grip` is Lucide `GripVertical` (the prototype's two columns of three dots). The test identifies the drawn icon by Lucide's `lucide-<icon>` class. By hand: a stray `src/web/*.ts` importing `lucide-react` fails the rule; mapping `grip` to `Lock` or stroke 2 fails `Icon.test.tsx`. `npx storybook build --test` exits 0.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Icon`

---

### T5: Text

**What**: `Text` with `as` (`p`/`span`/`div`), `tone`, `size`, `mono`, `weight`, `truncate`, `strike`; CSS Module; stories per tone, size, mono, truncate, strike.
**Where**: `src/web/ui/Text/Text.tsx`
**Depends on**: T4
**Reuses**: tokens
**Requirement**: DS-06, MAIN-30

**Done when**:

- [x] `Text.test.tsx`: renders the chosen element; each prop adds its class; children pass through
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: sizes and weights come from the prototype CSS: `md` 15 px (body), `sm` 13.5 px (subtitles, hints), `xs` 12.5 px (meta lines); `medium` is 550 (item names). A prop left out adds no class, so the text inherits size, weight and color from its parent (block names keep their category color). A base class resets the `p` margin; spacing comes from layout. By hand: mapping `strike` to the mono class, or ignoring `as`, fails `Text.test.tsx`.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Text`

---

### T6: Heading

**What**: `Heading` with `level` 1–3 and `size` (`page` 28 px, `section` 17 px, `card` 16 px), display font; stories per level/size.
**Where**: `src/web/ui/Heading/Heading.tsx`
**Depends on**: T5
**Reuses**: tokens
**Requirement**: DS-06

**Done when**:

- [x] `Heading.test.tsx`: `level` sets `h1`/`h2`/`h3`; `size` sets its class independent of level
- [x] Gate passes: `npm run typecheck && npx vitest run` (also lint and format check)
- Notes: sizes and weights come from the prototype CSS: `page` 28 px / 700 (24 px under 640 px), `section` 17 px / 650, `card` 16 px / 650; every level gets the display font, `-0.01em` tracking, balanced wrapping and no margin. No `size` adds no size class. Props extend the native heading props (design.md), so `id` passes through for `aria-labelledby`.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Heading`

---

### T7: Stack

**What**: `Stack` flex layout: `direction`, `gap` (token scale 0–7), `align`, `justify`, `wrap`, `as` (`div`/`section`/`header`/`aside`/`nav`); stories.
**Where**: `src/web/ui/Stack/Stack.tsx`
**Depends on**: T6
**Reuses**: tokens
**Requirement**: DS-06

**Done when**:

- [x] `Stack.test.tsx`: each prop maps to its class; `as` sets the element
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: the gap scale is 0, 4, 6, 8, 10, 12, 16, 20 px as `--space-0`…`--space-7` in `src/web/ui/styles/spacing.css`, imported by `global.css` and checked by `spacing.test.ts` (AD-018). It sits outside `tokens.css` so that file stays the prototype's token block (C4 compares it whole). The prototype's one-off 14, 18 and 28 px gaps belong in the CSS of the component that uses them. `direction` defaults to `column`; a prop left out adds no class; `justify` takes `start`/`center`/`end`/`between`. Props extend the native `div` props without `className`/`style`, so `id` and `aria-labelledby` pass through for landmarks.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Stack`

---

### T8: Card

**What**: `Card` surface (`--surface`, `--line` border, 14 px radius) with `padding` and `as`; stories.
**Where**: `src/web/ui/Card/Card.tsx`
**Depends on**: T7
**Reuses**: tokens
**Requirement**: DS-06

**Done when**:

- [x] `Card.test.tsx`: `as` and `padding` map to element and class; passes `aria-labelledby` through
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: paddings come from the prototype's cards: `md` is 16 px (tray), `lg` is 18 px by 20 px and 16 px under 640 px (today strip); no `padding` gives none (week grid card). `as` defaults to `div`. Props extend the native `div` props without `className`/`style`, like `Stack`. The prototype's grid card also clips with `overflow: hidden`; that stays with the week grid, not `Card`.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Card`

---

### T9: Button

**What**: `Button` on native `button` (`type="button"` default): `variant` (`default`, `primary`, `ghost`, `dashed`, `accent`), `size`, `icon`, `iconOnly` (label → `aria-label`), `collapseLabel` (label visually hidden under 640 px), `pressed` (`aria-pressed`), `disabled` (faded), `inert` (native `disabled`, unchanged look); `VisuallyHidden` helper in the same folder. Stories for every variant, size, icon-only, pressed, disabled, inert.
**Where**: `src/web/ui/Button/Button.tsx`
**Depends on**: None in this phase (Phase 2 completes first)
**Reuses**: `Icon`
**Requirement**: DS-09, MAIN-23

**Done when**:

- [x] `Button.test.tsx` "disabled and inert buttons are skipped by Tab": both carry `disabled` and `userEvent.tab()` skips them
- [x] Tests: variant classes, `iconOnly` accessible name, `collapseLabel` keeps the accessible name, `pressed` sets `aria-pressed`, `inert` has no faded class, click calls `onClick` when enabled
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: styles follow the prototype's `.btn`, `.btn.sq`, `.find` (`size="sm"` + `variant="accent"`) and `.newflex` (`dashed`). `pressed` fills with the accent. The collapsed label is hidden with the same clip technique as `VisuallyHidden`, so it stays the accessible name. Labels are strings, so `iconOnly` can use the label as `aria-label`. `inert` overrides the native HTML `inert` attribute and is never passed to the DOM.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Button`

---

### T10: CheckboxRow

**What**: `CheckboxRow`: a `label` wrapping a native checkbox (accent color), title (truncated), meta line (mono), trailing slot; `checked` gives the sunk background and struck, muted title; `disabled`/`inert` as in Button. Stories: unchecked, checked, with trailing badge, inert.
**Where**: `src/web/ui/CheckboxRow/CheckboxRow.tsx`
**Depends on**: T9
**Reuses**: `Text`
**Requirement**: DS-09, MAIN-12

**Done when**:

- [x] `CheckboxRow.test.tsx`: checkbox's accessible name is the title; `checked` reflects; inert checkbox is disabled and skipped by Tab; trailing slot renders
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: styles follow the prototype's `.trow`. The checkbox takes the title as `aria-label`, because the wrapping label also holds the meta line and trailing slot. Checked rows get the sunk background and a struck, muted title through `Text`. `disabled` fades the row like Button; `inert` disables it without fading. The checkbox is `readOnly` when no `onChange` is given. The trailing-badge story draws a placeholder pill until `Badge` (T12) exists.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add CheckboxRow`

---

### T11: CheckToggle

**What**: `CheckToggle`: round 16 px toggle button colored by `currentColor`, `aria-pressed`, filled with a check when pressed, `label` as accessible name, `inert`. Stories on slate and on each category tint.
**Where**: `src/web/ui/CheckToggle/CheckToggle.tsx`
**Depends on**: T10
**Reuses**: `Icon`
**Requirement**: DS-09, MAIN-10, MAIN-11

**Done when**:

- [x] `CheckToggle.test.tsx`: `aria-pressed` follows `pressed`; accessible name is `label`; inert is disabled and skipped by Tab
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: styles follow the prototype's `.chk`: 16 px circle, 1.5 px `currentColor` border at 0.7 opacity; pressed fills with `currentColor` at full opacity and shows the check. The Lucide check is drawn at 10 px with stroke 3 through CSS, which beats the SVG attributes. The tick takes `--check-tick`, which the block sets to its own background (the prototype strokes it in the block's background color); it falls back to `--surface`. Props extend the native `button` props without `disabled`: only `inert`, as the design lists. By hand: dropping `disabled={inert}` or fixing `aria-pressed` to `true` fails `CheckToggle.test.tsx`.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add CheckToggle`

---

### T12: Badge

**What**: `Badge` pill with `tone` `count` (mono, muted, bordered) and `now` (accent, semibold); stories.
**Where**: `src/web/ui/Badge/Badge.tsx`
**Depends on**: None in this phase (Phase 3 completes first)
**Reuses**: tokens
**Requirement**: MAIN-13, MAIN-18

**Done when**:

- [x] `Badge.test.tsx`: each tone sets its class; text renders
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: styles follow the prototype's `.count` (12 px mono, muted, 1 px 9 px padding) and `.pill` (11.5 px semibold accent, 1 px 8 px padding), both bordered with `--line` and fully round. The prototype's `margin-left: auto` on `.pill` is left to the parent, as `CheckboxRow` already pushes its trailing slot to the end. By hand: dropping the tone class from `Badge.tsx` fails both `Badge.test.tsx` cases.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Badge`

---

### T13: Meter

**What**: `Meter` 6 px bar filled to `value / max` (0 when `max` is 0), `role="meter"` with `aria-valuenow/min/max` and `aria-label`; stories at 0, partial, full.
**Where**: `src/web/ui/Meter/Meter.tsx`
**Depends on**: T12
**Reuses**: tokens
**Requirement**: MAIN-17

**Done when**:

- [x] `Meter.test.tsx`: fill width is `value/max` as a percentage; `max` 0 gives 0 %; ARIA values set
- [x] Gate passes: `npm run typecheck && npx vitest run` (also `npm run check`)
- Notes: styles follow the prototype's `.meter` (6 px, 3 px radius, `--line-soft` track, `--accent` fill, 0.4 s width transition, which the global reduced-motion rule turns off). The width is the unrounded `value/max` percentage, clamped to 0–100, from the exported `meterPercent`; the prototype rounds it, which draws the same. By hand: removing the `max` 0 guard fails 3 cases.

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Meter`

---

### T14: Swatch

**What**: `Swatch` dot (8 px) or square (10 px) in a category's ink color or the anchor slate; exports `categoryTones` (category → token names) used by blocks; stories for every tone and shape.
**Where**: `src/web/ui/Swatch/Swatch.tsx`
**Depends on**: T13
**Reuses**: tokens
**Requirement**: MAIN-08, MAIN-12, MAIN-20

**Done when**:

- [ ] `Swatch.test.tsx`: each tone and shape sets its class; `aria-hidden`
- [ ] Gate passes: `npm run typecheck && npx vitest run`

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add Swatch`

---

### T15: StatusIndicator

**What**: `StatusIndicator`: 7 px dot + 12.5 px muted text, `role="status"`, `tone` `neutral` (faint), `ok`, `busy`, `error`; stories per tone.
**Where**: `src/web/ui/StatusIndicator/StatusIndicator.tsx`
**Depends on**: T14
**Reuses**: tokens
**Requirement**: MAIN-22

**Done when**:

- [ ] `StatusIndicator.test.tsx`: `role="status"` with the text; tone sets its class
- [ ] Gate passes: `npm run typecheck && npx vitest run`

**Tests**: component
**Gate**: integration
**Commit**: `feat(ui): add StatusIndicator`

---

### T16: BrandMark

**What**: `BrandMark`: the 30 px slate square with three bars (slate-sub, sage, apricot), `aria-hidden`; story.
**Where**: `src/web/ui/BrandMark/BrandMark.tsx`
**Depends on**: T15
**Reuses**: tokens
**Requirement**: MAIN-22

**Done when**:

- [ ] `BrandMark.test.tsx`: renders three bars, `aria-hidden="true"`
- [ ] Gate passes: `npm run check`

**Tests**: component
**Gate**: build (end of phase)
**Commit**: `feat(ui): add BrandMark`

---

### T17: Rebuild LanguageSwitch on Button

**What**: `LanguageSwitch` renders `Button` with `pressed` and `size="sm"` instead of raw `button`; its styles move from `styles.css` into the component's use of `Button`.
**Where**: `src/web/LanguageSwitch.tsx`
**Depends on**: None in this phase (Phase 4 completes first)
**Reuses**: `Button`; existing `LanguageSwitch.test.tsx`
**Requirement**: DS-01, MAIN-22

**Done when**:

- [ ] Existing `LanguageSwitch.test.tsx` passes unchanged
- [ ] No raw element left in the file
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `refactor(web): build LanguageSwitch on Button`

---

### T18: Rebuild StatusPage on the design system

**What**: `StatusPage` renders `Card`, `Heading`, `Text` (error lines in `--bad` via `Text tone="error"`, added to `Text` here with a test); delete `src/web/styles.css`.
**Where**: `src/web/StatusPage.tsx`
**Depends on**: T17
**Reuses**: `useHealth`, `healthView`; existing `StatusPage.test.tsx`
**Requirement**: DS-01, STATUS-01

**Done when**:

- [ ] Existing `StatusPage.test.tsx` passes unchanged; `Text.test.tsx` covers `tone="error"`
- [ ] No raw element left in the file; `styles.css` gone
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `refactor(web): build StatusPage on the design system`

---

### T19: Enforce the raw-element rule

**What**: In `eslint.config.js`, for `src/web/**/*.tsx` except `src/web/ui/**`, add `no-restricted-syntax` with one selector per element (`button`, `input`, `select`, `textarea`, `a`, `label`, `h1`–`h6`, `p`, `span`) and the message "Use a component from src/web/ui instead of <name>." Add fixtures `test/fixtures/raw-elements.tsx` (all 14) and `test/fixtures/structural-elements.tsx` (`div`, `section`, `main`, `header`, `aside`, `nav`) and three harness tests.
**Where**: `eslint.config.js`
**Depends on**: T18
**Reuses**: `test/harness.test.ts` copy-run-delete pattern
**Requirement**: DS-01, DS-02, DS-03

**Done when**:

- [ ] "lint names every raw element outside src/web/ui": copied to `src/web/raw-elements.tmp.tsx`, lint exits non-zero and the output names all 14 elements
- [ ] "lint allows raw elements inside src/web/ui": copied to `src/web/ui/raw-elements.tmp.tsx`, lint exits 0
- [ ] "lint allows structural elements outside src/web/ui": exits 0
- [ ] The existing hooks-violation harness test still passes
- [ ] Gate passes: `npm run check`

**Tests**: integration
**Gate**: build
**Commit**: `feat(web): forbid raw HTML controls and text outside the design system`

---

### T20: Planner types

**What**: `src/shared/planner.ts` with `Category`, `DayIndex`, `Minutes`, `WeekKey`, `Anchor`, `FlexibleActivity`, `Placement`, `AnchorDone`, `PlannerData` exactly as design.md Data Models.
**Where**: `src/shared/planner.ts`
**Depends on**: None in this phase (Phase 5 completes first)
**Reuses**: design.md Data Models
**Requirement**: MAIN-07, MAIN-08

**Done when**:

- [ ] Gate passes: `npm run check`

**Tests**: none (types only; the matrix says build gate only)
**Gate**: build
**Commit**: `feat(shared): add planner data types`

---

### T21: Week rules

**What**: `week.ts`: `mondayOf`, `weekKey`, `dayIndex`, `minutesOfDay`, `weekDays`.
**Where**: `src/web/planner/model/week.ts`
**Depends on**: T20
**Reuses**: -
**Requirement**: MAIN-03, MAIN-04, MAIN-05

**Done when**:

- [ ] `week.test.ts`: Sunday 2026-11-08 → Monday 2026-11-02 and key `2026-11-02`; Monday maps to 0 and Sunday to 6; `weekDays` gives 7 dates from Monday with only today flagged; a week crossing a month and a year boundary
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add week rules`

---

### T22: Day schedule rule

**What**: `schedule.ts`: `itemsForDay(data, week, day)` → anchor occurrences + that week's placements of that day, with done flags, sorted by start then name; placements of other weeks and of missing activities are left out.
**Where**: `src/web/planner/model/schedule.ts`
**Depends on**: T21
**Reuses**: `src/shared/planner.ts`
**Requirement**: MAIN-12

**Done when**:

- [ ] `schedule.test.ts` "lists a day's items in start-time order": mixed anchors/placements come out by start
- [ ] Tests: done flags for anchor occurrence and placement; other weeks excluded; missing activity skipped; empty day
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add day schedule rule`

---

### T23: Progress rules

**What**: `progress.ts`: `todaySummary`, `daysShowedUp`, `weekProgress` per spec MAIN-15/16/17.
**Where**: `src/web/planner/model/progress.ts`
**Depends on**: T22
**Reuses**: `itemsForDay`
**Requirement**: MAIN-15, MAIN-16, MAIN-17

**Done when**:

- [ ] `progress.test.ts` "counts today's done items", "counts days you showed up", "sums the week's done and total" (done placements beyond times per week are capped)
- [ ] Tests: a week with nothing done gives 0 everywhere, never negative
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add progress rules`

---

### T24: Tray rules

**What**: `tray.ts`: `trayItems(data, week)` (placed, done, pips, state `open`/`allPlaced`/`allDone`) and `trayLeft(items)`.
**Where**: `src/web/planner/model/tray.ts`
**Depends on**: T23
**Reuses**: `src/shared/planner.ts`
**Requirement**: MAIN-18, MAIN-19, MAIN-20, MAIN-31

**Done when**:

- [ ] `tray.test.ts` "counts times left to place" (over-placed activity counts 0, not negative), "builds pips done then placed then open", "marks fully placed and fully done activities", "shows zero left for no activities"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add tray rules`

---

### T25: Grid geometry rules

**What**: `grid.ts`: `GRID_START`, `GRID_END`, `PX_PER_HOUR`, `blockGeometry`, `isTinyBlock`, `nowOffset`, `isNow`.
**Where**: `src/web/planner/model/grid.ts`
**Depends on**: T24
**Reuses**: -
**Requirement**: MAIN-06, MAIN-08, MAIN-09, MAIN-13, MAIN-28, MAIN-29

**Done when**:

- [ ] `grid.test.ts` "positions blocks by start and end" (09:00–18:00 → top 132, height 396), "clips blocks to the grid hours" (05:00–07:00 → top 0, height 44; 23:00–23:30 → null), "marks blocks under 40 px as tiny" (30 min tiny, 60 min not), "places the now-line at the current time" (07:48 → 79.2), "draws no now-line outside 06:00–23:00" (05:59, 23:00), "isNow is true from start up to but not including end"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add grid geometry rules`

---

### T26: Date and time formatting

**What**: `format.ts`: `formatTimeRange`, `formatHourLabel`, `formatWeekRange`, `formatTodayDate`, `formatDayNumber`, `formatWeekday`, `durationParts`, all `Intl` with the language.
**Where**: `src/web/planner/model/format.ts`
**Depends on**: T25
**Reuses**: -
**Requirement**: MAIN-03, MAIN-04, MAIN-12, MAIN-26

**Done when**:

- [ ] `format.test.ts` "formats the week range" (`en` "Nov 2 – Nov 8, 2026"; across a year), "formats time ranges by language" (`en` "7:00 – 8:00 AM", "9:00 AM – 6:00 PM"; `pt-BR` "07:00 – 08:00"), "formats hour labels by language" (`en` "6 AM", `pt-BR` "06:00"), "formats today's date" (`en` "Sunday, Nov 8"), "splits durations" (45 → 45 min; 60 → 1 h; 90 → 1 h 30 min)
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add date and time formatting rules`

---

### T27: Example week fixture

**What**: `exampleWeek(now)` returns the spec's example week dated to `now`'s week, done on days before today except Gym class on Thursday.
**Where**: `src/web/planner/model/exampleWeek.ts`
**Depends on**: T26
**Reuses**: `weekKey`, `dayIndex`
**Requirement**: MAIN-01, MAIN-02

**Done when**:

- [ ] `exampleWeek.test.ts`: on Sunday 2026-11-08 every Mon–Sat item is done except Thursday's Gym class; on a Monday nothing is done; placements carry the current week key; content matches the spec's Assumptions row
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(web): add the example week fixture`

---

### T28: useNow hook

**What**: `useNow()` returns the current `Date` and updates it every 60 s; clears the interval on unmount.
**Where**: `src/web/planner/useNow.ts`
**Depends on**: T27
**Reuses**: -
**Requirement**: MAIN-06, MAIN-13

**Done when**:

- [ ] `useNow.test.ts` (fake timers): value changes after 60 s, not before; no timer left after unmount
- [ ] Gate passes: `npm run check`

**Tests**: unit
**Gate**: build (end of phase)
**Commit**: `feat(web): add useNow hook`

---

### T29: TopBar

**What**: `TopBar`: `BrandMark` + "Routinely", `StatusIndicator tone="neutral"` "Example week", Add activity (`primary`, `icon="plus"`, `collapseLabel`, `inert`), `LanguageSwitch`; i18n keys in both files.
**Where**: `src/web/app/TopBar.tsx`
**Depends on**: None in this phase (Phase 6 completes first)
**Reuses**: `BrandMark`, `StatusIndicator`, `Button`, `LanguageSwitch`
**Requirement**: MAIN-22

**Done when**:

- [ ] `TopBar.test.tsx` "shows the mark, Example week, Add activity and the language switch"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add the top bar`

---

### T30: WeekHeader

**What**: `WeekHeader`: `Heading` "This week", range text, chevron buttons (`iconOnly`, `inert`, labels "Previous week" / "Next week"), Today (`disabled`).
**Where**: `src/web/planner/components/WeekHeader.tsx`
**Depends on**: T29
**Reuses**: `Heading`, `Text`, `Button`, `Stack`
**Requirement**: MAIN-03, MAIN-23

**Done when**:

- [ ] `WeekHeader.test.tsx` "shows This week and the range" and "draws the week controls disabled"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add the week header`

---

### T31: TodayStrip

**What**: `TodayStrip`: "Today · <date>", summary ("N of M done" or "A free day"), "Days you showed up" + "N of 7" + seven dots (no stray marker, AD-014), "This week" + "N of M done" + `Meter`, `CheckboxRow` per item (inert) with time and `Swatch` or `Badge` "Now", or the empty text.
**Where**: `src/web/planner/components/TodayStrip.tsx`
**Depends on**: T30
**Reuses**: `Card`, `Heading`, `Text`, `Meter`, `CheckboxRow`, `Swatch`, `Badge`
**Requirement**: MAIN-12, MAIN-13, MAIN-14, MAIN-15, MAIN-16, MAIN-17

**Done when**:

- [ ] `TodayStrip.test.tsx` "shows a free day when today is empty", "lists items with checkbox, name, time and dot", "shows Now instead of the dot during an item", "shows days you showed up and the week meter"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add the Today strip`

---

### T32: GridBlock

**What**: `GridBlock`: anchor (slate, hatch, lock, `CheckToggle`) or placement (category tint, `CheckToggle`, hover-only unplace `x`, `inert`), name truncated, time line unless tiny, done styles, `style` top/height from the model.
**Where**: `src/web/planner/components/GridBlock.tsx`
**Depends on**: T31
**Reuses**: `Icon`, `Text`, `CheckToggle`, `Button`, `categoryTones`
**Requirement**: MAIN-07, MAIN-08, MAIN-09, MAIN-10, MAIN-11

**Done when**:

- [ ] `GridBlock.test.tsx` "draws an anchor as a locked slate block", "draws a placement in its category color", "hides the time range on a tiny block", "draws a done anchor faded with its check filled", "strikes through a done placement"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add grid blocks`

---

### T33: WeekGrid

**What**: `WeekGrid`: corner + seven day heads (weekday, day number, today circled), hour labels, seven columns with hour lines, today tint, accent now-line with dot, `GridBlock`s; horizontal scroll inside its card with `min-width: 740px`.
**Where**: `src/web/planner/components/WeekGrid.tsx`
**Depends on**: T32
**Reuses**: `Card`, `Text`, `GridBlock`
**Requirement**: MAIN-04, MAIN-05, MAIN-06

**Done when**:

- [ ] `WeekGrid.test.tsx` "marks today's column", "draws the now-line when given an offset and none otherwise", "draws seven day heads and the hour labels"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add the week grid`

---

### T34: Tray

**What**: `Tray`: "Fit in this week", `Badge` "N left", hint, items (grip or `Swatch` square, name, meta, pips, Find a time `accent sm inert`), "+ New flexible activity" (`dashed`, `inert`), empty text.
**Where**: `src/web/planner/components/Tray.tsx`
**Depends on**: T33
**Reuses**: `Card`, `Heading`, `Text`, `Badge`, `Button`, `Swatch`, `Icon`
**Requirement**: MAIN-18, MAIN-19, MAIN-20, MAIN-21, MAIN-31

**Done when**:

- [ ] `Tray.test.tsx` "shows the header, N left and the hint", "shows meta, pips and Find a time", "shows a fully placed activity with its swatch", "ends with New flexible activity", "shows the empty text and 0 left"
- [ ] Gate passes: `npm run typecheck && npx vitest run --project web`

**Tests**: component
**Gate**: quick
**Commit**: `feat(web): add the Fit in this week tray`

---

### T35: PlannerPage

**What**: `PlannerPage` composes `WeekHeader`, `TodayStrip`, `WeekGrid`, `Tray` from `exampleWeek` (computed once per mount), `useNow` and the model; responsive layout (tray beside the grid at ≥ 980 px, above it below).
**Where**: `src/web/planner/PlannerPage.tsx`
**Depends on**: T34
**Reuses**: every model function, `useNow`
**Requirement**: MAIN-03, MAIN-04, MAIN-12, MAIN-13, MAIN-23, MAIN-25

**Done when**:

- [ ] `PlannerPage.test.tsx` (system time fixed): "shows This week and Nov 2 – Nov 8, 2026", "draws seven days from Monday and hours 6 AM to 10 PM", "lists today's items in time order", "shows Now on the current item", "draws every planner control disabled", "renders no English text in pt-BR"
- [ ] Gate passes: `npm run check`

**Tests**: component
**Gate**: build (end of phase)
**Commit**: `feat(web): compose the planner page`

---

### T36: Routes and app shell

**What**: `main.tsx` wraps `App` in `BrowserRouter`; `App` renders `TopBar` and `Routes` (`/` planner, `/status` status, `*` → `Navigate` to `/`). Move `e2e/status.spec.ts` tests to `/status`.
**Where**: `src/web/App.tsx`
**Depends on**: None in this phase (Phase 7 completes first)
**Reuses**: React Router exports confirmed in T1
**Requirement**: STATUS-01, STATUS-02, STATUS-03

**Done when**:

- [ ] `App.test.tsx` (`MemoryRouter`): "shows the planner at /", "shows the status page at /status under the top bar", "sends unknown paths to the planner"
- [ ] `e2e/status.spec.ts` "shows server and database connected" and "keeps the picked language after a reload" pass at `/status`
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: component, e2e
**Gate**: full
**Commit**: `feat(web): route / to the planner and /status to health`

---

### T37: Main view browser checks

**What**: `e2e/main.spec.ts` with the clock fixed to Sunday 2026-11-08 07:48 local: widths, colors, fonts, language, dark scheme, ellipsis.
**Where**: `e2e/main.spec.ts`
**Depends on**: T36
**Reuses**: `e2e/status.spec.ts` style
**Requirement**: DS-05, DS-07, MAIN-06, MAIN-24, MAIN-26, MAIN-27, MAIN-30

**Done when**:

- [ ] Tests: "has no horizontal scroll at 390 and 1280", "loads fonts from its own host" (every request same-origin; `document.fonts.check` true for the three families), "follows a dark color scheme" (body background `rgb(15, 19, 26)`), "draws the now-line in the accent color at the current time", "shows no error red and no undone wording" (no element's color, background or border computes to `--bad`; page text has none of missed/failed/overdue/late/skipped or perdido/falhou/atrasado/pulado in either language), "shows pt-BR texts and 24-hour times", "cuts long names with an ellipsis"
- [ ] Gate passes: `npm run check && npm run e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `test(e2e): check the main view in the browser`

---

## Checks

**C1** - A raw `button`/`input`/`select`/`textarea`/`a`/`label`/`h1`–`h6`/`p`/`span` outside `src/web/ui/` fails lint and is named (DS-01, AC 1)
Proof: `npx vitest run test/harness.test.ts -t "lint names every raw element outside src/web/ui"`

**C2** - The same elements inside `src/web/ui/` pass lint (DS-02, AC 2)
Proof: `npx vitest run test/harness.test.ts -t "lint allows raw elements inside src/web/ui"`

**C3** - `div`, `section`, `main`, `header`, `aside`, `nav` outside `src/web/ui/` pass lint (DS-03, AC 3)
Proof: `npx vitest run test/harness.test.ts -t "lint allows structural elements outside src/web/ui"`

**C4** - `tokens.css` holds every prototype light token at its prototype value (DS-04, AC 4)
Proof: `npx vitest run src/web/ui/styles/tokens.test.ts -t "light tokens match the prototype"`

**C5** - With a dark OS scheme the page background is `#0F131A` (DS-05, AC 5)
Proof: `npx playwright test e2e/main.spec.ts -g "follows a dark color scheme"`

**C6** - Every component in `src/web/ui/` has a stories file (DS-06, AC 6)
Proof: `npx vitest run test/designSystem.test.ts -t "every component has stories"`

**C7** - The three fonts load and the page requests nothing from another host (DS-07, AC 7)
Proof: `npx playwright test e2e/main.spec.ts -g "loads fonts from its own host"`

**C8** - Only `Icon` imports `lucide-react` (DS-08, AC 8)
Proof: `npx vitest run test/designSystem.test.ts -t "only Icon imports lucide-react"`

**C9** - Disabled and inert controls carry `disabled` and are skipped by Tab (DS-09, AC 9)
Proof: `npx vitest run src/web/ui/Button/Button.test.tsx -t "disabled and inert buttons are skipped by Tab"`

**C10** - At 1280×900, `/` draws the main view in `captures/main--desktop.png` minus the listed differences (MAIN-01, AC 1)
Proof: browser captures/main--desktop.running.png

**C11** - At 390×844, `/` draws the main view in `captures/main--phone.png` minus the listed differences (MAIN-02, AC 2)
Proof: browser captures/main--phone.running.png

**C12** - The header reads "This week" and "Nov 2 – Nov 8, 2026" on 2026-11-08 in English (MAIN-03, AC 3)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "shows This week and Nov 2 – Nov 8, 2026"`

**C13** - Seven columns Monday to Sunday, hour labels 6 AM to 10 PM (MAIN-04, AC 4)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "draws seven days from Monday and hours 6 AM to 10 PM"`

**C14** - Today's column is marked and its day number circled (MAIN-05, AC 5)
Proof: `npx vitest run src/web/planner/components/WeekGrid.test.tsx -t "marks today's column"`

**C15** - At 07:48 the now-line sits 79.2 px down today's column in the accent color (MAIN-06, AC 6)
Proof: `npx playwright test e2e/main.spec.ts -g "draws the now-line in the accent color at the current time"`

**C16** - An anchor block is slate with a lock, name and time range (MAIN-07, AC 7)
Proof: `npx vitest run src/web/planner/components/GridBlock.test.tsx -t "draws an anchor as a locked slate block"`

**C17** - A placement block takes its category's color and the model's top/height (MAIN-08, AC 8)
Proof: `npx vitest run src/web/planner/components/GridBlock.test.tsx -t "draws a placement in its category color"`

**C18** - A block under 40 px shows no time range (MAIN-09, AC 9)
Proof: `npx vitest run src/web/planner/components/GridBlock.test.tsx -t "hides the time range on a tiny block"`

**C19** - A done anchor is faded with its check pressed (MAIN-10, AC 10)
Proof: `npx vitest run src/web/planner/components/GridBlock.test.tsx -t "draws a done anchor faded with its check filled"`

**C20** - A done placement's name is struck through, faded, check pressed (MAIN-11, AC 11)
Proof: `npx vitest run src/web/planner/components/GridBlock.test.tsx -t "strikes through a done placement"`

**C21** - Today's items are listed in start-time order with checkbox, name, time and dot (MAIN-12, AC 12)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "lists today's items in time order"`

**C22** - The current item shows "Now" instead of its dot (MAIN-13, AC 13)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "shows Now on the current item"`

**C23** - An empty today shows "A free day" and the empty text (MAIN-14, AC 14)
Proof: `npx vitest run src/web/planner/components/TodayStrip.test.tsx -t "shows a free day when today is empty"`

**C24** - "N of M done" counts today's done items over all today's items (MAIN-15, AC 15)
Proof: `npx vitest run src/web/planner/model/progress.test.ts -t "counts today's done items"`

**C25** - Days you showed up counts days with at least one done item (MAIN-16, AC 16)
Proof: `npx vitest run src/web/planner/model/progress.test.ts -t "counts days you showed up"`

**C26** - The week's done/total sums anchor days and capped flexible done (MAIN-17, AC 17)
Proof: `npx vitest run src/web/planner/model/progress.test.ts -t "sums the week's done and total"`

**C27** - "N left" sums times per week minus placements, never below 0 per activity (MAIN-18, AC 18)
Proof: `npx vitest run src/web/planner/model/tray.test.ts -t "counts times left to place"`

**C28** - An open tray item shows "N× this week · <duration>", placed count, pips and Find a time (MAIN-19, AC 19)
Proof: `npx vitest run src/web/planner/components/Tray.test.tsx -t "shows meta, pips and Find a time"`

**C29** - A fully placed item shows its swatch, no Find a time, "All placed this week" or "All done this week" (MAIN-20, AC 20)
Proof: `npx vitest run src/web/planner/components/Tray.test.tsx -t "shows a fully placed activity with its swatch"`

**C30** - The tray ends with "+ New flexible activity" (MAIN-21, AC 21)
Proof: `npx vitest run src/web/planner/components/Tray.test.tsx -t "ends with New flexible activity"`

**C31** - The top bar shows the mark, "Routinely", "Example week", Add activity and the language switch (MAIN-22, AC 22)
Proof: `npx vitest run src/web/app/TopBar.test.tsx -t "shows the mark, Example week, Add activity and the language switch"`

**C32** - Every not-yet-working planner control is disabled (MAIN-23, AC 23)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "draws every planner control disabled"`

**C33** - No element is drawn in the error red and no undone wording appears, in either language (MAIN-24, AC 24)
Proof: `npx playwright test e2e/main.spec.ts -g "shows no error red and no undone wording"`

**C34** - In pt-BR the planner renders none of its English strings (MAIN-25, AC 25)
Proof: `npx vitest run src/web/planner/PlannerPage.test.tsx -t "renders no English text in pt-BR"`

**C35** - Picking Português shows pt-BR texts and 24-hour times (MAIN-26, AC 26)
Proof: `npx playwright test e2e/main.spec.ts -g "shows pt-BR texts and 24-hour times"`

**C36** - No horizontal page scroll at 390 and 1280; the grid scrolls inside its card (MAIN-27, AC 27)
Proof: `npx playwright test e2e/main.spec.ts -g "has no horizontal scroll at 390 and 1280"`

**C37** - No now-line before 06:00 or from 23:00 (MAIN-28, Edge 1)
Proof: `npx vitest run src/web/planner/model/grid.test.ts -t "draws no now-line outside 06:00–23:00"`

**C38** - Blocks are clipped to 06:00–23:00 (MAIN-29, Edge 2)
Proof: `npx vitest run src/web/planner/model/grid.test.ts -t "clips blocks to the grid hours"`

**C39** - Long names end in an ellipsis on one line (MAIN-30, Edge 3)
Proof: `npx playwright test e2e/main.spec.ts -g "cuts long names with an ellipsis"`

**C40** - An empty tray shows the empty text and "0 left" (MAIN-31, Edge 4)
Proof: `npx vitest run src/web/planner/components/Tray.test.tsx -t "shows the empty text and 0 left"`

**C41** - `/status` shows the top bar and "Server: connected", "Database: connected" (STATUS-01, AC 1)
Proof: `npx playwright test e2e/status.spec.ts -g "shows server and database connected"`

**C42** - An unknown path shows the planner (STATUS-02, AC 2)
Proof: `npx vitest run src/web/App.test.tsx -t "sends unknown paths to the planner"`

**C43** - The picked language survives a reload (STATUS-03, AC 3)
Proof: `npx playwright test e2e/status.spec.ts -g "keeps the picked language after a reload"`

---

## Handoff

**Settled mid-build:** user: "approved, but do not start just commit" - user asked to "start t1"; T1 done inline. user chose "Inline, T2 only now" for T2; T2 done inline. Ask the execution mode again before T3
**Dispatched:** none
**Walked:** not yet. Pictures are taken with the clock fixed to Sunday 2026-11-08 07:48 local, light color scheme, English, by opening `/` at 1280×900 and 390×844 and saving a full-page screenshot.
