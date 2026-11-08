import type { Minutes } from "../../../shared/planner.ts";

export const GRID_START: Minutes = 6 * 60;
export const GRID_END: Minutes = 23 * 60;
export const PX_PER_HOUR = 44;

const TINY_BELOW_PX = 40;

export interface BlockGeometry {
  top: number;
  height: number;
}

function toPx(minutesFromGridStart: Minutes): number {
  return (minutesFromGridStart * PX_PER_HOUR) / 60;
}

/** Null when no part of the block falls inside the grid hours. */
export function blockGeometry(
  start: Minutes,
  end: Minutes,
): BlockGeometry | null {
  const from = Math.max(start, GRID_START);
  const to = Math.min(end, GRID_END);
  if (to <= from) return null;
  return { top: toPx(from - GRID_START), height: toPx(to - from) };
}

export function isTinyBlock(height: number): boolean {
  return height < TINY_BELOW_PX;
}

/** Null outside the grid hours, where no now-line is drawn. */
export function nowOffset(minutes: Minutes): number | null {
  if (minutes < GRID_START || minutes >= GRID_END) return null;
  return toPx(minutes - GRID_START);
}

export function isNow(
  item: { start: Minutes; end: Minutes },
  minutes: Minutes,
): boolean {
  return minutes >= item.start && minutes < item.end;
}
