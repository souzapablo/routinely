import {
  anchorProblem,
  type AnchorInput,
  type AnchorProblem,
} from "../../../shared/anchors.ts";
import type { Anchor, DayIndex, Minutes } from "../../../shared/planner.ts";

/** The drawer's values; times are "HH:MM", or "" when the input is cleared. */
export interface AnchorDraft {
  name: string;
  days: DayIndex[];
  start: string;
  end: string;
}

export function newDraft(): AnchorDraft {
  return { name: "", days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00" };
}

export function minutesFromTime(time: string): Minutes | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function timeFromMinutes(minutes: Minutes): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function draftFromAnchor(anchor: Anchor): AnchorDraft {
  return {
    name: anchor.name,
    days: [...anchor.days],
    start: timeFromMinutes(anchor.start),
    end: timeFromMinutes(anchor.end),
  };
}

export function draftToInput(draft: AnchorDraft): AnchorInput {
  return {
    name: draft.name,
    days: [...draft.days],
    start: minutesFromTime(draft.start),
    end: minutesFromTime(draft.end),
  };
}

/** The rule the draft breaks, ignoring the stored version of the anchor being edited. */
export function formProblem(
  draft: AnchorDraft,
  anchors: Anchor[],
  editingId: string | null,
): AnchorProblem | null {
  const others = anchors.filter((a) => a.id !== editingId);
  return anchorProblem(draftToInput(draft), others);
}
