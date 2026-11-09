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

  function put(id: string, payload: unknown) {
    return app.inject({ method: "PUT", url: `/api/anchors/${id}`, payload } as {
      method: "PUT";
      url: string;
      payload: object;
    });
  }

  describe("PUT /api/anchors/:id", () => {
    it("replaces name, days, start and end and answers 200 with the stored anchor", async () => {
      const stored = (await post(work)).json<Anchor>();
      const changed = { name: "Office", days: [0, 2], start: 600, end: 1020 };

      const res = await put(stored.id, changed);

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ id: stored.id, ...changed });
      expect(await list()).toEqual([{ id: stored.id, ...changed }]);
    });

    it("stores the replaced name trimmed and the days unique and ascending", async () => {
      const stored = (await post(work)).json<Anchor>();

      const res = await put(stored.id, {
        ...work,
        name: " Job ",
        days: [4, 2, 4],
      });

      expect(res.statusCode).toBe(200);
      expect(await list()).toEqual([{ ...stored, name: "Job", days: [2, 4] }]);
    });

    it("does not count the anchor's own stored version as an overlap", async () => {
      const stored = (await post(work)).json<Anchor>();

      const res = await put(stored.id, { ...work, end: 1020 });

      expect(res.statusCode).toBe(200);
      expect(await list()).toEqual([{ ...stored, end: 1020 }]);
    });

    it("answers 409 when it would overlap another anchor, and changes nothing", async () => {
      const workStored = (await post(work)).json<Anchor>();
      const gym = (
        await post({ name: "Gym", days: [3], start: 1080, end: 1140 })
      ).json<Anchor>();

      const res = await put(gym.id, {
        name: "Gym",
        days: [3],
        start: 1020,
        end: 1140,
      });

      expect(res.statusCode).toBe(409);
      expect(res.json()).toEqual({ code: "overlap", other: "Work", day: 3 });
      expect(await list()).toEqual([workStored, gym]);
    });

    it.each([
      ["nameEmpty", { ...work, name: "" }],
      ["nameTooLong", { ...work, name: "a".repeat(61) }],
      ["noDays", { ...work, days: [] }],
      ["timesMissing", { ...work, end: null }],
      ["timeStep", { ...work, start: 550 }],
      ["endBeforeStart", { ...work, end: 480 }],
    ])("answers 400 %s and changes nothing", async (code, body) => {
      const stored = (await post(work)).json<Anchor>();

      const res = await put(stored.id, body);

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code });
      expect(await list()).toEqual([stored]);
    });

    it("answers 400 invalid to a wrongly shaped body and changes nothing", async () => {
      const stored = (await post(work)).json<Anchor>();

      const res = await put(stored.id, { ...work, days: "Mon" });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({ code: "invalid" });
      expect(await list()).toEqual([stored]);
    });

    it("answers 404 for an unknown id and changes nothing", async () => {
      const stored = (await post(work)).json<Anchor>();

      const res = await put("nope", { ...work, name: "Other", days: [6] });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ code: "notFound" });
      expect(await list()).toEqual([stored]);
    });

    it("answers 404, not a rule, for an unknown id with a broken body", async () => {
      const res = await put("nope", { ...work, name: "" });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ code: "notFound" });
    });

    it("answers 404, not invalid, for an unknown id with a body that is not JSON", async () => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/anchors/nope",
        headers: { "content-type": "application/json" },
        payload: "{not json",
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ code: "notFound" });
    });
  });

  describe("DELETE /api/anchors/:id", () => {
    it("removes the anchor and answers 204", async () => {
      const stored = (await post(work)).json<Anchor>();
      const kept = (
        await post({ ...work, name: "Gym", days: [6] })
      ).json<Anchor>();

      const res = await app.inject({
        method: "DELETE",
        url: `/api/anchors/${stored.id}`,
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toBe("");
      expect(await list()).toEqual([kept]);
    });

    it("answers 404 for an unknown id and changes nothing", async () => {
      const stored = (await post(work)).json<Anchor>();

      const res = await app.inject({
        method: "DELETE",
        url: "/api/anchors/nope",
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ code: "notFound" });
      expect(await list()).toEqual([stored]);
    });
  });
});
