# STATE

## Decisions

### AD-001
- **Decision**: The app is one npm package with `src/web`, `src/server` and `src/shared`, not npm workspaces.
- **Reason**: The user chose it to spend learning time on React and TypeScript, not monorepo tooling; `src/shared` still gives one place for code both sides use.
- **Trade-off**: No enforced package boundaries; web code could import server code by mistake (the two tsconfigs make that a type error).
- **Scope**: Whole repo
- **Date**: 2026-11-06
- **Status**: active

### AD-002
- **Decision**: The API uses Fastify 5.
- **Reason**: The user chose it over Hono for its mature TypeScript types, built-in pieces and `app.inject()` route testing.
- **Trade-off**: Fastify-specific request/reply APIs instead of web-standard `Request`/`Response`.
- **Scope**: `src/server`
- **Date**: 2026-11-06
- **Status**: active

### AD-003
- **Decision**: The server talks to SQLite through Node's built-in `node:sqlite` with plain SQL; the ORM is chosen with the first real schema.
- **Reason**: The user chose it; the skeleton runs one query, and choosing an ORM before any schema exists would be a guess. No native module to compile.
- **Trade-off**: Drizzle has no `node:sqlite` driver, so adopting Drizzle later means switching to better-sqlite3 behind the `Database` module.
- **Scope**: `src/server/db.ts` and every feature that adds tables
- **Date**: 2026-11-06
- **Status**: active

### AD-004
- **Decision**: The server's TypeScript runs directly on Node 26 type stripping; only the web app is built. Server code uses erasable syntax only and `.ts` import extensions.
- **Reason**: No server compile step or `dist/server`; `tsc` is used only to check.
- **Trade-off**: No `enum`, `namespace` or parameter properties in server and shared code (`erasableSyntaxOnly` enforces it).
- **Scope**: `src/server`, `src/shared`
- **Date**: 2026-11-06
- **Status**: active

## Handoff
