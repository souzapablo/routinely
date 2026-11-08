import { describe, expect, it } from "vitest";
import {
  durationParts,
  formatDayNumber,
  formatHourLabel,
  formatTimeRange,
  formatTodayDate,
  formatWeekday,
  formatWeekRange,
} from "./format.ts";

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d);

// Intl puts thin and narrow no-break spaces in ranges and before AM/PM;
// the expectations are written with plain spaces.
const plain = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ");

describe("formatWeekRange", () => {
  it("formats the week range", () => {
    expect(plain(formatWeekRange(local(2026, 11, 2), "en"))).toBe(
      "Nov 2 – Nov 8, 2026",
    );
  });

  it("names both years across a year boundary", () => {
    expect(plain(formatWeekRange(local(2026, 12, 28), "en"))).toBe(
      "Dec 28, 2026 – Jan 3, 2027",
    );
  });

  it("follows pt-BR", () => {
    expect(plain(formatWeekRange(local(2026, 11, 2), "pt-BR"))).toBe(
      "2 de nov. – 8 de nov. de 2026",
    );
  });
});

describe("formatTimeRange", () => {
  it("formats time ranges by language", () => {
    expect(plain(formatTimeRange(7 * 60, 8 * 60, "en"))).toBe("7:00 – 8:00 AM");
    expect(plain(formatTimeRange(9 * 60, 18 * 60, "en"))).toBe(
      "9:00 AM – 6:00 PM",
    );
    expect(plain(formatTimeRange(7 * 60, 8 * 60, "pt-BR"))).toBe(
      "07:00 – 08:00",
    );
    expect(plain(formatTimeRange(18 * 60 + 30, 19 * 60 + 15, "pt-BR"))).toBe(
      "18:30 – 19:15",
    );
  });
});

describe("formatHourLabel", () => {
  it("formats hour labels by language", () => {
    expect(plain(formatHourLabel(6 * 60, "en"))).toBe("6 AM");
    expect(plain(formatHourLabel(13 * 60, "en"))).toBe("1 PM");
    expect(formatHourLabel(6 * 60, "pt-BR")).toBe("06:00");
    expect(formatHourLabel(22 * 60, "pt-BR")).toBe("22:00");
  });
});

describe("formatTodayDate", () => {
  it("formats today's date", () => {
    expect(formatTodayDate(local(2026, 11, 8), "en")).toBe("Sunday, Nov 8");
    expect(formatTodayDate(local(2026, 11, 8), "pt-BR")).toBe(
      "domingo, 8 de nov.",
    );
  });
});

describe("formatDayNumber and formatWeekday", () => {
  it("gives the day of the month and the weekday by language", () => {
    const sunday = local(2026, 11, 8);
    expect(formatDayNumber(sunday, "en")).toBe("8");
    expect(formatWeekday(sunday, "en", "short")).toBe("Sun");
    expect(formatWeekday(sunday, "en", "narrow")).toBe("S");
    expect(formatWeekday(sunday, "pt-BR", "short")).toBe("dom.");
  });
});

describe("durationParts", () => {
  it("splits durations", () => {
    expect(durationParts(45)).toEqual({
      key: "duration.minutes",
      values: { minutes: 45 },
    });
    expect(durationParts(60)).toEqual({
      key: "duration.hours",
      values: { hours: 1 },
    });
    expect(durationParts(90)).toEqual({
      key: "duration.hoursMinutes",
      values: { hours: 1, minutes: 30 },
    });
  });
});
