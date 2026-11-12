import {
  activityProblem,
  MAX_TIMES,
  MIN_TIMES,
  type ActivityInput,
  type ActivityProblemCode,
} from "../../../shared/activities.ts";
import type {
  Category,
  FlexibleActivity,
  Minutes,
} from "../../../shared/planner.ts";

export interface ActivityDraft {
  name: string;
  timesPerWeek: number;
  duration: Minutes;
  category: Category;
}

export function newActivityDraft(): ActivityDraft {
  return { name: "", timesPerWeek: 1, duration: 30, category: "movement" };
}

export function draftFromActivity(activity: FlexibleActivity): ActivityDraft {
  return {
    name: activity.name,
    timesPerWeek: activity.timesPerWeek,
    duration: activity.duration,
    category: activity.category,
  };
}

export function activityDraftToInput(draft: ActivityDraft): ActivityInput {
  return {
    name: draft.name,
    timesPerWeek: draft.timesPerWeek,
    duration: draft.duration,
    category: draft.category,
  };
}

export function activityFormProblem(
  draft: ActivityDraft,
): { code: ActivityProblemCode } | null {
  return activityProblem(activityDraftToInput(draft));
}

export function stepTimes(draft: ActivityDraft, by: 1 | -1): ActivityDraft {
  const times = Math.min(
    MAX_TIMES,
    Math.max(MIN_TIMES, draft.timesPerWeek + by),
  );
  return { ...draft, timesPerWeek: times };
}

export function canStep(draft: ActivityDraft): { down: boolean; up: boolean } {
  return {
    down: draft.timesPerWeek > MIN_TIMES,
    up: draft.timesPerWeek < MAX_TIMES,
  };
}
