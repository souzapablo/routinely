# Sunday Week Start Specification

## Problem Statement

The planner's week runs Monday to Sunday. The owner's week starts on Sunday, so the grid, the week range, "Days you showed up" and the week a placement belongs to all start one day late.

## Goals

- [ ] The week shown is Sunday to Saturday, in both languages.

## Out of Scope

| Feature | Reason |
| --- | --- |
| A setting to choose the first day of the week | User: "maybe letter this could be a setting, but not right now" |
| Migrating stored days or week keys | Nothing is stored yet; the view shows the example fixture |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| First day of the week | Sunday, fixed | User request | y - user: "sunday should be the first day of the week, not monday" |
| Day numbering | `DayIndex` is the calendar weekday: Sunday 0 … Saturday 6, the same as `Date.getDay()` | A stored day then means the same weekday whichever day a later setting puts first | n |
| Week key | The week's Sunday as `YYYY-MM-DD` | The key names the first day of the week | n |
| Example week | Same weekdays as before (Work Mon–Fri, Gym Tue and Thu, Therapy Wed, Run Mon, Read Tue and Thu, Call parents Sat); done on every day before today except Thursday's Gym class | Only the order of days changes, not the example | n |

**Open questions:** none - the defaults above follow from the request.

---

## User Stories

### P1: My week starts on Sunday ⭐ MVP

**User Story**: As the owner, I want the planner's week to run Sunday to Saturday, so that it matches how I think about my week.

**Why P1**: Every week view, count and week key depends on it.

**Acceptance Criteria**:

1. WHEN the planner opens on any day THEN the system SHALL draw seven day columns from that week's Sunday through its Saturday.
2. WHEN today is a Sunday THEN the system SHALL treat it as the first day of a new week, and the week range SHALL run from that Sunday to the following Saturday.
3. WHEN the week range is shown THEN the system SHALL format it from the Sunday to the Saturday in the active language.
4. WHEN "Days you showed up" is drawn THEN the system SHALL list its seven days Sunday first.
5. WHEN a date's week key is computed THEN the system SHALL return the Sunday on or before that date as `YYYY-MM-DD`.
6. WHEN a date's day index is computed THEN the system SHALL return 0 for Sunday through 6 for Saturday.

**Independent Test**: Open the planner on Sunday 2026-11-08: the grid reads Sun 8 … Sat 14 and the range reads "Nov 8 – Nov 14, 2026".

### P1: The example week keeps its weekdays ⭐ MVP

**User Story**: As the owner, I want the example week to show the same items on the same weekdays, so that only the order of the days changes.

**Why P1**: The main view shows the example until real data exists.

**Acceptance Criteria**:

1. WHEN the example week is built THEN the system SHALL put each item on the same weekday as before: Work Monday–Friday, Gym class Tuesday and Thursday, Therapy session Wednesday, Run Monday, Read Tuesday and Thursday, Call parents Saturday.
2. WHEN the example week is built on a Sunday THEN the system SHALL mark nothing done.
3. WHEN the example week is built on a Saturday THEN the system SHALL mark every item from Sunday to Friday done except Thursday's Gym class, and SHALL leave Saturday's items undone.

**Independent Test**: Build the example week on Saturday 2026-11-14 and on Sunday 2026-11-08 and compare the done records.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SWS-01 | P1: Sunday start - grid columns | Execute | Pending |
| SWS-02 | P1: Sunday start - Sunday begins a week | Execute | Pending |
| SWS-03 | P1: Sunday start - week range | Execute | Pending |
| SWS-04 | P1: Sunday start - Days you showed up | Execute | Pending |
| SWS-05 | P1: Sunday start - week key | Execute | Pending |
| SWS-06 | P1: Sunday start - day index | Execute | Pending |
| SWS-07 | P1: Example week - same weekdays | Execute | Pending |
| SWS-08 | P1: Example week - nothing done on Sunday | Execute | Pending |
| SWS-09 | P1: Example week - done through Friday on Saturday | Execute | Pending |
