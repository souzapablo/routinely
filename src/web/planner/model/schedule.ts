import type {
  Category,
  DayIndex,
  Minutes,
  PlannerData,
  WeekKey,
} from "../../../shared/planner.ts";

export interface DayItem {
  key: string;
  kind: "anchor" | "placement";
  name: string;
  start: Minutes;
  end: Minutes;
  category: Category | "anchor";
  done: boolean;
  /** Set on anchor items: the stored anchor they come from. */
  anchorId?: string;
}

export function itemsForDay(
  data: PlannerData,
  week: WeekKey,
  day: DayIndex,
): DayItem[] {
  const anchors: DayItem[] = data.anchors
    .filter((anchor) => anchor.days.includes(day))
    .map((anchor) => ({
      key: `anchor:${anchor.id}`,
      kind: "anchor",
      anchorId: anchor.id,
      name: anchor.name,
      start: anchor.start,
      end: anchor.end,
      category: "anchor",
      done: data.doneAnchors.some(
        (d) => d.anchorId === anchor.id && d.week === week && d.day === day,
      ),
    }));

  const placements: DayItem[] = data.placements
    .filter((p) => p.week === week && p.day === day)
    .flatMap((p) => {
      // A placement can outlive its activity; it has no name or length to show.
      const activity = data.activities.find((a) => a.id === p.activityId);
      if (!activity) return [];
      return [
        {
          key: `placement:${p.id}`,
          kind: "placement",
          name: activity.name,
          start: p.start,
          end: p.start + activity.duration,
          category: activity.category,
          done: data.donePlacementIds.includes(p.id),
        },
      ];
    });

  return [...anchors, ...placements].sort(
    (a, b) => a.start - b.start || a.name.localeCompare(b.name),
  );
}
