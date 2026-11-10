import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FlexibleActivity } from "../../shared/planner.ts";
import { buildApp } from "../app.ts";
import { type Database, openDatabase } from "../db.ts";

const run = {
  name: "Run 5 km",
  category: "movement",
  timesPerWeek: 2,
  duration: 45,
};

const brokenRules: [string, object][] = [
  ["nameEmpty", { ...run, name: "  " }],
  ["nameTooLong", { ...run, name: "a".repeat(61) }],
  ["timesOutOfRange", { ...run, timesPerWeek: 0 }],
  ["durationNotAllowed", { ...run, duration: 20 }],
  ["categoryUnknown", { ...run, category: "sport" }],
];

describe("activities API", () => {
  let tmp: string;
  let db: Database;
  let app: FastifyInstance;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "routinely-activity-routes-"));
    db = openDatabase(join(tmp, "routinely.db"));
    app = buildApp({ db });
  });

  afterEach(async () => {
    await app.close();
    db.close();
    rmSync(tmp, { recursive: true, force: true });
  });

  async function list(): Promise<FlexibleActivity[]> {
    const res = await app.inject({ method: "GET", url: "/api/activities" });
    expect(res.statusCode).toBe(200);
    return res.json<FlexibleActivity[]>();
  }

  function post(payload: unknown) {
    return app.inject({ method: "POST", url: "/api/activities", payload } as {
      method: "POST";
      url: string;
      payload: object;
    });
  }

  describe("GET /api/activities", () => {
    it("answers 200 with an empty list when nothing is stored", async () => {
      const res = await app.inject({ method: "GET", url: "/api/activities" });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it("lists activities by name ignoring case, then by id", async () => {
      await post({ ...run, name: "Run" });
      await post({ ...run, name: "read" });
      await post({ ...run, name: "apple" });

      expect((await list()).map((a) => a.name)).toEqual([
        "apple",
        "read",
        "Run",
      ]);
    });
  });

  describe("POST /api/activities", () => {
    it("stores a valid activity with its name trimmed and answers 201 with it", async () => {
      const res = await post({ ...run, name: "  Run 5 km  " });

      expect(res.statusCode).toBe(201);
      const created = res.json<FlexibleActivity>();
      expect(created).toEqual({ id: created.id, ...run });
      expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(await list()).toEqual([created]);
    });

    it.each(brokenRules)(
      "answers 400 %s and stores nothing",
      async (code, body) => {
        const res = await post(body);

        expect(res.statusCode).toBe(400);
        expect(res.json()).toEqual({ code });
        expect(await list()).toEqual([]);
      },
    );

    it("answers 400 invalid to a body that is not JSON", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/activities",
        headers: { "content-type": "application/json" },
        payload: "{not json",
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code: "invalid" });
      expect(await list()).toEqual([]);
    });

    it.each([
      [
        "a missing name",
        { category: "movement", timesPerWeek: 2, duration: 45 },
      ],
      ["times per week given as text", { ...run, timesPerWeek: "2" }],
      ["a numeric category", { ...run, category: 1 }],
      ["a list instead of an activity", [run]],
    ])("answers 400 invalid to %s and stores nothing", async (_label, body) => {
      const res = await post(body);

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code: "invalid" });
      expect(await list()).toEqual([]);
    });
  });

  function put(id: string, payload: unknown) {
    return app.inject({
      method: "PUT",
      url: `/api/activities/${id}`,
      payload,
    } as { method: "PUT"; url: string; payload: object });
  }

  function remove(id: string) {
    return app.inject({ method: "DELETE", url: `/api/activities/${id}` });
  }

  describe("PUT /api/activities/:id", () => {
    it("replaces every field and answers 200 with the stored activity", async () => {
      const stored = (await post(run)).json<FlexibleActivity>();
      const changed = {
        name: "Read",
        category: "rest",
        timesPerWeek: 3,
        duration: 60,
      };

      const res = await put(stored.id, { ...changed, name: " Read " });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ id: stored.id, ...changed });
      expect(await list()).toEqual([{ id: stored.id, ...changed }]);
    });

    it.each(brokenRules)(
      "answers 400 %s and leaves the activity as it was",
      async (code, body) => {
        const stored = (await post(run)).json<FlexibleActivity>();

        const res = await put(stored.id, body);

        expect(res.statusCode).toBe(400);
        expect(res.json()).toEqual({ code });
        expect(await list()).toEqual([stored]);
      },
    );

    it("answers 400 invalid to a wrongly shaped body and changes nothing", async () => {
      const stored = (await post(run)).json<FlexibleActivity>();

      const res = await put(stored.id, { ...run, duration: "45" });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code: "invalid" });
      expect(await list()).toEqual([stored]);
    });

    it("answers 404 for an unknown id and changes nothing", async () => {
      const stored = (await post(run)).json<FlexibleActivity>();

      const res = await put("nope", { ...run, name: "Swim" });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ code: "notFound" });
      expect(await list()).toEqual([stored]);
    });

    it("answers 404, not a rule, for an unknown id with a broken body", async () => {
      const res = await put("nope", { ...run, timesPerWeek: 0 });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ code: "notFound" });
    });
  });

  describe("DELETE /api/activities/:id", () => {
    it("removes the activity and answers 204", async () => {
      const stored = (await post(run)).json<FlexibleActivity>();
      const kept = (
        await post({ ...run, name: "Read" })
      ).json<FlexibleActivity>();

      const res = await remove(stored.id);

      expect(res.statusCode).toBe(204);
      expect(res.body).toBe("");
      expect(await list()).toEqual([kept]);
    });

    it("answers 404 for an unknown id and leaves the others", async () => {
      const stored = (await post(run)).json<FlexibleActivity>();

      const res = await remove("nope");

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ code: "notFound" });
      expect(await list()).toEqual([stored]);
    });
  });
});
