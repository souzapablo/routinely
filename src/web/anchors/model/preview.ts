import type { DayIndex } from "../../../shared/planner.ts";
import {
  formatTimeRange,
  formatWeekdayIndex,
} from "../../planner/model/format.ts";
import { type AnchorDraft, minutesFromTime } from "./form.ts";

export type DaysLabel =
  | { key: "anchors.preview.everyDay"; values: Record<string, never> }
  | { key: "anchors.preview.weekdays"; values: { from: string; to: string } }
  | { key: "anchors.preview.weekends"; values: Record<string, never> }
  | { key: "anchors.preview.list"; values: { days: string } };

export type PreviewPart =
  | DaysLabel
  | { key: "anchors.preview.name"; values: { name: string } }
  | { key: "anchors.preview.untitled"; values: Record<string, never> }
  | { key: "anchors.preview.time"; values: { range: string } }
  | { key: "anchors.preview.everyWeek"; values: Record<string, never> };

const sameDays = (a: DayIndex[], b: DayIndex[]) =>
  a.length === b.length && a.every((day, i) => day === b[i]);

export function daysLabel(days: DayIndex[], lang: string): DaysLabel {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const short = (day: DayIndex) => formatWeekdayIndex(day, lang, "short");
  if (sorted.length === 7) {
    return { key: "anchors.preview.everyDay", values: {} };
  }
  if (sameDays(sorted, [1, 2, 3, 4, 5])) {
    return {
      key: "anchors.preview.weekdays",
      values: { from: short(1), to: short(5) },
    };
  }
  if (sameDays(sorted, [0, 6])) {
    return { key: "anchors.preview.weekends", values: {} };
  }
  return {
    key: "anchors.preview.list",
    values: { days: sorted.map(short).join(", ") },
  };
}

/** The preview line's parts, in order; the drawer joins them with " · ". */
export function previewParts(draft: AnchorDraft, lang: string): PreviewPart[] {
  const name = draft.name.trim();
  const parts: PreviewPart[] = [
    name === ""
      ? { key: "anchors.preview.untitled", values: {} }
      : { key: "anchors.preview.name", values: { name } },
    daysLabel(draft.days, lang),
  ];
  const start = minutesFromTime(draft.start);
  const end = minutesFromTime(draft.end);
  if (start !== null && end !== null && end > start) {
    parts.push({
      key: "anchors.preview.time",
      values: { range: formatTimeRange(start, end, lang) },
    });
  }
  parts.push({ key: "anchors.preview.everyWeek", values: {} });
  return parts;
}
