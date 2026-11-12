import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ActivityInput,
  ActivityProblemCode,
} from "../../shared/activities.ts";
import type { FlexibleActivity } from "../../shared/planner.ts";
import { deleteActivity, loadActivities, saveActivity } from "./api.ts";

const run: FlexibleActivity = {
  id: "f1",
  name: "Run 5 km",
  category: "movement",
  timesPerWeek: 2,
  duration: 45,
};
const body: ActivityInput = {
  name: "Run 5 km",
  category: "movement",
  timesPerWeek: 2,
  duration: 45,
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

describe("loadActivities", () => {
  it("returns the activities from a 200", async () => {
    const fetch = answers(json([run], 200));
    const signal = new AbortController().signal;

    expect(await loadActivities(signal)).toEqual([run]);
    expect(fetch).toHaveBeenCalledWith("/api/activities", { signal });
  });

  it.each([
    ["a 500", () => Promise.resolve(json({}, 500))],
    ["a network error", networkError],
    ["a body that is not JSON", () => Promise.resolve(notJson(200))],
    [
      "a list with an unknown category",
      () => Promise.resolve(json([{ ...run, category: "sport" }], 200)),
    ],
    [
      "a list with times per week as a string",
      () => Promise.resolve(json([{ ...run, timesPerWeek: "2" }], 200)),
    ],
    ["an object instead of a list", () => Promise.resolve(json(run, 200))],
  ])("fails on %s", async (_name, response) => {
    answers(response);
    expect(await loadActivities(new AbortController().signal)).toBe("failed");
  });
});

describe("saveActivity", () => {
  it("creates with POST when there is no id", async () => {
    const fetch = answers(json(run, 201));

    expect(await saveActivity(null, body)).toEqual({
      kind: "ok",
      activity: run,
    });
    expect(fetch).toHaveBeenCalledWith("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  });

  it("replaces with PUT on the activity's encoded path when there is an id", async () => {
    const fetch = answers(json(run, 200));

    expect(await saveActivity("f/1", body)).toEqual({
      kind: "ok",
      activity: run,
    });
    expect(fetch).toHaveBeenCalledWith("/api/activities/f%2F1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  });

  it.each<ActivityProblemCode>([
    "nameEmpty",
    "nameTooLong",
    "timesOutOfRange",
    "durationNotAllowed",
    "categoryUnknown",
  ])("returns the broken rule %s from a 400", async (code) => {
    answers(json({ code }, 400));
    expect(await saveActivity(null, body)).toEqual({
      kind: "rule",
      problem: { code },
    });
  });

  it("returns notFound from a 404", async () => {
    answers(json({ code: "notFound" }, 404));
    expect(await saveActivity("gone", body)).toEqual({ kind: "notFound" });
  });

  it.each([
    ["a 400 invalid", () => Promise.resolve(json({ code: "invalid" }, 400))],
    [
      "a 400 with an anchor's code",
      () => Promise.resolve(json({ code: "noDays" }, 400)),
    ],
    ["a 400 with no code", () => Promise.resolve(json({}, 400))],
    ["a 400 that is not JSON", () => Promise.resolve(notJson(400))],
    ["a 409", () => Promise.resolve(json({ code: "nameEmpty" }, 409))],
    ["a 500", () => Promise.resolve(json({}, 500))],
    ["a network error", networkError],
    ["a 201 that is not JSON", () => Promise.resolve(notJson(201))],
    [
      "a 200 with a body of the wrong shape",
      () => Promise.resolve(json({ ...run, id: undefined }, 200)),
    ],
  ])("fails on %s", async (_name, response) => {
    answers(response);
    expect(await saveActivity("f1", body)).toEqual({ kind: "failed" });
  });
});

describe("deleteActivity", () => {
  it("deletes with DELETE on the activity's encoded path", async () => {
    const fetch = answers(new Response(null, { status: 204 }));

    expect(await deleteActivity("f/1")).toEqual({ kind: "ok" });
    expect(fetch).toHaveBeenCalledWith("/api/activities/f%2F1", {
      method: "DELETE",
    });
  });

  it("returns notFound from a 404", async () => {
    answers(json({ code: "notFound" }, 404));
    expect(await deleteActivity("gone")).toEqual({ kind: "notFound" });
  });

  it.each([
    ["a 500", () => Promise.resolve(json({}, 500))],
    ["a network error", networkError],
  ])("fails on %s", async (_name, response) => {
    answers(response);
    expect(await deleteActivity("f1")).toEqual({ kind: "failed" });
  });
});
