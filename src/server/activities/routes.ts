import type { FastifyInstance } from "fastify";
import {
  ActivityInput,
  activityProblem,
  normalizeActivity,
} from "../../shared/activities.ts";
import type { ActivityRepository } from "./repository.ts";

const invalid = { code: "invalid" } as const;

export function registerActivityRoutes(
  app: FastifyInstance,
  activities: ActivityRepository,
): void {
  app.register((scope, _options, done) => {
    // Body parsing failures (bad JSON, an unknown content type) answer with
    // the same code as a wrongly shaped body, not Fastify's own error shape.
    scope.setErrorHandler((error, _request, reply) => {
      const status = (error as { statusCode?: number }).statusCode;
      if (status !== undefined && status >= 400 && status < 500) {
        return reply.code(400).send(invalid);
      }
      throw error;
    });

    scope.get("/api/activities", (_request, reply) =>
      reply.send(activities.list()),
    );

    scope.post("/api/activities", (request, reply) => {
      const parsed = ActivityInput.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send(invalid);

      const problem = activityProblem(parsed.data);
      if (problem) return reply.code(400).send(problem);

      return reply
        .code(201)
        .send(activities.create(normalizeActivity(parsed.data)));
    });

    done();
  });
}
