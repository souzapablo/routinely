import { describe, expect, it } from "vitest";
import {
  ActivityInput,
  activityProblem,
  CATEGORIES,
  DURATIONS,
  MAX_TIMES,
  MIN_TIMES,
  normalizeActivity,
} from "./activities.ts";

function input(overrides: Partial<ActivityInput> = {}): ActivityInput {
  return {
    name: "Run 5 km",
    category: "movement",
    timesPerWeek: 2,
    duration: 45,
    ...overrides,
  };
}

describe("activity rule constants", () => {
  it("allow 1 to 14 times, seven durations and five categories", () => {
    expect(MIN_TIMES).toBe(1);
    expect(MAX_TIMES).toBe(14);
    expect(DURATIONS).toEqual([15, 30, 45, 60, 90, 120, 180]);
    expect(CATEGORIES).toEqual([
      "movement",
      "home",
      "errands",
      "rest",
      "people",
    ]);
  });
});

describe("activityProblem", () => {
  it("accepts a valid activity", () => {
    expect(activityProblem(input())).toBeNull();
  });

  it.each([
    ["an empty name", ""],
    ["a whitespace-only name", "   "],
  ])("refuses %s with nameEmpty", (_label, name) => {
    expect(activityProblem(input({ name }))).toEqual({ code: "nameEmpty" });
  });

  it("accepts a trimmed name of 60 characters and refuses 61 with nameTooLong", () => {
    expect(activityProblem(input({ name: ` ${"a".repeat(60)} ` }))).toBeNull();
    expect(activityProblem(input({ name: "a".repeat(61) }))).toEqual({
      code: "nameTooLong",
    });
  });

  it.each([1, 14])("accepts %s times a week", (timesPerWeek) => {
    expect(activityProblem(input({ timesPerWeek }))).toBeNull();
  });

  it.each([0, 15, 1.5])(
    "refuses %s times a week with timesOutOfRange",
    (timesPerWeek) => {
      expect(activityProblem(input({ timesPerWeek }))).toEqual({
        code: "timesOutOfRange",
      });
    },
  );

  it.each([15, 30, 45, 60, 90, 120, 180])(
    "accepts a duration of %s minutes",
    (duration) => {
      expect(activityProblem(input({ duration }))).toBeNull();
    },
  );

  it.each([20, 0])(
    "refuses a duration of %s minutes with durationNotAllowed",
    (duration) => {
      expect(activityProblem(input({ duration }))).toEqual({
        code: "durationNotAllowed",
      });
    },
  );

  it.each(["movement", "home", "errands", "rest", "people"])(
    "accepts the category %s",
    (category) => {
      expect(activityProblem(input({ category }))).toBeNull();
    },
  );

  it("refuses an unknown category with categoryUnknown", () => {
    expect(activityProblem(input({ category: "sport" }))).toEqual({
      code: "categoryUnknown",
    });
  });

  it("reports only the first broken rule, in the order name, times, duration, category", () => {
    const allBroken = {
      name: "",
      timesPerWeek: 0,
      duration: 20,
      category: "sport",
    };
    expect(activityProblem(allBroken)).toEqual({ code: "nameEmpty" });
    expect(activityProblem({ ...allBroken, name: "Run" })).toEqual({
      code: "timesOutOfRange",
    });
    expect(
      activityProblem({ ...allBroken, name: "Run", timesPerWeek: 2 }),
    ).toEqual({ code: "durationNotAllowed" });
    expect(
      activityProblem({
        ...allBroken,
        name: "Run",
        timesPerWeek: 2,
        duration: 45,
      }),
    ).toEqual({ code: "categoryUnknown" });
  });
});

describe("normalizeActivity", () => {
  it("trims the name and keeps the other fields", () => {
    expect(normalizeActivity(input({ name: "  Run 5 km  " }))).toEqual({
      name: "Run 5 km",
      category: "movement",
      timesPerWeek: 2,
      duration: 45,
    });
  });
});

describe("ActivityInput", () => {
  const valid = {
    name: "Run 5 km",
    category: "movement",
    timesPerWeek: 2,
    duration: 45,
  };

  it("accepts a well-formed body", () => {
    expect(ActivityInput.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["a missing name", { category: "movement", timesPerWeek: 2, duration: 45 }],
    ["times per week given as text", { ...valid, timesPerWeek: "2" }],
    ["a numeric category", { ...valid, category: 1 }],
  ])("rejects %s", (_label, body) => {
    expect(ActivityInput.safeParse(body).success).toBe(false);
  });
});
