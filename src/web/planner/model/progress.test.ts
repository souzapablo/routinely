import { describe, expect, it } from "vitest";
import type { PlannerData } from "../../../shared/planner.ts";
import { daysShowedUp, todaySummary, weekProgress } from "./progress.ts";
import { itemsForDay } from "./schedule.ts";

const WEEK = "2026-11-02";
const OTHER_WEEK = "2026-11-09";

function data(overrides: Partial<PlannerData> = {}): PlannerData {
  return {
    anchors: [
      {
        id: "work",
        name: "Work",
        days: [0, 1, 2, 3, 4],
        start: 540,
        end: 1080,
      },
      { id: "gym", name: "Gym", days: [5], start: 600, end: 660 },
    ],
    activities: [
      {
        id: "run",
        name: "Run",
        category: "movement",
        timesPerWeek: 2,
        duration: 45,
      },
      {
        id: "groceries",
        name: "Groceries",
        category: "errands",
        timesPerWeek: 1,
        duration: 60,
      },
    ],
    placements: [
      { id: "p1", activityId: "run", week: WEEK, day: 0, start: 420 },
      { id: "p2", activityId: "run", week: WEEK, day: 2, start: 420 },
      { id: "p3", activityId: "run", week: WEEK, day: 4, start: 420 },
      { id: "p4", activityId: "groceries", week: WEEK, day: 6, start: 600 },
    ],
    doneAnchors: [],
    donePlacementIds: [],
    ...overrides,
  };
}

describe("todaySummary", () => {
  it("counts today's done items", () => {
    const d = data({
      doneAnchors: [{ anchorId: "work", week: WEEK, day: 0 }],
    });
    expect(todaySummary(itemsForDay(d, WEEK, 0))).toEqual({
      done: 1,
      total: 2,
    });
  });

  it("gives zero of zero for a day with no items", () => {
    expect(todaySummary([])).toEqual({ done: 0, total: 0 });
  });
});

describe("daysShowedUp", () => {
  it("counts days you showed up", () => {
    const d = data({
      doneAnchors: [
        { anchorId: "work", week: WEEK, day: 1 },
        { anchorId: "work", week: OTHER_WEEK, day: 3 },
      ],
      donePlacementIds: ["p1", "p4"],
    });
    expect(daysShowedUp(d, WEEK)).toEqual({
      days: [true, true, false, false, false, false, true],
      count: 3,
    });
  });

  it("counts a day once however many items are done on it", () => {
    const d = data({
      doneAnchors: [{ anchorId: "work", week: WEEK, day: 0 }],
      donePlacementIds: ["p1"],
    });
    expect(daysShowedUp(d, WEEK).count).toBe(1);
  });
});

describe("weekProgress", () => {
  it("sums the week's done and total", () => {
    const d = data({
      doneAnchors: [
        { anchorId: "work", week: WEEK, day: 0 },
        { anchorId: "gym", week: WEEK, day: 5 },
        { anchorId: "work", week: OTHER_WEEK, day: 1 },
      ],
      donePlacementIds: ["p4"],
    });
    // Anchors 5 + 1 repeat days, activities 2 + 1 times per week.
    expect(weekProgress(d, WEEK)).toEqual({ done: 3, total: 9 });
  });

  it("caps done placements at the activity's times per week", () => {
    const d = data({ donePlacementIds: ["p1", "p2", "p3"] });
    expect(weekProgress(d, WEEK)).toEqual({ done: 2, total: 9 });
  });

  it("ignores done placements of other weeks", () => {
    const d = data({
      placements: [
        { id: "p9", activityId: "run", week: OTHER_WEEK, day: 0, start: 420 },
      ],
      donePlacementIds: ["p9"],
    });
    expect(weekProgress(d, WEEK).done).toBe(0);
  });

  it("ignores a done record for a day the anchor does not repeat on", () => {
    const d = data({
      doneAnchors: [{ anchorId: "gym", week: WEEK, day: 0 }],
    });
    expect(weekProgress(d, WEEK).done).toBe(0);
  });
});

describe("a week with nothing done", () => {
  it("gives 0 everywhere, never negative", () => {
    const d = data();
    for (const day of [0, 1, 2, 3, 4, 5, 6] as const) {
      expect(todaySummary(itemsForDay(d, WEEK, day)).done).toBe(0);
    }
    expect(daysShowedUp(d, WEEK)).toEqual({
      days: [false, false, false, false, false, false, false],
      count: 0,
    });
    expect(weekProgress(d, WEEK)).toEqual({ done: 0, total: 9 });
  });

  it("gives zero of zero for empty planner data", () => {
    const empty: PlannerData = {
      anchors: [],
      activities: [],
      placements: [],
      doneAnchors: [],
      donePlacementIds: [],
    };
    expect(daysShowedUp(empty, WEEK).count).toBe(0);
    expect(weekProgress(empty, WEEK)).toEqual({ done: 0, total: 0 });
  });
});
