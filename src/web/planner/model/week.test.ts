import { describe, expect, it } from "vitest";
import { dayIndex, minutesOfDay, mondayOf, weekDays, weekKey } from "./week.ts";

// Dates are built from local parts so the tests hold in any time zone.
const local = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min);

describe("mondayOf", () => {
  it("gives the Monday before a Sunday, at midnight", () => {
    expect(mondayOf(local(2026, 11, 8, 15, 30))).toEqual(local(2026, 11, 2));
  });

  it("gives the same day for a Monday", () => {
    expect(mondayOf(local(2026, 11, 2, 23, 59))).toEqual(local(2026, 11, 2));
  });

  it("crosses back into the previous month", () => {
    expect(mondayOf(local(2026, 10, 1))).toEqual(local(2026, 9, 28));
  });

  it("crosses back into the previous year", () => {
    expect(mondayOf(local(2027, 1, 2))).toEqual(local(2026, 12, 28));
  });
});

describe("weekKey", () => {
  it("is the Monday as YYYY-MM-DD", () => {
    expect(weekKey(local(2026, 11, 8, 15, 30))).toBe("2026-11-02");
  });

  it("uses the previous year's Monday for early January", () => {
    expect(weekKey(local(2027, 1, 2))).toBe("2026-12-28");
  });
});

describe("dayIndex", () => {
  it("maps Monday to 0 and Sunday to 6", () => {
    expect(dayIndex(local(2026, 11, 2))).toBe(0);
    expect(dayIndex(local(2026, 11, 5))).toBe(3);
    expect(dayIndex(local(2026, 11, 8))).toBe(6);
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
  it("gives seven days from Monday with only today flagged", () => {
    const days = weekDays(local(2026, 11, 2), local(2026, 11, 8, 15, 30));

    expect(days.map((d) => d.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(days.map((d) => d.date)).toEqual([
      local(2026, 11, 2),
      local(2026, 11, 3),
      local(2026, 11, 4),
      local(2026, 11, 5),
      local(2026, 11, 6),
      local(2026, 11, 7),
      local(2026, 11, 8),
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
    const days = weekDays(local(2026, 11, 2), local(2026, 11, 9));
    expect(days.some((d) => d.isToday)).toBe(false);
  });

  it("runs across a month and a year boundary", () => {
    const days = weekDays(local(2026, 12, 28), local(2027, 1, 1, 9));

    expect(days.map((d) => d.date)).toEqual([
      local(2026, 12, 28),
      local(2026, 12, 29),
      local(2026, 12, 30),
      local(2026, 12, 31),
      local(2027, 1, 1),
      local(2027, 1, 2),
      local(2027, 1, 3),
    ]);
    expect(days.findIndex((d) => d.isToday)).toBe(4);
  });
});
