import type { Minutes } from "../../../shared/planner.ts";

export const GRID_START: Minutes = 6 * 60;
export const GRID_END: Minutes = 23 * 60;
export const GRID_HOURS = (GRID_END - GRID_START) / 60;
export const PX_PER_HOUR = 44;
/** Below this the hour rows stop shrinking and the grid scrolls inside its card. */
export const MIN_PX_PER_HOUR = 18;

const TINY_BELOW_PX = 40;

export interface BlockGeometry {
  top: number;
  height: number;
}

function toPx(minutesFromGridStart: Minutes, pxPerHour: number): number {
  return (minutesFromGridStart * pxPerHour) / 60;
}

/**
 * The hour height that fits every grid hour into `available` pixels, or the
 * fixed height when there is nothing to fit into.
 */
export function fitHourHeight(available: number | null): number {
  if (available === null || available <= 0) return PX_PER_HOUR;
  // Rounded down to a hundredth so the hours never overflow by a fraction of a pixel.
  const fitted = Math.floor((available / GRID_HOURS) * 100) / 100;
  return Math.max(MIN_PX_PER_HOUR, fitted);
}

/** Null when no part of the block falls inside the grid hours. */
export function blockGeometry(
  start: Minutes,
  end: Minutes,
  pxPerHour = PX_PER_HOUR,
): BlockGeometry | null {
  const from = Math.max(start, GRID_START);
  const to = Math.min(end, GRID_END);
  if (to <= from) return null;
  return {
    top: toPx(from - GRID_START, pxPerHour),
    height: toPx(to - from, pxPerHour),
  };
}

export function isTinyBlock(height: number): boolean {
  return height < TINY_BELOW_PX;
}

/** Null outside the grid hours, where no now-line is drawn. */
export function nowOffset(
  minutes: Minutes,
  pxPerHour = PX_PER_HOUR,
): number | null {
  if (minutes < GRID_START || minutes >= GRID_END) return null;
  return toPx(minutes - GRID_START, pxPerHour);
}

export function isNow(
  item: { start: Minutes; end: Minutes },
  minutes: Minutes,
): boolean {
  return minutes >= item.start && minutes < item.end;
}
