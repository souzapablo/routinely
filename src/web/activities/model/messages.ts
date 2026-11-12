import {
  type ActivityProblemCode,
  MAX_TIMES,
  MIN_TIMES,
} from "../../../shared/activities.ts";
import { MAX_NAME } from "../../../shared/anchors.ts";

export type ActivityProblemMessage =
  | { key: "drawer.rules.nameEmpty"; values: Record<string, never> }
  | { key: "drawer.rules.nameTooLong"; values: { max: number } }
  | {
      key: "activities.rules.timesOutOfRange";
      values: { min: number; max: number };
    }
  | {
      key:
        | "activities.rules.durationNotAllowed"
        | "activities.rules.categoryUnknown";
      values: Record<string, never>;
    };

/** An i18n key and its values, for `t(message.key, message.values)`. */
export function activityProblemMessage(problem: {
  code: ActivityProblemCode;
}): ActivityProblemMessage {
  switch (problem.code) {
    case "nameEmpty":
      return { key: "drawer.rules.nameEmpty", values: {} };
    case "nameTooLong":
      return { key: "drawer.rules.nameTooLong", values: { max: MAX_NAME } };
    case "timesOutOfRange":
      return {
        key: "activities.rules.timesOutOfRange",
        values: { min: MIN_TIMES, max: MAX_TIMES },
      };
    default:
      return { key: `activities.rules.${problem.code}`, values: {} };
  }
}
