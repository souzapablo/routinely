import { describe, expect, it } from "vitest";
import type { FlexibleActivity } from "../../../shared/planner.ts";
import {
  type ActivityDraft,
  activityDraftToInput,
  activityFormProblem,
  canStep,
  draftFromActivity,
  newActivityDraft,
  stepTimes,
} from "./form.ts";

const run: FlexibleActivity = {
  id: "f1",
  name: "Run 5 km",
  category: "movement",
  timesPerWeek: 2,
  duration: 45,
};

const draft = (overrides: Partial<ActivityDraft> = {}): ActivityDraft => ({
  name: "Read",
  timesPerWeek: 3,
  duration: 30,
  category: "rest",
  ...overrides,
});

describe("newActivityDraft", () => {
  it("starts with no name, once a week, 30 minutes, Movement", () => {
    expect(newActivityDraft()).toEqual({
      name: "",
      timesPerWeek: 1,
      duration: 30,
      category: "movement",
    });
  });
});

describe("draftFromActivity and activityDraftToInput", () => {
  it("copies every field of a stored activity", () => {
    expect(
      draftFromActivity({
        id: "f2",
        name: "Groceries",
        category: "errands",
        timesPerWeek: 14,
        duration: 180,
      }),
    ).toEqual({
      name: "Groceries",
      timesPerWeek: 14,
      duration: 180,
      category: "errands",
    });
  });

  it("sends the draft's values as the request body, name untrimmed", () => {
    expect(activityDraftToInput(draft({ name: "  Read  " }))).toEqual({
      name: "  Read  ",
      timesPerWeek: 3,
      duration: 30,
      category: "rest",
    });
  });

  it("round-trips a stored activity", () => {
    expect(activityDraftToInput(draftFromActivity(run))).toEqual({
      name: "Run 5 km",
      timesPerWeek: 2,
      duration: 45,
      category: "movement",
    });
  });
});

describe("stepTimes", () => {
  it("goes from 1 to 2 with + and from 2 to 1 with −", () => {
    expect(stepTimes(draft({ timesPerWeek: 1 }), 1).timesPerWeek).toBe(2);
    expect(stepTimes(draft({ timesPerWeek: 2 }), -1).timesPerWeek).toBe(1);
  });

  it("stays at 1 with − and at 14 with +", () => {
    expect(stepTimes(draft({ timesPerWeek: 1 }), -1).timesPerWeek).toBe(1);
    expect(stepTimes(draft({ timesPerWeek: 14 }), 1).timesPerWeek).toBe(14);
  });

  it("keeps the other fields", () => {
    expect(stepTimes(draft({ timesPerWeek: 3 }), 1)).toEqual(
      draft({ timesPerWeek: 4 }),
    );
  });
});

describe("canStep", () => {
  it("can't go down at 1", () => {
    expect(canStep(draft({ timesPerWeek: 1 }))).toEqual({
      down: false,
      up: true,
    });
  });

  it("can't go up at 14", () => {
    expect(canStep(draft({ timesPerWeek: 14 }))).toEqual({
      down: true,
      up: false,
    });
  });

  it("goes both ways in between", () => {
    expect(canStep(draft({ timesPerWeek: 7 }))).toEqual({
      down: true,
      up: true,
    });
  });
});

describe("activityFormProblem", () => {
  it("gives nameEmpty for an empty name", () => {
    expect(activityFormProblem(draft({ name: "" }))).toEqual({
      code: "nameEmpty",
    });
  });

  it("gives nameEmpty for a name of spaces", () => {
    expect(activityFormProblem(draft({ name: "   " }))).toEqual({
      code: "nameEmpty",
    });
  });

  it("gives nothing for a valid draft", () => {
    expect(activityFormProblem(draft())).toBeNull();
  });
});
