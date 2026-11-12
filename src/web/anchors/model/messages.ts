import { type AnchorProblem, MAX_NAME, STEP } from "../../../shared/anchors.ts";
import { formatTime, formatWeekdayIndex } from "../../planner/model/format.ts";

export type ProblemMessage =
  | { key: "drawer.rules.nameEmpty"; values: Record<string, never> }
  | { key: "drawer.rules.nameTooLong"; values: { max: number } }
  | { key: "anchors.rules.noDays"; values: Record<string, never> }
  | { key: "anchors.rules.timesMissing"; values: Record<string, never> }
  | { key: "anchors.rules.timeStep"; values: { first: string; second: string } }
  | { key: "anchors.rules.endBeforeStart"; values: Record<string, never> }
  | {
      key: "anchors.rules.overlap";
      values: { other: string; weekday: string };
    };

export type FailureMessage = {
  key: "drawer.failure.save" | "drawer.failure.delete";
  values: Record<string, never>;
};

const NINE = 9 * 60;

/** An i18n key and its values, for `t(message.key, message.values)`. */
export function problemMessage(
  problem: AnchorProblem,
  lang: string,
): ProblemMessage {
  switch (problem.code) {
    case "nameEmpty":
      return { key: "drawer.rules.nameEmpty", values: {} };
    case "nameTooLong":
      return { key: "drawer.rules.nameTooLong", values: { max: MAX_NAME } };
    case "timeStep":
      return {
        key: "anchors.rules.timeStep",
        values: {
          first: formatTime(NINE, lang),
          second: formatTime(NINE + STEP, lang),
        },
      };
    case "overlap":
      return {
        key: "anchors.rules.overlap",
        values: {
          other: problem.other,
          weekday: formatWeekdayIndex(problem.day, lang, "short"),
        },
      };
    default:
      return { key: `anchors.rules.${problem.code}`, values: {} };
  }
}

export function failureMessage(kind: "save" | "delete"): FailureMessage {
  return { key: `drawer.failure.${kind}`, values: {} };
}
