import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "./app.ts";
import type { AnchorRepository } from "./anchors/repository.ts";
import type { Database } from "./db.ts";

// These tests never reach the anchors routes.
const unusedAnchors = {} as AnchorRepository;
const workingDb: Database = { ping() {}, close() {}, anchors: unusedAnchors };

describe("buildApp", () => {
  it("answers 404 JSON for an unknown api path", async () => {
    const app = buildApp({ db: workingDb });

    const res = await app.inject({ method: "GET", url: "/api/nope" });

    expect(res.statusCode).toBe(404);
    expect(res.headers["content-type"]).toMatch(/^application\/json/);
    expect(res.json()).toMatchObject({ statusCode: 404 });
  });

  describe("with a web root", () => {
    const indexHtml = "<!doctype html><title>Routinely</title>";
    const appJs = "console.log('routinely');";
    let webRoot: string;

    beforeEach(() => {
      webRoot = mkdtempSync(join(tmpdir(), "routinely-web-"));
      mkdirSync(join(webRoot, "assets"));
      writeFileSync(join(webRoot, "index.html"), indexHtml);
      writeFileSync(join(webRoot, "assets", "app.js"), appJs);
    });

    afterEach(() => {
      rmSync(webRoot, { recursive: true, force: true });
    });

    it("serves a file that exists in the web root", async () => {
      const app = buildApp({ db: workingDb, webRoot });

      const res = await app.inject({ method: "GET", url: "/assets/app.js" });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/javascript/);
      expect(res.body).toBe(appJs);
    });

    it("returns index.html for a non-api path", async () => {
      const app = buildApp({ db: workingDb, webRoot });

      const res = await app.inject({ method: "GET", url: "/some/page" });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/^text\/html/);
      expect(res.body).toBe(indexHtml);
    });

    it("still answers 404 JSON for an unknown api path", async () => {
      const app = buildApp({ db: workingDb, webRoot });

      const res = await app.inject({ method: "GET", url: "/api/nope" });

      expect(res.statusCode).toBe(404);
      expect(res.headers["content-type"]).toMatch(/^application\/json/);
      expect(res.json()).toMatchObject({ statusCode: 404 });
    });

    it.each(["/api", "/api?x=1"])(
      "answers 404 JSON for %s, which belongs to the api",
      async (url) => {
        const app = buildApp({ db: workingDb, webRoot });

        const res = await app.inject({ method: "GET", url });

        expect(res.statusCode).toBe(404);
        expect(res.headers["content-type"]).toMatch(/^application\/json/);
      },
    );

    it("returns index.html for /apiary, which only starts like the api", async () => {
      const app = buildApp({ db: workingDb, webRoot });

      const res = await app.inject({ method: "GET", url: "/apiary" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBe(indexHtml);
    });
  });
});
