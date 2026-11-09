import { z } from "zod";
import type { Anchor, DayIndex, Minutes } from "./planner.ts";

export const MAX_NAME = 60;
export const STEP = 15;
/** 23:45, the last quarter hour of a day; no anchor ends at or after 24:00. */
export const LAST_START = 1425;

/**
 * The body of a create or replace. Only the shape is checked here; the
 * rules live in `anchorProblem`, so the drawer can report them one at a time.
 */
export const AnchorInput = z.object({
  name: z.string(),
  days: z.array(z.number().int().min(0).max(6)),
  start: z.number().int().nullable(),
  end: z.number().int().nullable(),
});

export type AnchorInput = z.infer<typeof AnchorInput>;

export type ProblemCode =
  | "nameEmpty"
  | "nameTooLong"
  | "noDays"
  | "timesMissing"
  | "timeStep"
  | "endBeforeStart";

export type AnchorProblem =
  { code: ProblemCode } | { code: "overlap"; other: string; day: DayIndex };

function isTimeOfDay(minutes: Minutes): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= 0 &&
    minutes <= LAST_START &&
    minutes % STEP === 0
  );
}

function sortedDays(days: number[]): DayIndex[] {
  return [...new Set(days)].sort((a, b) => a - b) as DayIndex[];
}

/** The first rule the anchor breaks, in the order the owner reads them. */
export function anchorProblem(
  input: AnchorInput,
  others: Anchor[],
): AnchorProblem | null {
  const name = input.name.trim();
  if (name === "") return { code: "nameEmpty" };
  if (name.length > MAX_NAME) return { code: "nameTooLong" };
  if (input.days.length === 0) return { code: "noDays" };

  const { start, end } = input;
  if (start === null || end === null) return { code: "timesMissing" };
  if (!isTimeOfDay(start) || !isTimeOfDay(end)) return { code: "timeStep" };
  if (end <= start) return { code: "endBeforeStart" };

  for (const day of sortedDays(input.days)) {
    const other = others.find(
      (o) => o.days.includes(day) && start < o.end && o.start < end,
    );
    if (other) return { code: "overlap", other: other.name, day };
  }
  return null;
}

/** The stored form of a valid anchor: a trimmed name, days unique and ascending. */
export function normalizeAnchor(input: AnchorInput): Omit<Anchor, "id"> {
  const { start, end } = input;
  if (start === null || end === null) {
    throw new Error(
      "normalizeAnchor needs an anchor that passed anchorProblem",
    );
  }
  return { name: input.name.trim(), days: sortedDays(input.days), start, end };
}
