# Anchors Specification

## Problem Statement

The planner draws a hard-coded example week and saves nothing. Anchors are the fixed shape of the week that every later feature (placing flexible activities, Find a time, check-off) fits around, so they are the first real data. This feature lets the owner add, edit and delete anchors, keeps them in the server's database, and draws them on the grid in place of the example.

## Goals

- [ ] The owner can set up their real week of anchors from the planner, in English or pt-BR, on laptop and phone.
- [ ] Anchors survive a page reload and a server restart.
- [ ] Two anchors never share time on the same day, whether saved from the drawer or sent straight to the API.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Flexible activities, placements, done marks | Later features; the planner shows real anchors only (user chose "Real anchors only (Recommended)") |
| The drawer's Anchor/Flexible type row | Arrives with flexible activities (user chose "Anchor only (Recommended)") |
| Sending overlapping placements back to the list when an anchor changes | Placements do not exist yet |
| Shaking an anchor and explaining when it is dragged | Comes with drag and drop |
| Checking off anchor occurrences | Check-off feature; the round checks stay disabled (AD-011) |
| Week navigation | Its own feature; the planner still shows the current week |
| Versioning anchors so past weeks keep an old version | User chose "Every week changes (Recommended)" |
| One-off exceptions to an anchor | Out of scope for v1 (docs/product.md) |
| Anchors that cross midnight | The end must be after the start on the same day, as in the prototype |
| Undo after delete | The two-click Delete is the guard, as in the prototype |
| Login, rate limits | Local network only, one user (docs/product.md) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Example week | Removed from the planner; the grid, Today strip, progress and tray are computed from the saved anchors and no flexible activities, placements or done marks | Nothing fake mixed with real data | y - user chose "Real anchors only (Recommended)" |
| Overlapping anchors | Refused, on the client and on the server; touching (one ends 09:00, the next starts 09:00) is allowed | The grid never has to draw two locked blocks over each other | y - user chose "Block overlaps (Recommended)" |
| Drawer content | Anchor fields only: Name, Repeats on, Start, End, preview line, error line; title "Add anchor" / "Edit anchor"; Save button "Save anchor" | Flexible activities do not exist yet | y - user chose "Anchor only (Recommended)" |
| Editing and deleting across weeks | One current version per anchor; every week, past ones included, draws it | Nothing else is stored yet that history would protect | y - user chose "Every week changes (Recommended)" |
| Form surface | The prototype's right-side drawer: full height, `min(440px, 100%)` wide, over a dimmed scrim, modal | Matches the prototype; full width on phones | n |
| How the drawer opens | The top bar's + button ("Add activity", now enabled) opens it empty; clicking an anchor block on the grid, or pressing Enter or Space on it, opens it for that anchor | Prototype behaviour; the label stays "Add activity" because the same button adds flexible activities later | n |
| New anchor defaults | Empty name, Monday–Friday, 09:00–18:00 | Prototype defaults | n |
| Day toggles | Seven toggles, Sunday first (AD-020), short weekday names in the active language | Matches the grid's day order | n |
| Name | Trimmed; 1–60 characters | Prototype `maxlength="60"`; a name has to be recognizable on the grid | n |
| Time inputs | Native time inputs with 15-minute steps, wrapped in a design-system component; times must be multiples of 15 minutes from 00:00 to 23:45 | Native pickers work on phones; 15-minute snapping is a product rule | n |
| Check order and messages | One message at a time, checked in this order: name, days, both times set, 15-minute steps, end after start, overlap | The prototype shows one calm message at a time | n |
| Saving | Save waits for the server; the Save button is disabled while the request runs; no optimistic update | One user on a local network; the grid only ever shows what is stored | n |
| Top bar status | "Loading your week…" (accent dot) while loading; "Saving…" (accent dot) while a save or delete runs; "Saved" (green dot) after a successful load, save or delete; "Not saved" (red dot) after a failed save or delete; "Couldn't load your week" (red dot) after a failed load | The prototype's save states, adapted to a server; red only for real errors | n |
| Load failure | No automatic retry; the planner draws with no anchors and the + button stays enabled | Reloading the page is the retry; a later save that succeeds sets "Saved" | n |
| Delete | Delete button only when editing; the first click arms it ("Click again to delete", red fill), the second deletes; reopening the drawer disarms it | Prototype behaviour; red is the destructive-action color, not an undone item | n |
| Toasts | "Saved {name}." after a save, "Deleted {name}." after a delete, shown for about 3.4 s | Prototype behaviour | n |
| Two tabs | Last write wins; an overlap is checked by the server against what is stored at save time | One user; the server is the source of truth | n |
| Ids | The server creates each anchor's id | One place that writes ids | n |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Anchors are stored on the server ⭐ MVP

**User Story**: As the owner, I want my anchors kept in the database on my server, so that they are there on every device and after a restart.

**Why P1**: Every other story reads or writes this data.

**Acceptance Criteria**:

1. WHEN the API receives `GET /api/anchors` THEN the system SHALL answer 200 with every stored anchor as `{ id, name, days, start, end }`, ordered by start time, then by name.
2. WHEN the API receives `POST /api/anchors` with a valid anchor THEN the system SHALL store it with a new id and answer 201 with the stored anchor.
3. WHEN the API receives `PUT /api/anchors/:id` with a valid anchor for a stored id THEN the system SHALL replace that anchor's name, days, start and end and answer 200 with the stored anchor.
4. WHEN the API receives `DELETE /api/anchors/:id` for a stored id THEN the system SHALL remove that anchor and answer 204.
5. IF `PUT` or `DELETE` names an id that is not stored THEN the system SHALL answer 404 and change nothing.
6. IF a `POST` or `PUT` body breaks a rule in ANC-26 to ANC-31 THEN the system SHALL answer 400 with the broken rule's code and change nothing.
7. IF a `POST` or `PUT` anchor shares time with another stored anchor on a shared day THEN the system SHALL answer 409 with the other anchor's name and the first shared day, and change nothing.
8. WHEN the server restarts THEN the system SHALL return the same anchors from `GET /api/anchors` as before the restart.
9. The system SHALL store days as calendar weekdays (Sunday 0 … Saturday 6), each day at most once, in ascending order.

**Independent Test**: With the server running, `POST` Work Mon–Fri 09:00–18:00, restart the server, `GET` returns it; a second `POST` of Gym Mon 17:00–18:30 answers 409 naming Work.

---

### P1: The planner draws my real anchors ⭐ MVP

**User Story**: As the owner, I want the planner to show my saved anchors instead of the example week, so that I see where my real week is taken.

**Why P1**: This is what makes the planner mine.

**Acceptance Criteria**:

1. WHEN the planner opens THEN the system SHALL load the anchors from `GET /api/anchors` and draw each one on each of its days as a locked anchor block, as the example's anchors were drawn.
2. The planner SHALL draw no flexible activities, placements or done marks, and the Today strip, "Days you showed up", "This week" and the tray SHALL be computed from the loaded anchors alone.
3. WHILE the anchors load the top bar status SHALL read "Loading your week…" with the accent dot.
4. WHEN the anchors load THEN the top bar status SHALL read "Saved" with the green dot.
5. IF loading the anchors fails THEN the top bar status SHALL read "Couldn't load your week" with the red dot, and the planner SHALL draw no anchors.
6. WHEN no anchors are stored THEN the planner SHALL draw the empty grid, the Today strip's empty message and the tray's empty message, with no error styling.

**Independent Test**: Store two anchors through the API, open `/`: both are on the grid on their days; today's ones are in the Today strip; the status reads "Saved".

---

### P1: Add and edit an anchor ⭐ MVP

**User Story**: As the owner, I want to add an anchor and change one from the planner, so that I can set up my week without touching the API.

**Why P1**: The owner has no other way to enter their week.

**Acceptance Criteria**:

1. WHEN the owner activates the top bar's + button THEN the system SHALL open the drawer titled "Add anchor" with an empty name, Monday to Friday selected, start 09:00 and end 18:00, and focus the name field.
2. WHEN the owner clicks an anchor block, or presses Enter or Space on a focused anchor block THEN the system SHALL open the drawer titled "Edit anchor" filled with that anchor's name, days, start and end.
3. The drawer SHALL show a preview line: the name (or "Untitled"), the days as "every day", "Mon–Fri", "weekends" or a list of short weekday names, the time range in the active language, and "every week".
4. WHEN the owner saves a valid anchor THEN the system SHALL send it to the server, close the drawer, draw the stored anchor on the grid, and show the toast "Saved {name}.".
5. WHILE a save runs the system SHALL disable the Save button and the top bar status SHALL read "Saving…" with the accent dot.
6. WHEN a save succeeds THEN the top bar status SHALL read "Saved" with the green dot.
7. IF a save fails for any reason other than a broken rule THEN the system SHALL keep the drawer open with every value the owner entered, show "Not saved. Your changes are still here, so you can try again." in the drawer's error line, and the top bar status SHALL read "Not saved" with the red dot.
8. WHEN the owner activates Cancel, the close button, the scrim, or presses Escape THEN the system SHALL close the drawer without saving.
9. WHEN the drawer closes THEN the system SHALL return focus to the control that opened it.
10. WHILE the drawer is open the system SHALL keep keyboard focus inside it.

**Independent Test**: Open `/`, press +, type "Work", keep Mon–Fri 09:00–18:00, save: five Work blocks appear and the toast reads "Saved Work."; click one, change the end to 17:00, save: all five end at 17:00.

---

### P1: The drawer refuses an anchor that breaks a rule ⭐ MVP

**User Story**: As the owner, I want a calm message when an anchor can't be saved as entered, so that I know what to change.

**Why P1**: Without these rules, broken or overlapping anchors would reach the grid.

**Acceptance Criteria**:

1. IF the trimmed name is empty THEN the drawer SHALL show "Give it a name so you can recognize it on the calendar." and focus the name field.
2. IF the trimmed name is longer than 60 characters THEN the system SHALL refuse it; the name field SHALL accept at most 60 characters.
3. IF no day is selected THEN the drawer SHALL show "Pick at least one day it repeats on."
4. IF the start or end time is empty THEN the drawer SHALL show "Set a start and end time."
5. IF the start or end time is not a multiple of 15 minutes THEN the drawer SHALL show "Times go in 15-minute steps, like 9:00 or 9:15." with the example times in the active language's format.
6. IF the end time is not after the start time THEN the drawer SHALL show "The end time needs to be after the start time."
7. IF the anchor shares time with another anchor on a shared day THEN the drawer SHALL show "This overlaps {other} on {weekday}. Anchors can't share time." naming the other anchor and the first shared day in week order.
8. WHEN two anchors only touch (one ends at the minute the other starts) THEN the system SHALL accept both.
9. WHEN the drawer shows a rule message THEN the system SHALL keep the drawer open, send nothing to the server, and leave the top bar status unchanged.
10. WHEN an anchor is edited THEN the system SHALL not count the anchor's own stored version as an overlap.
11. The drawer's error line SHALL be announced to screen readers when its message changes.

**Independent Test**: With Work Mon–Fri 09:00–18:00 stored, add "Gym" on Monday 17:00–18:30: the drawer reads "This overlaps Work on Mon. Anchors can't share time."; change it to 18:00–19:00: it saves.

---

### P2: Delete an anchor

**User Story**: As the owner, I want to delete an anchor I no longer have, so that my week shows only what is real.

**Why P2**: Mistakes can be edited away; deleting is needed but not to start using the planner.

**Acceptance Criteria**:

1. WHILE the drawer edits a stored anchor it SHALL show a Delete button; WHILE it adds a new anchor it SHALL not.
2. WHEN the owner activates Delete once THEN the button SHALL read "Click again to delete" with the red fill, and nothing SHALL be deleted.
3. WHEN the owner activates the armed Delete button THEN the system SHALL delete the anchor on the server, close the drawer, remove the anchor from every day of the grid, and show the toast "Deleted {name}.".
4. WHEN the drawer opens THEN its Delete button SHALL be disarmed.
5. IF a delete fails THEN the system SHALL keep the drawer open, show "Not deleted. Try again in a moment." in the drawer's error line, and the top bar status SHALL read "Not saved" with the red dot.

**Independent Test**: Open Work, click Delete twice: the five Work blocks disappear and the toast reads "Deleted Work."; reload: still gone.

---

## Edge Cases

- IF a save or delete answers 404 (the anchor was deleted elsewhere) THEN the system SHALL close the drawer, reload the anchors, and show the toast "That anchor was already deleted."
- IF the server answers 409 to a save the drawer allowed (another tab stored an overlapping anchor) THEN the drawer SHALL show the overlap message from ANC-32 with the name and day the server sent.
- WHEN an anchor starts before 06:00 or ends after 23:00 THEN the grid SHALL clip its block to the grid's hours, as it does today.
- WHEN an anchor ends at 23:45 THEN the system SHALL accept it; no anchor ends at or after 24:00.
- WHEN the active language changes while the drawer is open THEN the drawer's labels, weekday names, preview and message SHALL change to the new language.
- WHEN the page is 390 px wide THEN the drawer SHALL fill the width and its footer buttons SHALL stay visible without sideways scrolling.

---

## Requirement Traceability

| Requirement ID | Story | Tasks | Status |
| --- | --- | --- | --- |
| ANC-01 | P1: Stored - list | T3, T4 | Pending |
| ANC-02 | P1: Stored - create | T3, T4 | Pending |
| ANC-03 | P1: Stored - replace | T3, T5 | Pending |
| ANC-04 | P1: Stored - delete | T3, T5 | Pending |
| ANC-05 | P1: Stored - unknown id 404 | T5 | Pending |
| ANC-06 | P1: Stored - broken rule 400 | T4, T5 | Pending |
| ANC-07 | P1: Stored - overlap 409 | T4, T5 | Pending |
| ANC-08 | P1: Stored - survives restart | T2, T6 | Pending |
| ANC-09 | P1: Stored - day format | T1, T3, T4 | Pending |
| ANC-10 | P1: Planner - draws anchors | T21, T24, T27, T28 | Pending |
| ANC-11 | P1: Planner - anchors only | T24 | Pending |
| ANC-12 | P1: Planner - loading status | T11, T21, T22 | Pending |
| ANC-13 | P1: Planner - loaded status | T11, T21, T22, T28 | Pending |
| ANC-14 | P1: Planner - load failure | T11, T21, T22 | Pending |
| ANC-15 | P1: Planner - empty week | T24 | Pending |
| ANC-16 | P1: Drawer - open to add | T8, T14, T16, T22, T25, T26, T28 | Pending |
| ANC-17 | P1: Drawer - open to edit | T8, T19, T23, T25, T28 | Pending |
| ANC-18 | P1: Drawer - preview | T7, T10, T25 | Pending |
| ANC-19 | P1: Drawer - save | T12, T18, T21, T25, T26, T28 | Pending |
| ANC-20 | P1: Drawer - saving state | T11, T21, T22, T25 | Pending |
| ANC-21 | P1: Drawer - saved status | T11, T21, T22, T28 | Pending |
| ANC-22 | P1: Drawer - save failure | T9, T11, T12, T21, T22, T25 | Pending |
| ANC-23 | P1: Drawer - close without saving | T13, T25, T29 | Pending |
| ANC-24 | P1: Drawer - focus return | T13, T26, T29 | Pending |
| ANC-25 | P1: Drawer - focus trap | T13, T29 | Pending |
| ANC-26 | P1: Rules - empty name | T1, T8, T9, T25 | Pending |
| ANC-27 | P1: Rules - name length | T1, T14, T25 | Pending |
| ANC-28 | P1: Rules - no day | T1, T8, T9, T25 | Pending |
| ANC-29 | P1: Rules - times set | T1, T8, T9, T25 | Pending |
| ANC-30 | P1: Rules - 15-minute steps | T1, T7, T8, T9, T15, T25 | Pending |
| ANC-31 | P1: Rules - end after start | T1, T8, T9, T25 | Pending |
| ANC-32 | P1: Rules - overlap message | T1, T7, T8, T9, T25, T28 | Pending |
| ANC-33 | P1: Rules - touching allowed | T1, T4, T8, T25, T28 | Pending |
| ANC-34 | P1: Rules - nothing sent | T21, T25 | Pending |
| ANC-35 | P1: Rules - own version ignored | T1, T5, T8 | Pending |
| ANC-36 | P1: Rules - message announced | T17, T25, T29 | Pending |
| ANC-37 | P2: Delete - button shown when editing | T25 | Pending |
| ANC-38 | P2: Delete - first click arms | T20, T25, T28 | Pending |
| ANC-39 | P2: Delete - second click deletes | T18, T21, T25, T28 | Pending |
| ANC-40 | P2: Delete - disarmed on open | T25 | Pending |
| ANC-41 | P2: Delete - failure | T9, T11, T12, T21, T25 | Pending |
| ANC-42 | Edge - deleted elsewhere | T12, T18, T21 | Pending |
| ANC-43 | Edge - server overlap 409 | T12, T21, T25 | Pending |
| ANC-44 | Edge - clipped to grid hours | T24, T27 | Pending |
| ANC-45 | Edge - 23:45 end | T1 | Implemented (T1) |
| ANC-46 | Edge - language change in drawer | T10, T25, T29 | Pending |
| ANC-47 | Edge - phone width drawer | T13, T29 | Pending |

ANC-01 to ANC-09 map to the first story's criteria in order, and each later story continues the count. ANC-26 to ANC-32 are the rules both the drawer and the API enforce; their error codes are fixed in Design.

**Coverage:** 47 total, 47 mapped to tasks, 0 unmapped.

---

## Success Criteria

- [ ] The owner enters their real week of anchors in the drawer and it is still there after reloading on the phone.
- [ ] No sequence of drawer actions or API calls stores two anchors that share time on a shared day.
- [ ] Nothing in the anchor flow shows red except a failed load, save or delete, and the armed Delete button.
