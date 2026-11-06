import Fastify, { type FastifyInstance } from "fastify";
import type { Database } from "./db.ts";
import { registerHealthRoute } from "./routes/health.ts";

export function buildApp(deps: { db: Database }): FastifyInstance {
  const app = Fastify();

  registerHealthRoute(app, deps.db);

  return app;
}
