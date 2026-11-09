import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnchorInput } from "../../shared/anchors.ts";
import type { Anchor } from "../../shared/planner.ts";
import { deleteAnchor, loadAnchors, saveAnchor } from "./api.ts";

const work: Anchor = {
  id: "a1",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};
const body: AnchorInput = {
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

function answers(response: Response | (() => Promise<Response>)) {
  const fetch = vi.fn(() =>
    typeof response === "function" ? response() : Promise.resolve(response),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const json = (value: unknown, status: number) =>
  Response.json(value, { status });
const notJson = (status: number) =>
  new Response("<html>oops</html>", { status });
const networkError = () => Promise.reject(new TypeError("Failed to fetch"));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadAnchors", () => {
  it("returns the anchors from a 200", async () => {
    const fetch = answers(json([work], 200));
    const signal = new AbortController().signal;

    expect(await loadAnchors(signal)).toEqual([work]);
    expect(fetch).toHaveBeenCalledWith("/api/anchors", { signal });
  });

  it.each([
    ["a 500", () => Promise.resolve(json({}, 500))],
    ["a network error", networkError],
    ["a body that is not JSON", () => Promise.resolve(notJson(200))],
    [
      "a list of the wrong shape",
      () => Promise.resolve(json([{ ...work, days: [7] }], 200)),
    ],
    ["an object instead of a list", () => Promise.resolve(json(work, 200))],
  ])("fails on %s", async (_name, response) => {
    answers(response);
    expect(await loadAnchors(new AbortController().signal)).toBe("failed");
  });
});

describe("saveAnchor", () => {
  it("creates with POST when there is no id", async () => {
    const fetch = answers(json(work, 201));

    expect(await saveAnchor(null, body)).toEqual({ kind: "ok", anchor: work });
    expect(fetch).toHaveBeenCalledWith("/api/anchors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  });

  it("replaces with PUT on the anchor's path when there is an id", async () => {
    const fetch = answers(json(work, 200));

    expect(await saveAnchor("a1", body)).toEqual({ kind: "ok", anchor: work });
    expect(fetch).toHaveBeenCalledWith("/api/anchors/a1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  });

  it("returns a broken rule from a 400", async () => {
    answers(json({ code: "timeStep" }, 400));
    expect(await saveAnchor(null, body)).toEqual({
      kind: "rule",
      problem: { code: "timeStep" },
    });
  });

  it("returns an overlap from a 409", async () => {
    answers(json({ code: "overlap", other: "Work", day: 1 }, 409));
    expect(await saveAnchor("a2", body)).toEqual({
      kind: "rule",
      problem: { code: "overlap", other: "Work", day: 1 },
    });
  });

  it("returns notFound from a 404", async () => {
    answers(json({ code: "notFound" }, 404));
    expect(await saveAnchor("gone", body)).toEqual({ kind: "notFound" });
  });

  it.each([
    ["a 400 invalid", () => Promise.resolve(json({ code: "invalid" }, 400))],
    ["a 400 with no code", () => Promise.resolve(json({}, 400))],
    ["a 400 that is not JSON", () => Promise.resolve(notJson(400))],
    [
      "a 409 overlap without its day",
      () => Promise.resolve(json({ code: "overlap", other: "Work" }, 409)),
    ],
    ["a 500", () => Promise.resolve(json({}, 500))],
    ["a network error", networkError],
    ["a 201 that is not JSON", () => Promise.resolve(notJson(201))],
    [
      "a 200 with a body of the wrong shape",
      () => Promise.resolve(json({ ...work, id: undefined }, 200)),
    ],
  ])("fails on %s", async (_name, response) => {
    answers(response);
    expect(await saveAnchor("a1", body)).toEqual({ kind: "failed" });
  });
});

describe("deleteAnchor", () => {
  it("deletes with DELETE on the anchor's path", async () => {
    const fetch = answers(new Response(null, { status: 204 }));

    expect(await deleteAnchor("a1")).toEqual({ kind: "ok" });
    expect(fetch).toHaveBeenCalledWith("/api/anchors/a1", {
      method: "DELETE",
    });
  });

  it("returns notFound from a 404", async () => {
    answers(json({ code: "notFound" }, 404));
    expect(await deleteAnchor("gone")).toEqual({ kind: "notFound" });
  });

  it.each([
    ["a 500", () => Promise.resolve(json({}, 500))],
    ["a network error", networkError],
  ])("fails on %s", async (_name, response) => {
    answers(response);
    expect(await deleteAnchor("a1")).toEqual({ kind: "failed" });
  });
});
