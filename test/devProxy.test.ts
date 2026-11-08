import { describe, expect, it } from "vitest";
import config from "../vite.config.ts";

// The dev server must send the same paths to the API as the built server.
describe("dev proxy", () => {
  const keys = Object.keys(config.server?.proxy ?? {});

  it("has one rule for the api", () => {
    expect(keys).toHaveLength(1);
  });

  it.each(["/api", "/api/health", "/api?x=1"])("sends %s to the api", (url) => {
    expect(new RegExp(keys[0] ?? "").test(url)).toBe(true);
  });

  it.each(["/", "/apiary", "/some/page"])("leaves %s to the web app", (url) => {
    expect(new RegExp(keys[0] ?? "").test(url)).toBe(false);
  });
});
