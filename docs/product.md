# Routinely: product brief

Routinely is a weekly planner built around **anchors**: the fixed parts of the week, like work or therapy. Flexible weekly goals fit into the gaps around them. It's a calm tool for keeping routines, not a productivity scoreboard.

Design reference: [interactive prototype](https://claude.ai/artifact/T8Le5wkuVSNmu22m6qpHeD).

## Problem

Keeping routines like running, reading or calling family breaks down because they have no fixed slot. Regular calendars treat everything as a fixed event. To-do apps ignore time entirely. Streak-based habit apps punish one bad day by resetting to zero. I need to see where my week is already taken and fit my goals into what's left, without the planning itself becoming a chore.

## User

**Just me** in v1. I'm building it for my own routine, which I also work on with a therapist. There are no other users, accounts or sharing.

## Core concepts

| Concept           | Meaning                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Anchor            | Repeats on the same days and times every week. Locked in place on the grid; it can't be dragged.     |
| Flexible activity | A weekly goal with a count and a duration, e.g. "Run 5 km, 2× a week, 45 min". It has no fixed slot. |
| Placement         | One occurrence of a flexible activity, dropped into a specific day and time of a specific week.      |
| Category          | Every flexible activity has one: Movement, Home, Errands, Rest or People. Each has a color.          |
| Done              | Any anchor occurrence or placement can be checked off.                                               |

## What v1 must do

1. **Set up anchors:** name, repeat days, start and end time. If an edit to an anchor makes it overlap placements, those placements go back to the list.
2. **Add flexible activities:** name, times per week, duration and category.
3. **Place them into the week:** drag from the "Fit in this week" list onto the grid, or use **Find a time** to take the next free gap (with 15 min of buffer when there's room). Placements snap to 15 min and can never overlap an anchor or another placement. Dragging one back to the list unschedules it.
4. **Check things off today:** a Today strip lists today's items in time order, each with a checkbox.
5. **See progress without streaks:** "Days you showed up" (days with at least one thing done) and "X of Y done this week". A missed day never erases the other days.
6. **Move between weeks:** last week, this week and next week. Anchors repeat on their own; placements belong to one week.
7. **Keep past weeks as history:** past placements stay where they were placed, done or not. An unfinished one looks just like a done one, minus the check mark. There is no "missed" state.

## Constraints

- **Platform:** a web app opened in the browser on laptop and phone. It isn't installed as a PWA in v1, so plain HTTP on the local network is fine.
- **Data:** a small backend and database running on **my own local server**. No cloud hosting and no third-party accounts.
- **Access:** reachable **only on my local network**, by me. Nothing is exposed to the internet: no port forwarding, tunnels or VPN. No login in v1, because the network boundary is the access control.
- **Languages:** English and Portuguese (pt-BR) from v1. Every UI string goes through i18n, and dates and times follow the active locale.
- **Grid defaults:** the week starts Monday; the visible day runs 06:00–23:00; all times snap to 15 min.

## Success

**I keep my routines.** The measure is the weekly completion rate of flexible goals: placements done ÷ times per week, summed across all flexible activities. I'll record it for the first 2 weeks as a baseline, then set a target for weeks 3–8.

## Out of scope for v1

- Mobile day view (the week grid scrolls sideways on phones)
- Reminders and push notifications
- Sunday check-in / weekly review prompt
- Energy tags and the insights screen
- One-off exceptions to anchors (e.g. skipping therapy just this week)
- Multiple users, accounts, login, or sharing with a therapist
- Access from outside my local network
- Installing as a PWA (it would need HTTPS on the local network)
- Backups and data export
- Calendar import or sync (Google, Outlook, iCal)
- Cloud hosting and native iOS/Android apps

## Design principles

- **Never make me feel bad for not doing something.** This rule overrides every other one. In practice:
  - No streaks, and nothing that resets or "breaks".
  - Nothing undone is called missed, failed, overdue, late or skipped, in any language.
  - No red, warning icons or alert styling on anything undone. Red is only for real errors (e.g. "not saved") and for blocked drops while dragging.
  - Progress counts only what got done ("2 of 5 done"), never what's left undone or a gap from a target.
  - No nudges, comparisons or messages about inactivity. An empty or quiet week is fine ("take the day off").
- **Calm over clever:** gentle wording, soft colors, no celebratory noise or pressure.
- **Anchors look locked:** they're dark slate with a hatch and a lock icon. Trying to drag one shakes it and explains how to edit it instead.
- **Color carries meaning:** it shows the category, never decoration.
- **Low effort on tired days:** Find a time makes a placement in one tap.
