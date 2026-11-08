import { describe, expect, it } from "vitest";
import { exampleWeek } from "./exampleWeek.ts";

const SUNDAY = new Date(2026, 10, 8, 10, 0);
const SATURDAY = new Date(2026, 10, 14, 10, 0);
const NEXT_SUNDAY = new Date(2026, 10, 15, 10, 0);

describe("exampleWeek", () => {
  it("holds the prototype's anchors", () => {
    expect(exampleWeek(SUNDAY).anchors).toEqual([
      {
        id: "work",
        name: "Work",
        days: [1, 2, 3, 4, 5],
        start: 9 * 60,
        end: 18 * 60,
      },
      {
        id: "gym",
        name: "Gym class",
        days: [2, 4],
        start: 7 * 60,
        end: 8 * 60,
      },
      {
        id: "therapy",
        name: "Therapy session",
        days: [3],
        start: 19 * 60,
        end: 20 * 60,
      },
    ]);
  });

  it("holds the prototype's flexible activities", () => {
    expect(exampleWeek(SUNDAY).activities).toEqual([
      {
        id: "run",
        name: "Run 5 km",
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
        id: "grocery",
        name: "Grocery shopping",
        category: "errands",
        timesPerWeek: 1,
        duration: 60,
      },
      {
        id: "call",
        name: "Call parents",
        category: "people",
        timesPerWeek: 1,
        duration: 30,
      },
      {
        id: "clean",
        name: "Clean apartment",
        category: "home",
        timesPerWeek: 1,
        duration: 90,
      },
    ]);
  });

  it("places Run Mon 19:00, Read Tue and Thu 21:30, Call parents Sat 11:00 in the current week", () => {
    const placements = exampleWeek(SUNDAY).placements.map(
      ({ activityId, week, day, start }) => ({
        activityId,
        week,
        day,
        start,
      }),
    );
    expect(placements).toEqual([
      { activityId: "run", week: "2026-11-08", day: 1, start: 19 * 60 },
      { activityId: "read", week: "2026-11-08", day: 2, start: 21 * 60 + 30 },
      { activityId: "read", week: "2026-11-08", day: 4, start: 21 * 60 + 30 },
      { activityId: "call", week: "2026-11-08", day: 6, start: 11 * 60 },
    ]);
  });

  it("dates placements to the week of now", () => {
    const weeks = exampleWeek(NEXT_SUNDAY).placements.map((p) => p.week);
    expect(weeks).toEqual([
      "2026-11-15",
      "2026-11-15",
      "2026-11-15",
      "2026-11-15",
    ]);
  });

  it("on Saturday marks every Sun–Fri item done except Thursday's Gym class", () => {
    const data = exampleWeek(SATURDAY);
    const done = data.doneAnchors
      .map((d) => `${d.anchorId}:${d.week}:${d.day}`)
      .sort();
    expect(done).toEqual(
      [
        "work:2026-11-08:1",
        "work:2026-11-08:2",
        "work:2026-11-08:3",
        "work:2026-11-08:4",
        "work:2026-11-08:5",
        "gym:2026-11-08:2",
        "therapy:2026-11-08:3",
      ].sort(),
    );
    expect([...data.donePlacementIds].sort()).toEqual(
      ["read-thu", "read-tue", "run-mon"].sort(),
    );
  });

  it("on Sunday marks nothing done", () => {
    const data = exampleWeek(SUNDAY);
    expect(data.doneAnchors).toEqual([]);
    expect(data.donePlacementIds).toEqual([]);
  });
});
