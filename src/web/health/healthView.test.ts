import { describe, expect, it } from "vitest";
import { toHealthView } from "./healthView.ts";

describe("toHealthView", () => {
  it("shows server and database connected on 200 with a valid body", () => {
    expect(
      toHealthView({
        kind: "response",
        status: 200,
        body: { status: "ok", db: "ok" },
      }),
    ).toEqual({
      server: "connected",
      db: "connected",
    });
  });

  it("shows server connected and database unreachable on 503", () => {
    expect(
      toHealthView({
        kind: "response",
        status: 503,
        body: { status: "error", db: "error" },
      }),
    ).toEqual({ server: "connected", db: "unreachable" });
  });

  it("shows database unreachable on 503 even when the body says ok", () => {
    expect(
      toHealthView({
        kind: "response",
        status: 503,
        body: { status: "ok", db: "ok" },
      }),
    ).toEqual({ server: "connected", db: "unreachable" });
  });

  it("shows server connected and database unreachable when the body fails the schema", () => {
    expect(
      toHealthView({ kind: "response", status: 200, body: { status: "ok" } }),
    ).toEqual({
      server: "connected",
      db: "unreachable",
    });
  });

  it("shows server and database unreachable on a status other than 200 or 503", () => {
    for (const status of [502, 504, 500, 404]) {
      expect(
        toHealthView({ kind: "response", status, body: "Bad Gateway" }),
        `status ${status}`,
      ).toEqual({ server: "unreachable", db: "unreachable" });
    }
  });

  it("shows server and database unreachable when the request failed", () => {
    expect(toHealthView({ kind: "failed" })).toEqual({
      server: "unreachable",
      db: "unreachable",
    });
  });
});
