import { z } from "zod";
import { MAX_NAME } from "./anchors.ts";
import type { Category, FlexibleActivity } from "./planner.ts";

export const MIN_TIMES = 1;
export const MAX_TIMES = 14;
export const DURATIONS = [15, 30, 45, 60, 90, 120, 180] as const;
export const CATEGORIES = [
  "movement",
  "home",
  "errands",
  "rest",
  "people",
] as const satisfies readonly Category[];

/**
 * The body of a create or replace. Only the shape is checked here; the
 * rules live in `activityProblem`, so the drawer can report them one at a time.
 */
export const ActivityInput = z.object({
  name: z.string(),
  category: z.string(),
  timesPerWeek: z.number(),
  duration: z.number(),
});

export type ActivityInput = z.infer<typeof ActivityInput>;

export type ActivityProblemCode =
  | "nameEmpty"
  | "nameTooLong"
  | "timesOutOfRange"
  | "durationNotAllowed"
  | "categoryUnknown";

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** The first rule the activity breaks, in the order the owner reads them. */
export function activityProblem(
  input: ActivityInput,
): { code: ActivityProblemCode } | null {
  const name = input.name.trim();
  if (name === "") return { code: "nameEmpty" };
  if (name.length > MAX_NAME) return { code: "nameTooLong" };

  const times = input.timesPerWeek;
  if (!Number.isInteger(times) || times < MIN_TIMES || times > MAX_TIMES) {
    return { code: "timesOutOfRange" };
  }
  if (!(DURATIONS as readonly number[]).includes(input.duration)) {
    return { code: "durationNotAllowed" };
  }
  if (!isCategory(input.category)) return { code: "categoryUnknown" };
  return null;
}

/** The stored form of a valid activity: a trimmed name. */
export function normalizeActivity(
  input: ActivityInput,
): Omit<FlexibleActivity, "id"> {
  if (!isCategory(input.category)) {
    throw new Error(
      "normalizeActivity needs an activity that passed activityProblem",
    );
  }
  return {
    name: input.name.trim(),
    category: input.category,
    timesPerWeek: input.timesPerWeek,
    duration: input.duration,
  };
}
