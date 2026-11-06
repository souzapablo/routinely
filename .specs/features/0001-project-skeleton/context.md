# Project Skeleton Context

**Gathered:** 2026-11-06
**Spec:** `.specs/features/0001-project-skeleton/spec.md`
**Status:** Ready for design (after spec approval)

---

## Feature Boundary

A walking skeleton (status page → `/api/health` → SQLite) with English + pt-BR, plus the harness: typecheck, lint, format, tests, e2e smoke test, one `check` command, a GitHub Actions workflow, git and `CLAUDE.md`. No planner features.

---

## Implementation Decisions

### What the skeleton shows

- A status page that says whether the API and the database answered. User chose "Status page (Recommended)".

### Languages

- English + pt-BR are wired in the skeleton, not later. User chose "Yes, in skeleton (Recommended)".

### CI

- A GitHub Actions workflow file. User chose "GitHub Actions (Recommended)". Creating the repo and pushing still need a separate go-ahead.

### How the work is split

- The agent writes everything, then walks the user through each file and why it's shaped that way. User chose "You write, I review".

### Agent's Discretion

None yet. Library choices (server framework, database access, validation, test tools, lint/format, package layout) are decided in Design; the user is learning, so they are presented with reasons before being locked in.

### Declined / Undiscussed Gray Areas → Assumptions

- Language on first visit, where the language choice is stored, port/interface, SQLite file location, health check timeout: defaults logged in spec.md Assumptions (`n`, for the user to correct at approval).

---

## Specific References

- Product brief `docs/product.md` and the Routinely prototype (planner design; not binding for the status page).

---

## Deferred Ideas

None - discussion stayed within feature scope.
