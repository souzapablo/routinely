import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "../i18n/en.json";
import i18n from "../i18n/index.ts";
import ptBR from "../i18n/pt-BR.json";
import todayStyles from "./components/TodayStrip.module.css";
import gridStyles from "./components/WeekGrid.module.css";
import { PlannerPage } from "./PlannerPage.tsx";

const SUNDAY_MORNING = new Date(2026, 10, 8, 7, 48);
// Thursday has a gym class at 07:00, work and a reading slot, so today's list is full.
const THURSDAY_GYM = new Date(2026, 10, 5, 7, 30);

function renderAt(now: Date) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  return render(<PlannerPage />);
}

afterEach(async () => {
  vi.useRealTimers();
  localStorage.clear();
  await i18n.changeLanguage("en");
});

function rowOf(name: string): HTMLElement {
  const label = screen.getByRole("checkbox", { name }).closest("label");
  if (!label) throw new Error(`no Today row for ${name}`);
  return label;
}

/** Every string in a translation file, with its key. */
function leaves(value: unknown, prefix = ""): [string, string][] {
  if (typeof value === "string") return [[prefix, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("PlannerPage", () => {
  it("shows This week and Nov 8 – Nov 14, 2026 on Sunday", () => {
    renderAt(SUNDAY_MORNING);

    expect(
      screen.getByRole("heading", { level: 1, name: "This week" }),
    ).toBeInTheDocument();
    expect(
      // Testing Library reads Intl's thin spaces as plain spaces.
      screen.getByText("Nov 8 – Nov 14, 2026"),
    ).toBeInTheDocument();
  });

  it("draws seven days from Sunday and hours 6 AM to 10 PM", () => {
    const { container } = renderAt(SUNDAY_MORNING);

    const heads = Array.from(container.querySelectorAll(`.${gridStyles.day}`));
    expect(
      heads.map((h) => h.querySelector(`.${gridStyles.weekday}`)?.textContent),
    ).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(
      heads.map(
        (h) => h.querySelector(`.${gridStyles.dayNumber}`)?.textContent,
      ),
    ).toEqual(["8", "9", "10", "11", "12", "13", "14"]);
    expect(heads[0]).toHaveClass(gridStyles.today);

    const hours = Array.from(
      container.querySelectorAll(`.${gridStyles.hourLabel}`),
      (h) => h.textContent,
    );
    expect(hours).toHaveLength(17);
    expect(hours[0]).toBe("6 AM");
    expect(hours[16]).toBe("10 PM");
  });

  it("lists Days you showed up Sunday first", () => {
    const { container } = renderAt(THURSDAY_GYM);

    const dots = Array.from(
      container.querySelectorAll(`.${todayStyles.dots} > div`),
    );
    expect(dots.map((d) => d.textContent)).toEqual([
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
    ]);
    // Nov 1 is a Sunday with nothing planned; Monday to Wednesday are done.
    expect(dots.map((d) => d.classList.contains(todayStyles.on))).toEqual([
      false,
      true,
      true,
      true,
      false,
      false,
      false,
    ]);
    expect(dots[4]).toHaveClass(todayStyles.today);
  });

  it("lists today's items in time order", () => {
    renderAt(THURSDAY_GYM);

    expect(
      screen.getByRole("heading", { name: "Today · Thursday, Nov 5" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("checkbox")
        .map((box) => box.getAttribute("aria-label")),
    ).toEqual(["Gym class", "Work", "Read"]);
    expect(rowOf("Gym class")).toHaveTextContent("7:00 – 8:00 AM");
    expect(rowOf("Work")).toHaveTextContent("9:00 AM – 6:00 PM");
    expect(rowOf("Read")).toHaveTextContent("9:30 – 10:00 PM");
    expect(screen.getByText("0 of 3 done")).toBeInTheDocument();
  });

  it("shows Now on the current item", () => {
    renderAt(THURSDAY_GYM);

    expect(within(rowOf("Gym class")).getByText("Now")).toBeInTheDocument();
    expect(within(rowOf("Work")).queryByText("Now")).toBeNull();
    expect(within(rowOf("Read")).queryByText("Now")).toBeNull();
  });

  it("draws every planner control disabled", () => {
    renderAt(THURSDAY_GYM);

    const buttons = screen.getAllByRole("button");
    const checkboxes = screen.getAllByRole("checkbox");
    for (const control of [...buttons, ...checkboxes]) {
      expect(control).toBeDisabled();
    }

    for (const name of [
      "Previous week",
      "Next week",
      "Today",
      "+ New flexible activity",
      "Mark Work done",
      "Mark Read done",
      "Move Read back to the list",
    ]) {
      expect(screen.getAllByRole("button", { name }).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByRole("button", { name: "Find a time" })).toHaveLength(
      4,
    );
    expect(checkboxes).toHaveLength(3);
  });

  it("renders no English text in pt-BR", async () => {
    await i18n.changeLanguage("pt-BR");
    const { container } = renderAt(THURSDAY_GYM);

    const shown = [
      container.textContent ?? "",
      ...Array.from(
        container.querySelectorAll("[aria-label]"),
        (el) => el.getAttribute("aria-label") ?? "",
      ),
    ].join("\n");

    const portuguese = new Map(leaves(ptBR));
    const englishFragments = leaves(en)
      .filter(([key, text]) => portuguese.get(key) !== text)
      .flatMap(([, text]) => text.split(/\{\{\w+\}\}/))
      .map((fragment) => fragment.trim())
      // Short joins such as "of" could match inside an activity name.
      .filter((fragment) => fragment.length >= 3);
    const englishDates = ["Thursday", "Nov", "Mon", "Thu", "AM", "PM"];

    // Whole words only: "Move" is part of the Portuguese "Mover".
    for (const fragment of [...englishFragments, ...englishDates]) {
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(shown).not.toMatch(
        new RegExp(`(^|\\P{L})${escaped}($|\\P{L})`, "u"),
      );
    }
    expect(shown).toContain("Esta semana");
    expect(shown).toContain("Agora");
    expect(shown).toContain("07:00");
  });
});
