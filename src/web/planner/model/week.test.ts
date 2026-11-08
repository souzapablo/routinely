import { describe, expect, it } from "vitest";
import {
  dayIndex,
  minutesOfDay,
  weekDays,
  weekKey,
  weekStartOf,
} from "./week.ts";

// Dates are built from local parts so the tests hold in any time zone.
const local = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min);

describe("weekStartOf", () => {
  it("gives the same day for a Sunday, at midnight", () => {
    expect(weekStartOf(local(2026, 11, 8, 15, 30))).toEqual(local(2026, 11, 8));
  });

  it("gives the Sunday before a Saturday", () => {
    expect(weekStartOf(local(2026, 11, 14, 23, 59))).toEqual(
      local(2026, 11, 8),
    );
  });

  it("gives the Sunday before a Monday", () => {
    expect(weekStartOf(local(2026, 11, 9))).toEqual(local(2026, 11, 8));
  });

  it("crosses back into the previous month", () => {
    expect(weekStartOf(local(2026, 10, 1))).toEqual(local(2026, 9, 27));
  });

  it("crosses back into the previous year", () => {
    expect(weekStartOf(local(2027, 1, 2))).toEqual(local(2026, 12, 27));
  });
});

describe("weekKey", () => {
  it("is the Sunday as YYYY-MM-DD", () => {
    expect(weekKey(local(2026, 11, 8, 15, 30))).toBe("2026-11-08");
    expect(weekKey(local(2026, 11, 14, 23, 59))).toBe("2026-11-08");
    expect(weekKey(local(2026, 11, 7, 12))).toBe("2026-11-01");
  });

  it("uses the previous year's Sunday for early January", () => {
    expect(weekKey(local(2027, 1, 2))).toBe("2026-12-27");
  });
});

describe("dayIndex", () => {
  it("maps Sunday to 0 and Saturday to 6", () => {
    expect(dayIndex(local(2026, 11, 8))).toBe(0);
    expect(dayIndex(local(2026, 11, 9))).toBe(1);
    expect(dayIndex(local(2026, 11, 12))).toBe(4);
    expect(dayIndex(local(2026, 11, 14))).toBe(6);
  });
});

describe("minutesOfDay", () => {
  it("counts minutes since local midnight", () => {
    expect(minutesOfDay(local(2026, 11, 8, 0, 0))).toBe(0);
    expect(minutesOfDay(local(2026, 11, 8, 14, 37))).toBe(877);
    expect(minutesOfDay(local(2026, 11, 8, 23, 59))).toBe(1439);
  });
});

describe("weekDays", () => {
  it("gives seven days from Sunday with only today flagged", () => {
    const days = weekDays(local(2026, 11, 8), local(2026, 11, 14, 15, 30));

    expect(days.map((d) => d.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(days.map((d) => d.date)).toEqual([
      local(2026, 11, 8),
      local(2026, 11, 9),
      local(2026, 11, 10),
      local(2026, 11, 11),
      local(2026, 11, 12),
      local(2026, 11, 13),
      local(2026, 11, 14),
    ]);
    expect(days.map((d) => d.isToday)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it("flags no day when today is in another week", () => {
    const days = weekDays(local(2026, 11, 8), local(2026, 11, 15));
    expect(days.some((d) => d.isToday)).toBe(false);
  });

  it("runs across a month and a year boundary", () => {
    const days = weekDays(local(2026, 12, 27), local(2027, 1, 1, 9));

    expect(days.map((d) => d.date)).toEqual([
      local(2026, 12, 27),
      local(2026, 12, 28),
      local(2026, 12, 29),
      local(2026, 12, 30),
      local(2026, 12, 31),
      local(2027, 1, 1),
      local(2027, 1, 2),
    ]);
    expect(days.findIndex((d) => d.isToday)).toBe(5);
  });
});
