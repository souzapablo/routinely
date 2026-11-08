# Routinely

Routinely is a calm weekly planner built around anchors: the fixed parts of
your week, like work or therapy. Flexible weekly goals, like "run twice a
week," fit into the gaps around them. There are no streaks and nothing is
ever marked as missed.

It's a single-user web app that runs on your own machine and is reachable only
on your local network. The interface is in English and Portuguese (pt-BR).

Read the [product brief](docs/product.md) for the full idea and its design
principles.

## Status

Routinely is in early development. The project skeleton is done: a status page
that shows whether the browser can reach the API and the API can reach the
database, with a switch between English and Portuguese. The planner itself
(anchors, flexible activities, and the week grid) isn't built yet.

## Requirements

- [Node.js](https://nodejs.org/) 26. The version is pinned in `.nvmrc`, so
  `nvm use` picks it up.
- npm, which comes with Node.js.

You don't need to install a database. Routinely uses SQLite through Node's
built-in `node:sqlite` module, and the whole database is one file.

## Get started

To run Routinely on your machine for development, follow these steps:

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Start the web app and the API together:

   ```sh
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

The page shows **Server: connected** and **Database: connected**. Changes to
the web app, including the strings in `src/web/i18n/`, appear in the browser
without a reload. The API restarts on its own when you edit server code.

In development, the web app runs on port 5173 and the API on port 3000. The
web dev server forwards every request under `/api` to the API.

## Run it on your local network

To use Routinely from your phone or another device on the same network, build
the web app and start the server:

```sh
npm run build
npm start
```

One Node process then serves both the web app and the API on `0.0.0.0`, port 3000. On the other device, open `http://<your-computer-ip>:3000`. On Windows,
`ipconfig` shows your computer's IP address; on macOS and Linux, use
`ip addr` or `ifconfig`.

Routinely has no login. Your local network is the only access control, so
don't expose the port to the internet.

### Settings

You can change two settings with environment variables:

| Variable        | Default             | What it sets                                                 |
| --------------- | ------------------- | ------------------------------------------------------------ |
| `PORT`          | `3000`              | The port the server listens on. An empty value means `3000`. |
| `DATABASE_PATH` | `data/routinely.db` | The SQLite file. Missing folders are created on start.       |

The server exits with code 1 and a one-line message if the port is already in
use or the database file can't be opened.

### Health check

`GET /api/health` reports whether the server can reach the database:

- `200` with `{"status":"ok","db":"ok"}` when the database answers.
- `503` with `{"status":"error","db":"error"}` when it doesn't.

## Commands

| Command                | What it does                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`          | Starts the web app with hot reload on port 5173 and the API on port 3000.      |
| `npm run build`        | Builds the web app into `dist/web`.                                            |
| `npm start`            | Serves `dist/web` and the API from one Node process on `0.0.0.0:3000`.         |
| `npm run check`        | Runs typecheck, lint, format check, tests, and build, and stops at a failure.  |
| `npm test`             | Runs every unit, component, and integration test once.                         |
| `npm run e2e`          | Builds and starts the app on port 3100 and runs the browser tests in Chromium. |
| `npm run typecheck`    | Checks the types of the web app, the server, and the end-to-end tests.         |
| `npm run lint`         | Lints the code with ESLint.                                                    |
| `npm run format`       | Formats every file with Prettier.                                              |
| `npm run format:check` | Reports files that Prettier would change, without changing them.               |

## Testing

Run `npm run check` before you commit. It's the same check that CI runs on
every push and pull request, together with `npm run e2e`.

The first time you run the browser tests on a machine, install Chromium for
Playwright:

```sh
npx playwright install chromium
npm run e2e
```

The browser tests use their own database in your system's temporary folder, so
they never touch `data/routinely.db`.

## Project layout

| Path          | What it holds                                                          |
| ------------- | ---------------------------------------------------------------------- |
| `src/web/`    | The React app, its tests, and the English and pt-BR strings (`i18n/`). |
| `src/server/` | The Fastify API, the database module, and the server entry point.      |
| `src/shared/` | Types and rules that both the web app and the server use.              |
| `e2e/`        | Playwright tests that run against the built app.                       |
| `test/`       | Tests for the repo itself: the commands, CI, and project files.        |
| `docs/`       | The product brief and the architecture decision records.               |
| `.specs/`     | Feature specs, tasks, and project decisions.                           |

The server's TypeScript runs directly on Node's type stripping, with no compile
step. Only the web app is built.

## Learn more

- [Product brief](docs/product.md): what Routinely is, what v1 must do, and the
  design principles.
- [ADR-001](docs/adr/001-use-react-typescript-node-and-sqlite.md): why the
  stack is React and TypeScript, Node, and SQLite.
- [Project decisions](.specs/STATE.md): smaller decisions, like the choice of
  Fastify and the single npm package.
- [Agent instructions](CLAUDE.md): the rules for working on this repo with a
  coding agent.
