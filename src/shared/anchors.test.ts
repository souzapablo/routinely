import { describe, expect, it } from "vitest";
import {
  AnchorInput,
  anchorProblem,
  LAST_START,
  MAX_NAME,
  normalizeAnchor,
  STEP,
} from "./anchors.ts";
import type { Anchor } from "./planner.ts";

const work: Anchor = {
  id: "work",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

function input(overrides: Partial<AnchorInput> = {}): AnchorInput {
  return { name: "Gym", days: [1], start: 1080, end: 1140, ...overrides };
}

describe("anchor rule constants", () => {
  it("are a 60-character name, 15-minute steps and a last time of 23:45", () => {
    expect(MAX_NAME).toBe(60);
    expect(STEP).toBe(15);
    expect(LAST_START).toBe(1425);
  });
});

describe("anchorProblem", () => {
  it("accepts a valid anchor with nothing else stored", () => {
    expect(anchorProblem(input(), [])).toBeNull();
  });

  it("refuses an empty name with nameEmpty", () => {
    expect(anchorProblem(input({ name: "" }), [])).toEqual({
      code: "nameEmpty",
    });
  });

  it("refuses a whitespace-only name with nameEmpty", () => {
    expect(anchorProblem(input({ name: "   \t " }), [])).toEqual({
      code: "nameEmpty",
    });
  });

  it("accepts a trimmed name of 60 characters and refuses 61 with nameTooLong", () => {
    const sixty = "a".repeat(60);

    expect(anchorProblem(input({ name: `  ${sixty}  ` }), [])).toBeNull();
    expect(anchorProblem(input({ name: `${sixty}b` }), [])).toEqual({
      code: "nameTooLong",
    });
  });

  it("refuses no days with noDays", () => {
    expect(anchorProblem(input({ days: [] }), [])).toEqual({
      code: "noDays",
    });
  });

  it.each([
    { start: null, end: 1140 },
    { start: 1080, end: null },
    { start: null, end: null },
  ])("refuses a missing time with timesMissing (%o)", (times) => {
    expect(anchorProblem(input(times), [])).toEqual({ code: "timesMissing" });
  });

  it("accepts 9:00 and 9:15 and refuses 9:05 with timeStep", () => {
    expect(anchorProblem(input({ start: 540, end: 555 }), [])).toBeNull();
    expect(anchorProblem(input({ start: 540, end: 545 }), [])).toEqual({
      code: "timeStep",
    });
    expect(anchorProblem(input({ start: 545, end: 600 }), [])).toEqual({
      code: "timeStep",
    });
  });

  it("accepts an end at 23:45 and refuses an end at 24:00", () => {
    expect(anchorProblem(input({ start: 1380, end: 1425 }), [])).toBeNull();
    expect(anchorProblem(input({ start: 1380, end: 1440 }), [])).toEqual({
      code: "timeStep",
    });
  });

  it("accepts a start at 00:00 and refuses a start before it", () => {
    expect(anchorProblem(input({ start: 0, end: 60 }), [])).toBeNull();
    expect(anchorProblem(input({ start: -15, end: 60 }), [])).toEqual({
      code: "timeStep",
    });
  });

  it("refuses an end equal to the start with endBeforeStart", () => {
    expect(anchorProblem(input({ start: 600, end: 600 }), [])).toEqual({
      code: "endBeforeStart",
    });
  });

  it("refuses an end before the start with endBeforeStart", () => {
    expect(anchorProblem(input({ start: 600, end: 540 }), [])).toEqual({
      code: "endBeforeStart",
    });
  });

  it("names the other anchor and the shared day on an overlap", () => {
    const gym = input({ days: [1], start: 1020, end: 1110 });

    expect(anchorProblem(gym, [work])).toEqual({
      code: "overlap",
      other: "Work",
      day: 1,
    });
  });

  it("reports the first shared day in week order, Sunday first", () => {
    const sundayToo: Anchor = { ...work, days: [0, 3, 6] };
    const draft = input({ days: [6, 3, 0], start: 600, end: 660 });

    expect(anchorProblem(draft, [sundayToo])).toEqual({
      code: "overlap",
      other: "Work",
      day: 0,
    });
  });

  it("reports the earliest shared day even when a later-listed anchor holds it", () => {
    const wed: Anchor = { ...work, id: "wed", name: "Wed class", days: [3] };
    const mon: Anchor = { ...work, id: "mon", name: "Mon class", days: [1] };
    const draft = input({ days: [1, 3], start: 600, end: 660 });

    expect(anchorProblem(draft, [wed, mon])).toEqual({
      code: "overlap",
      other: "Mon class",
      day: 1,
    });
  });

  it("accepts anchors that only touch", () => {
    const before = input({ days: [1], start: 480, end: 540 });
    const after = input({ days: [1], start: 1080, end: 1140 });

    expect(anchorProblem(before, [work])).toBeNull();
    expect(anchorProblem(after, [work])).toBeNull();
  });

  it("accepts the same hours on a day the other anchor does not use", () => {
    const saturday = input({ days: [6], start: 540, end: 1080 });

    expect(anchorProblem(saturday, [work])).toBeNull();
  });

  it("returns the first broken rule in order when several are broken", () => {
    const allBroken = input({ name: " ", days: [], start: null, end: null });
    expect(anchorProblem(allBroken, [work])).toEqual({ code: "nameEmpty" });

    const longNoDays = input({ name: "a".repeat(61), days: [], start: null });
    expect(anchorProblem(longNoDays, [work])).toEqual({ code: "nameTooLong" });

    const noDaysNoTimes = input({ days: [], start: null });
    expect(anchorProblem(noDaysNoTimes, [work])).toEqual({ code: "noDays" });

    const missingAndOffStep = input({ start: null, end: 545 });
    expect(anchorProblem(missingAndOffStep, [work])).toEqual({
      code: "timesMissing",
    });

    const offStepAndBackwards = input({ start: 600, end: 545 });
    expect(anchorProblem(offStepAndBackwards, [work])).toEqual({
      code: "timeStep",
    });

    const backwardsInsideWork = input({ start: 660, end: 600 });
    expect(anchorProblem(backwardsInsideWork, [work])).toEqual({
      code: "endBeforeStart",
    });
  });
});

describe("normalizeAnchor", () => {
  it("trims the name and returns days unique and ascending", () => {
    expect(
      normalizeAnchor({
        name: "  Work  ",
        days: [5, 1, 1, 3],
        start: 540,
        end: 1080,
      }),
    ).toEqual({ name: "Work", days: [1, 3, 5], start: 540, end: 1080 });
  });
});

describe("AnchorInput", () => {
  const valid = { name: "Work", days: [1, 2], start: 540, end: 1080 };

  it("accepts a well-formed body, null times included", () => {
    expect(AnchorInput.safeParse(valid).success).toBe(true);
    expect(
      AnchorInput.safeParse({ ...valid, start: null, end: null }).success,
    ).toBe(true);
  });

  it.each([
    ["a weekday 7", { ...valid, days: [1, 7] }],
    ["a negative weekday", { ...valid, days: [-1] }],
    ["a non-integer weekday", { ...valid, days: [1.5] }],
    ["a non-integer time", { ...valid, start: 540.5 }],
    ["a time given as text", { ...valid, end: "18:00" }],
    ["a missing name", { days: [1], start: 540, end: 1080 }],
    ["missing days", { name: "Work", start: 540, end: 1080 }],
  ])("rejects %s", (_label, body) => {
    expect(AnchorInput.safeParse(body).success).toBe(false);
  });
});
