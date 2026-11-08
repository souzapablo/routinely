import type {
  FlexibleActivity,
  PlannerData,
  WeekKey,
} from "../../../shared/planner.ts";

export type Pip = "done" | "placed" | "open";

export type TrayState = "open" | "allPlaced" | "allDone";

export interface TrayItem {
  activity: FlexibleActivity;
  /** Placements this week, done ones included. */
  placed: number;
  done: number;
  /** One per time per week. */
  pips: Pip[];
  state: TrayState;
}

export function trayItems(data: PlannerData, week: WeekKey): TrayItem[] {
  return data.activities.map((activity) => {
    const placements = data.placements.filter(
      (p) => p.activityId === activity.id && p.week === week,
    );
    const placed = placements.length;
    const done = placements.filter((p) =>
      data.donePlacementIds.includes(p.id),
    ).length;

    const times = activity.timesPerWeek;
    const donePips = Math.min(done, times);
    const placedPips = Math.min(placed, times) - donePips;
    const pips: Pip[] = [
      ...Array<Pip>(donePips).fill("done"),
      ...Array<Pip>(placedPips).fill("placed"),
      ...Array<Pip>(times - donePips - placedPips).fill("open"),
    ];

    let state: TrayState = "open";
    if (placed >= times) state = done >= placed ? "allDone" : "allPlaced";

    return { activity, placed, done, pips, state };
  });
}

export function trayLeft(items: TrayItem[]): number {
  return items.reduce(
    (sum, item) => sum + Math.max(0, item.activity.timesPerWeek - item.placed),
    0,
  );
}
