import type {
  Anchor,
  AnchorDone,
  DayIndex,
  FlexibleActivity,
  Placement,
  PlannerData,
} from "../../../shared/planner.ts";
import { dayIndex, weekKey } from "./week.ts";

const anchors: Anchor[] = [
  { id: "work", name: "Work", days: [1, 2, 3, 4, 5], start: 540, end: 1080 },
  { id: "gym", name: "Gym class", days: [2, 4], start: 420, end: 480 },
  { id: "therapy", name: "Therapy session", days: [3], start: 1140, end: 1200 },
];

const activities: FlexibleActivity[] = [
  {
    id: "run",
    name: "Run 5 km",
    category: "movement",
    timesPerWeek: 2,
    duration: 45,
  },
  { id: "read", name: "Read", category: "rest", timesPerWeek: 3, duration: 30 },
  {
    id: "grocery",
    name: "Grocery shopping",
    category: "errands",
    timesPerWeek: 1,
    duration: 60,
  },
  {
    id: "call",
    name: "Call parents",
    category: "people",
    timesPerWeek: 1,
    duration: 30,
  },
  {
    id: "clean",
    name: "Clean apartment",
    category: "home",
    timesPerWeek: 1,
    duration: 90,
  },
];

const placementSlots: {
  id: string;
  activityId: string;
  day: DayIndex;
  start: number;
}[] = [
  { id: "run-mon", activityId: "run", day: 1, start: 1140 },
  { id: "read-tue", activityId: "read", day: 2, start: 1290 },
  { id: "read-thu", activityId: "read", day: 4, start: 1290 },
  { id: "call-sat", activityId: "call", day: 6, start: 660 },
];

// The prototype's example leaves Thursday's gym class undone, so the view
// shows an undone item on a past day.
const notDone = { anchorId: "gym", day: 4 };

export function exampleWeek(now: Date): PlannerData {
  const week = weekKey(now);
  const today = dayIndex(now);

  const placements: Placement[] = placementSlots.map((slot) => ({
    ...slot,
    week,
  }));

  const doneAnchors: AnchorDone[] = anchors.flatMap((anchor) =>
    anchor.days
      .filter((day) => day < today)
      .filter((day) => !(anchor.id === notDone.anchorId && day === notDone.day))
      .map((day) => ({ anchorId: anchor.id, week, day })),
  );

  const donePlacementIds = placements
    .filter((p) => p.day < today)
    .map((p) => p.id);

  return { anchors, activities, placements, doneAnchors, donePlacementIds };
}
