import { describe, expect, it } from "vitest";
import {
  GRID_END,
  GRID_HOURS,
  GRID_START,
  MIN_PX_PER_HOUR,
  PX_PER_HOUR,
  blockGeometry,
  fitHourHeight,
  isNow,
  isTinyBlock,
  nowOffset,
} from "./grid.ts";

const at = (hours: number, minutes = 0) => hours * 60 + minutes;

describe("grid constants", () => {
  it("spans 06:00 to 23:00 at 44 px per hour", () => {
    expect(GRID_START).toBe(at(6));
    expect(GRID_END).toBe(at(23));
    expect(GRID_HOURS).toBe(17);
    expect(PX_PER_HOUR).toBe(44);
  });
});

describe("fitHourHeight", () => {
  it("splits the available height across the 17 hours", () => {
    expect(fitHourHeight(17 * 30)).toBe(30);
    expect(fitHourHeight(17 * 60)).toBe(60);
  });

  it("rounds down so the hours never overflow", () => {
    expect(fitHourHeight(500)).toBe(29.41);
    expect(fitHourHeight(500) * 17).toBeLessThanOrEqual(500);
  });

  it("stops shrinking at the minimum hour height", () => {
    expect(fitHourHeight(100)).toBe(MIN_PX_PER_HOUR);
  });

  it("keeps the fixed height when nothing was measured", () => {
    expect(fitHourHeight(null)).toBe(PX_PER_HOUR);
    expect(fitHourHeight(0)).toBe(PX_PER_HOUR);
  });
});

describe("blockGeometry", () => {
  it("positions blocks by start and end", () => {
    expect(blockGeometry(at(9), at(18))).toEqual({ top: 132, height: 396 });
    expect(blockGeometry(at(21, 30), at(22))).toEqual({ top: 682, height: 22 });
  });

  it("clips blocks to the grid hours", () => {
    expect(blockGeometry(at(5), at(7))).toEqual({ top: 0, height: 44 });
    expect(blockGeometry(at(22), at(23, 45))).toEqual({
      top: 704,
      height: 44,
    });
    expect(blockGeometry(at(23), at(23, 30))).toBeNull();
    expect(blockGeometry(at(4), at(6))).toBeNull();
  });

  it("scales with the hour height", () => {
    expect(blockGeometry(at(9), at(18), 30)).toEqual({ top: 90, height: 270 });
  });
});

describe("isTinyBlock", () => {
  it("marks blocks under 40 px as tiny", () => {
    const thirty = blockGeometry(at(19), at(19, 30));
    const sixty = blockGeometry(at(19), at(20));
    expect(thirty && isTinyBlock(thirty.height)).toBe(true);
    expect(sixty && isTinyBlock(sixty.height)).toBe(false);
    expect(isTinyBlock(39.9)).toBe(true);
    expect(isTinyBlock(40)).toBe(false);
  });
});

describe("nowOffset", () => {
  it("places the now-line at the current time", () => {
    expect(nowOffset(at(7, 48))).toBeCloseTo(79.2, 6);
    expect(nowOffset(at(6))).toBe(0);
    expect(nowOffset(at(7, 48), 30)).toBeCloseTo(54, 6);
  });

  it("draws no now-line outside 06:00–23:00", () => {
    expect(nowOffset(at(5, 59))).toBeNull();
    expect(nowOffset(at(23))).toBeNull();
  });
});

describe("isNow", () => {
  it("isNow is true from start up to but not including end", () => {
    const item = { start: at(7), end: at(8) };
    expect(isNow(item, at(6, 59))).toBe(false);
    expect(isNow(item, at(7))).toBe(true);
    expect(isNow(item, at(7, 59))).toBe(true);
    expect(isNow(item, at(8))).toBe(false);
  });
});
