# Flexible Activities Specification

## Problem Statement

The planner stores anchors but no flexible activities, so the "Fit in this week" tray is always empty and the owner can't record the weekly goals that the product exists for ("Run 5 km, 2× a week, 45 min"). Placing, Find a time and check-off all act on flexible activities, so they come next. This feature lets the owner add, edit and delete flexible activities from the drawer, stores them on the server and lists them in the tray.

## Goals

- [ ] The owner can enter their real weekly goals from the planner, in English or pt-BR, on laptop and phone.
- [ ] Flexible activities survive a page reload and a server restart.
- [ ] The tray lists every stored activity with its times per week, duration and category color, and "This week" counts their times per week.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Placements: dragging onto the grid, Find a time, unscheduling | Next feature; "Find a time" is drawn disabled and nothing in the tray can be dragged (user chose "Show it, disabled (Recommended)") |
| Checking off placements | Check-off feature; nothing can be placed yet |
| Changing a saved item between anchor and flexible | User chose "Type is fixed once saved (Recommended)"; delete and add again instead |
| Week navigation | Its own feature; the planner still shows the current week |
| Per-week versions of an activity | One current version, as with anchors; there are no placements to keep history for |
| Reordering the tray by hand | The tray follows a fixed order (see Assumptions) |
| Login, rate limits | Local network only, one user (docs/product.md) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Drawer shape | One drawer with a Type row (Anchor / Flexible) that switches the fields below it | Prototype behaviour | y - user chose "One drawer, Type row (Recommended)" |
| Type when editing | The Type row shows only when adding; editing keeps the saved type | Anchors and activities stay separate records with stable ids | y - user chose "Type is fixed once saved (Recommended)" |
| Find a time and drag | "Find a time" shows on open tray items, disabled; tray items can't be dragged | Same treatment as the round done checks (AD-011) | y - user chose "Show it, disabled (Recommended)" |
| Name sort after a save | The browser orders anchors and activities the way the server's `GET` does, ignoring letter case | Names differing only in case no longer swap after a reload | y - user chose "Case-insensitive sort fix" |
| Language change while the drawer is open | Not a reachable case: the open drawer makes the top bar inert, so the language switch can't be used; ANC-46 is withdrawn | The modal drawer is meant to block the page behind it (AD-022) | y - user chose "Drop the language-in-drawer case" |
| How the drawer opens to add | The top bar's + button opens it with Anchor selected; the tray's "+ New flexible activity" opens it with Flexible selected | Prototype behaviour | n |
| How the drawer opens to edit | Clicking a tray item, or pressing Enter or Space on a focused one, opens it for that activity | Prototype behaviour (the tray item carries `data-open`) | n |
| Drawer titles and Save label | Adding: "Add activity" with the Save button "Save activity"; editing an anchor: "Edit anchor"; editing a flexible activity: "Edit activity"; the Save button reads "Save activity" in all three | Prototype wording; one drawer adds both types | n |
| Type row | Two radio options: "Anchor" with "Same days and time every week. Can't be dragged." and "Flexible" with "A goal for the week. Drag it wherever it fits." | Prototype wording | n |
| Switching type while adding | Each type keeps the values entered for it; the error line clears | Switching to look and back loses nothing | n |
| New activity defaults | Empty name, 1 time per week, 30 min, Movement | Prototype defaults | n |
| Times per week | A stepper from 1 to 14; − is disabled at 1, + at 14 | Prototype bounds (two a day is a lot for a weekly goal) | n |
| Duration | A select with 15 min, 30 min, 45 min, 1 h, 1 h 30 min, 2 h and 3 h | Prototype options; all are 15-minute multiples | n |
| Category | Five options labelled Movement, Home, Errands, Rest and People, each in its category color, as a radio group named "Kind" | Prototype; color carries the category (docs/product.md) | n |
| Name rules | The same as anchors: trimmed, 1–60 characters, same messages | One name rule for everything on the grid | n |
| Duplicate names | Allowed | Nothing breaks; the owner may want two of a kind | n |
| Tray order | By name ignoring letter case, then by id | Predictable; matches how anchors break ties | n |
| Saving | Waits for the server, as anchors do: Save disabled while it runs, no optimistic update | Same rule as AD-023's save states | n |
| Top bar status | One status for the whole week: "Loading your week…" until anchors and activities have both loaded; "Couldn't load your week" if either fails; "Saving…", "Saved" and "Not saved" for activity saves and deletes as for anchors | The owner sees one week, not two data sets | n |
| Two tabs | Last write wins | One user; the server is the source of truth | n |
| Ids | The server creates each activity's id | One place that writes ids | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Flexible activities are stored on the server ⭐ MVP

**User Story**: As the owner, I want my flexible activities kept in the database on my server, so that they are there on every device and after a restart.

**Why P1**: Every other story reads or writes this data.

**Acceptance Criteria**:

1. WHEN the API receives `GET /api/activities` THEN the system SHALL answer 200 with every stored activity as `{ id, name, category, timesPerWeek, duration }`, ordered by name ignoring letter case, then by id.
2. WHEN the API receives `POST /api/activities` with a valid activity THEN the system SHALL store it with a new id and answer 201 with the stored activity.
3. WHEN the API receives `PUT /api/activities/:id` with a valid activity for a stored id THEN the system SHALL replace that activity's name, category, times per week and duration and answer 200 with the stored activity.
4. WHEN the API receives `DELETE /api/activities/:id` for a stored id THEN the system SHALL remove that activity and answer 204.
5. IF `PUT` or `DELETE` names an id that is not stored THEN the system SHALL answer 404 and change nothing.
6. IF a `POST` or `PUT` body breaks a rule in FLX-38 to FLX-42 THEN the system SHALL answer 400 with the broken rule's code and change nothing.
7. WHEN the server restarts THEN the system SHALL return the same activities from `GET /api/activities` as before the restart.
8. The system SHALL store the category as one of `movement`, `home`, `errands`, `rest`, `people` and the duration in minutes.

**Independent Test**: With the server running, `POST` Run 5 km, movement, 2× a week, 45 min; restart the server; `GET` returns it; a `POST` with `timesPerWeek: 0` answers 400.

---

### P1: The tray lists my flexible activities ⭐ MVP

**User Story**: As the owner, I want the tray to show my saved activities, so that I see what I want to fit into this week.

**Why P1**: The tray is where flexible activities live until they are placed.

**Acceptance Criteria**:

1. WHEN the planner opens THEN the system SHALL load the activities from `GET /api/activities` and list each one in the "Fit in this week" tray, in the order the server sent.
2. Each tray item SHALL show the name, a grip, "{times}× this week · {duration}" with the duration in the active language, and one open pip per time per week.
3. Each tray item SHALL show its category color.
4. The tray's count SHALL read "{n} left", where n is the sum of every activity's times per week.
5. The "This week" meter SHALL count every activity's times per week in its total, next to the anchors' occurrences.
6. Each open tray item SHALL show a disabled "Find a time" button, and no tray item SHALL start a drag.
7. WHILE the anchors or the activities load the top bar status SHALL read "Loading your week…" with the accent dot.
8. WHEN both the anchors and the activities have loaded THEN the top bar status SHALL read "Saved" with the green dot.
9. IF loading the activities fails THEN the top bar status SHALL read "Couldn't load your week" with the red dot, and the tray SHALL list no activities.
10. WHEN no activities are stored THEN the tray SHALL show "Nothing here yet. Add something you'd like to fit into your week." and "0 left", with no error styling.

**Independent Test**: Store Run 5 km (movement, 2×, 45 min) and Read (rest, 3×, 30 min) through the API, open `/`: the tray lists Read then Run 5 km, reads "5 left", and "This week" reads "0 of {anchor occurrences + 5} done".

---

### P1: Add and edit a flexible activity ⭐ MVP

**User Story**: As the owner, I want to add a flexible activity and change one from the planner, so that I can set my weekly goals without touching the API.

**Why P1**: The owner has no other way to enter their goals.

**Acceptance Criteria**:

1. WHEN the owner activates the tray's "+ New flexible activity" button THEN the system SHALL open the drawer titled "Add activity" with Flexible selected, an empty name, 1 time per week, 30 min and Movement, and focus the name field.
2. WHEN the owner activates the top bar's + button THEN the system SHALL open the drawer titled "Add activity" with Anchor selected and the anchor defaults of ANC-16, and focus the name field.
3. WHILE the drawer adds an item it SHALL show the Type row with Anchor and Flexible; WHILE it edits a stored anchor or activity it SHALL not.
4. WHEN the owner selects Flexible in the Type row THEN the drawer SHALL show Name, Times per week, Each time takes and Kind, and hide Repeats on, Start and End.
5. WHEN the owner selects Anchor in the Type row THEN the drawer SHALL show Name, Repeats on, Start and End, and hide Times per week, Each time takes and Kind.
6. WHEN the owner switches the Type row and switches back THEN the drawer SHALL show the values entered before for that type, and the error line SHALL be empty.
7. WHEN the owner activates + on Times per week THEN the value SHALL go up by 1, and WHEN the owner activates − it SHALL go down by 1.
8. WHILE Times per week is 1 the − button SHALL be disabled; WHILE it is 14 the + button SHALL be disabled.
9. The Each time takes select SHALL offer 15 min, 30 min, 45 min, 1 h, 1 h 30 min, 2 h and 3 h, written in the active language.
10. The Kind group SHALL offer Movement, Home, Errands, Rest and People as one-choice options, each drawn in its category color.
11. WHILE Flexible is selected the drawer SHALL show a preview line: the name (or "Untitled"), "{times}× a week", "{duration} each" and the category name.
12. WHEN the owner clicks a tray item, or presses Enter or Space on a focused tray item THEN the system SHALL open the drawer titled "Edit activity" filled with that activity's name, times per week, duration and category.
13. WHEN the owner clicks an anchor block THEN the system SHALL open the drawer titled "Edit anchor", as ANC-17 describes.
14. WHEN the owner saves a valid flexible activity THEN the system SHALL send it to the server, close the drawer, list the stored activity in the tray, and show the toast "Saved {name}.".
15. WHILE a save runs the system SHALL disable the Save button and the top bar status SHALL read "Saving…" with the accent dot.
16. WHEN a save succeeds THEN the top bar status SHALL read "Saved" with the green dot.
17. IF a save fails for any reason other than a broken rule THEN the system SHALL keep the drawer open with every value the owner entered, show "Not saved. Your changes are still here, so you can try again." in the drawer's error line, and the top bar status SHALL read "Not saved" with the red dot.
18. WHEN the drawer closes THEN the system SHALL return focus to the control that opened it.
19. The Save button SHALL read "Save activity" whether the drawer adds an item, edits an anchor or edits an activity.

**Independent Test**: Open `/`, press "+ New flexible activity", type "Run 5 km", press + once, pick 45 min and Movement, save: the tray lists "Run 5 km · 2× this week · 45 min" and the toast reads "Saved Run 5 km."; click it, pick 1 h, save: the item reads "2× this week · 1 h".

---

### P1: The drawer and the API refuse a broken activity ⭐ MVP

**User Story**: As the owner, I want a calm message when an activity can't be saved as entered, so that I know what to change.

**Why P1**: Without these rules, broken activities would reach the tray and later the grid.

**Acceptance Criteria**:

1. IF the trimmed name is empty THEN the drawer SHALL show "Give it a name so you can recognize it on the calendar." and focus the name field.
2. IF the trimmed name is longer than 60 characters THEN the system SHALL refuse it; the name field SHALL accept at most 60 characters.
3. IF times per week is not a whole number from 1 to 14 THEN the system SHALL refuse it.
4. IF the duration is not one of 15, 30, 45, 60, 90, 120 or 180 minutes THEN the system SHALL refuse it.
5. IF the category is not one of `movement`, `home`, `errands`, `rest`, `people` THEN the system SHALL refuse it.
6. WHEN the drawer shows a rule message THEN the system SHALL keep the drawer open, send nothing to the server, and leave the top bar status unchanged.
7. The rules SHALL be checked in the order name, times per week, duration, category, and only the first broken rule SHALL be reported.

**Independent Test**: Press "+ New flexible activity", leave the name empty, save: the drawer reads "Give it a name so you can recognize it on the calendar." and nothing is sent; `POST /api/activities` with `duration: 20` answers 400 with the duration rule's code.

---

### P2: Delete a flexible activity

**User Story**: As the owner, I want to delete an activity I no longer want, so that the tray shows only my real goals.

**Why P2**: Mistakes can be edited away; deleting is needed but not to start using the planner.

**Acceptance Criteria**:

1. WHILE the drawer edits a stored activity it SHALL show a Delete button.
2. WHEN the owner activates Delete once THEN the button SHALL read "Click again to delete" with the red fill, and nothing SHALL be deleted.
3. WHEN the owner activates the armed Delete button THEN the system SHALL delete the activity on the server, close the drawer, remove it from the tray, and show the toast "Deleted {name}.".
4. WHEN the drawer opens THEN its Delete button SHALL be disarmed.
5. IF a delete fails THEN the system SHALL keep the drawer open, show "Not deleted. Try again in a moment." in the drawer's error line, and the top bar status SHALL read "Not saved" with the red dot.

**Independent Test**: Open Run 5 km, click Delete twice: it leaves the tray and the toast reads "Deleted Run 5 km."; reload: still gone.

---

### P2: Names keep the server's order after a save

**User Story**: As the owner, I want the tray and the grid to keep the same order after a save as after a reload, so that items don't jump around.

**Why P2**: A visible wobble, not a data problem.

**Acceptance Criteria**:

1. WHEN an anchor is saved THEN the browser SHALL order the anchors as `GET /api/anchors` orders them: by start time, then by name ignoring letter case, then by id.
2. WHEN an activity is saved THEN the browser SHALL order the activities as `GET /api/activities` orders them: by name ignoring letter case, then by id.

**Independent Test**: Store activity "read", then add "Run" in the drawer: the tray lists "read" before "Run" both right after the save and after a reload.

---

## Edge Cases

- IF a save or delete of an activity answers 404 (it was deleted elsewhere) THEN the system SHALL close the drawer, reload the activities, and show the toast "That activity was already deleted."
- WHEN the page is 390 px wide THEN the drawer with Flexible selected SHALL fill the width, and its stepper, select, Kind options and footer buttons SHALL stay visible without sideways scrolling.
- WHEN an activity's name is 60 characters THEN its tray item SHALL truncate the name on one line with an ellipsis.

---

## Requirement Traceability

| Requirement ID | Story | Tasks | Status |
| --- | --- | --- | --- |
| FLX-01 | P1: Stored - list | - | Pending |
| FLX-02 | P1: Stored - create | - | Pending |
| FLX-03 | P1: Stored - replace | - | Pending |
| FLX-04 | P1: Stored - delete | - | Pending |
| FLX-05 | P1: Stored - unknown id 404 | - | Pending |
| FLX-06 | P1: Stored - broken rule 400 | - | Pending |
| FLX-07 | P1: Stored - survives restart | - | Pending |
| FLX-08 | P1: Stored - field format | - | Pending |
| FLX-09 | P1: Tray - lists activities | - | Pending |
| FLX-10 | P1: Tray - item content | - | Pending |
| FLX-11 | P1: Tray - category color | - | Pending |
| FLX-12 | P1: Tray - left count | - | Pending |
| FLX-13 | P1: Tray - week meter total | - | Pending |
| FLX-14 | P1: Tray - Find a time disabled, no drag | - | Pending |
| FLX-15 | P1: Tray - loading status | - | Pending |
| FLX-16 | P1: Tray - loaded status | - | Pending |
| FLX-17 | P1: Tray - load failure | - | Pending |
| FLX-18 | P1: Tray - empty | - | Pending |
| FLX-19 | P1: Drawer - open from tray | - | Pending |
| FLX-20 | P1: Drawer - open from + | - | Pending |
| FLX-21 | P1: Drawer - Type row only when adding | - | Pending |
| FLX-22 | P1: Drawer - Flexible fields | - | Pending |
| FLX-23 | P1: Drawer - Anchor fields | - | Pending |
| FLX-24 | P1: Drawer - values kept across type switch | - | Pending |
| FLX-25 | P1: Drawer - stepper steps | - | Pending |
| FLX-26 | P1: Drawer - stepper bounds | - | Pending |
| FLX-27 | P1: Drawer - duration options | - | Pending |
| FLX-28 | P1: Drawer - Kind options | - | Pending |
| FLX-29 | P1: Drawer - preview | - | Pending |
| FLX-30 | P1: Drawer - open to edit activity | - | Pending |
| FLX-31 | P1: Drawer - open to edit anchor | - | Pending |
| FLX-32 | P1: Drawer - save | - | Pending |
| FLX-33 | P1: Drawer - saving state | - | Pending |
| FLX-34 | P1: Drawer - saved status | - | Pending |
| FLX-35 | P1: Drawer - save failure | - | Pending |
| FLX-36 | P1: Drawer - focus return | - | Pending |
| FLX-37 | P1: Drawer - Save label | - | Pending |
| FLX-38 | P1: Rules - empty name | - | Pending |
| FLX-39 | P1: Rules - name length | - | Pending |
| FLX-40 | P1: Rules - times per week | - | Pending |
| FLX-41 | P1: Rules - duration | - | Pending |
| FLX-42 | P1: Rules - category | - | Pending |
| FLX-43 | P1: Rules - nothing sent | - | Pending |
| FLX-44 | P1: Rules - check order | - | Pending |
| FLX-45 | P2: Delete - button shown when editing | - | Pending |
| FLX-46 | P2: Delete - first click arms | - | Pending |
| FLX-47 | P2: Delete - second click deletes | - | Pending |
| FLX-48 | P2: Delete - disarmed on open | - | Pending |
| FLX-49 | P2: Delete - failure | - | Pending |
| FLX-50 | P2: Order - anchors after save | T1, T7, T11, T31 | In progress |
| FLX-51 | P2: Order - activities after save | T1, T19, T31 | In progress |
| FLX-52 | Edge - deleted elsewhere | - | Pending |
| FLX-53 | Edge - phone width drawer | - | Pending |
| FLX-54 | Edge - long name truncates | - | Pending |

IDs follow the criteria in story order: storage FLX-01 to FLX-08, tray FLX-09 to FLX-18, drawer FLX-19 to FLX-37, rules FLX-38 to FLX-44, delete FLX-45 to FLX-49, order FLX-50 and FLX-51, edge cases FLX-52 to FLX-54. FLX-38 to FLX-42 are the rules both the drawer and the API enforce; their error codes are fixed in Design.

**Coverage:** 54 total, 0 mapped to tasks, 54 unmapped (mapped in Tasks).

---

## Success Criteria

- [ ] The owner enters their real weekly goals in the drawer and they are still in the tray after reloading on the phone.
- [ ] No sequence of drawer actions or API calls stores an activity with a times per week, duration or category outside the allowed values.
- [ ] Nothing in the flexible-activity flow shows red except a failed load, save or delete, and the armed Delete button.
