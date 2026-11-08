export type Category = "movement" | "home" | "errands" | "rest" | "people";

/** Monday is 0. */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Minutes since midnight, a multiple of 15. */
export type Minutes = number;

/** The Monday of a week, `YYYY-MM-DD`. */
export type WeekKey = string;

export interface Anchor {
  id: string;
  name: string;
  days: DayIndex[];
  start: Minutes;
  end: Minutes;
}

export interface FlexibleActivity {
  id: string;
  name: string;
  category: Category;
  timesPerWeek: number;
  duration: Minutes;
}

export interface Placement {
  id: string;
  activityId: string;
  week: WeekKey;
  day: DayIndex;
  start: Minutes;
}

/** Done is recorded per occurrence: one anchor on one day of one week. */
export interface AnchorDone {
  anchorId: string;
  week: WeekKey;
  day: DayIndex;
}

export interface PlannerData {
  anchors: Anchor[];
  activities: FlexibleActivity[];
  placements: Placement[];
  doneAnchors: AnchorDone[];
  donePlacementIds: string[];
}
