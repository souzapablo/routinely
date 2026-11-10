import { describe, expect, it } from "vitest";
import { compareActivities, compareAnchors, compareNames } from "./order.ts";
import type { Anchor, FlexibleActivity } from "./planner.ts";

function anchor(id: string, name: string, start: number): Anchor {
  return { id, name, days: [1], start, end: start + 60 };
}

function activity(id: string, name: string): FlexibleActivity {
  return { id, name, category: "rest", timesPerWeek: 1, duration: 30 };
}

describe("compareNames", () => {
  it("ignores ASCII letter case", () => {
    expect(compareNames("read", "Run")).toBeLessThan(0);
    expect(compareNames("Run", "read")).toBeGreaterThan(0);
    expect(compareNames("Run", "apple")).toBeGreaterThan(0);
    expect(compareNames("ana", "Ana")).toBe(0);
  });

  it("does not fold letters outside ASCII, so É sorts by its code unit", () => {
    expect(compareNames("É", "é")).toBeLessThan(0);
    expect(compareNames("Écrire", "zebra")).toBeGreaterThan(0);
  });
});

describe("compareActivities", () => {
  it("orders by name ignoring case, then by id", () => {
    const rows = [
      activity("2", "Run"),
      activity("b", "ana"),
      activity("1", "read"),
      activity("a", "Ana"),
      activity("3", "apple"),
    ];
    expect(rows.sort(compareActivities).map((a) => a.id)).toEqual([
      "a",
      "b",
      "3",
      "1",
      "2",
    ]);
  });
});

describe("compareAnchors", () => {
  it("puts the earlier start first whatever the name", () => {
    expect(
      compareAnchors(anchor("1", "zebra", 480), anchor("2", "apple", 540)),
    ).toBeLessThan(0);
  });

  it("orders anchors at the same start by name ignoring case, then by id", () => {
    const rows = [
      anchor("2", "Run", 540),
      anchor("b", "ana", 540),
      anchor("1", "read", 540),
      anchor("a", "Ana", 540),
    ];
    expect(rows.sort(compareAnchors).map((a) => a.id)).toEqual([
      "a",
      "b",
      "1",
      "2",
    ]);
  });
});
