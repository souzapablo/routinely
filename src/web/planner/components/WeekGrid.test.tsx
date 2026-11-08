import { cleanup, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../i18n/index.ts";
import styles from "./WeekGrid.module.css";
import { WeekGrid, type GridDay } from "./WeekGrid.tsx";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hourLabels = Array.from({ length: 17 }, (_, i) => {
  const hour = 6 + i;
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
});

function days(todayIndex: number | null): GridDay[] {
  return weekdays.map((weekday, i) => ({
    key: weekday,
    weekday,
    dayNumber: String(1 + i),
    isToday: i === todayIndex,
    blocks: [],
  }));
}

function renderGrid(todayIndex: number | null, nowOffset: number | null) {
  const { container } = render(
    <WeekGrid
      days={days(todayIndex)}
      hourLabels={hourLabels}
      nowOffset={nowOffset}
      pxPerHour={30}
    />,
  );
  return {
    grid: container.querySelector<HTMLElement>(`.${styles.grid}`),
    heads: Array.from(container.querySelectorAll(`.${styles.day}`)),
    columns: Array.from(container.querySelectorAll(`.${styles.column}`)),
    nowLines: Array.from(
      container.querySelectorAll<HTMLElement>(`.${styles.now}`),
    ),
    hours: Array.from(container.querySelectorAll(`.${styles.hourLabel}`)),
  };
}

describe("WeekGrid", () => {
  it("marks today's column", () => {
    const { heads, columns } = renderGrid(6, null);

    expect(heads.map((h) => h.classList.contains(styles.today))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(columns.map((c) => c.classList.contains(styles.today))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(heads[6]?.querySelector(`.${styles.dayNumber}`)).toHaveTextContent(
      "7",
    );
  });

  it("draws the now-line when given an offset and none otherwise", () => {
    const drawn = renderGrid(6, 79.2);
    expect(drawn.nowLines).toHaveLength(1);
    expect(drawn.nowLines[0]).toHaveStyle({ top: "79.2px" });
    expect(drawn.columns[6]).toContainElement(drawn.nowLines[0] ?? null);
    cleanup();

    expect(renderGrid(6, null).nowLines).toHaveLength(0);
  });

  it("draws seven day heads and the hour labels", () => {
    const { heads, columns, hours } = renderGrid(null, null);

    expect(
      heads.map((h) => h.querySelector(`.${styles.weekday}`)?.textContent),
    ).toEqual(weekdays);
    expect(
      heads.map((h) => h.querySelector(`.${styles.dayNumber}`)?.textContent),
    ).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(columns).toHaveLength(7);
    expect(hours.map((h) => h.textContent)).toEqual(hourLabels);
  });

  it("sizes the hour rows from the given hour height", () => {
    const { grid } = renderGrid(null, null);
    expect(grid?.style.getPropertyValue("--px")).toBe("30px");
  });
});
