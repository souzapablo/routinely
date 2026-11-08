import { describe, expect, it } from "vitest";
import type { PlannerData } from "../../../shared/planner.ts";
import { trayItems, trayLeft } from "./tray.ts";

const WEEK = "2026-11-02";
const OTHER_WEEK = "2026-11-09";

function data(overrides: Partial<PlannerData> = {}): PlannerData {
  return {
    anchors: [],
    activities: [
      {
        id: "run",
        name: "Run",
        category: "movement",
        timesPerWeek: 2,
        duration: 45,
      },
      {
        id: "read",
        name: "Read",
        category: "rest",
        timesPerWeek: 3,
        duration: 30,
      },
      {
        id: "clean",
        name: "Clean",
        category: "home",
        timesPerWeek: 1,
        duration: 90,
      },
    ],
    placements: [],
    doneAnchors: [],
    donePlacementIds: [],
    ...overrides,
  };
}

describe("trayLeft", () => {
  it("counts times left to place", () => {
    const d = data({
      placements: [
        { id: "r1", activityId: "read", week: WEEK, day: 1, start: 1290 },
        { id: "x1", activityId: "read", week: OTHER_WEEK, day: 1, start: 1290 },
      ],
    });
    // Run 2 - 0, Read 3 - 1 (other week ignored), Clean 1 - 0.
    expect(trayLeft(trayItems(d, WEEK))).toBe(5);
  });

  it("counts an over-placed activity as 0, not negative", () => {
    const d = data({
      placements: [
        { id: "c1", activityId: "clean", week: WEEK, day: 0, start: 600 },
        { id: "c2", activityId: "clean", week: WEEK, day: 1, start: 600 },
        { id: "c3", activityId: "clean", week: WEEK, day: 2, start: 600 },
      ],
    });
    // Run 2, Read 3, Clean 1 - 3 → 0.
    expect(trayLeft(trayItems(d, WEEK))).toBe(5);
  });

  it("shows zero left for no activities", () => {
    const d = data({ activities: [] });
    expect(trayItems(d, WEEK)).toEqual([]);
    expect(trayLeft(trayItems(d, WEEK))).toBe(0);
  });
});

describe("trayItems", () => {
  it("builds pips done then placed then open", () => {
    const d = data({
      placements: [
        { id: "r1", activityId: "read", week: WEEK, day: 1, start: 1290 },
        { id: "r2", activityId: "read", week: WEEK, day: 3, start: 1290 },
      ],
      donePlacementIds: ["r2"],
    });
    const read = trayItems(d, WEEK).find((i) => i.activity.id === "read");
    expect(read).toMatchObject({ placed: 2, done: 1, state: "open" });
    expect(read?.pips).toEqual(["done", "placed", "open"]);
  });

  it("draws one pip per time per week when over-placed", () => {
    const d = data({
      placements: [
        { id: "c1", activityId: "clean", week: WEEK, day: 0, start: 600 },
        { id: "c2", activityId: "clean", week: WEEK, day: 1, start: 600 },
      ],
      donePlacementIds: ["c1", "c2"],
    });
    const clean = trayItems(d, WEEK).find((i) => i.activity.id === "clean");
    expect(clean?.pips).toEqual(["done"]);
  });

  it("marks fully placed and fully done activities", () => {
    const d = data({
      placements: [
        { id: "u1", activityId: "run", week: WEEK, day: 0, start: 1140 },
        { id: "u2", activityId: "run", week: WEEK, day: 2, start: 1140 },
        { id: "c1", activityId: "clean", week: WEEK, day: 5, start: 600 },
        { id: "r1", activityId: "read", week: WEEK, day: 1, start: 1290 },
      ],
      donePlacementIds: ["u1", "c1", "r1"],
    });
    const items = trayItems(d, WEEK);
    expect(items.map((i) => [i.activity.id, i.state])).toEqual([
      ["run", "allPlaced"],
      ["read", "open"],
      ["clean", "allDone"],
    ]);
    expect(items[0]).toMatchObject({ placed: 2, done: 1 });
    expect(items[0]?.pips).toEqual(["done", "placed"]);
  });

  it("lists every activity in data order with nothing placed", () => {
    const items = trayItems(data(), WEEK);
    expect(items.map((i) => i.activity.id)).toEqual(["run", "read", "clean"]);
    expect(items[1]).toMatchObject({ placed: 0, done: 0, state: "open" });
    expect(items[1]?.pips).toEqual(["open", "open", "open"]);
  });
});
