import type { FastifyInstance } from "fastify";
import type { HealthResponse } from "../../shared/health.ts";
import type { Database } from "../db.ts";

export function registerHealthRoute(app: FastifyInstance, db: Database): void {
  app.get("/api/health", async (_request, reply) => {
    try {
      db.ping();
    } catch {
      const body: HealthResponse = { status: "error", db: "error" };
      return reply.code(503).send(body);
    }
    const body: HealthResponse = { status: "ok", db: "ok" };
    return reply.code(200).send(body);
  });
}
