# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
