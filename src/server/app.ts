import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import type { Database } from "./db.ts";
import { registerHealthRoute } from "./routes/health.ts";

export function buildApp(deps: {
  db: Database;
  webRoot?: string;
}): FastifyInstance {
  const app = Fastify();

  registerHealthRoute(app, deps.db);

  if (deps.webRoot !== undefined) {
    app.register(fastifyStatic, { root: deps.webRoot });

    // Any GET outside /api that matches no file is a page of the web app:
    // send index.html and let the browser-side code render it.
    app.setNotFoundHandler((request, reply) => {
      if (request.method === "GET" && !request.url.startsWith("/api/")) {
        return reply.sendFile("index.html");
      }
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: `Route ${request.method}:${request.url} not found`,
      });
    });
  }

  return app;
}
