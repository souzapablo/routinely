import { describe, expect, it } from "vitest";
import { buildApp } from "./app.ts";
import type { Database } from "./db.ts";

const workingDb: Database = { ping() {}, close() {} };

describe("buildApp", () => {
  it("answers 404 JSON for an unknown api path", async () => {
    const app = buildApp({ db: workingDb });

    const res = await app.inject({ method: "GET", url: "/api/nope" });

    expect(res.statusCode).toBe(404);
    expect(res.headers["content-type"]).toMatch(/^application\/json/);
    expect(res.json()).toMatchObject({ statusCode: 404 });
  });
});
