import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Anchor } from "../../shared/planner.ts";
import { buildApp } from "../app.ts";
import { type Database, openDatabase } from "../db.ts";

const work = { name: "Work", days: [1, 2, 3, 4, 5], start: 540, end: 1080 };

describe("anchors API", () => {
  let tmp: string;
  let db: Database;
  let app: FastifyInstance;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "routinely-routes-"));
    db = openDatabase(join(tmp, "routinely.db"));
    app = buildApp({ db });
  });

  afterEach(async () => {
    await app.close();
    db.close();
    rmSync(tmp, { recursive: true, force: true });
  });

  async function list(): Promise<Anchor[]> {
    const res = await app.inject({ method: "GET", url: "/api/anchors" });
    expect(res.statusCode).toBe(200);
    return res.json<Anchor[]>();
  }

  function post(payload: unknown) {
    return app.inject({ method: "POST", url: "/api/anchors", payload } as {
      method: "POST";
      url: string;
      payload: object;
    });
  }

  describe("GET /api/anchors", () => {
    it("answers 200 with an empty list when nothing is stored", async () => {
      const res = await app.inject({ method: "GET", url: "/api/anchors" });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it("lists anchors by start time, then by name", async () => {
      await post({ ...work, name: "Lunch", start: 720, end: 780, days: [0] });
      await post({ ...work, name: "Work", days: [6], end: 600 });
      await post({ ...work, name: "Gym", start: 720, end: 780, days: [6] });

      expect((await list()).map((a) => a.name)).toEqual([
        "Work",
        "Gym",
        "Lunch",
      ]);
    });
  });

  describe("POST /api/anchors", () => {
    it("stores a valid anchor and answers 201 with it and a new id", async () => {
      const res = await post(work);

      expect(res.statusCode).toBe(201);
      const created = res.json<Anchor>();
      expect(created).toMatchObject(work);
      expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(await list()).toEqual([created]);
    });

    it("stores the name trimmed and the days unique and ascending", async () => {
      const res = await post({ ...work, name: "  Work ", days: [5, 1, 1, 3] });

      expect(res.statusCode).toBe(201);
      expect(res.json()).toMatchObject({ name: "Work", days: [1, 3, 5] });
      expect(await list()).toMatchObject([{ name: "Work", days: [1, 3, 5] }]);
    });

    it.each([
      ["nameEmpty", { ...work, name: "   " }],
      ["nameTooLong", { ...work, name: "a".repeat(61) }],
      ["noDays", { ...work, days: [] }],
      ["timesMissing", { ...work, start: null }],
      ["timeStep", { ...work, end: 1085 }],
      ["endBeforeStart", { ...work, end: 540 }],
    ])("answers 400 %s and stores nothing", async (code, body) => {
      const res = await post(body);

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code });
      expect(await list()).toEqual([]);
    });

    it("answers 409 naming the other anchor and the first shared day, and stores nothing", async () => {
      const stored = (await post(work)).json<Anchor>();

      const res = await post({
        name: "Gym",
        days: [3, 1],
        start: 1020,
        end: 1110,
      });

      expect(res.statusCode).toBe(409);
      expect(res.json()).toEqual({ code: "overlap", other: "Work", day: 1 });
      expect(await list()).toEqual([stored]);
    });

    it("accepts an anchor that only touches another", async () => {
      await post(work);

      const res = await post({
        name: "Gym",
        days: [1],
        start: 1080,
        end: 1140,
      });

      expect(res.statusCode).toBe(201);
      expect((await list()).map((a) => a.name)).toEqual(["Work", "Gym"]);
    });

    it("answers 400 invalid to a body that is not JSON", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/anchors",
        headers: { "content-type": "application/json" },
        payload: "{not json",
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code: "invalid" });
      expect(await list()).toEqual([]);
    });

    it("answers 400 invalid to an empty body", async () => {
      const res = await app.inject({ method: "POST", url: "/api/anchors" });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code: "invalid" });
    });

    it.each([
      ["a weekday 7", { ...work, days: [7] }],
      ["a time given as text", { ...work, start: "09:00" }],
      ["a missing name", { days: [1], start: 540, end: 1080 }],
      ["a list instead of an anchor", [work]],
    ])("answers 400 invalid to %s and stores nothing", async (_label, body) => {
      const res = await post(body);

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code: "invalid" });
      expect(await list()).toEqual([]);
    });
  });
});
