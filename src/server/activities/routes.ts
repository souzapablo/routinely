import type { FastifyInstance } from "fastify";
import {
  ActivityInput,
  activityProblem,
  normalizeActivity,
} from "../../shared/activities.ts";
import type { ActivityRepository } from "./repository.ts";

const invalid = { code: "invalid" } as const;
const notFound = { code: "notFound" } as const;

type ById = { Params: { id: string } };

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

    // An unknown id answers 404 before the body is even parsed, so it never
    // reports a rule or a malformed body.
    scope.put<ById>(
      "/api/activities/:id",
      {
        onRequest: (request, reply, next) => {
          if (activities.get(request.params.id)) return next();
          void reply.code(404).send(notFound);
        },
      },
      (request, reply) => {
        const parsed = ActivityInput.safeParse(request.body);
        if (!parsed.success) return reply.code(400).send(invalid);

        const problem = activityProblem(parsed.data);
        if (problem) return reply.code(400).send(problem);

        const replaced = activities.replace(
          request.params.id,
          normalizeActivity(parsed.data),
        );
        if (!replaced) return reply.code(404).send(notFound);
        return reply.code(200).send(replaced);
      },
    );

    scope.delete<ById>("/api/activities/:id", (request, reply) => {
      if (!activities.remove(request.params.id)) {
        return reply.code(404).send(notFound);
      }
      return reply.code(204).send();
    });

    done();
  });
}
