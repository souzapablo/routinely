import type { Category } from "../../../shared/planner.ts";
import {
  type DurationParts,
  durationParts,
} from "../../planner/model/format.ts";
import type { ActivityDraft } from "./form.ts";

export type ActivityPreviewPart =
  | { key: "activities.preview.name"; values: { name: string } }
  | { key: "activities.preview.untitled"; values: Record<string, never> }
  | { key: "activities.preview.times"; values: { times: number } }
  | { key: "activities.preview.each"; values: { duration: string } }
  | { key: `categories.${Category}`; values: Record<string, never> };

/**
 * The preview line's parts, in order; the drawer joins them with " · ".
 * The duration is itself a translated text, so the caller renders it.
 */
export function activityPreviewParts(
  draft: ActivityDraft,
  renderDuration: (parts: DurationParts) => string,
): ActivityPreviewPart[] {
  const name = draft.name.trim();
  return [
    name === ""
      ? { key: "activities.preview.untitled", values: {} }
      : { key: "activities.preview.name", values: { name } },
    { key: "activities.preview.times", values: { times: draft.timesPerWeek } },
    {
      key: "activities.preview.each",
      values: { duration: renderDuration(durationParts(draft.duration)) },
    },
    { key: `categories.${draft.category}`, values: {} },
  ];
}
