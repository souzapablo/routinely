import type { Anchor, FlexibleActivity } from "./planner.ts";

/**
 * SQLite's `COLLATE NOCASE` folds only ASCII `A`–`Z`, so the browser must not
 * use `toLowerCase` or `localeCompare`: a list re-sorted after a save would
 * then differ from what the server returns on reload.
 */
function foldAscii(name: string): string {
  return name.replace(/[A-Z]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 32),
  );
}

function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function compareNames(a: string, b: string): number {
  return compareStrings(foldAscii(a), foldAscii(b));
}

export function compareAnchors(a: Anchor, b: Anchor): number {
  return (
    a.start - b.start ||
    compareNames(a.name, b.name) ||
    compareStrings(a.id, b.id)
  );
}

export function compareActivities(
  a: FlexibleActivity,
  b: FlexibleActivity,
): number {
  return compareNames(a.name, b.name) || compareStrings(a.id, b.id);
}
