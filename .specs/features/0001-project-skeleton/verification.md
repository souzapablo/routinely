# Project Skeleton verification

**Verdict**: FAIL
**Mutations**: 3 - probed C11 (first-visit language wiring), C6 (503 → database can't connect), C8 (5 s timeout bound)
**Proofs**: `proofs.md` at 048c3a2
**Verifier**: independent sub-agent (author != verifier)

## Mutations injected

| Mutation | Location | Killed |
| --- | --- | --- |
| first-visit language ignores the browser (navigator.languages -> ["en-US"]) | `src\web\i18n\index.ts:37` | no |
| database state ignores the HTTP status (drop status === 200) | `src\web\health\healthView.ts:17` | no |
| health check timeout 5000 -> 5001 ms | `src\web\health\useHealth.ts:11` | yes |

## Own examples run at HEAD

- `DATABASE_PATH` set to a directory, and to a path under a regular file: `node src/server/index.ts` exits 1 with an uncaught `ERR_SQLITE_ERROR` / `EEXIST` stack trace before listening.
- `npx vite` with no API on port 3000: `GET /api/health` through the dev proxy answers `502 Bad Gateway`.
- `buildApp` with a web root: `GET /api` and `GET /api?x=1` answer `200 text/html` (index.html); `GET /api/nope` answers 404 JSON.
- `PORT=` (empty): the server logs `listening on http://0.0.0.0:62189` (a random port, not 3000).

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| V1 - SKEL-10 (C11): the page's first-visit language can ignore the browser and no test fails. C11 proves only `detectLanguage`; nothing checks that `index.ts` feeds it the browser's languages, and the e2e run is pinned to `en-US` | mutation `navigator.languages -> ["en-US"]` at `src/web/i18n/index.ts:37` not killed by `npx vitest run --project web` | add a test that loads the i18n module (or the page) with `navigator.languages` set to `["pt-BR"]` and no saved value, and asserts pt-BR text and `lang="pt-BR"` (e.g. a fresh module import, or a Playwright test with `locale: "pt-BR"`) | 4f3330c - C36 |
| V2 - SKEL-06 (C6): the HTTP status never decides the database line. Every 503 in the tests carries a body that also says `db: "error"`, so dropping `status === 200` keeps them green | mutation `drop status === 200` at `src/web/health/healthView.ts:17` not killed by `healthView.test.ts` + `StatusPage.test.tsx`; `StatusPage.test.tsx:61` and `healthView.test.ts:22` | assert that a 503 whose body says `{"status":"ok","db":"ok"}` still shows "Database: can't connect" | de0abc9 - C37 |
| V3 - SKEL-02 / SKEL-06, story 1 Independent Test: pointing `DATABASE_PATH` at an unreadable path crashes the server at startup (uncaught stack trace, exit 1) instead of answering 503 and showing "Database: can't connect". The 503 path is reachable only through the fake DB in `health.test.ts` | own example: `DATABASE_PATH=<a directory> node src/server/index.ts` → `Error: unable to open database file` at `src/server/db.ts:13`, called unguarded from `src/server/index.ts:10` | either catch the open failure so the server starts and `/api/health` answers 503, or append a criterion that says what happens when the database can't be opened and correct the Independent Test; prove it with a child-process test | 0a24b12 - C35 |
| V4 - SKEL-07 / SKEL-24: any answer other than 200 is shown as "Server: connected". In `npm run dev` with the API down, the Vite proxy answers 502 and the page says "Server: connected" / "Database: can't connect" - the server line is false, and it makes the V3 Independent Test look like it passes in dev | own example: `npx vite` alone, `GET /api/health` → `502 Bad Gateway`; `src/web/health/healthView.ts:15-18` maps every `kind: "response"` to `server: "connected"` | the spec fixes only 200 and 503: append a criterion for other statuses (e.g. a 5xx other than 503 counts as "Server: can't connect") and a check for it | b49caeb - C34 |
| V5 - SKEL-28 (C29), minor: `/api` without a trailing slash and `/api?x=1` are served `index.html` instead of the API's 404 JSON; the dev proxy (`vite.config.ts:12`, prefix `/api`) draws the line elsewhere, so `/apiary` goes to the API in dev and to the web app in production | own example: `buildApp` with a web root, `GET /api` and `GET /api?x=1` → `200 text/html`; `src/server/app.ts:20` tests `startsWith("/api/")` | treat the path `/api` and `/api/...` (ignoring the query string) as API paths in both places, and add the `/api` case to `app.test.ts` | 5233b42 - C38 |
| V6 - SKEL-25, minor: an empty `PORT` (common in `.env` files) listens on a random port instead of the default 3000 | own example: `PORT= node src/server/index.ts` → `listening on http://0.0.0.0:62189`; `src/server/index.ts:6` uses `Number(process.env.PORT ?? 3000)` (`Number("")` is 0) | fall back to 3000 when `PORT` is empty, and test it | b7265f9 - C39 |
