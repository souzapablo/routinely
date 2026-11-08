# Main Layout Context

**Gathered:** 2026-11-08
**Spec:** `.specs/features/0002-main-layout/spec.md` (not written yet)
**Status:** Spec approved; ready for design

---

## Feature Boundary

A reusable design system (tokens + components) and the main planner view built from it, matching the prototype artifact (`https://claude.ai/artifact/T8Le5wkuVSNmu22m6qpHeD`). User request: "let's create the basic layout for the app. I want to create a good system design so I can reuse components and never use basic itens, such as <button> and so on. So let's create the main view based on the artifact. Ask me anything, don't assume".

---

## Implementation Decisions

### Raw elements in app code

- Outside the design-system folder, app code may not use `button`, `input`, `select`, `textarea`, `a`, `label`, `h1`–`h6`, `p`, `span`; an ESLint rule enforces it so `npm run check` fails. Layout goes through primitives (`Stack`, `Inline`, `Card`), but plain `div`/`section`/`main` stay allowed for structure in feature components. User chose "Interactive + text (Recommended)".

### Styling

- CSS Modules, one `Component.module.css` next to each component; tokens are CSS variables in one global `tokens.css` ported from the prototype (light + dark). User chose "CSS Modules (Recommended)".

### Accessible primitives

- Built in-house: components wrap the native elements, no headless library. User chose "Build them ourselves (Recommended)".

### Data shown

- The view takes typed props; for now they come from a hard-coded example week in one fixture file, replaced by the API in a later feature. User chose "Typed example week (Recommended)".

### Parts of the prototype dropped

- The proposal intro (heading, paragraph, Anchor/Flexible legend), the "What changed from the first mockup" notes with Next steps, and the "This is an example week" banner are not in the main view. The main view is: top bar, week header, Today strip, week grid, "Fit in this week" tray. User chose "Drop all three (Recommended)".

### Behaviour in this feature

- Static layout only: everything is drawn for the current week; no planner control does anything in this feature. User chose "Static layout only" (option text: "Everything is drawn for the current week; no control does anything, so controls are not rendered."). Follow-up: the prototype's controls (week arrows, Today, Add activity, checkboxes, Find a time, + New flexible activity) are drawn as in the prototype but disabled (not focusable, no action) until the feature that makes them work; the language switch still works. User chose "Draw them, disabled (Recommended)".

### Routing

- React Router decides the page: `/` is the planner, `/status` the health page. User chose "React Router (Recommended)".

### Fonts

- Bricolage Grotesque, Instrument Sans and JetBrains Mono are self-hosted through `@fontsource` packages; the app never calls Google. User chose "Self-host via @fontsource (Recommended)".

### Who writes

- The agent writes everything; the user learns from the walkthrough of each component's React/TS choices. User answered "you write, i will lean".

### Top bar, language switch and status page

- The language switch moves into the top bar (right side). The health status page moves to its own route `/status`; `/` is the planner. User chose "Switch in top bar, status at /status (Recommended)".

### Window widths

- Held to two reference captures of the prototype: 1280×900 (grid and tray side by side) and 390×844 (stacked, grid scrolls sideways). User chose "1280 desktop + 390 phone (Recommended)".

### Icons

- `lucide-react`, used only through our `<Icon>` component. User chose "lucide-react behind our <Icon> (Recommended)". (AD-008)

### Catalog

- Storybook; stories typechecked and linted by `npm run check`, Storybook build not in check. User chose "Storybook" and "Typecheck + lint stories (Recommended)". (AD-007)

### Departures from the prototype

- Now-line in accent teal, not red. User chose "Accent teal (Recommended)". (AD-013)
- Top bar status slot shows "Example week" with the grey dot, as the prototype. User chose "\"Example week\" (Recommended)".
- The prototype's stray red dot and line at the left of "Days you showed up" (CSS class collision) is not reproduced. User chose "No, fix it (Recommended)". (AD-014)
- Tray header keeps "N left". User chose "Keep \"4 left\" (Recommended)". (AD-015)
- `/status` shows the same top bar with its status card below. User chose "Same top bar, status card below (Recommended)". (AD-012)

### Dark mode

- All the prototype's dark tokens are ported; the app follows the OS setting, no toggle; not held to a capture. User chose "Port dark tokens, follow system (Recommended)".

### Agent's Discretion

- Folder and names of the design system and its components (`src/web/ui/`), decided in Design.

### Declined / Undiscussed Gray Areas → Assumptions

- Smaller defaults (cursors, now-line refresh, unknown paths, blocks not clickable) are logged in spec.md Assumptions with `n`, for the user to correct at approval.

---

## Specific References

- Prototype artifact (binding design for the main view): `https://claude.ai/artifact/T8Le5wkuVSNmu22m6qpHeD`.

---

## Deferred Ideas

None yet.
