# Flexible Activities Context

**Gathered:** 2026-11-09
**Spec:** `.specs/features/0005-flexible-activities/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Flexible activities become real: stored in SQLite behind `/api/activities`, listed in the "Fit in this week" tray, added, edited and deleted from the drawer. Nothing about placements, Find a time, drag, check-off or week navigation.

---

## Implementation Decisions

### Drawer

- One drawer with the prototype's Type row (Anchor / Flexible). The top bar's + opens it on Anchor, the tray's "+ New flexible activity" on Flexible. User chose "One drawer, Type row (Recommended)".
- The Type row shows only when adding. A saved item keeps its type; to change it, delete and add again. User chose "Type is fixed once saved (Recommended)".

### Tray

- "Find a time" is drawn disabled on open items and nothing drags, the same treatment as the round done checks (AD-011). User chose "Show it, disabled (Recommended)".

### Leftovers from anchors

- The browser sorts names ignoring letter case after a save, as the server does; activities follow the same rule. User chose "Case-insensitive sort fix".
- The language switch can't be reached while the modal drawer is open, so ANC-46 ("language change in drawer") is withdrawn and the case is not specified for activities. User chose "Drop the language-in-drawer case".

### Agent's Discretion

None asked.

### Declined / Undiscussed Gray Areas → Assumptions

Logged with defaults in the spec's Assumptions table (all `n`): how the drawer opens to add and to edit, titles and the Save label, Type row wording, values kept across a type switch, new-activity defaults, the 1–14 stepper, the duration options, the Kind options, name rules, duplicate names, tray order, waiting for the server, the shared top bar status, two tabs, server-created ids.

---

## Specific References

- Prototype drawer and tray: https://claude.ai/artifact/T8Le5wkuVSNmu22m6qpHeD (`openDrawer`, `syncKind`, `updPv`, `#t-minus`/`#t-plus`, `#f-dur`, `#f-cats`, `renderTray`; `.kinds`/`.kind`, `.stepper`, `.cats`/`.cat`, `.titem` styles). The wording in the spec comes from there.

---

## Deferred Ideas

- Switching a saved item between anchor and flexible.
- Dragging tray items and Find a time: with placements.
