# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Test the wiring that feeds a pure rule its real inputs, not only the rule itself
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `web-i18n` · harmful: 0
- features: 0001-project-skeleton
- evidence: src/web/i18n/index.ts:37 (V1) (web-i18n)
- last seen: 2026-11-08T08:58:25Z

### L-002 - When two signals decide one outcome, test a case where they disagree
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `web-health` · harmful: 0
- features: 0001-project-skeleton
- evidence: src/web/health/healthView.ts:17 (V2) (web-health)
- last seen: 2026-11-08T08:58:25Z

### L-003 - Say in the spec what startup does when a configured resource can't be opened, and prove it with a child-process test
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `server-startup` · harmful: 0
- features: 0001-project-skeleton
- evidence: src/server/index.ts:10 (V3) (server-startup)
- last seen: 2026-11-08T08:58:26Z

### L-004 - Map every response status the client can receive, not only the ones the server sends
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web-health` · harmful: 0
- features: 0001-project-skeleton
- evidence: src/web/health/healthView.ts:15 (V4) (web-health)
- last seen: 2026-11-08T08:58:26Z

### L-005 - Define a route prefix in one shared rule used by both the server and the dev proxy, and test its exact boundary
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `routing` · harmful: 0
- features: 0001-project-skeleton
- evidence: src/server/app.ts:20 (V5) (routing)
- last seen: 2026-11-08T08:58:26Z

### L-006 - Treat an empty environment variable as unset before applying its default
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `server-config` · harmful: 0
- features: 0001-project-skeleton
- evidence: src/server/index.ts:6 (V6) (server-config)
- last seen: 2026-11-08T08:58:26Z

### L-007 - Put text-overflow: ellipsis on the element that holds the text (use Text truncate), not on a wrapper around a block-level child, and assert the ellipsis in e2e on every truncated text the captures show.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `src/web css` · harmful: 0
- features: 0002-main-layout
- evidence: src/web/planner/components/GridBlock.module.css:37 (src/web css)
- last seen: 2026-11-08T16:20:05Z

### L-008 - When a layout decision names a position (second row, right-aligned), the e2e test asserts that position, not only that nothing overlaps.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `e2e layout` · harmful: 0
- features: 0002-main-layout
- evidence: src/web/app/TopBar.module.css .language flex-basis (e2e layout)
- last seen: 2026-11-08T16:20:05Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
