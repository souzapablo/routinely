import type { FastifyInstance, FastifyReply } from "fastify";
import {
  AnchorInput,
  type AnchorProblem,
  anchorProblem,
  normalizeAnchor,
} from "../../shared/anchors.ts";
import type { AnchorRepository } from "./repository.ts";

const invalid = { code: "invalid" } as const;

function sendProblem(reply: FastifyReply, problem: AnchorProblem) {
  return reply.code(problem.code === "overlap" ? 409 : 400).send(problem);
}

export function registerAnchorRoutes(
  app: FastifyInstance,
  anchors: AnchorRepository,
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

    scope.get("/api/anchors", (_request, reply) => reply.send(anchors.list()));

    // node:sqlite is synchronous: the check and the write below run with no
    // await between them, so no other request can store an overlap in between.
    scope.post("/api/anchors", (request, reply) => {
      const parsed = AnchorInput.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send(invalid);

      const problem = anchorProblem(parsed.data, anchors.list());
      if (problem) return sendProblem(reply, problem);

      return reply.code(201).send(anchors.create(normalizeAnchor(parsed.data)));
    });

    done();
  });
}
