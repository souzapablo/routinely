import { describe, expect, it } from "vitest";
import type { PlannerData } from "../../../shared/planner.ts";
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
      { id: "sleep", name: "Sleep", days: [0, 6], start: 1380, end: 1440 },
    ],
    activities: [
      {
        id: "run",
        name: "Run",
        category: "movement",
        timesPerWeek: 3,
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
      { id: "p2", activityId: "groceries", week: WEEK, day: 0, start: 1140 },
    ],
    doneAnchors: [],
    donePlacementIds: [],
    ...overrides,
  };
}

describe("itemsForDay", () => {
  it("lists a day's items in start-time order", () => {
    const items = itemsForDay(data(), WEEK, 0);
    expect(items.map((i) => i.name)).toEqual([
      "Run",
      "Work",
      "Groceries",
      "Sleep",
    ]);
    expect(items).toEqual([
      {
        key: "placement:p1",
        kind: "placement",
        name: "Run",
        start: 420,
        end: 465,
        category: "movement",
        done: false,
      },
      {
        key: "anchor:work",
        kind: "anchor",
        name: "Work",
        start: 540,
        end: 1080,
        category: "anchor",
        done: false,
      },
      {
        key: "placement:p2",
        kind: "placement",
        name: "Groceries",
        start: 1140,
        end: 1200,
        category: "errands",
        done: false,
      },
      {
        key: "anchor:sleep",
        kind: "anchor",
        name: "Sleep",
        start: 1380,
        end: 1440,
        category: "anchor",
        done: false,
      },
    ]);
  });

  it("orders items with the same start by name", () => {
    const items = itemsForDay(
      data({
        anchors: [
          { id: "b", name: "Breakfast", days: [2], start: 480, end: 510 },
        ],
        placements: [
          { id: "p1", activityId: "groceries", week: WEEK, day: 2, start: 480 },
        ],
      }),
      WEEK,
      2,
    );
    expect(items.map((i) => i.name)).toEqual(["Breakfast", "Groceries"]);
  });

  it("marks an anchor done only for the recorded week and day", () => {
    const d = data({
      doneAnchors: [
        { anchorId: "work", week: WEEK, day: 0 },
        { anchorId: "work", week: OTHER_WEEK, day: 1 },
      ],
    });
    const done = (day: 0 | 1) =>
      itemsForDay(d, WEEK, day).find((i) => i.key === "anchor:work")?.done;
    expect(done(0)).toBe(true);
    expect(done(1)).toBe(false);
  });

  it("marks a placement done by its id", () => {
    const items = itemsForDay(data({ donePlacementIds: ["p2"] }), WEEK, 0);
    expect(items.find((i) => i.key === "placement:p2")?.done).toBe(true);
    expect(items.find((i) => i.key === "placement:p1")?.done).toBe(false);
  });

  it("leaves out placements of other weeks and other days", () => {
    const d = data({
      placements: [
        { id: "p1", activityId: "run", week: OTHER_WEEK, day: 0, start: 420 },
        { id: "p2", activityId: "run", week: WEEK, day: 1, start: 420 },
      ],
    });
    expect(itemsForDay(d, WEEK, 0).map((i) => i.key)).toEqual([
      "anchor:work",
      "anchor:sleep",
    ]);
  });

  it("skips a placement whose activity no longer exists", () => {
    const d = data({
      placements: [
        { id: "p9", activityId: "gone", week: WEEK, day: 0, start: 420 },
      ],
    });
    expect(itemsForDay(d, WEEK, 0).map((i) => i.key)).toEqual([
      "anchor:work",
      "anchor:sleep",
    ]);
  });

  it("gives an empty list for a day with nothing on it", () => {
    expect(itemsForDay(data(), WEEK, 5)).toEqual([]);
  });
});
