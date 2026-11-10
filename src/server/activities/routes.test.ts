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
});
