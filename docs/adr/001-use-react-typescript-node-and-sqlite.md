# ADR-001: Use React + TypeScript (Vite), a Node + TypeScript backend, and SQLite

- **Date**: 2026-11-06
- **Status**: Accepted
- **Deciders**: Pablo (owner)
- **Tags**: architecture, frontend, backend, database

## Context and Problem Statement

Routinely v1 is a weekly planner with one user (me) that runs on my own server and is reachable only on my local network. It has no login, and the UI is in English and pt-BR (see [product brief](../product.md)). The core of the app is a drag-and-drop week grid, backed by a small amount of structured data: activities, placements and done marks. This project is also a deliberate chance to learn React and TypeScript in depth, so the stack is chosen partly for what it teaches.

## Decision Drivers

- Learn React and TypeScript deeply, using plain React rather than a framework's abstractions
- One language across frontend, backend and shared code, so domain types and rules are written once
- Runs on a local server, with no cloud services or managed databases
- Small, relational data with one writer
- Little operational work: no separate database server to install or run

## Considered Options

- React + TypeScript (Vite) frontend, Node + TypeScript backend, SQLite
- .NET: an ASP.NET Core backend (with React or Blazor on the frontend), SQLite
- Next.js full-stack app, SQLite

## Decision Outcome

Chosen option: **React + TypeScript (Vite), a Node + TypeScript backend, and SQLite**. It best serves the learning goal: a single-page React app without a meta-framework, with TypeScript at every layer. SQLite fits a single-user app on one machine, with no database server to run.

### Positive Consequences

- Domain types and scheduling rules (overlap checks, "Find a time") live in one shared TypeScript module. They're pure functions, so both the client and the server can use and unit test them.
- Because the frontend is plain React, state, effects, data fetching and drag-and-drop are all built by hand, which is the learning goal.
- The whole database is one file, so setup is just `npm install` and the app is easy to move to another machine.

### Negative Consequences

- No .NET practice from this project.
- Choosing a library for routing, data fetching, validation and the ORM is my job. A framework would have made those choices for me.
- SQLite allows only one writer at a time and has no network access. Multiple users or devices writing at once would mean revisiting this ADR (e.g. Postgres).
- The frontend and backend run as two processes in development (Vite dev server + API) and need a proxy between them.

## Pros and Cons of the Options

### React + TypeScript (Vite), Node + TypeScript, SQLite ✅ Chosen

- ✅ Directly serves the React/TypeScript learning goal
- ✅ Types and rules can be shared end to end
- ✅ Lightweight, with fast feedback (Vite HMR)
- ❌ More choices to make myself

### .NET (ASP.NET Core) + SQLite

- ✅ Strong typed backend, a good fit for this app, and .NET practice
- ❌ Two languages: domain types get written twice, or generated from one to the other
- ❌ Splits learning time away from React/TypeScript

### Next.js full-stack + SQLite

- ✅ One project and one process, with routing and the API built in
- ❌ Server components, caching and the framework's conventions hide the React fundamentals I want to learn
- ❌ Server rendering adds nothing for a single user on a LAN

## Links

- [Product brief](../product.md)
- Library choices (server framework, ORM, validation, testing) get their own ADRs when the skeleton is built.
