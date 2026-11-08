import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../i18n/index.ts";
import swatchStyles from "../../ui/Swatch/Swatch.module.css";
import styles from "./TodayStrip.module.css";
import {
  TodayStrip,
  type TodayRow,
  type TodayStripProps,
} from "./TodayStrip.tsx";

const letters = ["M", "T", "W", "T", "F", "S", "S"];

function props(overrides: Partial<TodayStripProps> = {}): TodayStripProps {
  return {
    dateLabel: "Sunday, Nov 8",
    rows: [],
    summary: { done: 0, total: 0 },
    showedUp: {
      days: letters.map((label, i) => ({
        label,
        on: i < 6,
        isToday: i === 6,
      })),
      count: 6,
    },
    week: { done: 11, total: 16 },
    ...overrides,
  };
}

const gym: TodayRow = {
  key: "anchor:gym",
  name: "Gym class",
  timeLabel: "7:00 – 8:00 AM",
  tone: "anchor",
  done: true,
  isNow: false,
};

const run: TodayRow = {
  key: "placement:run",
  name: "Run 5 km",
  timeLabel: "7:00 – 7:45 PM",
  tone: "movement",
  done: false,
  isNow: false,
};

function rowOf(name: string): HTMLElement {
  const label = screen.getByRole("checkbox", { name }).closest("label");
  if (!label) throw new Error(`no row for ${name}`);
  return label;
}

describe("TodayStrip", () => {
  it("shows a free day when today is empty", () => {
    render(<TodayStrip {...props()} />);

    expect(
      screen.getByRole("heading", { name: "Today · Sunday, Nov 8" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A free day")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nothing planned today. Drag something from your list onto today, or take the day off.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("lists items with checkbox, name, time and dot", () => {
    render(
      <TodayStrip
        {...props({ rows: [gym, run], summary: { done: 1, total: 2 } })}
      />,
    );

    expect(screen.getByText("1 of 2 done")).toBeInTheDocument();
    expect(screen.queryByText("A free day")).toBeNull();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.map((box) => box.getAttribute("aria-label"))).toEqual([
      "Gym class",
      "Run 5 km",
    ]);
    for (const box of checkboxes) expect(box).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Gym class" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Run 5 km" }),
    ).not.toBeChecked();

    const gymRow = rowOf("Gym class");
    expect(gymRow).toHaveTextContent("7:00 – 8:00 AM");
    expect(gymRow.querySelector(`.${swatchStyles.anchor}`)).not.toBeNull();

    const runRow = rowOf("Run 5 km");
    expect(runRow).toHaveTextContent("7:00 – 7:45 PM");
    expect(runRow.querySelector(`.${swatchStyles.movement}`)).not.toBeNull();
  });

  it("shows Now instead of the dot during an item", () => {
    render(
      <TodayStrip
        {...props({
          rows: [gym, { ...run, isNow: true }],
          summary: { done: 1, total: 2 },
        })}
      />,
    );

    const runRow = rowOf("Run 5 km");
    expect(within(runRow).getByText("Now")).toBeInTheDocument();
    expect(runRow.querySelector(`.${swatchStyles.swatch}`)).toBeNull();

    const gymRow = rowOf("Gym class");
    expect(within(gymRow).queryByText("Now")).toBeNull();
    expect(gymRow.querySelector(`.${swatchStyles.swatch}`)).not.toBeNull();
  });

  it("shows days you showed up and the week meter", () => {
    render(<TodayStrip {...props()} />);

    expect(screen.getByText("Days you showed up")).toBeInTheDocument();
    expect(screen.getByText("6 of 7")).toBeInTheDocument();

    const dots = screen.getByRole("img", {
      name: "6 days this week with at least one thing done",
    });
    const days = Array.from(dots.children);
    expect(days.map((day) => day.textContent)).toEqual(letters);
    expect(days.map((day) => day.classList.contains(styles.on))).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
      false,
    ]);
    expect(days[6]).toHaveClass(styles.today);

    expect(screen.getByText("11 of 16 done")).toBeInTheDocument();
    const meter = screen.getByRole("meter", { name: "This week" });
    expect(meter).toHaveAttribute("aria-valuenow", "11");
    expect(meter).toHaveAttribute("aria-valuemax", "16");
  });
});
