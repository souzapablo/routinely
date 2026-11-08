import type {
  DayIndex,
  PlannerData,
  WeekKey,
} from "../../../shared/planner.ts";
import { itemsForDay, type DayItem } from "./schedule.ts";

export interface Progress {
  done: number;
  total: number;
}

const DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

export function todaySummary(items: DayItem[]): Progress {
  return {
    done: items.filter((item) => item.done).length,
    total: items.length,
  };
}

export interface ShowedUp {
  /** One entry per day, Monday first. */
  days: boolean[];
  count: number;
}

export function daysShowedUp(data: PlannerData, week: WeekKey): ShowedUp {
  const days = DAYS.map((day) =>
    itemsForDay(data, week, day).some((item) => item.done),
  );
  return { days, count: days.filter(Boolean).length };
}

export function weekProgress(data: PlannerData, week: WeekKey): Progress {
  // Going through itemsForDay counts only occurrences that exist this week,
  // so a done record for a day the anchor no longer repeats on is ignored.
  const anchorsDone = DAYS.flatMap((day) =>
    itemsForDay(data, week, day),
  ).filter((item) => item.kind === "anchor" && item.done).length;
  const anchorsTotal = data.anchors.reduce((sum, a) => sum + a.days.length, 0);

  let activitiesDone = 0;
  let activitiesTotal = 0;
  for (const activity of data.activities) {
    const done = data.placements.filter(
      (p) =>
        p.activityId === activity.id &&
        p.week === week &&
        data.donePlacementIds.includes(p.id),
    ).length;
    // Doing an activity more often than planned does not push the meter past full.
    activitiesDone += Math.min(done, activity.timesPerWeek);
    activitiesTotal += activity.timesPerWeek;
  }

  return {
    done: anchorsDone + activitiesDone,
    total: anchorsTotal + activitiesTotal,
  };
}
