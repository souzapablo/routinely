import { describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";
import type { AnchorRepository } from "../anchors/repository.ts";
import type { Database } from "../db.ts";

// These tests never reach the anchors routes.
const unusedAnchors = {} as AnchorRepository;
const workingDb: Database = { ping() {}, close() {}, anchors: unusedAnchors };
const brokenDb: Database = {
  ping() {
    throw new Error("database is gone");
  },
  close() {},
  anchors: unusedAnchors,
};

describe("GET /api/health", () => {
  it("answers 200 ok when the database ping succeeds", async () => {
    const app = buildApp({ db: workingDb });

    const res = await app.inject({ method: "GET", url: "/api/health" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", db: "ok" });
  });

  it("answers 503 error when the database ping throws", async () => {
    const app = buildApp({ db: brokenDb });

    const res = await app.inject({ method: "GET", url: "/api/health" });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ status: "error", db: "error" });
  });
});
