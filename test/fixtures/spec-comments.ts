// Ports the tokens (T2).
/* Follows AD-011: controls are drawn disabled. */
/**
 * Covers MAIN-30 and DS-07.
 */
// SPEC_DEVIATION: the grid starts at 07:00.
// See .specs/features/0002-main-layout/spec.md for the layout.
// Keeps the line clear of the hour label.
const url = "http://example.com/T2";
const label = "AD-011 MAIN-30";
export const encoding = "UTF-8"; // UTF-8 is not a requirement ID.
export { label, url };
