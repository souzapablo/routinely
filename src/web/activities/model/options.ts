import { CATEGORIES, DURATIONS } from "../../../shared/activities.ts";
import type { Category, Minutes } from "../../../shared/planner.ts";
import {
  type DurationParts,
  durationParts,
} from "../../planner/model/format.ts";

export type DurationOption = DurationParts & { minutes: Minutes };

export interface CategoryOption {
  category: Category;
  key: `categories.${Category}`;
}

export function durationOptions(): DurationOption[] {
  return DURATIONS.map((minutes) => ({ minutes, ...durationParts(minutes) }));
}

export function categoryOptions(): CategoryOption[] {
  return CATEGORIES.map((category) => ({
    category,
    key: `categories.${category}`,
  }));
}
