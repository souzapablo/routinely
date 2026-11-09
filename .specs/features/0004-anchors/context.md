# Anchors Context

**Gathered:** 2026-11-08
**Spec:** `.specs/features/0004-anchors/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Anchors become real: stored in SQLite behind `/api/anchors`, drawn on the grid in place of the example week, added, edited and deleted from the prototype's drawer. Nothing about flexible activities, placements, check-off, drag or week navigation.

---

## Implementation Decisions

### What the planner shows

- Real anchors only. The example week's flexible activities, placements and done marks leave the planner; the Today strip, progress and tray are computed from the saved anchors alone. User chose "Real anchors only (Recommended)".

### Overlapping anchors

- Refused on a shared day, by the drawer and by the API (409). Touching is allowed. User chose "Block overlaps (Recommended)".

### Drawer

- Anchor fields only, no Anchor/Flexible type row until flexible activities exist. User chose "Anchor only (Recommended)".
- Otherwise as the prototype: right-side drawer over a scrim, Name, "Repeats on" toggles, Start and End time inputs on 15-minute steps, preview line, one calm message at a time, two-click Delete, "Saved {name}." toast.

### Past weeks

- One current version per anchor; editing or deleting changes every week, past ones included. User chose "Every week changes (Recommended)".

### Agent's Discretion

- Discussion pace: user chose "Guided (Recommended)".

### Declined / Undiscussed Gray Areas → Assumptions

Logged with defaults in the spec's Assumptions table (all `n`): form surface and opening, new-anchor defaults, name length, time inputs, message order, waiting for the server instead of saving optimistically, top bar status texts, load failure without retry, delete arming, toasts, two tabs (last write wins), server-created ids.

---

## Specific References

- Prototype drawer and its rules: https://claude.ai/artifact/T8Le5wkuVSNmu22m6qpHeD (`openDrawer`, the form `submit` handler, `F.del.onclick`, `.drawer`/`.dr-*`/`.day`/`.err`/`.del.armed` styles). The message wording in the spec comes from there.
- The prototype's status texts ("Saving…", "Saved", "Not saved. …") and dot colors (`.save[data-s]`).

---

## Deferred Ideas

- The anchor shake and "it stays put" toast when dragged: with drag and drop.
- The Anchor/Flexible type row in the drawer: with flexible activities.
