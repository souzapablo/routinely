import { describe, expect, it } from "vitest";
import type { Anchor } from "../../../shared/planner.ts";
import {
  type AnchorDraft,
  draftFromAnchor,
  draftToInput,
  formProblem,
  minutesFromTime,
  newDraft,
  timeFromMinutes,
} from "./form.ts";

const work: Anchor = {
  id: "work",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

describe("newDraft", () => {
  it("starts empty, Monday to Friday, 09:00 to 18:00", () => {
    expect(newDraft()).toEqual({
      name: "",
      days: [1, 2, 3, 4, 5],
      start: "09:00",
      end: "18:00",
    });
  });
});

describe("draftFromAnchor and draftToInput", () => {
  it("fills the draft from a stored anchor", () => {
    expect(draftFromAnchor({ ...work, start: 555, end: 1425 })).toEqual({
      name: "Work",
      days: [1, 2, 3, 4, 5],
      start: "09:15",
      end: "23:45",
    });
  });

  it("round-trips a stored anchor", () => {
    expect(draftToInput(draftFromAnchor(work))).toEqual({
      name: "Work",
      days: [1, 2, 3, 4, 5],
      start: 540,
      end: 1080,
    });
  });

  it("sends an empty time as null", () => {
    const input = draftToInput({ ...newDraft(), start: "", end: "" });
    expect(input.start).toBeNull();
    expect(input.end).toBeNull();
  });
});

describe("minutesFromTime and timeFromMinutes", () => {
  it("converts between HH:MM and minutes since midnight", () => {
    expect(minutesFromTime("00:00")).toBe(0);
    expect(minutesFromTime("09:10")).toBe(550);
    expect(minutesFromTime("23:45")).toBe(1425);
    expect(minutesFromTime("")).toBeNull();
    expect(timeFromMinutes(0)).toBe("00:00");
    expect(timeFromMinutes(555)).toBe("09:15");
    expect(timeFromMinutes(1425)).toBe("23:45");
  });
});

describe("formProblem", () => {
  it("refuses a time off the 15-minute steps", () => {
    expect(
      formProblem({ ...newDraft(), name: "Gym", start: "09:10" }, [], null),
    ).toEqual({ code: "timeStep" });
  });

  it("refuses empty times", () => {
    expect(
      formProblem({ ...newDraft(), name: "Gym", end: "" }, [], null),
    ).toEqual({ code: "timesMissing" });
  });

  it("does not count the edited anchor's own stored version", () => {
    expect(formProblem(draftFromAnchor(work), [work], "work")).toBeNull();
  });

  it("finds an overlap with another anchor", () => {
    const gym: AnchorDraft = {
      name: "Gym",
      days: [1],
      start: "17:00",
      end: "18:30",
    };
    expect(formProblem(gym, [work], null)).toEqual({
      code: "overlap",
      other: "Work",
      day: 1,
    });
  });

  it("finds an overlap when the edited anchor moves onto another", () => {
    const gym: Anchor = {
      id: "gym",
      name: "Gym",
      days: [1],
      start: 1080,
      end: 1170,
    };
    const moved = { ...draftFromAnchor(gym), start: "17:00" };
    expect(formProblem(moved, [work, gym], "gym")).toEqual({
      code: "overlap",
      other: "Work",
      day: 1,
    });
  });

  it("accepts a valid new draft", () => {
    expect(formProblem({ ...newDraft(), name: "Work" }, [], null)).toBeNull();
  });
});
